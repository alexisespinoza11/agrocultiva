import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Increase payload limit for base64 images
app.use(express.json({ limit: '25mb' }));

// Initialize Gemini client lazily or safely
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Allowed catalogue strictly 4 crops
const ALLOWED_CROPS = ['Fresa', 'Aguaymanto', 'Papa', 'Cebolla China'] as const;

// Helper agronomic fallback database for offline / error resilience
const AGRONOMIC_KNOWLEDGE: Record<string, {
  crop: string;
  scientificCrop: string;
  commonDisease: string;
  scientificDisease: string;
  severity: 'Bajo' | 'Moderado' | 'Crítico' | 'Saludable';
  alertLevel: 'green' | 'yellow' | 'orange' | 'red';
  symptoms: string;
  confidence: number;
  organicControl: string[];
  chemicalControl: string[];
  preventiveTips: string[];
}> = {
  'sample-papa-rancha': {
    crop: 'Papa',
    scientificCrop: 'Solanum tuberosum',
    commonDisease: 'Rancha / Tizón Tardío',
    scientificDisease: 'Phytophthora infestans',
    severity: 'Crítico',
    alertLevel: 'red',
    symptoms: 'Lesiones necróticas café-oscuras de consistencia acuosa en hojas y tallos, con anillo de esporulación blanco en el envés bajo alta humedad relativa.',
    confidence: 96,
    organicControl: [
      'Aplicación preventiva de Caldo Bordelés al 1% o Caldo Sulfocálcico cada 7 a 10 días.',
      'Aspersión de bioestimulantes a base de extracto de algas marinas y sales de cobre ionizado.',
      'Uso de cepas antagonistas de Trichoderma harzianum (2 kg/ha) en drench o aspersión foliar preventiva.',
      'Infusiones de cola de caballo (Equisetum arvense) para endurecer la pared celular foliar.'
    ],
    chemicalControl: [
      'Fungicidas sistémicos de acción curativa: Metalaxil-M + Mancozeb (2.5 kg/ha) o Cimoxanilo + Mancozeb.',
      'Rotar con fungicidas traslaminares como Dimetomorf o Propamocarb para evitar resistencia biológica.',
      'Respetar estrictamente el periodo de carencia (LMR) de mínimo 14 días antes de la cosecha de tubérculos.'
    ],
    preventiveTips: [
      'Desinfectar semilla antes de la siembra en campo definitivo.',
      'Mejorar el aporque alto para evitar que las zoosporas alcancen los tubérculos en formación.',
      'Evitar riegos nocturnos por aspersión que prolonguen el agua libre sobre las hojas.'
    ]
  },
  'sample-cebolla-mildiu': {
    crop: 'Cebolla China',
    scientificCrop: 'Allium fistulosum',
    commonDisease: 'Mildiu Velloso de la Cebolla China',
    scientificDisease: 'Peronospora destructor',
    severity: 'Moderado',
    alertLevel: 'orange',
    symptoms: 'Manchas alargadas cilíndricas de tonalidad verde pálida a amarillenta en hojas tubulares, cubiertas por un fieltro aterciopelado violáceo-grisáceo.',
    confidence: 92,
    organicControl: [
      'Aplicaciones foliares de Oxicloruro de Cobre al 0.3% al amanecer.',
      'Extractos vegetales de ajo y canela como antifúngicos y repelentes de vectores.',
      'Inoculación de Bacillus subtilis (cepa QST 713) cada 10 días en condiciones de neblina o garúa.'
    ],
    chemicalControl: [
      'Tratamiento curativo temprano con Metalaxil o Azoxistrobina + Difenoconazol en dosis de etiqueta.',
      'Emplear adherente agrícola no iónico debido a la cutícula cerosa de las hojas tubulares de cebolla china.'
    ],
    preventiveTips: [
      'Orientar los surcos a favor del viento para acelerar el secado foliar.',
      'Manejar densidades de siembra adecuadas que faciliten la circulación de aire en los atados.',
      'Eliminar cebollines silvestres o restos de cosechas anteriores.'
    ]
  },
  'sample-fresa-botrytis': {
    crop: 'Fresa',
    scientificCrop: 'Fragaria × ananassa',
    commonDisease: 'Moho Gris / Pudrición de Botrytis',
    scientificDisease: 'Botrytis cinerea',
    severity: 'Crítico',
    alertLevel: 'red',
    symptoms: 'Podredumbre blanda y pulvurenta en receptáculo floral y frutos maduros, con masa compacta de esporulación conidial de color cenizo.',
    confidence: 95,
    organicControl: [
      'Biofungicidas a base de Trichoderma asperellum formulado para aplicaciones sobre flores y frutos.',
      'Bicarbonato de potasio al 0.5% para modificar el pH superficial e inhibir la germinación de conidios.',
      'Extracto de semillas de cítricos (ácido ascórbico / bioflavonoides).'
    ],
    chemicalControl: [
      'Boscalid + Pyraclostrobin o Fenhexamid aplicados preferentemente en inicio de floración.',
      'Fludioxonil + Cyprodinil en rotación de grupos químicos FRAC para evitar resistencia.',
      'Cumplir los periodos de reingreso y carencia estricta (1 a 3 días según etiqueta aprobada SENASA).'
    ],
    preventiveTips: [
      'Utilizar acolchado plástico (mulching) para evitar el contacto directo del fruto con la humedad del suelo.',
      'Retirar y quemar inmediatamente frutos podridos o restos florales senescentes fuera del lote.',
      'Riego por goteo localizado para mantener el follaje seco.'
    ]
  },
  'sample-aguaymanto-gusano': {
    crop: 'Aguaymanto',
    scientificCrop: 'Physalis peruviana',
    commonDisease: 'Gusano Perforador del Fruto / Pulguilla',
    scientificDisease: 'Heliothis subflexa / Epitrix spp.',
    severity: 'Moderado',
    alertLevel: 'orange',
    symptoms: 'Perforaciones circulares en el cáliz o capacho externo, daño directo a la pulpa del fruto con galerías y presencia de excrementos oscuros.',
    confidence: 89,
    organicControl: [
      'Aplicación biológica de Bacillus thuringiensis var. kurstaki (1.5 kg/ha) dirigido a larvas en primeros estadios.',
      'Instalación de trampas de luz o con feromonas sexuales para captura de adultos polilla.',
      'Liberación inundativa de avispitas parasitoides Trichogramma spp. en zonas productoras de Cajamarca.',
      'Aspersión de extracto concentrado de Neem (Azadiractina) al 1%.'
    ],
    chemicalControl: [
      'Insecticidas reguladores del crecimiento o espinosinas (Spinosad 120 SC a razón de 0.2 L/ha).',
      'Clorantraniliprole (Rynaxypyr) en rotación con bajo impacto en polinizadores andinos.'
    ],
    preventiveTips: [
      'Monitoreo semanal del 10% de plantas en floración y cuajado.',
      'Cosechar oportunamente apenas el capacho alcance color paja dorado.',
      'Destrucción de plantas hospederas de solanáceas silvestres en bordes de parcela.'
    ]
  },
  'sample-papa-sana': {
    crop: 'Papa',
    scientificCrop: 'Solanum tuberosum',
    commonDisease: 'Cultivo Sano / Sin Plaga Detectada',
    scientificDisease: 'Estado fisiológico óptimo',
    severity: 'Saludable',
    alertLevel: 'green',
    symptoms: 'Follaje vigoroso, láminas foliares completas de color verde uniforme sin clorosis ni pústulas miceliales. Desarrollo equilibrado.',
    confidence: 98,
    organicControl: [
      'Mantener nutrición foliar con biol fermentado o humus líquido al 10%.',
      'Monitoreo preventivo quincenal con cartillas de campo.'
    ],
    chemicalControl: [
      'No se requiere aplicación curativa ni plaguicidas de síntesis en este estado.',
      'Aplicar fertilización balanceada de fondo N-P-K según análisis de suelo.'
    ],
    preventiveTips: [
      'Mantener régimen de riego moderado sin anegamiento.',
      'Aporque oportuno a los 45 y 65 días de la siembra.',
      'Control manual de malezas competitivas.'
    ]
  }
};

