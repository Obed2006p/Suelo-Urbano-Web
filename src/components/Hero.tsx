import React from 'react';

interface HeroProps {
  onOrderClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOrderClick }) => {
  return (
    <section 
      className="relative bg-cover bg-center text-white py-32 md:py-48 px-6" 
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative container mx-auto text-center z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-down">
          Nutre tu tierra, cultiva vida.
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 animate-fade-in-up">
          Descubre el poder de la emulsión de alta calidad. La mejor opción para un jardín sano, cosechas abundantes y un planeta más verde.
        </p>
        <button
          onClick={onOrderClick}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-transform duration-300 ease-in-out transform hover:scale-105 shadow-lg text-lg animate-pulse"
        >
          ¡Quiero mi emulsión!
        </button>
      </div>
    </section>
  );
};

export default Hero;
