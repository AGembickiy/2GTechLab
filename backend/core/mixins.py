# Common mixins for 2GTechLab

from rest_framework import mixins


class SoftDeleteMixin(mixins.DestroyModelMixin):
    """Mixin for soft delete."""
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save()
        return Response(status=204)
