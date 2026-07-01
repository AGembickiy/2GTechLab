# Catalog App

Domain models for materials, printers, and products.

## Structure

```
catalog/
├── models/
│   ├── material.py    # Material model
│   ├── printer.py     # Printer model
│   └── __init__.py
├── serializers/
│   ├── catalog_serializer.py
│   └── __init__.py
├── views/
│   ├── catalog_views.py
│   └── __init__.py
├── admin.py
├── apps.py
├── urls.py
└── __init__.py
```

## Usage

Import models from `apps.catalog.models.*`:

```python
from apps.catalog.models.material import Material
from apps.catalog.models.printer import Printer
```
