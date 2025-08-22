
import React, { useState } from 'react';
import { LeafIcon } from './icons/Icons';

// --- SVG Components for the Game ---

const ProductBag = ({ open }: { open: boolean }) => (
  <div className={`relative w-28 h-40 transition-transform duration-300 ${!open ? 'hover:scale-105' : ''}`}>
    <div className="absolute inset-0 bg-green-800 rounded-lg shadow-md"></div>
    <div className={`absolute inset-0 bg-green-700 rounded-lg transform ${open ? '-translate-y-2' : ''} transition-transform duration-300`}>
      <div className="relative w-full h-full flex flex-col justify-center items-center p-2 text-white">
        <LeafIcon className="h-8 w-8 text-green-200" />
        <span className="font-bold text-lg leading-tight">Suelo</span>
        <span className="font-bold text-lg leading-tight">Urbano</span>
        <span className="text-xs mt-2">Emulsión</span>
      </div>
    </div>
    {open && <div className="absolute -top-2 left-0 right-0 h-3 bg-stone-600 rounded-t-sm"></div>}
  </div>
);

const WateringCan = ({ stage, beingPoured }: { stage: 'water' | 'mixed'; beingPoured?: boolean }) => {
    const liquidColor = stage === 'mixed' ? 'bg-[#6B5B3B]/80' : 'bg-blue-400/70';
    return (
        <div className={`relative w-48 h-32 transition-transform duration-500 ${beingPoured ? '-rotate-[30deg]' : ''}`} style={{ transformOrigin: 'bottom center' }}>
            {/* Spout */}
            <div className="absolute -left-12 top-0 w-20 h-5 bg-stone-400 rounded-full transform -rotate-30"></div>
            {/* Handle */}
            <div className="absolute -right-6 top-0 w-8 h-24 border-4 border-stone-400 rounded-full"></div>
            {/* Body */}
            <div className="absolute bottom-0 left-0 w-full h-28 bg-stone-300 rounded-t-lg shadow-inner overflow-hidden">
                {/* Liquid */}
                <div className={`absolute bottom-0 left-0 w-full h-1/2 ${liquidColor} transition-colors duration-1000`}></div>
            </div>
        </div>
    );
};

const Plant = ({ happy }: { happy: boolean }) => (
  <div className="relative w-32 h-48">
    {/* Pot */}
    <div className="absolute bottom-0 left-0 w-full h-24 bg-orange-900" style={{ clipPath: 'polygon(0 100%, 100% 100%, 85% 0, 15% 0)' }}></div>
     {/* Soil */}
    <div className="absolute bottom-24 left-[15%] w-[70%] h-4 bg-amber-900 rounded-t-full"></div>
    {/* Stem */}
    <div className="absolute bottom-24 left-1/2 -ml-1 w-2 h-16 bg-green-700 rounded-t-full"></div>
    {/* Leaves */}
    <div className="absolute top-10 left-1/2 w-16 h-16">
      <div className="absolute top-4 -left-6 w-12 h-4 bg-green-600 rounded-full transform -rotate-45"></div>
      <div className="absolute top-4 -right-6 w-12 h-4 bg-green-600 rounded-full transform rotate-45"></div>
      <div className="absolute top-0 left-1/2 -ml-2 w-10 h-4 bg-green-600 rounded-full transform -rotate-10"></div>
    </div>
    {/* Happy Flower */}
    {happy && (
      <div className="absolute top-2 left-1/2 -ml-4 w-8 h-8 transition-all animate-fade-in-up">
        <div className="absolute inset-0 bg-pink-400 rounded-full animate-pulse"></div>
        <div className="absolute inset-1.5 bg-yellow-300 rounded-full"></div>
      </div>
    )}
  </div>
);

