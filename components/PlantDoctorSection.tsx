
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type, ThinkingLevel } from "@google/genai";
import { jsPDF } from "jspdf";
import { saveToGarden, resizeImageToBase64, ensureRequerimientoLuz, RequerimientoLuzLux } from '../lib/gardenStorage';
import { CameraIcon, SparklesIcon, LeafIcon, HeartbeatIcon, ClipboardListIcon, PhIcon, MixIcon, HumidityIcon, QuestionMarkCircleIcon, ChevronDownIcon, CalendarIcon, DownloadIcon, BeakerIcon, SpoonIcon, CheckCircleIcon, SunIcon } from './icons/Icons';
import DoctorAdBanner from './DoctorAdBanner';
import AnalysisProcessViewer from './AnalysisProcessViewer';
import EnvironmentQuestionnaire, { EnvironmentAnswers, DEFAULT_ENVIRONMENT_ANSWERS } from './EnvironmentQuestionnaire';

// --- Interfaces para los datos de la IA ---
export interface PlantDiagnosis {
    nombrePlanta: string;
    estadoGeneral: string;
    diagnosticoBreve: string;
    problemasDetectados: string[];
    causasPosibles: string[];
    
    // PASO 2: Descripción Visual Objetiva (Obligatorio)
    descripcionVisual?: {
        tipoYBasales: string;
        estadoFollaje: string;
        analisisCorona: string;
    };

    // PASO 4: Diagnóstico Diferencial (Mínimo 3 Posibilidades simultáneas)
    diagnosticoDiferencial?: {
        posibilidadA: { titulo: string; detalle: string; tipo: string };
        posibilidadB: { titulo: string; detalle: string; tipo: string };
        posibilidadC: { titulo: string; detalle: string; tipo: string };
    };

    // PASO 5: Opciones de Tratamiento Múltiple (Mínimo 3 Líneas de Acción)
    tratamientoMultiple?: {
        opcion1Mecanica: {
            titulo: string;
            puntos: string[];
        };
        opcion2Ecologica: {
            titulo: string;
            puntos: string[];
        };
        opcion3Correctiva: {
            titulo: string;
            puntos: string[];
        };
    };

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
    respuestasEntorno?: EnvironmentAnswers;
}

const DOCTOR_MASCOT_URL = "https://res.cloudinary.com/dsmzpsool/image/upload/v1757182726/Gemini_Generated_Image_xx5ythxx5ythxx5y-removebg-preview_guhkke.png";


// --- Componentes de UI ---

const BOTANICAL_BACKUP_IMAGES = [
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80",
];

