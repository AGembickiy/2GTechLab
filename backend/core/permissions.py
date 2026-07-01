# Custom permissions for 2GTechLab

from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """Admin or read-only access."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsAdmin(permissions.BasePermission):
    """Admin access only."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class IsOwnerOrAdmin(permissions.BasePermission):
    """Owner or admin access."""
    
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        return hasattr(obj, 'user') and obj.user == request.user
