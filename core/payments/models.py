from django.db import models
from accounts.models import User  # make sure this path is correct

class Payment(models.Model):
    METHOD_CHOICES = [('bkash','bkash'),('nagad','nagad')]
    PAYMENT_TYPE_CHOICES = [('registration','registration'),('donation','donation')]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    phone = models.CharField(max_length=20, null=True, blank=True)
    transaction_id = models.CharField(max_length=255, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_type = models.CharField(max_length=100,choices=PAYMENT_TYPE_CHOICES, null=True, blank=True)  # e.g., 'ticket', 'donation'
    method = models.CharField(max_length=50, choices=METHOD_CHOICES,null=True, blank=True)  # e.g., 'bkash', 'nagad', 'cash'
    payment_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} - {self.transaction_id} - ({self.payment_type}) - {self.payment_approved}"
