from django.shortcuts import render
from rest_framework import viewsets
from .models import Material, Printer, Order


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = None  # Will be implemented


class PrinterViewSet(viewsets.ModelViewSet):
    queryset = Printer.objects.all()
    serializer_class = None  # Will be implemented


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = None  # Will be implemented
