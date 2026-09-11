import React, { useState, useEffect, useRef } from 'react';
import { XIcon, SproutIcon } from './icons/Icons';

export interface Fact {
    id: number;
    title: string;
    summary: string;
    details: string;
    image: string;
}

interface CuriousFactPopupProps {
    isVisible: boolean;
    onClose: () => void;
}

const VIDEO_URL = "https://res.cloudinary.com/dsmzpsool/video/upload/v1789147050/WhatsApp_Video_2026-09-11_at_9.52.26_AM_tfmqei.mp4";

const CuriousFactPopup: React.FC<CuriousFactPopupProps> = ({ isVisible, onClose }) => {
    const [animateOut, setAnimateOut] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [hasError, setHasError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isVisible) {
            setAnimateOut(false);
            setHasError(false);
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => setIsPlaying(true))
                        .catch(err => {
                            console.warn("Autoplay bloqueado por el navegador:", err);
                            setIsPlaying(false);
                        });
                }
            }
        } else {
            if (videoRef.current) {
                videoRef.current.pause();
            }
        }
    }, [isVisible]);

    const handleClose = () => {
        setAnimateOut(true);
        if (videoRef.current) {
            videoRef.current.pause();
        }
        setTimeout(() => {
            onClose();
        }, 400);
    };

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

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        const nextMuted = !isMuted;
        videoRef.current.muted = nextMuted;
        setIsMuted(nextMuted);
    };

    const handleGoToOrder = () => {
        handleClose();
        window.location.hash = '#/pedido';
    };

    if (!isVisible) return null;

    return (
        <div 
            id="spot-video-popup"
            className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[160] w-[calc(100%-2rem)] max-w-[340px] sm:max-w-[360px] transition-all duration-400 transform ${
                animateOut ? 'translate-y-16 opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'
            }`}
        >
            <div className="bg-stone-900/95 text-white rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden flex flex-col backdrop-blur-md">
                
                {/* Header bar */}
                <div className="px-4 py-3 bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 flex items-center justify-between border-b border-emerald-500/20">
                    <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <SproutIcon className="w-3.5 h-3.5" />
                        </span>
                        <div>
                            <span className="text-xs font-black tracking-wide text-emerald-300 uppercase block">
                                Suelo Urbano Tu Hogar
                            </span>
                            <span className="text-[10px] text-stone-400 font-medium leading-none block">
                                Spot Publicitario · Prueba Piloto
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={handleClose}
                        className="text-stone-400 hover:text-white bg-stone-800/80 hover:bg-stone-700/80 p-1.5 rounded-full transition-colors cursor-pointer"
                        title="Cerrar video"
                        aria-label="Cerrar video"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Video Container */}
                <div className="relative w-full bg-black aspect-[9/14] max-h-[380px] overflow-hidden flex items-center justify-center group">
                    <video
                        ref={videoRef}
                        src={VIDEO_URL}
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

                    {/* Fallback if error */}
                    {hasError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-stone-900 text-stone-300 text-xs">
                            <p className="font-bold text-emerald-400 mb-1">Cargando video...</p>
                            <p>Si tarda en reproducir, puedes presionar el botón de abajo para ver nuestros productos.</p>
                        </div>
                    )}

                    {/* Floating Audio Toggle Button */}
                    <button
                        onClick={toggleMute}
                        className="absolute bottom-3 left-3 bg-black/65 hover:bg-black/85 text-white text-xs px-2.5 py-1.5 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-lg transition-transform active:scale-90 cursor-pointer"
                        title={isMuted ? "Activar sonido" : "Silenciar"}
                    >
                        {isMuted ? (
                            <>
                                <svg className="w-3.5 h-3.5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                                <span className="font-bold text-[11px] text-stone-100">Activar audio</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5 text-emerald-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                                <span className="font-bold text-[11px] text-emerald-300">Con audio</span>
                            </>
                        )}
                    </button>

                    {/* Play/Pause Overlay indicator when paused */}
                    {!isPlaying && !hasError && (
                        <div 
                            onClick={togglePlay}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                                <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Call to Action */}
                <div className="p-3.5 bg-stone-900 border-t border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-stone-300 font-semibold leading-tight">
                            Nutrición 100% Orgánica para tus Raíces
                        </p>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Hecho en México
                        </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <button
                            onClick={handleGoToOrder}
                            className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>Hacer Pedido</span>
                        </button>
                        
                        <button
                            onClick={handleClose}
                            className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-xs rounded-xl transition-all cursor-pointer"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>

                {/* Bottom accent line */}
                <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-green-400 to-lime-500"></div>
            </div>
        </div>
    );
};

export default CuriousFactPopup;
