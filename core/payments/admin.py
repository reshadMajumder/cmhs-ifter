import csv
from django.contrib import admin
from django.http import HttpResponse
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'transaction_id', 'amount', 'payment_type', 'method', 'payment_approved', 'created_at')
    search_fields = ('phone', 'transaction_id', 'user__name')  # search by user name, phone, transaction id
    list_filter = ('payment_type', 'method', 'payment_approved')  # filters

    actions = ['export_to_csv']

    def export_to_csv(self, request, queryset):
        """
        Export selected payments to CSV
        """
        meta = self.model._meta
        field_names = [field.name for field in meta.fields]

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename=payments.csv'
        writer = csv.writer(response)

        # header row
        writer.writerow(field_names)

        # data rows
        for obj in queryset:
            row = [getattr(obj, field) for field in field_names]
            writer.writerow(row)

        return response

    export_to_csv.short_description = "Export Selected to CSV"
