
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { jsPDF } from "jspdf";
import { saveToGarden, resizeImageToBase64 } from '../lib/gardenStorage';
import { CameraIcon, SparklesIcon, LeafIcon, HeartbeatIcon, ClipboardListIcon, PhIcon, MixIcon, HumidityIcon, QuestionMarkCircleIcon, ChevronDownIcon, CalendarIcon, DownloadIcon, BeakerIcon, SpoonIcon, CheckCircleIcon } from './icons/Icons';

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
    prevencion: string[];
    seguimiento: string;
    productosRecomendados: { nombre: string; motivo: string }[];
    imagenesReferencia: { terminoBusquedaWikipedia: string; descripcionEspanol: string }[];
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

const DiagnosisView: React.FC<{ diagnosis: PlantDiagnosis }> = ({ diagnosis }) => (
    <div className="animate-fade-in-up w-full text-left space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <img src={DOCTOR_MASCOT_URL} alt="Doctor de Plantas Mascota" className="h-20 w-20 flex-shrink-0 drop-shadow-md" />
            <div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Planta Observada</p>
                <h3 className="text-2xl font-black text-green-900 mb-1 dark:text-green-300">{diagnosis.nombrePlanta}</h3>
                <p className="text-gray-800 font-semibold dark:text-gray-200 mt-1 flex items-center gap-2">
                    <HeartbeatIcon className="h-5 w-5 text-red-500" />
                    Estado General: <span className="font-bold text-red-600 dark:text-red-400">{diagnosis.estadoGeneral}</span>
                </p>
            </div>
        </div>
        
        {/* Diagnóstico Breve */}
        <div className="bg-gray-50 border-l-4 border-green-500 p-4 rounded-r-lg dark:bg-gray-700 dark:border-green-400 shadow-sm">
            <h4 className="font-bold text-green-900 flex items-center gap-2 mb-2 dark:text-green-300">
                <SparklesIcon className="h-5 w-5"/> Diagnóstico Breve
            </h4>
            <p className="text-gray-800 text-sm leading-relaxed dark:text-gray-100 font-medium">
                {diagnosis.diagnosticoBreve}
            </p>
        </div>

        {/* Dos columnas: Problemas y Causas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl dark:bg-red-900/20 dark:border-red-800 shadow-sm">
                <h4 className="font-bold text-red-800 flex items-center gap-2 mb-3 dark:text-red-400">
                    <CheckCircleIcon className="h-5 w-5"/> Problemas Detectados
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-900 dark:text-red-200">
                    {diagnosis.problemasDetectados.map((prob, idx) => <li key={idx}>{prob}</li>)}
                </ul>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl dark:bg-amber-900/20 dark:border-amber-800 shadow-sm">
                <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-3 dark:text-amber-400">
                    <QuestionMarkCircleIcon className="h-5 w-5"/> Posibles Causas
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-amber-900 dark:text-amber-200">
                    {diagnosis.causasPosibles.map((causa, idx) => <li key={idx}>{causa}</li>)}
                </ul>
            </div>
        </div>
        
        {/* Tratamiento y Control */}
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h4 className="font-bold text-green-800 flex items-center gap-2 mb-4 dark:text-green-300 text-lg border-b pb-2 dark:border-gray-700">
                <ClipboardListIcon className="h-6 w-6"/> Tratamiento y Control
            </h4>
            <div className="space-y-4">
                {diagnosis.tratamiento.map((step, index) => 
                    <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-800 dark:text-green-300 font-bold border border-green-200 dark:border-green-700">
                            {index + 1}
                        </div>
                        <div>
                            <strong className="font-bold text-gray-900 dark:text-gray-100 block mb-1">{step.paso}</strong>
                            <p className="text-gray-700 text-sm dark:text-gray-300 whitespace-pre-wrap">{step.detalle}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Plan de recuperación */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm dark:bg-blue-900/20 dark:border-blue-800">
            <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-3 dark:text-blue-300">
                <LeafIcon className="h-5 w-5"/> Plan de Recuperación a Mediano Plazo
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-900 dark:text-blue-200">
                {diagnosis.planRecuperacion.map((plan, idx) => <li key={idx}>{plan}</li>)}
            </ul>
        </div>
        
        {/* Luz, Riego y Prevención */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <h4 className="font-bold text-green-800 flex items-center gap-2 mb-2 dark:text-green-300"><HumidityIcon className="h-5 w-5"/>Luz y Riego</h4>
                <p className="text-gray-800 text-sm leading-relaxed dark:text-gray-200">{diagnosis.luzYRiego}</p>
            </div>
             <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <h4 className="font-bold text-green-800 flex items-center gap-2 mb-2 dark:text-green-300"><CheckCircleIcon className="h-5 w-5"/>Prevención</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-800 dark:text-gray-200">
                    {diagnosis.prevencion.map((p, idx) => <li key={idx}>{p}</li>)}
                </ul>
            </div>
        </div>

        {/* Sustrato y Productos */}
        <div className="bg-white border text-center border-gray-200 p-5 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 mb-2 dark:text-white uppercase tracking-widest text-sm text-center border-b pb-2 dark:border-gray-700">Recomendación Oficial Suelo Urbano</h4>
            <p className="text-green-800 font-bold text-lg mt-3 dark:text-green-400">Sustrato Ideal: {diagnosis.sustratoRecomendado}</p>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {diagnosis.productosRecomendados.map((prod, idx) => (
                     <div key={idx} className="bg-lime-50 dark:bg-lime-900/30 p-3 rounded-lg border border-lime-200 dark:border-lime-800">
                         <span className="block font-bold text-lime-900 dark:text-lime-300">{prod.nombre}</span>
                         <span className="text-xs text-lime-800 dark:text-lime-400">{prod.motivo}</span>
                     </div>
                ))}
            </div>
        </div>
        
        {/* Resultados Esperados y Seguimiento */}
        <div className="bg-green-600 text-white p-5 rounded-xl shadow-md border border-green-700">
             <h4 className="font-bold flex items-center gap-2 mb-3 text-lg">
                <CalendarIcon className="h-6 w-6 text-green-200"/> Resultados y Seguimiento
            </h4>
             <p className="text-sm text-green-100 mb-4">{diagnosis.seguimiento}</p>
             <div className="flex flex-wrap gap-2">
                 {diagnosis.resultadosEsperados.map((res, idx) => (
                       <span key={idx} className="text-xs bg-green-800 text-green-50 px-3 py-1.5 rounded-full font-bold shadow-sm flex items-center">
                           ✅ {res}
                       </span>
                 ))}
             </div>
        </div>

        {/* Imágenes de Referencia */}
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4 dark:text-gray-100 text-lg border-b pb-2 dark:border-gray-700">
                <CameraIcon className="h-6 w-6 text-green-700 dark:text-green-400"/> Ejemplos Visuales
            </h4>
            <div className="grid grid-cols-2 gap-4">
                {diagnosis.imagenesReferencia.map((img, idx) => (
                    <ReferenceImage key={idx} term={img.terminoBusquedaWikipedia} description={img.descripcionEspanol} />
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">Estas imágenes son buscadas en enciclopedias (o generadas por IA como respaldo) para servir como referencia visual de la plaga o el estado ideal de tu planta.</p>
        </div>
    </div>
);

const PlantDoctorSection: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

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
                    "tratamiento", "planRecuperacion", "sustratoRecomendado", "luzYRiego", "prevencion", 
                    "seguimiento", "productosRecomendados", "imagenesReferencia", "resultadosEsperados"
                ]
            };
            
            const prompt = `Actúa como un 'Doctor de Plantas' experto. Tu tarea es analizar la imagen y proporcionar un diagnóstico completo en un solo paso, siguiendo esta estructura exacta:
1. Nombre de la planta.
2. Estado general (ej: Atención moderada).
3. Diagnóstico breve: el problema principal.
4. Problemas detectados: lista de observaciones visibles.
5. Causas posibles: lista de por qué ocurrió.
6. Tratamiento y control de plagas: Plan de acción paso a paso. (Si hay plagas, indícalo. Si no, cómo solucionar el problema actual).
7. Plan de recuperación: Acciones de soporte.
8. Sustrato recomendado: Debe ser 'Suelo Urbano Tu Hogar' o variantes.
9. Luz y riego: Ajustes necesarios.
10. Prevención: Cómo evitar que regrese.
11. Seguimiento: Qué esperar ver pronto.
12. Productos recomendados: Lista de productos de la marca Suelo Urbano u orgánicos y por qué usarlos.
13. Resultados esperados: Mejoras.
14. Imágenes de referencia: 4 términos de búsqueda para Wikipedia (preferiblemente nombres científicos de la plaga u hongo, y el nombre científico de la planta sana).`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [imagePart, { text: prompt }] },
                config: { responseMimeType: "application/json", responseSchema: unifiedSchema }
            });

            setDiagnosis(JSON.parse(response.text));
        } catch (err: any) {
            console.error(err);
            setError(err.message === "API_KEY no está configurada." ? "Error: La API Key no está configurada. Añade VITE_API_KEY en las variables de entorno de Vercel y redespliega." : `Hubo un error: ${err.message || 'Inténtalo de nuevo.'}`);
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
        y += 5;

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
                beforeImage: base64Img
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
    };

    const renderResults = () => {
        if (isLoading) {
            return (
                <div className="animate-pulse flex flex-col items-center text-green-700 dark:text-green-300">
                    <img src={DOCTOR_MASCOT_URL} alt="Doctor de Plantas pensando" className="h-24 w-24 mx-auto mb-4 opacity-75" />
                    <p className="font-semibold text-lg">Nuestro doctor está analizando tu planta...</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="text-red-600 bg-red-100 border border-red-300 rounded-lg p-4 w-full">
                    <h3 className="font-bold mb-2">¡Ups! Algo salió mal</h3>
                    <p>{error}</p>
                </div>
            );
        }
        if (diagnosis) {
            return (
                <div className="w-full">
                    <DiagnosisView diagnosis={diagnosis} />
                    
                    <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-600 flex flex-col gap-3">
                        <button 
                            onClick={generatePDF}
                            className="w-full bg-gray-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            <DownloadIcon className="h-5 w-5"/>
                            Descargar Reporte Completo PDF
                        </button>
                        
                        <button 
                            onClick={handleSaveToGarden}
                            disabled={isSaving || saveSuccess}
                            className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-sm border-2 
                                ${saveSuccess 
                                    ? 'bg-green-100 text-green-800 border-green-500 dark:bg-green-900/50 dark:text-green-300 dark:border-green-600 cursor-default' 
                                    : 'bg-white text-green-700 border-green-700 hover:bg-green-50 hover:scale-105 dark:bg-transparent dark:text-green-300 dark:border-green-500 dark:hover:bg-green-900/40'}`}
                        >
                            <HeartbeatIcon className="h-5 w-5"/>
                            {isSaving ? 'Guardando...' : saveSuccess ? '¡Guardado en Mi Jardín!' : 'Guardar en "Mi Jardín Urbano" 🗓️'}
                        </button>
                        
                        <p className="text-xs text-gray-500 text-center mt-2">Guarda este diagnóstico para ver su evolución o descargar el PDF.</p>
                    </div>
                </div>
            );
        }
        // Default view: Show disabled button to prove code is deployed
        return (
            <div className="text-gray-500 dark:text-gray-400 flex flex-col items-center">
                <img src={DOCTOR_MASCOT_URL} alt="Doctor de Plantas Mascota" className="h-24 w-24 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">El diagnóstico aparecerá aquí</h3>
                <p className="text-sm mb-6">Sube una foto de tu planta para empezar.</p>
                
                {/* Button visible but disabled to prove existence */}
                <button 
                    disabled
                    className="bg-gray-200 text-gray-400 font-bold py-2 px-6 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 border-2 border-gray-200 opacity-70"
                >
                    <DownloadIcon className="h-5 w-5"/>
                    Diagnostica para descargar PDF
                </button>
            </div>
        );
    };

    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4 dark:text-gray-100">Doctor de Plantas con IA</h2>
                    <p className="max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
                        ¿Tu planta se ve triste? Sube una foto y nuestra IA te dará un diagnóstico y un plan de acción para recuperarla.
                    </p>
                     <div className="max-w-3xl mx-auto mt-4 text-xs text-gray-500 bg-white border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 p-3 rounded-lg flex items-start text-left gap-2 shadow-sm">
                        <QuestionMarkCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5 text-gray-400" />
                        <span>Nuestra IA está en constante aprendizaje. Los diagnósticos son una guía y pueden cometer errores. Para problemas serios, considera consultar a un experto.</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Contenedor de subida de imagen: Fondo blanco con sombras fuertes */}
                    <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        {!imagePreview ? (
                            <div onDragEnter={handleDragEnter} onDragOver={handleDragEvents} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-300 ${dragOver ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                                <CameraIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-700 font-semibold mb-2 dark:text-gray-300">Arrastra una foto de tu planta aquí</p>
                                <p className="text-gray-500 mb-4 dark:text-gray-400">o</p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <button onClick={() => fileInputRef.current?.click()} className="bg-white text-green-700 font-bold py-2 px-6 rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors dark:bg-gray-700 dark:text-green-300 dark:border-green-600 dark:hover:bg-gray-600">Elegir Archivo</button>
                                    <button onClick={() => cameraInputRef.current?.click()} className="bg-white text-green-700 font-bold py-2 px-6 rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors dark:bg-gray-700 dark:text-green-300 dark:border-green-600 dark:hover:bg-gray-600">Usar Cámara</button>
                                </div>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                                <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageChange} className="hidden" />
                            </div>
                        ) : (
                            <div className="text-center">
                                <img src={imagePreview} alt="Vista previa de la planta a diagnosticar" className="max-h-80 w-auto mx-auto rounded-lg shadow-md mb-6" />
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button onClick={runDiagnosis} disabled={isLoading} className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-all transform hover:scale-105 shadow-md disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {isLoading ? 'Analizando...' : 'Diagnosticar Planta'}
                                    </button>
                                    <button onClick={reset} className="bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-full hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                                        Cambiar Imagen
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Resultados: Fondo blanco para contraste limpio */}
                    <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-2xl shadow-xl h-full flex flex-col justify-center items-center text-center min-h-[400px] dark:bg-gray-800 dark:border-gray-700">
                        {renderResults()}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlantDoctorSection;
