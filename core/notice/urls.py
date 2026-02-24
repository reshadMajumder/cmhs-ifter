from django.urls import path
from .views import NoticeListView,SponsorsListView,ContactMessageCreateView

urlpatterns = [
    path('', NoticeListView.as_view(), name='payment-list-create'),
    path('sponsors/', SponsorsListView.as_view(), name='sponsors-list'),
    path('contact/', ContactMessageCreateView.as_view(), name='contact-message-create'),
]
