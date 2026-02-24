
from django.contrib import admin
from django.urls import path,include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/',include('accounts.urls')),
    path('api/payment/',include('payments.urls')),
    path('api/ticket/',include('tickets.urls')),
    path('api/notice/',include('notice.urls')),
    path('api/stats/',include('stats.urls')),





]