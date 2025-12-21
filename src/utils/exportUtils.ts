// src/utils/exportUtils.ts
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  try {
    // Extraire les en-têtes
    const headers = Object.keys(data[0]);
    
    // Créer les lignes CSV
    const csvRows = [
      headers.join(','), // En-têtes
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Gérer les valeurs spéciales
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          // Échapper les virgules et guillemets
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ];

    // Créer le contenu CSV
    const csvContent = csvRows.join('\n');
    
    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};

export const exportToExcel = (data: any[], filename: string) => {
  // Pour Excel, nous pourrions utiliser une librairie comme xlsx
  // Pour l'instant, nous utilisons CSV qui peut être ouvert dans Excel
  return exportToCSV(data, filename);
};