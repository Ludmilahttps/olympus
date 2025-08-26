import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const ImageGallery = ({ images }) => {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="text-center text-muted-foreground py-8">Nenhuma imagem disponível para este espaço.</div>;
  }

  const handleOpen = (index) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const showNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const showPrevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Imagem Principal */}
      <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
        <img
          src={images[0].image}
          alt={images[0].caption || images[0].alt_text || 'Imagem principal do espaço'}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => handleOpen(0)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
          <h2 className="text-white text-2xl font-bold">{images[0].caption}</h2>
        </div>
      </div>

      {/* Galeria de Miniaturas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((img, index) => (
          <div
            key={img.id || index}
            className="relative w-full aspect-video rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all duration-200"
            onClick={() => handleOpen(index)}
          >
            <img
              src={img.image}
              alt={img.caption || img.alt_text || `Imagem ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {index === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold text-lg">
                Principal
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal da Galeria */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
          <div className="relative flex-grow flex items-center justify-center bg-black">
            <img
              src={images[currentIndex].image}
              alt={images[currentIndex].caption || images[currentIndex].alt_text || `Imagem ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
            
            {/* Botões de Navegação */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={showPrevImage}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={showNextImage}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            {/* Botão de Fechar */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={handleClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="bg-background p-4 text-center">
            <p className="text-lg font-semibold">{images[currentIndex].caption}</p>
            <p className="text-sm text-muted-foreground">{currentIndex + 1} / {images.length}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGallery;