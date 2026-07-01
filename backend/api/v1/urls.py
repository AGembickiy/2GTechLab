from django.urls import path, include

urlpatterns = [
    path('accounts/', include('backend.api.v1.accounts.urls')),
    path('orders/', include('backend.api.v1.orders.urls')),
    path('catalog/', include('backend.api.v1.catalog.urls')),
    path('printers/', include('backend.api.v1.printers.urls')),
    path('print_service/', include('backend.api.v1.print_service.urls')),
    path('finance/', include('backend.api.v1.finance.urls')),
    path('internal_messages/', include('backend.api.v1.internal_messages.urls')),
    path('warehouse/', include('backend.api.v1.warehouse.urls')),
]
