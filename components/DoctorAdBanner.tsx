import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SproutIcon } from './icons/Icons';

export interface AdSlide {
    id: string;
    icon?: string;
    tabLabel: string;
    shortLabel: string;
    badge: string;
    title: string;
    subtitle: string;
    videoUrl: string;
    whatsappNumber: string;
    whatsappText: string;
    priceTag?: string;
}

export const AD_SLIDES: AdSlide[] = [
    {
        id: 'caminadora',
        icon: '🏃',
        tabLabel: 'Caminadora Seminueva',
        shortLabel: 'Caminadora',
        badge: '⚡ Oportunidad Destacada',
        title: 'Caminadora Seminueva',
        subtitle: 'Muy poco uso · Lista para entrega inmediata',
        priceTag: '$1,500 MXN',
        videoUrl: 'https://res.cloudinary.com/dsmzpsool/video/upload/v1789147050/WhatsApp_Video_2026-09-11_at_9.52.26_AM_tfmqei.mp4',
        whatsappNumber: '525652420968',
        whatsappText: 'Hola! Vi el anuncio de la caminadora seminueva ($1,500) y me interesa hacer una cotización.',
    },
    {
        id: 'suelo-urbano',
        icon: '🌱',
        tabLabel: 'Fórmula Botánica',
        shortLabel: 'Fórmula',
        badge: '🌱 Nutrición Botánica Oficial',
        title: 'Suelo Urbano Tu Hogar',
        subtitle: 'Fórmula orgánica biológica para revivir tus plantas',
        priceTag: 'Fórmula Viva',
        videoUrl: 'https://res.cloudinary.com/dsmzpsool/video/upload/v1789095234/WhatsApp_Video_2026-09-10_at_7.19.27_PM_johlgx.mp4',
        whatsappNumber: '525652420968',
        whatsappText: 'Hola! Vi el spot oficial de Suelo Urbano Tu Hogar y me gustaría hacer una cotización de sus productos.',
    }
];

