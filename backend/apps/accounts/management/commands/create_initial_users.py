"""
Management command to create initial users for the system.
Run: python manage.py create_initial_users
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from backend.apps.accounts.models.user import Profile


class Command(BaseCommand):
    help = 'Create initial users (admin and test user)'

    def handle(self, *args, **kwargs):
        # Create admin user
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@2gtechlab.com',
                'first_name': 'Администратор',
                'last_name': 'Системы',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        
        if created:
            admin.set_password('admin')
            admin.save()
            
            # Create admin profile
            Profile.objects.create(
                user=admin,
                phone='+7 (000) 000-00-00',
                role='admin'
            )
            
            self.stdout.write(self.style.SUCCESS('✅ Admin user created with password "admin"'))
        else:
            admin.set_password('admin')
            admin.save()
            # Update profile role
            profile = Profile.objects.filter(user=admin).first()
            if profile:
                profile.role = 'admin'
                profile.save()
            self.stdout.write(self.style.SUCCESS('✅ Admin password reset to "admin" and role set to admin'))
        
        # Create test user
        test_user, created = User.objects.get_or_create(
            username='test',
            defaults={
                'email': 'test@2gtechlab.com',
                'first_name': 'Тестовый',
                'last_name': 'Пользователь',
                'is_staff': False,
                'is_superuser': False,
            }
        )
        
        if created:
            test_user.set_password('test')
            test_user.save()
            
            # Create test profile
            Profile.objects.create(
                user=test_user,
                phone='+7 (999) 999-99-99',
                address='Москва, Россия',
                role='client'
            )
            
            self.stdout.write(self.style.SUCCESS('✅ Test user created with password "test"'))
        else:
            test_user.set_password('test')
            test_user.save()
            # Update profile role
            profile = Profile.objects.filter(user=test_user).first()
            if profile:
                profile.role = 'client'
                profile.save()
            self.stdout.write(self.style.SUCCESS('✅ Test password reset to "test" and role set to client'))
        
        # Print summary
        self.stdout.write(self.style.SUCCESS('\n📊 User Summary:'))
        for user in User.objects.all():
            profile = Profile.objects.filter(user=user).first()
            role = profile.role if profile else 'No profile'
            self.stdout.write(f'   - {user.username} ({user.email}) - {role}')
