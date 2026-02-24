# payments/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Payment
from tickets.models import Ticket

@receiver(post_save, sender=Payment)
def create_ticket_when_payment_approved(sender, instance, created, **kwargs):
    """
    Create a Ticket automatically when a registration payment is approved.
    """
    # Only trigger if payment_type = registration AND approved = True
    if instance.payment_type == 'registration' and instance.payment_approved:
        # Check if the user already has a ticket to prevent duplicates
        if not Ticket.objects.filter(user=instance.user).exists():
            Ticket.objects.create(user=instance.user)