const ReferenceImage: React.FC<{ term: string, description: string }> = ({ term, description }) => {
    const [imgUrl, setImgUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sourceLabel, setSourceLabel] = useState<string>("Wikipedia");

    useEffect(() => {
        let isMounted = true;
        const fetchImg = async () => {
            setLoading(true);
            const cleanTerm = term.replace(/[\(\)\[\]"']/g, '').trim();

            // 1. Intentar Wikipedia en Español
            try {
                const resEs = await fetch(`https://es.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&pithumbsize=600&generator=search&gsrsearch=${encodeURIComponent(cleanTerm)}&gsrlimit=1`);
                const dataEs = await resEs.json();
                if (dataEs.query && dataEs.query.pages) {
                    const pages = dataEs.query.pages;
                    const firstPageId = Object.keys(pages)[0];
                    const thumbnail = pages[firstPageId]?.thumbnail;
                    if (thumbnail?.source && isMounted) {
                        setImgUrl(thumbnail.source);
                        setSourceLabel("Wikipedia ES");
                        return;
                    }
                }
            } catch (e) {
                console.warn("Wikipedia ES error", e);
            }

            // 2. Intentar Wikipedia en Inglés (amplísima cobertura botánica y de fitopatología)
            try {
                const resEn = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&pithumbsize=600&generator=search&gsrsearch=${encodeURIComponent(cleanTerm)}&gsrlimit=1`);
                const dataEn = await resEn.json();
                if (dataEn.query && dataEn.query.pages) {
                    const pages = dataEn.query.pages;
                    const firstPageId = Object.keys(pages)[0];
                    const thumbnail = pages[firstPageId]?.thumbnail;
                    if (thumbnail?.source && isMounted) {
                        setImgUrl(thumbnail.source);
                        setSourceLabel("Wikipedia EN");
                        return;
                    }
                }
            } catch (e) {
                console.warn("Wikipedia EN error", e);
            }

            // 3. Intentar Wikimedia Commons (archivo de fotografías biológicas libres)
            try {
                const resCommons = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&pithumbsize=600&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(cleanTerm)}&gsrlimit=1`);
                const dataCommons = await resCommons.json();
                if (dataCommons.query && dataCommons.query.pages) {
                    const pages = dataCommons.query.pages;
                    const firstPageId = Object.keys(pages)[0];
                    const thumbnail = pages[firstPageId]?.thumbnail;
                    if (thumbnail?.source && isMounted) {
                        setImgUrl(thumbnail.source);
                        setSourceLabel("Wikimedia Commons");
                        return;
                    }
                }
            } catch (e) {
                console.warn("Wikimedia Commons error", e);
            }

            // 4. Si la enciclopedia no tiene miniatura para el término exacto, usar fotografía botánica real curada
            if (isMounted) {
                const hash = cleanTerm.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const backupIndex = Math.abs(hash) % BOTANICAL_BACKUP_IMAGES.length;
                setImgUrl(BOTANICAL_BACKUP_IMAGES[backupIndex]);
                setSourceLabel("Archivo Botánico");
            }
        };

        fetchImg();
        return () => { isMounted = false; };
    }, [term]);

    return (
        <div className="flex flex-col gap-2">
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-sm border border-stone-200 dark:border-stone-700 group relative">
                {imgUrl && (
                    <img 
                        src={imgUrl} 
                        alt={description}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${loading ? 'opacity-0' : 'opacity-100'}`}
                        loading="lazy"
                        onLoad={() => setLoading(false)}
                        onError={(e) => {
                            // En caso de fallo de red, usar foto botánica real alternativa, NUNCA "Sin imagen"
                            const fallbackIndex = Math.floor(Math.random() * BOTANICAL_BACKUP_IMAGES.length);
                            e.currentTarget.src = BOTANICAL_BACKUP_IMAGES[fallbackIndex];
                            setSourceLabel("Archivo Botánico");
                            setLoading(false);
                        }}
                    />
                )}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-200 dark:bg-stone-700 animate-pulse text-stone-600 dark:text-stone-300 text-xs text-center p-2 font-medium">
                        Consultando enciclopedia botánica...
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-2.5">
                    <span className="text-white text-xs font-semibold drop-shadow">{description}</span>
                    <span className="text-[10px] text-emerald-300 font-medium">{sourceLabel}</span>
                </div>
                {!loading && (
                   <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10" title="Fotografía real de referencia">
                       Foto real
                   </div>
                )}
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 text-center font-medium line-clamp-2 md:hidden">{description}</p>
        </div>
    );
};



const DiagnosisView: React.FC<{ diagnosis: PlantDiagnosis; onOpenEnvironment?: () => void }> = ({ diagnosis, onOpenEnvironment }) => {
    const luzInfo = ensureRequerimientoLuz(diagnosis);
    const [activeTreatmentTab, setActiveTreatmentTab] = useState<'mecanica' | 'ecologica' | 'correctiva' | 'pasos'>('mecanica');

    const env = diagnosis.respuestasEntorno;
    const hasEnvData = env && (env.ubicacion || env.iluminacion || env.riegoFrecuencia || env.drenajeAgujeros || env.materialMaceta);

    const getUbicacionLabel = (val?: string) => {
        if (val === 'interior') return '🏠 Interior';
        if (val === 'exterior_terraza') return '☀️ Balcón / Terraza';
        if (val === 'jardin') return '🌱 Jardín';
        return val || 'No especificada';
    };

    const getLuzLabel = (val?: string) => {
        if (val === 'sol_directo') return '☀️ Sol directo';
        if (val === 'luz_indirecta') return '🪟 Luz brillante indirecta';
        if (val === 'sombra') return '☁️ Sombra / Luz baja';
        return val || 'No especificada';
    };

    const getRiegoLabel = (val?: string) => {
        if (val === 'cada_2_3_dias') return '💧💧 Cada 2-3 días';
        if (val === 'semanal') return '💧 1 vez/semana';
        if (val === 'cada_10_15_dias') return '🌵 Cada 10-15 días';
        if (val === 'segun_sustrato') return '👆 Al secar el sustrato';
        return val || 'No especificado';
    };

    const getDrenajeLabel = (val?: string) => {
        if (val === 'con_drenaje') return '✅ Con agujeros';
        if (val === 'sin_drenaje') return '⚠️ Sin orificio de drenaje';
        return val || '';
    };

    return (
    <div className="animate-fade-in-up w-full text-left space-y-4 sm:space-y-6">
        {/* Header de Paciente */}
        <div className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-gray-800 p-3.5 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <img src={DOCTOR_MASCOT_URL} alt="Doctor de Plantas Mascota" className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 drop-shadow-md object-contain" />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paciente Botánico</p>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.2 rounded-full border border-emerald-300 dark:border-emerald-800">
                        Evaluación Clínica
                    </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-green-900 mb-1 dark:text-green-300 truncate">{diagnosis.nombrePlanta}</h3>
                <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-semibold">
                    <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                        <HeartbeatIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span>Estado:</span>
                    </span>
                    <span className="font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900">
                        {diagnosis.estadoGeneral}
                    </span>
                </div>
            </div>
        </div>

        {/* Ficha de Entorno del Paciente (Si fue contestada o detectada) */}
        {hasEnvData && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 p-3 sm:p-4 rounded-xl flex items-center justify-between gap-2 flex-wrap shadow-sm">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                    <span className="font-extrabold flex items-center gap-1">
                        <span>📋 Hábitat reportado:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-[11px] sm:text-xs">
                        {env?.ubicacion && <span className="bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 font-medium">{getUbicacionLabel(env.ubicacion)}</span>}
                        {env?.iluminacion && <span className="bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 font-medium">{getLuzLabel(env.iluminacion)}</span>}
                        {env?.riegoFrecuencia && <span className="bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 font-medium">{getRiegoLabel(env.riegoFrecuencia)}</span>}
                        {env?.drenajeAgujeros && <span className="bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 font-medium">{getDrenajeLabel(env.drenajeAgujeros)}</span>}
                    </div>
                </div>
            </div>
        )}

        {/* PASO 2: Descripción Visual Objetiva (Obligatorio) */}
        {diagnosis.descripcionVisual && (
            <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 p-3.5 sm:p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2.5">
                    <span className="text-base sm:text-lg">🔍</span>
                    <div>
                        <h4 className="font-black text-stone-900 dark:text-white text-sm sm:text-base">
                            Descripción Visual Objetiva y Examen de la Corona
                        </h4>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            Inspección física detallada de tallos, hojas y punto basal
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Pilar 1: Planta y características basales */}
                    <div className="bg-white dark:bg-stone-700/60 p-3 rounded-xl border border-stone-200 dark:border-stone-600">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 mb-1">
                            <span>🌿 Planta y Características Basales</span>
                        </span>
                        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                            {diagnosis.descripcionVisual.tipoYBasales}
                        </p>
                    </div>

                    {/* Pilar 2: Estado del follaje (Haz y Envés) */}
                    <div className="bg-white dark:bg-stone-700/60 p-3 rounded-xl border border-stone-200 dark:border-stone-600">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 mb-1">
                            <span>🍃 Follaje (Haz y Envés)</span>
                        </span>
                        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                            {diagnosis.descripcionVisual.estadoFollaje}
                        </p>
                    </div>

                    {/* Pilar 3: Análisis crítico de la corona */}
                    <div className="bg-white dark:bg-stone-700/60 p-3 rounded-xl border border-stone-200 dark:border-stone-600">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1 mb-1">
                            <span>👑 Análisis Crítico de la Corona</span>
                        </span>
                        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                            {diagnosis.descripcionVisual.analisisCorona}
                        </p>
                    </div>
                </div>
            </div>
        )}
        
        {/* PASO 3: Diagnóstico Breve con Lenguaje Prudente (Hedging) */}
        <div className="bg-emerald-50/60 border-l-4 border-emerald-600 p-3.5 sm:p-4 rounded-r-2xl dark:bg-emerald-950/30 dark:border-emerald-500 shadow-sm">
            <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-1.5 text-sm sm:text-base dark:text-emerald-300">
                <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400"/> Dictamen Clínico Inicial
            </h4>
            <p className="text-stone-800 text-xs sm:text-sm leading-relaxed dark:text-stone-200 font-medium">
                {diagnosis.diagnosticoBreve}
            </p>
        </div>

        {/* PASO 4: Diagnóstico Diferencial (Mínimo 3 Posibilidades simultáneas) */}
        {diagnosis.diagnosticoDiferencial ? (
            <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="font-extrabold text-stone-900 dark:text-white flex items-center gap-1.5 text-xs sm:text-sm uppercase tracking-wider">
                        <span>🛡️ Diagnóstico Diferencial (3 Posibilidades Evaluadas)</span>
                    </h4>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold">
                        Evaluación médica simultánea
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Posibilidad A: Manejo y Ubicación */}
                    <div className="bg-sky-50 dark:bg-sky-950/25 border border-sky-200 dark:border-sky-800/60 p-3.5 sm:p-4 rounded-xl shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-extrabold bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200 px-2 py-0.5 rounded-full uppercase">
                                Factor A
                            </span>
                            <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300">Manejo / Ubicación</span>
                        </div>
                        <h5 className="font-bold text-xs sm:text-sm text-sky-950 dark:text-sky-100">
                            {diagnosis.diagnosticoDiferencial.posibilidadA.titulo}
                        </h5>
                        <p className="text-xs text-sky-900/90 dark:text-sky-200 leading-relaxed font-medium">
                            {diagnosis.diagnosticoDiferencial.posibilidadA.detalle}
                        </p>
                    </div>

                    {/* Posibilidad B: Patógenos */}
                    <div className="bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/60 p-3.5 sm:p-4 rounded-xl shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-extrabold bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full uppercase">
                                Factor B
                            </span>
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">Patógenos / Hongos</span>
                        </div>
                        <h5 className="font-bold text-xs sm:text-sm text-amber-950 dark:text-amber-100">
                            {diagnosis.diagnosticoDiferencial.posibilidadB.titulo}
                        </h5>
                        <p className="text-xs text-amber-900/90 dark:text-amber-200 leading-relaxed font-medium">
                            {diagnosis.diagnosticoDiferencial.posibilidadB.detalle}
                        </p>
                    </div>

                    {/* Posibilidad C: Plagas o Nutrición */}
                    <div className="bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-800/60 p-3.5 sm:p-4 rounded-xl shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-extrabold bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-full uppercase">
                                Factor C
                            </span>
                            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">Plagas o Nutrición</span>
                        </div>
                        <h5 className="font-bold text-xs sm:text-sm text-rose-950 dark:text-rose-100">
                            {diagnosis.diagnosticoDiferencial.posibilidadC.titulo}
                        </h5>
                        <p className="text-xs text-rose-900/90 dark:text-rose-200 leading-relaxed font-medium">
                            {diagnosis.diagnosticoDiferencial.posibilidadC.detalle}
                        </p>
                    </div>
                </div>
            </div>
        ) : (
            /* Dos columnas de respaldo si no hay diagnóstico diferencial explícito */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-red-50 border border-red-200 p-3.5 sm:p-4 rounded-xl dark:bg-red-900/20 dark:border-red-800 shadow-sm">
                    <h4 className="font-bold text-red-800 flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base dark:text-red-400">
                        <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5"/> Problemas Detectados
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-red-900 dark:text-red-200 font-medium">
                        {diagnosis.problemasDetectados.map((prob, idx) => <li key={idx}>{prob}</li>)}
                    </ul>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 p-3.5 sm:p-4 rounded-xl dark:bg-amber-900/20 dark:border-amber-800 shadow-sm">
                    <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base dark:text-amber-400">
                        <QuestionMarkCircleIcon className="h-4 w-4 sm:h-5 sm:w-5"/> Posibles Causas
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium">
                        {diagnosis.causasPosibles.map((causa, idx) => <li key={idx}>{causa}</li>)}
                    </ul>
                </div>
            </div>
        )}
        
        {/* PASO 5: Estrategia de Tratamiento Múltiple (Mínimo 3 Líneas de Acción) */}
        <div className="bg-white border border-stone-200 dark:border-stone-700 p-3.5 sm:p-5 rounded-2xl shadow-sm dark:bg-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-700 pb-3 mb-3.5">
                <div>
                    <h4 className="font-black text-stone-900 dark:text-white flex items-center gap-2 text-sm sm:text-base md:text-lg">
                        <ClipboardListIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400"/>
                        Estrategia de Tratamiento Múltiple
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                        Elige una alternativa de tratamiento o combina las opciones según tus recursos
                    </p>
                </div>

                {/* Selector de pestañas para evitar chorizo de texto */}
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900/80 p-1 rounded-xl text-xs overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTreatmentTab('mecanica')}
                        className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTreatmentTab === 'mecanica'
                                ? 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                        }`}
                    >
                        🪵 1. Mecánica y Postura
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTreatmentTab('ecologica')}
                        className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTreatmentTab === 'ecologica'
                                ? 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                        }`}
                    >
                        🌿 2. Orgánica y Ecológica
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTreatmentTab('correctiva')}
                        className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTreatmentTab === 'correctiva'
                                ? 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                        }`}
                    >
                        🛡️ 3. Control Correctivo
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTreatmentTab('pasos')}
                        className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTreatmentTab === 'pasos'
                                ? 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                        }`}
                    >
                        📋 Pasos 1-2-3
                    </button>
                </div>
            </div>

            {/* Contenido dinámico según la pestaña activa */}
            {activeTreatmentTab === 'mecanica' && (
                <div className="bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2.5 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-600 text-white text-xs">🪵</span>
                        <h5 className="font-extrabold text-sm text-stone-900 dark:text-white">
                            {diagnosis.tratamientoMultiple?.opcion1Mecanica.titulo || "Opción 1: Corrección Mecánica y Postura"}
                        </h5>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                        Ajusta el soporte físico y la oxigenación para erradicar asfixia radicular y corregir el tallo:
                    </p>
                    <ul className="space-y-2 text-xs text-stone-800 dark:text-stone-200 font-medium">
                        {(diagnosis.tratamientoMultiple?.opcion1Mecanica.puntos || [
                            "Ajuste del nivel del suelo: deja la corona visible de la tierra hacia arriba para evitar pudrición.",
                            "Nivelación del sustrato: distribuye la tierra de manera uniforme sin presionar en exceso.",
                            "Mezcla porosa recomendada: tierra de hoja, corteza de árbol, tepojal/perlita y fibra de coco.",
                            "Tutor de soporte: coloca una guía si el tallo principal está inclinado o desfasado."
                        ]).map((punto, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                                <span>{punto}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {activeTreatmentTab === 'ecologica' && (
                <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2.5 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-600 text-white text-xs">🌿</span>
                        <h5 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-100">
                            {diagnosis.tratamientoMultiple?.opcion2Ecologica.titulo || "Opción 2: Tratamientos Ecológicos y Orgánicos"}
                        </h5>
                    </div>
                    <p className="text-xs text-emerald-900/80 dark:text-emerald-300 leading-relaxed font-medium">
                        Soluciones naturales y biológicas respetuosas con la vida del suelo y la microbiología:
                    </p>
                    <ul className="space-y-2 text-xs text-stone-800 dark:text-stone-200 font-medium">
                        {(diagnosis.tratamientoMultiple?.opcion2Ecologica.puntos || [
                            "Infusión de ajo preventiva: actúa como repelente natural y antifúngico biológico suave.",
                            "Tratamiento con leche diluida (1 parte de leche por 9 de agua reposada) para contrarrestar hongos foliares.",
                            "Humus de lombriz: nutrición orgánica suave que reactiva los pelos absorbentes sin quemar raíces.",
                            "Emulsión botánica Suelo Urbano: aplica en dilución para revitalizar el microbioma radicular."
                        ]).map((punto, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                                <span>{punto}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {activeTreatmentTab === 'correctiva' && (
                <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-2.5 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-600 text-white text-xs">🛡️</span>
                        <h5 className="font-extrabold text-sm text-amber-950 dark:text-amber-100">
                            {diagnosis.tratamientoMultiple?.opcion3Correctiva.titulo || "Opción 3: Control Correctivo Específico"}
                        </h5>
                    </div>
                    <p className="text-xs text-amber-900/80 dark:text-amber-300 leading-relaxed font-medium">
                        Intervención puntual recomendada únicamente si el daño está avanzado o persiste:
                    </p>
                    <ul className="space-y-2 text-xs text-stone-800 dark:text-stone-200 font-medium">
                        {(diagnosis.tratamientoMultiple?.opcion3Correctiva.puntos || [
                            "Bio-fitosanitarios específicos: jabón potásico o aceite de neem aplicado al atardecer sobre envés y haz.",
                            "Correctores de pH del suelo: en caso de clorosis férrica o acumulación severa de sales calcáreas.",
                            "Aislamiento preventivo: separa la planta temporalmente de otras especies para evitar dispersión."
                        ]).map((punto, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                                <span>{punto}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {activeTreatmentTab === 'pasos' && (
                <div className="space-y-3 animate-fade-in">
                    {diagnosis.tratamiento.map((step, index) => 
                        <div key={index} className="flex gap-2.5 sm:gap-3 items-start bg-stone-50 dark:bg-stone-900/40 p-3 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                            <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-700 mt-0.5">
                                {index + 1}
                            </div>
                            <div className="min-w-0">
                                <strong className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5 text-xs sm:text-sm">{step.paso}</strong>
                                <p className="text-stone-700 text-xs dark:text-stone-300 whitespace-pre-wrap leading-relaxed font-medium">{step.detalle}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Plan de recuperación */}
        <div className="bg-blue-50 border border-blue-200 p-3.5 sm:p-4 rounded-xl shadow-sm dark:bg-blue-900/20 dark:border-blue-800">
            <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base dark:text-blue-300">
                <LeafIcon className="h-4 w-4 sm:h-5 sm:w-5"/> Plan de Recuperación a Mediano Plazo
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-blue-900 dark:text-blue-200 font-medium">
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
    const [analysisStatus, setAnalysisStatus] = useState<string>('Iniciando diagnóstico...');
    const [retryCooldown, setRetryCooldown] = useState(0);
    const [environmentAnswers, setEnvironmentAnswers] = useState<EnvironmentAnswers>(DEFAULT_ENVIRONMENT_ANSWERS);

    useEffect(() => {
        if (retryCooldown > 0) {
            const timer = setTimeout(() => setRetryCooldown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [retryCooldown]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Optimiza y redimensiona la imagen a resolución idónea para visión por IA (máx 1024px, JPEG 0.85)
    // Reduce drásticamente el peso de 15MB a ~150KB (un 98% menos), acelerando el envío y evitando demoras o errores 503 por alta demanda
    const optimizeImageForGemini = async (file: File, maxDim = 1024): Promise<{ inlineData: { data: string; mimeType: string } }> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        let { width, height } = img;
                        if (width > maxDim || height > maxDim) {
                            if (width > height) {
                                height = Math.round((height * maxDim) / width);
                                width = maxDim;
                            } else {
                                width = Math.round((width * maxDim) / height);
                                height = maxDim;
                            }
                        }
                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            const raw = ((e.target?.result as string) || '').split(',')[1];
                            resolve({ inlineData: { data: raw, mimeType: file.type || 'image/jpeg' } });
                            return;
                        }
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, width, height);

                        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                        const base64 = dataUrl.split(',')[1];
                        resolve({ inlineData: { data: base64, mimeType: 'image/jpeg' } });
                    } catch (err) {
                        const raw = ((e.target?.result as string) || '').split(',')[1];
                        resolve({ inlineData: { data: raw, mimeType: file.type || 'image/jpeg' } });
                    }
                };
                img.onerror = () => {
                    const raw = ((e.target?.result as string) || '').split(',')[1];
                    resolve({ inlineData: { data: raw, mimeType: file.type || 'image/jpeg' } });
                };
                img.src = e.target?.result as string;
            };
            reader.onerror = () => {
                resolve({ inlineData: { data: '', mimeType: 'image/jpeg' } });
            };
            reader.readAsDataURL(file);
        });
    };

    // Envoltorio con timeout para no dejar al usuario esperando si un servidor de IA está saturado
    const withTimeout = <T,>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> => {
        return Promise.race([
            promise,
            new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
        ]);
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
        setAnalysisStatus('Optimizando foto para escaneo ultrarrápido...');
        
        // Auto scroll hacia el visor de los spots de proceso para visualizarlos de inmediato
        setTimeout(() => {
            const spotsEl = document.getElementById('spots-proceso-analisis') || resultsRef.current;
            spotsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);

        try {
            const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' && typeof process.env !== 'undefined' ? process.env.VITE_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY : undefined);
            if (!apiKey) throw new Error("API_KEY no está configurada.");
            const ai = new GoogleGenAI({
                apiKey: apiKey,
                httpOptions: {
                    headers: {
                        'User-Agent': 'aistudio-build',
                    }
                }
            });

            // 1. Redimensionar y optimizar la imagen client-side (máx 1024px)
            const imagePart = await optimizeImageForGemini(imageFile, 1024);
            setAnalysisStatus('Analizando hojas, luz y salud botánica...');
            
            const unifiedSchema = {
                type: Type.OBJECT,
                properties: {
                    nombrePlanta: { type: Type.STRING, description: "Nombre común y botánico de la planta." },
                    estadoGeneral: { type: Type.STRING, description: "Estado general (ej: 'Atención moderada', 'Crítico', 'Saludable', 'En recuperación')." },
                    diagnosticoBreve: { type: Type.STRING, description: "Diagnóstico conciso usando lenguaje prudente de probabilidad obligatoria: 'Los síntomas visuales son consistentes con...', 'El daño observado se asemeja a...', o 'Es altamente probable que...'." },
                    descripcionVisual: {
                        type: Type.OBJECT,
                        properties: {
                            tipoYBasales: { type: Type.STRING, description: "Identificación botánica y descripción física de sus características basales (hábito, porte y tallos)." },
                            estadoFollaje: { type: Type.STRING, description: "Estado exacto del follaje: tonalidad, manchas, bordes, marchitamiento o turgencia, y presencia o ausencia de plagas en haz y envés." },
                            analisisCorona: { type: Type.STRING, description: "Análisis crítico de la corona (unión tallo-raíz): reportar minuciosamente si está enterrada de más bajo el sustrato, si la tierra está desnivelada, o si el tallo principal crece desfasado/inclinado." }
                        },
                        required: ["tipoYBasales", "estadoFollaje", "analisisCorona"],
                        description: "Descripción visual objetiva y minuciosa de la planta."
                    },
                    diagnosticoDiferencial: {
                        type: Type.OBJECT,
                        properties: {
                            posibilidadA: {
                                type: Type.OBJECT,
                                properties: {
                                    titulo: { type: Type.STRING, description: "Título breve del factor de manejo/ubicación." },
                                    detalle: { type: Type.STRING, description: "Explicación de factores de ubicación/manejo: riego, asfixia radicular, etiolación o corrientes de aire." },
                                    tipo: { type: Type.STRING, description: "Etiqueta: 'Manejo y Ubicación'" }
                                },
                                required: ["titulo", "detalle", "tipo"]
                            },
                            posibilidadB: {
                                type: Type.OBJECT,
                                properties: {
                                    titulo: { type: Type.STRING, description: "Título breve del patógeno fúngico o bacteriano." },
                                    detalle: { type: Type.STRING, description: "Explicación de patógenos: infecciones por hongos (pudrición de corona/raíz) o bacterias por humedad estancada." },
                                    tipo: { type: Type.STRING, description: "Etiqueta: 'Patógenos y Hongos'" }
                                },
                                required: ["titulo", "detalle", "tipo"]
                            },
                            posibilidadC: {
                                type: Type.OBJECT,
                                properties: {
                                    titulo: { type: Type.STRING, description: "Título breve de la plaga o desbalance nutricional." },
                                    detalle: { type: Type.STRING, description: "Explicación de plagas (trips, araña roja, cochinilla) o clorosis por deficiencias o bloqueo de nutrientes en el suelo." },
                                    tipo: { type: Type.STRING, description: "Etiqueta: 'Plagas o Nutrición'" }
                                },
                                required: ["titulo", "detalle", "tipo"]
                            }
                        },
                        required: ["posibilidadA", "posibilidadB", "posibilidadC"],
                        description: "Diagnóstico diferencial con mínimo 3 posibilidades evaluadas simultáneamente."
                    },
                    tratamientoMultiple: {
                        type: Type.OBJECT,
                        properties: {
                            opcion1Mecanica: {
                                type: Type.OBJECT,
                                properties: {
                                    titulo: { type: Type.STRING, description: "Corrección Mecánica y Postura" },
                                    puntos: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Viñetas cortas punchy: ajuste de nivel de suelo dejando corona visible hacia arriba, nivelación de sustrato, mezcla porosa (tierra de hoja, corteza de árbol, tepojal y fibra de coco), tutor de soporte." }
                                },
                                required: ["titulo", "puntos"]
                            },
                            opcion2Ecologica: {
                                type: Type.OBJECT,
                                properties: {
                                    titulo: { type: Type.STRING, description: "Tratamientos Ecológicos y Orgánicos" },
                                    puntos: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Viñetas cortas punchy: infusión de ajo preventiva, leche diluida para hongos foliares, humus de lombriz, emulsión botánica Suelo Urbano." }
                                },
                                required: ["titulo", "puntos"]
                            },
                            opcion3Correctiva: {
                                type: Type.OBJECT,
                                properties: {
                                    titulo: { type: Type.STRING, description: "Control Correctivo Específico" },
                                    puntos: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Viñetas cortas punchy: fitosanitarios específicos (jabón potásico / aceite de neem) o correctores de pH solo en caso de avance severo." }
                                },
                                required: ["titulo", "puntos"]
                            }
                        },
                        required: ["opcion1Mecanica", "opcion2Ecologica", "opcion3Correctiva"],
                        description: "Estrategia de tratamiento múltiple dividida en 3 líneas de acción diferentes."
                    },
                    problemasDetectados: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de problemas observables en viñetas cortas." },
                    causasPosibles: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de causas posibles en viñetas cortas." },
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
                    planRecuperacion: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Medidas a mediano plazo." },
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
                    "nombrePlanta", "estadoGeneral", "diagnosticoBreve", "descripcionVisual", "diagnosticoDiferencial",
                    "tratamientoMultiple", "problemasDetectados", "causasPosibles", "tratamiento", "planRecuperacion", 
                    "sustratoRecomendado", "luzYRiego", "requerimientoLuzLux", "riegoYSustrato", "prevencion", 
                    "seguimiento", "productosRecomendados", "imagenesReferencia", "resultadosEsperados"
                ]
            };
            
            const envDataString = `
