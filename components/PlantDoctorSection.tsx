import React, { useState, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { CameraIcon, SparklesIcon, LeafIcon, HeartbeatIcon, ClipboardListIcon } from './icons/Icons';

interface PlantDoctorSectionProps {}

interface PlantDiagnosis {
    nombrePlanta: string;
    salud: string;
    diagnosticoDetallado: string;
    recomendaciones: string[];
    recomendacionEmulsion: string;
}

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

    const getDiagnosis = async () => {
        if (!imageFile) {
            setError('Por favor, selecciona una imagen primero.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setDiagnosis(null);

        try {
            if (!process.env.API_KEY) {
                throw new Error("La API_KEY no está configurada.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = await fileToGenerativePart(imageFile);
            
            const schema = {
                type: Type.OBJECT,
                properties: {
                    nombrePlanta: { type: Type.STRING, description: "Nombre común y popular de la planta." },
                    salud: { type: Type.STRING, description: "Un resumen corto del estado de salud (ej: 'Saludable', 'Hojas amarillas por falta de nutrientes', 'Posible plaga de pulgones')." },
                    diagnosticoDetallado: { type: Type.STRING, description: "Una explicación detallada del diagnóstico de salud, describiendo los síntomas visibles en la foto." },
                    recomendaciones: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Una lista de 3 a 5 recomendaciones accionables para el cuidado y tratamiento de la planta."
                    },
                    recomendacionEmulsion: { type: Type.STRING, description: "Una recomendación específica de cómo y por qué la emulsión 'Suelo Urbano' beneficiaría a esta planta en su estado actual." }
                },
                required: ["nombrePlanta", "salud", "diagnosticoDetallado", "recomendaciones", "recomendacionEmulsion"]
            };

            const prompt = "Eres un botánico experto y doctor de plantas. Analiza la imagen de esta planta y proporciona un diagnóstico de salud. Identifica la planta, evalúa su salud (por ejemplo, si tiene hojas amarillas, manchas, plagas, etc.), explica el posible problema y da recomendaciones claras para solucionarlo. Incluye una recomendación específica sobre cómo la emulsión 'Suelo Urbano' podría ayudar a mejorar su condición. Responde únicamente con el objeto JSON definido en el schema.";

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: prompt }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });
            
            const parsedResult = JSON.parse(response.text);
            setDiagnosis(parsedResult);

        } catch (err) {
            console.error(err);
            setError('Hubo un error al diagnosticar la planta. Puede que el servicio no esté disponible, la imagen no sea clara o no se reconozca la planta. Inténtalo de nuevo.');
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
    }
    
    return (
        <section className="py-16 md:py-24 bg-stone-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Doctor de Plantas con IA</h2>
                    <p className="max-w-3xl mx-auto text-stone-600">
                        ¿Tu planta no se ve bien? Sube una foto y nuestra IA te dará un diagnóstico y recomendaciones de cuidado.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Left Column: Uploader */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-stone-200">
                        {!imagePreview ? (
                            <div 
                                onDragEnter={handleDragEnter} onDragOver={handleDragEvents} onDragLeave={handleDragLeave} onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-300 ${dragOver ? 'border-green-500 bg-green-50' : 'border-stone-300'}`}
                            >
                                <CameraIcon className="h-16 w-16 mx-auto text-stone-400 mb-4" />
                                <p className="text-stone-600 font-semibold mb-2">Arrastra y suelta la foto de tu planta</p>
                                <p className="text-stone-500 mb-4">o</p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <button onClick={() => fileInputRef.current?.click()} className="bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 transition-colors">
                                        Elegir Archivo
                                    </button>
                                    <button onClick={() => cameraInputRef.current?.click()} className="bg-white text-green-700 font-bold py-2 px-6 rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors">
                                        Usar Cámara
                                    </button>
                                </div>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" aria-label="Subir archivo de imagen"/>
                                <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageChange} className="hidden" aria-label="Usar cámara"/>
                            </div>
                        ) : (
                            <div className="text-center">
                                <img src={imagePreview} alt="Vista previa de la planta a diagnosticar" className="max-h-80 w-auto mx-auto rounded-lg shadow-md mb-6" />
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button onClick={getDiagnosis} disabled={isLoading} className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-all transform hover:scale-105 shadow-md disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {isLoading ? 'Analizando...' : 'Diagnosticar Planta'}
                                    </button>
                                    <button onClick={reset} className="bg-stone-200 text-stone-700 font-bold py-3 px-8 rounded-full hover:bg-stone-300 transition-colors">
                                        Cambiar Foto
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Right Column: Results */}
                    <div className="bg-green-50/50 p-6 sm:p-8 rounded-2xl h-full flex flex-col justify-center items-center text-center min-h-[400px]">
                        {isLoading && (
                             <div role="status" className="animate-pulse flex flex-col items-center text-green-700">
                                <SparklesIcon className="h-16 w-16 mb-4" />
                                <p className="font-semibold text-lg">Nuestra IA está examinando tu planta...</p>
                                <p>Un momento, por favor.</p>
                             </div>
                        )}
                        {error && (
                            <div role="alert" className="text-red-600 bg-red-100 border border-red-300 rounded-lg p-4 w-full">
                                <h3 className="font-bold mb-2">¡Ups! Algo salió mal</h3>
                                <p>{error}</p>
                            </div>
                        )}
                        {!isLoading && !error && !diagnosis && (
                            <div className="text-stone-500">
                                <LeafIcon className="h-16 w-16 mx-auto mb-4 text-stone-400"/>
                                <h3 className="text-lg font-semibold">El diagnóstico aparecerá aquí</h3>
                                <p className="text-sm">Sube una foto para empezar.</p>
                            </div>
                        )}
                        {diagnosis && (
                            <div className="animate-fade-in-up w-full text-left">
                                <h3 className="text-2xl font-bold text-green-800 mb-2">{diagnosis.nombrePlanta}</h3>
                                
                                <div className="bg-white/70 p-4 rounded-lg mb-4 border border-stone-200">
                                    <h4 className="font-semibold text-stone-800 flex items-center gap-2 mb-2"><HeartbeatIcon className="h-6 w-6 text-red-500"/>Estado de Salud</h4>
                                    <p className="text-stone-700 font-medium">{diagnosis.salud}</p>
                                    <p className="text-stone-600 mt-1 text-sm">{diagnosis.diagnosticoDetallado}</p>
                                </div>

                                <div className="bg-white/70 p-4 rounded-lg mb-6 border border-stone-200">
                                    <h4 className="font-semibold text-stone-800 flex items-center gap-2 mb-2"><ClipboardListIcon className="h-6 w-6 text-blue-500"/>Recomendaciones</h4>
                                    <ul className="list-disc list-inside space-y-1 text-stone-700">
                                        {diagnosis.recomendaciones.map((rec, i) => <li key={i}>{rec}</li>)}
                                    </ul>
                                </div>
                                
                                <div className="bg-green-200/60 border border-green-300 p-4 rounded-lg">
                                    <h4 className="font-semibold text-green-900 flex items-center gap-2 mb-2"><LeafIcon className="h-5 w-5"/>Tip de Suelo Urbano:</h4>
                                    <p className="text-green-800">{diagnosis.recomendacionEmulsion}</p>
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