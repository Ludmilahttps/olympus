import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Star, 
  Upload, 
  X, 
  Wifi,
  Zap,
  Volume2,
  Armchair,
  MapPin,
  DollarSign,
  Coffee,
  Users,
  Camera
} from 'lucide-react';
import { workspacesAPI } from '@/lib/api/workspaces';

const ReviewForm = ({ review = null, workspaceId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    workspace: workspaceId,
    overall_rating: review?.overall_rating || 5,
    wifi_quality: review?.wifi_quality || null,
    power_outlets: review?.power_outlets || null,
    noise_level: review?.noise_level || null,
    comfort: review?.comfort || null,
    location: review?.location || null,
    value_for_money: review?.value_for_money || null,
    food_quality: review?.food_quality || null,
    service_quality: review?.service_quality || null,
    comment: review?.comment || '',
    visit_date: review?.visit_date || '',
    visit_purpose: review?.visit_purpose || '',
    images: []
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const ratingCategories = [
    { 
      key: 'wifi_quality', 
      label: 'Qualidade do WiFi', 
      icon: Wifi,
      description: 'Velocidade e estabilidade da conexão'
    },
    { 
      key: 'power_outlets', 
      label: 'Disponibilidade de Tomadas', 
      icon: Zap,
      description: 'Facilidade para encontrar tomadas'
    },
    { 
      key: 'noise_level', 
      label: 'Nível de Ruído', 
      icon: Volume2,
      description: '1 = Muito barulhento, 5 = Muito silencioso'
    },
    { 
      key: 'comfort', 
      label: 'Conforto', 
      icon: Armchair,
      description: 'Qualidade das cadeiras e mesas'
    },
    { 
      key: 'location', 
      label: 'Localização', 
      icon: MapPin,
      description: 'Facilidade de acesso e localização'
    },
    { 
      key: 'value_for_money', 
      label: 'Custo-Benefício', 
      icon: DollarSign,
      description: 'Relação entre preço e qualidade'
    },
    { 
      key: 'food_quality', 
      label: 'Qualidade da Comida', 
      icon: Coffee,
      description: 'Se aplicável'
    },
    { 
      key: 'service_quality', 
      label: 'Qualidade do Atendimento', 
      icon: Users,
      description: 'Atendimento da equipe'
    },
  ];

  const handleRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      [category]: rating
    }));
    
    // Limpar erro se existir
    if (errors[category]) {
      setErrors(prev => ({
        ...prev,
        [category]: null
      }));
    }
  };

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

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 10;
    
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.overall_rating) {
      newErrors.overall_rating = 'Avaliação geral é obrigatória';
    }

    if (formData.comment.trim().length < 10) {
      newErrors.comment = 'Comentário deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (review) {
        // Atualizar avaliação existente
        await workspacesAPI.updateReview(review.id, formData);
      } else {
        // Criar nova avaliação
        await workspacesAPI.createReview(formData);
      }
      
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      
      if (error.response?.data) {
        const serverErrors = error.response.data;
        if (typeof serverErrors === 'object') {
          setErrors(serverErrors);
        } else {
          alert('Erro ao salvar avaliação. Tente novamente.');
        }
      } else {
        alert('Erro ao salvar avaliação. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (category, currentRating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(category, star)}
            className={`p-1 rounded transition-colors ${
              star <= currentRating 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            <Star 
              className={`h-5 w-5 ${
                star <= currentRating ? 'fill-current' : ''
              }`} 
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {currentRating ? `${currentRating}/5` : 'Não avaliado'}
        </span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {review ? 'Editar Avaliação' : 'Escrever Avaliação'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avaliação Geral */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Avaliação Geral *
            </Label>
            <div className="flex items-center gap-2">
              {renderStarRating('overall_rating', formData.overall_rating)}
            </div>
            {errors.overall_rating && (
              <p className="text-sm text-red-600">{errors.overall_rating}</p>
            )}
          </div>

          {/* Avaliações Específicas */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Avaliações Específicas (opcional)
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ratingCategories.map(({ key, label, icon: Icon, description }) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">{label}</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">{description}</p>
                  {renderStarRating(key, formData[key])}
                  {errors[key] && (
                    <p className="text-sm text-red-600">{errors[key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Comentário */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base font-semibold">
              Comentário *
            </Label>
            <Textarea
              id="comment"
              placeholder="Conte sobre sua experiência neste espaço..."
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              rows={4}
              className={errors.comment ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 10 caracteres ({formData.comment.length}/10)
            </p>
            {errors.comment && (
              <p className="text-sm text-red-600">{errors.comment}</p>
            )}
          </div>

          {/* Informações da Visita */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visit_date">Data da Visita</Label>
              <Input
                id="visit_date"
                type="date"
                value={formData.visit_date}
                onChange={(e) => handleInputChange('visit_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visit_purpose">Propósito da Visita</Label>
              <Input
                id="visit_purpose"
                placeholder="Ex: Trabalho remoto, reunião, estudo..."
                value={formData.visit_purpose}
                onChange={(e) => handleInputChange('visit_purpose', e.target.value)}
              />
            </div>
          </div>

          {/* Upload de Imagens */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Fotos (opcional)
            </Label>
            <p className="text-sm text-muted-foreground">
              Adicione até 10 fotos para ilustrar sua avaliação. Máximo 5MB por imagem.
            </p>
            
            {/* Botão de Upload */}
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedImages.length >= 10}
              >
                <Camera className="h-4 w-4 mr-2" />
                Adicionar Fotos
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedImages.length}/10 fotos
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
                {selectedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg border">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
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

          {/* Botões de Ação */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Salvando...' : (review ? 'Atualizar' : 'Publicar')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
