from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer para registro de novos usuários
    """
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = (
            'username', 'email', 'first_name', 'last_name',
            'password', 'password_confirm', 'phone_number',
            'profession', 'company', 'location'
        )
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_email(self, value):
        """Validar se o email já existe"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está em uso.")
        return value
    
    def validate_username(self, value):
        """Validar se o username já existe"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nome de usuário já está em uso.")
        return value
    
    def validate_password(self, value):
        """Validar a senha usando os validadores do Django"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
    
    def validate(self, attrs):
        """Validar se as senhas coincidem"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'As senhas não coincidem.'
            })
        return attrs
    
    def create(self, validated_data):
        """Criar novo usuário"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user

class UserLoginSerializer(serializers.Serializer):
    """
    Serializer para login de usuários
    """
    email = serializers.EmailField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False
    )
    
    def validate(self, attrs):
        """Validar credenciais do usuário"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Tentar autenticar com email
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                # Tentar autenticar com username se email falhar
                try:
                    user_obj = User.objects.get(email=email)
                    user = authenticate(
                        request=self.context.get('request'),
                        username=user_obj.username,
                        password=password
                    )
                except User.DoesNotExist:
                    pass
            
            if not user:
                raise serializers.ValidationError(
                    'Credenciais inválidas. Verifique seu email e senha.',
                    code='authorization'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'Conta desativada. Entre em contato com o suporte.',
                    code='authorization'
                )
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                'Email e senha são obrigatórios.',
                code='authorization'
            )

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para perfil do usuário
    """
    full_name = serializers.ReadOnlyField()
    initials = serializers.ReadOnlyField()
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'initials', 'bio', 'location', 'website',
            'avatar', 'avatar_url', 'profession', 'company',
            'phone_number', 'language', 'timezone',
            'email_notifications', 'push_notifications',
            'is_verified', 'is_premium', 'date_joined',
            'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'username', 'email', 'is_verified', 'is_premium',
            'date_joined', 'created_at', 'updated_at'
        )
    
    def get_avatar_url(self, obj):
        """Retornar URL completa do avatar"""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para atualização do perfil do usuário
    """
    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'bio', 'location',
            'website', 'profession', 'company', 'phone_number',
            'language', 'timezone', 'email_notifications',
            'push_notifications'
        )
    
    def validate_phone_number(self, value):
        """Validar formato do telefone"""
        if value and not value.replace('+', '').replace(' ', '').replace('-', '').isdigit():
            raise serializers.ValidationError("Formato de telefone inválido.")
        return value

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer para mudança de senha
    """
    old_password = serializers.CharField(
        style={'input_type': 'password'},
        required=True
    )
    new_password = serializers.CharField(
        style={'input_type': 'password'},
        required=True,
        min_length=8
    )
    new_password_confirm = serializers.CharField(
        style={'input_type': 'password'},
        required=True
    )
    
    def validate_old_password(self, value):
        """Validar senha atual"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Senha atual incorreta.")
        return value
    
    def validate_new_password(self, value):
        """Validar nova senha"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
    
    def validate(self, attrs):
        """Validar se as novas senhas coincidem"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'As senhas não coincidem.'
            })
        return attrs
    
    def save(self):
        """Salvar nova senha"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user