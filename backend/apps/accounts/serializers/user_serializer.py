from rest_framework import serializers
from django.contrib.auth.models import User
from backend.apps.accounts.models.user import Profile


class ProfileSerializer(serializers.ModelSerializer):
    """Сериализатор профиля пользователя."""
    class Meta:
        model = Profile
        fields = ['id', 'user', 'phone', 'address', 'role', 'created_at']
        read_only_fields = ['user', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор пользователя с профилем."""
    profile = ProfileSerializer(read_only=True)
    role = serializers.CharField(source='profile.role', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined', 'profile', 'role']
        read_only_fields = ['date_joined', 'profile', 'role']


class LoginSerializer(serializers.Serializer):
    """Сериализатор для входа."""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, style={'input_type': 'password'})


class RegisterSerializer(serializers.ModelSerializer):
    """Сериализатор для регистрации."""
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    phone = serializers.CharField(required=True)
    role = serializers.CharField(required=False, default='client')
    phone_verification_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone', 'role', 'phone_verification_code']

    def create(self, validated_data):
        phone = validated_data.pop('phone')
        role = validated_data.pop('role', 'client')
        phone_verification_code = validated_data.pop('phone_verification_code', None)

        # Verify phone code if provided
        if phone_verification_code:
            from backend.apps.accounts.services.phone_verification import PhoneVerificationService
            if not PhoneVerificationService.verify_code(phone, phone_verification_code):
                raise serializers.ValidationError({'phone_verification_code': 'Неверный код верификации'})

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )

        Profile.objects.create(
            user=user,
            phone=phone,
            role=role
        )

        return user


class SendPhoneVerificationSerializer(serializers.Serializer):
    """Сериализатор для отправки кода верификации."""
    phone = serializers.CharField(required=True)

    def validate_phone(self, value):
        """Валидация номера телефона."""
        import re
        # Allow Russian phone numbers with +7 or 8 prefix
        pattern = r'^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError("Неверный формат номера телефона")
        return value


class VerifyPhoneSerializer(serializers.Serializer):
    """Сериализатор для верификации телефона."""
    phone = serializers.CharField(required=True)
    code = serializers.CharField(required=True, min_length=6, max_length=6)

    def validate(self, attrs):
        phone = attrs.get('phone')
        code = attrs.get('code')

        if len(code) != 6 or not code.isdigit():
            raise serializers.ValidationError({'code': 'Код должен состоять из 6 цифр'})

        return attrs