const DoctorAdBanner: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [videoErrors, setVideoErrors] = useState<Record<number, boolean>>({});

    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const mobileVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const prevIndexRef = useRef(currentIndex);

    // Touch swipe gestures for mobile
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [touchEndX, setTouchEndX] = useState<number | null>(null);

    const currentSlide = AD_SLIDES[currentIndex];

    // Control playback when changing slides or auto-advancing
    useEffect(() => {
        const indexChanged = prevIndexRef.current !== currentIndex;
        prevIndexRef.current = currentIndex;

        AD_SLIDES.forEach((_, idx) => {
            // Desktop video
            const vid = videoRefs.current[idx];
            if (vid) {
                if (idx === currentIndex) {
                    if (indexChanged) {
                        vid.currentTime = 0;
                    }
                    vid.muted = isMuted;
                    const playPromise = vid.play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => setIsPlaying(true))
                            .catch((err) => {
                                console.warn("Autoplay notice desktop:", err);
                                setIsPlaying(false);
                            });
                    }
                } else {
                    vid.pause();
                }
            }

            // Mobile video - Reproduce directamente desde que carga la página
            const mobVid = mobileVideoRefs.current[idx];
            if (mobVid) {
                if (idx === currentIndex) {
                    if (indexChanged) {
                        mobVid.currentTime = 0;
                    }
                    mobVid.muted = isMuted;
                    const playPromise = mobVid.play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => setIsPlaying(true))
                            .catch((err) => {
                                console.warn("Autoplay notice mobile:", err);
                                setIsPlaying(false);
                            });
                    }
                } else {
                    mobVid.pause();
                }
            }
        });
    }, [currentIndex, isMuted]);

    // Sync mute changes
    const toggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        const activeVid = videoRefs.current[currentIndex];
        if (activeVid) {
            activeVid.muted = nextMuted;
        }
        const activeMobVid = mobileVideoRefs.current[currentIndex];
        if (activeMobVid) {
            activeMobVid.muted = nextMuted;
        }
    };

    // Toggle play/pause for active video
    const togglePlay = () => {
        const activeVid = videoRefs.current[currentIndex] || mobileVideoRefs.current[currentIndex];
        if (!activeVid) return;
        if (activeVid.paused) {
            activeVid.play();
            setIsPlaying(true);
        } else {
            activeVid.pause();
            setIsPlaying(false);
        }
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? AD_SLIDES.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === AD_SLIDES.length - 1 ? 0 : prev + 1));
    };

    // Auto-avance al finalizar la reproducción de un video
    const handleVideoEnded = (idx: number) => {
        if (idx === currentIndex) {
            goToNext();
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEndX(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStartX === null || touchEndX === null) return;
        const diff = touchStartX - touchEndX;
        if (diff > 45) {
            goToNext();
        } else if (diff < -45) {
            goToPrev();
        }
        setTouchStartX(null);
        setTouchEndX(null);
    };

    const handleCotizacionClick = (slide: AdSlide) => {
        const encodedMsg = encodeURIComponent(slide.whatsappText);
        const url = `https://wa.me/${slide.whatsappNumber}?text=${encodedMsg}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleWebFormClick = () => {
        window.location.hash = '#/pedido';
    };

    const scrollToDoctor = () => {
        const el = document.getElementById('doctor-uploader');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div id="seccion-anuncio-suelo-urbano" className="mb-3 md:mb-10 w-full">
            {/* ============================================================
                VISTA PARA DISPOSITIVOS MÓVILES (md:hidden)
                Anuncio en video visible directamente con dimensiones compactas
               ============================================================ */}
            <div className="block md:hidden">
                <div className="rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-black text-white shadow-xl border border-emerald-500/25 p-2.5 xs:p-3 flex flex-col items-center">
                    {/* Header superior: Indicador de spot y selectores rápidos */}
                    <div className="w-full flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 flex-shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Spot {currentIndex + 1}/{AD_SLIDES.length}
                            </span>
                            <span className="text-[11px] font-extrabold text-stone-100 truncate">
                                {currentSlide.title}
                            </span>
                        </div>

                        {/* Tabs directos entre los 2 anuncios */}
                        <div className="flex items-center bg-stone-900 border border-stone-800 p-0.5 rounded-lg text-[10px] flex-shrink-0">
                            {AD_SLIDES.map((slide, idx) => (
                                <button
                                    key={slide.id}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                                        currentIndex === idx
                                            ? 'bg-emerald-600 text-white shadow'
                                            : 'text-stone-400 hover:text-stone-200'
                                    }`}
                                >
                                    <span>{slide.icon || '🎬'}</span>
                                    <span className="ml-1">{slide.shortLabel}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contenedor de Video en formato compacto con altura reducida */}
                    <div 
                        className="relative w-full max-w-[270px] xs:max-w-[290px] h-[165px] xs:h-[180px] rounded-xl overflow-hidden bg-black shadow-lg border border-emerald-500/30 group"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {AD_SLIDES.map((slide, idx) => (
                            <div
                                key={slide.id}
                                className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                                    currentIndex === idx ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                                }`}
                            >
                                <video
                                    ref={(el) => {
                                        mobileVideoRefs.current[idx] = el;
                                    }}
                                    src={slide.videoUrl}
                                    className="w-full h-full object-cover cursor-pointer"
                                    playsInline
                                    muted={isMuted}
                                    autoPlay
                                    onClick={togglePlay}
                                    onEnded={() => handleVideoEnded(idx)}
                                    onError={() => setVideoErrors(prev => ({ ...prev, [idx]: true }))}
                                    onPlay={() => {
                                        if (idx === currentIndex) setIsPlaying(true);
                                    }}
                                    onPause={() => {
                                        if (idx === currentIndex) setIsPlaying(false);
                                    }}
                                />
                            </div>
                        ))}

                        {/* Badge de Categoría y Botón de Sonido */}
                        <div className="absolute top-2 inset-x-2 z-20 flex items-center justify-between pointer-events-auto">
                            <span className="bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15 text-[9px] font-black text-emerald-300 shadow">
                                {currentSlide.badge}
                            </span>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMute();
                                }}
                                className="bg-black/80 hover:bg-black/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1 active:scale-95 cursor-pointer shadow"
                            >
                                {isMuted ? '🔇 Audio' : '🔊 Con sonido'}
                            </button>
                        </div>

                        {/* Etiqueta de Precio */}
                        {currentSlide.priceTag && (
                            <span className="absolute bottom-2 left-2 z-20 text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500 text-stone-950 shadow">
                                {currentSlide.priceTag}
                            </span>
                        )}

                        {/* Play overlay cuando está pausado */}
                        {!isPlaying && !videoErrors[currentIndex] && (
                            <div 
                                onClick={togglePlay}
                                className="absolute inset-0 z-15 bg-black/40 backdrop-blur-[1px] flex items-center justify-center cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-lg">
                                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Barra inferior compacta: Flechas, Subtítulo y Botón Cotizar */}
                    <div className="w-full mt-2 flex items-center justify-between gap-2 pt-1.5 border-t border-stone-800/80">
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                                onClick={goToPrev}
                                aria-label="Spot anterior"
                                className="p-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white active:scale-95 cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={goToNext}
                                aria-label="Siguiente spot"
                                className="p-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white active:scale-95 cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <div className="min-w-0 flex-1 text-center px-1">
                            <p className="text-[10px] text-stone-300 truncate font-medium">
                                {currentSlide.subtitle}
                            </p>
                        </div>

                        <button
                            onClick={() => handleCotizacionClick(currentSlide)}
                            className="flex-shrink-0 py-1.5 px-3 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 text-stone-950 font-black text-xs rounded-xl shadow active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5 text-stone-950" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                            </svg>
                            <span>Cotizar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ============================================================
                VISTA PARA COMPUTADORAS (hidden md:block)
                Diseño original EXACTO, espacioso y cinematográfico
               ============================================================ */}
            <div className="hidden md:block">
                {/* Barra superior de identificación y selector rápido */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3 px-1">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 text-[11px] font-black tracking-wider px-3 py-1 rounded-full border border-emerald-500/30 uppercase">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Spots Publicitarios
                        </span>
                        <span className="text-xs font-semibold text-stone-400">
                            Carrusel de Oportunidades
                        </span>
                    </div>

                    {/* Tabs de selección directa entre los videos */}
                    <div className="flex items-center bg-stone-900/90 border border-stone-800 p-1 rounded-xl shadow-inner text-xs overflow-x-auto max-w-full">
                        {AD_SLIDES.map((slide, idx) => (
                            <button
                                key={slide.id}
                                onClick={() => setCurrentIndex(idx)}
                                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    currentIndex === idx
                                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md shadow-emerald-900/50 scale-[1.02]'
                                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                                }`}
                            >
                                <span>{slide.icon || '🎬'}</span>
                                <span className="hidden xs:inline sm:inline">{slide.tabLabel}</span>
                                <span className="xs:hidden sm:hidden">{idx + 1}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contenedor Principal del Carrusel Innovador */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-black text-white shadow-2xl border border-emerald-500/25 p-4 sm:p-6 md:p-8">
                    {/* Iluminación ambiental de fondo (Glow dinámico) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -top-24 right-10 w-64 h-64 bg-green-500/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div 
                        className="relative max-w-4xl mx-auto flex flex-col items-center"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Controles de navegación laterales para PC */}
                        <button
                            onClick={goToPrev}
                            aria-label="Anuncio anterior"
                            className="hidden md:flex absolute left-2 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-stone-900/80 hover:bg-emerald-600/90 text-stone-200 hover:text-white border border-white/10 hover:border-emerald-400 items-center justify-center backdrop-blur-md shadow-xl transition-all active:scale-90 cursor-pointer group"
                        >
                            <svg className="w-6 h-6 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={goToNext}
                            aria-label="Siguiente anuncio"
                            className="hidden md:flex absolute right-2 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-stone-900/80 hover:bg-emerald-600/90 text-stone-200 hover:text-white border border-white/10 hover:border-emerald-400 items-center justify-center backdrop-blur-md shadow-xl transition-all active:scale-90 cursor-pointer group"
                        >
                            <svg className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Escenario Central del Video: Formato Reel estilizado */}
                        <div className="relative w-full max-w-[340px] sm:max-w-[370px] md:max-w-[390px] aspect-[9/15] rounded-3xl overflow-hidden bg-black shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-emerald-500/40 group">
                            
                            {/* Renderizado de los videos (conservando estado para transiciones rápidas) */}
                            {AD_SLIDES.map((slide, idx) => (
                                <div
                                    key={slide.id}
                                    className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                                        currentIndex === idx ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                                    }`}
                                >
                                    <video
                                        ref={(el) => {
                                            videoRefs.current[idx] = el;
                                        }}
                                        src={slide.videoUrl}
                                        className="w-full h-full object-cover cursor-pointer"
                                        playsInline
                                        muted={isMuted}
                                        autoPlay
                                        onClick={togglePlay}
                                        onEnded={() => handleVideoEnded(idx)}
                                        onError={() => setVideoErrors(prev => ({ ...prev, [idx]: true }))}
                                        onPlay={() => {
                                            if (idx === currentIndex) setIsPlaying(true);
                                        }}
                                        onPause={() => {
                                            if (idx === currentIndex) setIsPlaying(false);
                                        }}
                                    />

                                    {videoErrors[idx] && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-stone-900/95 text-stone-200 text-xs">
                                            <SproutIcon className="w-10 h-10 text-emerald-400 mb-2" />
                                            <p className="font-bold text-sm text-white mb-1">Cargando spot publicitario...</p>
                                            <p className="text-stone-400">Si tarda en reproducir, puedes presionar el botón inferior de cotización.</p>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Capa de control superior dentro del video */}
                            <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-auto">
                                {/* Badge de la diapositiva activa */}
                                <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 shadow-lg">
                                    <span>{currentSlide.badge}</span>
                                </div>

                                {/* Botón de Audio */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMute();
                                    }}
                                    className="bg-black/75 hover:bg-black/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
                                    title={isMuted ? "Activar audio" : "Silenciar audio"}
                                >
                                    {isMuted ? (
                                        <>
                                            <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                            </svg>
                                            <span className="font-bold text-[11px] text-stone-100">Activar audio</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 text-emerald-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            </svg>
                                            <span className="font-bold text-[11px] text-emerald-300">Audio activo</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Overlay interactivo de pausa */}
                            {!isPlaying && !videoErrors[currentIndex] && (
                                <div 
                                    onClick={togglePlay}
                                    className="absolute inset-0 z-15 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer"
                                >
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-2xl transform transition-transform hover:scale-110">
                                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* Barra flotante inferior integrada: Información sintética + Botón Hacer cotización */}
                            <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-black via-black/85 to-transparent pt-12 flex flex-col gap-2.5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-black text-white text-base leading-tight drop-shadow">
                                            {currentSlide.title}
                                        </h4>
                                        <p className="text-xs text-stone-300 font-medium line-clamp-1 drop-shadow">
                                            {currentSlide.subtitle}
                                        </p>
                                    </div>
                                    {currentSlide.priceTag && (
                                        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500 text-stone-950 shadow-md">
                                            {currentSlide.priceTag}
                                        </span>
                                    )}
                                </div>

                                {/* Botón Principal: Hacer cotización */}
                                <button
                                    onClick={() => handleCotizacionClick(currentSlide)}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 hover:from-emerald-400 hover:to-green-400 text-stone-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-950/60 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <svg className="w-5 h-5 text-stone-950" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                                    </svg>
                                    <span>Hacer cotización</span>
                                </button>
                            </div>
                        </div>

                        {/* Controles inferiores de navegación y deslizamiento (para PC y tablets) */}
                        <div className="flex items-center justify-between w-full max-w-[340px] sm:max-w-[370px] mt-4 px-2">
                            {/* Botón flecha izquierda */}
                            <button
                                onClick={goToPrev}
                                aria-label="Anterior"
                                className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 transition-all active:scale-95 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                <span className="hidden xs:inline">Anterior</span>
                            </button>

                            {/* Indicadores tipo píldora interactivos */}
                            <div className="flex items-center gap-2">
                                {AD_SLIDES.map((slide, idx) => (
                                    <button
                                        key={slide.id}
                                        onClick={() => setCurrentIndex(idx)}
                                        aria-label={`Ir al anuncio ${idx + 1}`}
                                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                                            currentIndex === idx
                                                ? 'w-7 h-2.5 bg-emerald-400 shadow-md shadow-emerald-500/50'
                                                : 'w-2.5 h-2.5 bg-stone-700 hover:bg-stone-500'
                                        }`}
                                    />
                                ))}
                                <span className="text-[11px] font-bold text-stone-500 ml-1">
                                    {currentIndex + 1} / {AD_SLIDES.length}
                                </span>
                            </div>

                            {/* Botón flecha derecha */}
                            <button
                                onClick={goToNext}
                                aria-label="Siguiente"
                                className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 transition-all active:scale-95 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                            >
                                <span className="hidden xs:inline">Siguiente</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Acceso opcional a pedido por formulario web */}
                        <div className="mt-3 text-center">
                            <button
                                onClick={handleWebFormClick}
                                className="text-xs text-stone-400 hover:text-emerald-400 transition-colors underline decoration-stone-700 underline-offset-4 cursor-pointer"
                            >
                                O si prefieres, llena el formulario de pedido y cotización web →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorAdBanner;
