import { MarketPriceRecord, SamplePestCase, AllowedCrop } from '../types';

export const TODAY_DATE_STR = 'Hoy, ' + new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

export const INITIAL_MARKET_PRICES: MarketPriceRecord[] = [
  // PAPA - CAJAMARCA
  {
    id: 'papa-caj-1',
    crop: 'Papa',
    variety: 'Papa Amarilla Tumbay',
    region: 'Cajamarca',
    marketName: 'Mercado Mayorista San Antonio (Cajamarca)',
    pricePerKg: 3.20,
    pricePerSaco: 155.00,
    trend: 'up',
    trendPercent: 4.8,
    lastUpdated: TODAY_DATE_STR,
    source: 'DRAC Cajamarca / Sondeo local',
    note: 'Alta demanda en ferias agropecuarias locales.'
  },
  {
    id: 'papa-caj-2',
    crop: 'Papa',
    variety: 'Papa Canchán / Color',
    region: 'Cajamarca',
    marketName: 'Venta en Chacra (Valle de Condebamba / Cutervo)',
    pricePerKg: 1.45,
    pricePerSaco: 70.00,
    trend: 'stable',
    trendPercent: 0.0,
    lastUpdated: TODAY_DATE_STR,
    source: 'Asociación de Productores de Cutervo',
    note: 'Cosecha fresca en pie de campo.'
  },
  {
    id: 'papa-caj-3',
    crop: 'Papa',
    variety: 'Papa Huamantanga',
    region: 'Cajamarca',
    marketName: 'Mercado Central de Chota',
    pricePerKg: 2.80,
    pricePerSaco: 135.00,
    trend: 'down',
    trendPercent: -3.5,
    lastUpdated: TODAY_DATE_STR,
    source: 'DRAC Cajamarca',
    note: 'Buen ingreso de tubérculos de altura.'
  },

  // PAPA - LIMA CAPITAL
  {
    id: 'papa-lim-1',
    crop: 'Papa',
    variety: 'Papa Canchán',
    region: 'Lima Capital',
    marketName: 'Gran Mercado Mayorista de Lima (Santa Anita - GMML)',
    pricePerKg: 1.95,
    pricePerSaco: 95.00,
    trend: 'up',
    trendPercent: 2.6,
    lastUpdated: TODAY_DATE_STR,
    source: 'MIDAGRI - SISAP GMML',
    note: 'Ingreso promedio de 620 toneladas hoy.'
  },
  {
    id: 'papa-lim-2',
    crop: 'Papa',
    variety: 'Papa Amarilla Tumbay',
    region: 'Lima Capital',
    marketName: 'Gran Mercado Mayorista de Lima (Santa Anita - GMML)',
    pricePerKg: 3.90,
    pricePerSaco: 190.00,
    trend: 'stable',
    trendPercent: 0.5,
    lastUpdated: TODAY_DATE_STR,
    source: 'MIDAGRI - SISAP GMML',
    note: 'Calidad extra seleccionada.'
  },
  {
    id: 'papa-lim-3',
    crop: 'Papa',
    variety: 'Papa Yungay',
    region: 'Lima Capital',
    marketName: 'C.C. Minka (Callao - Puesto Mayorista)',
    pricePerKg: 1.80,
    pricePerSaco: 88.00,
    trend: 'down',
    trendPercent: -2.1,
    lastUpdated: TODAY_DATE_STR,
    source: 'Sondeo Minka Callao'
  },

  // PAPA - OTRAS REGIONES
  {
    id: 'papa-otr-1',
    crop: 'Papa',
    variety: 'Papa Canchán / Perricholi',
    region: 'Otras Regiones',
    marketName: 'Mercado Mayorista La Hermelinda (Trujillo - La Libertad)',
    pricePerKg: 1.85,
    pricePerSaco: 90.00,
    trend: 'stable',
    trendPercent: 0.2,
    lastUpdated: TODAY_DATE_STR,
    source: 'GRALL La Libertad'
  },
  {
    id: 'papa-otr-2',
    crop: 'Papa',
    variety: 'Papa Huayro / Peruanita',
    region: 'Otras Regiones',
    marketName: 'Mercado Mayorista de Huancayo (Junín)',
    pricePerKg: 2.60,
    pricePerSaco: 128.00,
    trend: 'up',
    trendPercent: 3.2,
    lastUpdated: TODAY_DATE_STR,
    source: 'DRA Junín'
  },

  // CEBOLLA CHINA - CAJAMARCA
  {
    id: 'ceb-caj-1',
    crop: 'Cebolla China',
    variety: 'Cebolla China Criolla (Atado fresco)',
    region: 'Cajamarca',
    marketName: 'Mercado Central de Cajamarca',
    pricePerKg: 2.80,
    pricePerJaba: 42.00,
    trend: 'up',
    trendPercent: 5.1,
    lastUpdated: TODAY_DATE_STR,
    source: 'DRAC Cajamarca',
    note: 'Tallos frescos de valles interandinos.'
  },
  {
    id: 'ceb-caj-2',
    crop: 'Cebolla China',
    variety: 'Cebolla China en Chacra',
    region: 'Cajamarca',
    marketName: 'Venta en Chacra (Valle Llacanora / Jesús)',
    pricePerKg: 2.00,
    pricePerJaba: 30.00,
    trend: 'stable',
    trendPercent: 0.0,
    lastUpdated: TODAY_DATE_STR,
    source: 'Asoc. Horticultores Jesús'
  },

  // CEBOLLA CHINA - LIMA CAPITAL
  {
    id: 'ceb-lim-1',
    crop: 'Cebolla China',
    variety: 'Cebolla China Verde Extra',
    region: 'Lima Capital',
    marketName: 'Gran Mercado Mayorista de Lima (Santa Anita - GMML)',
    pricePerKg: 2.50,
    pricePerJaba: 38.00,
    trend: 'down',
    trendPercent: -4.3,
    lastUpdated: TODAY_DATE_STR,
    source: 'MIDAGRI - SISAP GMML',
    note: 'Ingreso matutino de atados frescos del valle Chillón y Lurín.'
  },
  {
    id: 'ceb-lim-2',
    crop: 'Cebolla China',
    variety: 'Cebolla China Calidad Supermercado',
    region: 'Lima Capital',
    marketName: 'C.C. Minka (Callao)',
    pricePerKg: 3.50,
    pricePerJaba: 52.00,
    trend: 'stable',
    trendPercent: 0.0,
    lastUpdated: TODAY_DATE_STR,
    source: 'Sondeo Minka'
  },

  // CEBOLLA CHINA - OTRAS REGIONES
  {
    id: 'ceb-otr-1',
    crop: 'Cebolla China',
    variety: 'Cebolla China Valle Verde',
    region: 'Otras Regiones',
    marketName: 'Mercado Mayorista Río Seco (Arequipa)',
    pricePerKg: 2.20,
    pricePerJaba: 35.00,
    trend: 'down',
    trendPercent: -3.0,
    lastUpdated: TODAY_DATE_STR,
    source: 'DRA Arequipa'
  },
  {
    id: 'ceb-otr-2',
    crop: 'Cebolla China',
    variety: 'Cebolla China del Norte',
    region: 'Otras Regiones',
    marketName: 'Mercado Moshoqueque (Chiclayo - Lambayeque)',
    pricePerKg: 2.60,
    pricePerJaba: 40.00,
    trend: 'up',
    trendPercent: 2.5,
    lastUpdated: TODAY_DATE_STR,
    source: 'DRA Lambayeque'
  },

  // FRESA - CAJAMARCA
  {
    id: 'fresa-caj-1',
    crop: 'Fresa',
    variety: 'Fresa San Andreas / Sabrina',
    region: 'Cajamarca',
    marketName: 'Mercado San Antonio (Cajamarca)',
    pricePerKg: 6.50,
    pricePerJaba: 95.00, // 15kg
    trend: 'up',
    trendPercent: 6.2,
    lastUpdated: TODAY_DATE_STR,
    source: 'Sondeo Valles de Cajamarca',
    note: 'Fruta de primera calidad cosechada en altura.'
  },
  {
    id: 'fresa-caj-2',
    crop: 'Fresa',
    variety: 'Fresa Selección en Chacra',
    region: 'Cajamarca',
    marketName: 'Venta en Chacra (Baños del Inca / Encañada)',
    pricePerKg: 4.80,
    pricePerJaba: 72.00,
    trend: 'stable',
    trendPercent: 0.0,
    lastUpdated: TODAY_DATE_STR,
    source: 'Productores Baños del Inca'
  },

  // FRESA - LIMA CAPITAL
  {
    id: 'fresa-lim-1',
    crop: 'Fresa',
    variety: 'Fresa San Andreas',
    region: 'Lima Capital',
    marketName: 'Mercado Mayorista de Frutas N° 2 (San Luis - Lima)',
    pricePerKg: 5.40,
    pricePerJaba: 80.00,
    trend: 'down',
    trendPercent: -3.6,
    lastUpdated: TODAY_DATE_STR,
    source: 'MIDAGRI - SISAP Frutas',
    note: 'Ingreso regular desde Huaral y Huacho.'
  },
  {
    id: 'fresa-lim-2',
    crop: 'Fresa',
    variety: 'Fresa Camarosa / Sabrina',
    region: 'Lima Capital',
    marketName: 'C.C. Minka (Callao - Sector Frutas)',
    pricePerKg: 6.20,
    pricePerJaba: 90.00,
    trend: 'stable',
    trendPercent: 0.8,
    lastUpdated: TODAY_DATE_STR,
    source: 'Sondeo Minorista Lima'
  },

  // FRESA - OTRAS REGIONES
  {
    id: 'fresa-otr-1',
    crop: 'Fresa',
    variety: 'Fresa de Selección',
    region: 'Otras Regiones',
    marketName: 'Mercado La Hermelinda (Trujillo - La Libertad)',
    pricePerKg: 5.80,
    pricePerJaba: 86.00,
    trend: 'up',
    trendPercent: 2.1,
    lastUpdated: TODAY_DATE_STR,
    source: 'Sondeo La Hermelinda'
  },

  // AGUAYMANTO - CAJAMARCA
  {
    id: 'aguay-caj-1',
    crop: 'Aguaymanto',
    variety: 'Aguaymanto Ecotipo Cajamarca (Con Capacho)',
    region: 'Cajamarca',
    marketName: 'Mercado Mayorista San Antonio (Cajamarca)',
    pricePerKg: 5.20,
    pricePerJaba: 75.00, // 15kg
    trend: 'up',
    trendPercent: 5.0,
    lastUpdated: TODAY_DATE_STR,
    source: 'DRAC Cajamarca / Mesa del Aguaymanto',
    note: 'Cajamarca es el principal productor nacional con frutos de alto brix.'
  },
  {
    id: 'aguay-caj-2',
    crop: 'Aguaymanto',
    variety: 'Aguaymanto en Chacra (Descapachado Selección)',
    region: 'Cajamarca',
    marketName: 'Venta en Chacra (San Marcos / Celendín)',
    pricePerKg: 4.30,
    pricePerJaba: 62.00,
    trend: 'stable',
    trendPercent: 0.0,
    lastUpdated: TODAY_DATE_STR,
    source: 'Cooperativa de Productores San Marcos',
    note: 'Acopio para transformación y mercado fresco.'
  },

  // AGUAYMANTO - LIMA CAPITAL
  {
    id: 'aguay-lim-1',
    crop: 'Aguaymanto',
    variety: 'Aguaymanto Seleccionado Fresco',
    region: 'Lima Capital',
    marketName: 'Mercado Mayorista de Frutas N° 2 (San Luis - Lima)',
    pricePerKg: 7.50,
    pricePerJaba: 110.00,
    trend: 'up',
    trendPercent: 3.4,
    lastUpdated: TODAY_DATE_STR,
    source: 'MIDAGRI - SISAP Frutas',
    note: 'Gran demanda por restaurantes y plantas de néctar.'
  },
  {
    id: 'aguay-lim-2',
    crop: 'Aguaymanto',
    variety: 'Aguaymanto con cáliz ecológico',
    region: 'Lima Capital',
    marketName: 'Mercados Especializados / Minoristas Lima Top',
    pricePerKg: 8.80,
    pricePerJaba: 128.00,
    trend: 'stable',
    trendPercent: 0.0,
    lastUpdated: TODAY_DATE_STR,
    source: 'Sondeo EcoMercados Lima'
  },

  // AGUAYMANTO - OTRAS REGIONES
  {
    id: 'aguay-otr-1',
    crop: 'Aguaymanto',
    variety: 'Aguaymanto Andino',
    region: 'Otras Regiones',
    marketName: 'Mercado Mayorista de Huancayo (Junín)',
    pricePerKg: 6.80,
    pricePerJaba: 98.00,
    trend: 'down',
    trendPercent: -2.2,
    lastUpdated: TODAY_DATE_STR,
    source: 'DRA Junín'
  }
];

