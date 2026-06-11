from django.urls import path, include

app_name = 'v1'

urlpatterns = [
    path('', include('backend.api.v1.urls.urls')),
]