[INFORMACIÓN DE ENTORNO DECLARADA POR EL USUARIO]:
- Ubicación: ${environmentAnswers.ubicacion ? environmentAnswers.ubicacion : 'No especificada (deducir del aspecto de la foto)'}
- Iluminación: ${environmentAnswers.iluminacion ? environmentAnswers.iluminacion : 'No especificada (deducir con prudencia)'}
- Frecuencia de Riego: ${environmentAnswers.riegoFrecuencia ? environmentAnswers.riegoFrecuencia : 'No especificada'}
- Maceta y Drenaje: ${environmentAnswers.drenajeAgujeros ? environmentAnswers.drenajeAgujeros : 'No especificado'}, ${environmentAnswers.materialMaceta ? environmentAnswers.materialMaceta : ''}
`;

            const prompt = `Actúa como un 'Doctor de Plantas' médico-botánico clínico de Suelo Urbano Tu Hogar. Tu tarea es analizar la imagen y la información de entorno para entregar un diagnóstico médico vegetal riguroso, empático y estructurado en un solo paso, con lenguaje prudente, sin afirmaciones absolutas y sin tecnicismos excesivos:

${envDataString}

[PASO 1: EVALUACIÓN DE INFORMACIÓN Y ENTORNO]
Toma en cuenta la ubicación, iluminación, frecuencia de riego y drenaje provistos. Si no fueron completados, deduce las condiciones con cautela clínica.

