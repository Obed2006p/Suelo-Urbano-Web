
import * as React from 'react';
import { SparklesIcon } from './icons/Icons';

interface WelcomeTourModalProps {
    onStart: () => void;
    onSkip: () => void;
}

const WelcomeTourModal: React.FC<WelcomeTourModalProps> = ({ onStart, onSkip }) => {
    return (
        <div 
            className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4 animate-fade-in-main"
            aria-modal="true"
            role="dialog"
            aria-labelledby="welcome-modal-title"
        >
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all animate-fade-in-up">
                <SparklesIcon className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h2 id="welcome-modal-title" className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4">¡Bienvenido a Suelo Urbano!</h2>
                <p className="text-stone-600 dark:text-stone-300 mb-8">
                    "Holaa, bienvenido a la página de Suelo Urbano Tu Hogar, un lugar donde conocerás cómo la tecnología y las plantas se unen para mejorar su calidad de vida y la interacción entre cada una de ellas."
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={onStart}
                        className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
                    >
                        Iniciar Tour
                    </button>
                    <button
                        onClick={onSkip}
                        className="w-full bg-stone-200 text-stone-700 font-bold py-3 px-6 rounded-lg hover:bg-stone-300 transition-colors dark:bg-stone-600 dark:text-stone-200 dark:hover:bg-stone-500"
                    >
                        Omitir por ahora
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTourModal;