
import React, { useState, useEffect } from 'react';
import { LeafIcon, XIcon, BookOpenIcon, SproutIcon, HeartbeatIcon } from './icons/Icons';

export interface Fact {
    id: number;
    title: string;
    summary: string;
    details: string;
    image: string;
}

const facts: Fact[] = [
    {
        id: 1,
        title: "¿Las plantas sienten estrés?",
        summary: "Al igual que nosotros, tus plantas pueden estresarse por cambios bruscos.",
        details: "Estudios demuestran que las plantas emiten señales químicas e incluso sonidos ultrasónicos cuando les falta agua o son cortadas. Nuestra emulsión contiene aminoácidos que actúan como 'antiestrés' natural, ayudándolas a recuperarse de trasplantes o climas extremos rápidamente.",
        image: "https://images.unsplash.com/photo-1591035904573-0979cb73729e?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "La Internet del Bosque",
        summary: "Debajo de tus pies hay una red de comunicación increíble.",
        details: "Las raíces de las plantas se conectan mediante hongos (micorrizas) para intercambiar nutrientes y advertencias sobre plagas. Al usar Suelo Urbano, no solo alimentas la planta, sino que fortaleces esta 'internet subterránea' al aportar materia orgánica viva.",
        image: "https://images.unsplash.com/photo-1598512752271-33f913a5af13?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Una cucharada de vida",
        summary: "¿Sabías que una cucharada de suelo sano tiene más organismos que humanos en la Tierra?",
        details: "Un suelo fértil está repleto de bacterias y hongos benéficos. Los fertilizantes químicos matan esta vida. Nuestra emulsión es un probiótico para tu tierra: repuebla estos microorganismos esenciales que ayudan a tu planta a 'digerir' los nutrientes.",
        image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 4,
        title: "¿Por qué las hojas se ponen amarillas?",
        summary: "No siempre es falta de agua. A veces, es un 'bloqueo estomacal'.",
        details: "Si el pH del suelo es incorrecto, la planta no puede absorber hierro o nitrógeno, aunque se los des. Esto se llama Clorosis. Suelo Urbano ayuda a regular el pH naturalmente, desbloqueando la despensa de nutrientes para que tus hojas vuelvan a ser verdes.",
        image: "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 5,
        title: "Las plantas purifican tu aire",
        summary: "Tener plantas sanas en casa reduce enfermedades respiratorias.",
        details: "Plantas como la 'Lengua de Suegra' o el 'Potus' filtran toxinas del aire. Pero para filtrar bien, necesitan estar vigorosas. Una dosis mensual de nuestra emulsión potencia su capacidad de fotosíntesis y purificación. ¡Aire más limpio para ti!",
        image: "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=600&auto=format&fit=crop"
    }
];

interface CuriousFactPopupProps {
    isVisible: boolean;
    onClose: () => void;
}

const CuriousFactPopup: React.FC<CuriousFactPopupProps> = ({ isVisible, onClose }) => {
    const [currentFact, setCurrentFact] = useState<Fact | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [animateOut, setAnimateOut] = useState(false);

    // Seleccionar un dato aleatorio cuando se hace visible
    useEffect(() => {
        if (isVisible) {
            const randomFact = facts[Math.floor(Math.random() * facts.length)];
            setCurrentFact(randomFact);
            setIsExpanded(false);
            setAnimateOut(false);
        }
    }, [isVisible]);

    const handleClose = () => {
        setAnimateOut(true);
        setTimeout(() => {
            onClose();
        }, 500); // Tiempo para la animación de salida
    };

    if (!isVisible || !currentFact) return null;

    return (
        <div className={`fixed bottom-4 right-4 z-[160] w-[90%] max-w-sm md:max-w-md transition-all duration-500 transform ${animateOut ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'}`}>
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden flex flex-col">
                
                {/* Header Image & Close Button */}
                <div className="relative h-32 w-full flex-shrink-0">
                    <img 
                        src={currentFact.image} 
                        alt={currentFact.title} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    
                    <button 
                        onClick={handleClose}
                        className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors backdrop-blur-sm"
                        aria-label="Cerrar dato curioso"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                        <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                            <SproutIcon className="h-3 w-3" /> Dato Curioso
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col">
                    <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 leading-tight mb-2">
                        {currentFact.title}
                    </h3>
                    
                    <div className={`text-sm text-stone-600 dark:text-stone-300 transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-60' : 'max-h-20'}`}>
                        <p className="font-medium mb-2">{currentFact.summary}</p>
                        <p className={`text-stone-500 dark:text-stone-400 text-justify mt-2 pt-2 border-t border-stone-100 dark:border-stone-700 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            {currentFact.details}
                        </p>
                    </div>

                    {/* Footer / Action */}
                    <div className="mt-4 pt-3 flex justify-between items-center border-t border-stone-100 dark:border-stone-700">
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-green-700 dark:text-green-400 font-bold text-sm hover:underline flex items-center gap-1 transition-colors"
                        >
                            {isExpanded ? 'Leer menos' : 'Leer más'}
                            <BookOpenIcon className="h-4 w-4" />
                        </button>
                        
                        {isExpanded && (
                            <span className="text-[10px] text-stone-400 italic">Suelo Urbano Tu Hogar</span>
                        )}
                    </div>
                </div>
                
                {/* Progress bar indication (optional visual flair) */}
                <div className="h-1 w-full bg-stone-100 dark:bg-stone-700">
                    <div className="h-full bg-green-500 w-full animate-[width_2s_ease-out]"></div>
                </div>
            </div>
        </div>
    );
};

export default CuriousFactPopup;
