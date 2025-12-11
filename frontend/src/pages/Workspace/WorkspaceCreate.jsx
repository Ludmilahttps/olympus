import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram, 
  Facebook,
  Upload,
  X,
  Plus,
  Clock,
  DollarSign,
  Users,
  Camera,
  Wifi,
  Car,
  Accessibility
} from 'lucide-react';
import { workspacesAPI } from '@/lib/api/workspaces';
import { useAuthStore } from '@/lib/store';

const WorkspaceCreateForm = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    // Informações básicas
    name: '',
    description: '',
    workspace_type: '',
    
    // Localização
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Brasil',
    latitude: null,
    longitude: null,
    
    // Contato
    phone: '',
    email: '',
    website: '',
    instagram: '',
    facebook: '',
    
    // Funcionamento
    opening_hours: {},
    
    // Comodidades
    amenities: [],
    wifi_password: '',
    parking_info: '',
    accessibility_info: '',
    
    // Preços
    daily_price: '',
    hourly_price: '',
    price_range: '',
    capacity: '',
    
    // Imagens
    images: []
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  // Opções de tipos de espaço
  const workspaceTypes = [
    { value: 'coworking', label: 'Coworking' },
    { value: 'cafe', label: 'Café' },
    { value: 'library', label: 'Biblioteca' },
    { value: 'hotel_lobby', label: 'Lobby de Hotel' },
    { value: 'restaurant', label: 'Restaurante' },
    { value: 'other', label: 'Outro' }
  ];

  // Opções de faixa de preço
  const priceRanges = [
    { value: 'free', label: 'Gratuito' },
    { value: 'budget', label: 'Econômico (até R$ 20/dia)' },
    { value: 'moderate', label: 'Moderado (R$ 21-50/dia)' },
    { value: 'expensive', label: 'Caro (R$ 51-100/dia)' },
    { value: 'luxury', label: 'Luxo (acima de R$ 100/dia)' }
  ];

  // Comodidades disponíveis
  const availableAmenities = [
    'WiFi Gratuito', 'Tomadas', 'Ar Condicionado', 'Café/Chá', 'Impressora',
    'Scanner', 'Projetor', 'Salas de Reunião', 'Telefone', 'Estacionamento',
    'Banheiro', 'Cozinha', 'Geladeira', 'Microondas', 'Área Externa',
    'Pet Friendly', 'Acessibilidade', '24 Horas', 'Segurança', 'Limpeza'
  ];

  // Estados brasileiros
  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Dias da semana
  const weekDays = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  // Verificar autenticação
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Login Necessário</h2>
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para cadastrar um espaço de trabalho.
            </p>
            <Button onClick={() => navigate('/login')}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro se existir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value
        }
      }
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 20;
    
    if (selectedImages.length + files.length > maxImages) {
      alert(`Você pode adicionar no máximo ${maxImages} imagens.`);
      return;
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Apenas arquivos JPG, PNG e WebP são permitidos.');
      return;
    }

    // Validar tamanho (5MB por imagem)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert('Cada imagem deve ter no máximo 5MB.');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (imageId) => {
    setSelectedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });

    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => 
        selectedImages.findIndex(img => img.id === imageId) !== index
      )
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Nome é obrigatório';
      } else if (formData.name.trim().length < 3) {
        newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Descrição é obrigatória';
      } else if (formData.description.trim().length < 20) {
        newErrors.description = 'Descrição deve ter pelo menos 20 caracteres';
      }

      if (!formData.workspace_type) {
        newErrors.workspace_type = 'Tipo de espaço é obrigatório';
      }
    }

    if (step === 2) {
      if (!formData.address.trim()) {
        newErrors.address = 'Endereço é obrigatório';
      }

      if (!formData.city.trim()) {
        newErrors.city = 'Cidade é obrigatória';
      }

      if (!formData.state) {
        newErrors.state = 'Estado é obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      
      // Adicionar campos de texto
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') return; // Tratar separadamente
        
        if (key === 'amenities' || key === 'opening_hours') {
          submitData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== '') {
          submitData.append(key, value);
        }
      });

      // Adicionar imagens
      formData.images.forEach((image, index) => {
        submitData.append('images', image);
      });

      const response = await workspacesAPI.createWorkspace(submitData);
      
      // Redirecionar para a página do espaço criado
      navigate(`/workspaces/${response.data.slug}`);
      
    } catch (error) {
      console.error('Erro ao criar espaço:', error);
      
      if (error.response?.data) {
        const serverErrors = error.response.data;
        if (typeof serverErrors === 'object') {
          setErrors(serverErrors);
        } else {
          alert('Erro ao criar espaço. Tente novamente.');
        }
      } else {
        alert('Erro ao criar espaço. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Espaço *</Label>
            <Input
              id="name"
              placeholder="Ex: Café Central, Coworking Hub..."
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="workspace_type">Tipo de Espaço *</Label>
            <Select 
              value={formData.workspace_type} 
              onValueChange={(value) => handleInputChange('workspace_type', value)}
            >
              <SelectTrigger className={errors.workspace_type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o tipo de espaço" />
              </SelectTrigger>
              <SelectContent>
                {workspaceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.workspace_type && (
              <p className="text-sm text-red-600 mt-1">{errors.workspace_type}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva seu espaço, ambiente, diferenciais..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo de 20 caracteres ({formData.description.length}/20)
            </p>
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Localização</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="address">Endereço Completo *</Label>
            <Input
              id="address"
              placeholder="Rua, número, complemento..."
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-600 mt-1">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                placeholder="Nome do bairro"
                value={formData.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="postal_code">CEP</Label>
              <Input
                id="postal_code"
                placeholder="00000-000"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                placeholder="Nome da cidade"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">Estado *</Label>
              <Select 
                value={formData.state} 
                onValueChange={(value) => handleInputChange('state', value)}
              >
                <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {brazilianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-sm text-red-600 mt-1">{errors.state}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Contato e Informações</h3>
        
        <div className="space-y-4">
          {/* Contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@exemplo.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://exemplo.com"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                placeholder="@usuario"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                placeholder="facebook.com/pagina"
                value={formData.facebook}
                onChange={(e) => handleInputChange('facebook', e.target.value)}
              />
            </div>
          </div>

          {/* Preços */}
          <div>
            <Label className="text-base font-semibold">Preços</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <Label htmlFor="daily_price">Preço Diário (R$)</Label>
                <Input
                  id="daily_price"
                  type="number"
                  placeholder="0.00"
                  value={formData.daily_price}
                  onChange={(e) => handleInputChange('daily_price', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="hourly_price">Preço por Hora (R$)</Label>
                <Input
                  id="hourly_price"
                  type="number"
                  placeholder="0.00"
                  value={formData.hourly_price}
                  onChange={(e) => handleInputChange('hourly_price', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="price_range">Faixa de Preço</Label>
                <Select 
                  value={formData.price_range} 
                  onValueChange={(value) => handleInputChange('price_range', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a faixa" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Capacidade */}
          <div>
            <Label htmlFor="capacity">Capacidade (pessoas)</Label>
            <Input
              id="capacity"
              type="number"
              placeholder="Ex: 50"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
            />
          </div>

          {/* Comodidades */}
          <div>
            <Label className="text-base font-semibold">Comodidades</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {availableAmenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityToggle(amenity)}
                  />
                  <Label htmlFor={amenity} className="text-sm">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Fotos e Finalização</h3>
        
        <div className="space-y-6">
          {/* Upload de Imagens */}
          <div>
            <Label className="text-base font-semibold">
              Fotos do Espaço
            </Label>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione até 20 fotos para mostrar seu espaço. A primeira foto será a principal.
            </p>
            
            {/* Botão de Upload */}
            <div className="flex items-center gap-4 mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedImages.length >= 20}
              >
                <Camera className="h-4 w-4 mr-2" />
                Adicionar Fotos
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedImages.length}/20 fotos
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Preview das Imagens */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedImages.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg border">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {index === 0 && (
                      <Badge className="absolute top-2 left-2 bg-blue-600">
                        Principal
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informações Adicionais */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="wifi_password">Senha do WiFi</Label>
              <Input
                id="wifi_password"
                placeholder="Senha para compartilhar com clientes"
                value={formData.wifi_password}
                onChange={(e) => handleInputChange('wifi_password', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="parking_info">Informações sobre Estacionamento</Label>
              <Textarea
                id="parking_info"
                placeholder="Disponibilidade, preços, localização..."
                value={formData.parking_info}
                onChange={(e) => handleInputChange('parking_info', e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="accessibility_info">Informações de Acessibilidade</Label>
              <Textarea
                id="accessibility_info"
                placeholder="Rampas, elevadores, banheiros adaptados..."
                value={formData.accessibility_info}
                onChange={(e) => handleInputChange('accessibility_info', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Básico', icon: Building },
    { number: 2, title: 'Localização', icon: MapPin },
    { number: 3, title: 'Detalhes', icon: Users },
    { number: 4, title: 'Fotos', icon: Camera }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Cadastrar Espaço de Trabalho</h1>
          <p className="text-muted-foreground">
            Compartilhe seu espaço com a comunidade Olympus
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive 
                    ? 'border-primary bg-primary text-white' 
                    : isCompleted
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-2 mr-4">
                  <div className={`text-sm font-medium ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                >
                  Anterior
                </Button>

                <div className="flex items-center gap-2">
                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={handleNextStep}
                    >
                      Próximo
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="min-w-[120px]"
                    >
                      {isSubmitting ? 'Criando...' : 'Criar Espaço'}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkspaceCreateForm;

