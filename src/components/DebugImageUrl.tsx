// src/components/DebugImageUrl.tsx
import React from 'react';
import { formatImageUrl } from '../services/api/pharmacy.service';

const DebugImageUrl: React.FC<{ data: any }> = ({ data }) => {
  const formattedUrl = formatImageUrl(data);
  
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold mb-2">Debug Image URL:</h3>
      <div className="space-y-2 text-sm">
        <div><strong>Original data:</strong> {JSON.stringify(data)}</div>
        <div><strong>Formatted URL:</strong> {formattedUrl}</div>
        {formattedUrl && (
          <>
            <div><strong>Image preview:</strong></div>
            <img 
              src={formattedUrl} 
              alt="Debug" 
              className="max-w-xs h-auto border"
              onError={() => console.error('Failed to load debug image')}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DebugImageUrl;