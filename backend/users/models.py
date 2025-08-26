from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator

class User(AbstractUser):
    """
    Modelo de usuário personalizado para o Olympus
    """
    email = models.EmailField(unique=True, verbose_name="Email")
    first_name = models.CharField(max_length=30, verbose_name="Nome")
    last_name = models.CharField(max_length=30, verbose_name="Sobrenome")
    
    # Campos adicionais
    bio = models.TextField(max_length=500, blank=True, verbose_name="Biografia")
    location = models.CharField(max_length=100, blank=True, verbose_name="Localização")
    website = models.URLField(blank=True, verbose_name="Website")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name="Avatar")
    
    # Informações profissionais
    profession = models.CharField(max_length=100, blank=True, verbose_name="Profissão")
    company = models.CharField(max_length=100, blank=True, verbose_name="Empresa")
    
    # Configurações de conta
    is_verified = models.BooleanField(default=False, verbose_name="Email Verificado")
    is_premium = models.BooleanField(default=False, verbose_name="Usuário Premium")
    
    # Telefone com validação
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Número de telefone deve estar no formato: '+999999999'. Até 15 dígitos permitidos."
    )
    phone_number = models.CharField(
        validators=[phone_regex], 
        max_length=17, 
        blank=True,
        verbose_name="Telefone"
    )
    
    # Preferências
    language = models.CharField(
        max_length=10,
        choices=[
            ('pt-br', 'Português (Brasil)'),
            ('en', 'English'),
            ('es', 'Español'),
        ],
        default='pt-br',
        verbose_name="Idioma"
    )
    
    timezone = models.CharField(
        max_length=50,
        default='America/Sao_Paulo',
        verbose_name="Fuso Horário"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    last_login_ip = models.GenericIPAddressField(blank=True, null=True, verbose_name="Último IP de Login")
    
    # Configurações de notificação
    email_notifications = models.BooleanField(default=True, verbose_name="Notificações por Email")
    push_notifications = models.BooleanField(default=True, verbose_name="Notificações Push")
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        """Retorna o nome completo do usuário"""
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def initials(self):
        """Retorna as iniciais do usuário"""
        return f"{self.first_name[0] if self.first_name else ''}{self.last_name[0] if self.last_name else ''}".upper()
    
    def get_avatar_url(self):
        """Retorna a URL do avatar ou None"""
        if self.avatar:
            return self.avatar.url
        return None
