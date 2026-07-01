# Common views for 2GTechLab

from rest_framework import mixins
from rest_framework.viewsets import GenericViewSet


class ReadOnlyViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    """View set with only read operations."""
    pass


class CreateListViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, GenericViewSet):
    """View set with create and list operations."""
    pass


class ModelViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, 
                   mixins.UpdateModelMixin, mixins.DestroyModelMixin, GenericViewSet):
    """Full CRUD view set."""
    pass
