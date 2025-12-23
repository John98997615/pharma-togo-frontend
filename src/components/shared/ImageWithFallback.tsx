// src/components/shared/ImageWithFallback.tsx
import React, { useState } from 'react';
import { formatImageUrl } from '../../services/api/pharmacy.service';

interface ImageWithFallbackProps {
  src: any; // Peut être string, object, etc.
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  fallbackBg?: string;
  onError?: () => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackIcon,
  fallbackBg = 'bg-gray-100',
  onError,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Formater l'URL
  const formattedUrl = formatImageUrl(src);
  
  console.log('ImageWithFallback:', {
    originalSrc: src,
    formattedUrl,
    hasError,
    isLoading
  });

  const handleError = () => {
    console.error(`Failed to load image: ${formattedUrl}`);
    setHasError(true);
    setIsLoading(false);
    if (onError) onError();
  };

  const handleLoad = () => {
    console.log(`Image loaded successfully: ${formattedUrl}`);
    setIsLoading(false);
  };

  if (!formattedUrl || hasError) {
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

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <img
        src={formattedUrl}
        alt={alt}
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};

export default ImageWithFallback;