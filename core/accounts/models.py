from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from cloudinary.models import CloudinaryField

class UserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError("Phone number is required")
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(phone, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    # Choices
    GENDER_CHOICES = [('male','Male'),('female','Female'),('other','Other')]
    RELIGION_CHOICES = [('islam','Islam'),('hinduism','Hinduism'),('christianity','Christianity'),('buddhism','Buddhism'),('other','Other')]
    TSHIRT_SIZE_CHOICES = [('S','S'),('M','M'),('L','L'),('XL','XL'),('XXL','XXL')]
    BATCH_CHOICES = [(str(year), str(year)) for year in range(1989, 2028)]


    phone = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=255,null=True,blank=True)
    batch= models.CharField(max_length=255,choices=BATCH_CHOICES,null=True,blank=True)
    profession =models.CharField(max_length=255,null=True,blank=True)
    bloodGroup =models.CharField(max_length=10,null=True,blank=True)
    subject = models.CharField(max_length=255,null=True,blank=True)
    t_shirt_size = models.CharField(max_length=5, choices=TSHIRT_SIZE_CHOICES, null=True, blank=True)
    religion = models.CharField(max_length=20, choices=RELIGION_CHOICES, null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    profile_image = CloudinaryField('image', blank=True, null=True)
    is_guest = models.BooleanField(default=False)
    add_my_image_to_magazine=models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)


    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',  # <--- custom related_name
        blank=True,
        help_text='The groups this user belongs to.'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',  # <--- custom related_name
        blank=True,
        help_text='Specific permissions for this user.'
    )

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.phone
