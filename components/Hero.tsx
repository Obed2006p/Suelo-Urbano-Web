
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
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          // Usamos una imagen de Unsplash estable que coincide con la estética de tu captura
          backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop')",
          backgroundAttachment: 'fixed' 
        }}
      ></div>
      
      {/* Overlay - Más ligero para que se vea la imagen, con un toque rosa sutil en la parte inferior */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-rose-900/40 z-0"></div>
      
      {/* Decorative Floating Elements - San Valentin */}
      <div className="absolute top-20 right-10 md:right-20 animate-bounce-float opacity-80 z-10 hidden sm:block">
          <CupidIcon className="h-16 w-16 text-rose-300 drop-shadow-lg" />
      </div>
      <div className="absolute bottom-20 left-10 md:left-20 animate-pulse opacity-60 z-10 hidden sm:block">
          <HeartIcon className="h-12 w-12 text-pink-400 drop-shadow-lg" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 z-10 py-20 flex flex-col items-center">
        
        {/* Valentine's Badge */}
        <div className="mb-8 animate-fade-in-down flex flex-col items-center gap-2">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600/30 backdrop-blur-md border border-rose-400/50 text-rose-100 text-sm font-bold tracking-wider uppercase shadow-xl ring-2 ring-rose-500/50">
            <HeartIcon className="w-4 h-4 text-rose-300" />
            Especial San Valentín
            <HeartIcon className="w-4 h-4 text-rose-300" />
          </span>
          <span className="text-xs text-rose-200 font-medium tracking-widest uppercase opacity-80">Regala vida a tu jardín</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 text-center text-white drop-shadow-md animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
          Amor para tu tierra,<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-rose-400 to-green-400">
            vida para tus rosas.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-stone-100 max-w-3xl mx-auto mb-12 text-center font-medium leading-relaxed animate-fade-in-up drop-shadow-sm">
          Este 14 de febrero, consiente a tus plantas con nuestra emulsión Premium. 
          El regalo perfecto para un jardín que florece con pasión.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={onOrderClick}
            className="group relative bg-green-600 text-white font-bold py-4 px-10 rounded-full hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg shadow-green-900/50"
          >
            <span className="relative z-10 flex items-center gap-2">
              Ordenar Ahora 
              <HeartIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-125 text-rose-300" />
            </span>
          </button>
          
          <button 
            onClick={() => { const el = document.getElementById('que-es'); if(el) el.scrollIntoView({behavior: 'smooth'}) }}
            className="px-10 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/50 text-white font-bold hover:bg-white/20 transition-all duration-300 shadow-lg flex items-center gap-2"
          >
            Descubrir Más <LeafIcon className="w-4 h-4 text-green-300" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
