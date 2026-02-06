import React from 'react';
import { LeafIcon } from './icons/Icons';

interface HeroProps {
  onOrderClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOrderClick }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: "url('https://picsum.photos/1600/900?image=1011&blur=2')",
          backgroundAttachment: 'fixed' 
        }}
      ></div>
      
      {/* Standard Overlay for readability */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 z-10 py-20 flex flex-col items-center">
        
        {/* Floating Badge */}
        <div className="mb-8 animate-fade-in-down">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white text-sm font-bold tracking-wider uppercase shadow-xl">
            <LeafIcon className="w-4 h-4 text-lime-300" />
            Nutrición 100% Orgánica
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 text-center text-white drop-shadow-md animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
          Nutre tu tierra, <br/>
          <span className="text-green-400">
            cultiva vida.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-stone-200 max-w-3xl mx-auto mb-12 text-center font-medium leading-relaxed animate-fade-in-up drop-shadow-sm">
          Eleva tu jardín con nuestra emulsión Premium. 
          La alquimia perfecta entre ciencia y naturaleza para cosechas abundantes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={onOrderClick}
            className="group relative bg-green-600 text-white font-bold py-4 px-10 rounded-full hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg"
          >
            <span className="relative z-10 flex items-center gap-2">
              Ordenar Ahora 
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          
          <button 
            onClick={() => { const el = document.getElementById('que-es'); if(el) el.scrollIntoView({behavior: 'smooth'}) }}
            className="px-10 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/50 text-white font-bold hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            Descubrir Más
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;