
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
        title: "Luz adecuada",
        summary: "Energía para fortalecer raíces.",
        details: "Cada planta necesita diferente cantidad de luz. No es lo mismo una planta de interior que una de exterior. La luz correcta ayuda a que la planta tenga energía para fortalecer sus raíces.",
        image: "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Riego correcto",
        summary: "El equilibrio es la clave.",
        details: "Ni exceso ni escasez. Demasiada agua puede ahogar la raíz. Muy poca agua la debilita. El equilibrio es fundamental para mantener la salud radicular.",
        image: "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Sustrato equilibrado",
        summary: "Alimentar y dejar respirar.",
        details: "Una mezcla adecuada de tierra, humus y material que permita aireación. El suelo debe alimentar, pero también dejar respirar a las raíces.",
        image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 4,
        title: "Maceta con buen drenaje",
        summary: "Evita que la raíz se pudra.",
        details: "Siempre usa macetas con orificios en la parte inferior. Si el agua no puede salir, se estanca y la raíz se puede pudrir rápidamente.",
        image: "https://images.unsplash.com/photo-1598512752271-33f913a5af13?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 5,
        title: "Espacio para crecer",
        summary: "La raíz necesita expandirse.",
        details: "Si la maceta es muy pequeña, las raíces se enredan y el crecimiento se detiene. La raíz necesita espacio suficiente para expandirse y buscar nutrientes.",
        image: "https://images.unsplash.com/photo-1591035904573-0979cb73729e?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 6,
        title: "¿Mejoran tus raíces?",
        summary: "Resultados reales que puedes ver.",
        details: "Signos de mejora: La planta crece constante, hojas firmes y verdes, no se marchita fácil, se recupera rápido tras el riego, raíces blancas al trasplantar y mejor agarre en la maceta.",
        image: "https://images.unsplash.com/photo-1599598425947-32009226de0d?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 7,
        title: "La regla de oro",
        summary: "Lo que no se ve importa.",
        details: "“Lo que no se ve es lo que más importa. Una raíz fuerte hace una planta fuerte.”",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop"
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
                        aria-label="Cerrar recomendación"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                        <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                            <SproutIcon className="h-3 w-3" /> Recomendación
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
