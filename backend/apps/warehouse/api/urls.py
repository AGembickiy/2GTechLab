from django.urls import path
from backend.apps.warehouse.views import item_views, transaction_views, audit_views

urlpatterns = [
    # Items
    path('items/', item_views.WarehouseItemListView.as_view(), name='warehouse-item-list'),
    path('items/<int:pk>/', item_views.WarehouseItemDetailView.as_view(), name='warehouse-item-detail'),
    
    # Stock management
    path('stock/', item_views.WarehouseStockView.as_view(), name='warehouse-stock'),
    path('low-stock/', item_views.WarehouseLowStockView.as_view(), name='warehouse-low-stock'),
    path('out-of-stock/', item_views.WarehouseOutofStockView.as_view(), name='warehouse-out-of-stock'),
    
    # Transactions
    path('transactions/', transaction_views.WarehouseTransactionListView.as_view(), name='warehouse-transaction-list'),
    path('transactions/<int:pk>/', transaction_views.WarehouseTransactionDetailView.as_view(), name='warehouse-transaction-detail'),
    
    # Audits
    path('audits/', audit_views.InventoryAuditListView.as_view(), name='inventory-audit-list'),
    path('audits/<int:pk>/', audit_views.InventoryAuditDetailView.as_view(), name='inventory-audit-detail'),
    path('audits/<int:audit_id>/items/', audit_views.InventoryAuditItemListView.as_view(), name='inventory-audit-items'),
    path('audits/<int:audit_id>/items/<int:item_id>/', audit_views.InventoryAuditItemDetailView.as_view(), name='inventory-audit-item-detail'),
    path('audits/<int:audit_id>/items/<int:item_id>/verify/', audit_views.VerifyAuditItemView.as_view(), name='verify-audit-item'),
]
