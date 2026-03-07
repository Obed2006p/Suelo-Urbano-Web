
import React from 'react';
import { LeafIcon, HeartbeatIcon, AtomIcon, SearchIcon, ChevronRightIcon } from './icons/Icons';

interface HeroProps {
  onOrderClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOrderClick }) => {
  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({behavior: 'smooth'});
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background - Imagen oscura de naturaleza/suelo */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1600&auto=format&fit=crop')",
        }}
      ></div>
      
      {/* Overlay - Oscuro para legibilidad */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      <div className="relative container mx-auto px-4 z-10 py-20 flex flex-col items-center text-center h-full justify-center">
        
        {/* Logo Area */}
        <div className="mb-8 flex flex-col items-center animate-fade-in-down">
            <div className="bg-white/10 p-3 rounded-full mb-3 backdrop-blur-sm border border-white/20">
                <LeafIcon className="w-8 h-8 text-green-400" />
            </div>
            <span className="text-white font-bold tracking-widest uppercase text-sm opacity-90">Suelo Urbano</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-white drop-shadow-lg animate-fade-in-down max-w-5xl" style={{ animationDelay: '0.1s' }}>
          Tu maceta es un ecosistema vivo.<br/>
          <span className="text-green-400">Aprende a cuidarlo.</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto mb-8 font-medium leading-relaxed animate-fade-in-up drop-shadow-md" style={{ animationDelay: '0.2s' }}>
          No vendemos tierra. Te enseñamos a crear un suelo vivo, equilibrado y saludable para tus plantas.
        </p>

        {/* Accent Text */}
        <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-green-300 font-semibold text-xl italic">
                Una planta fuerte no empieza en la hoja... <br/>
                empieza en la raíz. 🌿
            </p>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl mb-12 animate-fade-in-up px-2" style={{ animationDelay: '0.4s' }}>
            {/* Card 1 */}
            <button onClick={() => navigateTo('#/doctor-plantas')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-4 rounded-xl text-left flex items-center gap-4 transition-all group hover:scale-105">
                <div className="bg-green-900/60 p-3 rounded-full shrink-0">
                    <HeartbeatIcon className="w-6 h-6 text-green-400" />
                </div>
                <div>
                    <p className="text-white font-bold text-sm leading-tight mb-1">¿Tu planta no mejora?</p>
                    <p className="text-gray-300 text-xs flex items-center gap-1 group-hover:text-green-300 transition-colors">
                        Diagnóstico del ecosistema <ChevronRightIcon className="w-3 h-3" />
                    </p>
                </div>
            </button>

            {/* Card 2 */}
            <button onClick={() => scrollToId('que-es')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-4 rounded-xl text-left flex items-center gap-4 transition-all group hover:scale-105">
                <div className="bg-green-900/60 p-3 rounded-full shrink-0">
                    <AtomIcon className="w-6 h-6 text-green-400" />
                </div>
                <div>
                    <p className="text-white font-bold text-sm leading-tight mb-1">¿Qué es un suelo vivo?</p>
                    <p className="text-gray-300 text-xs flex items-center gap-1 group-hover:text-green-300 transition-colors">
                        Descúbrelo aquí <ChevronRightIcon className="w-3 h-3" />
                    </p>
                </div>
            </button>

            {/* Card 3 */}
            <button onClick={() => scrollToId('beneficios')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-4 rounded-xl text-left flex items-center gap-4 transition-all group hover:scale-105">
                <div className="bg-green-900/60 p-3 rounded-full shrink-0">
                    <SearchIcon className="w-6 h-6 text-green-400" />
                </div>
                <div>
                    <p className="text-white font-bold text-sm leading-tight mb-1">Antes y después del sustrato</p>
                    <p className="text-gray-300 text-xs flex items-center gap-1 group-hover:text-green-300 transition-colors">
                        Mira las raíces <ChevronRightIcon className="w-3 h-3" />
                    </p>
                </div>
            </button>
        </div>

        {/* CTA Button */}
        <div className="relative z-20 animate-fade-in-up mb-12 md:mb-0" style={{ animationDelay: '0.5s' }}>
            <button
                onClick={() => navigateTo('#/doctor-plantas')}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-10 rounded-full shadow-xl shadow-green-900/40 transition-all transform hover:scale-105 active:scale-95 text-lg border border-green-500/30"
            >
                Comenzar asesoría gratuita
            </button>
        </div>

        {/* Quote */}
        <div className="mt-8 md:absolute md:bottom-12 md:right-12 max-w-xs text-center md:text-right animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <p className="text-white/80 italic font-serif text-lg md:text-xl leading-relaxed">
                “Cuando el suelo está sano, <br/>
                la planta se defiende sola.”
            </p>
        </div>

      </div>
    </section>
  );
};

export default Hero;
