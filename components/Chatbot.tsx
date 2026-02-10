
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChatBubbleIcon, XIcon, PaperAirplaneIcon, RobotIcon, CameraIcon } from './icons/Icons';

interface Message {
    text: string;
    sender: 'user' | 'bot';
    image?: string; // URL o base64 para mostrar en el chat
}

const SYSTEM_INSTRUCTION = `Eres el "Jardinero Virtual con Ojos" de Suelo Urbano Tu Hogar. Tu capacidad ha sido mejorada para ver imágenes.
Tu objetivo es diagnosticar visualmente y dar recomendaciones sobre nuestros productos (Emulsión, Composta).

TIENES 3 MODOS DE VISIÓN PRINCIPALES:

1. 🏺 ANÁLISIS DE MACETAS (Fondo/Drenaje):
   - Si el usuario envía una foto de una maceta (especialmente la parte de abajo):
   - Analiza los orificios: ¿Son suficientes? ¿Están bloqueados?
   - Material: ¿Es plástico (retiene humedad) o barro (transpira)?
   - Veredicto: Dile si la planta se va a ahogar o si está bien.
   - Recomendación: Si falta drenaje, sugiere hacer más hoyos o cambiar sustrato por uno más poroso.

2. 🧪 LECTURA DE PH (Tiras Reactivas):
   - Si envían una foto de una tira de pH o un medidor digital:
   - Interpreta el color: Rojo/Naranja (Ácido), Verde (Neutro), Azul/Morado (Alcalino).
   - Danos el valor aproximado.
   - Solución: Si es muy ácido o alcalino, recomienda nuestra Emulsión para regular el pH y desbloquear nutrientes.

3. 🫙 PRUEBA DE SEDIMENTACIÓN (Frasco con Tierra):
   - Si envían foto de un frasco con tierra y agua:
   - Identifica capas: Arena (abajo), Limo (medio), Arcilla (arriba), Materia Orgánica (flotando).
   - Diagnóstico: ¿Es suelo arcilloso (se encharca), arenoso (se seca rápido) o franco (ideal)?
   - Recomendación: Nuestra Composta para mejorar la estructura.

MODO GENERAL (Diagnóstico de Plantas):
   - Identifica plagas, hongos, o deficiencias nutricionales en hojas.
   - Usa la base de datos de dosis de Suelo Urbano (1 cda/litro generalmente) para recetar.

TONO:
Amable, experto, usa emojis (🌿, 🏺, 🧪). Sé breve y directo.`;