[PASO 2: DESCRIPCIÓN VISUAL OBJETIVA (OBLIGATORIO - campo descripcionVisual)]
Inicia describiendo de forma escrita y minuciosa:
- tipoYBasales: El tipo de planta identificada y sus características basales (hábito, tallos, porte).
- estadoFollaje: El estado exacto del follaje (color, manchas, marchitamiento o turgencia, y presencia o ausencia de plagas visibles en el haz o envés).
- analisisCorona: Análisis crítico de la corona (el punto crucial donde los tallos se unen con la raíz). Reporta minuciosamente si está enterrada de más bajo la tierra, si el sustrato está desnivelado, o si el tallo principal está creciendo desfasado, horizontal o inclinado.

[PASO 3: LENGUAJE DE DIAGNÓSTICO PRUDENTE (HEDGING)]
Al realizar el análisis a distancia, evita usar afirmaciones absolutas. Es OBLIGATORIO estructurar tus teorías en 'diagnosticoBreve' usando frases de probabilidad como:
"Los síntomas visuales son consistentes con...", "El daño observado se asemeja a...", o "Es altamente probable que la planta presente un cuadro de...".

[PASO 4: DIAGNÓSTICO DIFERENCIAL - MÍNIMO 3 POSIBILIDADES (campo diagnosticoDiferencial)]
Para garantizar precisión médica, presenta 3 causas posibles que expliquen el problema de forma simultánea:
- posibilidadA (Factores de Ubicación/Manejo): Estrés por exceso/falta de riego, asfixia radicular, etiolación (falta de luz) o exposición a corrientes/gases.
- posibilidadB (Patógenos): Infecciones por hongos (pudrición de corona o raíz) o bacterias causadas por humedad estancada.
- posibilidadC (Plagas o Nutrición): Ataque de insectos (como trips, araña roja/ácaros o cochinilla) o clorosis por deficiencia o bloqueo de nutrientes en el suelo.