// --- Animation Components ---
const PouringProductStream = () => (
    // This container is positioned at the bag's opening. It is rotated with the bag.
    // The inner animation container is counter-rotated so the particles fall straight down.
    <div className="absolute -bottom-4 -right-4 w-1 h-24 pointer-events-none transform rotate-45">
        <div className="animate-pour-dots w-1 h-1 bg-amber-900 rounded-full absolute" style={{animationDelay: '0s'}}></div>
        <div className="animate-pour-dots w-1.5 h-1.5 bg-stone-600 rounded-full absolute" style={{animationDelay: '0.1s', left: '2px'}}></div>
        <div className="animate-pour-dots w-1 h-1 bg-amber-900 rounded-full absolute" style={{animationDelay: '0.2s', left: '-1px'}}></div>
    </div>
);

const WateringStream = () => (
    <div className="absolute top-1/2 mt-4 left-1/2 -ml-28 w-2 h-20 bg-[#6B5B3B]/60 rounded-full pointer-events-none origin-top animate-pour-stream"></div>
);


// --- Main Component ---

const instructions = [
  "1. Para empezar, haz clic en la bolsa de emulsión para abrirla.",
  "2. ¡Excelente! Ahora, arrastra la bolsa a la regadera para hacer la mezcla.",
  "3. ¡Perfecto! Arrastra la regadera a la planta para darle sus nutrientes.",
  "¡Felicidades! Has nutrido a tu planta. ¡Mira qué feliz está!",
];

