import React, { useState } from 'react';
import { ShieldCheck, Info, X, CheckCircle2 } from 'lucide-react';
import { ALLOWED_CROPS } from '../types';

interface CatalogBadgeProps {
  onSelectCrop?: (cropId: string) => void;
}

export const CatalogBadge: React.FC<CatalogBadgeProps> = ({ onSelectCrop }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div 
        id="catalog-restriction-badge"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold italic cursor-pointer hover:bg-gray-200 transition-colors"
        title="Ver detalles del catálogo estricto de 4 productos"
      >
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
        <span className="font-semibold not-italic">Catálogo:</span>
        <span className="hidden lg:inline">Solo Fresa, Aguaymanto, Papa, Cebolla</span>
        <span className="lg:hidden">4 Cultivos</span>
        <Info className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-0.5" />
      </div>

      {showModal && (
        <div 
          id="catalog-modal-overlay" 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowModal(false)}
        >
          <div 
            id="catalog-modal-content"
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-sm border border-gray-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Catálogo Estricto Agrocultiva</h3>
                  <p className="text-xs text-gray-500">Especialización fitosanitaria y comercial</p>
                </div>
              </div>
              <button 
                id="close-catalog-modal-btn"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Para garantizar diagnósticos fitosanitarios fiables y cotizaciones en tiempo real del MIDAGRI, Agrocultiva opera <strong className="text-gray-900 font-semibold">exclusivamente sobre 4 cadenas agrícolas clave</strong>:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {ALLOWED_CROPS.map((crop) => (
                <div 
                  key={crop.id}
                  onClick={() => {
                    if (onSelectCrop) onSelectCrop(crop.id);
                    setShowModal(false);
                  }}
                  className="p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-2xl">{crop.icon}</span>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 text-sm">{crop.name}</h4>
                      <p className="text-[10px] italic text-gray-500">{crop.scientific}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-2 mt-1">{crop.description}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs text-gray-700 flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <p className="text-[11px] text-gray-600">
                Cualquier imagen, consulta o pedido que no pertenezca a estos 4 productos será rechazado automáticamente por el motor de la plataforma.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                id="understand-catalog-btn"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
