from django.contrib import admin
from .models import Ticket

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_code', 'user', 'food_received', 'has_donation')
    search_fields = ('ticket_code', 'user__phone', 'user__name')
    list_filter = ('food_received', 'has_donation')
