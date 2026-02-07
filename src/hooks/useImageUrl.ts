// src/hooks/useImageUrl.ts
import { useState, useEffect } from 'react';
import { ImageUrlFixer } from '../utils/imageUtils';

export const useImageUrl = (imageData: any) => {
  const [url, setUrl] = useState<string>('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const cleanedUrl = ImageUrlFixer.fixUrl(imageData);
    const urlIsValid = ImageUrlFixer.isValidUrl(cleanedUrl);
    
    setUrl(cleanedUrl);
    setIsValid(urlIsValid);
    
    if (!urlIsValid && cleanedUrl) {
      setError(`Invalid URL: ${cleanedUrl}`);
      console.error('❌ Invalid image URL:', cleanedUrl);
    } else {
      setError('');
    }
  }, [imageData]);

  return { url, isValid, error };
};

// Utilisation dans les composants:
/*
const MyComponent = ({ pharmacy }) => {
  const { url, isValid, error } = useImageUrl(pharmacy.logo);
  
  if (!isValid) {
    return <div>Image not available</div>;
  }
  
  return <img src={url} alt={pharmacy.name} />;
};
*/