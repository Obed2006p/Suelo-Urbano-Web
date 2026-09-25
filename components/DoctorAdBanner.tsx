import React, { useRef, useState, useEffect } from 'react';
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
        id: 'suelo-urbano',
        icon: '🌱',
        tabLabel: 'Fórmula Botánica',
        shortLabel: 'Fórmula',
        badge: 'Fórmula Viva Suelo Urbano',
        title: 'Nutrición Botánica para tus Plantas',
        subtitle: 'Emulsión orgánica biológica para revitalizar hojas, raíces y suelo.',
        priceTag: 'Fórmula Oficial',
        videoUrl: 'https://res.cloudinary.com/dsmzpsool/video/upload/v1789095234/WhatsApp_Video_2026-09-10_at_7.19.27_PM_johlgx.mp4',
        whatsappNumber: '525652420968',
        whatsappText: 'Hola! Vi el spot oficial de Suelo Urbano Tu Hogar y me gustaría hacer una cotización de sus productos.',
    },
    {
        id: 'caminadora',
        icon: '🏃',
        tabLabel: 'Caminadora Seminueva',
        shortLabel: 'Caminadora',
        badge: 'Oportunidad de la Comunidad',
        title: 'Caminadora Seminueva en Venta',
        subtitle: 'Poco uso, excelente estado y lista para entrega inmediata.',
        priceTag: '$1,500 MXN',
        videoUrl: 'https://res.cloudinary.com/dsmzpsool/video/upload/v1789147050/WhatsApp_Video_2026-09-11_at_9.52.26_AM_tfmqei.mp4',
        whatsappNumber: '525652420968',
        whatsappText: 'Hola! Vi el anuncio de la caminadora seminueva ($1,500) y me interesa hacer una cotización.',
    }
];

const DoctorAdBanner: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [videoErrors, setVideoErrors] = useState<Record<number, boolean>>({});

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const currentSlide = AD_SLIDES[currentIndex];

    // Control video playback when slide changes
    useEffect(() => {
        const vid = videoRef.current;
        if (vid && !isCollapsed) {
            vid.currentTime = 0;
            vid.muted = isMuted;
            const playPromise = vid.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(() => setIsPlaying(false));
            }
        }
    }, [currentIndex, isCollapsed]);

    const togglePlay = () => {
        const vid = videoRef.current;
        if (!vid) return;
        if (vid.paused) {
            vid.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
            vid.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = () => {
        const vid = videoRef.current;
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        if (vid) vid.muted = newMuted;
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? AD_SLIDES.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === AD_SLIDES.length - 1 ? 0 : prev + 1));
    };

    const handleCotizacionClick = (slide: AdSlide) => {
        const encodedMsg = encodeURIComponent(slide.whatsappText);
        const url = `https://wa.me/${slide.whatsappNumber}?text=${encodedMsg}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleWebFormClick = () => {
        window.location.hash = '#/pedido';
    };

    if (isCollapsed) {
        return (
            <div className="w-full mb-6 flex justify-end">
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors border border-stone-200 dark:border-stone-700 cursor-pointer shadow-sm"
                    title="Mostrar anuncios destacados"
                >
                    <span>📢 Ver avisos destacados</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">({AD_SLIDES.length})</span>
                </button>
            </div>
        );
    }

    return (
        <aside 
            id="seccion-anuncio-suelo-urbano" 
            className="w-full mb-8 max-w-4xl mx-auto transition-all duration-300"
            aria-label="Anuncios y avisos destacados"
        >
            <div className="relative rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Barra superior discreta: título, selector de pestañas y botón de minimizar */}
                <div className="px-4 py-2.5 bg-stone-50/80 dark:bg-stone-800/60 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Avisos destacados
                        </span>
                        <div className="flex items-center gap-1 bg-stone-200/60 dark:bg-stone-700/60 p-0.5 rounded-lg text-xs">
                            {AD_SLIDES.map((slide, idx) => (
                                <button
                                    key={slide.id}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                                        currentIndex === idx
                                            ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm font-semibold'
                                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                                    }`}
                                >
                                    <span className="mr-1">{slide.icon}</span>
                                    <span>{slide.shortLabel}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs px-2 py-1 rounded hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors cursor-pointer flex items-center gap-1"
                        title="Ocultar anuncios"
                    >
                        <span>Ocultar</span>
                        <span className="text-sm leading-none">&times;</span>
                    </button>
                </div>

                {/* Contenido principal: Diseño equilibrado y espaciado (menos amontonado) */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    {/* Reproductor de Video en proporción compacta (no invasivo) */}
                    <div className="relative w-full sm:w-48 md:w-56 h-48 sm:h-52 rounded-xl overflow-hidden bg-black shrink-0 shadow-inner group">
                        <video
                            ref={videoRef}
                            key={currentSlide.id}
                            src={currentSlide.videoUrl}
                            className="w-full h-full object-cover cursor-pointer"
                            playsInline
                            muted={isMuted}
                            autoPlay
                            loop
                            onClick={togglePlay}
                            onError={() => setVideoErrors(prev => ({ ...prev, [currentIndex]: true }))}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />

                        {/* Botón de Sonido discreto */}
                        <div className="absolute top-2 right-2 z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMute();
                                }}
                                className="bg-black/60 hover:bg-black/80 text-white text-[11px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20 transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                                title={isMuted ? "Activar audio" : "Silenciar audio"}
                            >
                                {isMuted ? '🔇 Audio' : '🔊 Sonido'}
                            </button>
                        </div>

                        {/* Overlay al pausar */}
                        {!isPlaying && !videoErrors[currentIndex] && (
                            <div 
                                onClick={togglePlay}
                                className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow">
                                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {videoErrors[currentIndex] && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-stone-900 text-stone-300 text-xs">
                                <SproutIcon className="w-8 h-8 text-emerald-400 mb-1" />
                                <span className="text-[11px]">Video informativo</span>
                            </div>
                        )}
                    </div>

                    {/* Información y llamada a la acción con respiración y espaciado */}
                    <div className="flex-1 w-full flex flex-col justify-between self-stretch text-left">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                    {currentSlide.badge}
                                </span>
                                {currentSlide.priceTag && (
                                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                                        {currentSlide.priceTag}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
                                {currentSlide.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                                {currentSlide.subtitle}
                            </p>
                        </div>

                        {/* Botones de acción y navegación */}
                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex-wrap">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={goToPrev}
                                    aria-label="Anuncio anterior"
                                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                                    title="Anterior"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <span className="text-xs text-stone-500 font-medium">
                                    {currentIndex + 1} de {AD_SLIDES.length}
                                </span>
                                <button
                                    onClick={goToNext}
                                    aria-label="Siguiente anuncio"
                                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                                    title="Siguiente"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleWebFormClick}
                                    className="text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors px-2 py-1.5 cursor-pointer underline decoration-stone-300 dark:decoration-stone-700 underline-offset-2"
                                >
                                    Formulario de pedido
                                </button>
                                <button
                                    onClick={() => handleCotizacionClick(currentSlide)}
                                    className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                                    </svg>
                                    <span>Contactar por WhatsApp</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default DoctorAdBanner;
