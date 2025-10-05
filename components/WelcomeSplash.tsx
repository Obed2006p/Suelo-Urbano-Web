import React, { useState } from 'react';

interface WelcomeSplashProps {
    onEnter: () => void;
}

const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onEnter }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleEnterClick = () => {
        setIsExiting(true);
        // Wait for the fade-out animation to complete before calling onEnter
        setTimeout(onEnter, 1000); 
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
            
            {/* Content */}
            <div className="relative z-10 text-center text-white px-6">
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
        </div>
    );
};

export default WelcomeSplash;