import React, { useState, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { CameraIcon, SparklesIcon, LeafIcon, HeartbeatIcon, ClipboardListIcon, PhIcon, MixIcon, HumidityIcon, QuestionMarkCircleIcon, ChevronDownIcon } from './icons/Icons';

// --- Interfaces para los datos de la IA ---
interface BriefPlantDiagnosis {
    nombrePlanta: string;
    salud: string;
    diagnosticoBreve: string;
    fertilizanteSugerido: string;
    justificacionFertilizante: string;
    phSueloIdeal: string;
    humedad: 'Baja' | 'Media' | 'Alta' | string;
}

interface DetailedPlantDiagnosis {
    diagnosticoDetallado: string;
    planDeAccion: { paso: string; detalle: string }[];
    analisisFertilizantes: string;
    recomendacionEmulsionDetallada: string;
    cuidadosPreventivos: string;
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
        
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 p-3 rounded-lg dark:bg-stone-800/40">
                <h4 className="font-semibold text-stone-800 flex items-center gap-2 text-sm mb-1 dark:text-stone-200"><PhIcon className="h-4 w-4"/>pH Ideal</h4>
                <p className="text-stone-700 font-bold text-lg dark:text-stone-300">{diagnosis.phSueloIdeal}</p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg dark:bg-stone-800/40">
                <h4 className="font-semibold text-stone-800 flex items-center gap-2 text-sm mb-1 dark:text-stone-200"><HumidityIcon className="h-4 w-4"/>Humedad</h4>
                <HumidityScale level={diagnosis.humedad} />
            </div>
        </div>

        <div className="bg-green-200/50 border border-green-300 p-4 rounded-lg dark:bg-green-900/40 dark:border-green-700">
            <h4 className="font-semibold text-green-900 flex items-center gap-2 mb-2 dark:text-green-200"><SparklesIcon className="h-5 w-5"/>Fertilizante Sugerido:</h4>
            <p className="text-green-800 font-bold text-lg mb-1 dark:text-green-300">{diagnosis.fertilizanteSugerido}</p>
            <p className="text-green-800 text-sm dark:text-green-300">{diagnosis.justificacionFertilizante}</p>
        </div>
    </div>
);


const DetailedDiagnosisView: React.FC<{ brief: BriefPlantDiagnosis, detailed: DetailedPlantDiagnosis }> = ({ brief, detailed }) => (
    <div className="animate-fade-in-up w-full text-left space-y-4">
        <div className="flex items-center gap-4">
            <img src={DOCTOR_MASCOT_URL} alt="Doctor de Plantas Mascota" className="h-16 w-16 flex-shrink-0" />
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">{brief.nombrePlanta} - Análisis Completo</h3>
        </div>
        
        {/* Quick Summary in Detailed View */}
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
            <h4 className="font-semibold text-stone-800 flex items-center gap-2 mb-2 dark:text-stone-200"><MixIcon className="h-5 w-5"/>Análisis de Fertilizantes:</h4>
            <p className="text-stone-700 text-sm leading-relaxed dark:text-stone-300 text-justify">{detailed.analisisFertilizantes}</p>
        </div>

        <div className="bg-green-200/50 border border-green-300 p-4 rounded-lg dark:bg-green-900/40 dark:border-green-700">
            <h4 className="font-semibold text-green-900 flex items-center gap-2 mb-2 dark:text-green-200"><LeafIcon className="h-5 w-5"/>Uso de Emulsión Suelo Urbano:</h4>
            <p className="text-green-800 text-sm dark:text-green-300 text-justify">{detailed.recomendacionEmulsionDetallada}</p>
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
            reset(); // Reset everything when a new file is chosen
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
                    nombrePlanta: { type: Type.STRING, description: "Nombre común de la planta." },
                    salud: { type: Type.STRING, description: "Estado de salud general (ej: 'Saludable', 'Necesita atención', 'En estado crítico')." },
                    diagnosticoBreve: { type: Type.STRING, description: "Un diagnóstico breve pero descriptivo (aproximadamente 4-5 líneas) sobre el estado actual de la planta." },
                    fertilizanteSugerido: { type: Type.STRING, description: "Nombre del fertilizante más adecuado (ej: 'Triple 17', 'Humus de lombriz', 'Emulsión Suelo Urbano')." },
                    justificacionFertilizante: { type: Type.STRING, description: "Justificación muy breve (1 frase) de por qué se recomienda ese fertilizante." },
                    phSueloIdeal: { type: Type.STRING, description: "El rango de pH ideal para esta planta (ej: '6.0 - 7.0')." },
                    humedad: { type: Type.STRING, enum: ['Baja', 'Media', 'Alta'], description: "El nivel de humedad ambiental preferido." },
                },
            };

            const prompt = "Actúa como un 'Doctor de Plantas' experto. Analiza la imagen. Proporciona un diagnóstico RÁPIDO. El diagnóstico breve debe ser descriptivo, de aproximadamente 4 a 5 líneas, explicando lo que observas en la planta, sus posibles causas y el estado general. Recomienda el fertilizante más adecuado para la situación actual, ya sea químico (como Triple 17), orgánico (humus de lombriz), o la emulsión 'Suelo Urbano', y justifica brevemente por qué.";
            
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
                    diagnosticoDetallado: { type: Type.STRING, description: "Análisis exhaustivo del problema de la planta, expandiendo el diagnóstico inicial." },
                    planDeAccion: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                paso: { type: Type.STRING },
                                detalle: { type: Type.STRING },
                            }
                        },
                        description: "Plan de acción detallado con pasos numerados para tratar a la planta."
                    },
                    analisisFertilizantes: { type: Type.STRING, description: "Explicación más profunda de por qué se sugirió el fertilizante inicial y menciona otras alternativas viables." },
                    recomendacionEmulsionDetallada: { type: Type.STRING, description: "Explica en detalle cómo la emulsión 'Suelo Urbano' puede beneficiar a esta planta a largo plazo." },
                    cuidadosPreventivos: { type: Type.STRING, description: "Consejos en formato de lista de viñetas para evitar que el problema vuelva a ocurrir." }
                }
            };

            const prompt = `Basado en la imagen y el diagnóstico inicial de "${briefDiagnosis.diagnosticoBreve}", proporciona un análisis completo y detallado. Estructura tu respuesta de la siguiente manera y sé conciso:
- **diagnosticoDetallado**: Expande el diagnóstico inicial en un párrafo claro.
- **planDeAccion**: Crea una lista de pasos numerados. Cada paso debe ser una acción clara y breve.
- **analisisFertilizantes**: Explica de forma concisa por qué se sugirió el fertilizante inicial y menciona 1 o 2 alternativas, explicando su beneficio brevemente.
- **recomendacionEmulsionDetallada**: Explica en un párrafo cómo la emulsión 'Suelo Urbano' ayuda específicamente a esta planta y su problema.
- **cuidadosPreventivos**: Proporciona una lista de 2-3 puntos clave (usando viñetas) para evitar que el problema vuelva a ocurrir.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
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
            return <DetailedDiagnosisView brief={briefDiagnosis} detailed={detailedDiagnosis} />;
        }
        if (briefDiagnosis) {
            return (
                <div className="w-full">
                    <BriefDiagnosisView diagnosis={briefDiagnosis} />
                    <div className="mt-6">
                        <button 
                            onClick={getDetailedDiagnosis} 
                            disabled={isDetailLoading}
                            className="w-full bg-green-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-800 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isDetailLoading ? (
                                <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    Analizando a fondo...
                                </>
                            ) : (
                                <>
                                    <ChevronDownIcon className="h-5 w-5"/>
                                    Obtener Diagnóstico Completo y Plan de Acción
                                </>
                            )}
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className="text-stone-500 dark:text-stone-400">
                <img src={DOCTOR_MASCOT_URL} alt="Doctor de Plantas Mascota" className="h-24 w-24 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">El diagnóstico aparecerá aquí</h3>
                <p className="text-sm">Sube una foto de tu planta para empezar.</p>
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
                        <span>Nuestra Inteligencia Artificial está en constante aprendizaje y mejora. Los diagnósticos proporcionados son una guía sugerida y, como toda IA, pueden cometer errores. Para problemas serios, considera consultar a un experto.</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Left Column: Uploader */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-stone-200 dark:bg-stone-800 dark:border-stone-700">
                        {!imagePreview ? (
                            <div 
                                onDragEnter={handleDragEnter} onDragOver={handleDragEvents} onDragLeave={handleDragLeave} onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-300 ${dragOver ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-stone-300 dark:border-stone-600'}`}>
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
                    
                    {/* Right Column: Results */}
                    <div className="bg-green-50/50 p-6 md:p-8 rounded-2xl h-full flex flex-col justify-center items-center text-center min-h-[400px] dark:bg-green-900/20">
                        {renderResults()}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlantDoctorSection;