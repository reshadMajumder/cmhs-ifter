from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, ProfileView, 
    RefreshTokenView, LogoutAllView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('logout-all/', LogoutAllView.as_view(), name='logout_all'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('token/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
]
