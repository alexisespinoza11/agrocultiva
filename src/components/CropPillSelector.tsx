import React from 'react';
import { ALLOWED_CROPS, AllowedCrop } from '../types';

interface CropPillSelectorProps {
  selectedCrop: AllowedCrop | 'Todos';
  onSelectCrop: (crop: AllowedCrop | 'Todos') => void;
  showAllOption?: boolean;
}

export const CropPillSelector: React.FC<CropPillSelectorProps> = ({
  selectedCrop,
  onSelectCrop,
  showAllOption = true,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none py-1">
      {showAllOption && (
        <button
          type="button"
          onClick={() => onSelectCrop('Todos')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
            selectedCrop === 'Todos'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
          }`}
        >
          <span>🌱</span>
          <span>Catálogo Completo (4)</span>
        </button>
      )}

      {ALLOWED_CROPS.map((crop) => {
        const isSelected = selectedCrop === crop.id;
        return (
          <button
            key={crop.id}
            type="button"
            onClick={() => onSelectCrop(crop.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
            }`}
          >
            <span>{crop.icon}</span>
            <span>{crop.name}</span>
          </button>
        );
      })}
    </div>
  );
};
