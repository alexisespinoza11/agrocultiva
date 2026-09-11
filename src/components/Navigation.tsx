import React from 'react';
import { ScanEye, TrendingUp, ShoppingCart, Sprout, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { CatalogBadge } from './CatalogBadge';
import { useAuth } from '../context/AuthContext';

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
  const { user, profile, openAuthModal, signOut } = useAuth();
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

            {/* Header Right: Catalog Badge & Supabase Auth Actions */}
            <div className="flex items-center gap-2.5">
              <div className="hidden xl:flex items-center">
                <CatalogBadge />
              </div>

              {/* Botones de Autenticación Supabase */}
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-emerald-950 leading-tight max-w-[130px] truncate">
                        {profile?.fullName || user.email}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-medium leading-none max-w-[130px] truncate">
                        {profile?.role || 'Productor'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => signOut()}
                    title="Cerrar sesión"
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    id="btn-nav-login"
                    onClick={() => openAuthModal('login')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 rounded-xl transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Iniciar Sesión</span>
                  </button>

                  <button
                    id="btn-nav-register"
                    onClick={() => openAuthModal('register')}
                    className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow-md rounded-xl transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Registrarse</span>
                  </button>
                </div>
              )}
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
