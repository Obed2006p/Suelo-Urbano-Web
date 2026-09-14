import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROCESS_SPOTS, ProcessSpot } from './ProcessSpots';

interface AnalysisProcessViewerProps {
    isAnalyzing: boolean;
    isDiagnosisReady: boolean;
    diagnosisSummary?: {
        nombrePlanta: string;
        estadoGeneral: string;
        diagnosticoBreve: string;
    } | null;
    onSkipToDiagnosis: () => void;
}

export const AnalysisProcessViewer: React.FC<AnalysisProcessViewerProps> = ({
    isAnalyzing,
    isDiagnosisReady,
    diagnosisSummary,
    onSkipToDiagnosis,
}) => {
    const [currentSpotIndex, setCurrentSpotIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showEmergentModal, setShowEmergentModal] = useState(false);
    const [hasDismissedEmergent, setHasDismissedEmergent] = useState(false);

    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const prevIndexRef = useRef(currentSpotIndex);

    const currentSpot = PROCESS_SPOTS[currentSpotIndex];

    // Mostrar modal emergente cuando el diagnóstico se vuelve listo
    useEffect(() => {
        if (isDiagnosisReady && !hasDismissedEmergent) {
            setShowEmergentModal(true);
        }
    }, [isDiagnosisReady, hasDismissedEmergent]);

    // Manejo de reproducción al cambiar de spot
    useEffect(() => {
        const indexChanged = prevIndexRef.current !== currentSpotIndex;
        prevIndexRef.current = currentSpotIndex;

        PROCESS_SPOTS.forEach((_, idx) => {
            const vid = videoRefs.current[idx];
            if (vid) {
                if (idx === currentSpotIndex) {
                    if (indexChanged) {
                        vid.currentTime = 0;
                    }
                    vid.muted = isMuted;
                    const playPromise = vid.play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => setIsPlaying(true))
                            .catch((err) => {
                                console.warn('Autoplay process spot:', err);
                                setIsPlaying(false);
                            });
                    }
                } else {
                    vid.pause();
                }
            }
        });
    }, [currentSpotIndex, isMuted]);

    const handleVideoEnded = (idx: number) => {
        if (idx === currentSpotIndex) {
            // Auto-avance continuo entre los 5 spots de proceso
            setCurrentSpotIndex((prev) => (prev === PROCESS_SPOTS.length - 1 ? 0 : prev + 1));
        }
    };

    const togglePlay = () => {
        const vid = videoRefs.current[currentSpotIndex];
        if (!vid) return;
        if (vid.paused) {
            vid.play();
            setIsPlaying(true);
        } else {
            vid.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        const vid = videoRefs.current[currentSpotIndex];
        if (vid) vid.muted = nextMuted;
    };

    const handleWhatsAppConsult = (spot: ProcessSpot) => {
        const msg = encodeURIComponent(spot.whatsappText);
        window.open(`https://wa.me/${spot.whatsappNumber}?text=${msg}`, '_blank', 'noopener,noreferrer');
    };

    const handleSkip = () => {
        setShowEmergentModal(false);
        setHasDismissedEmergent(true);
        onSkipToDiagnosis();
    };

    const handleKeepWatching = () => {
        setShowEmergentModal(false);
        setHasDismissedEmergent(true);
    };

    return (
        <div className="w-full relative my-3">
            {/* Contenedor Principal del Visor de Procesos */}
            <div className="w-full bg-stone-950 border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl text-white">
                
                {/* Barra de Encabezado con estado de la IA y pasos */}
                <div className="bg-gradient-to-r from-stone-900 via-emerald-950/60 to-stone-900 px-3.5 py-2.5 sm:px-5 sm:py-3 border-b border-emerald-500/30 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <div>
                            <span className="text-[11px] sm:text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                                <span>{isDiagnosisReady ? '✨ Diagnóstico Finalizado' : '🔬 Analizando Proceso Botánico'}</span>
                                <span className="text-stone-400 font-normal">| Spot {currentSpotIndex + 1} de {PROCESS_SPOTS.length}</span>
                            </span>
                            <h4 className="text-xs sm:text-sm font-extrabold text-stone-100 truncate max-w-[200px] sm:max-w-md">
                                {currentSpot.title}
                            </h4>
                        </div>
                    </div>

                    {/* Botón de Skip / Saltar siempre a mano */}
                    <div className="flex items-center gap-2">
                        {isDiagnosisReady && (
                            <button
                                type="button"
                                onClick={handleSkip}
                                className="animate-bounce px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-stone-950 font-black text-[11px] sm:text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                                <span>Ver Diagnóstico (Skip)</span>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={toggleMute}
                            className="px-2.5 py-1 bg-stone-900/90 hover:bg-stone-800 text-stone-300 text-[11px] font-bold rounded-lg border border-stone-700 cursor-pointer transition-all"
                            title={isMuted ? 'Activar sonido' : 'Silenciar'}
                        >
                            {isMuted ? '🔇 Audio' : '🔊 Con Sonido'}
                        </button>
                    </div>
                </div>

                {/* Selector de pestañas de los 5 spots de proceso */}
                <div className="bg-stone-900/70 border-b border-stone-800 px-2 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {PROCESS_SPOTS.map((spot, idx) => (
                        <button
                            key={spot.id}
                            type="button"
                            onClick={() => setCurrentSpotIndex(idx)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                currentSpotIndex === idx
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                            }`}
                        >
                            <span>{spot.icon}</span>
                            <span>{spot.shortLabel}</span>
                        </button>
                    ))}
                </div>

                {/* Escenario del Video (Formato 16:9 estilizado con soporte Reel) */}
                <div className="relative aspect-video sm:aspect-[21/9] md:aspect-[16/8] max-h-[360px] sm:max-h-[420px] w-full bg-black flex items-center justify-center overflow-hidden">
                    {PROCESS_SPOTS.map((spot, idx) => (
                        <div
                            key={spot.id}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                                idx === currentSpotIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                            }`}
                        >
                            <video
                                ref={(el) => (videoRefs.current[idx] = el)}
                                src={spot.videoUrl}
                                playsInline
                                muted={isMuted}
                                autoPlay
                                onClick={togglePlay}
                                onEnded={() => handleVideoEnded(idx)}
                                onPlay={() => {
                                    if (idx === currentSpotIndex) setIsPlaying(true);
                                }}
                                onPause={() => {
                                    if (idx === currentSpotIndex) setIsPlaying(false);
                                }}
                                className="w-full h-full object-contain cursor-pointer"
                            />
                        </div>
                    ))}

                    {/* Botón flotante Play/Pause al centro si está pausado */}
                    {!isPlaying && (
                        <button
                            type="button"
                            onClick={togglePlay}
                            className="absolute z-20 w-14 h-14 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-transform active:scale-95 cursor-pointer shadow-2xl"
                        >
                            <svg className="w-7 h-7 text-emerald-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </button>
                    )}

                    {/* Badge informativo en la esquina del video */}
                    <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-black text-emerald-300">
                        <span>{currentSpot.icon}</span>
                        <span>{currentSpot.badge}</span>
                    </div>

                    {/* Botón flotante rápido para saltar video si el diagnóstico está listo */}
                    {isDiagnosisReady && (
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="absolute bottom-3 right-3 z-20 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-full shadow-2xl active:scale-95 cursor-pointer flex items-center gap-1.5 border border-white/30 backdrop-blur-md"
                        >
                            <span>Saltar Spot (Skip)</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Footer interactivo con descripción del proceso y consulta */}
                <div className="bg-stone-950 px-3.5 py-2.5 sm:px-5 sm:py-3 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="text-left min-w-0 flex-1">
                        <p className="text-xs text-stone-300 font-medium line-clamp-1">
                            {currentSpot.description}
                        </p>
                        <p className="text-[10px] text-emerald-400/90 font-bold mt-0.5">
                            {currentSpot.tagline}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => handleWhatsAppConsult(currentSpot)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] sm:text-xs rounded-xl shadow transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                            <span>Cotizar Proceso</span>
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ============================================================
                PANTALLA / MODAL EMERGENTE AL ESTAR LISTO EL DIAGNÓSTICO
                El usuario decide: Ver su diagnóstico (Skip) o seguir viendo
               ============================================================ */}
            <AnimatePresence>
                {showEmergentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-stone-900 border-2 border-emerald-500 rounded-3xl max-w-md w-full p-5 sm:p-6 text-white shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-center relative overflow-hidden"
                        >
                            {/* Brillo decorativo */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

                            {/* Icono animado de éxito */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl sm:text-3xl mb-3 shadow-inner">
                                🌿
                            </div>

                            <span className="inline-block text-[11px] font-black uppercase text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 mb-2">
                                ✨ ¡Diagnóstico Finalizado!
                            </span>

                            <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
                                {diagnosisSummary?.nombrePlanta || 'Tu Planta'}
                            </h3>
                            
                            {diagnosisSummary?.estadoGeneral && (
                                <p className="text-xs sm:text-sm font-bold text-emerald-400 mb-2">
                                    Estado: <span className="text-stone-200">{diagnosisSummary.estadoGeneral}</span>
                                </p>
                            )}

                            {diagnosisSummary?.diagnosticoBreve && (
                                <p className="text-xs text-stone-300 leading-relaxed font-medium bg-stone-950/70 p-3 rounded-xl border border-stone-800 mb-4 text-left line-clamp-3">
                                    {diagnosisSummary.diagnosticoBreve}
                                </p>
                            )}

                            <p className="text-xs text-stone-400 mb-4 font-semibold">
                                ¿Deseas saltar el spot y consultar tu receta botánica completa o seguir viendo los videos del proceso?
                            </p>

                            {/* Opciones de Acción */}
                            <div className="flex flex-col gap-2.5">
                                <button
                                    type="button"
                                    onClick={handleSkip}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-stone-950 font-black text-sm rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <span>Ver mi Diagnóstico ahora (Skip)</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleKeepWatching}
                                    className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-700 transition-all active:scale-95 cursor-pointer"
                                >
                                    🎬 Seguir viendo videos del proceso
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnalysisProcessViewer;
