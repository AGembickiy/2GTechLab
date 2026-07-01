# Accounts App

Domain models for user accounts and profiles.

## Structure

```
accounts/
├── models/
│   ├── user.py        # Profile and User-related models
│   └── __init__.py
├── serializers/
│   ├── user_serializer.py
│   └── __init__.py
├── views/
│   ├── user_views.py  # DRF ViewSets
│   └── __init__.py
├── admin.py
├── apps.py
├── urls.py
└── __init__.py
```

## Usage

Import models from `apps.accounts.models.user`:

```python
from apps.accounts.models.user import Profile
```
