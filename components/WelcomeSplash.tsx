
import React, { useState } from 'react';
import { HeartbeatIcon, YouTubeIcon, CheckCircleIcon } from './icons/Icons';

interface WelcomeSplashProps {
    onEnter: () => void;
}

const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onEnter }) => {
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

    return (
        <div 
            className={`fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden transition-opacity duration-1000 ease-in-out ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            aria-modal="true"
            role="dialog"
        >
            {/* Background Video */}
            <video
                className="absolute inset-0 w-full h-full object-cover scale-150"
                autoPlay
                loop
                muted
                playsInline
                poster="https://res.cloudinary.com/dcm5pug0v/image/upload/v1772831008/ChatGPT_Image_6_mar_2026_03_03_22_p.m._ijymt9.png"
            >
                <source src="https://res.cloudinary.com/dcm5pug0v/video/upload/v1772831364/Animaci%C3%B3n_De_Imagen_Con_Lluvia_bsqvzn.mp4" type="video/mp4" />
            </video>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60"></div>
            
            {/* Main Content */}
            <div className="relative z-10 text-white px-4 w-full h-full flex flex-col overflow-y-auto py-8 md:py-12">
                
                {/* Header */}
                <div className="flex-shrink-0 text-center animate-fade-in-down mb-8">
                     <img 
                        src="https://res.cloudinary.com/dsmzpsool/image/upload/v1759686619/WhatsApp_Image_2025-10-05_at_11.46.24_AM-removebg-preview_wleawb.png" 
                        alt="Alimento para plantas Logo" 
                        className="h-16 md:h-20 mx-auto mb-4" 
                    />

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight" style={{textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>
                        Bienvenido a<br/>Alimento para plantas
                    </h1>
                </div>

                {/* Split Content - 3 Columns on Desktop */}
                <div className="flex-grow w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    
                    {/* Left Column: Plant Needs Info */}
                    <div className="animate-fade-in-left order-2 lg:order-1">
                        <div className="bg-stone-900/60 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl">
                            <h2 className="text-xl md:text-2xl font-bold text-lime-400 mb-4 text-center lg:text-left">
                                Cosas que necesita tu planta para estar bien
                            </h2>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-lime-400 flex-shrink-0 mt-1" />
                                    <span className="text-white text-sm md:text-base">
                                        <strong className="text-lime-200">Buen sustrato</strong> (aireado y con materia orgánica).
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-lime-400 flex-shrink-0 mt-1" />
                                    <span className="text-white text-sm md:text-base">
                                        <strong className="text-lime-200">Drenaje adecuado</strong> (que no se encharque).
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-lime-400 flex-shrink-0 mt-1" />
                                    <span className="text-white text-sm md:text-base">
                                        <strong className="text-lime-200">Microvida activa</strong> (humus, compost bien hecho).
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-lime-400 flex-shrink-0 mt-1" />
                                    <span className="text-white text-sm md:text-base">
                                        <strong className="text-lime-200">pH equilibrado</strong> (ni muy alcalino ni muy ácido).
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-lime-400 flex-shrink-0 mt-1" />
                                    <span className="text-white text-sm md:text-base">
                                        <strong className="text-lime-200">Riego correcto</strong> (ni exceso ni sequía prolongada).
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Center Column: Video Mosaic */}
                    <div className="animate-fade-in-up order-1 lg:order-2 flex justify-center w-full">
                        <div className="grid grid-cols-2 gap-2 w-full max-w-md lg:max-w-full">
                            <div className="aspect-square rounded-xl overflow-hidden border border-white/20 shadow-lg">
                                <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
                                    <source src="https://res.cloudinary.com/dcm5pug0v/video/upload/v1772852016/WhatsApp_Video_2026-03-06_at_8.31.01_PM_rbnbpl.mp4" type="video/mp4" />
                                </video>
                            </div>
                            <div className="aspect-square rounded-xl overflow-hidden border border-white/20 shadow-lg">
                                <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
                                    <source src="https://res.cloudinary.com/dcm5pug0v/video/upload/v1772852016/WhatsApp_Video_2026-03-06_at_8.32.03_PM_by8id7.mp4" type="video/mp4" />
                                </video>
                            </div>
                            <div className="aspect-square rounded-xl overflow-hidden border border-white/20 shadow-lg">
                                <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
                                    <source src="https://res.cloudinary.com/dcm5pug0v/video/upload/v1772852016/WhatsApp_Video_2026-03-06_at_8.33.04_PM_yobxir.mp4" type="video/mp4" />
                                </video>
                            </div>
                            <div className="aspect-square rounded-xl overflow-hidden border border-white/20 shadow-lg">
                                <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
                                    <source src="https://res.cloudinary.com/dcm5pug0v/video/upload/v1772852016/WhatsApp_Video_2026-03-06_at_8.34.10_PM_aroegp.mp4" type="video/mp4" />
                                </video>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Action Buttons */}
                    <div className="animate-fade-in-right order-3 lg:order-3 flex flex-col gap-4">
                        
                        {/* Action 1: Doctor IA */}
                        <a 
                            href="#/doctor-plantas"
                            onClick={handleGoToDoctor}
                            className="group flex items-center gap-3 p-4 rounded-2xl bg-stone-900/80 backdrop-blur-md border border-lime-400/30 hover:bg-stone-900 hover:border-lime-400/60 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_15px_rgba(163,230,53,0.15)] hover:shadow-[0_0_25px_rgba(163,230,53,0.3)] text-left w-full"
                            aria-label="Ir al Doctor de Plantas"
                        >
                            <div className="bg-lime-400/20 p-3 rounded-full group-hover:bg-lime-400/30 transition-colors flex-shrink-0">
                                <HeartbeatIcon className="h-6 w-6 text-lime-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm text-lime-400 truncate">¿Tu planta no mejora?</p>
                                <p className="text-xs text-white/90 group-hover:text-white truncate">Diagnóstico del ecosistema &rarr;</p>
                            </div>
                        </a>

                        {/* Action 2: What is Suelo Urbano */}
                        <a 
                            href="https://youtu.be/kuCRR-3TbxI?si=91sbDh14gOvjeRBD"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 p-4 rounded-2xl bg-stone-900/80 backdrop-blur-md border border-lime-400/30 hover:bg-stone-900 hover:border-lime-400/60 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_15px_rgba(163,230,53,0.15)] hover:shadow-[0_0_25px_rgba(163,230,53,0.3)] text-left w-full"
                            aria-label="Ver video sobre Suelo Urbano"
                        >
                            <div className="bg-lime-400/20 p-3 rounded-full group-hover:bg-lime-400/30 transition-colors flex-shrink-0">
                                <YouTubeIcon className="h-6 w-6 text-lime-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm md:text-base text-lime-400">¿Qué es Suelo Urbano?</p>
                                <p className="text-xs text-white/90 group-hover:text-white truncate">Descúbrelo aquí &rarr;</p>
                            </div>
                        </a>

                    </div>
                </div>

                {/* Footer / Main CTA */}
                <div className="flex-shrink-0 animate-fade-in-up mt-8 text-center pb-8" style={{ animationDelay: '0.4s' }}>
                    <p className="text-base md:text-xl max-w-2xl mx-auto mb-6" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>
                        Descubre una nueva forma de nutrir tu tierra y conectar con la naturaleza.
                    </p>
                    <button
                        onClick={handleEnterClick}
                        className="bg-green-600 text-white font-bold py-3 px-8 md:py-4 md:px-12 rounded-full hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg text-lg md:text-xl"
                    >
                        Comenzar asesoría gratuita
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeSplash;
