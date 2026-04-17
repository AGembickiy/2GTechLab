from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'role', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('user__username', 'phone', 'address')
