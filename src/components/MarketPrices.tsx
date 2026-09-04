import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MapPin, 
  Calendar, 
  Search, 
  ArrowRight, 
  Building2, 
  RefreshCcw,
  BadgeDollarSign
} from 'lucide-react';
import { AllowedCrop, MarketRegion, MarketPriceRecord } from '../types';
import { INITIAL_MARKET_PRICES } from '../data/agriculturalData';
import { CropPillSelector } from './CropPillSelector';

interface MarketPricesProps {
  initialCrop?: AllowedCrop | 'Todos';
  onMakeOrder: (crop: AllowedCrop, variety?: string) => void;
}

export const MarketPrices: React.FC<MarketPricesProps> = ({
  initialCrop = 'Todos',
  onMakeOrder,
}) => {
  const [selectedCrop, setSelectedCrop] = useState<AllowedCrop | 'Todos'>(initialCrop);
  const [selectedRegion, setSelectedRegion] = useState<MarketRegion | 'Todas'>('Todas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pricesList] = useState<MarketPriceRecord[]>(INITIAL_MARKET_PRICES);

  // Sync if initialCrop changes
  React.useEffect(() => {
    if (initialCrop) setSelectedCrop(initialCrop);
  }, [initialCrop]);

  const filteredPrices = useMemo(() => {
    return pricesList.filter((item) => {
      const matchCrop = selectedCrop === 'Todos' || item.crop === selectedCrop;
      const matchRegion = selectedRegion === 'Todas' || item.region === selectedRegion;
      const matchSearch = 
        item.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.marketName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.crop.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCrop && matchRegion && matchSearch;
    });
  }, [pricesList, selectedCrop, selectedRegion, searchTerm]);

  // Averages for quick stats
  const stats = useMemo(() => {
    if (filteredPrices.length === 0) return null;
    const avgKg = filteredPrices.reduce((acc, curr) => acc + curr.pricePerKg, 0) / filteredPrices.length;
    const minKg = Math.min(...filteredPrices.map(p => p.pricePerKg));
    const maxKg = Math.max(...filteredPrices.map(p => p.pricePerKg));
    return { avgKg, minKg, maxKg, count: filteredPrices.length };
  }, [filteredPrices]);

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Header and filters */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold tracking-wider uppercase mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Ventana 2 • Precios y Tendencias de Mercado
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Precios Agrícolas Referenciales en Perú
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Cotizaciones oficiales y sondeos de campo del <strong className="text-gray-800 font-semibold">MIDAGRI (SISAP)</strong> y la <strong className="text-gray-800 font-semibold">DRAC Cajamarca</strong> para los 4 cultivos oficiales: Fresa, Aguaymanto, Papa y Cebolla.
          </p>
        </div>

        {/* Product selector filter */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            1. Filtrar por Producto Oficial:
          </label>
          <CropPillSelector 
            selectedCrop={selectedCrop}
            onSelectCrop={setSelectedCrop}
            showAllOption={true}
          />
        </div>

        {/* Location & Search row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          
          {/* Region Tabs */}
          <div className="sm:col-span-8 space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              2. Ubicación / Región de Mercado:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['Todas', 'Cajamarca', 'Lima Capital', 'Otras Regiones'] as const).map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    selectedRegion === region
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200/70 text-gray-700'
                  }`}
                >
                  {region === 'Cajamarca' ? '⛰️ Región Cajamarca' : region === 'Lima Capital' ? '🏙️ Lima Capital' : region === 'Otras Regiones' ? '🗺️ Otras Regiones' : '🌐 Todas las Regiones'}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Buscar Variedad o Mercado:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="market-search-input"
                type="text"
                placeholder="Ej. Amarilla, Santa Anita, Jaba..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Summary Stats Banner */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Precio Promedio</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-xl font-bold text-emerald-700">S/ {stats.avgKg.toFixed(2)}</span>
              <span className="text-xs text-gray-500">/ Kg</span>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mínimo en Chacra</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-xl font-bold text-gray-800">S/ {stats.minKg.toFixed(2)}</span>
              <span className="text-xs text-gray-500">/ Kg</span>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Máximo Mayorista</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-xl font-bold text-gray-800">S/ {stats.maxKg.toFixed(2)}</span>
              <span className="text-xs text-gray-500">/ Kg</span>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Puntos Monitoreados</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-xl font-bold text-gray-800">{stats.count}</span>
              <span className="text-xs text-gray-500">mercados</span>
            </div>
          </div>
        </div>
      )}

      {/* Market cards grid */}
      {filteredPrices.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">No se encontraron cotizaciones</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Intente cambiando los filtros de región o el término de búsqueda para los 4 cultivos permitidos.
          </p>
          <button
            type="button"
            onClick={() => { setSelectedCrop('Todos'); setSelectedRegion('Todas'); setSearchTerm(''); }}
            className="px-3.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrices.map((item) => {
            const cropEmoji = item.crop === 'Fresa' ? '🍓' : item.crop === 'Aguaymanto' ? '🟡' : item.crop === 'Papa' ? '🥔' : '🧅';
            return (
              <div
                key={item.id}
                id={`price-card-${item.id}`}
                className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-300 p-5 shadow-sm transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{cropEmoji}</span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {item.crop}
                        </span>
                        <h3 className="font-bold text-gray-900 text-base mt-1 group-hover:text-emerald-700 transition-colors">
                          {item.variety}
                        </h3>
                      </div>
                    </div>

                    {/* Trend Pill */}
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      item.trend === 'up'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.trend === 'down'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {item.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                      {item.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                      {item.trend === 'stable' && <Minus className="w-3 h-3" />}
                      <span>{item.trend === 'up' ? `+${item.trendPercent}%` : item.trend === 'down' ? `-${item.trendPercent}%` : 'Estable'}</span>
                    </div>
                  </div>

                  {/* Market location name */}
                  <div className="mt-3 flex items-start gap-1.5 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="font-medium">{item.marketName}</span>
                  </div>

                  {/* Price display block */}
                  <div className="mt-4 p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-gray-500">Precio por Kilo:</span>
                      <span className="text-xl font-bold text-gray-900">
                        S/ {item.pricePerKg.toFixed(2)}
                      </span>
                    </div>

                    {item.pricePerSaco !== undefined && (
                      <div className="flex items-baseline justify-between pt-1.5 border-t border-gray-200/70 text-xs">
                        <span className="text-gray-500">Saco 50 Kg (Aprox):</span>
                        <span className="font-bold text-gray-800">
                          S/ {item.pricePerSaco.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {item.pricePerJaba !== undefined && (
                      <div className="flex items-baseline justify-between pt-1.5 border-t border-gray-200/70 text-xs">
                        <span className="text-gray-500">Jaba 15-20 Kg:</span>
                        <span className="font-bold text-gray-800">
                          S/ {item.pricePerJaba.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {item.note && (
                    <p className="mt-2 text-[11px] text-gray-400 italic">
                      "{item.note}"
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{item.lastUpdated}</span>
                  </div>

                  <button
                    id={`order-from-card-${item.id}`}
                    type="button"
                    onClick={() => onMakeOrder(item.crop, item.variety)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Cotizar Pedido</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Information footer explaining MIDAGRI SISAP & DRAC sources */}
      <div className="bg-gray-100 rounded-xl p-4 border border-gray-200/70 text-xs text-gray-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="text-xs leading-relaxed">
            <strong className="text-gray-800 font-semibold">Fuentes Oficiales:</strong> Sistema de Información de Abastecimiento y Precios (MIDAGRI SISAP) • Dirección Regional de Agricultura Cajamarca (DRAC) • Sondeos directos en chacra.
          </span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium shrink-0">
          Precios referenciales sujetos a calidad y regateo de plaza.
        </span>
      </div>

    </div>
  );
};
