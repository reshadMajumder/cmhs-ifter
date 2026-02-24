from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import logout
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken


from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            
            return Response({
                'message': 'Login successful',
                'tokens': tokens
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': 'Invalid credentials',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"detail": "Refresh token is required."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {"detail": "Successfully logged out."}, 
                status=status.HTTP_205_RESET_CONTENT
            )
        except TokenError:
            return Response(
                {"detail": "Invalid refresh token."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"detail": f"Logout failed: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class RefreshTokenView(TokenRefreshView):
    """Custom refresh token view with better error handling"""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except InvalidToken as e:
            return Response(
                {"detail": "Invalid refresh token."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except TokenError as e:
            return Response(
                {"detail": f"Token error: {str(e)}"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

class LogoutAllView(APIView):
    """Logout from all devices by blacklisting all user tokens"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Get all outstanding tokens for the user
            tokens = OutstandingToken.objects.filter(user=request.user)
            # Blacklist all tokens
            for token in tokens:
                token.blacklist()
            
            return Response(
                {"detail": "Successfully logged out from all devices."}, 
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return Response(
                {"detail": f"Logout all failed: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )



class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current user's profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        """Full update user profile"""
        serializer = UserSerializer(request.user, data=request.data, partial=True)  # ✅ partial=True allows optional fields
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    