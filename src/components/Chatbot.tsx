
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChatBubbleIcon, XIcon, PaperAirplaneIcon, RobotIcon } from './icons/Icons';

interface Message {
    text: string;
    sender: 'user' | 'bot';
}

const SYSTEM_INSTRUCTION = `Eres el "Jardinero Virtual" de Suelo Urbano Tu Hogar...`; // Mantenemos el prompt igual

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { text: "¡Hola! 🌿 Soy tu Jardinero Virtual de Suelo Urbano. ¿Tienes dudas sobre cómo usar nuestra emulsión o cuidados para tus plantas?", sender: 'bot' }
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
                    systemInstruction: "Eres el asistente de Suelo Urbano. Responde dudas sobre plantas y el producto.",
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
            setMessages(prev => [...prev, { text: "Lo siento, tuve un problema de conexión. Intenta de nuevo. 🌱", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Usamos style inline para garantizar que el z-index y la posición ganen sobre cualquier otra cosa
    return (
        <>
            {/* Botón Flotante */}
            <div 
                style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 2147483647 }} 
                className="flex flex-col items-start gap-2"
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

            {/* Ventana del Chat */}
            <div 
                style={{ position: 'fixed', bottom: '90px', left: '20px', zIndex: 2147483647, height: '500px', maxHeight: '80vh' }}
                className={`w-80 sm:w-96 bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden transition-all duration-300 origin-bottom-left flex flex-col ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-0 opacity-0 pointer-events-none'}`}
            >
                <div className="bg-green-700 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <RobotIcon className="h-5 w-5 text-white" />
                        <h3 className="font-bold text-sm">Asistente Suelo Urbano</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-green-200 hover:text-white">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-stone-50 dark:bg-stone-900 space-y-4">
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
                    {isLoading && <div className="text-xs text-stone-400 italic ml-2">Escribiendo...</div>}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Pregunta algo..."
                        className="flex-1 bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <button type="submit" disabled={isLoading} className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700">
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </>
    );
};

export default Chatbot;
