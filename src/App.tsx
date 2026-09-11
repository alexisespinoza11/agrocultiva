import React, { useState } from 'react';
import { Navigation, ActiveTab } from './components/Navigation';
import { PestDetection } from './components/PestDetection';
import { MarketPrices } from './components/MarketPrices';
import { OrderManagement } from './components/OrderManagement';
import { CatalogBadge } from './components/CatalogBadge';
import { AuthModal } from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { AllowedCrop, GeneratedOrder } from './types';
import { ShieldCheck, Sprout, Building2, MapPin } from 'lucide-react';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('detection');
  const [selectedCropForMarket, setSelectedCropForMarket] = useState<AllowedCrop | 'Todos'>('Todos');
  const [selectedCropForOrder, setSelectedCropForOrder] = useState<AllowedCrop>('Papa');
  const [selectedVarietyForOrder, setSelectedVarietyForOrder] = useState<string | undefined>(undefined);
  const [orderCount, setOrderCount] = useState<number>(0);

  // Transition handlers between windows
  const handleGoToMarket = (crop: AllowedCrop) => {
    setSelectedCropForMarket(crop);
    setActiveTab('prices');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToOrder = (crop: AllowedCrop, variety?: string) => {
    setSelectedCropForOrder(crop);
    setSelectedVarietyForOrder(variety);
    setActiveTab('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCreated = (order: GeneratedOrder) => {
    setOrderCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 pb-20 sm:pb-12 font-sans">
      
      {/* Primary responsive navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        orderCount={orderCount}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Mobile Catalog Banner (visible on mobile only since desktop has it in header) */}
        <div className="md:hidden flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-emerald-900">Catálogo Estricto:</span>
            <span className="text-emerald-800">🍓 Fresa • 🟡 Aguaymanto • 🥔 Papa • 🧅 Cebolla</span>
          </div>
        </div>

        {/* Dynamic Window Switching */}
        {activeTab === 'detection' && (
          <div id="ventana-deteccion-plagas" className="animate-in fade-in duration-150">
            <PestDetection
              onGoToMarket={handleGoToMarket}
              onGoToOrder={handleGoToOrder}
            />
          </div>
        )}

        {activeTab === 'prices' && (
          <div id="ventana-precios-mercado" className="animate-in fade-in duration-150">
            <MarketPrices
              initialCrop={selectedCropForMarket}
              onMakeOrder={handleGoToOrder}
            />
          </div>
        )}

        {activeTab === 'orders' && (
          <div id="ventana-realizar-pedidos" className="animate-in fade-in duration-150">
            <OrderManagement
              preselectedCrop={selectedCropForOrder}
              preselectedVariety={selectedVarietyForOrder}
              onOrderCreated={handleOrderCreated}
            />
          </div>
        )}

      </main>

      {/* Professional Agricultural Footer */}
      <footer className="mt-auto border-t border-gray-100 bg-white py-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs">
                <Sprout className="w-4 h-4 text-emerald-100" />
              </div>
              <span className="font-bold text-gray-800 text-sm">Agrocultiva</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">Especializado en Fresa, Aguaymanto, Papa y Cebolla</span>
            </div>

            <div className="flex items-center gap-4 text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Cajamarca • Lima • Costa y Sierra
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                MIDAGRI SISAP
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-400">
            <p>© {new Date().getFullYear()} Agrocultiva. Diseñado para agricultores, acopiadores y comerciantes mayoristas.</p>
            <p>Diagnósticos basados en visión multimodal y buenas prácticas fitosanitarias de SENASA.</p>
          </div>
        </div>
      </footer>
      
      {/* Modal de Autenticación Supabase */}
      <AuthModal />

    </div>
  );
}
