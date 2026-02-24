import csv
import io
import os
import zipfile
from urllib.parse import urlparse

import requests
from django.http import HttpResponse
from django.contrib import admin, messages
from .models import User
from django.utils.text import slugify


def export_users_csv(modeladmin, request, queryset):
    """
    Export selected users as CSV.
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="users.csv"'

    writer = csv.writer(response)
    # Header row
    writer.writerow([
        'Phone',
        'Name',
        'Batch',
        'Gender',
        'Profile Image URL',
        'Staff',
        'Active',
        'Date Joined',
        'Payment Transaction ID',
        'Payment Type',
        'Payment Amount',
        'Payment Method',
        'Payment Approved',
        'Payment Created At',
    ])

    for user in queryset:
        payments = list(user.payments.all().order_by('-created_at'))

        profile_image_url = ''
        if getattr(user, 'profile_image', None):
            try:
                profile_image_url = user.profile_image.url
            except Exception:  # pragma: no cover - prevent export failure if storage is misconfigured
                profile_image_url = str(user.profile_image)

        if payments:
            for payment in payments:
                writer.writerow([
                    user.phone,
                    user.name,
                    user.batch,
                    user.gender,
                    profile_image_url,
                    user.is_staff,
                    user.is_active,
                    user.date_joined.isoformat() if user.date_joined else '',
                    payment.transaction_id,
                    payment.payment_type,
                    str(payment.amount),
                    payment.method,
                    payment.payment_approved,
                    payment.created_at.isoformat() if payment.created_at else '',
                ])
        else:
            writer.writerow([
                user.phone,
                user.name,
                user.batch,
                user.gender,
                profile_image_url,
                user.is_staff,
                user.is_active,
                user.date_joined.isoformat() if user.date_joined else '',
                '',
                '',
                '',
                '',
                '',
                '',
            ])

    return response


export_users_csv.short_description = "Export Selected Users to CSV"


def download_user_images(modeladmin, request, queryset):
    """Download selected users' profile images grouped per user in a zip archive."""
    buffer = io.BytesIO()
    images_added = False

    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for user in queryset:
            profile_image = getattr(user, 'profile_image', None)
            if not profile_image:
                continue

            image_url = getattr(profile_image, 'url', None)
            if not image_url:
                continue

            try:
                response = requests.get(image_url, stream=True, timeout=10)
                response.raise_for_status()
            except Exception:
                continue

            folder_name = slugify(f"{user.name or 'user'}-{user.phone}") or f"user-{user.pk}"

            parsed = urlparse(image_url)
            filename = os.path.basename(parsed.path) or f"profile-{user.pk}.jpg"
            arcname = f"{folder_name}/{filename}"

            zip_file.writestr(arcname, response.content)
            images_added = True

    if not images_added:
        modeladmin.message_user(
            request,
            "No profile images available to download for the selected users.",
            level=messages.WARNING,
        )
        return None

    buffer.seek(0)
    response = HttpResponse(buffer.getvalue(), content_type='application/zip')
    response['Content-Disposition'] = 'attachment; filename="user_profile_images.zip"'
    return response


download_user_images.short_description = "Download selected user images"


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        'phone', 'name', 'batch', 'gender', 'is_staff', 'is_active', 'date_joined'
    )
    search_fields = ('phone', 'name')
    list_filter = ('batch', 'gender', 'is_staff', 'is_active')
    ordering = ('-date_joined',)
    actions = [export_users_csv, download_user_images]
