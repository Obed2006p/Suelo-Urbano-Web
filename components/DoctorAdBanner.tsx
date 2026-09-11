import React, { useRef, useState, useEffect } from 'react';
import { SproutIcon } from './icons/Icons';

const AD_VIDEO_URL = "https://res.cloudinary.com/dsmzpsool/video/upload/v1789147050/WhatsApp_Video_2026-09-11_at_9.52.26_AM_tfmqei.mp4";

const DoctorAdBanner: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(err => {
                        console.warn("Autoplay bloqueado por políticas de navegador:", err);
                        setIsPlaying(false);
                    });
            }
        }
    }, []);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        const nextMuted = !isMuted;
        videoRef.current.muted = nextMuted;
        setIsMuted(nextMuted);
    };

    const handleOrderClick = () => {
        window.location.hash = '#/pedido';
    };

    const handleCompositionClick = () => {
        window.location.hash = '#/composicion';
    };

    return (
        <div id="seccion-anuncio-suelo-urbano" className="mb-12 w-full">
            {/* Header del espacio publicitario */}
            <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2">
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-black tracking-wider px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase">
                        Espacio Publicitario
                    </span>
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                        Suelo Urbano Tu Hogar
                    </span>
                </div>
                <span className="text-[11px] text-stone-400 dark:text-stone-500 hidden sm:inline">
                    Soluciones orgánicas para plantas urbanas
                </span>
            </div>

            {/* Banner publicitario fijo */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-850 to-emerald-950 text-white shadow-2xl border border-emerald-500/30 p-6 md:p-8 lg:p-10">
                {/* Glow decorativo de fondo */}
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Columna de Video Publicitario (Lg: 5 cols) */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                        <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-[9/13] max-h-[440px] rounded-2xl overflow-hidden bg-black shadow-xl border border-emerald-500/40 group">
                            <video
                                ref={videoRef}
                                src={AD_VIDEO_URL}
                                className="w-full h-full object-contain cursor-pointer"
                                playsInline
                                loop
                                muted={isMuted}
                                autoPlay
                                onClick={togglePlay}
                                onError={() => setHasError(true)}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            />

                            {/* Indicador de error o carga */}
                            {hasError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-stone-900 text-stone-300 text-xs">
                                    <p className="font-bold text-emerald-400 mb-1">Cargando spot comercial...</p>
                                    <p>Si tarda en reproducir, puedes presionar el botón de pedido al costado.</p>
                                </div>
                            )}

                            {/* Botón flotante para activar / silenciar audio */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMute();
                                }}
                                className="absolute bottom-4 left-4 bg-black/70 hover:bg-black/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer z-10"
                                title={isMuted ? "Activar sonido" : "Silenciar"}
                            >
                                {isMuted ? (
                                    <>
                                        <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                        </svg>
                                        <span className="font-bold text-xs text-stone-100">Activar audio</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 text-emerald-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                        <span className="font-bold text-xs text-emerald-300">Sonido activado</span>
                                    </>
                                )}
                            </button>

                            {/* Overlay de pausa */}
                            {!isPlaying && !hasError && (
                                <div 
                                    onClick={togglePlay}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                                >
                                    <div className="w-14 h-14 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-xl transform transition-transform hover:scale-110">
                                        <svg className="w-7 h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* Badge superior del video */}
                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-[10px] font-bold text-emerald-300">
                                <SproutIcon className="w-3 h-3 text-emerald-400" />
                                Spot Oficial
                            </div>
                        </div>
                    </div>

                    {/* Columna de Contenido Publicitario y Llamado a la Acción (Lg: 7 cols) */}
                    <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
                        
                        <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
                            <span>🌱 Nutrición y Rescate Botánico</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                            ¿Tu planta necesita recuperarse? <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
                                Dale el poder de la Emulsión Orgánica
                            </span>
                        </h3>

                        <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                            Complementa el diagnóstico de nuestro Doctor de Plantas con la fórmula biológica más completa de <strong>Suelo Urbano Tu Hogar</strong>. Estimula el nacimiento de raíces blancas y vigorosas, desintoxica la tierra y revitaliza el follaje de forma 100% natural.
                        </p>

                        {/* Puntos destacados del producto */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2">
                            <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-xl">
                                <div className="text-emerald-400 text-lg mb-1">🪱</div>
                                <h4 className="text-xs font-bold text-stone-100 mb-0.5">Humus Enriquecido</h4>
                                <p className="text-[11px] text-stone-400 leading-snug">Microbiología viva para reactivar suelos cansados.</p>
                            </div>

                            <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-xl">
                                <div className="text-emerald-400 text-lg mb-1">🌿</div>
                                <h4 className="text-xs font-bold text-stone-100 mb-0.5">Cero Químicos</h4>
                                <p className="text-[11px] text-stone-400 leading-snug">Seguro para plantas delicadas, niños y mascotas.</p>
                            </div>

                            <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-xl">
                                <div className="text-emerald-400 text-lg mb-1">⚡</div>
                                <h4 className="text-xs font-bold text-stone-100 mb-0.5">Acción Rápida</h4>
                                <p className="text-[11px] text-stone-400 leading-snug">Mejora la firmeza y verdor desde los primeros riegos.</p>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                            <button
                                onClick={handleOrderClick}
                                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-950/50 hover:shadow-emerald-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span>Adquirir Emulsión / Hacer Pedido</span>
                            </button>

                            <button
                                onClick={handleCompositionClick}
                                className="px-5 py-3.5 bg-stone-800/90 hover:bg-stone-700/90 text-stone-200 hover:text-white font-bold text-sm rounded-2xl border border-stone-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Ver Ingredientes y Composición</span>
                                <span>→</span>
                            </button>
                        </div>

                        {/* Garantía y confianza */}
                        <div className="pt-2 flex items-center gap-4 text-xs text-stone-400">
                            <span className="flex items-center gap-1">
                                <span className="text-emerald-400 font-bold">✓</span> Hecho en México
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="text-emerald-400 font-bold">✓</span> Asesoría botánica incluida
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="text-emerald-400 font-bold">✓</span> Entrega garantizada
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DoctorAdBanner;
