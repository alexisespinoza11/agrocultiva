import React, { useState } from 'react';
import { Navigation, ActiveTab } from './components/Navigation';
import { PestDetection } from './components/PestDetection';
import { MarketPrices } from './components/MarketPrices';
import { OrderManagement } from './components/OrderManagement';
import { LoginScreen } from './components/LoginScreen';
import { AuthModal } from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AllowedCrop, GeneratedOrder } from './types';
import { ShieldCheck, Sprout, Building2, MapPin, Loader2 } from 'lucide-react';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isGuest, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('detection');
  const [selectedCropForMarket, setSelectedCropForMarket] = useState<AllowedCrop | 'Todos'>('Todos');
  const [selectedCropForOrder, setSelectedCropForOrder] = useState<AllowedCrop>('Papa');
  const [selectedVarietyForOrder, setSelectedVarietyForOrder] = useState<string | undefined>(undefined);
  const [orderCount, setOrderCount] = useState<number>(0);

  // Pantalla de carga mientras se verifica la sesión en Supabase
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-emerald-950 via-emerald-900 to-gray-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center mb-4 text-emerald-400 animate-pulse">
          <Sprout className="w-9 h-9" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Iniciando AgroCultiva...</span>
        </div>
      </div>
    );
  }

  // Si no está autenticado y no eligió continuar como invitado, mostrar la Ventana Principal de Login
  if (!user && !isGuest) {
    return <LoginScreen />;
  }

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
              <span className="text-gray-500">Especializado en Fresa, Aguaymanto, Papa y Cebolla China</span>
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
