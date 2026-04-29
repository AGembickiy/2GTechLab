from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from .models import Profile


@login_required
def profile_view(request):
    profile, created = Profile.objects.get_or_create(user=request.user)
    return render(request, 'user_profiles/profile.html', {'profile': profile})


def list_users_view(request):
    users = (
        User.objects.select_related('profile')
        .all()
        .order_by('-date_joined')
    )

    serialized_users = []
    for user in users:
        profile = getattr(user, 'profile', None)
        role = 'customer'
        if user.is_superuser or user.is_staff:
            role = 'admin'
        elif profile and profile.role:
            role = profile.role

        serialized_users.append(
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': role,
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat(),
            }
        )

    return JsonResponse(serialized_users, safe=False)
