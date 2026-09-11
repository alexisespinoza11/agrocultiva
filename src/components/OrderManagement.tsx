import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, 
  FileText, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  Send, 
  Printer, 
  Download, 
  ArrowRight,
  Sparkles,
  Receipt,
  Calendar,
  Layers,
  Clock,
  Trash2,
  Lock,
  MessageCircle
} from 'lucide-react';
import { AllowedCrop, OrderUnit, OrderFormState, GeneratedOrder } from '../types';
import { CROP_VARIETIES, INITIAL_MARKET_PRICES } from '../data/agriculturalData';
import { CropPillSelector } from './CropPillSelector';
import { getOrdersFromSupabase, createOrderInSupabase, supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface OrderManagementProps {
  preselectedCrop?: AllowedCrop;
  preselectedVariety?: string;
  onOrderCreated?: (order: GeneratedOrder) => void;
}

// Número oficial de WhatsApp de AgroCultiva para recibir pedidos y consultas
// (Incluye código de país 51 para Perú seguido del número)
export const AGROCULTIVA_ADMIN_PHONE = '51987511421';

const STORAGE_KEY = 'agroscan_orders_v1';

export const OrderManagement: React.FC<OrderManagementProps> = ({
  preselectedCrop,
  preselectedVariety,
  onOrderCreated,
}) => {
  const [form, setForm] = useState<OrderFormState>({
    crop: preselectedCrop || 'Papa',
    variety: preselectedVariety || CROP_VARIETIES['Papa'][0],
    unit: 'Jabas',
    quantity: 50,
    originLocation: 'Bambamarca',
    destinationLocation: '',
    contactName: '',
    contactPhone: '',
    notes: '',
  });

  const [activeTicket, setActiveTicket] = useState<GeneratedOrder | null>(null);
  const [savedOrders, setSavedOrders] = useState<GeneratedOrder[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { user, profile } = useAuth();

  // Auto-completar datos si el usuario ha iniciado sesión
  useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        contactName: prev.contactName || profile.fullName || '',
        contactPhone: prev.contactPhone || profile.phone || '',
        contactRole: prev.contactRole || profile.role,
      }));
    }
  }, [profile]);

  // Load saved orders from Supabase (with localStorage fallback)
  useEffect(() => {
    async function loadOrders() {
      try {
        const cloudOrders = await getOrdersFromSupabase();
        if (cloudOrders && cloudOrders.length > 0) {
          setSavedOrders(cloudOrders);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudOrders));
          return;
        }
      } catch (err) {
        console.warn('Could not load orders from Supabase, trying localStorage', err);
      }
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSavedOrders(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Could not load orders from localStorage', e);
      }
    }
    loadOrders();
  }, []);

  // Update variety when crop changes
  const handleCropChange = (crop: AllowedCrop | 'Todos') => {
    if (crop === 'Todos') return;
    const varieties = CROP_VARIETIES[crop];
    setForm(prev => ({
      ...prev,
      crop,
      variety: varieties[0] || '',
      unit: prev.unit || 'Jabas',
    }));
  };

  // Sync if preselected props change
  useEffect(() => {
    if (preselectedCrop) {
      setForm(prev => ({
        ...prev,
        crop: preselectedCrop,
        variety: preselectedVariety || CROP_VARIETIES[preselectedCrop][0],
        unit: prev.unit || 'Jabas',
      }));
    }
  }, [preselectedCrop, preselectedVariety]);

  // Dynamic price calculation based on Ventana 2 market data
  const calculation = useMemo(() => {
    // Find matching price in reference list or fallback to average for that crop
    const matches = INITIAL_MARKET_PRICES.filter(p => p.crop === form.crop);
    const exactVarietyMatch = matches.find(p => p.variety.toLowerCase().includes(form.variety.toLowerCase())) || matches[0];
    
    const pricePerKg = exactVarietyMatch ? exactVarietyMatch.pricePerKg : 2.50;

    // Weight multiplier based on unit
    let approxWeightKg = 0;
    switch (form.unit) {
      case 'Kilogramos':
        approxWeightKg = form.quantity;
        break;
      case 'Jabas':
        approxWeightKg = form.quantity * 15; // standard 15kg jaba
        break;
      default:
        approxWeightKg = form.quantity;
        break;
    }

    const subtotalEstimate = approxWeightKg * pricePerKg;

    // Freight estimate based on weight and distance (approx S/ 0.22 per kg interprovincial)
    const isInterprovincial = (form.originLocation.toLowerCase().includes('cajamarca') || form.originLocation.toLowerCase().includes('bambamarca')) && 
                             (form.destinationLocation.toLowerCase().includes('lima') || form.destinationLocation.toLowerCase().includes('trujillo'));
    const freightPerKg = isInterprovincial ? 0.25 : 0.15;
    const freightEstimate = Math.round(approxWeightKg * freightPerKg);

    const totalEstimate = subtotalEstimate + freightEstimate;

    return {
      pricePerKg,
      approxWeightKg,
      subtotalEstimate,
      freightEstimate,
      totalEstimate,
      referenceMarket: exactVarietyMatch ? exactVarietyMatch.marketName : 'MIDAGRI Promedio',
    };
  }, [form.crop, form.variety, form.unit, form.quantity, form.originLocation, form.destinationLocation]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.contactName.trim()) errors.contactName = 'Ingrese el nombre de contacto.';
    if (!form.quantity || form.quantity <= 0) errors.quantity = 'La cantidad debe ser mayor a cero.';
    if (!form.originLocation.trim()) errors.originLocation = 'Indique la localidad de origen.';
    if (!form.destinationLocation.trim()) errors.destinationLocation = 'Indique la localidad de destino.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: GeneratedOrder = {
      id: 'order-' + Date.now(),
      orderNumber: `AGRO-PE-${randomNum}`,
      createdAt: new Date().toLocaleString('es-PE', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      crop: form.crop,
      variety: form.variety,
      unit: form.unit,
      quantity: form.quantity,
      approxWeightKg: calculation.approxWeightKg,
      unitPriceEstimate: calculation.pricePerKg,
      subtotalEstimate: calculation.subtotalEstimate,
      freightEstimate: calculation.freightEstimate,
      totalEstimate: calculation.totalEstimate,
      originLocation: form.originLocation,
      destinationLocation: form.destinationLocation,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      contactRole: form.contactRole,
      status: 'Generado',
      notes: form.notes,
    };

    let finalOrder = newOrder;
    try {
      finalOrder = await createOrderInSupabase(newOrder);
    } catch (dbErr) {
      console.warn('Could not save to Supabase, continuing with local state', dbErr);
    }

    const updated = [finalOrder, ...savedOrders.filter(o => o.id !== finalOrder.id)].slice(0, 15);
    setSavedOrders(updated);
    setActiveTicket(finalOrder);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('LocalStorage error', err);
    }

    if (onOrderCreated) {
      onOrderCreated(finalOrder);
    }
  };

  const deleteOrder = async (id: string) => {
    const updated = savedOrders.filter(o => o.id !== id);
    setSavedOrders(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      await supabase.from('orders').delete().eq('id', id);
    } catch (e) {
      console.warn('Error deleting from Supabase or localStorage', e);
    }
    if (activeTicket?.id === id) setActiveTicket(null);
  };

  const shareViaWhatsApp = (order: GeneratedOrder) => {
    const message = `*ORDEN DE PEDIDO AGRÍCOLA - AGROCULTIVA*
*Ticket N°:* ${order.orderNumber}
*Fecha:* ${order.createdAt}
----------------------------------------
*Cultivo:* ${order.crop} (${order.variety})
*Cantidad:* ${order.quantity} ${order.unit} (~${order.approxWeightKg.toLocaleString()} Kg)
*Origen:* ${order.originLocation}
*Destino:* ${order.destinationLocation}
----------------------------------------
*Valor Estimado:* S/ ${order.totalEstimate.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
*(Subtotal: S/ ${order.subtotalEstimate.toFixed(2)} + Flete: S/ ${order.freightEstimate.toFixed(2)})*
----------------------------------------
*Contacto:* ${order.contactName}
*Teléfono:* ${order.contactPhone}
${order.notes ? `*Sugerencias del Comprador:* ${order.notes}` : ''}

_Generado automáticamente mediante Agrocultiva_`;

    const encoded = encodeURIComponent(message);
    const adminPhoneClean = AGROCULTIVA_ADMIN_PHONE.replace(/\D/g, '');
    const url = adminPhoneClean ? `https://wa.me/${adminPhoneClean}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleDirectWhatsApp = () => {
    const buyerName = form.contactName.trim() || 'Comprador';
    const buyerPhone = form.contactPhone.trim() ? ` (Tel: ${form.contactPhone.trim()})` : '';
    const details = [
      `*CONSULTA DIRECTA - AGROCULTIVA*`,
      `Hola, me comunico desde la plataforma Agrocultiva para coordinar una compra.`,
      `----------------------------------------`,
      `*Cultivo:* ${form.crop} (${form.variety})`,
      `*Cantidad:* ${form.quantity} ${form.unit} (~${calculation.approxWeightKg.toLocaleString()} Kg)`,
      `*Origen:* ${form.originLocation}`,
      form.destinationLocation.trim() ? `*Destino:* ${form.destinationLocation.trim()}` : null,
      `*Estimado referencial:* S/ ${calculation.totalEstimate.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
      `----------------------------------------`,
      `*Comprador:* ${buyerName}${buyerPhone}`,
      form.notes.trim() ? `*Sugerencias:* ${form.notes.trim()}` : null,
      `\n_Generado automáticamente mediante Agrocultiva_`
    ].filter(Boolean).join('\n');

    const encoded = encodeURIComponent(details);
    const adminPhoneClean = AGROCULTIVA_ADMIN_PHONE.replace(/\D/g, '');
    const url = adminPhoneClean ? `https://wa.me/${adminPhoneClean}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Header banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold tracking-wider uppercase mb-2">
          <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
          Ventana 3 • Gestión y Cotización de Pedidos
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Emisión de Pedidos y Tickets Digitales
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
          Genera órdenes de compra o venta directa para <strong className="text-gray-800 font-semibold">Fresa, Aguaymanto, Papa y Cebolla</strong>. El cálculo se sincroniza en tiempo real con las cotizaciones de mercado vigentes en la Ventana 2.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Order Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
          <form onSubmit={handleSubmitOrder} className="space-y-5">
            
            {/* Step 1: Crop Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span>1. Producto del Catálogo Oficial:</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Estrictamente 4 cultivos</span>
              </label>
              <CropPillSelector
                selectedCrop={form.crop}
                onSelectCrop={handleCropChange}
                showAllOption={false}
              />
            </div>

            {/* Variety & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Variedad:
                </label>
                <select
                  id="order-variety-select"
                  value={form.variety}
                  onChange={(e) => setForm({ ...form, variety: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                >
                  {CROP_VARIETIES[form.crop].map((varName) => (
                    <option key={varName} value={varName}>
                      {varName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Unidad de Medida:
                </label>
                <select
                  id="order-unit-select"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value as OrderUnit })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                >
                  <option value="Kilogramos">Kilogramos (Kg)</option>
                  <option value="Jabas">Jabas (~15 Kg)</option>
                </select>
              </div>

            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Cantidad Solicitada:
              </label>
              <div className="relative">
                <input
                  id="order-quantity-input"
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                  {form.unit}
                </span>
              </div>
              {formErrors.quantity && <p className="text-xs text-red-600">{formErrors.quantity}</p>}
            </div>

            {/* Origin and Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Origen:</span>
                </label>
                <div className="relative">
                  <input
                    id="order-origin-input"
                    type="text"
                    readOnly
                    value="Bambamarca"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-100 text-xs sm:text-sm font-semibold text-gray-800 cursor-not-allowed select-none focus:outline-none"
                    title="Ubicación de origen fijada exclusivamente en Bambamarca"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] text-gray-400 font-medium select-none">
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Bloqueado</span>
                  </div>
                </div>
                {formErrors.originLocation && <p className="text-xs text-red-600">{formErrors.originLocation}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Destino:</span>
                </label>
                <input
                  id="order-destination-input"
                  type="text"
                  placeholder="Ej. Lima - GMML Santa Anita"
                  value={form.destinationLocation}
                  onChange={(e) => setForm({ ...form, destinationLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
                {formErrors.destinationLocation && <p className="text-xs text-red-600">{formErrors.destinationLocation}</p>}
              </div>

            </div>

            {/* Contact Information */}
            <div className="pt-2 border-t border-gray-100 space-y-4">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Datos de Contacto del Responsable:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600">Nombre Completo del Solicitante:</label>
                  <input
                    id="order-contact-name-input"
                    type="text"
                    placeholder="Ej. Alexis Espinoza"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  {formErrors.contactName && <p className="text-xs text-red-600">{formErrors.contactName}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600">Atención Directa:</label>
                  <button
                    id="contact-whatsapp-direct-btn"
                    type="button"
                    onClick={handleDirectWhatsApp}
                    className="w-full h-[38px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs hover:shadow cursor-pointer"
                    title="Escribir directamente al productor por WhatsApp con los datos del pedido"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-100" />
                    <span>Contactar por WhatsApp</span>
                  </button>
                </div>

              </div>

              {/* Buyer Suggestions */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600">Sugerencias del Comprador:</label>
                <textarea
                  id="order-notes-textarea"
                  rows={2}
                  placeholder="Ej. Preferencias de calibre, empaque, horario o indicaciones especiales de entrega..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

            </div>

            {/* Submit button */}
            <div className="pt-3">
              <button
                id="generate-order-ticket-btn"
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>Confirmar y Generar Ticket Digital de Pedido</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right column: Live calculation & Digital Ticket (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Real-time price breakdown card */}
          <div className="bg-gray-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm tracking-wide">Cálculo de Cotización en Vivo</h3>
              </div>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-gray-800 text-emerald-400 border border-gray-700">
                Sincronizado con Ventana 2
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Cultivo Seleccionado:</span>
                <span className="font-semibold text-white">{form.crop} - {form.variety}</span>
              </div>
              <div className="flex justify-between">
                <span>Volumen:</span>
                <span className="font-semibold text-white">{form.quantity} {form.unit} (~{calculation.approxWeightKg.toLocaleString()} Kg)</span>
              </div>
              <div className="flex justify-between">
                <span>Precio Unitario Ref.:</span>
                <span className="font-semibold text-white">S/ {calculation.pricePerKg.toFixed(2)} / Kg</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal en Chacra / Mercado:</span>
                <span className="font-semibold text-white">S/ {calculation.subtotalEstimate.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Flete Terrestre Estimado:</span>
                <span>+ S/ {calculation.freightEstimate.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-baseline justify-between">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">VALOR TOTAL ESTIMADO:</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-emerald-400 font-mono">
                    S/ {calculation.totalEstimate.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-[10px] text-gray-400">En Soles Peruanos (PEN)</p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 border-t border-gray-800 pt-2 leading-relaxed">
              * Cálculo referencial según el Sistema de Abastecimiento MIDAGRI y DRAC Cajamarca. El precio final se pacta entre las partes durante el cierre comercial.
            </p>
          </div>

          {/* Active Ticket Display */}
          {activeTicket && (
            <div 
              id="digital-ticket-view"
              className="bg-white rounded-2xl border border-emerald-500/50 p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    🇵🇪
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Ticket Digital de Pedido</h4>
                    <p className="text-[10px] text-gray-400 font-mono">{activeTicket.orderNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{activeTicket.status}</span>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha y Hora:</span>
                  <span className="font-medium text-gray-800">{activeTicket.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Producto:</span>
                  <span className="font-bold text-gray-900">{activeTicket.crop} ({activeTicket.variety})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Volumen:</span>
                  <span className="font-bold text-gray-900">{activeTicket.quantity} {activeTicket.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ruta:</span>
                  <span className="font-medium text-gray-800">{activeTicket.originLocation} ➔ {activeTicket.destinationLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contacto:</span>
                  <span className="font-medium text-gray-800">{activeTicket.contactName} ({activeTicket.contactPhone})</span>
                </div>
                {activeTicket.notes && (
                  <div className="pt-1.5 border-t border-gray-200/70 text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">Sugerencias: </span>
                    <span>{activeTicket.notes}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-gray-200/70 font-bold text-gray-900 text-sm">
                  <span>Monto Total:</span>
                  <span className="text-emerald-700">S/ {activeTicket.totalEstimate.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Barcode visual representation */}
              <div className="py-2 px-4 rounded-lg bg-gray-100 flex flex-col items-center justify-center space-y-1">
                <div className="h-5 w-4/5 flex items-stretch gap-1">
                  {[4,2,3,1,5,2,4,1,3,2,5,1,4,3,2,4,1,5,3,2].map((w, idx) => (
                    <div 
                      key={idx} 
                      className={`rounded-xs flex-1 ${idx % 3 === 0 ? 'bg-gray-800' : 'bg-gray-600'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono tracking-widest text-gray-400">
                  {activeTicket.orderNumber}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  id="share-whatsapp-btn"
                  type="button"
                  onClick={() => shareViaWhatsApp(activeTicket)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar WhatsApp</span>
                </button>

                <button
                  id="print-ticket-btn"
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Ticket</span>
                </button>
              </div>

            </div>
          )}

          {/* Recent Orders History */}
          {savedOrders.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Pedidos Recientes Guardados ({savedOrders.length})</span>
                </h4>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {savedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setActiveTicket(ord)}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between text-xs ${
                      activeTicket?.id === ord.id
                        ? 'border-emerald-500 bg-emerald-50/40'
                        : 'border-gray-100 bg-gray-50 hover:bg-gray-100/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900">{ord.crop}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-600">{ord.quantity} {ord.unit}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{ord.orderNumber} • {ord.createdAt.split(',')[0]}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-700">
                        S/ {ord.totalEstimate.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteOrder(ord.id); }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Eliminar pedido"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
