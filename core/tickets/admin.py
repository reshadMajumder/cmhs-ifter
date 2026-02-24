from django.contrib import admin
from .models import Ticket

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_code', 'user', 'gift_received', 'food_received', 'has_donation')
    search_fields = ('ticket_code', 'user__phone', 'user__name')
    list_filter = ('gift_received', 'food_received', 'has_donation')
