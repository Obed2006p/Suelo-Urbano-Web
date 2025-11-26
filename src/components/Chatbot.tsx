
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { GoogleGenAI } from "@google/genai";
import { ChatBubbleIcon, XIcon, PaperAirplaneIcon, RobotIcon } from './icons/Icons';

interface Message {
    text: string;
    sender: 'user' | 'bot';
}

const SYSTEM_INSTRUCTION = `Eres el "Jardinero Virtual" de Suelo Urbano Tu Hogar, un asistente amable, servicial y experto en jardinería orgánica. Tu objetivo es resolver dudas sobre el producto "Emulsión Alimento para plantas" y dar consejos generales de cuidado.

INFORMACIÓN DEL PRODUCTO:
- **¿Qué es?**: Una emulsión orgánica líquida premium, hecha de residuos naturales transformados. Es un "superalimento" para las raíces.
- **Beneficios**: Nutrición inmediata, 100% natural, reduce residuos, mejora la tierra, ahorra agua, raíces más fuertes, cosechas abundantes.
- **Dosis**: 300 gramos (aprox. una taza) por cada 10 litros de agua.
- **Preparación**: Disolver la emulsión en el agua hasta crear un "té" oscuro y nutritivo.
- **Aplicación**: Regar DIRECTAMENTE en la tierra/base de la planta. EVITAR mojar las hojas.
- **Frecuencia**: Cada 2 a 4 semanas durante la temporada de crecimiento.
- **Ingredientes clave**: Nitrógeno (hojas verdes), Fósforo (raíces/flores), Potasio (resistencia), Calcio, Magnesio, Azufre, Hierro, Zinc, etc.
- **Uso**: Apto para macetas, huertos, flores, árboles frutales, y jardines urbanos.

REGLAS DE COMPORTAMIENTO:
1. **Sé conciso**: Tus respuestas deben ser breves y fáciles de leer en un chat (máximo 3-4 oraciones por idea principal).
2. **Sé amable**: Usa emojis ocasionalmente (🌿, 🌻, 💧) para ser amigable.
3. **Enfócate**: Si te preguntan sobre temas ajenos a jardinería o el producto, responde educadamente que solo puedes ayudar con plantas y Suelo Urbano.
4. **Venta**: Si preguntan cómo comprar, diles que pueden hacerlo en la sección de "Pedidos" de la página web o por WhatsApp.
5. **Seguridad**: Si preguntan por problemas graves de plagas o enfermedades, sugiere usar nuestro "Doctor de Plantas con IA" para un diagnóstico visual.

Tu saludo inicial debe ser corto y acogedor.`;

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { text: "¡Hola! 🌿 Soy tu Jardinero Virtual de Suelo Urbano. ¿Tienes dudas sobre cómo usar nuestra emulsión o cuidados para tus plantas?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Force mount check
    useEffect(() => {
        console.log("Chatbot: Componente montado y listo.");
    }, []);

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
            if (!process.env.API_KEY) {
                // Fallback for when API key is missing in dev environment to prevent crash
                setTimeout(() => {
                    setMessages(prev => [...prev, { text: "Lo siento, no puedo conectar con mi cerebro (API Key faltante). Por favor, verifica la configuración. 🌱", sender: 'bot' }]);
                    setIsLoading(false);
                }, 600);
                return;
            }
            
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

    // Portal to body ensures it floats above everything regardless of overflow:hidden on parents
    return ReactDOM.createPortal(
        <div 
            className="chatbot-container"
            style={{ 
                position: 'fixed', 
                bottom: '24px', 
                left: '24px', 
                zIndex: 999999, 
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                pointerEvents: 'none' // Allow clicking through the container area, re-enable on elements
            }}
        >
            {/* Chat Window */}
            <div 
                className={`bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-green-600 dark:border-stone-700 overflow-hidden transition-all duration-300 origin-bottom-left flex flex-col mb-4`} 
                style={{ 
                    width: 'min(90vw, 380px)',
                    height: '500px', 
                    maxHeight: '60vh',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                    visibility: isOpen ? 'visible' : 'hidden'
                }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-700 to-green-600 p-4 flex items-center justify-between shadow-md flex-shrink-0">
                    <div className="flex items-center gap-3 text-white">
                        <div className="bg-white/20 p-1.5 rounded-full border border-white/30 backdrop-blur-sm">
                            <RobotIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm md:text-base text-white">Asistente Suelo Urbano</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                <span className="text-xs text-green-100">En línea</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-green-100 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-stone-50 dark:bg-stone-900 space-y-4 scroll-smooth">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                msg.sender === 'user' 
                                    ? 'bg-green-600 text-white rounded-br-sm' 
                                    : 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-bl-sm border border-stone-200 dark:border-stone-600'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-stone-700 rounded-2xl rounded-bl-none px-4 py-3 border border-stone-200 dark:border-stone-600 flex items-center gap-1 shadow-sm">
                                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex items-center gap-2 flex-shrink-0">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Escribe tu duda..."
                        className="flex-1 bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-white px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white dark:focus:bg-stone-600 text-sm transition-all placeholder-stone-400"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !inputValue.trim()}
                        className="bg-green-600 text-white p-2.5 rounded-full hover:bg-green-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-sm flex-shrink-0"
                    >
                        <PaperAirplaneIcon className="h-5 w-5 translate-x-0.5 translate-y-0.5" />
                    </button>
                </form>
            </div>

            {/* Floating Button Container */}
            <div className="flex flex-col items-start pointer-events-auto relative">
                {/* Thought Bubble */}
                <div 
                    className={`absolute bottom-full left-4 mb-3 bg-white text-green-800 text-xs font-bold py-2 px-3 rounded-2xl rounded-bl-none shadow-xl border border-green-200 transition-all duration-300 whitespace-nowrap ${isOpen ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 animate-bounce'}`}
                    style={{ zIndex: 1000000 }}
                >
                    ¿Dudas? ¡Pregúntame! 🌿
                    <div className="absolute -bottom-1.5 left-2 w-3 h-3 bg-white border-b border-r border-green-200 transform rotate-45"></div>
                </div>
                
                {/* Main Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`group relative p-0 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center overflow-hidden ${isOpen ? 'rotate-90 bg-stone-800' : 'bg-white'}`}
                    style={{ 
                        width: '64px', 
                        height: '64px',
                        border: '3px solid #16a34a' // green-600
                    }}
                    aria-label={isOpen ? "Cerrar chat" : "Abrir asistente virtual"}
                >
                    {isOpen ? (
                        <XIcon className="h-8 w-8 text-white" />
                    ) : (
                        <ChatBubbleIcon className="h-8 w-8 text-green-600 group-hover:text-green-700 transition-colors" />
                    )}
                </button>
            </div>
        </div>,
        document.body
    );
};

export default Chatbot;
