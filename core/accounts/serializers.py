from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

# added imports
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys
import os

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    profile_image = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['phone','password','name','batch','profession','add_my_image_to_magazine','bloodGroup','subject','t_shirt_size','is_guest','religion','gender','profile_image']

    def create(self, validated_data):
        profile_image = validated_data.pop('profile_image', None)
        user = User.objects.create_user(**validated_data)
        if profile_image:
            # compress/resize to target <= 500 KB
            try:
                img = Image.open(profile_image)
                # convert to RGB to ensure JPEG compatibility
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")

                # optionally downscale very large images (keeps aspect ratio)
                MAX_SIDE = 1600
                if max(img.size) > MAX_SIDE:
                    ratio = MAX_SIDE / float(max(img.size))
                    new_size = (int(img.size[0]*ratio), int(img.size[1]*ratio))
                    img = img.resize(new_size, Image.LANCZOS)

                buffer = BytesIO()
                quality = 85
                img.save(buffer, format='JPEG', quality=quality, optimize=True)
                # reduce quality iteratively until size under 500 KB or quality too low
                TARGET = 500 * 1024
                while buffer.getbuffer().nbytes > TARGET and quality > 20:
                    quality -= 5
                    buffer.seek(0)
                    buffer.truncate(0)
                    img.save(buffer, format='JPEG', quality=quality, optimize=True)

                buffer.seek(0)
                new_name = getattr(profile_image, "name", "profile.jpg")
                if not new_name.lower().endswith(('.jpg', '.jpeg')):
                    new_name = f"{os.path.splitext(new_name)[0]}.jpg"

                converted = InMemoryUploadedFile(
                    buffer,
                    field_name='profile_image',
                    name=new_name,
                    content_type='image/jpeg',
                    size=buffer.getbuffer().nbytes,
                    charset=None
                )
                user.profile_image = converted
                user.save()
            except Exception:
                # fallback: save original if compression fails
                user.profile_image = profile_image
                user.save()
        return user


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        phone = data.get('phone')
        password = data.get('password')
        
        if not phone or not password:
            raise serializers.ValidationError("Phone and password are required")
        
        # Use phone as username since USERNAME_FIELD is 'phone'
        user = authenticate(username=phone, password=password)
        if not user:
            raise serializers.ValidationError("Invalid phone or password")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")
        
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(read_only=True)

    class Meta:
        model = User
        exclude = ['password',"groups","user_permissions"]

