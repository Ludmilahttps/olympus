from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import login, logout
from django.utils import timezone
from django.contrib.auth.signals import user_logged_in
from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer
)

def get_tokens_for_user(user):
    """
    Gerar tokens JWT para o usuário
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class RegisterView(APIView):
    """
    View para registro de novos usuários
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Gerar tokens para o usuário
            tokens = get_tokens_for_user(user)
            
            # Serializar dados do usuário
            user_serializer = UserProfileSerializer(user, context={'request': request})
            
            return Response({
                'message': 'Usuário criado com sucesso!',
                'user': user_serializer.data,
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'Erro ao criar usuário.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """
    View para login de usuários
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Fazer login do usuário
            login(request, user)
            
            # Atualizar último login e IP
            user.last_login = timezone.now()
            user.last_login_ip = self.get_client_ip(request)
            user.save(update_fields=['last_login', 'last_login_ip'])
            
            # Gerar tokens
            tokens = get_tokens_for_user(user)
            
            # Serializar dados do usuário
            user_serializer = UserProfileSerializer(user, context={'request': request})
            
            return Response({
                'message': 'Login realizado com sucesso!',
                'user': user_serializer.data,
                'tokens': tokens
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': 'Credenciais inválidas.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        """Obter IP do cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class LogoutView(APIView):
    """
    View para logout de usuários
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            logout(request)
            
            return Response({
                'message': 'Logout realizado com sucesso!'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'message': 'Erro ao fazer logout.',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    """
    View para visualizar e atualizar perfil do usuário
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Obter perfil do usuário"""
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response({
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    
    def patch(self, request):
        """Atualizar perfil do usuário"""
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Retornar dados atualizados
            user_serializer = UserProfileSerializer(request.user, context={'request': request})
            
            return Response({
                'message': 'Perfil atualizado com sucesso!',
                'user': user_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': 'Erro ao atualizar perfil.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    """
    View para mudança de senha
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            
            return Response({
                'message': 'Senha alterada com sucesso!'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': 'Erro ao alterar senha.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class UserListView(generics.ListAPIView):
    """
    View para listar usuários (apenas para admins)
    """
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        """Filtrar usuários ativos"""
        return User.objects.filter(is_active=True).order_by('-date_joined')

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """
    Estatísticas do usuário
    """
    user = request.user
    
    # Aqui você pode adicionar estatísticas específicas do usuário
    # Por exemplo: número de espaços visitados, viagens planejadas, etc.
    
    stats = {
        'user_id': user.id,
        'member_since': user.date_joined,
        'last_login': user.last_login,
        'is_verified': user.is_verified,
        'is_premium': user.is_premium,
        'profile_completion': calculate_profile_completion(user),
    }
    
    return Response(stats, status=status.HTTP_200_OK)

def calculate_profile_completion(user):
    """
    Calcular porcentagem de completude do perfil
    """
    fields_to_check = [
        'first_name', 'last_name', 'bio', 'location',
        'profession', 'phone_number', 'avatar'
    ]
    
    completed_fields = 0
    total_fields = len(fields_to_check)
    
    for field in fields_to_check:
        value = getattr(user, field, None)
        if value:
            completed_fields += 1
    
    return round((completed_fields / total_fields) * 100, 2)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_avatar(request):
    """
    Upload de avatar do usuário
    """
    if 'avatar' not in request.FILES:
        return Response({
            'message': 'Nenhum arquivo enviado.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    user.avatar = request.FILES['avatar']
    user.save()
    
    serializer = UserProfileSerializer(user, context={'request': request})
    
    return Response({
        'message': 'Avatar atualizado com sucesso!',
        'user': serializer.data
    }, status=status.HTTP_200_OK)
