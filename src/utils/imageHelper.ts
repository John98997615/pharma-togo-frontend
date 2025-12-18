// src/utils/imageHelper.ts

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Convertit un chemin d'image Laravel en URL complète
 */
export const getImageUrl = (imagePath: string | undefined | null): string | null => {
  if (!imagePath) return null;
  
  // Si c'est déjà une URL complète
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si c'est un chemin de stockage Laravel (le plus courant)
  // Laravel stocke: 'medicaments/filename.jpg', 'pharmacies/logo.png', 'users/photo.jpg'
  
  // Vérifier si c'est un chemin avec un dossier
  if (imagePath.includes('/')) {
    // Garder le chemin tel quel pour Laravel storage
    return `${API_BASE_URL}/storage/${imagePath}`;
  }
  
  // Si c'est juste un nom de fichier (sans dossier)
  return `${API_BASE_URL}/storage/${imagePath}`;
};

/**
 * Vérifie si l'URL existe et retourne l'URL complète
 */
export const getSafeImageUrl = (imagePath: string | undefined | null): string | null => {
  const url = getImageUrl(imagePath);
  if (!url) return null;
  
  // Pour Laravel, on peut ajouter un timestamp pour éviter le cache
  return `${url}?t=${Date.now()}`;
};

/**
 * Créer un fallback pour les images manquantes
 */
export const getFallbackImage = (type: 'medicament' | 'pharmacy' | 'user' | 'default'): string => {
  switch (type) {
    case 'medicament':
      return 'https://via.placeholder.com/150/3B82F6/FFFFFF?text=💊';
    case 'pharmacy':
      return 'https://via.placeholder.com/150/1E40AF/FFFFFF?text=🏥';
    case 'user':
      return 'https://ui-avatars.com/api/?background=3B82F6&color=fff&size=150';
    default:
      return 'https://via.placeholder.com/150/9CA3AF/FFFFFF?text=Image';
  }
};