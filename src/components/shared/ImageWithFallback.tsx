// src/components/shared/ImageWithFallback.tsx
import React, { useState, useEffect } from 'react';
import { formatImageUrl } from '../../services/api/pharmacy.service';

interface ImageWithFallbackProps {
  src: any;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  fallbackBg?: string; // AJOUTEZ CETTE PROP
  onLoad?: () => void;
  onError?: () => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackIcon,
  fallbackBg = 'bg-gray-100', // VALEUR PAR DÉFAUT
  onLoad,
  onError,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    // Réinitialiser l'état quand la source change
    setHasError(false);
    setIsLoading(true);
    
    // Formater l'URL
    const formattedUrl = formatImageUrl(src);
    setImageUrl(formattedUrl);
    
    console.log('🖼️ ImageWithFallback:', {
      originalSrc: src,
      formattedUrl,
      hasError,
      isLoading
    });
  }, [src]);

  const handleError = () => {
    console.error('❌ Failed to load image:', imageUrl);
    setHasError(true);
    setIsLoading(false);
    if (onError) onError();
  };

  const handleLoad = () => {
    console.log('✅ Image loaded successfully:', imageUrl);
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  // Si pas d'URL ou erreur, afficher le fallback
  if (!imageUrl || hasError) {
    return (
      <div className={`${className} ${fallbackBg} flex items-center justify-center`}>
        {fallbackIcon || (
          <div className="text-gray-400">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  // Si l'URL contient encore des chemins Windows, ne pas essayer de la charger
  if (imageUrl.includes('\\') || imageUrl.includes('C:\\')) {
    console.warn('⚠️ Skipping image with Windows path:', imageUrl);
    return (
      <div className={`${className} ${fallbackBg} flex flex-col items-center justify-center text-red-400`}>
        <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span className="text-xs">Invalid image path</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading="lazy"
        onError={handleError}
        onLoad={handleLoad}
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default ImageWithFallback;