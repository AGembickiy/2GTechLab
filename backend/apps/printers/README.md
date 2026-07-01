# Printers App

Domain models for 3D printer equipment.

## Structure

```
printers/
├── models/
│   ├── equipment.py    # Equipment/Printer model
│   └── __init__.py
├── serializers/
│   ├── equipment_serializer.py
│   └── __init__.py
├── views/
│   ├── equipment_views.py
│   └── __init__.py
├── admin.py
├── apps.py
├── urls.py
└── __init__.py
```

## Usage

Import models from `apps.printers.models.equipment`:

```python
from apps.printers.models.equipment import Equipment
```
