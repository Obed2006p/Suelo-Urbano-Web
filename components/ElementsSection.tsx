import React, { useState } from 'react';

interface ElementItem {
  id: string;
  name: string;
  symbol: string;
  atomicNumber?: number;
  category: 'macro-primario' | 'macro-secundario' | 'micro' | 'bio';
  categoryLabel: string;
  glowClass: string;
  accentColor: string;
  accentBg: string;
  func: string;
  keyBenefit: string;
  icon: (color: string) => React.ReactNode;
}

const elementsList: ElementItem[] = [
  // 1. NITRÓGENO
  {
    id: 'nitrogeno',
    name: 'Nitrógeno',
    symbol: 'N',
    atomicNumber: 7,
    category: 'macro-primario',
    categoryLabel: 'Macronutriente Primario',
    glowClass: 'shadow-glow-green',
    accentColor: 'text-emerald-400',
    accentBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    func: 'Esencial para el crecimiento de hojas verdes, tallos y brotes nuevos. Estimula intensamente la fotosíntesis y la formación de clorofila.',
    keyBenefit: 'Follaje exuberante y color verde intenso',
    icon: (color) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${color}`}>
        <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 12C12 12 16.5 6.5 21 7.5C21 7.5 21 12 16 14C11.6667 15.7333 12 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25"/>
        <path d="M12 16C12 16 7.5 10.5 3 11.5C3 11.5 3 16 8 18C12.3333 19.7333 12 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25"/>
      </svg>
    ),
  },

  // 2. FÓSFORO
  {
    id: 'fosforo',
    name: 'Fósforo',
    symbol: 'P',
    atomicNumber: 15,
    category: 'macro-primario',
    categoryLabel: 'Macronutriente Primario',
    glowClass: 'shadow-glow-pink',
    accentColor: 'text-pink-400',
    accentBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    func: 'Promueve el desarrollo explosivo de raíces y la inducción floral. Clave para la transferencia de energía celular y maduración de frutos.',
    keyBenefit: 'Raíces profundas y floración abundante',
    icon: (color) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${color}`}>
        <path d="M12 14V22M12 17C9 17 7 19 7 21M12 19C15 19 17 21 17 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 14C12 14 16 11 16 7C16 4.5 14.5 2 12 2C9.5 2 8 4.5 8 7C8 11 12 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25"/>
        <path d="M12 14C12 14 6 11.5 4 8C2.5 5.5 4.5 3.5 7 5C10 6.5 12 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M12 14C12 14 18 11.5 20 8C21.5 5.5 19.5 3.5 17 5C14 6.5 12 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },

  // 3. POTASIO
  {
    id: 'potasio',
    name: 'Potasio',
    symbol: 'K',
    atomicNumber: 19,
    category: 'macro-primario',
    categoryLabel: 'Macronutriente Primario',
    glowClass: 'shadow-glow-blue',
    accentColor: 'text-blue-400',
    accentBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    func: 'Regula el equilibrio de agua y la apertura de estomas. Otorga rigidez a los tallos y multiplica la resistencia contra plagas y sequías.',
    keyBenefit: 'Inmunidad vegetal y retención hídrica',
    icon: (color) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${color}`}>
        <path d="M12 2.69L11.53 3.16C7.26 7.43 5 10.37 5 13.5C5 17.37 8.13 20.5 12 20.5C15.87 20.5 19 17.37 19 13.5C19 10.37 16.74 7.43 12.47 3.16L12 2.69Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25"/>
        <path d="M9 15.5C9 15.5 10.5 17 12 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },

  // 4. CALCIO
  {
    id: 'calcio',
    name: 'Calcio',
    symbol: 'Ca',
    atomicNumber: 20,
    category: 'macro-secundario',
    categoryLabel: 'Macronutriente Secundario',
    glowClass: 'shadow-glow-amber',
    accentColor: 'text-amber-400',
    accentBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    func: 'Eslabón estructural de las paredes celulares de la planta. Previene la muerte de puntas radiculares y el marchitamiento de brotes tiernos.',
    keyBenefit: 'Paredes celulares firmes y resistentes',
    icon: (color) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${color}`}>
        <path d="M12 2L4 6V12C4 17.5 7.5 21 12 22C16.5 21 20 17.5 20 12V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25"/>
        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },

  // 5. MAGNESIO
  {
    id: 'magnesio',
    name: 'Magnesio',
    symbol: 'Mg',
    atomicNumber: 12,
    category: 'macro-secundario',
    categoryLabel: 'Macronutriente Secundario',
    glowClass: 'shadow-glow-purple',
    accentColor: 'text-purple-400',
    accentBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    func: 'Átomo central de cada molécula de clorofila. Sin él, la planta no puede transformar la luz solar en azúcares ni transportar fósforo.',
    keyBenefit: 'Corazón biológico de la fotosíntesis',
    icon: (color) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${color}`}>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3"/>
        <path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.93 4.93L7.05 7.05M16.95 16.95L19.07 19.07M4.93 19.07L7.05 16.95M16.95 7.05L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },

  // 6. AZUFRE
  {
    id: 'azufre',
    name: 'Azufre',
    symbol: 'S',
    atomicNumber: 16,
    category: 'macro-secundario',
    categoryLabel: 'Macronutriente Secundario',
    glowClass: 'shadow-glow-yellow',
    accentColor: 'text-yellow-400',
    accentBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    func: 'Fundamental para la síntesis de aminoácidos y proteínas esenciales. Enriquece la producción de aceites aromáticos, defensas y sabor de frutos.',
    keyBenefit: 'Aromas naturales y aminoácidos vitales',
    icon: (color) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${color}`}>
        <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25"/>
      </svg>
    ),
  },

  // 7. HIERRO
  {
    id: 'hierro',
    name: 'Hierro',
    symbol: 'Fe',
    atomicNumber: 26,
    category: 'micro',
    categoryLabel: 'Micronutriente Esencial',
    glowClass: 'shadow-glow-red',
    accentColor: 'text-rose-400',
    accentBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    func: 'Catalizador biológico para la fabricación de clorofila y transporte respiratorio de electrones. Previene el amarillamiento de nervaduras.',
    keyBenefit: 'Previene y erradica la clorosis férrica',
    icon: (color) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${color}`}>
        <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
        <path d="M12 7V17M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },

  // 8. ZINC
  {
    id: 'zinc',
    name: 'Zinc',
    symbol: 'Zn',
    atomicNumber: 30,
    category: 'micro',
    categoryLabel: 'Micronutriente Esencial',
    glowClass: 'shadow-glow-lime',
    accentColor: 'text-lime-400',
    accentBg: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    func: 'Controla la producción de auxinas (hormonas vegetales de crecimiento). Asegura la adecuada separación de nudos y hojas simétricas.',
    keyBenefit: 'Activador hormonal del crecimiento',
    icon: (color) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${color}`}>
        <path d="M12 21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 11C12 7 16 4 19 4C19 8 16 11 12 11Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25"/>
        <path d="M12 15C12 12 8 9 5 9C5 13 8 15 12 15Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25"/>
        <circle cx="12" cy="21" r="2" fill="currentColor"/>
      </svg>
    ),
  },

  // 9. COBRE
  {
    id: 'cobre',
    name: 'Cobre',
    symbol: 'Cu',
    atomicNumber: 29,
    category: 'micro',
    categoryLabel: 'Micronutriente Esencial',
    glowClass: 'shadow-glow-cyan',
    accentColor: 'text-cyan-400',
    accentBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    func: 'Componente clave en la síntesis de lignina, otorgando rigidez a tallos y tallos florales. Estimula enzimas de defensa natural.',
    keyBenefit: 'Formación de lignina y rigidez estructural',
    icon: (color) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${color}`}>
        <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25"/>
        <path d="M12 15V22M8 18H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },

  // 10. MANGANESO
  {
    id: 'manganeso',
    name: 'Manganeso',
    symbol: 'Mn',
    atomicNumber: 25,
    category: 'micro',
    categoryLabel: 'Micronutriente Esencial',
    glowClass: 'shadow-glow-indigo',
    accentColor: 'text-indigo-400',
    accentBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    func: 'Esencial para la ruptura enzimática de la molécula de agua en la fotosíntesis. Acelera la absorción y asimilación de nitratos en la raíz.',
    keyBenefit: 'Metabolismo de nitratos y energía radicular',
    icon: (color) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${color}`}>
        <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3"/>
        <circle cx="18" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3"/>
        <circle cx="12" cy="6" r="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3"/>
        <circle cx="12" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3"/>
        <path d="M9 12H15M12 9V15" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },

  // 11. SODIO
  {
    id: 'sodio',
    name: 'Sodio',
    symbol: 'Na',
    atomicNumber: 11,
    category: 'micro',
    categoryLabel: 'Elemento Benéfico',
    glowClass: 'shadow-glow-blue',
    accentColor: 'text-sky-400',
    accentBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    func: 'En proporciones naturales equilibradas de la emulsión marina, ayuda en el balance osmótico celular y mejora la absorción iónica.',
    keyBenefit: 'Equilibrio electrolítico y turgencia en hojas',
    icon: (color) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${color}`}>
        <path d="M4 12C4 8 8 5 12 5C16 5 20 8 20 12C20 16 16 19 12 19C8 19 4 16 4 12Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
        <path d="M8 12C8 10 10 8 12 8C14 8 16 10 16 12C16 14 14 16 12 16C10 16 8 14 8 12Z" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },

  // 12. MATERIA ORGÁNICA Y AMINOÁCIDOS MARINOS
  {
    id: 'aminoacidos',
    name: 'Aminoácidos y Omegas',
    symbol: 'MO+',
    category: 'bio',
    categoryLabel: 'Bioestimulante Marino',
    glowClass: 'shadow-glow-green',
    accentColor: 'text-emerald-400',
    accentBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    func: 'Fracción orgánica hidrolizada del pescado. Alimenta y multiplica los microorganismos benéficos del suelo facilitando la quelatación natural.',
    keyBenefit: 'Microbiota activa y quelatación inmediata',
    icon: (color) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${color}`}>
        <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeDasharray="2 3"/>
        <path d="M12 6C9 8 7 11 7 14C7 16.5 9 18.5 12 18.5C15 18.5 17 16.5 17 14C17 11 15 8 12 6Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="14" r="2" fill="currentColor"/>
      </svg>
    ),
  },
];

const ElementsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toggle card flip on click/tap (mobile and click support)
  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Flip all or restore all
  const areAllFlipped = Object.values(flippedCards).filter(Boolean).length >= elementsList.length / 2;
  const toggleAll = () => {
    if (areAllFlipped) {
      setFlippedCards({});
    } else {
      const all: Record<string, boolean> = {};
      elementsList.forEach((el) => {
        all[el.id] = true;
      });
      setFlippedCards(all);
    }
  };

  const filteredElements = elementsList.filter((item) => {
    const matchesCat = activeCategory === 'todos' || item.category === activeCategory;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.func.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <section className="w-full py-16 md:py-24 px-4 sm:px-6 bg-slate-900 text-white selection:bg-emerald-500 selection:text-white min-h-screen">
      {/* 3D Flip Card Styles mirroring the exact user specification */}
      <style>{`
        /* Clases esenciales para la animación 3D del Flip Card */
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden; /* Soporte para Safari */
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }

        /* Hover que detona el giro en desktop */
        .group:hover .flip-card-inner {
          transform: rotateY(180deg);
        }

        /* Soporte para clic o tap en dispositivos móviles y de escritorio */
        .is-card-flipped {
          transform: rotateY(180deg) !important;
        }

        /* Sombras suaves de color para darle un toque premium */
        .group:hover .shadow-glow-green,
        .is-card-flipped.shadow-glow-green {
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
        }
        .group:hover .shadow-glow-pink,
        .is-card-flipped.shadow-glow-pink {
          box-shadow: 0 0 30px rgba(236, 72, 153, 0.4);
        }
        .group:hover .shadow-glow-blue,
        .is-card-flipped.shadow-glow-blue {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
        }
        .group:hover .shadow-glow-amber,
        .is-card-flipped.shadow-glow-amber {
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.4);
        }
        .group:hover .shadow-glow-purple,
        .is-card-flipped.shadow-glow-purple {
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);
        }
        .group:hover .shadow-glow-yellow,
        .is-card-flipped.shadow-glow-yellow {
          box-shadow: 0 0 30px rgba(234, 179, 8, 0.4);
        }
        .group:hover .shadow-glow-red,
        .is-card-flipped.shadow-glow-red {
          box-shadow: 0 0 30px rgba(244, 63, 94, 0.4);
        }
        .group:hover .shadow-glow-lime,
        .is-card-flipped.shadow-glow-lime {
          box-shadow: 0 0 30px rgba(132, 204, 22, 0.4);
        }
        .group:hover .shadow-glow-cyan,
        .is-card-flipped.shadow-glow-cyan {
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.4);
        }
        .group:hover .shadow-glow-indigo,
        .is-card-flipped.shadow-glow-indigo {
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Encabezado Principal */}
        <div className="text-center mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-semibold tracking-wide uppercase border border-emerald-500/20">
            <span>✨</span> Tabla de Elementos y Bioquímica Vegetal
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Riqueza Natural de la Emulsión
          </h2>
          <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Componentes 100% naturales que nutren tus plantas. Pasa el cursor o toca cada tarjeta para voltearla y descubrir su función botánica esencial.
          </p>

          {/* Indicador de ayuda y botón de voltear todo */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
              <span className="text-emerald-400">↺</span> Toca o pasa el cursor sobre cada carta para girarla
            </span>
            <button
              onClick={toggleAll}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-600/30 transition-all"
            >
              <span>🔀</span> {areAllFlipped ? 'Voltear todas al frente' : 'Girar todas las cartas'}
            </button>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-800/50 p-3 sm:p-4 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
          {/* Categorías */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveCategory('todos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === 'todos'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Todos ({elementsList.length})
            </button>
            <button
              onClick={() => setActiveCategory('macro-primario')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === 'macro-primario'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Primarios (N-P-K)
            </button>
            <button
              onClick={() => setActiveCategory('macro-secundario')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === 'macro-secundario'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Secundarios (Ca-Mg-S)
            </button>
            <button
              onClick={() => setActiveCategory('micro')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === 'micro'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Micronutrientes (Fe-Zn-Cu...)
            </button>
            <button
              onClick={() => setActiveCategory('bio')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === 'bio'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Bioestimulantes
            </button>
          </div>

          {/* Buscador Rápido */}
          <div className="w-full md:w-64 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar elemento o beneficio..."
              className="w-full bg-slate-900 text-xs sm:text-sm text-white placeholder-slate-500 rounded-xl px-3.5 py-2 pl-9 border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs p-0.5"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Grid de Tarjetas 3D Flip Cards (1 col en móvil, 2 en tablet, 3 en desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredElements.map((item) => {
            const isFlipped = !!flippedCards[item.id];

            return (
              <div
                key={item.id}
                onClick={() => toggleFlip(item.id)}
                className="group h-80 sm:h-88 perspective-1000 cursor-pointer select-none"
                role="button"
                tabIndex={0}
                aria-label={`Tarjeta del elemento ${item.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFlip(item.id);
                  }
                }}
              >
                {/* Contenedor interno que gira 180deg */}
                <div
                  className={`relative h-full w-full transition-transform duration-700 ease-in-out transform-style-3d flip-card-inner ${item.glowClass} ${
                    isFlipped ? 'is-card-flipped' : ''
                  } rounded-2xl`}
                >
                  {/* ========================================================= */}
                  {/* FRENTE DE LA TARJETA (Gris Oscuro Elegante) */}
                  {/* ========================================================= */}
                  <div className="absolute inset-0 backface-hidden bg-zinc-800 rounded-2xl flex flex-col items-center justify-between p-6 border border-zinc-700/60 shadow-xl overflow-hidden">
                    {/* Badge superior con Símbolo Químico y Categoría */}
                    <div className="w-full flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${item.accentBg}`}>
                        {item.categoryLabel}
                      </span>
                      <span className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-black text-xs text-white tracking-wider">
                        {item.symbol}
                      </span>
                    </div>

                    {/* Contenedor central con Icono / Gráfico del Elemento */}
                    <div className="flex flex-col items-center justify-center my-auto">
                      <div className="w-24 h-24 mb-3 bg-zinc-900/70 rounded-full flex items-center justify-center p-4 border border-zinc-700/40 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        {item.icon(item.accentColor)}
                      </div>
                      <h3 className="text-2xl font-bold text-white tracking-wide text-center">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        {item.keyBenefit}
                      </p>
                    </div>

                    {/* Pie de la tarjeta frontal con pista de giro */}
                    <div className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 group-hover:text-emerald-400 transition-colors pt-2 border-t border-zinc-700/40">
                      <span>↺</span>
                      <span>Toca o pasa el cursor para voltear</span>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* REVERSO DE LA TARJETA (Verde Oscuro Esmeralda Elegante) */}
                  {/* ========================================================= */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-2xl flex flex-col items-center justify-between p-6 sm:p-7 border border-emerald-700/60 shadow-2xl text-center overflow-hidden">
                    {/* Encabezado del Reverso */}
                    <div className="w-full flex items-center justify-between border-b border-emerald-800/80 pb-3">
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                        {item.name} ({item.symbol})
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                        {item.atomicNumber ? `Elemento #${item.atomicNumber}` : 'Orgánico'}
                      </span>
                    </div>

                    {/* Contenido Central: Explicación breve y de alto valor */}
                    <div className="my-auto py-2">
                      <div className={`${item.accentColor} mb-3 opacity-60 flex justify-center`}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-emerald-50 text-base sm:text-lg leading-relaxed font-medium">
                        {item.func}
                      </p>
                    </div>

                    {/* Resumen Destacado en el Reverso */}
                    <div className="w-full bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/50 flex items-center justify-between text-left">
                      <div>
                        <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Impacto Clave</p>
                        <p className="text-xs text-white font-semibold">{item.keyBenefit}</p>
                      </div>
                      <span className="text-emerald-400 text-xs shrink-0">✓ Activo</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sin resultados si la búsqueda no coincide */}
        {filteredElements.length === 0 && (
          <div className="text-center py-16 bg-slate-800/40 rounded-3xl border border-slate-700/50">
            <span className="text-4xl">🌱</span>
            <h4 className="text-lg font-bold text-white mt-3">No se encontraron elementos</h4>
            <p className="text-slate-400 text-sm mt-1">Prueba con otro término de búsqueda o selecciona otra categoría.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('todos');
              }}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        )}

        {/* Banner Inferior: Sinergia de Nutrientes en la Emulsión */}
        <div className="mt-16 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
              🧪 Biodisponibilidad 100% Asimilable
            </h4>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              A diferencia de los fertilizantes químicos sintéticos, los elementos de la <strong>Emulsión Suelo Urbano</strong> vienen naturalmente quelatados por aminoácidos marinos, garantizando que tus plantas los absorban sin salinizar el suelo ni quemar las raíces.
            </p>
          </div>
          <a
            href="#/pedido"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#/pedido';
            }}
            className="shrink-0 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/25 transform hover:scale-105"
          >
            Adquirir Emulsión
          </a>
        </div>
      </div>
    </section>
  );
};

export default ElementsSection;