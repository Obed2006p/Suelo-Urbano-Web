
import React from 'react';
import { LeafIcon } from './icons/Icons';

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
      
      {/* Overlay - Más ligero para que se vea la imagen */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-green-900/50 z-0"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 z-10 py-20 flex flex-col items-center text-center">
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6 text-white drop-shadow-lg animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
          Nutrición para tu tierra,<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-yellow-200 to-green-300">
            vida para tus plantas.
          </span>
        </h1>
        
        <p className="text-base sm:text-xl md:text-2xl text-stone-100 max-w-3xl mx-auto mb-10 md:mb-12 font-medium leading-relaxed animate-fade-in-up drop-shadow-md px-2">
          Descubre el poder de nuestra emulsión orgánica. 
          Cultiva un jardín vibrante y cosechas abundantes de forma 100% natural.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fade-in-up w-full sm:w-auto px-4 sm:px-0" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={onOrderClick}
            className="group relative w-full sm:w-auto bg-green-600 text-white font-bold py-3.5 px-8 md:py-4 md:px-10 rounded-full hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg shadow-green-900/50 active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Ordenar Ahora 
              <LeafIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-125 text-green-200" />
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
