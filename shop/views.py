from django.shortcuts import render

from django.views.generic import ListView, DetailView
from .models import Order

class OrderListView(ListView):
    model = Order
    template_name = 'shop/order_list.html'
    context_object_name = 'orders'

class OrderDetailView(DetailView):
    model = Order
    template_name = 'shop/order_detail.html'
    context_object_name = 'order'

def threejs_model(request):
    return render(request, 'threejs/model.html')
