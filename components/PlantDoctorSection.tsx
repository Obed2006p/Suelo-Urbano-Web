import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { CameraIcon, SparklesIcon, LeafIcon, HeartbeatIcon, ClipboardListIcon, PhIcon, MixIcon, HumidityIcon, QuestionMarkCircleIcon, ChevronDownIcon, ShieldCheckIcon, XIcon } from './icons/Icons';

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
            <h4 className="font-semibold text-green-900 flex items-center gap-2 mb-2 dark:text-green-200"><LeafIcon className="h-5 w-5"/>Uso de Emulsión Alimento para plantas:</h4>
            <p className="text-green-800 text-sm dark:text-green-300 text-justify">{detailed.recomendacionEmulsionDetallada}</p>
        </div>
        
         <div className="bg-white/50 p-4 rounded-lg dark:bg-stone-800/40">
            <h4 className="font-semibold text-stone-800 flex items-center gap-2 mb-2 dark:text-stone-200"><SparklesIcon className="h-5 w-5"/>Cuidados Preventivos:</h4>
            <p className="text-stone-700 text-sm leading-relaxed dark:text-stone-300 text-justify">{detailed.cuidadosPreventivos}</p>
        </div>
    </div>
);

const PremiumGateModal: React.FC<{ onActivate: () => void; onClose: () => void; }> = ({ onActivate, onClose }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isActivating, setIsActivating] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Esta es una función premium. Ingresa tu código para desbloquear el diagnóstico por 30 días.");

    useEffect(() => {
        const premiumData = localStorage.getItem('plantDoctorPremium');
        if (premiumData) {
            const { expirationDate } = JSON.parse(premiumData);
            if (Date.now() > expirationDate) {
                setStatusMessage("Tu acceso premium ha expirado. Ingresa un nuevo código para renovar.");
            }
        }
    }, []);

    const VALID_CODES = ['123456789012', '987654321098', '112233445566', '998877665544'];
    const USED_CODES_KEY = 'usedPlantDoctorCodes';

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/-/g, '').slice(0, 12);
        if (/^\d*$/.test(rawValue)) {
            setError('');
            setCode(rawValue);
        }
    };

    const formattedCode = code.replace(/(\d{4})(?=\d)/g, '$1-');

    const handleActivate = () => {
        if (code.length !== 12) {
            setError('El código debe tener 12 dígitos.');
            return;
        }
        setIsActivating(true);
        setError('');

        setTimeout(() => {
            const usedCodes = JSON.parse(localStorage.getItem(USED_CODES_KEY) || '[]');
            
            if (usedCodes.includes(code)) {
                setError('Este código ya ha sido utilizado en este dispositivo.');
                setIsActivating(false);
                return;
            }

            if (VALID_CODES.includes(code)) {
                const expirationDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
                localStorage.setItem('plantDoctorPremium', JSON.stringify({ expirationDate }));
                
                usedCodes.push(code);
                localStorage.setItem(USED_CODES_KEY, JSON.stringify(usedCodes));
                onActivate();
            } else {
                setError('Código inválido. Por favor, verifica el código e inténtalo de nuevo.');
            }
            setIsActivating(false);
        }, 1000);
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in-main" aria-modal="true" role="dialog">
             <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-8 text-center border border-stone-200 dark:border-stone-700 max-w-2xl w-full relative animate-scale-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors" aria-label="Cerrar">
                    <XIcon className="h-6 w-6"/>
                </button>
                <ShieldCheckIcon className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4"/>
                <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-2 dark:text-stone-100">Acceso Premium Requerido</h2>
                <p className="text-stone-600 mb-6 dark:text-stone-300">{statusMessage}</p>
                
                <div className="max-w-md mx-auto space-y-4">
                    <input
                        type="text"
                        value={formattedCode}
                        onChange={handleCodeChange}
                        placeholder="XXXX-XXXX-XXXX"
                        maxLength={14}
                        className="w-full px-4 py-3 text-center text-lg tracking-widest font-mono bg-stone-100 border border-stone-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800 dark:bg-stone-700 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white"
                        aria-label="Código de activación de 12 dígitos"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        onClick={handleActivate}
                        disabled={isActivating || code.length !== 12}
                        className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isActivating ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                Activando...
                            </>
                        ) : "Activar y Diagnosticar"}
                    </button>
                </div>

                <p className="text-sm text-stone-500 mt-8 dark:text-stone-400">
                    ¿No tienes un código? Adquiere tu emulsión para obtener acceso.<br/>
                    <a href="#/pedido" onClick={(e) => { e.preventDefault(); window.location.hash = '#/pedido'; }} className="text-green-700 dark:text-green-400 font-semibold hover:underline">Ir a la página de pedidos &rarr;</a>
                </p>
            </div>
        </div>
    );
};


