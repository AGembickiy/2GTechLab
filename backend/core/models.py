# Common models for 2GTechLab

from django.db import models


class TimestampedModel(models.Model):
    """Abstract model with timestamp fields."""
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class SoftDeletableModel(models.Model):
    """Abstract model with soft delete support."""
    
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        abstract = True
    
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save()
    
    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()
    
    objects = models.Manager()
    
    class AllObjects(models.Manager):
        def get_queryset(self):
            return super().get_queryset()
    
    class ActiveObjects(models.Manager):
        def get_queryset(self):
            return super().get_queryset().filter(is_deleted=False)
