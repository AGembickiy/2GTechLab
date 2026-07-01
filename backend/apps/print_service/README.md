# Print Service App

Domain models for print jobs and material presets.

## Structure

```
print_service/
├── models/
│   ├── print_job.py          # PrintJob model
│   ├── material_preset.py    # MaterialPreset model
│   ├── slot_assignment.py    # SlotAssignment model
│   └── surface.py            # Surface model
├── serializers/
│   ├── print_service_serializer.py
│   └── __init__.py
├── views/
│   ├── print_service_views.py
│   └── __init__.py
├── admin.py
├── apps.py
├── urls.py
└── __init__.py
```

## Usage

Import models from `apps.print_service.models.*`:

```python
from apps.print_service.models.print_job import PrintJob
from apps.print_service.models.material_preset import MaterialPreset
```