const InteractiveGuide: React.FC = () => {
    const [step, setStep] = useState(0);
    const [isPouringProduct, setIsPouringProduct] = useState(false);
    const [isWatering, setIsWatering] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isBagPouring, setIsBagPouring] = useState(false);

    const handleBagClick = () => {
        if (step === 0 && !isAnimating) setStep(1);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: string) => {
        if (isAnimating) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData("draggedItem", item);
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleCanDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const draggedItem = e.dataTransfer.getData("draggedItem");
        if (step === 1 && draggedItem === "bag" && !isAnimating) {
            setIsAnimating(true);
            setIsBagPouring(true); // Move bag to pouring position

            // After the bag is in position, start the particle animation
            setTimeout(() => {
                setIsPouringProduct(true);
            }, 500); // Corresponds to transition duration

            // After pouring is done, start the return sequence
            setTimeout(() => {
                setIsPouringProduct(false); // Stop particles
                setIsBagPouring(false); // Move bag back
                
                // Wait for the bag to return before changing the step
                setTimeout(() => {
                    setStep(2);
                    setIsAnimating(false);
                }, 500); // Corresponds to transition duration

            }, 1700); // 500ms travel + 1200ms pouring
        }
    };
    
    const handlePlantDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (step === 2 && e.dataTransfer.getData("draggedItem") === "can" && !isAnimating) {
            setIsAnimating(true);
            setIsWatering(true);
            setTimeout(() => {
                setIsWatering(false);
                setStep(3);
                setIsAnimating(false);
            }, 1200);
        }
    };

    const handleReset = () => {
        setStep(0);
        setIsPouringProduct(false);
        setIsWatering(false);
        setIsAnimating(false);
        setIsBagPouring(false);
    };

    const isBagDraggable = step === 1 && !isAnimating;
    const isCanDraggable = step === 2 && !isAnimating;
    
    const bagPouringClasses = isBagPouring 
        ? '-translate-y-40 -rotate-15 md:translate-y-0 md:-translate-x-48 md:-translate-y-20 md:-rotate-45' 
        : '';

    return (
        <section className="py-16 md:py-24 bg-white">
            <style>{`
                @keyframes pour-dots {
                  from { transform: translateY(0px); opacity: 1; }
                  to { transform: translateY(80px); opacity: 0; }
                }
                .animate-pour-dots { animation: pour-dots 0.6s ease-in infinite; }

                @keyframes pour-stream {
                    0% { transform: scaleY(0); opacity: 0; }
                    25% { transform: scaleY(1); opacity: 1; }
                    75% { transform: scaleY(1); opacity: 1; }
                    100% { transform: scaleY(1); opacity: 0; }
                }
                .animate-pour-stream { animation: pour-stream 1.2s ease-out forwards; }
            `}</style>
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Guía Interactiva de Uso</h2>
                <p className="max-w-3xl mx-auto text-stone-600 mb-8">
                    Aprende a usar nuestra emulsión de forma divertida. ¡Sigue las instrucciones en pantalla!
                </p>

                {/* Instructions & Controls */}
                <div className="mb-8 min-h-[100px] flex flex-col justify-center items-center">
                    <div className="relative h-16 w-full max-w-2xl flex items-center justify-center">
                        {instructions.map((text, index) => (
                             <p key={index} className={`absolute inset-0 text-xl font-semibold text-green-800 transition-opacity duration-500 flex items-center justify-center ${step === index ? 'opacity-100' : 'opacity-0'}`} aria-live="polite" aria-hidden={step !== index}>
                                {text}
                            </p>
                        ))}
                    </div>
                     {step === 3 && (
                        <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center animate-fade-in-up">
                             <button 
                                onClick={handleReset} 
                                className="bg-stone-200 text-stone-700 font-bold py-2 px-6 rounded-full hover:bg-stone-300 transition-colors"
                            >
                                Repetir Guía
                            </button>
                            <a 
                                href="#/pedido"
                                onClick={(e) => { e.preventDefault(); window.location.hash = '#/pedido'; }}
                                className="bg-yellow-400 text-yellow-900 font-bold py-2 px-6 rounded-full hover:bg-yellow-500 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
                            >
                                ¡Haz tu pedido ahora!
                            </a>
                        </div>
                    )}
                </div>

                {/* Game Area */}
                <div className="relative bg-lime-100 p-4 sm:p-8 rounded-2xl shadow-inner max-w-4xl mx-auto min-h-[70vh] md:aspect-video flex flex-col justify-end overflow-hidden">
                    {isWatering && <WateringStream />}
                    <div className="flex-grow flex flex-col md:flex-row items-center md:items-end justify-around gap-8 md:gap-4 px-4">
                       <div className="flex flex-col items-center order-1" onDragOver={handleDragOver} onDrop={handlePlantDrop}>
                            <Plant happy={step >= 3} />
                        </div>
                        <div 
                            draggable={isCanDraggable} 
                            onDragStart={(e) => handleDragStart(e, 'can')}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver} 
                            onDrop={handleCanDrop}
                            className={`transition-transform duration-300 order-2 ${isCanDraggable ? 'cursor-grab active:cursor-grabbing hover:scale-105' : 'cursor-default'}`}
                            aria-label="Regadera"
                        >
                            <WateringCan stage={step >= 2 ? 'mixed' : 'water'} beingPoured={isWatering} />
                        </div>
                        <div 
                            onClick={handleBagClick}
                            draggable={isBagDraggable}
                            onDragStart={(e) => handleDragStart(e, 'bag')}
                            onDragEnd={handleDragEnd}
                            className={`relative transition-transform duration-500 ease-in-out order-3 ${step === 0 ? 'cursor-pointer hover:scale-105' : ''} ${isBagDraggable ? 'cursor-grab' : 'cursor-default'} ${bagPouringClasses}`}
                            role={step === 0 ? 'button' : undefined}
                            tabIndex={step === 0 ? 0 : -1}
                            onKeyPress={(e) => e.key === 'Enter' && handleBagClick()}
                            aria-label="Bolsa de emulsión"
                        >
                            <ProductBag open={step >= 1} />
                            {isPouringProduct && <PouringProductStream />}
                        </div>
                    </div>
                     {/* Table Top */}
                    <div className="h-4 bg-stone-700 w-full shadow-lg rounded-b-lg mt-auto"></div>
                </div>

            </div>
        </section>
    );
};

export default InteractiveGuide;
