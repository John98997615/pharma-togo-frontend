// src/components/shared/ImageWithFallback.tsx
import React, { useState } from 'react';
import { Package } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = 'h-10 w-10 rounded-lg object-cover',
  fallbackIcon = <Package className="h-6 w-6 text-gray-400" />
}) => {
  const [hasError, setHasError] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const getImageUrl = () => {
    if (!src) return null;
    
    // Si c'est déjà une URL complète
    if (src.startsWith('http')) return src;
    
    // Si c'est un chemin relatif (venant de Laravel storage)
    if (src.startsWith('medicaments/') || src.startsWith('pharmacies/')) {
      return `${API_BASE_URL}/storage/${src}`;
    }
    
    return src;
  };

  const imageUrl = getImageUrl();

  if (hasError || !imageUrl) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        {fallbackIcon}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};

export default ImageWithFallback;