export const CROP_VARIETIES: Record<AllowedCrop, string[]> = {
  Papa: [
    'Papa Canchán',
    'Papa Amarilla Tumbay',
    'Papa Yungay',
    'Papa Huamantanga',
    'Papa Perricholi',
    'Papa Huayro / Peruanita'
  ],
  'Cebolla China': [
    'Cebolla China Criolla (Atado)',
    'Cebolla China Verde Extra',
    'Cebolla China Tallo Blanco',
    'Cebolla China Calidad Supermercado'
  ],
  Fresa: [
    'Fresa San Andreas',
    'Fresa Camarosa',
    'Fresa Sabrina'
  ],
  Aguaymanto: [
    'Aguaymanto Ecotipo Cajamarca (con capacho)',
    'Aguaymanto Descapachado (calidad exportación)',
    'Aguaymanto Silvestre Andino',
    'Aguaymanto Ecológico Certificado'
  ]
};

export const SAMPLE_PEST_CASES: SamplePestCase[] = [
  {
    id: 'sample-papa-rancha',
    crop: 'Papa',
    title: 'Rancha / Tizón Tardío en Papa',
    pestName: 'Phytophthora infestans',
    severity: 'Crítico',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    description: 'Manchas foliares pardas acuosas de rápida expansión con halo clorótico amarillento en follaje de papa andina.'
  },
  {
    id: 'sample-cebolla-mildiu',
    crop: 'Cebolla China',
    title: 'Mildiu Velloso en Cebolla China',
    pestName: 'Peronospora destructor',
    severity: 'Moderado',
    imageUrl: '/cebolla_china_sample.png',
    description: 'Lesiones alargadas de color pálido y secado apical en las hojas tubulares de cebolla china con pelusilla violácea-grisácea.'
  },
  {
    id: 'sample-fresa-botrytis',
    crop: 'Fresa',
    title: 'Moho Gris / Botrytis en Fresa',
    pestName: 'Botrytis cinerea',
    severity: 'Crítico',
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80',
    description: 'Pudrición blanda con masa de esporas color gris cenizo cubriendo el cáliz y frutos maduros de fresa.'
  },
  {
    id: 'sample-aguaymanto-gusano',
    crop: 'Aguaymanto',
    title: 'Gusano del Fruto en Aguaymanto',
    pestName: 'Heliothis subflexa',
    severity: 'Moderado',
    imageUrl: '/aguaymanto_sample.jpg',
    description: 'Perforaciones redondeadas en el capacho o cáliz protector y excrementos dentro del fruto de aguaymanto.'
  }
];

export const AGRONOMIC_REJECTED_MESSAGE = 
  '⚠️ MUESTRA NO ADMITIDA: Agrocultiva está 100% enfocado y estrictamente limitado al catálogo de 4 productos: Fresa, Aguaymanto, Papa y Cebolla China. La imagen o consulta proporcionada no corresponde a ninguno de estos cultivos oficiales.';
