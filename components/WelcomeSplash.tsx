import React, { useState } from 'react';
import { HeartbeatIcon } from './icons/Icons';

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
            <div className="relative z-10 text-center text-white px-6 flex-grow flex flex-col items-center justify-center">
                <div className="animate-fade-in-down">
                    <img 
                        src="https://res.cloudinary.com/dsmzpsool/image/upload/v1759686619/WhatsApp_Image_2025-10-05_at_11.46.24_AM-removebg-preview_wleawb.png" 
                        alt="Alimento para plantas Logo" 
                        className="h-24 mx-auto mb-4" 
                    />
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                        Bienvenido a Alimento para plantas
                    </h1>
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
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

            {/* Secondary CTA Banner for Plant Doctor */}
            <a 
                href="#/doctor-plantas"
                onClick={handleGoToDoctor}
                className="relative z-10 w-full max-w-4xl p-4 animate-fade-in-up"
                style={{ animationDelay: '0.8s' }}
                aria-label="Ir al Doctor de Plantas"
            >
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 text-white hover:bg-black/50 transition-colors duration-300">
                    <div className="flex-shrink-0 bg-green-500/20 p-3 rounded-full">
                         <HeartbeatIcon className="h-8 w-8 text-green-200" />
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="font-semibold">¿Ves a tu planta enferma o sin vida?</p>
                        <p className="text-sm text-green-200">¡Prueba nuestro Doctor de Plantas con IA ahora!</p>
                    </div>
                     <div className="sm:ml-auto text-green-200 font-bold hidden sm:block">
                        Ir ahora &rarr;
                    </div>
                </div>
            </a>
        </div>
    );
};

export default WelcomeSplash;