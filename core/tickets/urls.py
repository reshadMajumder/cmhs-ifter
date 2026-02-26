from django.urls import path
from .views import UserTicketView, TicketDownloadView, CreateTicketAndUploadCloudinary

urlpatterns = [
    path('my-ticket/', UserTicketView.as_view(), name='user-ticket'),
    path('download/', TicketDownloadView.as_view(), name='ticket-download'),
    path('generate-image/', CreateTicketAndUploadCloudinary.as_view(), name='ticket-generate-image'),
]
