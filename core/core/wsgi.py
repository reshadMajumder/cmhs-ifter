"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
from django.conf import settings
from whitenoise import WhiteNoise

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()
# Wrap with WhiteNoise so static files in STATIC_ROOT are served when DEBUG=False
# This is useful for deployments (e.g., Vercel) where a separate static file server isn't configured.
if not settings.DEBUG:
	application = WhiteNoise(application, root=str(settings.STATIC_ROOT), prefix='static/')

app = application
