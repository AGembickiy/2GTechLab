from django.contrib import admin
from backend.apps.orders.models import Order, OrderParameter, OrderItem, Payment


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'status', 'total_price', 'user')
    list_filter = ('status',)
    search_fields = ('id', 'user__username')
    readonly_fields = ['total_price']


@admin.register(OrderParameter)
class OrderParameterAdmin(admin.ModelAdmin):
    list_display = ('order', 'scale', 'infill', 'layer_height')
    search_fields = ('order__id',)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'material', 'quantity', 'unit_price')
    search_fields = ('order__id',)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'amount', 'status', 'payment_date')
    list_filter = ('status',)
    search_fields = ('order__id',)
