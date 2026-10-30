import React, { useState, useEffect, useRef } from 'react';
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
    const [isLoadingSequence, setIsLoadingSequence] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string>('INICIALIZANDO RED BOTÁNICA...');
    const [isSlidingUp, setIsSlidingUp] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const stopAudioRef = useRef<(() => void) | null>(null);

    // Audio sintetizado orgánico con Web Audio API (Drone de Suelo + Armónico + Shimmer)
    const playCinematicWakeup = () => {
        if (isMuted) return null;
        try {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AudioCtx) return null;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.35, now);
            masterGain.connect(ctx.destination);

            // 1. Oscilador Grave (El "Suelo" - Zumbido profundo que crece)
            const oscLow = ctx.createOscillator();
            const gainLow = ctx.createGain();
            oscLow.type = 'sine';
            oscLow.frequency.setValueAtTime(45, now);
            oscLow.frequency.exponentialRampToValueAtTime(65, now + 4.5);
            gainLow.gain.setValueAtTime(0.001, now);
            gainLow.gain.linearRampToValueAtTime(0.55, now + 2);
            gainLow.gain.linearRampToValueAtTime(0.001, now + 4.8);
            oscLow.connect(gainLow);
            gainLow.connect(masterGain);

            // 2. Oscilador Medio (Biotecnología vegetal)
            const oscMid = ctx.createOscillator();
            const gainMid = ctx.createGain();
            oscMid.type = 'triangle';
            oscMid.frequency.setValueAtTime(110, now);
            oscMid.frequency.exponentialRampToValueAtTime(164.81, now + 4.2);
            gainMid.gain.setValueAtTime(0.001, now);
            gainMid.gain.linearRampToValueAtTime(0.18, now + 2);
            gainMid.gain.linearRampToValueAtTime(0.001, now + 4.8);
            oscMid.connect(gainMid);
            gainMid.connect(masterGain);

            // 3. Oscilador Agudo (El "Despertar" - Shimmer etéreo)
            const oscHigh = ctx.createOscillator();
            const gainHigh = ctx.createGain();
            oscHigh.type = 'sine';
            oscHigh.frequency.setValueAtTime(440, now);
            oscHigh.frequency.linearRampToValueAtTime(880, now + 4.2);
            gainHigh.gain.setValueAtTime(0.001, now);
            gainHigh.gain.linearRampToValueAtTime(0.12, now + 2.5);
            gainHigh.gain.linearRampToValueAtTime(0.001, now + 4.8);
            oscHigh.connect(gainHigh);
            gainHigh.connect(masterGain);

            oscLow.start(now);
            oscMid.start(now);
            oscHigh.start(now);

            oscLow.stop(now + 5.0);
            oscMid.stop(now + 5.0);
            oscHigh.stop(now + 5.0);

            return () => {
                try {
                    masterGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                    setTimeout(() => ctx.close(), 150);
                } catch {
                    // Ignore cleanup error
                }
            };
        } catch (e) {
            console.warn('Web Audio API not supported or blocked:', e);
            return null;
        }
    };

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (stopAudioRef.current) {
                stopAudioRef.current();
            }
        };
    }, []);

    // Lanzar la secuencia de carga estilo videojuego
    const handleStartImmersion = () => {
        if (isLoadingSequence) return;
        setIsLoadingSequence(true);

        // Iniciar sonido cinemático
        stopAudioRef.current = playCinematicWakeup();

        // Progresión en pasos sincronizados
        const interval = setInterval(() => {
            setLoadingProgress((prev) => {
                if (prev >= 98) {
                    clearInterval(interval);
                    return 100;
                }
                const increment = Math.floor(Math.random() * 4) + 2;
                return Math.min(prev + increment, 98);
            });
        }, 80);

        // Secuencia de mensajes consola estilo HUD
        setTimeout(() => setStatusMessage('SINTETIZANDO NUTRIENTES MINERALES...'), 1200);
        setTimeout(() => setStatusMessage('SINCRONIZANDO MICELIO Y MICROBIOTA...'), 2400);
        setTimeout(() => setStatusMessage('DESPERTANDO ECOSISTEMA VIVO...'), 3500);
        setTimeout(() => setStatusMessage('¡SISTEMA BIOLÓGICO ONLINE!'), 4200);

        // Transición de salida majestuosa hacia la app principal
        setTimeout(() => {
            setLoadingProgress(100);
            setIsSlidingUp(true);
            setTimeout(() => {
                onEnter();
            }, 1200);
        }, 4400);
    };

    // Opción para omitir la carga directamente
    const handleSkip = () => {
        if (stopAudioRef.current) {
            stopAudioRef.current();
        }
        setIsSlidingUp(true);
        setTimeout(() => {
            onEnter();
        }, 500);
    };

    const handleGoToDoctor = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.location.hash = '#/doctor-plantas';
        handleStartImmersion();
    };

    const handleChatbotClick = (e: React.MouseEvent) => {
        e.preventDefault();
        window.location.hash = '#/mi-jardin';
        handleStartImmersion();
        setTimeout(() => {
            if (onOpenChatbot) {
                onOpenChatbot();
            } else {
                window.dispatchEvent(new CustomEvent('open-suelo-chatbot'));
            }
        }, 4600);
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
            className={`fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center overflow-hidden transition-all duration-[1200ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
                isSlidingUp ? '-translate-y-full opacity-90 pointer-events-none' : 'translate-y-0 opacity-100'
            }`}
            aria-modal="true"
            role="dialog"
        >
            <style>{`
                /* Efecto de Brillo Neón para el título */
                .text-glow-green {
                    text-shadow: 
                        0 0 10px rgba(34, 197, 94, 0.7), 
                        0 0 25px rgba(34, 197, 94, 0.5), 
                        0 0 45px rgba(34, 197, 94, 0.3);
                }

                /* Líneas topográficas de fondo para la pantalla de inicio */
                .bg-tech-grid {
                    background-size: 40px 40px;
                    background-image: 
                        linear-gradient(to right, rgba(34, 197, 94, 0.06) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(34, 197, 94, 0.06) 1px, transparent 1px);
                }
            `}</style>

            {/* Background Atmosphere Video (Behind Splash Content) */}
            <video
                className="absolute inset-0 w-full h-full object-cover scale-110 opacity-40 transition-transform duration-1000 pointer-events-none"
                autoPlay
                loop
                muted
                playsInline
                poster="https://res.cloudinary.com/dcm5pug0v/image/upload/v1772831008/ChatGPT_Image_6_mar_2026_03_03_22_p.m._ijymt9.png"
            >
                <source src="https://res.cloudinary.com/dcm5pug0v/video/upload/v1772831364/Animaci%C3%B3n_De_Imagen_Con_Lluvia_bsqvzn.mp4" type="video/mp4" />
            </video>

            {/* Tech grid overlay */}
            <div className="absolute inset-0 bg-tech-grid pointer-events-none opacity-60" />

            {/* Dark & Forest Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95 pointer-events-none" />
            
            {/* ============================================================== */}
            {/* OVERLAY DE CARGA CINEMÁTICA ESTILO VIDEOJUEGO                 */}
            {/* ============================================================== */}
            {isLoadingSequence && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-fade-in text-center">
                    {/* Top bar controls */}
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-mono transition-colors hover:bg-slate-800"
                            title={isMuted ? 'Activar sonido' : 'Silenciar'}
                        >
                            <span>{isMuted ? '🔇 Audio: OFF' : '🔊 Audio: ON'}</span>
                        </button>
                        <button
                            onClick={handleSkip}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-mono hover:bg-emerald-500/20 transition-colors"
                        >
                            <span>Omitir intro ➔</span>
                        </button>
                    </div>

                    {/* Biomorphic Futuristic Loading Ring */}
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-8 flex items-center justify-center">
                        {/* Outer rotating ring */}
                        <div 
                            className="absolute inset-0 rounded-full border-t-2 border-emerald-400 animate-spin opacity-70"
                            style={{ animationDuration: '3.5s' }}
                        />
                        {/* Inner reverse rotating ring */}
                        <div 
                            className="absolute inset-2.5 rounded-full border-r-2 border-emerald-500 animate-spin opacity-85"
                            style={{ animationDuration: '2.5s', animationDirection: 'reverse' }}
                        />
                        {/* Third innermost pulse ring */}
                        <div 
                            className="absolute inset-5 rounded-full border-b-2 border-teal-400 animate-spin opacity-60"
                            style={{ animationDuration: '4s' }}
                        />
                        {/* Center Sprout Icon */}
                        <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                            <LeafIcon className="w-7 h-7 text-emerald-400 animate-pulse" />
                        </div>
                    </div>

                    {/* Sci-Fi Title with Neon Glow */}
                    <h2 className="text-4xl sm:text-6xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600 text-glow-green mb-2">
                        SUELO URBANO
                    </h2>
                    <p className="text-emerald-400/70 text-xs sm:text-sm font-mono tracking-[0.25em] uppercase mb-8">
                        BIOTECNOLOGÍA & NUTRICIÓN VEGETAL VIVA
                    </p>

                    {/* Console Status Text & Progress Bar */}
                    <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center">
                        <div className="w-full flex justify-between items-center text-xs font-mono text-emerald-300/80 mb-2.5 tracking-wider">
                            <span className="h-5 flex items-center transition-all duration-300">
                                › {statusMessage}
                            </span>
                            <span className="font-bold text-emerald-400">
                                {loadingProgress}%
                            </span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="w-full bg-slate-900/90 h-2.5 rounded-full overflow-hidden border border-emerald-500/40 p-0.5 shadow-inner">
                            <div 
                                className="bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400 h-full rounded-full transition-all duration-100 ease-out shadow-[0_0_15px_rgba(16,185,129,0.9)]"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>

                        <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-500 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>Sincronizando nodos de micelio subterráneo</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* CONTENIDO PRINCIPAL DEL SPLASH SCREEN                          */}
            {/* ============================================================== */}
            <div className="relative z-10 text-white px-4 sm:px-6 w-full h-full flex flex-col overflow-y-auto py-8 md:py-12">
                
                {/* Header Section */}
                <div className="flex-shrink-0 text-center animate-fade-in-down mb-6 md:mb-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs md:text-sm font-bold uppercase tracking-widest mb-3 backdrop-blur-md shadow-lg shadow-emerald-950/50">
                        <SparklesIcon className="h-4 w-4 text-emerald-400 animate-pulse" />
                        <span>Suelo Urbano • Nutrición 100% Orgánica</span>
                    </div>

                    <div className="relative inline-block mb-3">
                        <img 
                            src="https://res.cloudinary.com/dsmzpsool/image/upload/v1759686619/WhatsApp_Image_2025-10-05_at_11.46.24_AM-removebg-preview_wleawb.png" 
                            alt="Alimento para plantas Logo" 
                            className="h-16 sm:h-20 md:h-24 mx-auto drop-shadow-[0_0_20px_rgba(74,222,128,0.4)]" 
                        />
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                        <span className="text-white">Bienvenido a </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-300 text-glow-green">
                            Alimento para Plantas
                        </span>
                    </h1>

                    <p className="text-stone-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mt-2 font-medium">
                        Regenera la tierra, activa las raíces y despierta la vitalidad de tus plantas con nutrición viva.
                    </p>
                </div>

                {/* Main Dynamic Content Layout - 2 Columns */}
                <div className="flex-grow w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch my-auto">
                    
                    {/* Left Column: Interactive Ecosystem Hub & Knowledge (5 Cols on Desktop) */}
                    <div className="lg:col-span-5 animate-fade-in-left flex flex-col justify-between gap-3 md:gap-4">
                        
                        {/* Interactive Card 1: Plant Doctor */}
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

                        {/* Interactive Card 2: Chatbot Virtual Gardener */}
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

                    {/* Right Column: 5 Core Plant Needs (7 Cols on Desktop) */}
                    <div className="lg:col-span-7 animate-fade-in-right flex flex-col justify-center">
                        <div className="bg-stone-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                            {/* Ambient Light Accent */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                            
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
                                        className="flex items-start gap-3.5 p-3 rounded-2xl bg-stone-950/60 border border-stone-800/80 hover:border-lime-500/40 hover:bg-stone-950/90 transition-all duration-300 transform hover:translate-x-1"
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
                </div>

                {/* Footer / Main CTA Section */}
                <div className="flex-shrink-0 animate-fade-in-up mt-6 md:mt-8 text-center pb-8 md:pb-12">
                    <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-4 text-stone-200 font-medium" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                        Descubre una nueva forma de nutrir tu tierra y conectar con la naturaleza.
                    </p>
                    <div className="inline-block relative">
                        {/* Glowing background aura */}
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full blur-lg opacity-60 animate-pulse" />
                        <button
                            onClick={handleStartImmersion}
                            className="relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold py-3.5 px-8 sm:px-12 md:py-4 md:px-14 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-[0_10px_25px_rgba(34,197,94,0.4)] text-base sm:text-lg md:text-xl flex items-center gap-3 cursor-pointer border border-emerald-400/40"
                        >
                            <SparklesIcon className="w-5 h-5 text-yellow-300 animate-pulse" />
                            <span>Comenzar inmersión ecológica</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WelcomeSplash;
