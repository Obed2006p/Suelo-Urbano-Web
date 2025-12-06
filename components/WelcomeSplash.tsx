
import React, { useState } from 'react';
import { HeartbeatIcon, YouTubeIcon, CameraIcon, BeakerIcon } from './icons/Icons';

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

    const handleGoToPh = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (isExiting) return;
        
        // Iniciamos la salida
        handleEnterClick();
        
        // Esperamos a que la home se cargue y hacemos scroll
        setTimeout(() => {
            const element = document.getElementById('info-ph');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 1100);
    };


    return (
        <div 
            className={`fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            aria-modal="true"
            role="dialog"
        >
            {/* Background Image */}
            <div
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('https://res.cloudinary.com/dsmzpsool/image/upload/v1756491535/Design_Wave_Ai_photos_images_assets_ubsaqo.jpg')" }}
                aria-label="Fondo de una mano sosteniendo una planta joven."
                role="img"
            ></div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60"></div>
            
            {/* Main Content */}
            <div className="relative z-10 text-center text-white px-4 w-full flex-grow flex flex-col items-center justify-center overflow-y-auto py-8">
                
                <div className="animate-fade-in-down w-full flex flex-col items-center">
                     <img 
                        src="https://res.cloudinary.com/dsmzpsool/image/upload/v1759686619/WhatsApp_Image_2025-10-05_at_11.46.24_AM-removebg-preview_wleawb.png" 
                        alt="Alimento para plantas Logo" 
                        className="h-16 md:h-20 mx-auto mb-6" 
                    />

                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-8 md:mb-10" style={{textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>
                        Bienvenido a<br/>Alimento para plantas
                    </h1>

                    {/* Grid of actions - Updated to 2x2 on tablet, 4x1 on desktop */}
                    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
                        
                        {/* Action 1: Doctor IA */}
                        <a 
                            href="#/doctor-plantas"
                            onClick={handleGoToDoctor}
                            className="group flex items-center gap-3 p-3 md:p-4 rounded-2xl bg-stone-900/80 backdrop-blur-md border border-lime-400/30 hover:bg-stone-900 hover:border-lime-400/60 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_15px_rgba(163,230,53,0.15)] hover:shadow-[0_0_25px_rgba(163,230,53,0.3)] text-left"
                            aria-label="Ir al Doctor de Plantas"
                        >
                            <div className="bg-lime-400/20 p-3 rounded-full group-hover:bg-lime-400/30 transition-colors flex-shrink-0">
                                <HeartbeatIcon className="h-6 w-6 text-lime-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm text-lime-400 truncate">¿Planta enferma?</p>
                                <p className="text-xs text-white/90 group-hover:text-white truncate">Diagnóstico con IA &rarr;</p>
                            </div>
                        </a>

                        {/* Action 2: What is Suelo Urbano */}
                        <a 
                            href="https://youtu.be/kuCRR-3TbxI?si=91sbDh14gOvjeRBD"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 p-3 md:p-4 rounded-2xl bg-stone-900/80 backdrop-blur-md border border-lime-400/30 hover:bg-stone-900 hover:border-lime-400/60 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_15px_rgba(163,230,53,0.15)] hover:shadow-[0_0_25px_rgba(163,230,53,0.3)] text-left"
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

                        {/* Action 3: Before and After */}
                        <a 
                            href="https://youtu.be/zyOJhsOhv7Q?si=aEE1e2xU9YjyusSb"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 p-3 md:p-4 rounded-2xl bg-stone-900/80 backdrop-blur-md border border-lime-400/30 hover:bg-stone-900 hover:border-lime-400/60 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_15px_rgba(163,230,53,0.15)] hover:shadow-[0_0_25px_rgba(163,230,53,0.3)] text-left"
                            aria-label="Ver resultados de antes y después"
                        >
                            <div className="bg-lime-400/20 p-3 rounded-full group-hover:bg-lime-400/30 transition-colors flex-shrink-0">
                                <CameraIcon className="h-6 w-6 text-lime-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm md:text-base text-lime-400">El antes y después</p>
                                <p className="text-xs text-white/90 group-hover:text-white truncate">Mira resultados aquí &rarr;</p>
                            </div>
                        </a>

                        {/* Action 4: pH Secret (New) */}
                        <a 
                            href="#info-ph"
                            onClick={handleGoToPh}
                            className="group flex items-center gap-3 p-3 md:p-4 rounded-2xl bg-stone-900/80 backdrop-blur-md border border-lime-400/30 hover:bg-stone-900 hover:border-lime-400/60 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_15px_rgba(163,230,53,0.15)] hover:shadow-[0_0_25px_rgba(163,230,53,0.3)] text-left"
                            aria-label="Ir a la sección de pH"
                        >
                            <div className="bg-lime-400/20 p-3 rounded-full group-hover:bg-lime-400/30 transition-colors flex-shrink-0">
                                <BeakerIcon className="h-6 w-6 text-lime-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm md:text-base text-lime-400">El Secreto del pH</p>
                                <p className="text-xs text-white/90 group-hover:text-white truncate">Guía Interactiva &rarr;</p>
                            </div>
                        </a>

                    </div>
                </div>

                {/* Subtitle and Main CTA button */}
                <div className="animate-fade-in-up mt-10 md:mt-12" style={{ animationDelay: '0.4s' }}>
                    <p className="text-base md:text-xl max-w-2xl mx-auto mb-8" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>
                        Descubre una nueva forma de nutrir tu tierra y conectar con la naturaleza.
                    </p>
                    <button
                        onClick={handleEnterClick}
                        className="bg-green-600 text-white font-bold py-3 px-8 md:py-4 md:px-12 rounded-full hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg text-lg md:text-xl"
                    >
                        Vamos a ello
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeSplash;
