import uuid
from django.db import models
from accounts.models import User

class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    gift_received = models.BooleanField(default=False)
    food_received = models.BooleanField(default=False)
    has_donation = models.BooleanField(default=False)
    ticket_code = models.CharField(max_length=5, unique=True, editable=False,null=True)

    def save(self, *args, **kwargs):
        if not self.ticket_code:
            # Generate sequential unique ticket code
            last_ticket = Ticket.objects.order_by('-ticket_code').first()
            if last_ticket and last_ticket.ticket_code.isdigit():
                new_code = int(last_ticket.ticket_code) + 1
            else:
                new_code = 1
            self.ticket_code = str(new_code).zfill(5)  # e.g., 00001, 00002
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Ticket {self.ticket_code} for {self.user.phone}"
