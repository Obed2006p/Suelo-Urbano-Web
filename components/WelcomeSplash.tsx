
import React, { useState } from 'react';
import { 
    HeartbeatIcon, 
    YouTubeIcon, 
    CheckCircleIcon, 
    SproutIcon, 
    WaterDropIcon, 
    WormIcon, 
    SparklesIcon, 
    LeafIcon,
    PhIcon,
    RobotIcon,
    ChatBubbleIcon
} from './icons/Icons';

interface WelcomeSplashProps {
    onEnter: () => void;
    onOpenChatbot?: () => void;
}

const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onEnter, onOpenChatbot }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleEnterClick = () => {
        if (isExiting) return;
        setIsExiting(true);
        // Wait for the fade-out animation to complete before calling onEnter
        setTimeout(onEnter, 1000); 
    };
    
    const handleGoToDoctor = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (isExiting) return;
        window.location.hash = '#/doctor-plantas';
        handleEnterClick();
    };

    const handleChatbotClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onOpenChatbot) {
            onOpenChatbot();
        } else {
            window.dispatchEvent(new CustomEvent('open-suelo-chatbot'));
        }
    };

    const plantNeeds = [
        {
            title: "Buen sustrato",
            desc: "Estructura aireada, porosa y con rica materia orgánica.",
            icon: <LeafIcon className="w-5 h-5 text-emerald-400" />
        },
        {
            title: "Drenaje adecuado",
            desc: "Evita encharcamientos y previene asfixia en las raíces.",
            icon: <WaterDropIcon className="w-5 h-5 text-cyan-400" />
        },
        {
            title: "Microvida activa",
            desc: "Humus vivo y microorganismos que desbloquean nutrientes.",
            icon: <WormIcon className="w-5 h-5 text-lime-400" />
        },
        {
            title: "pH equilibrado",
            desc: "Rango neutro y saludable para máxima absorción biológica.",
            icon: <PhIcon className="w-5 h-5 text-amber-400" />
        },
        {
            title: "Riego correcto",
            desc: "Frecuencia balanceada: ni exceso que pudra ni sequía extrema.",
            icon: <SproutIcon className="w-5 h-5 text-green-400" />
        }
    ];

    return (
        <div 
            className={`fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden transition-opacity duration-1000 ease-in-out ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            aria-modal="true"
            role="dialog"
        >
            {/* Background Atmosphere Video */}
            <video
                className="absolute inset-0 w-full h-full object-cover scale-125 transition-transform duration-1000"
                autoPlay
                loop
                muted
                playsInline
                poster="https://res.cloudinary.com/dcm5pug0v/image/upload/v1772831008/ChatGPT_Image_6_mar_2026_03_03_22_p.m._ijymt9.png"
            >
                <source src="https://res.cloudinary.com/dcm5pug0v/video/upload/v1772831364/Animaci%C3%B3n_De_Imagen_Con_Lluvia_bsqvzn.mp4" type="video/mp4" />
            </video>
            {/* Dark & Forest Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/90"></div>
            
            {/* Main Content Container */}
            <div className="relative z-10 text-white px-4 sm:px-6 w-full h-full flex flex-col overflow-y-auto py-8 md:py-12">
                
                {/* Header Section with Animated Elements */}
                <div className="flex-shrink-0 text-center animate-fade-in-down mb-6 md:mb-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs md:text-sm font-bold uppercase tracking-widest mb-3 backdrop-blur-md animate-pulse-glow">
                        <SparklesIcon className="h-4 w-4 text-emerald-400" />
                        <span>Suelo Urbano • Nutrición 100% Orgánica</span>
                    </div>

                    <div className="relative inline-block mb-3">
                        <img 
                            src="https://res.cloudinary.com/dsmzpsool/image/upload/v1759686619/WhatsApp_Image_2025-10-05_at_11.46.24_AM-removebg-preview_wleawb.png" 
                            alt="Alimento para plantas Logo" 
                            className="h-16 sm:h-20 md:h-24 mx-auto drop-shadow-[0_0_20px_rgba(74,222,128,0.4)] animate-float-gentle" 
                        />
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                        <span className="text-white">Bienvenido a </span>
                        <span className="shimmer-text">Alimento para Plantas</span>
                    </h1>

                    <p className="text-stone-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mt-2 font-medium">
                        Regenera la tierra, activa las raíces y despierta la vitalidad de tus plantas con nutrición viva.
                    </p>
                </div>

                {/* Main Dynamic Content Layout - 2 Balanced Power Columns */}
                <div className="flex-grow w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch my-auto">
                    
                    {/* Left Column: 5 Core Plant Needs (7 Cols on Desktop) */}
                    <div className="lg:col-span-7 animate-fade-in-left flex flex-col justify-center">
                        <div className="bg-stone-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                            {/* Ambient Light Accent */}
                            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
                            
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2.5 rounded-2xl bg-lime-500/20 border border-lime-400/30 text-lime-400">
                                    <SproutIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">
                                        Cosas que necesita tu planta para estar bien
                                    </h2>
                                    <p className="text-xs md:text-sm text-lime-300 font-semibold">
                                        Los 5 fundamentos esenciales del suelo vivo
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3.5">
                                {plantNeeds.map((need, idx) => (
                                    <div 
                                        key={idx}
                                        className="flex items-start gap-3.5 p-3 rounded-2xl bg-stone-950/60 border border-stone-800/80 hover:border-lime-500/40 hover:bg-stone-950/90 transition-all duration-300 transform hover:-translate-x-1"
                                    >
                                        <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 flex-shrink-0 mt-0.5">
                                            {need.icon}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2">
                                                <strong className="text-sm md:text-base text-lime-200 font-bold">
                                                    {need.title}
                                                </strong>
                                                <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            </div>
                                            <p className="text-xs md:text-sm text-stone-300 leading-snug mt-0.5 font-medium">
                                                {need.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interactive Ecosystem Hub & Knowledge (5 Cols on Desktop) */}
                    <div className="lg:col-span-5 animate-fade-in-right flex flex-col justify-between gap-3 md:gap-4">
                        
                        {/* Interactive Card 1: Chatbot Virtual Gardener */}
                        <button 
                            type="button"
                            onClick={handleChatbotClick}
                            className="group flex flex-col justify-between p-4 md:p-5 rounded-3xl bg-gradient-to-br from-stone-900/95 via-stone-900/85 to-green-950/40 backdrop-blur-xl border border-green-500/40 hover:border-green-400 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_10px_25px_rgba(34,197,94,0.2)] hover:shadow-[0_15px_35px_rgba(34,197,94,0.35)] text-left cursor-pointer"
                            aria-label="Abrir Chatbot Jardinero Virtual"
                        >
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="p-2.5 md:p-3 rounded-2xl bg-green-500/20 border border-green-400/40 text-green-400 group-hover:scale-110 transition-transform">
                                    <RobotIcon className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-green-950/80 border border-green-500/50 text-green-300 flex items-center gap-1.5 animate-pulse">
                                    <ChatBubbleIcon className="h-3 w-3" />
                                    <span>Chat en Vivo</span>
                                </span>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-base md:text-lg text-green-300 group-hover:text-green-200">
                                    Chatbot Jardinero IA
                                </h3>
                                <p className="text-xs md:text-sm text-stone-300 mt-1 font-medium leading-relaxed">
                                    Asistente con visión: envía fotos de macetas, lectura de pH o dudas en tiempo real.
                                </p>
                            </div>
                            <div className="mt-2.5 flex items-center text-xs font-bold text-green-400 group-hover:translate-x-1 transition-transform">
                                <span>Abrir conversación con el Jardinero IA &rarr;</span>
                            </div>
                        </button>

                        {/* Interactive Card 2: Plant Doctor */}
                        <a 
                            href="#/doctor-plantas"
                            onClick={handleGoToDoctor}
                            className="group flex flex-col justify-between p-4 md:p-5 rounded-3xl bg-gradient-to-br from-stone-900/95 via-stone-900/85 to-sky-950/50 backdrop-blur-xl border border-sky-400/50 hover:border-sky-300 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_10px_25px_rgba(56,189,248,0.2)] hover:shadow-[0_15px_35px_rgba(56,189,248,0.38)] text-left"
                            aria-label="Ir al Doctor de Plantas"
                        >
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="p-2.5 md:p-3 rounded-2xl bg-sky-500/20 border border-sky-400/50 text-sky-400 group-hover:scale-110 transition-transform">
                                    <HeartbeatIcon className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-sky-950/80 border border-sky-400/60 text-sky-300 shadow-sm">
                                    IA Diagnóstico
                                </span>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-base md:text-lg text-sky-300 group-hover:text-sky-200">
                                    Consultorio de Plantas Suelo Urbano
                                </h3>
                                <p className="text-xs md:text-sm text-stone-300 mt-1 font-medium leading-relaxed">
                                    Analiza síntomas, hojas marchitas, plagas o carencias minerales con diagnóstico inteligente.
                                </p>
                            </div>
                            <div className="mt-2.5 flex items-center text-xs font-bold text-sky-400 group-hover:text-sky-300 group-hover:translate-x-1 transition-all">
                                <span>Diagnosticar mi planta ahora &rarr;</span>
                            </div>
                        </a>

                        {/* Interactive Card 3: What is Suelo Urbano */}
                        <a 
                            href="https://youtu.be/kuCRR-3TbxI?si=91sbDh14gOvjeRBD"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col justify-between p-4 md:p-5 rounded-3xl bg-stone-900/90 backdrop-blur-xl border border-lime-400/30 hover:border-lime-400 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_10px_25px_rgba(163,230,53,0.1)] hover:shadow-[0_15px_35px_rgba(163,230,53,0.2)] text-left"
                            aria-label="Ver presentación sobre Suelo Urbano"
                        >
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="p-2.5 md:p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 group-hover:scale-110 transition-transform">
                                    <YouTubeIcon className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-lime-950/60 border border-lime-600/40 text-lime-300">
                                    Video Oficial
                                </span>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-base md:text-lg text-lime-300 group-hover:text-lime-200">
                                    ¿Qué es Suelo Urbano?
                                </h3>
                                <p className="text-xs md:text-sm text-stone-300 mt-1 font-medium leading-relaxed">
                                    Conoce nuestro proceso biológico y cómo transformamos la salud de tu jardín.
                                </p>
                            </div>
                            <div className="mt-2.5 flex items-center text-xs font-bold text-lime-400 group-hover:translate-x-1 transition-transform">
                                <span>Ver video explicativo &rarr;</span>
                            </div>
                        </a>

                    </div>
                </div>

                {/* Footer / Main CTA Section */}
                <div className="flex-shrink-0 animate-fade-in-up mt-6 md:mt-8 text-center pb-8 md:pb-12">
                    <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-4 text-stone-200 font-medium" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                        Descubre una nueva forma de nutrir tu tierra y conectar con la naturaleza.
                    </p>
                    <div className="inline-block relative">
                        {/* Glowing background aura */}
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
                        <button
                            onClick={handleEnterClick}
                            className="relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold py-3.5 px-8 sm:px-12 md:py-4 md:px-14 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-[0_10px_25px_rgba(34,197,94,0.4)] text-base sm:text-lg md:text-xl flex items-center gap-3 cursor-pointer"
                        >
                            <SparklesIcon className="w-5 h-5 text-yellow-300 animate-pulse" />
                            <span>Comenzar asesoría gratuita</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WelcomeSplash;

