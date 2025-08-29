
import React, { useState, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { CameraIcon, SparklesIcon, LeafIcon, HeartbeatIcon, ClipboardListIcon, PhIcon, MixIcon, HumidityIcon } from './icons/Icons';

interface PlantDoctorSectionProps {}

interface PlantDiagnosis {
    nombrePlanta: string;
    salud: string;
    diagnosticoDetallado: string;
    recomendaciones: string[];
    recomendacionEmulsion: string;
    phSueloIdeal: string;
    dosisEmulsionRecomendada: string;
    humedad: 'Baja' | 'Media' | 'Alta' | string;
    humedadDescripcion: string;
}

const HumidityScale = ({ level }: { level: PlantDiagnosis['humedad'] }) => {
    const levelMap: { [key: string]: { width: string; color: string; label: string } } = {
        'Baja': { width: '33.33%', color: 'bg-yellow-400', label: 'Baja' },
        'Media': { width: '66.66%', color: 'bg-green-400', label: 'Media' },
        'Alta': { width: '100%', color: 'bg-blue-400', label: 'Alta' },
    };
    const currentLevel = levelMap[level] || { width: '66.66%', color: 'bg-stone-400', label: level };

    return (
        <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
                <span className="text-stone-700 font-medium dark:text-stone-200">{currentLevel.label}</span>
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

// FIX: Correctly defined the functional component to return JSX, resolving the type error.
const PlantDoctorSection: React.FC<PlantDoctorSectionProps> = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            // FIX: Corrected the FileReader method from 'read' to 'readAsDataURL'.
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
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setDiagnosis(null);
            setError(null);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFile(e.target.files?.[0] || null);
        e.target.value = ''; // Reset input
    };
    
    const handleDragEvents = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragEnter = (e: React.DragEvent) => { handleDragEvents(e); setDragOver(true); };
    const handleDragLeave = (e: React.DragEvent) => { handleDragEvents(e); setDragOver(false); };
    const handleDrop = (e: React.DragEvent) => {
        handleDragEvents(e);
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0] || null);
    };

    const diagnosePlant = async () => {
        if (!imageFile) {
            setError('Por favor, selecciona una imagen primero.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setDiagnosis(null);

        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY no está configurada en las variables de entorno.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = await fileToGenerativePart(imageFile);

            const schema = {
                type: Type.OBJECT,
                properties: {
                    nombrePlanta: { type: Type.STRING, description: "Nombre común de la planta." },
                    salud: { type: Type.STRING, description: "Estado de salud general (ej: 'Saludable', 'Necesita atención', 'En estado crítico')." },
                    diagnosticoDetallado: { type: Type.STRING, description: "Un análisis detallado del problema o estado de la planta, identificando posibles plagas, enfermedades o deficiencias nutricionales." },
                    recomendaciones: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Una lista de acciones concretas a tomar para mejorar la salud de la planta." },
                    recomendacionEmulsion: { type: Type.STRING, description: "Cómo y por qué la emulsión 'Suelo Urbano' puede ayudar a la recuperación o mantenimiento de la planta." },
                    phSueloIdeal: { type: Type.STRING, description: "El rango de pH ideal para esta planta (ej: '6.0 - 7.0')." },
                    dosisEmulsionRecomendada: { type: Type.STRING, description: "Dosis específica de la emulsión recomendada para esta planta (ej: '30g por cada 1L de agua')." },
                    humedad: { type: Type.STRING, enum: ['Baja', 'Media', 'Alta'], description: "El nivel de humedad ambiental preferido por la planta." },
                    humedadDescripcion: { type: Type.STRING, description: "Breve descripción de las necesidades de humedad de la planta." },
                },
            };

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: "Actúa como un 'Doctor de Plantas'. Analiza la imagen de esta planta. Si parece enferma o con problemas, identifica el problema (plaga, enfermedad, deficiencia) y proporciona un diagnóstico. Si parece sana, confirma su buen estado. Ofrece un plan de acción detallado y recomendaciones para su cuidado. Incluye la dosis recomendada de emulsión 'Suelo Urbano' y el pH ideal del suelo." }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                }
            });

            const parsedResult = JSON.parse(response.text);
            setDiagnosis(parsedResult);

        } catch (err) {
            console.error(err);
            setError('Hubo un error al diagnosticar la planta. Puede que el servicio no esté disponible, la imagen no sea clara o el problema sea muy complejo. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const reset = () => {
        setImageFile(null);
        setImagePreview(null);
        setDiagnosis(null);
        setError(null);
        setIsLoading(false);
    };

    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 dark:text-stone-100">Doctor de Plantas con IA</h2>
                    <p className="max-w-3xl mx-auto text-stone-600 dark:text-stone-300">
                        ¿Tu planta se ve triste? Sube una foto y nuestra IA te dará un diagnóstico y un plan de acción para recuperarla.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Left Column: Uploader */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-stone-200 dark:bg-stone-800 dark:border-stone-700">
                        {!imagePreview ? (
                            <div 
                                onDragEnter={handleDragEnter}
                                onDragOver={handleDragEvents}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-300 ${dragOver ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-stone-300 dark:border-stone-600'}`}
                            >
                                <CameraIcon className="h-16 w-16 mx-auto text-stone-400 mb-4" />
                                <p className="text-stone-600 font-semibold mb-2 dark:text-stone-300">Arrastra una foto de tu planta aquí</p>
                                <p className="text-stone-500 mb-4 dark:text-stone-400">o</p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <button onClick={() => fileInputRef.current?.click()} className="bg-white text-green-700 font-bold py-2 px-6 rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors dark:bg-stone-700 dark:text-green-300 dark:border-green-600 dark:hover:bg-stone-600">
                                        Elegir Archivo
                                    </button>
                                    <button onClick={() => cameraInputRef.current?.click()} className="bg-white text-green-700 font-bold py-2 px-6 rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors dark:bg-stone-700 dark:text-green-300 dark:border-green-600 dark:hover:bg-stone-600">
                                        Usar Cámara
                                    </button>
                                </div>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                                <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageChange} className="hidden" />
                            </div>
                        ) : (
                            <div className="text-center">
                                <img src={imagePreview} alt="Vista previa de la planta a diagnosticar" className="max-h-80 w-auto mx-auto rounded-lg shadow-md mb-6" />
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button onClick={diagnosePlant} disabled={isLoading} className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-all transform hover:scale-105 shadow-md disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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
                        {isLoading && (
                             <div className="animate-pulse flex flex-col items-center text-green-700 dark:text-green-300">
                                <SparklesIcon className="h-16 w-16 mb-4" />
                                <p className="font-semibold text-lg">El doctor está en camino...</p>
                                <p>Analizando los síntomas de tu planta.</p>
                             </div>
                        )}
                        {error && (
                            <div className="text-red-600 bg-red-100 border border-red-300 rounded-lg p-4 w-full">
                                <h3 className="font-bold mb-2">¡Ups! Algo salió mal</h3>
                                <p>{error}</p>
                            </div>
                        )}
                        {!isLoading && !error && !diagnosis && (
                            <div className="text-stone-500 dark:text-stone-400">
                                <HeartbeatIcon className="h-16 w-16 mx-auto mb-4 text-stone-400"/>
                                <h3 className="text-lg font-semibold">El diagnóstico aparecerá aquí</h3>
                                <p className="text-sm">Sube una foto de tu planta para empezar.</p>
                            </div>
                        )}
                        {diagnosis && (
                            <div className="animate-fade-in-up w-full text-left space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-green-800 mb-1 dark:text-green-300">{diagnosis.nombrePlanta}</h3>
                                    <p className="text-stone-600 font-semibold dark:text-stone-300">Estado de Salud: <span className="font-bold">{diagnosis.salud}</span></p>
                                </div>

                                <div className="bg-white/50 p-4 rounded-lg dark:bg-stone-800/40">
                                    <h4 className="font-semibold text-stone-800 flex items-center gap-2 mb-2 dark:text-stone-200"><HeartbeatIcon className="h-5 w-5"/>Diagnóstico Detallado:</h4>
                                    <p className="text-stone-700 text-sm leading-relaxed dark:text-stone-300">{diagnosis.diagnosticoDetallado}</p>
                                </div>
                                
                                <div className="bg-white/50 p-4 rounded-lg dark:bg-stone-800/40">
                                    <h4 className="font-semibold text-stone-800 flex items-center gap-2 mb-2 dark:text-stone-200"><ClipboardListIcon className="h-5 w-5"/>Plan de Acción:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-stone-700 text-sm dark:text-stone-300">
                                        {diagnosis.recomendaciones.map((rec, index) => <li key={index}>{rec}</li>)}
                                    </ul>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <div className="bg-white/50 p-3 rounded-lg dark:bg-stone-800/40">
                                        <h4 className="font-semibold text-stone-800 flex items-center gap-2 text-sm mb-1 dark:text-stone-200"><PhIcon className="h-4 w-4"/>pH Ideal</h4>
                                        <p className="text-stone-700 font-bold text-lg dark:text-stone-300">{diagnosis.phSueloIdeal}</p>
                                    </div>
                                    <div className="bg-white/50 p-3 rounded-lg dark:bg-stone-800/40">
                                        <h4 className="font-semibold text-stone-800 flex items-center gap-2 text-sm mb-1 dark:text-stone-200"><MixIcon className="h-4 w-4"/>Dosis</h4>
                                        <p className="text-stone-700 font-bold text-lg dark:text-stone-300">{diagnosis.dosisEmulsionRecomendada}</p>
                                    </div>
                                    <div className="bg-white/50 p-3 rounded-lg sm:col-span-2 dark:bg-stone-800/40">
                                        <h4 className="font-semibold text-stone-800 flex items-center gap-2 text-sm mb-1 dark:text-stone-200"><HumidityIcon className="h-4 w-4"/>Humedad Ideal</h4>
                                        <p className="text-stone-700 text-xs mb-2 dark:text-stone-300">{diagnosis.humedadDescripcion}</p>
                                        <HumidityScale level={diagnosis.humedad} />
                                    </div>
                                </div>

                                <div className="bg-green-200/50 border border-green-300 p-4 rounded-lg dark:bg-green-900/40 dark:border-green-700">
                                    <h4 className="font-semibold text-green-900 flex items-center gap-2 mb-2 dark:text-green-200"><LeafIcon className="h-5 w-5"/>Recomendación Suelo Urbano:</h4>
                                    <p className="text-green-800 text-sm dark:text-green-300">{diagnosis.recomendacionEmulsion}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlantDoctorSection;
