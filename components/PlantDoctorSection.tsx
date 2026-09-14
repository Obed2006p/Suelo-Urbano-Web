
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { jsPDF } from "jspdf";
import { saveToGarden, resizeImageToBase64, ensureRequerimientoLuz, RequerimientoLuzLux } from '../lib/gardenStorage';
import { CameraIcon, SparklesIcon, LeafIcon, HeartbeatIcon, ClipboardListIcon, PhIcon, MixIcon, HumidityIcon, QuestionMarkCircleIcon, ChevronDownIcon, CalendarIcon, DownloadIcon, BeakerIcon, SpoonIcon, CheckCircleIcon, SunIcon } from './icons/Icons';
import DoctorAdBanner from './DoctorAdBanner';
import AnalysisProcessViewer from './AnalysisProcessViewer';

// --- Interfaces para los datos de la IA ---
interface PlantDiagnosis {
    nombrePlanta: string;
    estadoGeneral: string;
    diagnosticoBreve: string;
    problemasDetectados: string[];
    causasPosibles: string[];
    tratamiento: { paso: string; detalle: string }[];
    planRecuperacion: string[];
    sustratoRecomendado: string;
    luzYRiego: string;
    requerimientoLuzLux?: RequerimientoLuzLux;
    riegoYSustrato?: {
        clasificacionEspecie: 'TOLERANTE' | 'SENSIBLE';
        descripcionClasificacion: string;
        puntos: {
            numero: number;
            titulo: string;
            detalle: string;
            tipo: 'agua' | 'sustrato';
        }[];
    };
    prevencion: string[];
    seguimiento: string;
    productosRecomendados: { nombre: string; motivo: string }[];
    imagenesReferencia: { terminoBusquedaWikipedia: string; descripcionEspanol: string }[];
    resultadosEsperados: string[];
}

const DOCTOR_MASCOT_URL = "https://res.cloudinary.com/dsmzpsool/image/upload/v1757182726/Gemini_Generated_Image_xx5ythxx5ythxx5y-removebg-preview_guhkke.png";


// --- Componentes de UI ---

const ReferenceImage: React.FC<{ term: string, description: string }> = ({ term, description }) => {
    const [imgUrl, setImgUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFallback, setIsFallback] = useState(false);

    useEffect(() => {
        const fetchImg = async () => {
            try {
                const res = await fetch(`https://es.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&pithumbsize=600&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrlimit=1`);
                const data = await res.json();
                if (data.query && data.query.pages) {
                    const pages = data.query.pages;
                    const firstPageId = Object.keys(pages)[0];
                    const thumbnail = pages[firstPageId].thumbnail;
                    if (thumbnail && thumbnail.source) {
                        setImgUrl(thumbnail.source);
                        return;
                    }
                }
            } catch (e) {
                console.error("Wikipedia API error", e);
            }
            
            // Fallback
            const seed = Math.floor(Math.random() * 100000);
            setImgUrl(`https://image.pollinations.ai/prompt/${encodeURIComponent(term)}?width=400&height=400&nologo=true&seed=${seed}`);
            setIsFallback(true);
        };
        fetchImg();
    }, [term]);

    return (
        <div className="flex flex-col gap-2">
            <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-inner group relative">
                {imgUrl && (
                    <img 
                        src={imgUrl} 
                        alt={description}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${loading ? 'opacity-0' : 'opacity-100'}`}
                        loading="lazy"
                        onLoad={() => setLoading(false)}
                        onError={(e) => {
                            if (!e.currentTarget.src.includes('placehold.co')) {
                                e.currentTarget.src = `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent('Sin imagen')}`;
                                setLoading(false);
                            }
                        }}
                    />
                )}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-300 dark:bg-gray-600 animate-pulse text-gray-500 text-xs text-center p-2">
                        Buscando en<br/>archivos reales...
                    </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end">
                    <span className="text-white text-xs p-2 font-medium drop-shadow-md">{description}</span>
                </div>
                {isFallback && !loading && (
                   <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm" title="Imagen generada por IA al no encontrar foto en enciclopedias">
                       Generada (IA)
                   </div>
                )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium line-clamp-2 md:hidden">{description}</p>
        </div>
    );
};



const DiagnosisView: React.FC<{ diagnosis: PlantDiagnosis }> = ({ diagnosis }) => {
    const luzInfo = ensureRequerimientoLuz(diagnosis);
    return (
    <div className="animate-fade-in-up w-full text-left space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <img src={DOCTOR_MASCOT_URL} alt="Doctor de Plantas Mascota" className="h-14 w-14 sm:h-20 sm:w-20 flex-shrink-0 drop-shadow-md object-contain" />
            <div className="min-w-0">
                <p className="text-[11px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Planta Observada</p>
                <h3 className="text-lg sm:text-2xl font-black text-green-900 mb-0.5 sm:mb-1 dark:text-green-300 truncate">{diagnosis.nombrePlanta}</h3>
                <p className="text-gray-800 text-xs sm:text-base font-semibold dark:text-gray-200 flex items-center gap-1.5 sm:gap-2">
                    <HeartbeatIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
                    <span>Estado: </span>
                    <span className="font-bold text-red-600 dark:text-red-400">{diagnosis.estadoGeneral}</span>
                </p>
            </div>
        </div>
        
        {/* Diagnóstico Breve */}
        <div className="bg-gray-50 border-l-4 border-green-500 p-3 sm:p-4 rounded-r-lg dark:bg-gray-700 dark:border-green-400 shadow-sm">
            <h4 className="font-bold text-green-900 flex items-center gap-2 mb-1.5 sm:mb-2 text-sm sm:text-base dark:text-green-300">
                <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400"/> Diagnóstico Breve
            </h4>
            <p className="text-gray-800 text-xs sm:text-sm leading-relaxed dark:text-gray-100 font-medium">
                {diagnosis.diagnosticoBreve}
            </p>
        </div>

        {/* Dos columnas: Problemas y Causas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-red-50 border border-red-200 p-3.5 sm:p-4 rounded-xl dark:bg-red-900/20 dark:border-red-800 shadow-sm">
                <h4 className="font-bold text-red-800 flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base dark:text-red-400">
                    <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5"/> Problemas Detectados
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-red-900 dark:text-red-200">
                    {diagnosis.problemasDetectados.map((prob, idx) => <li key={idx}>{prob}</li>)}
                </ul>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 p-3.5 sm:p-4 rounded-xl dark:bg-amber-900/20 dark:border-amber-800 shadow-sm">
                <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base dark:text-amber-400">
                    <QuestionMarkCircleIcon className="h-4 w-4 sm:h-5 sm:w-5"/> Posibles Causas
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                    {diagnosis.causasPosibles.map((causa, idx) => <li key={idx}>{causa}</li>)}
                </ul>
            </div>
        </div>
        
        {/* Tratamiento y Control */}
        <div className="bg-white border border-gray-200 p-3.5 sm:p-5 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h4 className="font-bold text-green-800 flex items-center gap-2 mb-3 sm:mb-4 dark:text-green-300 text-base sm:text-lg border-b pb-2 dark:border-gray-700">
                <ClipboardListIcon className="h-5 w-5 sm:h-6 sm:w-6"/> Tratamiento y Control
            </h4>
            <div className="space-y-3 sm:space-y-4">
                {diagnosis.tratamiento.map((step, index) => 
                    <div key={index} className="flex gap-2.5 sm:gap-3 items-start">
                        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-800 dark:text-green-300 font-bold text-xs sm:text-sm border border-green-200 dark:border-green-700 mt-0.5">
                            {index + 1}
                        </div>
                        <div className="min-w-0">
                            <strong className="font-bold text-gray-900 dark:text-gray-100 block mb-0.5 text-xs sm:text-sm">{step.paso}</strong>
                            <p className="text-gray-700 text-xs sm:text-sm dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{step.detalle}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Plan de recuperación */}
        <div className="bg-blue-50 border border-blue-200 p-3.5 sm:p-4 rounded-xl shadow-sm dark:bg-blue-900/20 dark:border-blue-800">
            <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base dark:text-blue-300">
                <LeafIcon className="h-4 w-4 sm:h-5 sm:w-5"/> Plan de Recuperación a Mediano Plazo
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-blue-900 dark:text-blue-200">
                {diagnosis.planRecuperacion.map((plan, idx) => <li key={idx}>{plan}</li>)}
            </ul>
        </div>

        {/* Luz, Riego y Prevención */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white border border-gray-200 p-3.5 sm:p-5 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <h4 className="font-bold text-green-800 flex items-center gap-1.5 sm:gap-2 dark:text-green-300 text-sm sm:text-base">
                        <HumidityIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400"/>
                        Luz y Riego
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/40">
                        ☀️ {luzInfo.rangoLux}
                    </span>
                </div>

                {/* Diagnóstico de Lux integrado */}
                <div className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-emerald-500/5 border border-amber-500/25 rounded-xl p-2.5 sm:p-3.5 mb-2.5 sm:mb-3.5 space-y-2 sm:space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                            <SunIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400" />
                            Diagnóstico Lux:
                        </span>
                        <span className="font-bold text-stone-700 dark:text-stone-300 bg-white/80 dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700 text-[10px] sm:text-[11px]">
                            {luzInfo.nivelLuz}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs">
                        <div className="bg-white/70 dark:bg-stone-800/70 p-2 rounded-lg border border-amber-200/50 dark:border-stone-700">
                            <span className="font-bold text-amber-800 dark:text-amber-400 block text-[10px] sm:text-[11px]">⏱️ Horas diarias:</span>
                            <span className="text-stone-700 dark:text-stone-300 font-medium text-[11px] sm:text-xs">{luzInfo.horasRecomendadas}</span>
                        </div>
                        <div className="bg-white/70 dark:bg-stone-800/70 p-2 rounded-lg border border-amber-200/50 dark:border-stone-700">
                            <span className="font-bold text-amber-800 dark:text-amber-400 block text-[10px] sm:text-[11px]">📍 Ubicación sugerida:</span>
                            <span className="text-stone-700 dark:text-stone-300 font-medium text-[11px] sm:text-xs">{luzInfo.descripcionUbicacion}</span>
                        </div>
                    </div>

                    <div className="text-[10px] sm:text-[11px] text-stone-600 dark:text-stone-300 bg-amber-50/70 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/60 dark:border-amber-800/30">
                        <strong className="text-amber-900 dark:text-amber-300 font-bold">📱 Medición con celular: </strong>
                        {luzInfo.consejoMedicion}
                    </div>
                </div>

                <p className="text-gray-800 text-xs sm:text-sm leading-relaxed dark:text-gray-200">{diagnosis.luzYRiego}</p>
            </div>

            <div className="bg-white border border-gray-200 p-3.5 sm:p-5 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <h4 className="font-bold text-green-800 flex items-center gap-2 mb-2 sm:mb-3 dark:text-green-300 text-sm sm:text-base border-b border-gray-100 dark:border-gray-700 pb-2">
                    <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400"/>
                    Prevención
                </h4>
                <ul className="list-disc list-inside space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                    {diagnosis.prevencion.map((p, idx) => <li key={idx}>{p}</li>)}
                </ul>
            </div>
        </div>

        {/* Sección: Regla de Diagnóstico Condicional: Riego y Sustrato */}
        {diagnosis.riegoYSustrato && (
            <div className="bg-gradient-to-br from-cyan-950/20 via-stone-900/10 to-emerald-950/20 border border-cyan-500/40 dark:border-cyan-500/30 p-3.5 sm:p-5 rounded-2xl shadow-md space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-cyan-500/20 pb-2.5 sm:pb-3">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex-shrink-0">
                            <HumidityIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-stone-900 dark:text-white text-sm sm:text-base md:text-lg">
                                Regla de Riego, Agua y Sustrato
                            </h4>
                            <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium">
                                Tolerancia al agua de la llave, oxigenación y drenaje radicular
                            </p>
                        </div>
                    </div>
                    <div>
                        {diagnosis.riegoYSustrato.clasificacionEspecie === 'SENSIBLE' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 shadow-sm">
                                ⚠️ Especie Sensible al Agua de la Llave
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 shadow-sm">
                                ✅ Especie Tolerante al Agua de la Llave
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-stone-800/80 p-3 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium leading-relaxed">
                    <span className="font-bold text-stone-900 dark:text-white block mb-0.5">Clasificación de la Especie:</span>
                    {diagnosis.riegoYSustrato.descripcionClasificacion}
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                    {diagnosis.riegoYSustrato.puntos.map((punto, idx) => {
                        const isWaterPoint = punto.tipo === 'agua';
                        return (
                            <div 
                                key={idx}
                                className={`p-3 sm:p-4 rounded-xl border flex items-start gap-2.5 sm:gap-3.5 transition-all shadow-sm ${
                                    isWaterPoint 
                                        ? 'bg-cyan-50/80 dark:bg-cyan-950/25 border-cyan-200 dark:border-cyan-800/50' 
                                        : 'bg-emerald-50/80 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800/50'
                                }`}
                            >
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs sm:text-sm flex-shrink-0 mt-0.5 shadow-sm ${
                                    isWaterPoint
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-emerald-600 text-white'
                                }`}>
                                    {punto.numero}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                                        <h5 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-white">
                                            {punto.titulo}
                                        </h5>
                                        <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                            isWaterPoint 
                                                ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' 
                                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                                        }`}>
                                            {isWaterPoint ? 'Calidad del Agua' : 'Oxígeno y Sustrato'}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                                        {punto.detalle}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Sustrato y Productos */}
        <div className="bg-white border text-center border-gray-200 p-3.5 sm:p-5 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 mb-1.5 sm:mb-2 dark:text-white uppercase tracking-widest text-xs sm:text-sm text-center border-b pb-2 dark:border-gray-700">Recomendación Oficial Suelo Urbano</h4>
            <p className="text-green-800 font-bold text-base sm:text-lg mt-2 sm:mt-3 dark:text-green-400">Sustrato Ideal: {diagnosis.sustratoRecomendado}</p>
            
            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-left">
                {diagnosis.productosRecomendados.map((prod, idx) => (
                     <div key={idx} className="bg-lime-50 dark:bg-lime-900/30 p-2.5 sm:p-3 rounded-lg border border-lime-200 dark:border-lime-800">
                         <span className="block font-bold text-lime-900 dark:text-lime-300 text-xs sm:text-sm">{prod.nombre}</span>
                         <span className="text-[11px] sm:text-xs text-lime-800 dark:text-lime-400">{prod.motivo}</span>
                     </div>
                ))}
            </div>
        </div>
        
        {/* Resultados Esperados y Seguimiento */}
        <div className="bg-green-600 text-white p-3.5 sm:p-5 rounded-xl shadow-md border border-green-700">
             <h4 className="font-bold flex items-center gap-2 mb-2 sm:mb-3 text-base sm:text-lg">
                <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-200"/> Resultados y Seguimiento
            </h4>
             <p className="text-xs sm:text-sm text-green-100 mb-3 sm:mb-4">{diagnosis.seguimiento}</p>
             <div className="flex flex-wrap gap-1.5 sm:gap-2">
                 {diagnosis.resultadosEsperados.map((res, idx) => (
                       <span key={idx} className="text-[11px] sm:text-xs bg-green-800 text-green-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full font-bold shadow-sm flex items-center">
                           ✅ {res}
                       </span>
                 ))}
             </div>
        </div>

        {/* Imágenes de Referencia */}
        <div className="bg-gray-50 border border-gray-200 p-3.5 sm:p-5 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3 sm:mb-4 dark:text-gray-100 text-base sm:text-lg border-b pb-2 dark:border-gray-700">
                <CameraIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-700 dark:text-green-400"/> Ejemplos Visuales
            </h4>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                {diagnosis.imagenesReferencia.map((img, idx) => (
                    <ReferenceImage key={idx} term={img.terminoBusquedaWikipedia} description={img.descripcionEspanol} />
                ))}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4 text-center">Estas imágenes son buscadas en enciclopedias (o generadas por IA como respaldo) para servir como referencia visual de la plaga o el estado ideal de tu planta.</p>
        </div>
    </div>
    );
};

const PlantDoctorSection: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showProcessViewer, setShowProcessViewer] = useState(false);
    const [hasSkippedProcess, setHasSkippedProcess] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    };

    const handleFile = (file: File | null) => {
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Por favor, selecciona un archivo de imagen válido.');
                return;
            }
            reset();
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFile(e.target.files?.[0] || null);
        e.target.value = '';
    };
    
    const handleDragEvents = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragEnter = (e: React.DragEvent) => { handleDragEvents(e); setDragOver(true); };
    const handleDragLeave = (e: React.DragEvent) => { handleDragEvents(e); setDragOver(false); };
    const handleDrop = (e: React.DragEvent) => {
        handleDragEvents(e);
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0] || null);
    };

    const runDiagnosis = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        setDiagnosis(null);
        setShowProcessViewer(true);
        setHasSkippedProcess(false);
        
        // Auto scroll hacia el visor de los spots de proceso para visualizarlos de inmediato
        setTimeout(() => {
            const spotsEl = document.getElementById('spots-proceso-analisis') || resultsRef.current;
            spotsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);

        try {
            const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' && typeof process.env !== 'undefined' ? process.env.VITE_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY : undefined);
            if (!apiKey) throw new Error("API_KEY no está configurada.");
            const ai = new GoogleGenAI({ apiKey: apiKey });
            const imagePart = await fileToGenerativePart(imageFile);
            
            const unifiedSchema = {
                type: Type.OBJECT,
                properties: {
                    nombrePlanta: { type: Type.STRING, description: "Nombre común y popular de la planta." },
                    estadoGeneral: { type: Type.STRING, description: "Estado general (ej: 'Atención moderada', 'Crítico', 'Saludable')." },
                    diagnosticoBreve: { type: Type.STRING, description: "Párrafo conciso que explique el problema principal observado." },
                    problemasDetectados: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de problemas observables (ej: 'Puntos blancos distribuidos', 'Hojas con desgaste')." },
                    causasPosibles: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de causas posibles (ej: 'Ambiente poco ventilado', 'Humedad elevada')." },
                    tratamiento: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                paso: { type: Type.STRING, description: "Título del paso (ej: 'Paso 1 - Limpieza manual')." },
                                detalle: { type: Type.STRING, description: "Detalle de qué hacer y cómo." }
                            },
                            required: ["paso", "detalle"]
                        },
                        description: "Pasos numerados para tratamiento y control de plagas."
                    },
                    planRecuperacion: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Medidas a mediano plazo (ej: 'Mejorar ventilación', 'Revisar humedad')." },
                    sustratoRecomendado: { type: Type.STRING, description: "Nombre del sustrato de 'Suelo Urbano Tu Hogar'." },
                    luzYRiego: { type: Type.STRING, description: "Recomendaciones específicas de luz y riego." },
                    requerimientoLuzLux: {
                        type: Type.OBJECT,
                        properties: {
                            nivelLuz: { type: Type.STRING, description: "Categoría botánica de luz (ej: 'Luz indirecta brillante', 'Sol directo / Plena luz', 'Semisombra o sombra luminosa')." },
                            rangoLux: { type: Type.STRING, description: "Rango específico indispensable medido en LUX (ej: '2,500 - 4,500 Lux', '800 - 1,500 Lux', '10,000+ Lux'). DEBE contener el valor numérico y la palabra Lux." },
                            horasRecomendadas: { type: Type.STRING, description: "Horas sugeridas de luz al día (ej: '6 a 8 horas diarias')." },
                            descripcionUbicacion: { type: Type.STRING, description: "Ubicación ideal en casa o jardín (ej: 'A 1 metro de ventana este/sur con cortina delgada')." },
                            consejoMedicion: { type: Type.STRING, description: "Consejo práctico para medir con un luxómetro o aplicación móvil de lux a la altura de las hojas." }
                        },
                        required: ["nivelLuz", "rangoLux", "horasRecomendadas", "descripcionUbicacion", "consejoMedicion"],
                        description: "Requerimientos lumínicos técnicos y rango exacto en LUX para esta especie."
                    },
                    riegoYSustrato: {
                        type: Type.OBJECT,
                        properties: {
                            clasificacionEspecie: { 
                                type: Type.STRING, 
                                description: "Clasificación estricta: 'TOLERANTE' o 'SENSIBLE'." 
                            },
                            descripcionClasificacion: {
                                type: Type.STRING,
                                description: "Explicación breve de por qué esta especie pertenece a este grupo (tolerante o sensible al agua de la llave)."
                            },
                            puntos: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        numero: { type: Type.INTEGER, description: "Número del punto." },
                                        titulo: { type: Type.STRING, description: "Título del punto." },
                                        detalle: { type: Type.STRING, description: "Explicación detallada del punto." },
                                        tipo: { type: Type.STRING, description: "'agua' o 'sustrato'." }
                                    },
                                    required: ["numero", "titulo", "detalle", "tipo"]
                                },
                                description: "Puntos aplicables según la regla condicional: si es TOLERANTE incluye solo puntos 4 y 5. Si es SENSIBLE o con daño por sales incluye los 5 puntos."
                            }
                        },
                        required: ["clasificacionEspecie", "descripcionClasificacion", "puntos"],
                        description: "Apartado obligatorio de regla condicional de riego, agua y sustrato."
                    },
                    prevencion: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Consejos clave en viñetas para evitar que el problema vuelva." },
                    seguimiento: { type: Type.STRING, description: "Qué esperar en los próximos días/semanas." },
                    productosRecomendados: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                nombre: { type: Type.STRING, description: "Nombre del producto (ej: 'Suelo Urbano Tu Hogar' o 'Abono orgánico')." },
                                motivo: { type: Type.STRING, description: "Por qué se recomienda." }
                            },
                            required: ["nombre", "motivo"]
                        },
                        description: "Productos recomendados de Suelo Urbano."
                    },
                    imagenesReferencia: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                terminoBusquedaWikipedia: { type: Type.STRING, description: "Nombre científico exacto o nombre común muy específico para buscar fotos reales en Wikipedia (ej: 'Tetranychus urticae', 'Phytophthora infestans', 'Solanum lycopersicum'). DEBE ser muy preciso para Wikipedia." },
                                descripcionEspanol: { type: Type.STRING, description: "Descripción corta en español de lo que se busca (ej: 'Araña roja en hoja', 'Planta de jitomate sana')." }
                            },
                            required: ["terminoBusquedaWikipedia", "descripcionEspanol"]
                        },
                        description: "4 imágenes. Si hay daño/plaga: 3 de la plaga/enfermedad (nombres científicos) y 1 de la especie botánica de la planta sana. Si está sana: 4 fotos de la planta sana buscando su especie."
                    },
                    resultadosEsperados: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Beneficios de seguir el tratamiento." }
                },
                required: [
                    "nombrePlanta", "estadoGeneral", "diagnosticoBreve", "problemasDetectados", "causasPosibles", 
                    "tratamiento", "planRecuperacion", "sustratoRecomendado", "luzYRiego", "requerimientoLuzLux", "riegoYSustrato", "prevencion", 
                    "seguimiento", "productosRecomendados", "imagenesReferencia", "resultadosEsperados"
                ]
            };
            
            const prompt = `Actúa como un 'Doctor de Plantas' experto de Suelo Urbano Tu Hogar. Tu tarea es analizar la imagen y proporcionar un diagnóstico completo en un solo paso, siguiendo esta estructura exacta:
1. Nombre de la planta.
2. Estado general (ej: Atención moderada).
3. Diagnóstico breve: el problema principal.
4. Problemas detectados: lista de observaciones visibles.
5. Causas posibles: lista de por qué ocurrió.
6. Tratamiento y control de plagas: Plan de acción paso a paso. (Si hay plagas, indícalo. Si no, cómo solucionar el problema actual).
7. Plan de recuperación: Acciones de soporte.
8. Sustrato recomendado: Debe ser 'Suelo Urbano Tu Hogar' o variantes.
9. Luz y riego (luzYRiego): Ajustes necesarios de riego y humedad para la planta.
10. Diagnóstico Técnico de LUX (requerimientoLuzLux - OBLIGATORIO):
    - nivelLuz: Categoría botánica de luz (ej: 'Luz indirecta brillante', 'Sol directo', 'Sombra luminosa').
    - rangoLux: Rango exacto de intensidad en LUX indispensable para fotosíntesis saludable (ej: '2,500 - 4,500 Lux', '800 - 1,500 Lux', '10,000+ Lux').
    - horasRecomendadas: Fotoperiodo sugerido en horas al día (ej: '6 a 8 horas diarias').
    - descripcionUbicacion: Ubicación ideal recomendada en el hogar o jardín para captar los luxes adecuados sin quemarse.
    - consejoMedicion: Consejo práctico para medir los luxes con un luxómetro o una app gratuita de celular (como Photone o Lux Meter).
11. Regla de Riego y Sustrato (riegoYSustrato - OBLIGATORIO): Aplica estrictamente la siguiente regla condicional:

[REGLA DE DIAGNÓSTICO CONDICIONAL: RIEGO Y SUSTRATO]

PASO 1: IDENTIFICACIÓN DE LA ESPECIE
Al procesar la foto, identifica la especie de la planta y clasifícala en una de estas dos categorías:
- TOLERANTE AL AGUA DE LA LLAVE: (Ej. Teléfono/Poto, Sansevieria/Espada de San Jorge, Palo de Brasil, Cuna de Moisés/Espatifilo, Mala Madre/Cinta, Monsteras maduras, Suculentas comunes).
- SENSIBLE AL AGUA DE LA LLAVE: (Ej. Calateas, Orquídeas, Anturios, Helechos, Plantas Carnívoras, Marantas, Ficus Lyrata).

PASO 2: APLICACIÓN FILTRO DE AGUA (PUNTOS 1 AL 3)
- SI LA PLANTA ES TOLERANTE: Omite por completo los puntos sobre el cloro, la cal y el truco del reposo. No menciones nada sobre evitar el agua de la llave.
- SI LA PLANTA ES SENSIBLE O TIENE DAÑO VISIBLE POR SALES: Incluye obligatoriamente los Puntos 1, 2 y 3.

PASO 3: APLICACIÓN REGLA DE SUSTRATO Y AIRE (PUNTOS 4 Y 5)
Aplica estos dos puntos para TODAS las plantas de interior sin excepción, ya que todas sufren por falta de oxígeno y tierra compacta.

[ESTRUCTURA DE LOS 5 PUNTOS (CUANDO APLIQUE TODO)]
1. EVITAR AGUA DE LA LLAVE DIRECTA (Solo para plantas sensibles).
2. DAÑO POR CLORO Y CAL (Solo para plantas sensibles): Explica cómo el cloro y sales queman bordes y bloquean raíces.
3. EL TRUCO DEL REPOSO (Solo para plantas sensibles): Dejar reposar el agua 24-48 horas en recipiente abierto para evaporar cloro o usar agua filtrada/lluvia.
4. PELIGRO DEL EXCESO DE AGUA (ASFIXIA RADICULAR): Explica que el riego excesivo expulsa el aire de la tierra. Sin oxígeno, las raíces se asfixian, bloqueando la absorción de aire, agua y nutrientes. (Aplica para todas).
5. RECOMENDACIÓN DE TEPOJAL: Recomienda mezclar el sustrato con tepojal para mejorar la estructura, crear canales de aire y asegurar un buen drenaje. (Aplica para todas).

12. Prevención: Cómo evitar que regrese.
13. Seguimiento: Qué esperar ver pronto.
14. Productos recomendados: Lista de productos de la marca Suelo Urbano u orgánicos y por qué usarlos.
15. Resultados esperados: Mejoras.
16. Imágenes de referencia: 4 términos de búsqueda para Wikipedia (preferiblemente nombres científicos de la plaga u hongo, y el nombre científico de la planta sana).`;
            
            let lastError: any = null;
            let diagnosisData: any = null;
            
            // Lista de modelos resilientes en caso de alta demanda (503 / 429)
            const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
            
            for (const modelName of modelsToTry) {
                try {
                    const response = await ai.models.generateContent({
                        model: modelName,
                        contents: { parts: [imagePart, { text: prompt }] },
                        config: { responseMimeType: "application/json", responseSchema: unifiedSchema }
                    });

                    if (response.text) {
                        diagnosisData = JSON.parse(response.text);
                        // Asegurar diagnóstico de Lux botánico normalizado
                        diagnosisData.requerimientoLuzLux = ensureRequerimientoLuz(diagnosisData);
                        break; // Éxito, salir del bucle
                    }
                } catch (err: any) {
                    console.warn(`Intento con modelo ${modelName} falló:`, err);
                    lastError = err;
                    // Si el error es de alta demanda o temporal, probar el siguiente modelo
                    await new Promise(r => setTimeout(r, 600));
                }
            }

            if (diagnosisData) {
                // Garantizar requerimientoLuzLux
                diagnosisData.requerimientoLuzLux = ensureRequerimientoLuz(diagnosisData);
                setDiagnosis(diagnosisData);
                setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 180);
            } else {
                throw lastError || new Error("No se pudo obtener una respuesta del modelo.");
            }
        } catch (err: any) {
            console.error(err);
            const errStr = typeof err === 'string' ? err : err.message || JSON.stringify(err);
            
            if (errStr.includes("503") || errStr.includes("high demand") || errStr.includes("UNAVAILABLE")) {
                setError("Los servidores de IA están experimentando una alta demanda momentánea. Tus datos están a salvo; por favor haz clic en 'Reintentar Diagnóstico' para procesar tu planta.");
            } else if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("RESOURCE_EXHAUSTED")) {
                setError("Se ha alcanzado el límite temporal de consultas. Espera unos segundos y pulsa 'Reintentar Diagnóstico'.");
            } else if (errStr.includes("API_KEY")) {
                setError("La clave de API no está configurada correctamente. Revisa la configuración.");
            } else {
                setError("Ocurrió un inconveniente temporal al procesar la imagen. Puedes presionar 'Reintentar Diagnóstico' para volver a intentarlo.");
            }
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 180);
        } finally {
            setIsLoading(false);
        }
    };
    
    const generatePDF = async () => {
        if (!diagnosis) return;

        const doc = new jsPDF();
        let y = 20;
        const margin = 20;
        const pageWidth = doc.internal.pageSize.width;
        const contentWidth = pageWidth - (margin * 2);

        // Helper for multi-line text
        const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            const lines = doc.splitTextToSize(text, contentWidth);
            doc.text(lines, margin, y);
            y += (lines.length * fontSize * 0.4) + 2; // spacing
        };

        // --- Header ---
        doc.setFillColor(22, 101, 52); // Green-800
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Reporte del Doctor de Plantas", margin, 18);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Suelo Urbano Tu Hogar - Diagnóstico IA", margin, 25);
        
        y = 45; // Reset Y after header
        doc.setTextColor(0, 0, 0);

        // --- Plant Info & Image ---
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 101, 52);
        doc.text(diagnosis.nombrePlanta, margin, y);
        y += 8;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(80, 80, 80);
        doc.text(`Estado General: ${diagnosis.estadoGeneral}`, margin, y);
        y += 10;

        // Add Image if available
        if (imagePreview) {
            try {
                const img = new Image();
                img.src = imagePreview;
                
                await new Promise((resolve) => {
                    if (img.complete) resolve(true);
                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(false);
                });
                
                const imgHeight = 80;
                const imgWidth = (img.width / img.height) * imgHeight;
                const finalWidth = Math.min(imgWidth, contentWidth);
                const finalHeight = (img.height / img.width) * finalWidth;

                doc.addImage(img, 'JPEG', margin, y, finalWidth, finalHeight);
                y += finalHeight + 10;
            } catch (e) {
                console.error("Could not add image to PDF", e);
            }
        }

        // --- Brief Diagnosis ---
        addWrappedText("Diagnóstico:", 14, true);
        addWrappedText(diagnosis.diagnosticoBreve, 11);
        y += 5;
        
        // --- Problems and Causes ---
        if (y > 230) { doc.addPage(); y = 20; }
        
        addWrappedText("Problemas Detectados:", 12, true);
        diagnosis.problemasDetectados.forEach((item) => {
            addWrappedText(`• ${item}`, 11);
        });
        y += 3;
        
        addWrappedText("Causas Posibles:", 12, true);
        diagnosis.causasPosibles.forEach((item) => {
            addWrappedText(`• ${item}`, 11);
        });
        y += 5;

        // --- Detailed Diagnosis ---
        if (y > 230) { doc.addPage(); y = 20; }
        addWrappedText("Tratamiento y Control:", 14, true);
        diagnosis.tratamiento.forEach((step, i) => {
            if (y > 270) { doc.addPage(); y = 20; }
            addWrappedText(`${i + 1}. ${step.paso}:`, 11, true);
            addWrappedText(step.detalle, 11);
            y += 2;
        });
        y += 5;
        
        if (y > 230) { doc.addPage(); y = 20; }
        addWrappedText("Luz y Riego recomendado:", 12, true);
        addWrappedText(diagnosis.luzYRiego, 11);
        y += 3;

        const pdfLux = ensureRequerimientoLuz(diagnosis);
        if (y > 240) { doc.addPage(); y = 20; }
        addWrappedText(`Requerimiento de Iluminación: ${pdfLux.rangoLux} (${pdfLux.nivelLuz})`, 11, true);
        addWrappedText(`Horas de luz: ${pdfLux.horasRecomendadas}. Ubicación: ${pdfLux.descripcionUbicacion}`, 10);
        addWrappedText(`Consejo para medir Lux: ${pdfLux.consejoMedicion}`, 10);
        y += 3;
        y += 2;

        // --- Regla Condicional de Riego y Sustrato ---
        if (diagnosis.riegoYSustrato) {
            if (y > 220) { doc.addPage(); y = 20; }
            addWrappedText("Regla de Diagnóstico: Riego y Sustrato", 14, true);
            const esSensible = diagnosis.riegoYSustrato.clasificacionEspecie === 'SENSIBLE';
            addWrappedText(`Clasificación: ${esSensible ? 'Sensible al Agua de la Llave (Cloro/Sales)' : 'Tolerante al Agua de la Llave'}`, 11, true);
            addWrappedText(diagnosis.riegoYSustrato.descripcionClasificacion, 11);
            y += 2;
            
            diagnosis.riegoYSustrato.puntos.forEach((p) => {
                if (y > 260) { doc.addPage(); y = 20; }
                addWrappedText(`Punto ${p.numero}: ${p.titulo}`, 11, true);
                addWrappedText(p.detalle, 10);
                y += 2;
            });
            y += 4;
        }

        // --- Prevent and Follow up ---
        if (y > 230) { doc.addPage(); y = 20; }
        addWrappedText("Plan de Recuperación:", 12, true);
        diagnosis.planRecuperacion.forEach((item) => {
           addWrappedText(`• ${item}`, 11);
        });
        y += 3;

        addWrappedText("Resultados Esperados:", 12, true);
        const resultados = diagnosis.resultadosEsperados.join(", ");
        addWrappedText(resultados, 11);
        y += 5;

        // --- Fertilizer / Substrato ---
        if (y > 230) { doc.addPage(); y = 20; }
        addWrappedText("Productos Recomendados:", 14, true);
        
        addWrappedText("Sustrato recomendado:", 11, true);
        addWrappedText(diagnosis.sustratoRecomendado, 11);
        y+=2;
        
        diagnosis.productosRecomendados.forEach((p) => {
           addWrappedText(`${p.nombre}:`, 11, true);
           addWrappedText(p.motivo, 11);
           y+=2;
        });

        // --- Footer ---
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('Generado por Suelo Urbano Tu Hogar', pageWidth / 2, 285, { align: 'center' });
        }

        doc.save(`${diagnosis.nombrePlanta.replace(/\s+/g, '_')}_Diagnostico.pdf`);
    };
    
    const handleSaveToGarden = async () => {
        if (!diagnosis || !imageFile) return;
        setIsSaving(true);
        try {
            const base64Img = await resizeImageToBase64(imageFile);
            const success = saveToGarden({
                name: diagnosis.nombrePlanta,
                health: diagnosis.estadoGeneral,
                diagnosis: diagnosis.diagnosticoBreve,
                actionPlan: diagnosis.tratamiento,
                beforeImage: base64Img,
                problemasDetectados: diagnosis.problemasDetectados,
                causasPosibles: diagnosis.causasPosibles,
                planRecuperacion: diagnosis.planRecuperacion,
                sustratoRecomendado: diagnosis.sustratoRecomendado,
                luzYRiego: diagnosis.luzYRiego,
                requerimientoLuzLux: diagnosis.requerimientoLuzLux,
                riegoYSustrato: diagnosis.riegoYSustrato,
                prevencion: diagnosis.prevencion,
                seguimiento: diagnosis.seguimiento,
                productosRecomendados: diagnosis.productosRecomendados,
                resultadosEsperados: diagnosis.resultadosEsperados,
                status: diagnosis.estadoGeneral?.toLowerCase().includes('crítico') ? 'critico' : 'en_tratamiento'
            });
            if (success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                alert("No se pudo guardar la planta. Tal vez tu almacenamiento está lleno.");
            }
        } catch (error) {
            console.error("Error saving to garden", error);
            alert("Hubo un problema procesando la imagen de tu planta.");
        } finally {
            setIsSaving(false);
        }
    };

    const reset = () => {
        setImageFile(null);
        setImagePreview(null);
        setDiagnosis(null);
        setError(null);
        setIsLoading(false);
        setShowProcessViewer(false);
        setHasSkippedProcess(false);
    };

    const renderResults = () => {
        if (isLoading) {
            return (
                <div className="w-full text-center space-y-4 py-2 animate-fade-in">
                    {/* Header de Análisis con Mascota animada */}
                    <div className="flex items-center justify-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm text-left">
                        <img src={DOCTOR_MASCOT_URL} alt="Doctor de Plantas pensando" className="h-12 w-12 sm:h-16 sm:w-16 animate-bounce flex-shrink-0" />
                        <div>
                            <p className="font-extrabold text-sm sm:text-base text-emerald-900 dark:text-emerald-200">
                                🔬 El Doctor de Plantas está analizando tu imagen...
                            </p>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                                Evaluando hojas, follaje y posibles plagas. Revisa arriba los spots con los 5 procesos de regeneración botánica Suelo Urbano.
                            </p>
                        </div>
                    </div>

                    {/* Barra animada de progreso */}
                    <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2 overflow-hidden shadow-inner">
                        <div className="bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 h-full rounded-full animate-pulse w-4/5 transition-all duration-1000"></div>
                    </div>

                    {/* Indicador de proceso botánico */}
                    <div className="bg-stone-900 text-stone-200 p-4 rounded-2xl border border-emerald-500/30 text-xs sm:text-sm text-center shadow-md space-y-1.5">
                        <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            <span>Reproduciendo arriba los 5 Procesos Suelo Urbano</span>
                        </div>
                        <p className="text-stone-300 text-xs max-w-sm mx-auto">
                            Descubre cómo actúan nuestras fórmulas mientras la IA examina tu muestra. Al terminar el diagnóstico, aparecerá una pantalla emergente para que decidas si deseas saltarlo o seguir viendo los videos.
                        </p>
                    </div>
                </div>
            );
        }
        if (error) {
            return (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-2xl p-6 w-full text-center space-y-4 shadow-sm animate-fade-in">
                    <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
                        <QuestionMarkCircleIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-lg text-red-800 dark:text-red-300 mb-1">
                            Aviso del Consultorio Botánico
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-200/90 leading-relaxed font-medium">
                            {error}
                        </p>
                    </div>
                    {imageFile && (
                        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                            <button
                                onClick={runDiagnosis}
                                disabled={isLoading}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer"
                            >
                                🔄 Reintentar Diagnóstico
                            </button>
                            <button
                                onClick={reset}
                                className="px-5 py-2.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 font-bold rounded-xl transition-all text-sm cursor-pointer"
                            >
                                Cambiar Foto
                            </button>
                        </div>
                    )}
                </div>
            );
        }
        if (diagnosis) {
            return (
                <div className="w-full">
                    <DiagnosisView diagnosis={diagnosis} />
                    
                    <div className="mt-4 sm:mt-6 border-t border-gray-200 pt-4 sm:pt-6 dark:border-gray-600 flex flex-col gap-2.5 sm:gap-3">
                        <button 
                            onClick={generatePDF}
                            className="w-full bg-gray-800 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl hover:bg-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md flex items-center justify-center gap-2 text-xs sm:text-base dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                            <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
                            Descargar Reporte Completo PDF
                        </button>
                        
                        <button 
                            onClick={handleSaveToGarden}
                            disabled={isSaving || saveSuccess}
                            className={`w-full font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm border-2 text-xs sm:text-base cursor-pointer
                                ${saveSuccess 
                                    ? 'bg-green-100 text-green-800 border-green-500 dark:bg-green-900/50 dark:text-green-300 dark:border-green-600 cursor-default' 
                                    : 'bg-white text-green-700 border-green-700 hover:bg-green-50 hover:scale-105 dark:bg-transparent dark:text-green-300 dark:border-green-500 dark:hover:bg-green-900/40'}`}
                        >
                            <HeartbeatIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
                            {isSaving ? 'Guardando...' : saveSuccess ? '¡Guardado en Mi Jardín!' : 'Guardar en "Mi Jardín Urbano" 🗓️'}
                        </button>
                        
                        <p className="text-[11px] sm:text-xs text-gray-500 text-center mt-1">Guarda este diagnóstico para ver su evolución o descargar el PDF.</p>
                    </div>
                </div>
            );
        }
        // Default view: Show disabled button to prove code is deployed
        return (
            <div className="text-gray-500 dark:text-gray-400 flex flex-col items-center py-2 sm:py-4">
                <img src={DOCTOR_MASCOT_URL} alt="Doctor de Plantas Mascota" className="h-16 w-16 sm:h-24 sm:w-24 mx-auto mb-2 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold">El diagnóstico aparecerá aquí</h3>
                <p className="text-xs sm:text-sm mb-3 sm:mb-6">Sube o toma una foto de tu planta para empezar.</p>
                
                {/* Button visible but disabled to prove existence */}
                <button 
                    disabled
                    className="bg-gray-200 text-gray-400 font-bold py-2 px-4 sm:px-6 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 border-2 border-gray-200 opacity-70 text-xs sm:text-sm"
                >
                    <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
                    Diagnostica para descargar PDF
                </button>
            </div>
        );
    };

    return (
        <section id="seccion-doctor-planta" className="py-6 md:py-14">
            <div className="container mx-auto px-3 sm:px-6">
                {/* Sección Fija de Anuncio Publicitario Suelo Urbano - En la parte superior */}
                <DoctorAdBanner />

                <div className="text-center mb-4 md:mb-10 pt-2 md:pt-4 border-t border-gray-200 dark:border-gray-800">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-900 mb-1 md:mb-4 dark:text-gray-100">Doctor de Plantas con IA</h2>
                    <p className="hidden md:block max-w-3xl mx-auto text-sm sm:text-base text-gray-700 dark:text-gray-300">
                        ¿Tu planta se ve triste? Sube una foto y nuestra IA te dará un diagnóstico y un plan de acción para recuperarla.
                    </p>
                    <div className="hidden md:flex max-w-3xl mx-auto mt-3 md:mt-4 text-[11px] sm:text-xs text-gray-500 bg-white border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 p-2.5 sm:p-3 rounded-lg items-start text-left gap-2 shadow-sm">
                        <QuestionMarkCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 text-gray-400" />
                        <span>Nuestra IA está en constante aprendizaje. Los diagnósticos son una guía y pueden cometer errores. Para problemas serios, considera consultar a un experto.</span>
                    </div>
                </div>

                {/* Aviso / Acceso rápido en móviles cuando ya existe diagnóstico */}
                {diagnosis && (
                    <div className="lg:hidden mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                                ✨ ¡Diagnóstico listo para: {diagnosis.nombrePlanta}!
                            </p>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                                Desliza o toca para revisar tu receta botánica
                            </p>
                        </div>
                        <button
                            onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            className="flex-shrink-0 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg shadow active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                            <span>Ver receta</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* VISOR DE LOS 5 SPOTS DE PROCESO ENCIMA DEL DOCTOR DE PLANTAS */}
                {(isLoading || (showProcessViewer && !hasSkippedProcess)) && (
                    <div id="spots-proceso-analisis" className="mb-6 animate-fade-in">
                        <AnalysisProcessViewer
                            isAnalyzing={isLoading}
                            isDiagnosisReady={!!diagnosis}
                            diagnosisSummary={
                                diagnosis
                                    ? {
                                          nombrePlanta: diagnosis.nombrePlanta,
                                          estadoGeneral: diagnosis.estadoGeneral,
                                          diagnosticoBreve: diagnosis.diagnosticoBreve,
                                      }
                                    : null
                            }
                            onSkipToDiagnosis={() => {
                                setHasSkippedProcess(true);
                                setTimeout(() => {
                                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 150);
                            }}
                        />
                    </div>
                )}

                {/* Botón para volver a ver los spots de proceso cuando ya se tiene diagnóstico pero se hizo skip */}
                {diagnosis && hasSkippedProcess && (
                    <div className="mb-4 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setHasSkippedProcess(false);
                                setTimeout(() => {
                                    document.getElementById('spots-proceso-analisis')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 100);
                            }}
                            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800 px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
                        >
                            <span>🎬 Ver spots de los 5 procesos botánicos Suelo Urbano</span>
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-12 items-start">
                    {/* Contenedor de subida de imagen: Fondo blanco con sombras fuertes */}
                    <div id="doctor-uploader" className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl md:shadow-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        {!imagePreview ? (
                            <div onDragEnter={handleDragEnter} onDragOver={handleDragEvents} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-colors duration-300 ${dragOver ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                                <CameraIcon className="h-10 w-10 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-2 sm:mb-4" />
                                <p className="text-gray-700 font-semibold mb-1 text-sm sm:text-base dark:text-gray-300">Arrastra una foto de tu planta aquí</p>
                                <p className="text-gray-500 mb-3 text-xs sm:text-sm dark:text-gray-400">o</p>
                                <div className="flex flex-row justify-center gap-2 sm:gap-4">
                                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-initial bg-white text-green-700 font-bold py-2 px-3 sm:px-6 rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors text-xs sm:text-sm dark:bg-gray-700 dark:text-green-300 dark:border-green-600 dark:hover:bg-gray-600 cursor-pointer">Elegir Archivo</button>
                                    <button onClick={() => cameraInputRef.current?.click()} className="flex-1 sm:flex-initial bg-white text-green-700 font-bold py-2 px-3 sm:px-6 rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors text-xs sm:text-sm dark:bg-gray-700 dark:text-green-300 dark:border-green-600 dark:hover:bg-gray-600 cursor-pointer">Usar Cámara</button>
                                </div>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                                <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageChange} className="hidden" />
                            </div>
                        ) : (
                            <div className="text-center">
                                <img src={imagePreview} alt="Vista previa de la planta a diagnosticar" className="max-h-56 sm:max-h-80 w-auto mx-auto rounded-lg shadow-md mb-4 sm:mb-6 object-contain" />
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                    <button onClick={runDiagnosis} disabled={isLoading} className="bg-green-600 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-green-700 transition-all transform hover:scale-105 shadow-md disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer">
                                        {isLoading ? 'Analizando...' : 'Diagnosticar Planta'}
                                    </button>
                                    <button onClick={reset} className="bg-gray-200 text-gray-700 font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-gray-300 transition-colors text-sm sm:text-base dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 cursor-pointer">
                                        Cambiar Imagen
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Resultados: Fondo blanco para contraste limpio */}
                    <div ref={resultsRef} id="doctor-results" className="bg-white border border-gray-200 p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl h-full flex flex-col justify-center items-center text-center min-h-[160px] sm:min-h-[260px] md:min-h-[400px] dark:bg-gray-800 dark:border-gray-700">
                        {renderResults()}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlantDoctorSection;
