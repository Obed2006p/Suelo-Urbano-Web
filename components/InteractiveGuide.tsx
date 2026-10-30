import React, { useState, useRef, useEffect } from 'react';
import { 
  SparklesIcon, 
  CheckCircleIcon, 
  LeafIcon, 
  WaterDropIcon, 
  ShieldCheckIcon 
} from './icons/Icons';

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

interface DropParticle {
  id: number;
  type: 'emulsion' | 'water';
  x: number;
  y: number;
}

const InteractiveGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [drops, setDrops] = useState<DropParticle[]>([]);
  const [canEnriched, setCanEnriched] = useState<boolean>(false);
  const [isCanPulsing, setIsCanPulsing] = useState<boolean>(false);
  const [bottleTransform, setBottleTransform] = useState<string>('');
  const [canTransform, setCanTransform] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // References to DOM elements to calculate dynamic distances
  const containerRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const canRef = useRef<HTMLDivElement>(null);
  const plantRef = useRef<HTMLDivElement>(null);
  const dropCounterRef = useRef<number>(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Clear all pending timeouts when unmounting
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const addTimeout = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Step 1: Click Bottle -> Moves to Watering Can, drops emulsion, can pulses, advances to step 2
  const handleBottleClick = () => {
    if (currentStep !== 1 || isBusy) return;
    setIsBusy(true);

    if (containerRef.current && bottleRef.current && canRef.current) {
      const bottleRect = bottleRef.current.getBoundingClientRect();
      const canRect = canRef.current.getBoundingClientRect();

      // Delta X to position bottle spout over watering can top opening
      const deltaX = (canRect.left + canRect.width * 0.42) - (bottleRect.left + bottleRect.width * 0.45);
      const deltaY = -100; // Lift above the can opening

      setBottleTransform(`translate(${deltaX}px, ${deltaY}px) rotate(-45deg)`);

      // After tilting, start pouring emulsion droplets
      addTimeout(() => {
        const totalDrops = 8;
        const currentContainer = containerRef.current;
        if (!currentContainer) return;
        const contRect = currentContainer.getBoundingClientRect();
        const freshCanRect = canRef.current?.getBoundingClientRect() || canRect;
        const targetDropX = (freshCanRect.left - contRect.left) + freshCanRect.width * 0.45;
        const targetDropY = (freshCanRect.top - contRect.top) - 10;

        for (let i = 0; i < totalDrops; i++) {
          addTimeout(() => {
            const jitterX = (Math.random() - 0.5) * 8;
            const dropId = dropCounterRef.current++;
            setDrops((prev) => [
              ...prev,
              {
                id: dropId,
                type: 'emulsion',
                x: targetDropX + jitterX,
                y: targetDropY + (Math.random() * 4),
              },
            ]);

            // Auto-clean drop after fall animation ends (650ms)
            addTimeout(() => {
              setDrops((prev) => prev.filter((d) => d.id !== dropId));
            }, 650);
          }, i * 110);
        }

        // Pulse watering can once enriched
        addTimeout(() => {
          setCanEnriched(true);
          setIsCanPulsing(true);
          addTimeout(() => setIsCanPulsing(false), 1200);
        }, 600);

        // Return bottle to initial shelf position
        addTimeout(() => {
          setBottleTransform('translate(0px, 0px) rotate(0deg)');
          addTimeout(() => {
            setCurrentStep(2);
            setIsBusy(false);
          }, 850);
        }, 1300);
      }, 800);
    } else {
      // Fallback relative transform if rects not available
      setBottleTransform('translate(160px, -90px) rotate(-45deg)');
      addTimeout(() => {
        setCanEnriched(true);
        setIsCanPulsing(true);
        addTimeout(() => {
          setIsCanPulsing(false);
          setBottleTransform('translate(0px, 0px) rotate(0deg)');
          setCurrentStep(2);
          setIsBusy(false);
        }, 1200);
      }, 1000);
    }
  };

  // Step 2: Click Watering Can -> Moves to Plant, pours water, plant blooms, success modal pops up
  const handleCanClick = () => {
    if (currentStep !== 2 || isBusy) return;
    setIsBusy(true);

    if (containerRef.current && canRef.current && plantRef.current) {
      const canRect = canRef.current.getBoundingClientRect();
      const plantRect = plantRef.current.getBoundingClientRect();

      // Delta X to position watering can spout directly over the plant pot soil
      const deltaX = (plantRect.left + plantRect.width * 0.15) - (canRect.left + canRect.width * 0.65);
      const deltaY = -90; // Lift above plant base

      setCanTransform(`translate(${deltaX}px, ${deltaY}px) rotate(-30deg)`);

      // Start pouring water droplets into the soil
      addTimeout(() => {
        const totalDrops = 15;
        const currentContainer = containerRef.current;
        if (!currentContainer) return;
        const contRect = currentContainer.getBoundingClientRect();
        const freshPlantRect = plantRef.current?.getBoundingClientRect() || plantRect;
        const targetDropX = (freshPlantRect.left - contRect.left) + freshPlantRect.width * 0.35;
        const targetDropY = (freshPlantRect.top - contRect.top) + freshPlantRect.height * 0.62;

        for (let i = 0; i < totalDrops; i++) {
          addTimeout(() => {
            const jitterX = (Math.random() - 0.5) * 16;
            const dropId = dropCounterRef.current++;
            setDrops((prev) => [
              ...prev,
              {
                id: dropId,
                type: 'water',
                x: targetDropX + jitterX,
                y: targetDropY,
              },
            ]);

            addTimeout(() => {
              setDrops((prev) => prev.filter((d) => d.id !== dropId));
            }, 650);
          }, i * 90);
        }

        // Return watering can to its place
        addTimeout(() => {
          setCanTransform('translate(0px, 0px) rotate(0deg)');
          addTimeout(() => {
            setCurrentStep(3);
            setIsBusy(false);
            setShowSuccessModal(true);
          }, 900);
        }, 1600);
      }, 800);
    } else {
      setCanTransform('translate(170px, -80px) rotate(-30deg)');
      addTimeout(() => {
        setCanTransform('translate(0px, 0px) rotate(0deg)');
        setCurrentStep(3);
        setIsBusy(false);
        setShowSuccessModal(true);
      }, 2000);
    }
  };

  // Reset entire simulation to initial sad plant & step 1
  const handleReset = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setDrops([]);
    setIsBusy(false);
    setCurrentStep(1);
    setCanEnriched(false);
    setIsCanPulsing(false);
    setBottleTransform('translate(0px, 0px) rotate(0deg)');
    setCanTransform('translate(0px, 0px) rotate(0deg)');
    setShowSuccessModal(false);
  };

  return (
    <section className="py-8 md:py-16 bg-gradient-to-b from-stone-50 via-white to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 text-stone-800 dark:text-stone-100 min-h-screen">
      {/* Simulation Styles exactly mirroring the user specification */}
      <style>{`
        /* Objetos interactivos */
        .sim-interactive-item {
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s ease;
          position: absolute;
          bottom: 30px; /* Sobre la repisa */
          transform-origin: center center;
          z-index: 10;
        }

        /* Indicador de qué hacer (Glow) */
        .is-active-step {
          cursor: pointer;
          filter: drop-shadow(0 0 12px rgba(72, 187, 120, 0.95));
          animation: bounce-subtle 2s infinite;
        }

        .is-active-step:hover {
          transform: scale(1.06);
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        /* Regadera pulsando */
        .pulse-can {
          animation: pulse-green 1s ease-in-out;
        }

        @keyframes pulse-green {
          0% { filter: drop-shadow(0 0 0px rgba(56, 161, 105, 0)); }
          50% { filter: drop-shadow(0 0 24px rgba(56, 161, 105, 1)); }
          100% { filter: drop-shadow(0 0 0px rgba(56, 161, 105, 0)); }
        }

        /* Planta y crecimiento */
        .plant-wrapper {
          transform-origin: bottom center;
          transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1); /* Efecto rebote al crecer */
        }

        /* Estado inicial (Triste) */
        .plant-sad {
          transform: scale(0.8);
          filter: grayscale(60%) opacity(0.8);
        }
        .plant-sad .plant-leaves-group {
          transform-origin: bottom center;
          transform: rotate(15deg) scaleY(0.8);
          transition: all 1.2s ease;
        }

        /* Estado final (Feliz) */
        .plant-happy {
          transform: scale(1.15);
          filter: grayscale(0%) opacity(1);
        }
        .plant-happy .plant-leaves-group {
          transform-origin: bottom center;
          transform: rotate(0deg) scaleY(1);
          transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Gotas de líquido */
        .sim-drop {
          position: absolute;
          width: 8px;
          height: 12px;
          border-radius: 50%;
          border-bottom-left-radius: 2px;
          border-bottom-right-radius: 2px;
          animation: drop-fall 0.6s linear forwards;
          z-index: 25;
          pointer-events: none;
        }

        .drop-emulsion {
          background: linear-gradient(180deg, #1d4ed8 0%, #1e3a8a 100%);
          box-shadow: 0 0 6px rgba(37, 99, 235, 0.6);
        }

        .drop-water {
          background: linear-gradient(180deg, #93c5fd 0%, #3b82f6 100%);
          opacity: 0.85;
          box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
        }

        @keyframes drop-fall {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(110px) scale(0.6);
          }
        }

        /* Repisa de madera */
        .sim-shelf {
          position: absolute;
          bottom: 20px;
          left: 4%;
          width: 92%;
          height: 15px;
          background: linear-gradient(180deg, #a1785c 0%, #78533c 100%);
          border-radius: 4px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.22);
        }
        .sim-shelf-bracket-1 {
          position: absolute;
          bottom: 6px;
          left: 18%;
          width: 14px;
          height: 16px;
          background: #4a3427;
          border-radius: 0 0 3px 3px;
        }
        .sim-shelf-bracket-2 {
          position: absolute;
          bottom: 6px;
          right: 18%;
          width: 14px;
          height: 16px;
          background: #4a3427;
          border-radius: 0 0 3px 3px;
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* Header & Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-3 shadow-sm border border-emerald-200 dark:border-emerald-800">
            <SparklesIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            Simulación Interactiva
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
            Simulación Suelo Urbano Emulsión
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base sm:text-lg text-stone-600 dark:text-stone-300">
            Interactúa paso a paso con los elementos para preparar la dosis perfecta y observar cómo la emulsión revive a tu planta desde la raíz.
          </p>
        </div>

        {/* Dynamic Step Banner */}
        <div className="mb-6 max-w-3xl mx-auto">
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-left">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg shrink-0 transition-colors duration-300 ${
                currentStep === 1 
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-900' 
                  : currentStep === 2 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900'
                    : 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-900'
              }`}>
                {currentStep === 3 ? '✓' : currentStep}
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-stone-400 dark:text-stone-400">
                  {currentStep === 1 && 'Paso 1 de 2 • Dilución recomendada'}
                  {currentStep === 2 && 'Paso 2 de 2 • Riego radicular'}
                  {currentStep === 3 && '¡Simulación Completada!'}
                </p>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-snug">
                  {currentStep === 1 && 'Haz clic en la botella para verter la emulsión en la regadera'}
                  {currentStep === 2 && 'Haz clic en la regadera para aplicar el riego a nivel de tierra'}
                  {currentStep === 3 && '¡Magia en Suelo Urbano! Nutrientes absorbidos con vigor'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleReset}
                disabled={isBusy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/60 transition-colors disabled:opacity-50"
                title="Reiniciar simulación"
              >
                <RefreshIcon className="w-4 h-4" />
                Reiniciar
              </button>
              {currentStep === 3 && (
                <button
                  onClick={() => setShowSuccessModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Ver Resumen
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Physical Simulation Container (.sim-container) */}
        <div 
          ref={containerRef}
          className="relative w-full max-w-3xl mx-auto h-[440px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 dark:border-stone-700 select-none"
          style={{
            background: 'linear-gradient(to bottom, #e2e8f0 0%, #f8fafc 100%)',
          }}
        >
          {/* Subtle room/wall ambiance */}
          <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px]" />
          
          {/* Sunlight ray effect from top right */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-amber-200/30 via-yellow-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Fall Droplets Container */}
          {drops.map((drop) => (
            <div
              key={drop.id}
              className={`sim-drop ${drop.type === 'emulsion' ? 'drop-emulsion' : 'drop-water'}`}
              style={{
                left: `${drop.x}px`,
                top: `${drop.y}px`,
              }}
            />
          ))}

          {/* Wooden Shelf on the bottom */}
          <div className="sim-shelf-bracket-1" />
          <div className="sim-shelf-bracket-2" />
          <div className="sim-shelf" />

          {/* ============================================================== */}
          {/* 1. EMULSION BOTTLE (#emulsion-bottle) */}
          {/* ============================================================== */}
          <div
            ref={bottleRef}
            id="emulsion-bottle"
            onClick={handleBottleClick}
            className={`sim-interactive-item ${currentStep === 1 && !isBusy ? 'is-active-step' : ''}`}
            style={{
              left: '12%',
              transform: bottleTransform,
              cursor: currentStep === 1 && !isBusy ? 'pointer' : 'default',
            }}
            aria-label="Botella de Emulsión Suelo Urbano"
            role="button"
            tabIndex={currentStep === 1 ? 0 : -1}
          >
            {/* Step 1 Tooltip / Indicator */}
            {currentStep === 1 && !isBusy && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-full whitespace-nowrap shadow-md pointer-events-none animate-bounce">
                👆 1. Haz clic aquí
              </div>
            )}

            {/* Realistic Detailed Emulsion Bottle SVG */}
            <div className="relative w-20 h-40 sm:w-24 sm:h-48 drop-shadow-lg">
              <svg viewBox="0 0 100 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Dropper Cap */}
                <rect x="42" y="6" width="16" height="24" rx="4" fill="#1e293b" />
                <rect x="36" y="28" width="28" height="14" rx="3" fill="#334155" />
                <line x1="38" y1="33" x2="62" y2="33" stroke="#64748b" strokeWidth="1.5" />
                <line x1="38" y1="37" x2="62" y2="37" stroke="#64748b" strokeWidth="1.5" />
                
                {/* Bottle Neck */}
                <rect x="40" y="42" width="20" height="14" fill="#064e3b" />
                
                {/* Bottle Glass Body */}
                <path
                  d="M40 46 C32 54 22 66 20 82 L20 178 C20 186 26 192 34 192 L66 192 C74 192 80 186 80 178 L80 82 C78 66 68 54 60 46 Z"
                  fill="#064e3b"
                />
                
                {/* Internal Emulsion Liquid */}
                <path
                  d="M23 90 C30 89 70 89 77 90 L77 178 C77 184 72 189 66 189 L34 189 C28 189 23 184 23 178 Z"
                  fill="#022c22"
                />

                {/* Glass Gloss Highlight */}
                <path
                  d="M26 84 L26 178"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.3"
                />

                {/* Bottle Label */}
                <rect x="23" y="96" width="54" height="66" rx="4" fill="#fef08a" />
                <rect x="25" y="98" width="50" height="62" rx="3" fill="#ffffff" />
                
                {/* Brand & Text on Label */}
                <circle cx="50" cy="112" r="7" fill="#15803d" />
                <path d="M47 114 C48 108 53 108 53 114 C51 114 47 114 47 114 Z" fill="#ffffff" />
                <text x="50" y="129" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#14532d" fontFamily="sans-serif">
                  SUELO
                </text>
                <text x="50" y="136" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#14532d" fontFamily="sans-serif">
                  URBANO
                </text>
                <rect x="30" y="141" width="40" height="1.5" fill="#15803d" />
                <text x="50" y="149" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#0284c7" fontFamily="sans-serif">
                  EMULSIÓN
                </text>
                <text x="50" y="156" textAnchor="middle" fontSize="4.5" fontWeight="500" fill="#64748b" fontFamily="sans-serif">
                  250 ml • Orgánico
                </text>
              </svg>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. WATERING CAN (#watering-can) */}
          {/* ============================================================== */}
          <div
            ref={canRef}
            id="watering-can"
            onClick={handleCanClick}
            className={`sim-interactive-item ${currentStep === 2 && !isBusy ? 'is-active-step' : ''} ${isCanPulsing ? 'pulse-can' : ''}`}
            style={{
              left: '42%',
              transform: canTransform,
              cursor: currentStep === 2 && !isBusy ? 'pointer' : 'default',
            }}
            aria-label="Regadera para riego radicular"
            role="button"
            tabIndex={currentStep === 2 ? 0 : -1}
          >
            {/* Step 2 Tooltip / Indicator */}
            {currentStep === 2 && !isBusy && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-full whitespace-nowrap shadow-md pointer-events-none animate-bounce">
                💧 2. Haz clic para regar
              </div>
            )}

            {/* Enriched Badge on Can */}
            {canEnriched && (
              <div className="absolute -top-6 right-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow pointer-events-none animate-pulse">
                +Emulsión
              </div>
            )}

            {/* Realistic Watering Can SVG */}
            <div className="relative w-36 h-28 sm:w-44 sm:h-36 drop-shadow-md">
              <svg viewBox="0 0 160 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Curved Rear Handle */}
                <path
                  d="M115 35 C145 35 155 70 125 90"
                  stroke="#475569"
                  strokeWidth="8"
                  strokeLinecap="round"
                />

                {/* Long Slender Spout Pointing to the Right */}
                <path
                  d="M55 75 L12 25 L5 29 L50 85 Z"
                  fill="#64748b"
                />
                {/* Spout Rosette / Tip */}
                <ellipse cx="9" cy="24" rx="6" ry="4" transform="rotate(-35 9 24)" fill="#334155" />

                {/* Watering Can Main Cylindrical Body */}
                <path
                  d="M48 45 L118 45 C122 45 125 48 124 52 L115 106 C114 110 110 113 106 113 L56 113 C52 113 48 110 47 106 L42 52 C41 48 44 45 48 45 Z"
                  fill="#475569"
                />

                {/* Can Fill Opening at Top */}
                <ellipse cx="83" cy="45" rx="35" ry="8" fill="#334155" />
                <ellipse cx="83" cy="45" rx="31" ry="6" fill="#1e293b" />

                {/* Liquid Level inside Top Opening */}
                <ellipse
                  cx="83"
                  cy="46"
                  rx="28"
                  ry="5"
                  fill={canEnriched ? '#1e3a8a' : '#60a5fa'}
                  className="transition-colors duration-700"
                />

                {/* Front accent line */}
                <path
                  d="M50 55 L115 55"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  opacity="0.4"
                />
                
                {/* Body Highlight */}
                <path
                  d="M54 58 L58 104"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.25"
                />
              </svg>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 3. PLANT IN POT (#plant) */}
          {/* ============================================================== */}
          <div
            ref={plantRef}
            id="plant"
            className="sim-interactive-item"
            style={{
              right: '8%',
              left: 'auto',
              bottom: '30px',
            }}
            aria-label="Planta en maceta"
          >
            {/* Plant Wrapper with Sad vs Happy Classes */}
            <div className={`plant-wrapper ${currentStep === 3 ? 'plant-happy' : 'plant-sad'}`}>
              <div className="relative w-32 h-44 sm:w-36 sm:h-52 drop-shadow-xl flex flex-col items-center justify-end">
                <svg viewBox="0 0 140 180" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Pot Saucer */}
                  <ellipse cx="70" cy="170" rx="36" ry="6" fill="#7c2d12" />

                  {/* Terracotta Pot Body */}
                  <path
                    d="M38 108 L45 166 C46 169 48 171 51 171 L89 171 C92 171 94 169 95 166 L102 108 Z"
                    fill="#c2410c"
                  />
                  {/* Pot Rim */}
                  <rect x="34" y="98" width="72" height="12" rx="3" fill="#ea580c" />
                  
                  {/* Rich Organic Soil in Pot */}
                  <ellipse cx="70" cy="100" rx="32" ry="5" fill="#451a03" />

                  {/* Root System / Soil base highlight */}
                  <ellipse cx="70" cy="101" rx="27" ry="3" fill="#291203" />

                  {/* ================= LEAVES GROUP ================= */}
                  <g className="plant-leaves-group" id="leaves">
                    {/* Main Central Stem */}
                    <path
                      d="M70 100 Q70 65 70 35"
                      stroke="#15803d"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />

                    {/* Left Lower Leaf */}
                    <path
                      d="M68 85 C42 85 24 70 18 50 C38 46 58 64 68 80 Z"
                      fill="#16a34a"
                      stroke="#14532d"
                      strokeWidth="1"
                    />
                    <path d="M68 85 Q45 70 20 52" stroke="#86efac" strokeWidth="1.5" />

                    {/* Right Lower Leaf */}
                    <path
                      d="M72 80 C98 80 116 65 122 45 C102 41 82 59 72 75 Z"
                      fill="#16a34a"
                      stroke="#14532d"
                      strokeWidth="1"
                    />
                    <path d="M72 80 Q95 65 120 47" stroke="#86efac" strokeWidth="1.5" />

                    {/* Left Upper Leaf */}
                    <path
                      d="M70 58 C50 50 36 34 32 18 C50 16 64 34 70 52 Z"
                      fill="#22c55e"
                      stroke="#15803d"
                      strokeWidth="1"
                    />
                    <path d="M70 58 Q52 40 34 20" stroke="#bbf7d0" strokeWidth="1.5" />

                    {/* Right Upper Leaf */}
                    <path
                      d="M70 52 C90 44 104 28 108 12 C90 10 76 28 70 46 Z"
                      fill="#22c55e"
                      stroke="#15803d"
                      strokeWidth="1"
                    />
                    <path d="M70 52 Q88 34 106 14" stroke="#bbf7d0" strokeWidth="1.5" />

                    {/* Top Center Shoot */}
                    <path
                      d="M70 35 C64 20 66 10 70 2 C74 10 76 20 70 35 Z"
                      fill="#4ade80"
                    />
                  </g>

                  {/* Blooming Flower (Only visible when Happy in Step 3) */}
                  {currentStep === 3 && (
                    <g className="animate-fade-in-up" transform="translate(70, 20)">
                      {/* Flower Petals */}
                      <circle cx="0" cy="-10" r="7" fill="#f43f5e" />
                      <circle cx="10" cy="0" r="7" fill="#f43f5e" />
                      <circle cx="0" cy="10" r="7" fill="#f43f5e" />
                      <circle cx="-10" cy="0" r="7" fill="#f43f5e" />
                      <circle cx="7" cy="-7" r="6" fill="#fb7185" />
                      <circle cx="-7" cy="-7" r="6" fill="#fb7185" />
                      <circle cx="7" cy="7" r="6" fill="#fb7185" />
                      <circle cx="-7" cy="7" r="6" fill="#fb7185" />
                      {/* Golden Core */}
                      <circle cx="0" cy="0" r="6" fill="#facc15" />
                      <circle cx="0" cy="0" r="3" fill="#ca8a04" />
                    </g>
                  )}
                </svg>

                {/* Floating sparkle hearts on happy state */}
                {currentStep === 3 && (
                  <div className="absolute -top-4 -right-2 flex flex-col items-center pointer-events-none animate-bounce">
                    <span className="text-xl">✨</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal / Dialog of Success and Results */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg bg-white dark:bg-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-700 text-center animate-fade-in-up">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-2 text-xl font-bold"
                aria-label="Cerrar modal"
              >
                ✕
              </button>

              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-3xl shadow-lg shadow-emerald-500/25">
                🌸
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                ¡Magia en Suelo Urbano!
              </h2>

              <p className="mt-3 text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
                Tu planta ahora tiene todos los nutrientes que necesita. Al regar directo a la tierra con emulsión diluida, fortaleces el sistema radicular y evitas la pudrición u hongos en las hojas.
              </p>

              {/* Biological Takeaway Highlights */}
              <div className="mt-5 space-y-2.5 text-left bg-stone-50 dark:bg-stone-900/60 p-4 rounded-2xl border border-stone-100 dark:border-stone-700/60">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                    <strong className="text-stone-900 dark:text-white font-semibold">Cero Humedad Foliar:</strong> El riego en la base previene manchas negras, quemaduras por sol y hongos patógenos.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                    <strong className="text-stone-900 dark:text-white font-semibold">Nutrición Hidrolizada:</strong> Nitrógeno, fósforo y oligoelementos que la raíz asimila en menos de 48 horas.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                    <strong className="text-stone-900 dark:text-white font-semibold">Floración y Raíces Fuertes:</strong> Impulsa nuevos brotes y activa la microbiota benéfica del suelo.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    handleReset();
                  }}
                  className="w-full py-3 px-5 rounded-xl font-bold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <RefreshIcon className="w-4 h-4" />
                  Volver a intentar
                </button>
                <a
                  href="#/pedido"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSuccessModal(false);
                    window.location.hash = '#/pedido';
                  }}
                  className="w-full py-3 px-5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all text-sm flex items-center justify-center gap-2"
                >
                  Pedir Emulsión
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* Educational Cards: Dosage & Botanical Best Practices */}
        {/* ============================================================== */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200/80 dark:border-stone-700 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <WaterDropIcon className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-stone-900 dark:text-white mb-2">
              Dosis de Preparación
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-3">
              Diluye de <strong>5 ml a 10 ml</strong> (1 a 2 cucharaditas) de Emulsión Suelo Urbano por cada 1 litro de agua sin cloro.
            </p>
            <span className="mt-auto inline-block text-xs font-semibold text-blue-600 dark:text-blue-400">
              ✓ Mezcla homogénea al instante
            </span>
          </div>

          <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200/80 dark:border-stone-700 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-stone-900 dark:text-white mb-2">
              Riego Exclusivo al Sustrato
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-3">
              Aplica la mezcla únicamente sobre la tierra o por inmersión. <strong>Nunca pulverices sobre follaje o flores</strong> en plantas sensibles.
            </p>
            <span className="mt-auto inline-block text-xs font-semibold text-amber-600 dark:text-amber-400">
              ✓ Previene manchas y mildiu
            </span>
          </div>

          <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200/80 dark:border-stone-700 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <LeafIcon className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-stone-900 dark:text-white mb-2">
              Frecuencia Óptima
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-3">
              En primavera y verano: aplica <strong>cada 15 días</strong>. En otoño e invierno: espacia la aplicación a <strong>una vez al mes</strong>.
            </p>
            <span className="mt-auto inline-block text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ✓ Crecimiento sostenido y vigoroso
            </span>
          </div>
        </div>

        {/* Bottom Banner to Doctor Plantas */}
        <div className="mt-8 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              🩺 ¿Tu planta tiene hojas amarillas o manchas?
            </h4>
            <p className="text-sm text-emerald-100 mt-1">
              Sube una foto al Doctor de Plantas con Inteligencia Artificial para obtener diagnóstico y detección visual automática.
            </p>
          </div>
          <a
            href="#/doctor-plantas"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#/doctor-plantas';
            }}
            className="shrink-0 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-bold rounded-xl text-sm transition-all shadow-md transform hover:scale-105"
          >
            Consultar al Doctor
          </a>
        </div>
      </div>
    </section>
  );
};

export default InteractiveGuide;
