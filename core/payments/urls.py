from django.urls import path
from .views import PaymentListCreateView

urlpatterns = [
    path('get-create/', PaymentListCreateView.as_view(), name='payment-list-create'),
]
