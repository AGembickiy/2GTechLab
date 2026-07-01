from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from backend.apps.accounts.services.phone_verification import PhoneVerificationService
from backend.apps.accounts.serializers.user_serializer import SendPhoneVerificationSerializer, VerifyPhoneSerializer
from backend.core.throttling.throttling import PhoneVerificationRateThrottle


class SendPhoneVerificationView(APIView):
    """Представление для отправки кода верификации."""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PhoneVerificationRateThrottle]
    throttle_scope = 'phone_verification'
    
    def post(self, request):
        """Отправить код верификации на телефон."""
        serializer = SendPhoneVerificationSerializer(data=request.data)
        
        if serializer.is_valid():
            phone = serializer.validated_data['phone']
            
            # Generate verification code
            code = PhoneVerificationService.generate_verification_code()
            
            # Store code (in production, save to database with expiry)
            # For now, just send via SMS
            PhoneVerificationService.send_verification_sms(phone, code)
            
            return Response({
                'message': 'Код верификации отправлен',
                'phone': phone,
                'code': code  # For demo purposes only
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyPhoneView(APIView):
    """Представление для верификации телефона."""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PhoneVerificationRateThrottle]
    throttle_scope = 'phone_verification'
    
    def post(self, request):
        """Проверить код верификации."""
        serializer = VerifyPhoneSerializer(data=request.data)
        
        if serializer.is_valid():
            phone = serializer.validated_data['phone']
            code = serializer.validated_data['code']
            
            # Verify code
            is_valid = PhoneVerificationService.verify_code(phone, code)
            
            if is_valid:
                return Response({
                    'message': 'Телефон верифицирован',
                    'verified': True
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Неверный код верификации',
                    'verified': False
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
