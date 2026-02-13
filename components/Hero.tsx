
import React from 'react';
import { LeafIcon, HeartIcon, CupidIcon } from './icons/Icons';

interface HeroProps {
  onOrderClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOrderClick }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background - Imagen estilo "Hiker mirando el lago" funcional */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 bg-scroll md:bg-fixed" 
        style={{ 
          // Usamos una imagen de Unsplash estable que coincide con la estética de tu captura
          backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop')",
        }}
      ></div>
      
      {/* Overlay - Más ligero para que se vea la imagen, con un toque rosa sutil en la parte inferior */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-rose-900/50 z-0"></div>
      
      {/* Decorative Floating Elements - San Valentin (Ocultos en móvil muy pequeño para limpiar vista, visibles en sm) */}
      <div className="absolute top-20 right-5 sm:right-10 md:right-20 animate-bounce-float opacity-80 z-10 hidden sm:block">
          <CupidIcon className="h-12 w-12 sm:h-16 sm:w-16 text-rose-300 drop-shadow-lg" />
      </div>
      <div className="absolute bottom-20 left-5 sm:left-10 md:left-20 animate-pulse opacity-60 z-10 hidden sm:block">
          <HeartIcon className="h-8 w-8 sm:h-12 sm:w-12 text-pink-400 drop-shadow-lg" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 z-10 py-20 flex flex-col items-center text-center">
        
        {/* Valentine's Badge */}
        <div className="mb-6 md:mb-8 animate-fade-in-down flex flex-col items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-rose-600/40 backdrop-blur-md border border-rose-400/50 text-rose-100 text-xs md:text-sm font-bold tracking-wider uppercase shadow-xl ring-1 md:ring-2 ring-rose-500/50">
            <HeartIcon className="w-3 h-3 md:w-4 md:h-4 text-rose-300" />
            Especial San Valentín
            <HeartIcon className="w-3 h-3 md:w-4 md:h-4 text-rose-300" />
          </span>
          <span className="text-[10px] md:text-xs text-rose-200 font-medium tracking-widest uppercase opacity-90">Regala vida a tu jardín</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6 text-white drop-shadow-lg animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
          Amor para tu tierra,<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-rose-300 to-green-300">
            vida para tus rosas.
          </span>
        </h1>
        
        <p className="text-base sm:text-xl md:text-2xl text-stone-100 max-w-3xl mx-auto mb-10 md:mb-12 font-medium leading-relaxed animate-fade-in-up drop-shadow-md px-2">
          Este 14 de febrero, consiente a tus plantas con nuestra emulsión Premium. 
          El regalo perfecto para un jardín que florece con pasión.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fade-in-up w-full sm:w-auto px-4 sm:px-0" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={onOrderClick}
            className="group relative w-full sm:w-auto bg-green-600 text-white font-bold py-3.5 px-8 md:py-4 md:px-10 rounded-full hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg shadow-green-900/50 active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Ordenar Ahora 
              <HeartIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-125 text-rose-300" />
            </span>
          </button>
          
          <button 
            onClick={() => { const el = document.getElementById('que-es'); if(el) el.scrollIntoView({behavior: 'smooth'}) }}
            className="w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/50 text-white font-bold hover:bg-white/20 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 active:scale-95"
          >
            Descubrir Más <LeafIcon className="w-4 h-4 text-green-300" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
