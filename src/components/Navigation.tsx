import React from 'react';
import { ScanEye, TrendingUp, ShoppingCart, Sprout } from 'lucide-react';
import { CatalogBadge } from './CatalogBadge';

export type ActiveTab = 'detection' | 'prices' | 'orders';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  orderCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  orderCount = 0,
}) => {
  return (
    <>
      {/* Desktop & Tablet Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand */}
            <div 
              id="brand-logo-container"
              onClick={() => setActiveTab('detection')}
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-xs">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  Agro<span className="text-emerald-600">cultiva</span>
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                  v2.5
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden sm:flex items-center gap-6 lg:gap-8 h-16">
              <button
                id="desktop-tab-detection"
                onClick={() => setActiveTab('detection')}
                className={`h-16 flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'detection'
                    ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600 pt-0.5'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <ScanEye className={`w-4 h-4 ${activeTab === 'detection' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span>Detección de Plagas</span>
              </button>

              <button
                id="desktop-tab-prices"
                onClick={() => setActiveTab('prices')}
                className={`h-16 flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'prices'
                    ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600 pt-0.5'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <TrendingUp className={`w-4 h-4 ${activeTab === 'prices' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span>Precios de Mercado</span>
              </button>

              <button
                id="desktop-tab-orders"
                onClick={() => setActiveTab('orders')}
                className={`h-16 flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600 pt-0.5'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <ShoppingCart className={`w-4 h-4 ${activeTab === 'orders' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span>Realizar Pedidos</span>
                {orderCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {orderCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Catalog restriction badge in header */}
            <div className="hidden md:flex items-center">
              <CatalogBadge />
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (min touch target >= 44px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1 shadow-xs">
        <div className="grid grid-cols-3 gap-1 max-w-md mx-auto">
          
          <button
            id="mobile-tab-detection"
            onClick={() => setActiveTab('detection')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-colors min-h-[48px] ${
              activeTab === 'detection'
                ? 'text-emerald-600 font-bold bg-emerald-50/70'
                : 'text-gray-500 font-medium hover:text-gray-900'
            }`}
          >
            <ScanEye className={`w-5 h-5 mb-1 ${activeTab === 'detection' ? 'text-emerald-600 stroke-[2.5]' : 'text-gray-400'}`} />
            <span className="text-[11px] leading-tight">1. Plagas</span>
          </button>

          <button
            id="mobile-tab-prices"
            onClick={() => setActiveTab('prices')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-colors min-h-[48px] ${
              activeTab === 'prices'
                ? 'text-emerald-600 font-bold bg-emerald-50/70'
                : 'text-gray-500 font-medium hover:text-gray-900'
            }`}
          >
            <TrendingUp className={`w-5 h-5 mb-1 ${activeTab === 'prices' ? 'text-emerald-600 stroke-[2.5]' : 'text-gray-400'}`} />
            <span className="text-[11px] leading-tight">2. Precios</span>
          </button>

          <button
            id="mobile-tab-orders"
            onClick={() => setActiveTab('orders')}
            className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-colors min-h-[48px] ${
              activeTab === 'orders'
                ? 'text-emerald-600 font-bold bg-emerald-50/70'
                : 'text-gray-500 font-medium hover:text-gray-900'
            }`}
          >
            <ShoppingCart className={`w-5 h-5 mb-1 ${activeTab === 'orders' ? 'text-emerald-600 stroke-[2.5]' : 'text-gray-400'}`} />
            <span className="text-[11px] leading-tight">3. Pedidos</span>
            {orderCount > 0 && (
              <span className="absolute top-1.5 right-4 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                {orderCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </>
  );
};
