import React, { useState, useRef, useEffect } from 'react';
import { LeafIcon, HeartbeatIcon, AtomIcon, SearchIcon, ChevronRightIcon } from './icons/Icons';
import BioluminescentEcosystem from './BioluminescentEcosystem';

interface HeroProps {
  onOrderClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOrderClick }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 600, y: 400 });
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 1200, height: 800 });
  const [isBioActive, setIsBioActive] = useState<boolean>(true);

  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Measure hero dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Parallax offsets
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const bgOffsetX = (mousePos.x - centerX) * -0.018;
  const bgOffsetY = (mousePos.y - centerY) * -0.018;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950"
    >
      {/* ============================================================== */}
      {/* 1. BACKGROUND FOLIAGE IMAGE WITH PARALLAX DEPTH               */}
      {/* ============================================================== */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-300 ease-out will-change-transform"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1600&auto=format&fit=crop')",
          transform: `translate3d(${bgOffsetX}px, ${bgOffsetY}px, 0) scale(1.08)`,
        }}
      />

      {/* Dark Vignette Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/85 z-[1] pointer-events-none" />

      {/* ============================================================== */}
      {/* 2. BIOLUMINESCENT ECOSYSTEM: ORBS + MYCELIUM + SPORES + TOPO  */}
      {/* ============================================================== */}
      {isBioActive && (
        <BioluminescentEcosystem
          mousePos={mousePos}
          intensity={1}
          className="transition-opacity duration-700"
        />
      )}

      {/* ============================================================== */}
      {/* 3. FOREGROUND HERO CONTENT (High Z-Index & Crisp Text)         */}
      {/* ============================================================== */}
      <div className="relative container mx-auto px-4 z-10 py-20 flex flex-col items-center text-center h-full justify-center">
        
        {/* Logo / Badge */}
        <div className="mb-8 flex flex-col items-center animate-fade-in-down">
          <div className="bg-emerald-950/60 p-3.5 rounded-full mb-3 backdrop-blur-md border border-emerald-500/40 shadow-lg shadow-emerald-950/60 group hover:scale-105 transition-transform">
            <LeafIcon className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
          </div>
          <span className="text-emerald-200/90 font-bold tracking-widest uppercase text-xs sm:text-sm drop-shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Suelo Urbano
          </span>
        </div>

        {/* Main Title with Bioluminescent Glow */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-white drop-shadow-2xl animate-fade-in-down max-w-5xl tracking-tight"
          style={{ animationDelay: '0.1s' }}
        >
          Tu maceta es un ecosistema vivo.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-300 drop-shadow-[0_0_35px_rgba(16,185,129,0.55)]">
            Aprende a cuidarlo.
          </span>
        </h1>
        
        {/* Subtitle */}
        <p
          className="text-base sm:text-xl text-stone-200 max-w-3xl mx-auto mb-8 font-medium leading-relaxed animate-fade-in-up drop-shadow-md"
          style={{ animationDelay: '0.2s' }}
        >
          No vendemos tierra. Te enseñamos a crear un suelo vivo, equilibrado y biológicamente activo para tus plantas.
        </p>

        {/* Accent Text */}
        <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-emerald-300 font-semibold text-lg sm:text-2xl italic drop-shadow-sm">
            Una planta fuerte no empieza en la hoja... <br />
            empieza en la raíz. 🌿
          </p>
        </div>
        
        {/* Feature Cards with Glassmorphism and Neon Accents */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl mb-12 animate-fade-in-up px-2"
          style={{ animationDelay: '0.4s' }}
        >
          {/* Card 1 */}
          <button
            onClick={() => navigateTo('#/doctor-plantas')}
            className="bg-stone-900/40 hover:bg-stone-800/60 backdrop-blur-md border border-emerald-500/30 hover:border-emerald-400 p-4 rounded-2xl text-left flex items-center gap-4 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-emerald-950/60"
          >
            <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-600/30 shrink-0 group-hover:bg-emerald-900 transition-colors">
              <HeartbeatIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight mb-1">¿Tu planta no mejora?</p>
              <p className="text-stone-300 text-xs flex items-center gap-1 group-hover:text-emerald-300 transition-colors">
                Diagnóstico del ecosistema <ChevronRightIcon className="w-3 h-3 text-emerald-400" />
              </p>
            </div>
          </button>

          {/* Card 2 */}
          <button
            onClick={() => scrollToId('que-es')}
            className="bg-stone-900/40 hover:bg-stone-800/60 backdrop-blur-md border border-emerald-500/30 hover:border-emerald-400 p-4 rounded-2xl text-left flex items-center gap-4 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-emerald-950/60"
          >
            <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-600/30 shrink-0 group-hover:bg-emerald-900 transition-colors">
              <AtomIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight mb-1">¿Qué es un suelo vivo?</p>
              <p className="text-stone-300 text-xs flex items-center gap-1 group-hover:text-emerald-300 transition-colors">
                Descúbrelo aquí <ChevronRightIcon className="w-3 h-3 text-emerald-400" />
              </p>
            </div>
          </button>

          {/* Card 3 */}
          <button
            onClick={() => scrollToId('beneficios')}
            className="bg-stone-900/40 hover:bg-stone-800/60 backdrop-blur-md border border-emerald-500/30 hover:border-emerald-400 p-4 rounded-2xl text-left flex items-center gap-4 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-emerald-950/60"
          >
            <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-600/30 shrink-0 group-hover:bg-emerald-900 transition-colors">
              <SearchIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight mb-1">Antes y después del sustrato</p>
              <p className="text-stone-300 text-xs flex items-center gap-1 group-hover:text-emerald-300 transition-colors">
                Mira las raíces <ChevronRightIcon className="w-3 h-3 text-emerald-400" />
              </p>
            </div>
          </button>
        </div>

        {/* CTA Button */}
        <div className="relative z-20 animate-fade-in-up mb-12 md:mb-0" style={{ animationDelay: '0.5s' }}>
          <div className="inline-block animate-bounce-float relative">
            {/* Glowing neon aura under the floating button */}
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400 rounded-full blur-xl opacity-45 animate-pulse" />
            <button
              onClick={() => navigateTo('#/doctor-plantas')}
              className="relative bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold py-4 px-12 rounded-full shadow-2xl shadow-emerald-950/80 transition-all transform hover:scale-105 active:scale-95 text-lg border border-emerald-400/40 tracking-wide"
            >
              Comenzar asesoría gratuita
            </button>
          </div>
        </div>

        {/* Botanical Quote */}
        <div
          className="mt-8 md:absolute md:bottom-12 md:right-12 max-w-xs text-center md:text-right animate-fade-in"
          style={{ animationDelay: '0.8s' }}
        >
          <p className="text-white/85 italic font-serif text-lg md:text-xl leading-relaxed drop-shadow-md">
            “Cuando el suelo está sano, <br />
            la planta se defiende sola.”
          </p>
        </div>

        {/* Subtle Biotech Toggle / Status in Bottom Left */}
        <div className="mt-6 md:absolute md:bottom-6 md:left-6 z-20 flex items-center gap-2">
          <button
            onClick={() => setIsBioActive(!isBioActive)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 hover:bg-slate-800/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all shadow-md group"
            title="Activar o pausar el ecosistema de bioluminiscencia y micelio"
          >
            <span className={`w-2 h-2 rounded-full ${isBioActive ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
            <span>{isBioActive ? 'Ecosistema Bioluminiscente Activo' : 'Ecosistema Pausado'}</span>
            <span className="text-[10px] text-emerald-400/70 group-hover:text-emerald-300">({isBioActive ? 'Pausar' : 'Activar'})</span>
          </button>
        </div>

      </div>
    </section>
  );
};

export default Hero;
