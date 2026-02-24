from django.urls import path
from .views import RegistrationStatsView,DonationStatsView

urlpatterns = [
    path('registration-stats/', RegistrationStatsView.as_view(), name='registration-stats'),
    path('donation-stats/', DonationStatsView.as_view(), name='donation-stats'),

]
