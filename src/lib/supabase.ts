import { createClient } from '@supabase/supabase-js';
import { GeneratedOrder, DiagnosisResult, AllowedCrop, OrderUnit } from '../types';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {}) as any;

// Credentials are read from VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars (see .env)
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://wxyenmunawsqjqmsaqpq.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4eWVubXVuYXdzcWpxbXNhcXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNzQyNjEsImV4cCI6MjEwNDY1MDI2MX0.ndiXLSRw_-FODLpyLXCDVKD68wacfUDnJNmUvH4zejU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Invoca la Edge Function "diagnose" desplegada en Supabase Edge Runtime
 * y persiste el resultado en la tabla "diagnoses".
 */
export async function runCropDiagnosis(payload: {
  imageBase64?: string;
  mimeType?: string;
  sampleId?: string;
  notes?: string;
}): Promise<DiagnosisResult> {
  const apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;

  // Invocar Supabase Edge Function
  const { data, error } = await supabase.functions.invoke<DiagnosisResult>('diagnose', {
    body: {
      ...payload,
      geminiApiKey: apiKey,
    },
  });

  if (error) {
    console.error('Error invoking Supabase diagnose Edge Function:', error);
    // Fallback: Si la función responde un error pero trae data
    if (!data) {
      throw new Error(error.message || 'Error al conectar con la Edge Function de Supabase.');
    }
  }

  const result: DiagnosisResult = data as DiagnosisResult;

  // Persistir en Supabase Database (asíncrono sin bloquear la respuesta)
  try {
    if (result && result.detectedCrop) {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from('diagnoses').insert({
        crop: result.detectedCrop,
        scientific_crop_name: result.scientificCropName || null,
        health_status: result.healthStatus,
        disease_common_name: result.diseaseOrPestCommonName,
        disease_scientific_name: result.diseaseOrPestScientificName,
        severity: result.severity,
        confidence_percentage: result.confidencePercentage,
        symptoms_description: result.symptomsDescription,
        alert_level: result.alertLevel,
        organic_control: result.organicControl || [],
        chemical_control: result.chemicalControl || [],
        preventive_tips: result.preventionAndCulturalTips || [],
        rejection_reason: result.rejectionReason || null,
        notes: payload.notes || null,
        user_id: userData?.user?.id || null,
      });
    }
  } catch (dbErr) {
    console.warn('Could not persist diagnosis to Supabase table:', dbErr);
  }

  return result;
}

/**
 * Obtiene la lista de pedidos desde la tabla "orders" de Supabase
 */
export async function getOrdersFromSupabase(): Promise<GeneratedOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders from Supabase:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    crop: row.crop as AllowedCrop,
    variety: row.variety,
    unit: row.unit as OrderUnit,
    quantity: Number(row.quantity),
    approxWeightKg: Number(row.approx_weight_kg),
    unitPriceEstimate: Number(row.unit_price_estimate),
    subtotalEstimate: Number(row.subtotal_estimate),
    freightEstimate: Number(row.freight_estimate),
    totalEstimate: Number(row.total_estimate),
    originLocation: row.origin_location,
    destinationLocation: row.destination_location,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactRole: row.contact_role,
    status: row.status,
    notes: row.notes,
  }));
}

/**
 * Guarda un nuevo pedido en la tabla "orders" de Supabase
 */
export async function createOrderInSupabase(order: GeneratedOrder): Promise<GeneratedOrder> {
  const { data: userData } = await supabase.auth.getUser();

  const payload = {
    order_number: order.orderNumber,
    crop: order.crop,
    variety: order.variety,
    unit: order.unit,
    quantity: order.quantity,
    approx_weight_kg: order.approxWeightKg,
    unit_price_estimate: order.unitPriceEstimate,
    subtotal_estimate: order.subtotalEstimate,
    freight_estimate: order.freightEstimate,
    total_estimate: order.totalEstimate,
    origin_location: order.originLocation,
    destination_location: order.destinationLocation,
    contact_name: order.contactName,
    contact_phone: order.contactPhone,
    contact_role: order.contactRole,
    status: order.status,
    notes: order.notes,
    user_id: userData?.user?.id || null,
  };

  const { data, error } = await supabase
    .from('orders')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating order in Supabase:', error);
    throw error;
  }

  return {
    ...order,
    id: data.id,
    createdAt: data.created_at,
  };
}

/**
 * Actualiza el estado de un pedido en Supabase
 */
export async function updateOrderStatusInSupabase(
  orderId: string,
  newStatus: GeneratedOrder['status']
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status in Supabase:', error);
    throw error;
  }
}
