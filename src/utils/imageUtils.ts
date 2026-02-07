// src/utils/imageUtils.ts
/**
 * Utilitaire pour corriger les URLs problématiques
 */
export class ImageUrlFixer {
  private static apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  /**
   * Nettoie une URL qui contient des chemins Windows
   */
  static cleanWindowsPath(url: string): string {
    if (!url) return '';
    
    console.log('🧹 Cleaning Windows path:', url);
    
    // Si c'est déjà une URL propre
    if (url.startsWith('http://') || url.startsWith('https://') || 
        url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    
    // Détecter les chemins Windows
    if (url.includes('\\') || url.includes('C:\\') || url.includes('C:/')) {
      // Extraire le nom de fichier
      let filename = '';
      
      // Chercher le dernier segment après \ ou /
      const backslashParts = url.split('\\');
      const slashParts = url.split('/');
      
      if (backslashParts.length > 1) {
        filename = backslashParts[backslashParts.length - 1];
      } else if (slashParts.length > 1) {
        filename = slashParts[slashParts.length - 1];
      }
      
      console.log('📄 Extracted filename from Windows path:', filename);
      
      if (filename) {
        // Retourner l'URL correcte
        const cleanUrl = `${this.apiBaseUrl}/storage/${filename}`;
        console.log('✅ Clean URL:', cleanUrl);
        return cleanUrl;
      }
    }
    
    // Autres cas: chemin relatif
    if (url.startsWith('/')) {
      // Éviter les doublons /api
      if (url.startsWith('/api/')) {
        return `${this.apiBaseUrl}${url.replace('/api/', '/')}`;
      }
      return `${this.apiBaseUrl}${url}`;
    }
    
    // Par défaut, supposer que c'est un nom de fichier dans storage
    return `${this.apiBaseUrl}/storage/${url}`;
  }
  
  /**
   * Vérifie si une URL est valide
   */
  static isValidUrl(url: string): boolean {
    if (!url) return false;
    
    try {
      // Vérifier si c'est un chemin Windows
      if (url.includes('\\') || url.includes('C:\\')) {
        return false;
      }
      
      // Essayer de créer une URL
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Tente de réparer une URL problématique
   */
  static fixUrl(imageData: any): string {
    if (!imageData) return '';
    
    // Si c'est une string, la nettoyer
    if (typeof imageData === 'string') {
      return this.cleanWindowsPath(imageData);
    }
    
    // Si c'est un objet, chercher des URLs
    if (typeof imageData === 'object') {
      // Chercher dans cet ordre
      const possibleKeys = ['logo_url', 'url', 'path', 'file_path', 'filename', 'image'];
      
      for (const key of possibleKeys) {
        if (imageData[key] && typeof imageData[key] === 'string') {
          const cleaned = this.cleanWindowsPath(imageData[key]);
          if (cleaned) return cleaned;
        }
      }
    }
    
    return '';
  }
}