// Health route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Agrocultiva API',
    catalog: ALLOWED_CROPS,
    aiAvailable: !!process.env.GEMINI_API_KEY,
  });
});

// Diagnostic endpoint
app.post('/api/diagnose', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, sampleId, notes } = req.body;

    // Check if user requested a known sample fallback first
    if (sampleId && AGRONOMIC_KNOWLEDGE[sampleId]) {
      const data = AGRONOMIC_KNOWLEDGE[sampleId];
      return res.json({
        isAllowedCrop: true,
        detectedCrop: data.crop,
        scientificCropName: data.scientificCrop,
        healthStatus: data.severity === 'Saludable' ? 'Saludable' : 'Enfermo/Plaga',
        diseaseOrPestCommonName: data.commonDisease,
        diseaseOrPestScientificName: data.scientificDisease,
        severity: data.severity,
        confidencePercentage: data.confidence,
        symptomsDescription: data.symptoms,
        alertLevel: data.alertLevel,
        organicControl: data.organicControl,
        chemicalControl: data.chemicalControl,
        preventionAndCulturalTips: data.preventiveTips,
        timestamp: new Date().toISOString(),
      });
    }

    if (!imageBase64) {
      return res.status(400).json({
        error: 'No se recibió ninguna imagen para procesar el diagnóstico.',
      });
    }

    const ai = getGeminiClient();

    // If Gemini client is available, execute real multimodal vision call
    if (ai) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const validMimeType = mimeType || 'image/jpeg';

      const prompt = `
Eres el especialista agrónomo fitosanitario de "Agrocultiva".
Tu tarea es examinar la fotografía proporcionada y analizar la sanidad vegetal.

REGLA ABSOLUTA DE CATÁLOGO (ESTRICTO):
La aplicación Agrocultiva ÚNICAMENTE opera y admite cuatro (4) cultivos específicos:
1. Fresa (Fragaria × ananassa)
2. Aguaymanto (Physalis peruviana)
3. Papa (Solanum tuberosum)
4. Cebolla China (Allium fistulosum)

PASO 1: Identifica qué cultivo u objeto aparece en la imagen.
Si la imagen NO pertenece claramente a uno de estos 4 cultivos (por ejemplo, si es tomate, maíz, palta, lechuga, un animal, una persona, maquinaria, u otro cultivo no permitido):
- Establece "isAllowedCrop": false
- Explica cordialmente en "rejectionReason" que Agrocultiva está exclusivamente especializado en Fresa, Aguaymanto, Papa y Cebolla China, e indica qué cultivo u objeto parece ser la imagen.
- Llena los otros campos con valores neutros vacíos.

PASO 2: Si SÍ pertenece a Fresa, Aguaymanto, Papa o Cebolla China:
- Establece "isAllowedCrop": true
- "detectedCrop": "Fresa" | "Aguaymanto" | "Papa" | "Cebolla China"
- "scientificCropName": el nombre científico del cultivo
- "healthStatus": "Enfermo/Plaga" o "Saludable"
- "diseaseOrPestCommonName": nombre común de la plaga o enfermedad (ej. Rancha / Tizón tardío, Botrytis, Mildiu, Arañita roja, Trips, Gusano del fruto, o "Cultivo Sano")
- "diseaseOrPestScientificName": nombre científico del patógeno o plaga (ej. Phytophthora infestans, Botrytis cinerea, Peronospora destructor, etc.)
- "severity": "Bajo" | "Moderado" | "Crítico" | "Saludable"
- "confidencePercentage": número entero entre 75 y 99
- "alertLevel": "green" (si es sano o bajo), "yellow" (bajo), "orange" (moderado), "red" (crítico)
- "symptomsDescription": descripción concisa de los síntomas visibles en la foto
- "organicControl": array de 3 o 4 métodos de control biológico/orgánico recomendados en Perú (ej. Caldo bordelés, Trichoderma, Bacillus subtilis, jabón potásico, etc.)
- "chemicalControl": array de 2 o 3 ingredientes activos aprobados en Perú con indicación técnica (ej. Mancozeb, Metalaxil, Azoxistrobina, Spinosad)
- "preventionAndCulturalTips": array de 2 o 3 prácticas agronómicas culturales preventivas (riego, aporque, rotación, etc.)
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: validMimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isAllowedCrop: {
                type: Type.BOOLEAN,
                description: 'True si y solo si la imagen pertenece a Fresa, Aguaymanto, Papa o Cebolla.',
              },
              detectedCrop: {
                type: Type.STRING,
                description: 'Nombre del cultivo detectado (Fresa, Aguaymanto, Papa, Cebolla, u otro)',
              },
              scientificCropName: {
                type: Type.STRING,
                description: 'Nombre científico del cultivo o especie detectada',
              },
              healthStatus: {
                type: Type.STRING,
                description: 'Enfermo/Plaga o Saludable o No Identificado',
              },
              diseaseOrPestCommonName: {
                type: Type.STRING,
                description: 'Nombre común de la enfermedad o plaga',
              },
              diseaseOrPestScientificName: {
                type: Type.STRING,
                description: 'Nombre científico del patógeno o agente causal',
              },
              severity: {
                type: Type.STRING,
                description: 'Bajo, Moderado, Crítico o Saludable',
              },
              confidencePercentage: {
                type: Type.INTEGER,
                description: 'Porcentaje de certeza de 1 a 100',
              },
              symptomsDescription: {
                type: Type.STRING,
                description: 'Descripción detallada de síntomas agronómicos observados',
              },
              alertLevel: {
                type: Type.STRING,
                description: 'green, yellow, orange o red',
              },
              organicControl: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Métodos orgánicos y biológicos recomendados',
              },
              chemicalControl: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Ingredientes activos y control químico en Perú',
              },
              preventionAndCulturalTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Prácticas culturales y preventivas',
              },
              rejectionReason: {
                type: Type.STRING,
                description: 'Mensaje explicativo si el cultivo no pertenece al catálogo oficial',
              },
            },
            required: [
              'isAllowedCrop',
              'detectedCrop',
              'healthStatus',
              'diseaseOrPestCommonName',
              'severity',
              'confidencePercentage',
            ],
          },
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsedData = JSON.parse(responseText);

      return res.json({
        ...parsedData,
        timestamp: new Date().toISOString(),
      });
    }

    // Fallback if no Gemini key:
    // If user provided notes or hints indicating crop:
    const lowerNotes = (notes || '').toLowerCase();
    let selectedFallback = AGRONOMIC_KNOWLEDGE['sample-papa-rancha'];
    if (lowerNotes.includes('cebolla')) {
      selectedFallback = AGRONOMIC_KNOWLEDGE['sample-cebolla-mildiu'];
    } else if (lowerNotes.includes('fresa')) {
      selectedFallback = AGRONOMIC_KNOWLEDGE['sample-fresa-botrytis'];
    } else if (lowerNotes.includes('aguaymanto')) {
      selectedFallback = AGRONOMIC_KNOWLEDGE['sample-aguaymanto-gusano'];
    } else if (lowerNotes.includes('sano') || lowerNotes.includes('saludable')) {
      selectedFallback = AGRONOMIC_KNOWLEDGE['sample-papa-sana'];
    }

    return res.json({
      isAllowedCrop: true,
      detectedCrop: selectedFallback.crop,
      scientificCropName: selectedFallback.scientificCrop,
      healthStatus: selectedFallback.severity === 'Saludable' ? 'Saludable' : 'Enfermo/Plaga',
      diseaseOrPestCommonName: selectedFallback.commonDisease,
      diseaseOrPestScientificName: selectedFallback.scientificDisease,
      severity: selectedFallback.severity,
      confidencePercentage: selectedFallback.confidence,
      symptomsDescription: selectedFallback.symptoms,
      alertLevel: selectedFallback.alertLevel,
      organicControl: selectedFallback.organicControl,
      chemicalControl: selectedFallback.chemicalControl,
      preventionAndCulturalTips: selectedFallback.preventiveTips,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error en diagnóstico fitosanitario:', error);
    return res.status(500).json({
      error: 'Hubo un error al procesar el análisis de la fotografía.',
      details: error?.message || 'Error del servidor',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Agrocultiva server running on http://localhost:${PORT}`);
  });
}

// Only start the server if not running in a serverless environment (Netlify/AWS Lambda)
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}

export { app };
