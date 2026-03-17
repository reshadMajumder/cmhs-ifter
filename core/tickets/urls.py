from django.urls import path
from .views import (
    UserTicketView, 
    TicketDownloadView, 
    CreateTicketAndUploadCloudinary,
    CheckEntranceByQRView,
    MarkFoodReceivedView,
    CheckEntranceByPhoneView,
    MarkFoodReceivedByPhoneView,
)

urlpatterns = [
    path('my-ticket/', UserTicketView.as_view(), name='user-ticket'),
    path('download/', TicketDownloadView.as_view(), name='ticket-download'),
    path('generate-image/', CreateTicketAndUploadCloudinary.as_view(), name='ticket-generate-image'),
    path('check-entrance/<str:ticket_code>/', CheckEntranceByQRView.as_view(), name='check-entrance'),
    path('mark-food-received/<str:ticket_code>/', MarkFoodReceivedView.as_view(), name='mark-food-received'),
    path('check-entrance-phone/<str:phone>/', CheckEntranceByPhoneView.as_view(), name='check-entrance-phone'),
    path('mark-food-received-phone/<str:phone>/', MarkFoodReceivedByPhoneView.as_view(), name='mark-food-received-phone'),
]
