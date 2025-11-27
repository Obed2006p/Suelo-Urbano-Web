
import React, { useState, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { jsPDF } from "jspdf";
import { CameraIcon, SparklesIcon, LeafIcon, HeartbeatIcon, ClipboardListIcon, PhIcon, MixIcon, HumidityIcon, QuestionMarkCircleIcon, ChevronDownIcon, CalendarIcon, DownloadIcon } from './icons/Icons';

// --- Interfaces para los datos de la IA ---
interface BriefPlantDiagnosis {
    nombrePlanta: string;
    salud: string;
    diagnosticoBreve: string;
    fertilizanteSugerido: string;
    justificacionFertilizante: string;
    phSueloIdeal: string;
    humedad: 'Baja' | 'Media' | 'Alta' | string;
    temporadaIdeal: string;
}

interface DetailedPlantDiagnosis {
    diagnosticoDetallado: string;
    planDeAccion: { paso: string; detalle: string }[];
    analisisFertilizanteSugerido: string;
    cuidadosPreventivos: string;
    analisisDeTemporada: string;
}

const DOCTOR_MASCOT_URL = "https://res.cloudinary.com/dsmzpsool/image/upload/v1757182726/Gemini_Generated_Image_xx5ythxx5ythxx5y-removebg-preview_guhkke.png";


// --- Componentes de UI ---

const HumidityScale = ({ level }: { level: BriefPlantDiagnosis['humedad'] }) => {
    const levelMap: { [key: string]: { width: string; color: string; label: string } } = {
        'Baja': { width: '33.33%', color: 'bg-yellow-400', label: 'Baja' },
        'Media': { width: '66.66%', color: 'bg-green-400', label: 'Media' },
        'Alta': { width: '100%', color: 'bg-blue-400', label: 'Alta' },
    };
    const currentLevel = levelMap[level] || { width: '66.66%', color: 'bg-stone-400', label: level };

    return (
        <div className="mt-1">
             <div className="flex justify-between items-center mb-1">
                <span className="text-stone-700 font-medium dark:text-stone-200 text-sm">{currentLevel.label}</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2.5 dark:bg-stone-600">
                <div 
                    className={`${currentLevel.color} h-2.5 rounded-full transition-all duration-500`} 
                    style={{ width: currentLevel.width }}
                ></div>
            </div>
        </div>
    );
};

const BriefDiagnosisView: React.FC<{ diagnosis: BriefPlantDiagnosis }> = ({ diagnosis }) => (
    <div className="animate-fade-in-up w-full text-left space-y-4">
        <div className="flex items-center gap-4">
             <img src={DOCTOR_MASCOT_URL} alt="Doctor de Plantas Mascota" className="h-16 w-16 flex-shrink-0" />
            <div>
                <h3 className="text-2xl font-bold text-green-800 mb-1 dark:text-green-300">{diagnosis.nombrePlanta}</h3>
                <p className="text-stone-600 font-semibold dark:text-stone-300">Estado de Salud: <span className="font-bold">{diagnosis.salud}</span></p>
            </div>
        </div>
        
        <p className="text-stone-700 text-sm leading-relaxed bg-white/50 p-3 rounded-lg dark:bg-stone-800/40 dark:text-stone-300">{diagnosis.diagnosticoBreve}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/50 p-3 rounded-lg dark:bg-stone-800/40">
                <h4 className="font-semibold text-stone-800 flex items-center gap-2 text-sm mb-1 dark:text-stone-200"><PhIcon className="h-4 w-4"/>pH Ideal</h4>
                <p className="text-stone-700 font-bold text-lg dark:text-stone-300">{diagnosis.phSueloIdeal}</p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg dark:bg-stone-800/40">
                <h4 className="font-semibold text-stone-800 flex items-center gap-2 text-sm mb-1 dark:text-stone-200"><HumidityIcon className="h-4 w-4"/>Humedad</h4>
                <HumidityScale level={diagnosis.humedad} />
            </div>
            <div className="bg-white/50 p-3 rounded-lg dark:bg-stone-800/40 sm:col-span-2">
                <h4 className="font-semibold text-stone-800 flex items-center gap-2 text-sm mb-1 dark:text-stone-200"><CalendarIcon className="h-4 w-4"/>Temporada Ideal</h4>
                <p className="text-stone-700 font-semibold text-base dark:text-stone-300">{diagnosis.temporadaIdeal}</p>
            </div>
        </div>

        <div className="bg-green-200/50 border border-green-300 p-4 rounded-lg dark:bg-green-900/40 dark:border-green-700">
            <h4 className="font-semibold text-green-900 flex items-center gap-2 mb-2 dark:text-green-200"><SparklesIcon className="h-5 w-5"/>Fertilizante Sugerido:</h4>
            <p className="text-green-800 font-bold text-lg mb-1 dark:text-green-300">{diagnosis.fertilizanteSugerido}</p>
            <p className="text-green-800 text-sm dark:text-green-300 text-justify">{diagnosis.justificacionFertilizante}</p>
        </div>
    </div>
);


const DetailedDiagnosisView: React.FC<{ brief: BriefPlantDiagnosis, detailed: DetailedPlantDiagnosis }> = ({ brief, detailed }) => (
    <div className="animate-fade-in-up w-full text-left space-y-4">
        <div className="flex items-center gap-4">
            <img src={DOCTOR_MASCOT_URL} alt="Doctor de Plantas Mascota" className="h-16 w-16 flex-shrink-0" />
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">{brief.nombrePlanta} - Análisis Completo</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-stone-200 dark:border-stone-700 pb-4">
            <div className="bg-white/50 p-3 rounded-lg dark:bg-stone-800/40">
                <h4 className="font-semibold text-stone-800 flex items-center gap-2 text-sm mb-1 dark:text-stone-200"><PhIcon className="h-4 w-4"/>pH Ideal</h4>
                <p className="text-stone-700 font-bold text-lg dark:text-stone-300">{brief.phSueloIdeal}</p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg dark:bg-stone-800/40">
                <h4 className="font-semibold text-stone-800 flex items-center gap-2 text-sm mb-1 dark:text-stone-200"><HumidityIcon className="h-4 w-4"/>Humedad</h4>
                <HumidityScale level={brief.humedad} />
            </div>
        </div>

        <div className="bg-white/50 p-4 rounded-lg dark:bg-stone-800/40">
            <h4 className="font-semibold text-stone-800 flex items-center gap-2 mb-2 dark:text-stone-200"><HeartbeatIcon className="h-5 w-5"/>Diagnóstico Detallado:</h4>
            <p className="text-stone-700 text-sm leading-relaxed dark:text-stone-300 text-justify">{detailed.diagnosticoDetallado}</p>
        </div>
        
        <div className="bg-white/50 p-4 rounded-lg dark:bg-stone-800/40">
            <h4 className="font-semibold text-stone-800 flex items-center gap-2 mb-2 dark:text-stone-200"><ClipboardListIcon className="h-5 w-5"/>Plan de Acción:</h4>
            <ol className="list-decimal list-inside space-y-2 text-stone-700 text-sm dark:text-stone-300 text-justify">
                {detailed.planDeAccion.map((step, index) => 
                    <li key={index}>
                        <strong className="font-medium">{step.paso}:</strong> {step.detalle}
                    </li>
                )}
            </ol>
        </div>

        <div className="bg-white/50 p-4 rounded-lg dark:bg-stone-800/40">
            <h4 className="font-semibold text-stone-800 flex items-center gap-2 mb-2 dark:text-stone-200"><CalendarIcon className="h-5 w-5"/>Análisis de Temporada:</h4>
            <p className="text-stone-700 text-sm leading-relaxed dark:text-stone-300 text-justify">{detailed.analisisDeTemporada}</p>
        </div>
        
        <div className="bg-green-200/50 border border-green-300 p-4 rounded-lg dark:bg-green-900/40 dark:border-green-700">
            <h4 className="font-semibold text-green-900 flex items-center gap-2 mb-2 dark:text-green-200"><LeafIcon className="h-5 w-5"/>Análisis del Fertilizante Sugerido:</h4>
            <p className="text-green-800 text-sm dark:text-green-300 text-justify">{detailed.analisisFertilizanteSugerido}</p>
        </div>
        
         <div className="bg-white/50 p-4 rounded-lg dark:bg-stone-800/40">
            <h4 className="font-semibold text-stone-800 flex items-center gap-2 mb-2 dark:text-stone-200"><SparklesIcon className="h-5 w-5"/>Cuidados Preventivos:</h4>
            <p className="text-stone-700 text-sm leading-relaxed dark:text-stone-300 text-justify">{detailed.cuidadosPreventivos}</p>
        </div>
    </div>
);

const PlantDoctorSection: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [briefDiagnosis, setBriefDiagnosis] = useState<BriefPlantDiagnosis | null>(null);
    const [detailedDiagnosis, setDetailedDiagnosis] = useState<DetailedPlantDiagnosis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

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
        setBriefDiagnosis(null);
        setDetailedDiagnosis(null);
        try {
            if (!process.env.API_KEY) throw new Error("API_KEY no está configurada.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = await fileToGenerativePart(imageFile);
            
            const briefSchema = {
                type: Type.OBJECT,
                properties: {
                    nombrePlanta: { type: Type.STRING, description: "Nombre común y popular de la planta." },
                    salud: { type: Type.STRING, description: "Estado de salud general en 2-3 palabras (ej: 'Saludable', 'Necesita atención', 'Estrés hídrico')." },
                    diagnosticoBreve: { type: Type.STRING, description: "Un párrafo conciso (3-4 líneas) que explique el problema principal observado, como si fuera un resumen para un cliente." },
                    fertilizanteSugerido: { type: Type.STRING, description: "El nombre del fertilizante más adecuado para la acción inmediata (ej: 'Humus de lombriz', 'Triple 17', 'Suelo Urbano Tu Hogar')." },
                    justificacionFertilizante: { type: Type.STRING, description: "Un párrafo corto pero específico (2-4 líneas) explicando por qué se eligió ese fertilizante, cómo ayuda al problema actual, y si hay alguna consideración especial al aplicarlo (ej. 'aplicar después de corregir el riego')." },
                    phSueloIdeal: { type: Type.STRING, description: "El rango de pH ideal para esta planta (ej: '6.0 - 7.0')." },
                    humedad: { type: Type.STRING, enum: ['Baja', 'Media', 'Alta'], description: "El nivel de humedad ambiental preferido." },
                    temporadaIdeal: { type: Type.STRING, description: "La estación o periodo ideal de la planta (ej: 'Floración en Primavera y Verano')." }
                },
                required: ["nombrePlanta", "salud", "diagnosticoBreve", "fertilizanteSugerido", "justificacionFertilizante", "phSueloIdeal", "humedad", "temporadaIdeal"]
            };
            
            const prompt = `Actúa como un 'Doctor de Plantas' experto y específico. Tu tarea es analizar la imagen y recomendar el fertilizante MÁS adecuado. Tienes 3 opciones principales, cada una con un propósito claro:
1. 'Humus de lombriz': Recomiéndalo PRINCIPALMENTE para plantas que muestren signos de ESTRÉS por exceso de riego (hojas amarillas y blandas, pudrición) o para mejorar la estructura de suelos pobres. Es un acondicionador de suelo suave.
2. 'Suelo Urbano Tu Hogar': Esta es nuestra emulsión nutritiva. Recomiéndala para plantas que necesitan un IMPULSO general de nutrientes, muestran crecimiento lento pero no están críticamente estresadas, o para mantenimiento regular.
3. 'Triple 17' (u otro químico): Úsalo como ÚLTIMO RECURSO para deficiencias de nutrientes MUY SEVERAS y evidentes (decoloración extrema) en plantas que NO están estresadas por exceso de agua.
Analiza la imagen y elige SOLO UNA de estas opciones basada en los síntomas. Luego, en 'justificacionFertilizante', explica con claridad por qué tu elección es la mejor para el problema específico de la planta.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: prompt }] },
                config: { responseMimeType: "application/json", responseSchema: briefSchema }
            });

            setBriefDiagnosis(JSON.parse(response.text));
        } catch (err) {
            console.error(err);
            setError('Hubo un error al generar el diagnóstico rápido. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const getDetailedDiagnosis = async () => {
        if (!imageFile || !briefDiagnosis) return;
        setIsDetailLoading(true);
        setError(null);
        try {
            if (!process.env.API_KEY) throw new Error("API_KEY no está configurada.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = await fileToGenerativePart(imageFile);
            
            const detailedSchema = {
                type: Type.OBJECT,
                properties: {
                    diagnosticoDetallado: { type: Type.STRING, description: "Análisis exhaustivo del problema, expandiendo el diagnóstico inicial en un párrafo claro y fácil de entender." },
                    planDeAccion: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                paso: { type: Type.STRING, description: "El título del paso, ej: 'Paso 1: Revisar Riego'" },
                                detalle: { type: Type.STRING, description: "La explicación detallada de la acción a tomar en ese paso." },
                            },
                            required: ["paso", "detalle"]
                        },
                        description: "Plan de acción detallado con 3 a 5 pasos numerados para tratar a la planta."
                    },
                    analisisFertilizanteSugerido: { type: Type.STRING, description: "Una explicación detallada sobre el fertilizante que ya fue sugerido en el diagnóstico breve, explicando por qué es la mejor opción y cómo aplicarlo." },
                    cuidadosPreventivos: { type: Type.STRING, description: "Una lista de 2-3 consejos clave en viñetas para evitar que el problema vuelva a ocurrir." },
                    analisisDeTemporada: { type: Type.STRING, description: "Análisis detallado sobre la temporada de la planta. Explica si los síntomas son normales para la temporada actual y qué cuidados especiales se necesitan si está fuera de temporada, en un párrafo."}
                },
                required: ["diagnosticoDetallado", "planDeAccion", "analisisFertilizanteSugerido", "cuidadosPreventivos", "analisisDeTemporada"]
            };
            
            const prompt = `Basado en la imagen y el diagnóstico inicial, proporciona un análisis completo. El diagnóstico breve ya sugirió usar '${briefDiagnosis.fertilizanteSugerido}'. Tu tarea es expandir esta información de forma clara y concisa.
- **diagnosticoDetallado**: Expande el diagnóstico inicial en un párrafo claro.
- **planDeAccion**: Crea una guía práctica y fácil de seguir con pasos numerados.
- **analisisFertilizanteSugerido**: Aquí, explica en un párrafo detallado POR QUÉ '${briefDiagnosis.fertilizanteSugerido}' es la elección correcta para el problema detectado. Si es 'Suelo Urbano Tu Hogar', detalla sus beneficios. Si es 'Humus de lombriz', explica su acción suave y reparadora. Si es un químico, advierte sobre su uso correcto.
- **cuidadosPreventivos**: Proporciona una lista de 2-3 puntos clave para el futuro.
- **analisisDeTemporada**: Sé específico sobre si los síntomas son normales para la época y qué hacer si no lo son para proteger la planta.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [imagePart, { text: prompt }] },
                config: { responseMimeType: "application/json", responseSchema: detailedSchema }
            });

            setDetailedDiagnosis(JSON.parse(response.text));
        } catch (err) {
            console.error(err);
            setError('No se pudo obtener el diagnóstico detallado. Inténtalo de nuevo.');
        } finally {
            setIsDetailLoading(false);
        }
    };
    
    const generatePDF = async () => {
        if (!briefDiagnosis) return;

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
        doc.text(briefDiagnosis.nombrePlanta, margin, y);
        y += 8;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(80, 80, 80);
        doc.text(`Estado de Salud: ${briefDiagnosis.salud}`, margin, y);
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
        addWrappedText("Diagnóstico Breve:", 14, true);
        addWrappedText(briefDiagnosis.diagnosticoBreve, 11);
        y += 5;

        // --- Key Metrics ---
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`pH Ideal: ${briefDiagnosis.phSueloIdeal}`, margin, y);
        doc.text(`Humedad: ${briefDiagnosis.humedad}`, margin + 70, y);
        y += 10;
        
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        // --- Detailed Diagnosis (Only if available) ---
        if (detailedDiagnosis) {
            if (y > 250) { doc.addPage(); y = 20; }
            
            addWrappedText("Análisis Detallado:", 14, true);
            addWrappedText(detailedDiagnosis.diagnosticoDetallado, 11);
            y += 5;

            if (y > 230) { doc.addPage(); y = 20; }
            addWrappedText("Plan de Acción:", 14, true);
            detailedDiagnosis.planDeAccion.forEach((step, i) => {
                if (y > 270) { doc.addPage(); y = 20; }
                addWrappedText(`${i + 1}. ${step.paso}:`, 11, true);
                addWrappedText(step.detalle, 11);
                y += 2;
            });
            y += 5;
        }

        // --- Fertilizer ---
        if (y > 230) { doc.addPage(); y = 20; }
        addWrappedText("Fertilizante Recomendado:", 14, true);
        doc.setTextColor(22, 101, 52);
        addWrappedText(briefDiagnosis.fertilizanteSugerido, 12, true);
        doc.setTextColor(0, 0, 0);
        
        if (detailedDiagnosis) {
             addWrappedText(detailedDiagnosis.analisisFertilizanteSugerido, 11);
             y += 5;
        } else {
             addWrappedText(briefDiagnosis.justificacionFertilizante, 11);
             y += 5;
        }

        // --- Footer ---
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('Generado por Suelo Urbano Tu Hogar', pageWidth / 2, 285, { align: 'center' });
        }

        doc.save(`${briefDiagnosis.nombrePlanta.replace(/\s+/g, '_')}_Diagnostico.pdf`);
    };
    
    const reset = () => {
        setImageFile(null);
        setImagePreview(null);
        setBriefDiagnosis(null);
        setDetailedDiagnosis(null);
        setError(null);
        setIsLoading(false);
        setIsDetailLoading(false);
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
        if (detailedDiagnosis && briefDiagnosis) {
            return (
                <div className="w-full">
                    <DetailedDiagnosisView brief={briefDiagnosis} detailed={detailedDiagnosis} />
                    <div className="mt-6 border-t border-stone-200 pt-6 dark:border-stone-600">
                        <button 
                            onClick={generatePDF}
                            className="w-full bg-stone-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-stone-900 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 dark:bg-stone-700 dark:hover:bg-stone-600"
                        >
                            <DownloadIcon className="h-5 w-5"/>
                            Descargar Reporte Completo PDF
                        </button>
                        <p className="text-xs text-stone-500 text-center mt-2">Guarda este diagnóstico para consultarlo más tarde.</p>
                    </div>
                </div>
            );
        }
        if (briefDiagnosis) {
            return (
                <div className="w-full">
                    <BriefDiagnosisView diagnosis={briefDiagnosis} />
                    <div className="mt-6 flex flex-col gap-3">
                        <button onClick={getDetailedDiagnosis} disabled={isDetailLoading} className="w-full bg-green-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-800 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {isDetailLoading ? ( <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Analizando a fondo...</> ) : ( <><ChevronDownIcon className="h-5 w-5"/>Obtener Diagnóstico Completo</> )}
                        </button>
                        <button 
                            onClick={generatePDF}
                            className="w-full bg-white text-green-700 border-2 border-green-700 font-bold py-2 px-6 rounded-lg hover:bg-green-50 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 dark:bg-transparent dark:text-green-300 dark:border-green-500 dark:hover:bg-green-900/30"
                        >
                            <DownloadIcon className="h-5 w-5"/>
                            Descargar PDF (Resumen)
                        </button>
                    </div>
                </div>
            );
        }
        // Default view: Show disabled button to prove code is deployed
        return (
            <div className="text-stone-500 dark:text-stone-400 flex flex-col items-center">
                <img src={DOCTOR_MASCOT_URL} alt="Doctor de Plantas Mascota" className="h-24 w-24 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">El diagnóstico aparecerá aquí</h3>
                <p className="text-sm mb-6">Sube una foto de tu planta para empezar.</p>
                
                {/* Button visible but disabled to prove existence */}
                <button 
                    disabled
                    className="bg-stone-200 text-stone-400 font-bold py-2 px-6 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 border-2 border-stone-200 opacity-70"
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
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 dark:text-stone-100">Doctor de Plantas con IA</h2>
                    <p className="max-w-3xl mx-auto text-stone-600 dark:text-stone-300">
                        ¿Tu planta se ve triste? Sube una foto y nuestra IA te dará un diagnóstico y un plan de acción para recuperarla.
                    </p>
                     <div className="max-w-3xl mx-auto mt-4 text-xs text-stone-500 bg-stone-100 dark:bg-stone-800 dark:text-stone-400 p-3 rounded-lg flex items-start text-left gap-2">
                        <QuestionMarkCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5 text-stone-400" />
                        <span>Nuestra IA está en constante aprendizaje. Los diagnósticos son una guía y pueden cometer errores. Para problemas serios, considera consultar a un experto.</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-stone-200 dark:bg-stone-800 dark:border-stone-700">
                        {!imagePreview ? (
                            <div onDragEnter={handleDragEnter} onDragOver={handleDragEvents} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-300 ${dragOver ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-stone-300 dark:border-stone-600'}`}>
                                <CameraIcon className="h-16 w-16 mx-auto text-stone-400 mb-4" />
                                <p className="text-stone-600 font-semibold mb-2 dark:text-stone-300">Arrastra una foto de tu planta aquí</p>
                                <p className="text-stone-500 mb-4 dark:text-stone-400">o</p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <button onClick={() => fileInputRef.current?.click()} className="bg-white text-green-700 font-bold py-2 px-6 rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors dark:bg-stone-700 dark:text-green-300 dark:border-green-600 dark:hover:bg-stone-600">Elegir Archivo</button>
                                    <button onClick={() => cameraInputRef.current?.click()} className="bg-white text-green-700 font-bold py-2 px-6 rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors dark:bg-stone-700 dark:text-green-300 dark:border-green-600 dark:hover:bg-stone-600">Usar Cámara</button>
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
                                    <button onClick={reset} className="bg-stone-200 text-stone-700 font-bold py-3 px-8 rounded-full hover:bg-stone-300 transition-colors dark:bg-stone-600 dark:text-stone-200 dark:hover:bg-stone-500">
                                        Cambiar Imagen
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-green-50/50 p-6 md:p-8 rounded-2xl h-full flex flex-col justify-center items-center text-center min-h-[400px] dark:bg-green-900/20">
                        {renderResults()}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlantDoctorSection;
