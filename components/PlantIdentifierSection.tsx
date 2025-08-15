import React, { useState, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { CameraIcon, SparklesIcon, LeafIcon } from './icons/Icons';

interface PlantIdentifierSectionProps {
    onNavigate: (id: string) => void;
}

interface PlantInfo {
    nombreComun: string;
    nombreCientifico: string;
    cuidados: {
        luz: string;
        agua: string;
        temperatura: string;
    };
    recomendacionEmulsion: string;
}

const PlantIdentifierSection: React.FC<PlantIdentifierSectionProps> = ({ onNavigate }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [result, setResult] = useState<PlantInfo | null>(null);
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
            setResult(null);
            setError(null);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFile(e.target.files?.[0] || null);
        e.target.value = ''; // Reset input to allow same file selection again
    };
    
    const handleDragEvents = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragEnter = (e: React.DragEvent) => { handleDragEvents(e); setDragOver(true); };
    const handleDragLeave = (e: React.DragEvent) => { handleDragEvents(e); setDragOver(false); };
    const handleDrop = (e: React.DragEvent) => {
        handleDragEvents(e);
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0] || null);
    };

    const identifyPlant = async () => {
        if (!imageFile) {
            setError('Por favor, selecciona una imagen primero.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY no está configurada en las variables de entorno.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = await fileToGenerativePart(imageFile);
            
            const schema = {
                type: Type.OBJECT,
                properties: {
                    nombreComun: { type: Type.STRING, description: "Nombre común y popular de la planta." },
                    nombreCientifico: { type: Type.STRING, description: "Nombre científico (latín) de la planta." },
                    cuidados: {
                        type: Type.OBJECT,
                        properties: {
                            luz: { type: Type.STRING, description: "Requerimientos de luz solar." },
                            agua: { type: Type.STRING, description: "Instrucciones de riego." },
                            temperatura: { type: Type.STRING, description: "Rango de temperatura ideal." },
                        },
                    },
                    recomendacionEmulsion: { type: Type.STRING, description: "Cómo la emulsión 'Suelo Urbano' beneficia a esta planta." }
                },
            };

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: "Identifica la planta en la imagen. Proporciona su nombre, cuidados básicos y una recomendación para usar la emulsión 'Suelo Urbano' con ella." }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });
            
            const parsedResult = JSON.parse(response.text);
            setResult(parsedResult);

        } catch (err) {
            console.error(err);
            setError('Hubo un error al identificar la planta. Puede que el servicio no esté disponible, la imagen no sea clara o no se reconozca la planta. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const reset = () => {
        setImageFile(null);
        setImagePreview(null);
        setResult(null);
        setError(null);
        setIsLoading(false);
    }
    
    return (
        <section className="py-16 md:py-24 bg-stone-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Identificador de Plantas con IA</h2>
                    <p className="max-w-3xl mx-auto text-stone-600">
                        ¿No sabes qué planta tienes o cómo cuidarla? Sube una foto y deja que nuestra IA te ayude.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Left Column: Uploader */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-stone-200">
                        {!imagePreview ? (
                            <div 
                                onDragEnter={handleDragEnter}
                                onDragOver={handleDragEvents}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-300 ${dragOver ? 'border-green-500 bg-green-50' : 'border-stone-300'}`}
                            >
                                <CameraIcon className="h-16 w-16 mx-auto text-stone-400 mb-4" />
                                <p className="text-stone-600 font-semibold mb-2">Arrastra y suelta una imagen aquí</p>
                                <p className="text-stone-500 mb-4">o</p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <button onClick={() => fileInputRef.current?.click()} className="bg-white text-green-700 font-bold py-2 px-6 rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors">
                                        Elegir Archivo
                                    </button>
                                    <button onClick={() => cameraInputRef.current?.click()} className="bg-white text-green-700 font-bold py-2 px-6 rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors">
                                        Usar Cámara
                                    </button>
                                </div>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                                <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageChange} className="hidden" />
                            </div>
                        ) : (
                            <div className="text-center">
                                <img src={imagePreview} alt="Vista previa de la planta" className="max-h-80 w-auto mx-auto rounded-lg shadow-md mb-6" />
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button onClick={identifyPlant} disabled={isLoading} className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-all transform hover:scale-105 shadow-md disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {isLoading ? 'Analizando...' : 'Identificar Planta'}
                                    </button>
                                    <button onClick={reset} className="bg-stone-200 text-stone-700 font-bold py-3 px-8 rounded-full hover:bg-stone-300 transition-colors">
                                        Cambiar Imagen
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Right Column: Results */}
                    <div className="bg-green-50/50 p-8 rounded-2xl h-full flex flex-col justify-center items-center text-center min-h-[400px]">
                        {isLoading && (
                             <div className="animate-pulse flex flex-col items-center text-green-700">
                                <SparklesIcon className="h-16 w-16 mb-4" />
                                <p className="font-semibold text-lg">Nuestra IA está analizando tu planta...</p>
                                <p>Esto puede tardar unos segundos.</p>
                             </div>
                        )}
                        {error && (
                            <div className="text-red-600 bg-red-100 border border-red-300 rounded-lg p-4 w-full">
                                <h3 className="font-bold mb-2">¡Ups! Algo salió mal</h3>
                                <p>{error}</p>
                            </div>
                        )}
                        {!isLoading && !error && !result && (
                            <div className="text-stone-500">
                                <LeafIcon className="h-16 w-16 mx-auto mb-4 text-stone-400"/>
                                <h3 className="text-lg font-semibold">Los resultados aparecerán aquí</h3>
                                <p className="text-sm">Sube una foto para empezar.</p>
                            </div>
                        )}
                        {result && (
                            <div className="animate-fade-in-up w-full text-left">
                                <h3 className="text-2xl font-bold text-green-800 mb-1">{result.nombreComun}</h3>
                                <p className="text-stone-500 italic mb-4">{result.nombreCientifico}</p>
                                
                                <div className="space-y-3 mb-6">
                                    <h4 className="font-semibold text-stone-800 border-b pb-1">Guía de Cuidados:</h4>
                                    <p className="text-stone-800"><strong className="font-medium">Luz:</strong> {result.cuidados.luz}</p>
                                    <p className="text-stone-800"><strong className="font-medium">Agua:</strong> {result.cuidados.agua}</p>
                                    <p className="text-stone-800"><strong className="font-medium">Temperatura:</strong> {result.cuidados.temperatura}</p>
                                </div>
                                
                                <div className="bg-green-200/50 border border-green-300 p-4 rounded-lg">
                                    <h4 className="font-semibold text-green-900 flex items-center gap-2 mb-2"><LeafIcon className="h-5 w-5"/>Recomendación Suelo Urbano:</h4>
                                    <p className="text-green-800">{result.recomendacionEmulsion}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlantIdentifierSection;