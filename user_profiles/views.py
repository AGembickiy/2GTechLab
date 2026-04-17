from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Profile


@login_required
def profile_view(request):
    profile, created = Profile.objects.get_or_create(user=request.user)
    return render(request, 'user_profiles/profile.html', {'profile': profile})
