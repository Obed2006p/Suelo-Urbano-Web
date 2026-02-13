
import React, { useState } from 'react';
import { LeafIcon } from './icons/Icons';

// --- SVG Components for the Game ---

const ProductBag = ({ open }: { open: boolean }) => (
  <div className={`relative w-24 h-32 md:w-28 md:h-40 transition-transform duration-300 ${!open ? 'hover:scale-105' : ''}`}>
    <div className="absolute inset-0 bg-green-800 rounded-lg shadow-md"></div>
    <div className={`absolute inset-0 bg-green-700 rounded-lg transform ${open ? '-translate-y-2' : ''} transition-transform duration-300`}>
      <div className="relative w-full h-full flex flex-col justify-center items-center p-2 text-white">
        <LeafIcon className="h-6 w-6 md:h-8 md:w-8 text-green-200" />
        <span className="font-bold text-base md:text-lg leading-tight">Suelo</span>
        <span className="font-bold text-base md:text-lg leading-tight">Urbano</span>
        <span className="text-[10px] md:text-xs mt-2">Emulsión</span>
      </div>
    </div>
    {open && <div className="absolute -top-2 left-0 right-0 h-3 bg-stone-600 rounded-t-sm"></div>}
  </div>
);

const WateringCan = ({ stage, beingPoured }: { stage: 'water' | 'mixed'; beingPoured?: boolean }) => {
    const liquidColor = stage === 'mixed' ? 'bg-[#6B5B3B]/80' : 'bg-blue-400/70';
    return (
        <div className={`relative w-36 h-24 md:w-48 md:h-32 transition-transform duration-500 ${beingPoured ? '-rotate-[30deg]' : ''}`} style={{ transformOrigin: 'bottom center' }}>
            {/* Spout */}
            <div className="absolute -left-8 top-0 w-16 h-4 md:-left-12 md:top-0 md:w-20 md:h-5 bg-stone-400 dark:bg-stone-600 rounded-full transform -rotate-30"></div>
            {/* Handle */}
            <div className="absolute -right-4 top-0 w-6 h-20 md:-right-6 md:top-0 md:w-8 md:h-24 border-4 border-stone-400 dark:border-stone-600 rounded-full"></div>
            {/* Body */}
            <div className="absolute bottom-0 left-0 w-full h-20 md:h-28 bg-stone-300 dark:bg-stone-500 rounded-t-lg shadow-inner overflow-hidden">
                {/* Liquid */}
                <div className={`absolute bottom-0 left-0 w-full h-1/2 ${liquidColor} transition-colors duration-1000`}></div>
            </div>
        </div>
    );
};

const Plant = ({ happy }: { happy: boolean }) => (
  <div className="relative w-24 h-36 md:w-32 md:h-48">
    {/* Pot */}
    <div className="absolute bottom-0 left-0 w-full h-16 md:h-24 bg-orange-900" style={{ clipPath: 'polygon(0 100%, 100% 100%, 85% 0, 15% 0)' }}></div>
     {/* Soil */}
    <div className="absolute bottom-16 md:bottom-24 left-[15%] w-[70%] h-3 md:h-4 bg-amber-900"></div>
    {/* Stem */}
    <div className="absolute bottom-16 md:bottom-24 left-1/2 -ml-1 w-1.5 md:w-2 h-12 md:h-16 bg-green-700 rounded-t-full"></div>
    {/* Leaves */}
    <div className="absolute top-8 md:top-10 left-1/2 w-12 h-12 md:w-16 md:h-16">
      <div className="absolute top-3 -left-4 w-10 h-3 md:top-4 md:-left-6 md:w-12 md:h-4 bg-green-600 rounded-full transform -rotate-45"></div>
      <div className="absolute top-3 -right-4 w-10 h-3 md:top-4 md:-right-6 md:w-12 md:h-4 bg-green-600 rounded-full transform rotate-45"></div>
      <div className="absolute top-0 left-1/2 -ml-1.5 w-8 h-3 md:top-0 md:left-1/2 md:-ml-2 md:w-10 md:h-4 bg-green-600 rounded-full transform -rotate-10"></div>
    </div>
    {/* Happy Flower */}
    {happy && (
      <div className="absolute top-0 left-1/2 -ml-3 w-6 h-6 md:top-2 md:left-1/2 md:-ml-4 md:w-8 md:h-8 transition-all animate-fade-in-up">
        <div className="absolute inset-0 bg-pink-400 rounded-full animate-pulse"></div>
        <div className="absolute inset-1 bg-yellow-300 rounded-full"></div>
      </div>
    )}
  </div>
);