const PROMO_MESSAGES = [
    "¿Ocupas saber la lectura del PH? 🧪",
    "¿Diagnóstico de tu maceta? 🏺",
    "Sube una foto de tu planta 📸",
    "¿Dudas con la composta? 🍂"
];

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { text: "¡Hola! 🌿 Soy tu Jardinero Virtual con visión artificial. Puedo leer tus tiras de pH, revisar el drenaje de tus macetas o diagnosticar tus plantas por foto. ¡Inténtalo!", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [promoIndex, setPromoIndex] = useState(0);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Rotación de mensajes promocionales
    useEffect(() => {
        const interval = setInterval(() => {
            setPromoIndex((prev) => (prev + 1) % PROMO_MESSAGES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
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

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!inputValue.trim() && !selectedFile) || isLoading) return;

        const userText = inputValue.trim();
        const currentFile = selectedFile;
        const currentPreview = previewUrl; // Guardar referencia para el mensaje

        // 1. Agregar mensaje del usuario al chat
        const newMessage: Message = { 
            text: userText, 
            sender: 'user',
            image: currentPreview || undefined
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Limpiar inputs
        setInputValue('');
        clearFile();
        setIsLoading(true);

        try {
            if (!process.env.API_KEY) throw new Error("API_KEY no configurada");
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Construir el historial para el modelo
            // Nota: Usamos ai.chats.create para la nueva versión del SDK
            const chat = ai.chats.create({
                model: "gemini-2.5-flash",
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                },
                history: messages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }] 
                }))
            });

            // Preparar el mensaje actual
            let messageParts: any[] = [];
            if (currentFile) {
                const imagePart = await fileToGenerativePart(currentFile);
                messageParts.push(imagePart);
            }
            if (userText) {
                messageParts.push({ text: userText });
            }
            if (messageParts.length === 0 && currentFile) {
                 messageParts.push({ text: "Analiza esta imagen." });
            }

            const result = await chat.sendMessage({ message: messageParts });
            const botResponse = result.text;

            if (botResponse) {
                setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
            } else {
                throw new Error("Respuesta vacía");
            }

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { text: "Lo siento, tuve un problema analizando tu consulta. Si enviaste una imagen, intenta que sea más clara o ligera. 🌱", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chat Toggle Button & Promo Bubble - BOTTOM LEFT */}
            <div 
                style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 2147483647 }} 
                className="flex flex-col items-start gap-2 pointer-events-auto"
            >
                {/* Promo Bubble Rotativa */}
                <div className={`bg-white dark:bg-stone-800 text-stone-800 dark:text-green-300 text-xs font-bold py-2 px-3 rounded-xl rounded-bl-none shadow-lg border border-green-200 dark:border-green-700 transition-all duration-500 ml-2 mb-1 max-w-[200px] relative ${isOpen ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0 animate-bounce-float'}`}>
                    {PROMO_MESSAGES[promoIndex]}
                    {/* Triángulo de la burbuja */}
                    <div className="absolute -bottom-1.5 left-3 w-3 h-3 bg-white dark:bg-stone-800 border-b border-r border-green-200 dark:border-green-700 transform rotate-45"></div>
                </div>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-green-600 ${isOpen ? 'bg-stone-600 hover:bg-stone-700 border-none text-white' : 'bg-white hover:bg-stone-50 text-green-600'}`}
                    aria-label="Abrir chat de ayuda"
                >
                    {isOpen ? <XIcon className="h-7 w-7" /> : <RobotIcon className="h-7 w-7" />}
                </button>
            </div>

            {/* Chat Window */}
            <div 
                style={{ position: 'fixed', bottom: '90px', left: '20px', zIndex: 2147483647, height: '550px', maxHeight: '80vh' }}
                className={`w-80 sm:w-96 bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden transition-all duration-300 origin-bottom-left flex flex-col ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-0 opacity-0 pointer-events-none'}`}
            >
                {/* Header */}
                <div className="bg-green-700 p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-white">
                        <div className="bg-white/20 p-1.5 rounded-full relative">
                            <RobotIcon className="h-5 w-5 text-white" />
                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-green-700"></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Jardinero Virtual</h3>
                            <p className="text-[10px] text-green-100 opacity-90 flex items-center gap-1">
                                <CameraIcon className="h-3 w-3" /> Veo tus plantas
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-green-200 hover:text-white transition-colors">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-stone-50 dark:bg-stone-900 space-y-4 scroll-smooth">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            {msg.image && (
                                <div className={`mb-1 max-w-[85%] rounded-2xl overflow-hidden border-2 ${msg.sender === 'user' ? 'border-green-600' : 'border-stone-200'}`}>
                                    <img src={msg.image} alt="Enviado por usuario" className="w-full h-auto max-h-40 object-cover" />
                                </div>
                            )}
                            {msg.text && (
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                    msg.sender === 'user' 
                                        ? 'bg-green-600 text-white rounded-tr-none' 
                                        : 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-tl-none border border-stone-200 dark:border-stone-600'
                                }`}>
                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-stone-700 rounded-2xl rounded-tl-none px-4 py-3 border border-stone-200 dark:border-stone-600">
                                <div className="flex gap-1 items-center">
                                    <span className="text-xs text-stone-400 mr-2">Analizando...</span>
                                    <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Preview Area (if image selected) */}
                {previewUrl && (
                    <div className="px-4 py-2 bg-stone-100 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <img src={previewUrl} alt="Preview" className="h-10 w-10 object-cover rounded-lg border border-stone-300" />
                            <span className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-[150px]">{selectedFile?.name}</span>
                        </div>
                        <button onClick={clearFile} className="text-red-500 hover:bg-red-50 p-1 rounded-full">
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-stone-400 hover:text-green-600 dark:hover:text-green-400 transition-colors p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full"
                        title="Subir foto de maceta, pH o planta"
                    >
                        <CameraIcon className="h-6 w-6" />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept="image/*" 
                        className="hidden" 
                    />
                    
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Escribe o sube una foto..."
                        className="flex-1 bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || (!inputValue.trim() && !selectedFile)} 
                        className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex-shrink-0"
                    >
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </>
    );
};

export default Chatbot;
