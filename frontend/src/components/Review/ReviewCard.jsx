import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  StarHalf, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  Wifi,
  Zap,
  Volume2,
  Armchair,
  MapPin,
  DollarSign,
  Coffee,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { workspacesAPI } from '@/lib/api/workspaces';
import { useAuthStore } from '@/lib/store';
import ReviewForm from './ReviewForm';

const ReviewCard = ({ review, onUpdate, showWorkspaceName = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuthStore();

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;

    setIsDeleting(true);
    try {
      await workspacesAPI.deleteReview(review.id);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);
      alert('Erro ao deletar avaliação. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  const ratingCategories = [
    { key: 'wifi_quality', label: 'WiFi', icon: Wifi },
    { key: 'power_outlets', label: 'Tomadas', icon: Zap },
    { key: 'noise_level', label: 'Ruído', icon: Volume2 },
    { key: 'comfort', label: 'Conforto', icon: Armchair },
    { key: 'location', label: 'Localização', icon: MapPin },
    { key: 'value_for_money', label: 'Custo-Benefício', icon: DollarSign },
    { key: 'food_quality', label: 'Comida', icon: Coffee },
    { key: 'service_quality', label: 'Atendimento', icon: Users },
  ];

  if (isEditing) {
    return (
      <ReviewForm
        review={review}
        workspaceId={review.workspace}
        onSubmit={() => {
          setIsEditing(false);
          if (onUpdate) onUpdate();
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={review.user_avatar} />
              <AvatarFallback>{review.user_initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{review.user_name}</h4>
                {review.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verificado
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  {renderStars(review.overall_rating)}
                  <span className="ml-1 font-medium">{review.overall_rating}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(review.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>

          {review.can_edit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {showWorkspaceName && review.workspace_name && (
          <div className="text-sm text-muted-foreground">
            Avaliação para: <span className="font-medium">{review.workspace_name}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Avaliações Detalhadas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ratingCategories.map(({ key, label, icon: Icon }) => {
            const rating = review[key];
            if (!rating) return null;

            return (
              <div key={key} className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{label}:</span>
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {renderStars(rating)}
                  </div>
                  <span className="font-medium">{rating}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comentário */}
        {review.comment && (
          <div className="text-sm leading-relaxed">
            <p>{review.comment}</p>
          </div>
        )}

        {/* Informações da Visita */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {review.visit_date && (
            <span>Visitado em: {new Date(review.visit_date).toLocaleDateString('pt-BR')}</span>
          )}
          {review.visit_purpose && (
            <span>Propósito: {review.visit_purpose}</span>
          )}
        </div>

        {/* Imagens da Avaliação */}
        {review.images && review.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {review.images.map((image) => (
              <div key={image.id} className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={image.image_url}
                  alt={image.alt_text || image.caption}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}

        {/* Data de Atualização */}
        {review.updated_at !== review.created_at && (
          <div className="text-xs text-muted-foreground">
            Editado em: {new Date(review.updated_at).toLocaleDateString('pt-BR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;