import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Leaf, 
  FlaskConical, 
  HelpCircle, 
  RefreshCw, 
  ArrowRight,
  Printer,
  Copy,
  Check,
  AlertOctagon
} from 'lucide-react';
import { DiagnosisResult, SamplePestCase, AllowedCrop } from '../types';
import { SAMPLE_PEST_CASES, AGRONOMIC_REJECTED_MESSAGE } from '../data/agriculturalData';
import { runCropDiagnosis } from '../lib/supabase';

interface PestDetectionProps {
  onGoToMarket: (crop: AllowedCrop) => void;
  onGoToOrder: (crop: AllowedCrop) => void;
}

export const PestDetection: React.FC<PestDetectionProps> = ({
  onGoToMarket,
  onGoToOrder,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTreatmentTab, setActiveTreatmentTab] = useState<'organic' | 'chemical' | 'cultural'>('organic');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor seleccione un archivo de imagen válido (JPEG, PNG, WEBP).');
      return;
    }

    const type = file.type;
    setMimeType(type);
    setErrorMsg(null);
    setDiagnosis(null);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      // Analiza directamente de forma automática e inteligente
      runAnalysis(undefined, base64, type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor arrastre un archivo de imagen válido.');
      return;
    }

    const type = file.type;
    setMimeType(type);
    setErrorMsg(null);
    setDiagnosis(null);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      // Analiza directamente de forma automática e inteligente
      runAnalysis(undefined, base64, type);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async (customSampleId?: string, customImage?: string, customMime?: string) => {
    const imageToAnalyze = customImage || selectedImage;
    if (!imageToAnalyze && !customSampleId) {
      setErrorMsg('Primero suba una fotografía o seleccione una muestra de campo.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setDiagnosis(null);

    try {
      const payload: { imageBase64?: string; mimeType?: string; sampleId?: string } = {};
      if (customSampleId) {
        payload.sampleId = customSampleId;
      } else if (imageToAnalyze) {
        payload.imageBase64 = imageToAnalyze;
        payload.mimeType = customMime || mimeType;
      }

      const data = await runCropDiagnosis(payload);
      setDiagnosis(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'No fue posible completar el diagnóstico. Intente nuevamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleCase = (sample: SamplePestCase) => {
    setSelectedImage(sample.imageUrl);
    setDiagnosis(null);
    setErrorMsg(null);
    runAnalysis(sample.id, sample.imageUrl);
  };

  const testNonCatalogCrop = () => {
    setSelectedImage('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'); // Tomate / Manzana
    setMimeType('image/jpeg');
    setDiagnosis({
      isAllowedCrop: false,
      detectedCrop: 'Tomate / Hortaliza no catalogada',
      scientificCropName: 'Solanum lycopersicum',
      healthStatus: 'No Identificado',
      diseaseOrPestCommonName: 'Cultivo fuera de catálogo',
      diseaseOrPestScientificName: 'N/A',
      severity: 'Bajo',
      confidencePercentage: 99,
      symptomsDescription: 'La muestra no coincide con la morfología vegetal de Fresa, Aguaymanto, Papa ni Cebolla.',
      alertLevel: 'yellow',
      organicControl: [],
      chemicalControl: [],
      preventionAndCulturalTips: [],
      rejectionReason: AGRONOMIC_REJECTED_MESSAGE,
      timestamp: new Date().toISOString()
    });
  };

  const copyDiagnosisText = () => {
    if (!diagnosis) return;
    const text = `DIAGNÓSTICO FITOSANITARIO - AGROCULTIVA
Cultivo: ${diagnosis.detectedCrop} (${diagnosis.scientificCropName || ''})
Diagnóstico: ${diagnosis.diseaseOrPestCommonName} (${diagnosis.diseaseOrPestScientificName || ''})
Nivel de Alerta: ${diagnosis.severity} (Certeza: ${diagnosis.confidencePercentage}%)
Síntomas: ${diagnosis.symptomsDescription}

CONTROL ORGÁNICO:
${diagnosis.organicControl.map(m => `• ${m}`).join('\n')}

CONTROL QUÍMICO (SENASA):
${diagnosis.chemicalControl.map(m => `• ${m}`).join('\n')}

Fecha: ${new Date(diagnosis.timestamp).toLocaleDateString('es-PE')}
Agrocultiva - Sistema Fitosanitario`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Header section with instructions */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Ventana 1 • Multimodal Inteligente
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Detección de Plagas y Enfermedades Agrícolas
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Fotografía hojas, tallos o frutos de <strong className="text-gray-800 font-semibold">Fresa, Aguaymanto, Papa o Cebolla</strong>. La IA identificará el agente patógeno, el nivel de severidad y el plan de control agronómico orgánico y químico.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="test-rejected-crop-btn"
              type="button"
              onClick={testNonCatalogCrop}
              className="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
              title="Probar qué sucede si se sube un cultivo ajeno a los 4 permitidos"
            >
              Probar Muestra Externa (Rechazo)
            </button>
          </div>
        </div>

        {/* Quick sample selector */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Muestras de campo para diagnóstico rápido:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {SAMPLE_PEST_CASES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadSampleCase(sample)}
                className="flex items-center gap-2.5 p-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 transition-colors text-left group cursor-pointer"
              >
                <img 
                  src={sample.imageUrl} 
                  alt={sample.title}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-200" 
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-gray-900 truncate group-hover:text-emerald-600">
                      {sample.crop}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{sample.title.split(' en ')[0]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main interaction grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Upload and Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div 
            id="photo-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-6 transition-colors text-center flex flex-col items-center justify-center min-h-[320px] bg-white ${
              selectedImage 
                ? 'border-emerald-300 bg-emerald-50/10' 
                : 'border-gray-200 hover:border-emerald-400 bg-white'
            }`}
          >
            {selectedImage ? (
              <div className="space-y-4 w-full">
                <div className="relative rounded-xl overflow-hidden shadow-inner max-h-72 bg-gray-900 flex items-center justify-center">
                  <img 
                    src={selectedImage} 
                    alt="Muestra a analizar" 
                    referrerPolicy="no-referrer"
                    className="max-h-72 w-full object-contain"
                  />
                  {/* Laser scan line matching Clean Minimalism - visible while analyzing */}
                  {isAnalyzing && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 opacity-80 shadow-[0_0_12px_#10b981] animate-scanline pointer-events-none" />
                  )}

                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                      <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="font-mono text-xs text-emerald-400 font-medium">Analizando muestra fitopatológica con IA...</p>
                      <p className="text-[10px] text-gray-400 mt-1">Validando catálogo: Fresa, Aguaymanto, Papa, Cebolla</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    id="reupload-photo-btn"
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-gray-500" />
                    <span>Cambiar foto</span>
                  </button>
                  <button
                    id="retake-camera-btn"
                    type="button"
                    onClick={() => {
                      if (cameraInputRef.current) cameraInputRef.current.value = '';
                      cameraInputRef.current?.click();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tomar otra</span>
                  </button>
                  {errorMsg && (
                    <button
                      id="retry-analysis-btn"
                      type="button"
                      disabled={isAnalyzing}
                      onClick={() => runAnalysis()}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors shadow-2xs cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                      <span>Reintentar</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Cargar fotografía del cultivo</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    Toma una foto de cerca a las hojas, frutos o tallos afectados.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  {/* File browser */}
                  <button
                    id="choose-file-btn"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir de galería</span>
                  </button>

                  {/* Camera capture directly on mobile */}
                  <button
                    id="open-camera-btn"
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Tomar Foto</span>
                  </button>
                </div>

                <p className="text-[10px] text-gray-400">Formatos admitidos: JPG, PNG, WEBP (Hasta 20MB)</p>
              </div>
            )}

            {/* Hidden native inputs */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <input 
              ref={cameraInputRef}
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Aviso de procesamiento:</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Catalog enforcement note */}
          <div className="p-3.5 rounded-xl bg-gray-100 border border-gray-200/60 text-gray-600 text-xs flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-gray-800 font-semibold">Foco exclusivo:</strong> Agrocultiva evalúa únicamente Fresa, Aguaymanto, Papa y Cebolla para asegurar prescripciones fitosanitarias de precisión.
            </p>
          </div>
        </div>

        {/* Right Column: Diagnostic Output Card (7 cols) */}
        <div className="lg:col-span-7">
          {isAnalyzing ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center space-y-4 min-h-[380px] flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Sparkles className="w-7 h-7 animate-pulse text-emerald-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">Motor Multimodal en Proceso</h3>
                <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                  1. Verificando pertenencia a Fresa, Aguaymanto, Papa o Cebolla.<br/>
                  2. Detectando signos patológicos y grado de daño en tejido.<br/>
                  3. Formulando medidas de control orgánico y químico.
                </p>
              </div>
              <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full animate-indeterminate" />
              </div>
            </div>
          ) : diagnosis ? (
            // Result View
            !diagnosis.isAllowedCrop ? (
              // Rejection Card
              <div 
                id="rejection-card"
                className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm space-y-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                    <AlertOctagon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] uppercase tracking-wider">
                      Restricción Estricta de Catálogo
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">
                      Muestra No Admitida en Agrocultiva
                    </h3>
                    <p className="text-xs text-gray-500">
                      Detección externa: {diagnosis.detectedCrop || 'Especie no autorizada'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-100 text-xs text-amber-900 space-y-1.5">
                  <p className="font-semibold text-sm">
                    {diagnosis.rejectionReason || AGRONOMIC_REJECTED_MESSAGE}
                  </p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Nuestra base de datos multimodal e indicadores de mercado están calibrados con exactitud para la cadena de valor de <strong className="font-semibold">Fresa, Aguaymanto, Papa y Cebolla</strong>.
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-wider">
                    Por favor intente nuevamente con uno de estos 4 cultivos admitidos:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-center">
                      <span className="text-xl">🍓</span>
                      <p className="text-xs font-bold text-gray-800 mt-1">Fresa</p>
                    </div>
                    <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-center">
                      <span className="text-xl">🟡</span>
                      <p className="text-xs font-bold text-gray-800 mt-1">Aguaymanto</p>
                    </div>
                    <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-center">
                      <span className="text-xl">🥔</span>
                      <p className="text-xs font-bold text-gray-800 mt-1">Papa</p>
                    </div>
                    <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-center">
                      <span className="text-xl">🧅</span>
                      <p className="text-xs font-bold text-gray-800 mt-1">Cebolla</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    id="retry-allowed-photo-btn"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Subir foto de cultivo permitido
                  </button>
                </div>
              </div>
            ) : (
              // Accepted Diagnostic Card
              <div 
                id="diagnostic-result-card"
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-0"
              >
                {/* Card Top Header / Alert Box */}
                <div className={`p-5 border-b ${
                  diagnosis.severity === 'Crítico'
                    ? 'bg-red-50/90 border-red-100'
                    : diagnosis.severity === 'Moderado'
                    ? 'bg-amber-50/90 border-amber-100'
                    : diagnosis.severity === 'Saludable'
                    ? 'bg-emerald-50/90 border-emerald-100'
                    : 'bg-yellow-50/90 border-yellow-100'
                }`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {diagnosis.detectedCrop === 'Fresa' ? '🍓' : diagnosis.detectedCrop === 'Aguaymanto' ? '🟡' : diagnosis.detectedCrop === 'Papa' ? '🥔' : '🧅'}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Cultivo: {diagnosis.detectedCrop} <span className="font-normal italic">({diagnosis.scientificCropName})</span>
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {diagnosis.diseaseOrPestCommonName}
                      </h3>
                      <p className="text-xs font-medium italic text-gray-600">
                        {diagnosis.diseaseOrPestScientificName}
                      </p>
                    </div>

                    {/* Severity alert badge */}
                    <div className="flex flex-col items-end gap-1">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                        diagnosis.severity === 'Crítico'
                          ? 'bg-red-200 text-red-700'
                          : diagnosis.severity === 'Moderado'
                          ? 'bg-amber-200 text-amber-800'
                          : diagnosis.severity === 'Saludable'
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-yellow-200 text-yellow-900'
                      }`}>
                        {diagnosis.severity === 'Crítico' && <ShieldAlert className="w-3.5 h-3.5" />}
                        {diagnosis.severity === 'Moderado' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {diagnosis.severity === 'Saludable' && <CheckCircle className="w-3.5 h-3.5" />}
                        <span>Alerta: {diagnosis.severity}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400">
                        Certeza de IA: {diagnosis.confidencePercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Symptoms description */}
                  <div className="mt-3.5 p-3 rounded-xl bg-white/90 border border-gray-200/70 text-xs text-gray-700">
                    <strong className="font-semibold text-gray-900">Signos y Síntomas Observados:</strong>{' '}
                    <span>{diagnosis.symptomsDescription}</span>
                  </div>
                </div>

                {/* Treatment Tabs (Organic, Chemical, Cultural) */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Tratamiento Sugerido para la Zona
                    </h4>

                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-gray-100 text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveTreatmentTab('organic')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                          activeTreatmentTab === 'organic'
                            ? 'bg-white text-emerald-700 shadow-xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        🌿 Orgánico
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTreatmentTab('chemical')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                          activeTreatmentTab === 'chemical'
                            ? 'bg-white text-emerald-700 shadow-xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        🧪 Químico
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTreatmentTab('cultural')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                          activeTreatmentTab === 'cultural'
                            ? 'bg-white text-emerald-700 shadow-xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        🚜 Manejo Cultural
                      </button>
                    </div>
                  </div>

                  {/* Tab content */}
                  {activeTreatmentTab === 'organic' && (
                    <div className="space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Manejo Biológico y Orgánico (Ecológico y sin residualidad tóxica)</span>
                      </div>
                      <ul className="space-y-2 text-xs text-gray-700 pl-1">
                        {diagnosis.organicControl && diagnosis.organicControl.length > 0 ? (
                          diagnosis.organicControl.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-500 font-bold shrink-0">●</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-400 italic">No se requieren aplicaciones correctivas adicionales.</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {activeTreatmentTab === 'chemical' && (
                    <div className="space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                        <span>Control Químico Convencional (Registros SENASA Perú - Use EPP)</span>
                      </div>
                      <ul className="space-y-2 text-xs text-gray-700 pl-1">
                        {diagnosis.chemicalControl && diagnosis.chemicalControl.length > 0 ? (
                          diagnosis.chemicalControl.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-500 font-bold shrink-0">●</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-400 italic">Sin recomendación química para esta condición.</li>
                        )}
                      </ul>
                      <p className="text-[10px] text-gray-400 italic pt-1 border-t border-gray-100">
                        * Respete estrictamente los días de periodo de carencia antes de realizar la cosecha para venta o consumo humano.
                      </p>
                    </div>
                  )}

                  {activeTreatmentTab === 'cultural' && (
                    <div className="space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Buenas Prácticas Agrícolas y Manejo en Parcela</span>
                      </div>
                      <ul className="space-y-2 text-xs text-gray-700 pl-1">
                        {diagnosis.preventionAndCulturalTips && diagnosis.preventionAndCulturalTips.length > 0 ? (
                          diagnosis.preventionAndCulturalTips.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-500 font-bold shrink-0">●</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-400 italic">Mantenga monitoreo regular y rotación de cultivo.</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        id="copy-diagnosis-btn"
                        type="button"
                        onClick={copyDiagnosisText}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copiado al portapapeles' : 'Copiar Ficha'}</span>
                      </button>
                      <button
                        id="print-diagnosis-btn"
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir</span>
                      </button>
                    </div>

                    {diagnosis.detectedCrop && ['Fresa', 'Aguaymanto', 'Papa', 'Cebolla'].includes(diagnosis.detectedCrop) && (
                      <div className="flex items-center gap-2">
                        <button
                          id="see-market-prices-for-crop-btn"
                          type="button"
                          onClick={() => onGoToMarket(diagnosis.detectedCrop as AllowedCrop)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 transition-colors cursor-pointer"
                        >
                          <span>Ver Precios de {diagnosis.detectedCrop}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id="make-order-for-crop-btn"
                          type="button"
                          onClick={() => onGoToOrder(diagnosis.detectedCrop as AllowedCrop)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
                        >
                          <span>Hacer Pedido</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )
          ) : (
            // Placeholder empty state
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center space-y-3 min-h-[380px] flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800">
                Esperando Fotografía
              </h3>
              <p className="text-xs text-gray-500 max-w-sm">
                Sube una imagen de tu cultivo o selecciona una muestra de la barra superior para generar el diagnóstico agronómico instantáneo.
              </p>
              <div className="pt-2">
                <span className="text-[10px] text-gray-400 font-medium">
                  Catálogo: 🍓 Fresa • 🟡 Aguaymanto • 🥔 Papa • 🧅 Cebolla
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
