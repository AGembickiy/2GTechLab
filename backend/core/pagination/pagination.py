from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    """Стандартная пагинация с возможностью настройки размера страницы."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'page_size': self.get_page_size(self.request),
            'current_page': self.page.number,
            'total_pages': self.page.paginator.num_pages,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })


class SmallPagination(PageNumberPagination):
    """Маленькая пагинация для списков."""
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 20


class LargePagination(PageNumberPagination):
    """Большая пагинация для списков."""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 500