// --- Animation Components ---
const PouringProductStream = () => (
    <div className="absolute top-0 left-0 w-1 h-24 pointer-events-none transform rotate-45 z-30">
        <div className="animate-pour-dots w-1 h-1 bg-amber-900 rounded-full absolute" style={{animationDelay: '0s'}}></div>
        <div className="animate-pour-dots w-1.5 h-1.5 bg-stone-600 rounded-full absolute" style={{animationDelay: '0.1s', left: '2px'}}></div>
        <div className="animate-pour-dots w-1 h-1 bg-amber-900 rounded-full absolute" style={{animationDelay: '0.2s', left: '-1px'}}></div>
    </div>
);

const WateringStream = () => (
    // Adjusted positioning for mobile and desktop
    <div className="absolute top-[40%] md:top-1/2 mt-4 left-1/2 -ml-20 md:-ml-28 w-2 h-20 bg-[#6B5B3B]/60 rounded-full pointer-events-none origin-top animate-pour-stream z-20"></div>
);


// --- Main Component ---

const instructions = [
  "1. Haz clic en la bolsa para abrirla.",
  "2. Arrastra la bolsa a la regadera.",
  "3. Arrastra la regadera a la planta.",
  "¡Felicidades! Has nutrido a tu planta.",
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
            setIsBagPouring(true);

            setTimeout(() => {
                setIsPouringProduct(true);
            }, 500);

            setTimeout(() => {
                setIsPouringProduct(false);
                setIsBagPouring(false);
                setTimeout(() => {
                    setStep(2);
                    setIsAnimating(false);
                }, 500);
            }, 1700);
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
    
    // Animation classes adjusted for responsive layouts
    // Mobile: Bag moves UP to Can (which is above it in flex-col-reverse) or DOWN?
    // Let's rely on flex order: Top=Plant, Mid=Can, Bot=Bag on Mobile?
    // Actually, visually on mobile it's better: Plant (Top), Can (Mid), Bag (Bot) to drag UP.
    
    // Desktop: Bag moves LEFT/DOWN to Can.
    
    // Current Layout Mobile: Plant (Top), Can (Mid), Bag (Bot)
    // Bag animation needs to move UP (negative Y) on mobile.
    
    const bagPouringClasses = isBagPouring 
        ? '-translate-y-24 -rotate-45 z-20 md:translate-y-0 md:-translate-x-48 md:-translate-y-20 md:-rotate-45' 
        : '';

    return (
        <section className="py-12 md:py-24 bg-white dark:bg-stone-800">
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
            <div className="container mx-auto px-4 sm:px-6 text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 mb-4 dark:text-stone-100">Guía Interactiva</h2>
                <p className="max-w-3xl mx-auto text-stone-600 mb-6 sm:mb-8 dark:text-stone-300 text-sm sm:text-base">
                    Aprende a usar nuestra emulsión de forma divertida. ¡Sigue las instrucciones!
                </p>

                {/* Instructions & Controls */}
                <div className="mb-6 min-h-[60px] md:min-h-[100px] flex flex-col justify-center items-center">
                    <div className="relative h-12 md:h-16 w-full max-w-2xl flex items-center justify-center">
                        {instructions.map((text, index) => (
                             <p key={index} className={`absolute inset-0 text-base md:text-xl font-semibold text-green-800 dark:text-green-300 transition-opacity duration-500 flex items-center justify-center ${step === index ? 'opacity-100' : 'opacity-0'}`} aria-live="polite" aria-hidden={step !== index}>
                                {text}
                            </p>
                        ))}
                    </div>
                     {step === 3 && (
                        <div className="mt-2 flex flex-col sm:flex-row gap-3 items-center animate-fade-in-up">
                             <button 
                                onClick={handleReset} 
                                className="bg-stone-200 text-stone-700 font-bold py-2 px-6 rounded-full hover:bg-stone-300 transition-colors dark:bg-stone-600 dark:text-stone-200 dark:hover:bg-stone-500 text-sm"
                            >
                                Repetir
                            </button>
                            <a 
                                href="#/pedido"
                                onClick={(e) => { e.preventDefault(); window.location.hash = '#/pedido'; }}
                                className="bg-yellow-400 text-yellow-900 font-bold py-2 px-6 rounded-full hover:bg-yellow-500 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md text-sm"
                            >
                                ¡Pedir ahora!
                            </a>
                        </div>
                    )}
                </div>

                {/* Game Area - Mobile Optimized (Vertical Stack) */}
                <div className="relative bg-lime-100 p-4 sm:p-8 rounded-2xl shadow-inner max-w-4xl mx-auto min-h-[500px] md:min-h-[70vh] md:aspect-video flex flex-col justify-end overflow-hidden dark:bg-gray-800">
                    
                    {isWatering && <WateringStream />}
                    
                    {/* Flex container: Column reverse on mobile (Bag bottom, Can mid, Plant top), Row on desktop */}
                    <div className="flex-grow flex flex-col-reverse md:flex-row items-center md:items-end justify-around gap-12 md:gap-4 px-4 py-8 md:py-0">
                        
                        {/* 3. BAG (Bottom on mobile) */}
                        <div 
                            onClick={handleBagClick}
                            draggable={isBagDraggable}
                            onDragStart={(e) => handleDragStart(e, 'bag')}
                            onDragEnd={handleDragEnd}
                            className={`transition-transform duration-500 ease-in-out order-1 md:order-3 z-30 ${step === 0 ? 'cursor-pointer hover:scale-105 animate-pulse' : ''} ${isBagDraggable ? 'cursor-grab animate-bounce-float' : 'cursor-default'} ${bagPouringClasses}`}
                            role={step === 0 ? 'button' : undefined}
                            tabIndex={step === 0 ? 0 : -1}
                            onKeyPress={(e) => e.key === 'Enter' && handleBagClick()}
                            aria-label="Bolsa de emulsión"
                        >
                            <div className="relative">
                                <ProductBag open={step >= 1} />
                                {isPouringProduct && <PouringProductStream />}
                            </div>
                        </div>

                        {/* 2. CAN (Middle on mobile) */}
                        <div 
                            draggable={isCanDraggable} 
                            onDragStart={(e) => handleDragStart(e, 'can')}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver} 
                            onDrop={handleCanDrop}
                            className={`transition-transform duration-300 order-2 z-20 ${isCanDraggable ? 'cursor-grab active:cursor-grabbing hover:scale-105 animate-bounce-float' : 'cursor-default'}`}
                            aria-label="Regadera"
                        >
                            <WateringCan stage={step >= 2 ? 'mixed' : 'water'} beingPoured={isWatering} />
                        </div>

                        {/* 1. PLANT (Top on mobile) */}
                       <div className="flex flex-col items-center order-3 md:order-1 z-10" onDragOver={handleDragOver} onDrop={handlePlantDrop}>
                            <Plant happy={step >= 3} />
                        </div>

                    </div>
                     {/* Table Top */}
                    <div className="h-4 bg-stone-700 w-full shadow-lg rounded-b-lg mt-auto dark:bg-stone-900 absolute bottom-0 left-0"></div>
                </div>

            </div>
        </section>
    );
};

export default InteractiveGuide;
