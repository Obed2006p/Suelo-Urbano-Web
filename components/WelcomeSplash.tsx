import React, { useState } from 'react';
import { HeartbeatIcon, YouTubeIcon } from './icons/Icons';

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
        
        // Set the hash for the new route first
        window.location.hash = '#/doctor-plantas';
        
        // Then trigger the exit animation
        handleEnterClick();
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
            <div className="relative z-10 text-center text-white px-4 w-full flex-grow flex flex-col items-center justify-center">
                
                <div className="animate-fade-in-down w-full">
                     <img 
                        src="https://res.cloudinary.com/dsmzpsool/image/upload/v1759686619/WhatsApp_Image_2025-10-05_at_11.46.24_AM-removebg-preview_wleawb.png" 
                        alt="Alimento para plantas Logo" 
                        className="h-20 md:h-24 mx-auto mb-4" 
                    />

                    {/* Centered actions and title */}
                    <div className="w-full max-w-7xl mx-auto flex justify-around items-center gap-4">
                        
                        {/* Left Action: Doctor IA */}
                        <a 
                            href="#/doctor-plantas"
                            onClick={handleGoToDoctor}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-stone-900/40 backdrop-blur-md border border-white/10 hover:bg-stone-900/60 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
                            aria-label="Ir al Doctor de Plantas"
                        >
                            <div className="bg-red-500/30 p-3 rounded-full">
                                <HeartbeatIcon className="h-8 w-8 text-red-100" />
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="font-bold text-base text-white">¿Planta Enferma?</p>
                                <p className="text-sm text-white/80">Usa el Doctor IA &rarr;</p>
                            </div>
                        </a>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight" style={{textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>
                            Bienvenido a<br/>Alimento para plantas
                        </h1>

                        {/* Right Action: YouTube Video */}
                        <a 
                            href="https://youtu.be/kuCRR-3TbxI?si=91sbDh14gOvjeRBD"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-2xl bg-stone-900/40 backdrop-blur-md border border-white/10 hover:bg-stone-900/60 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
                            aria-label="Ver video sobre Suelo Urbano"
                        >
                            <div className="bg-red-500/30 p-3 rounded-full">
                                <YouTubeIcon className="h-8 w-8 text-red-100" />
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="font-bold text-base text-white">¿Qué es Suelo Urbano?</p>
                                <p className="text-sm text-white/80">Descúbrelo aquí &rarr;</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Subtitle and Main CTA button */}
                <div className="animate-fade-in-up mt-8" style={{ animationDelay: '0.4s' }}>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>
                        Descubre una nueva forma de nutrir tu tierra y conectar con la naturaleza.
                    </p>
                    <button
                        onClick={handleEnterClick}
                        className="bg-green-600 text-white font-bold py-4 px-10 rounded-full hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg text-lg"
                    >
                        Vamos a ello
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeSplash;