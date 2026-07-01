# Orders App

Domain models for orders, payments, and order items.

## Structure

```
orders/
├── models/
│   ├── order.py        # Order model
│   ├── order_item.py   # OrderItem model
│   ├── payment.py      # Payment model
│   └── __init__.py
├── serializers/
│   ├── order_serializer.py
│   └── __init__.py
├── views/
│   ├── order_views.py  # DRF ViewSets
│   └── __init__.py
├── admin.py
├── apps.py
├── urls.py
└── __init__.py
```

## Usage

Import models from `apps.orders.models.*`:

```python
from apps.orders.models.order import Order
from apps.orders.models.payment import Payment
```