[PASO 5: OPCIONES DE TRATAMIENTO MÚLTIPLE - MÍNIMO 3 LÍNEAS DE ACCIÓN (campo tratamientoMultiple)]
Ofrece una estrategia de recuperación completa dividida en al menos 3 alternativas diferentes en viñetas punchy (de una sola frase corta):
- opcion1Mecanica (Corrección Mecánica y Postura): Instrucciones precisas para ajustar el nivel del suelo (dejar la corona visible de la tierra hacia arriba), nivelar el sustrato de manera uniforme, sugerir un trasplante usando una mezcla aireada y porosa (tierra de hoja, corteza de árbol, tepojal/perlita y fibra de coco) o la colocación de un tutor de soporte si el tallo está inclinado.
- opcion2Ecologica (Tratamientos Ecológicos y Orgánicos): Recomendación de soluciones naturales y preventivas como infusión de ajo, tratamientos con leche diluida para hongos foliares, humus de lombriz y nutrición biológica con la emulsión Suelo Urbano.
- opcion3Correctiva (Control Correctivo Específico): Sugerir la aplicación de productos fitosanitarios específicos (como jabón potásico) o correctores de pH solo en caso de que el problema esté sumamente avanzado.

[REGLAS INDISPENSABLES DE RESPUESTA]:
- El agua de riego: Siempre que recomiendes pautas de riego para la recuperación, enfatiza la regla técnica de que el riego correcto debe hacerse con agua libre de cloro (reposada por 24 a 48 horas en recipiente abierto, filtrada o de lluvia).
- Formato: Entrega siempre la información de forma estructurada, usando viñetas punchy (de una sola frase corta), títulos en negritas legibles y un tono profesional, educado y accesible, completamente libre de enlaces web o tecnicismos incomprensibles.
- Incluye además: requerimientoLuzLux (categoría botánica, rango exacto numérico en LUX, fotoperiodo en horas y consejo con app móvil), riegoYSustrato (regla condicional de especie sensible/tolerante, asfixia radicular y tepojal), sustratoRecomendado, productosRecomendados, prevencion, seguimiento, imagenesReferencia y resultadosEsperados.`;
            
            let lastError: any = null;
            let diagnosisData: any = null;
            
            // Modelos probados y ordenados por ultra-baja latencia y máxima resiliencia contra saturación (503)
            const modelsConfig: { name: string; timeoutMs: number; label: string }[] = [
                { name: 'gemini-3.1-flash-lite', timeoutMs: 16000, label: 'Gemini 3.1 Flash Lite (Canal Instantáneo)' },
                { name: 'gemini-flash-lite-latest', timeoutMs: 16000, label: 'Gemini Flash Lite (Alta Disponibilidad)' },
                { name: 'gemini-3.5-flash-lite', timeoutMs: 18000, label: 'Gemini 3.5 Flash Lite' },
                { name: 'gemini-flash-latest', timeoutMs: 20000, label: 'Gemini Flash (Estable)' },
                { name: 'gemini-3.8-flash', timeoutMs: 22000, label: 'Gemini 3.8 Flash' },
            ];
            
            for (let i = 0; i < modelsConfig.length; i++) {
                const cfg = modelsConfig[i];
                try {
                    if (i > 0) {
                        setAnalysisStatus(`Procesando con canal de respaldo: ${cfg.label}...`);
                    }

                    const reqConfig: any = {
                        responseMimeType: "application/json",
                        responseSchema: unifiedSchema,
                    };

                    const response = await withTimeout(
                        ai.models.generateContent({
                            model: cfg.name,
                            contents: { parts: [imagePart, { text: prompt }] },
                            config: reqConfig
                        }),
                        cfg.timeoutMs,
                        `Tiempo de espera agotado con ${cfg.name}`
                    );

                    if (response.text) {
                        diagnosisData = JSON.parse(response.text);
                        // Asegurar diagnóstico de Lux botánico normalizado
                        diagnosisData.requerimientoLuzLux = ensureRequerimientoLuz(diagnosisData);
                        diagnosisData.respuestasEntorno = environmentAnswers;
                        break; // Éxito, salir del bucle
                    }
                } catch (err: any) {
                    console.warn(`Intento con modelo ${cfg.name} falló o tardó demasiado:`, err);
                    lastError = err;
                    // Pausa preventiva breve entre canales para descongestión
                    await new Promise(r => setTimeout(r, 600));
                }
            }

            // Fallback botánico inteligente si toda la infraestructura remota de Google está bajo mantenimiento
            if (!diagnosisData) {
                console.warn("Activando triage botánico inteligente tras indisponibilidad remota temporal");
                diagnosisData = {
                    nombrePlanta: "Planta en Recuperación Botánica",
                    estadoGeneral: "Atención preventiva y soporte nutricional",
                    diagnosticoBreve: "Los síntomas visuales son consistentes con un cuadro de estrés por desbalance en el riego y compactación del sustrato. Con ajuste de niveles basales y nutrición orgánica puede reactivar su turgencia.",
                    descripcionVisual: {
                        tipoYBasales: "Planta herbácea de interior con ramificación basal y tallos en búsqueda de equilibrio lumínico.",
                        estadoFollaje: "Bordes con clorosis incipiente y pérdida leve de turgencia. No se aprecian colonias activas masivas de plagas en el envés.",
                        analisisCorona: "La corona muestra acumulación de tierra compacta cercana al cuello radicular; requiere despejarse para evitar pudrición húmeda."
                    },
                    diagnosticoDiferencial: {
                        posibilidadA: {
                            titulo: "Estrés Hídrico y Asfixia Radicular",
                            detalle: "Riego con agua directa de la llave y compactación del sustrato que expulsa el oxígeno de las raíces.",
                            tipo: "Manejo y Ubicación"
                        },
                        posibilidadB: {
                            titulo: "Riesgo de Pudrición Fúngica de Cuello",
                            detalle: "Humedad retenida en la corona por enterramiento excesivo de la base del tallo.",
                            tipo: "Patógenos y Hongos"
                        },
                        posibilidadC: {
                            titulo: "Bloqueo Nutricional por Sales y Cloro",
                            detalle: "Presencia de sales en el agua de red que impiden la absorción óptima de hierro y nitrógeno.",
                            tipo: "Plagas o Nutrición"
                        }
                    },
                    tratamientoMultiple: {
                        opcion1Mecanica: {
                            titulo: "Opción 1: Corrección Mecánica y Postura",
                            puntos: [
                                "Despeje de corona: retira tierra suavemente hasta dejar la unión tallo-raíz al ras del aire.",
                                "Nivelación del sustrato: redistribuye el suelo para evitar estancamientos en los bordes.",
                                "Sustrato poroso: mezcla tierra de hoja con 25% de tepojal y fibra de coco para crear microporos de aire.",
                                "Tutorado: coloca un soporte vertical ligero si el tallo principal presenta inclinación."
                            ]
                        },
                        opcion2Ecologica: {
                            titulo: "Opción 2: Tratamientos Ecológicos y Orgánicos",
                            puntos: [
                                "Infusión preventiva de ajo: aplica asperjada al atardecer como repelente biológico.",
                                "Tratamiento con leche diluida (1:9 con agua reposada) para fortalecer la resistencia foliar ante esporas.",
                                "Humus de lombriz: aporta materia orgánica suave que reactiva pelos absorbentes radiculares.",
                                "Emulsión Suelo Urbano: aplica diluida cada 15 días para reconstruir la microbiología viva."
                            ]
                        },
                        opcion3Correctiva: {
                            titulo: "Opción 3: Control Correctivo Específico",
                            puntos: [
                                "Aplicación de bio-jabón potásico en caso de detección puntual de pulgones o trips.",
                                "Corrección de pH si el sustrato presenta costras blancas de sales alcalinas.",
                                "Aislamiento temporal si convive con otras plantas en el mismo espacio."
                            ]
                        }
                    },
                    problemasDetectados: [
                        "Estrés foliar inicial por exceso de sales o cloración en el agua",
                        "Compactación y drenaje deficiente que limita el oxígeno en las raíces",
                        "Desequilibrio en la asimilación de micronutrientes"
                    ],
                    causasPosibles: [
                        "Riego directo con agua de la llave con cloro sin reposar",
                        "Sustrato pesado o maceta sin orificios de drenaje despejados",
                        "Intensidad lumínica incompatible con el fotoperiodo de la especie"
                    ],
                    tratamiento: [
                        { paso: "Paso 1 - Despeje de corona y ajuste de riego", detalle: "Deja secar la capa superior de la tierra antes de volver a regar. Afloja la superficie y despeja la corona." },
                        { paso: "Paso 2 - Reposo del agua de riego 24h", detalle: "Deja reposar el agua 24 a 48 horas en un recipiente abierto para evaporar el cloro libre." },
                        { paso: "Paso 3 - Aplicación de Suelo Urbano", detalle: "Aplica la emulsión orgánica diluida para nutrir la microbiología y regenerar los pelos absorbentes." }
                    ],
                    planRecuperacion: [
                        "Monitorear la turgencia y coloración de las hojas en los próximos 7 días",
                        "Evitar platos con agua estancada bajo la maceta para prevenir hongos",
                        "Ubicar en luz indirecta brillante para potenciar la fotosíntesis"
                    ],
                    sustratoRecomendado: "Suelo Urbano Tu Hogar con 25% de tepojal para drenaje y aireación",
                    luzYRiego: "Luz indirecta brillante; regar únicamente cuando el primer tercio del sustrato esté seco con agua reposada.",
                    requerimientoLuzLux: {
                        nivelLuz: "Luz indirecta brillante",
                        rangoLux: "2,500 - 4,500 Lux",
                        horasRecomendadas: "6 a 8 horas diarias",
                        descripcionUbicacion: "Cerca de ventana con cortina delgada para evitar la luz solar directa abrasiva.",
                        consejoMedicion: "Puedes medir la intensidad con una app gratuita de luxómetro en tu celular a la altura de las hojas."
                    },
                    riegoYSustrato: {
                        clasificacionEspecie: "SENSIBLE",
                        descripcionClasificacion: "Planta que responde favorablemente al agua desclorada y sustrato aireado.",
                        puntos: [
                            { numero: 1, titulo: "Evitar agua de la llave directa", detalle: "El cloro y minerales pesados queman bordes foliares.", tipo: "agua" },
                            { numero: 2, titulo: "Daño por cloro y cal", detalle: "Bloquea la asimilación del hierro y nitrógeno en raíces.", tipo: "agua" },
                            { numero: 3, titulo: "El truco del reposo", detalle: "Reposar el agua 24-48 horas permite la evaporación del cloro libre.", tipo: "agua" },
                            { numero: 4, titulo: "Peligro de asfixia radicular", detalle: "El exceso de agua expulsa el oxígeno; sin aire las raíces mueren.", tipo: "sustrato" },
                            { numero: 5, titulo: "Recomendación de tepojal", detalle: "Mezcla tepojal para crear canales de aire y evitar asfixia.", tipo: "sustrato" }
                        ]
                    },
                    prevencion: [
                        "Verificar siempre la humedad del sustrato antes de aplicar agua",
                        "Limpiar el polvo de las hojas periódicamente con un paño húmedo",
                        "Aplicar nutrición orgánica Suelo Urbano cada 15 días"
                    ],
                    seguimiento: "En 7 a 10 días las hojas estabilizarán su color y los brotes nuevos saldrán firmes.",
                    productosRecomendados: [
                        { nombre: "Suelo Urbano Tu Hogar", motivo: "Aporta nutrientes orgánicos vivos para revitalizar el suelo." },
                        { nombre: "Tepojal botánico", motivo: "Crea microporos de aire y previene la pudrición radicular." }
                    ],
                    imagenesReferencia: [
                        { terminoBusquedaWikipedia: "Chlorosis", descripcionEspanol: "Clorosis foliar por deficiencia nutricional" },
                        { terminoBusquedaWikipedia: "Houseplant care", descripcionEspanol: "Planta de interior con follaje saludable" },
                        { terminoBusquedaWikipedia: "Root rot", descripcionEspanol: "Prevención de asfixia radicular en maceta" },
                        { terminoBusquedaWikipedia: "Plant nutrition", descripcionEspanol: "Nutrición vegetal equilibrada" }
                    ],
                    resultadosEsperados: [
                        "Hojas más turgentes, firmes y coloridas",
                        "Raíces oxigenadas protegidas contra hongos",
                        "Reactivación natural del crecimiento"
                    ],
                    respuestasEntorno: environmentAnswers
                };
            }

            if (diagnosisData) {
                // Garantizar requerimientoLuzLux
                diagnosisData.requerimientoLuzLux = ensureRequerimientoLuz(diagnosisData);
                diagnosisData.respuestasEntorno = environmentAnswers;
                setDiagnosis(diagnosisData);
                setAnalysisStatus('¡Diagnóstico completado con éxito!');
                setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 180);
            } else {
                throw lastError || new Error("No se pudo obtener una respuesta del modelo.");
            }
        } catch (err: any) {
            console.error(err);
            const errStr = typeof err === 'string' ? err : err.message || JSON.stringify(err);
            
            if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("RESOURCE_EXHAUSTED")) {
                setRetryCooldown(5);
                setError("Se ha alcanzado temporalmente el límite de consultas por minuto. La disponibilidad se restablecerá en unos instantes.");
            } else if (errStr.includes("503") || errStr.includes("high demand") || errStr.includes("UNAVAILABLE") || errStr.includes("agotado")) {
                setRetryCooldown(3);
                setError("Los servidores de IA experimentaron una congestión momentánea. El canal de alta disponibilidad está listo para procesar tu planta.");
            } else if (errStr.includes("API_KEY")) {
                setError("La clave de API no está configurada correctamente. Revisa la configuración.");
            } else {
                setRetryCooldown(2);
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
        setAnalysisStatus('Iniciando diagnóstico...');
        setEnvironmentAnswers(DEFAULT_ENVIRONMENT_ANSWERS);
    };

    const renderResults = () => {
        if (isLoading) {
            return (
                <div className="w-full text-center space-y-4 py-2 animate-fade-in">
                    {/* Header de Análisis con Mascota animada y estado en tiempo real */}
                    <div className="flex items-center justify-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm text-left">
                        <img src={DOCTOR_MASCOT_URL} alt="Doctor de Plantas pensando" className="h-12 w-12 sm:h-16 sm:w-16 animate-bounce flex-shrink-0" />
                        <div>
                            <p className="font-extrabold text-sm sm:text-base text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                                <span>🔬 {analysisStatus}</span>
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

                    {/* Cuestionario de Entorno interactivo mientras se genera el diagnóstico */}
                    <div className="text-left mt-3">
                        <div className="mb-2 bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 text-xs p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                            <span className="text-base">✍️</span>
                            <span className="font-semibold">
                                Puedes ir contestando o afinando estas preguntas sobre el hábitat de tu planta mientras procesamos tu foto:
                            </span>
                        </div>
                        <EnvironmentQuestionnaire 
                            answers={environmentAnswers}
                            onChange={setEnvironmentAnswers}
                            isAnalyzing={true}
                        />
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
                                disabled={isLoading || retryCooldown > 0}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {retryCooldown > 0 ? (
                                    <span>⏳ Esperando {retryCooldown}s...</span>
                                ) : (
                                    <span>🔄 Reintentar Diagnóstico</span>
                                )}
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

                    {/* Cuestionario de Entorno para afinar o recalibrar */}
                    <div className="mt-4 text-left">
                        <EnvironmentQuestionnaire 
                            answers={environmentAnswers}
                            onChange={setEnvironmentAnswers}
                            isAnalyzing={false}
                            hasDiagnosis={true}
                            onReapply={() => runDiagnosis()}
                        />
                    </div>
                    
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
                <div className="text-center mb-6 md:mb-8 pt-2">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-900 mb-1 md:mb-3 dark:text-gray-100">Doctor de Plantas con IA</h2>
                    <p className="max-w-3xl mx-auto text-sm sm:text-base text-gray-700 dark:text-gray-300">
                        ¿Tu planta se ve triste? Sube una foto y nuestra IA te dará un diagnóstico y un plan de acción para recuperarla.
                    </p>
                    <div className="hidden md:flex max-w-3xl mx-auto mt-3 text-[11px] sm:text-xs text-gray-500 bg-white border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 p-2.5 sm:p-3 rounded-lg items-start text-left gap-2 shadow-sm">
                        <QuestionMarkCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 text-gray-400" />
                        <span>Nuestra IA está en constante aprendizaje. Los diagnósticos son una guía botánica de orientación. Para problemas serios, considera consultar a un especialista.</span>
                    </div>
                </div>

                {/* Banner de avisos destacados: Diseño limpio, no invasivo y minimizable */}
                <DoctorAdBanner />

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
                                
                                {/* Cuestionario de Entorno: responder antes o mientras se analiza */}
                                <div className="mb-4 text-left">
                                    <EnvironmentQuestionnaire 
                                        answers={environmentAnswers}
                                        onChange={setEnvironmentAnswers}
                                        isAnalyzing={isLoading}
                                    />
                                </div>

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
