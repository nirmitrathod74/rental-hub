from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rentals.views import PickupOperationsAPIView

urlpatterns = [
    path('api/', include('core.urls')),
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/rentals/', include('rentals.urls')),
    path('api/security-deposits/', include('finance.urls')),
    path('api/pickups/', PickupOperationsAPIView.as_view(), name='pickups_list'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
