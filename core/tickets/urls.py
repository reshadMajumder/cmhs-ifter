from django.urls import path
from .views import UserTicketView

urlpatterns = [
    path('my-ticket/', UserTicketView.as_view(), name='user-ticket'),
]
