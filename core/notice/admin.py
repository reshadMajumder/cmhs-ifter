from django.contrib import admin

# Register your models here.
from .models import Notice,Sponsors,ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
	"""Admin for ContactMessage: filter by subject, search by mobile."""
	list_display = ("name", "mobile", "subject", "created_at")
	list_filter = ("subject",)
	search_fields = ("mobile", "name")
	ordering = ("-created_at",)


admin.site.register(Notice)
admin.site.register(Sponsors)