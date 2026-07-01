# Custom exceptions for 2GTechLab

class BusinessError(Exception):
    """Business logic error."""
    pass


class ValidationError(Exception):
    """Validation error."""
    pass


class NotFoundError(Exception):
    """Resource not found error."""
    pass


class PermissionError(Exception):
    """Permission denied error."""
    pass
