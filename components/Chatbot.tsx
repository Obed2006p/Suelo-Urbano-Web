
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChatBubbleIcon, XIcon, PaperAirplaneIcon, RobotIcon } from './icons/Icons';

interface Message {
    text: string;
    sender: 'user' | 'bot';
}

const SYSTEM_INSTRUCTION = `Eres el "Jardinero Virtual" de Suelo Urbano Tu Hogar, un experto en jardinería orgánica.
Utiliza la siguiente BASE DE DATOS TÉCNICA para tus diagnósticos y recomendaciones. Clasifica la planta del usuario y responde estrictamente con estos datos:

1. FICHA INFORMATIVA — PLANTAS DE INTERIOR (SOMBRA) 🌿
- Problemas comunes: Exceso de agua (raíz podrida), Falta de luz (hojas pálidas), Corrientes de aire (hojas quemadas), Ambiente seco (puntas secas), Plagas (Cochinilla, mosca blanca).
- Riego: Cada 5 a 8 días. Revisar que la tierra esté ligeramente seca arriba. NO encharcar.
- pH adecuado: 5.5 a 6.5 (ligeramente ácido).
- Nutrientes: Nitrógeno suave (hojas verdes), Potasio (resistencia), Microorganismos naturales. Evitar químicos fuertes.
- **DOSIS SUELO URBANO:** 🥄 ½ a 1 cucharada sopera por litro.
- Preparación: Reposar 8 hrs y colar.
- Frecuencia: Cada 20 días.

2. FICHA INFORMATIVA — PLANTAS DE FLOR (EXTERIOR) 🌸
- Problemas comunes: No florece (exceso de agua), Hojas amarillas (mal drenaje), Pulgón y araña roja, Mucho follaje sin flor (exceso de nitrógeno).
- Riego: Cada 5 a 7 días. En calor fuerte: 2 veces por semana. NO encharcar.
- pH adecuado: 6 a 7 (neutro).
- Nutrientes: Fósforo (floración), Potasio (color de flor), Poco nitrógeno.
- **DOSIS SUELO URBANO:** 🥄 1 cucharada sopera por litro.
- Frecuencia: Cada 15 días (especialmente en temporada de floración).

3. FICHA INFORMATIVA — EXTERIOR GENERAL 🌳
- Problemas comunes: Hojas amarillas, Tallos débiles, Plagas (mosca blanca, pulgón), Exceso de sombra.
- Riego: Cada 4 a 6 días. En calor: más seguido. NO dejar charcos.
- pH adecuado: 7 a 7.5 (neutro a ligeramente alcalino).
- Nutrientes: Potasio alto (flor), Fósforo (raíz), Nitrógeno bajo.
- **DOSIS SUELO URBANO:** 🥄 1½ cucharadas soperas por litro.
- Frecuencia: Cada 15 días.

4. FICHA INFORMATIVA — BULBOS (INTERIOR Y EXTERIOR) 🌺
- Problemas comunes: Pudrición del bulbo, Hojas amarillas, Falta de floración, Hongos por exceso de agua.
- Riego: Cada 5 a 7 días. IMPORTANTE: No mojar directamente el bulbo.
- pH adecuado: 6 a 7 (neutro).
- Nutrientes: Fósforo (flor), Potasio (color), Nitrógeno moderado.
- **DOSIS SUELO URBANO:** 🥄 1 cucharada sopera por litro.
- Frecuencia: Cada 8 a 15 días.

5. FICHA INFORMATIVA — INTERIOR / SOMBRA (Requerimientos Altos de Humedad) 🍃
- Problemas comunes: Puntas secas (ambiente seco), Hojas amarillas (exceso de sol), Pudrición (exceso de agua), Falta de crecimiento.
- Riego: Cada 3 a 5 días. Siempre tierra húmeda, no encharcada.
- pH adecuado: 5 a 6 (ácido).
- Nutrientes: Nitrógeno suave, Materia orgánica, Microorganismos.
- **DOSIS SUELO URBANO:** 🥄 ½ cucharada sopera por litro.

REGLAS DE COMPORTAMIENTO:
1. Identifica qué tipo de planta tiene el usuario y usa la ficha correspondiente. Si no sabes, pregunta.
2. Sé amable y usa emojis (🌿, 💧, 🌸).
3. Si preguntan dónde comprar, dirige a la sección de "Pedidos" o WhatsApp.
4. Si hay un problema visual grave, sugiere el "Doctor de Plantas con IA".`;

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { text: "¡Hola! 🌿 Soy tu Jardinero Virtual de Suelo Urbano. ¿Tienes dudas sobre dosis, riegos o cuidados para tus plantas?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
        setInputValue('');
        setIsLoading(true);

        try {
            if (!process.env.API_KEY) throw new Error("API_KEY no configurada");
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const history = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                },
                history: history
            });

            const result = await chat.sendMessage({ message: userMessage });
            const botResponse = result.text;

            if (botResponse) {
                setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
            } else {
                throw new Error("Respuesta vacía");
            }

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { text: "Lo siento, tuve un pequeño problema de conexión. ¿Podrías preguntarme de nuevo? 🌱", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chat Toggle Button - BOTTOM LEFT with High Z-Index */}
            <div 
                style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 2147483647 }} 
                className="flex flex-col items-start gap-2 pointer-events-auto"
            >
                <div className={`bg-white text-green-800 text-xs font-bold py-1 px-2 rounded-lg shadow-md border border-green-100 transition-opacity duration-500 ml-2 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-pulse'}`}>
                    ¿Ayuda?
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-green-600 ${isOpen ? 'bg-stone-600 hover:bg-stone-700 border-none text-white' : 'bg-white hover:bg-stone-50 text-green-600'}`}
                >
                    {isOpen ? <XIcon className="h-7 w-7" /> : <ChatBubbleIcon className="h-7 w-7" />}
                </button>
            </div>

            {/* Chat Window - BOTTOM LEFT */}
            <div 
                style={{ position: 'fixed', bottom: '90px', left: '20px', zIndex: 2147483647, height: '500px', maxHeight: '80vh' }}
                className={`w-80 sm:w-96 bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden transition-all duration-300 origin-bottom-left flex flex-col ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-0 opacity-0 pointer-events-none'}`}
            >
                {/* Header */}
                <div className="bg-green-700 p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-white">
                        <div className="bg-white/20 p-1.5 rounded-full">
                            <RobotIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Jardinero Virtual</h3>
                            <p className="text-[10px] text-green-100 opacity-90">Suelo Urbano AI</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-green-200 hover:text-white transition-colors">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-stone-50 dark:bg-stone-900 space-y-4 scroll-smooth">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                msg.sender === 'user' 
                                    ? 'bg-green-600 text-white rounded-br-none' 
                                    : 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-bl-none border border-stone-200 dark:border-stone-600'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-stone-700 rounded-2xl rounded-bl-none px-4 py-2 border border-stone-200 dark:border-stone-600">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex items-center gap-2 shrink-0">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Pregunta sobre tus plantas..."
                        className="flex-1 bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !inputValue.trim()} 
                        className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                    >
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </>
    );
};

export default Chatbot;
