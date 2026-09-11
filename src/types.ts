export type AllowedCrop = 'Fresa' | 'Aguaymanto' | 'Papa' | 'Cebolla';

export const ALLOWED_CROPS: { id: AllowedCrop; name: string; scientific: string; icon: string; category: string; description: string }[] = [
  {
    id: 'Fresa',
    name: 'Fresa',
    scientific: 'Fragaria × ananassa',
    icon: '🍓',
    category: 'Frutales menores',
    description: 'Cultivo intensivo de alta rotación en valles interandinos y costa central.'
  },
  {
    id: 'Aguaymanto',
    name: 'Aguaymanto',
    scientific: 'Physalis peruviana',
    icon: '🟡',
    category: 'Superfrutas andinas',
    description: 'Fruto andino nativo con alto valor en fresco y agroexportación.'
  },
  {
    id: 'Papa',
    name: 'Papa',
    scientific: 'Solanum tuberosum',
    icon: '🥔',
    category: 'Tubérculos andinos',
    description: 'Base de la seguridad alimentaria con variedades nativas y comerciales.'
  },
  {
    id: 'Cebolla',
    name: 'Cebolla',
    scientific: 'Allium cepa',
    icon: '🧅',
    category: 'Hortalizas de bulbo',
    description: 'Hortaliza fundamental con fuerte dinámica en Arequipa y el norte peruano.'
  }
];

export type SeverityLevel = 'Bajo' | 'Moderado' | 'Crítico' | 'Saludable';

export interface DiagnosisResult {
  isAllowedCrop: boolean;
  detectedCrop?: AllowedCrop | string;
  scientificCropName?: string;
  healthStatus: 'Enfermo/Plaga' | 'Saludable' | 'No Identificado';
  diseaseOrPestCommonName: string;
  diseaseOrPestScientificName: string;
  severity: SeverityLevel;
  confidencePercentage: number;
  symptomsDescription: string;
  alertLevel: 'green' | 'yellow' | 'orange' | 'red';
  organicControl: string[];
  chemicalControl: string[];
  preventionAndCulturalTips: string[];
  rejectionReason?: string;
  imageUrl?: string;
  timestamp: string;
}

export type MarketRegion = 'Cajamarca' | 'Lima Capital' | 'Otras Regiones';

export interface MarketPriceRecord {
  id: string;
  crop: AllowedCrop;
  variety: string;
  region: MarketRegion;
  marketName: string;
  pricePerKg: number;
  pricePerSaco?: number; // 50kg for potato/onion
  pricePerJaba?: number; // 15-20kg for strawberry/aguaymanto
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  lastUpdated: string;
  source: string;
  note?: string;
}

export type UserRole = 'Agricultor Productor' | 'Comerciante Acopiador' | 'Comprador Mayorista';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export type OrderUnit = 'Kilogramos' | 'Jabas' | 'Sacos' | 'Toneladas';

export interface OrderFormState {
  crop: AllowedCrop;
  variety: string;
  unit: OrderUnit;
  quantity: number;
  originLocation: string;
  destinationLocation: string;
  contactName: string;
  contactPhone: string;
  contactRole?: 'Agricultor Productor' | 'Comerciante Acopiador' | 'Comprador Mayorista';
  notes?: string;
}

export interface GeneratedOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  crop: AllowedCrop;
  variety: string;
  unit: OrderUnit;
  quantity: number;
  approxWeightKg: number;
  unitPriceEstimate: number;
  subtotalEstimate: number;
  freightEstimate: number;
  totalEstimate: number;
  originLocation: string;
  destinationLocation: string;
  contactName: string;
  contactPhone: string;
  contactRole?: string;
  status: 'Generado' | 'En Negociación' | 'Confirmado' | 'Completado';
  notes?: string;
}

export interface SamplePestCase {
  id: string;
  crop: AllowedCrop;
  title: string;
  pestName: string;
  severity: SeverityLevel;
  imageUrl: string;
  description: string;
}