const PlantDoctorSection: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [briefDiagnosis, setBriefDiagnosis] = useState<BriefPlantDiagnosis | null>(null);
    const [detailedDiagnosis, setDetailedDiagnosis] = useState<DetailedPlantDiagnosis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [showPremiumGate, setShowPremiumGate] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        checkPremiumStatus();
    }, []);

    const checkPremiumStatus = () => {
        const premiumData = localStorage.getItem('plantDoctorPremium');
        if (premiumData) {
            const { expirationDate } = JSON.parse(premiumData);
            if (Date.now() < expirationDate) {
                setIsPremium(true);
            } else {
                localStorage.removeItem('plantDoctorPremium');
                setIsPremium(false);
            }
        } else {
            setIsPremium(false);
        }
    };

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

    const handleDiagnoseClick = () => {
        checkPremiumStatus(); // Re-check just in case it expired in another tab
        if(isPremium) {
            runDiagnosis();
        } else {
            setShowPremiumGate(true);
        }
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
                type: Type.OBJECT, properties: {
                    nombrePlanta: { type: Type.STRING }, salud: { type: Type.STRING }, diagnosticoBreve: { type: Type.STRING },
                    fertilizanteSugerido: { type: Type.STRING }, justificacionFertilizante: { type: Type.STRING },
                    phSueloIdeal: { type: Type.STRING }, humedad: { type: Type.STRING, enum: ['Baja', 'Media', 'Alta'] },
                },
            };
            const prompt = "Actúa como un 'Doctor de Plantas' experto. Analiza la imagen. Proporciona un diagnóstico RÁPIDO. Recomienda el fertilizante más adecuado, ya sea químico (Triple 17), orgánico (humus), o la emulsión 'Alimento para plantas', y justifica brevemente por qué.";
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
                type: Type.OBJECT, properties: {
                    diagnosticoDetallado: { type: Type.STRING },
                    planDeAccion: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { paso: { type: Type.STRING }, detalle: { type: Type.STRING } } } },
                    analisisFertilizantes: { type: Type.STRING },
                    recomendacionEmulsionDetallada: { type: Type.STRING },
                    cuidadosPreventivos: { type: Type.STRING }
                }
            };
            const prompt = `Basado en la imagen y el diagnóstico inicial de "${briefDiagnosis.diagnosticoBreve}", proporciona un análisis completo. Explica cómo la emulsión 'Alimento para plantas' ayuda a esta planta.`;
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
                        <button onClick={getDetailedDiagnosis} disabled={isDetailLoading} className="w-full bg-green-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-800 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {isDetailLoading ? ( <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Analizando a fondo...</> ) : ( <><ChevronDownIcon className="h-5 w-5"/>Obtener Diagnóstico Completo</> )}
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
            {showPremiumGate && 
                <PremiumGateModal 
                    onClose={() => setShowPremiumGate(false)}
                    onActivate={() => {
                        setIsPremium(true);
                        setShowPremiumGate(false);
                        runDiagnosis();
                    }}
                />
            }
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
                                    <button onClick={handleDiagnoseClick} disabled={isLoading} className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-all transform hover:scale-105 shadow-md disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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
