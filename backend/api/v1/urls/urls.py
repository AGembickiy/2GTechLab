from django.urls import path
from . import order_views, model_views, pricing_views

app_name = 'v1'

urlpatterns = [
    path('orders/', order_views.OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', order_views.OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:pk>/calculate/', order_views.CalculatePriceView.as_view(), name='order-calculate'),
    path('models/analyze/', model_views.AnalyzeModelView.as_view(), name='model-analyze'),
    path('models/upload/', model_views.UploadModelView.as_view(), name='model-upload'),
    path('calculator/calculate/', pricing_views.CalculatePriceView.as_view(), name='calculate'),
]
