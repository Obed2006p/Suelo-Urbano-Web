
import * as React from 'react';
import { LeafIcon, CelebrationIcon } from './icons/Icons';

interface TourStep {
    selector: string;
    title: string;
    content: string;
    route: string;
}

interface TourGuideProps {
    isActive: boolean;
    step: TourStep;
    stepIndex: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
    onFinish: () => void;
}

const TourGuide: React.FC<TourGuideProps> = ({ isActive, step, stepIndex, totalSteps, onNext, onPrev, onFinish }) => {
    const [highlightStyle, setHighlightStyle] = React.useState<React.CSSProperties>({ opacity: 0, top: '-9999px', left: '-9999px' });
    const [popoverStyle, setPopoverStyle] = React.useState<React.CSSProperties>({ opacity: 0, top: '-9999px', left: '-9999px' });
    const [isComplete, setIsComplete] = React.useState(false);

    const handleCloseTour = () => {
        setIsComplete(false);
        onFinish();
    }

    React.useEffect(() => {
        if (!isActive || !step || isComplete) {
            setHighlightStyle(prev => ({ ...prev, opacity: 0, pointerEvents: 'none' }));
            setPopoverStyle(prev => ({ ...prev, opacity: 0, pointerEvents: 'none' }));
            return;
        }

        const timer = setTimeout(() => {
            const element = document.querySelector(step.selector);
            
            if (element) {
                const rect = element.getBoundingClientRect();
                const PADDING = 10;

                setHighlightStyle({
                    width: `${rect.width + PADDING}px`,
                    height: `${rect.height + PADDING}px`,
                    top: `${rect.top - PADDING / 2}px`,
                    left: `${rect.left - PADDING / 2}px`,
                    opacity: 1,
                    pointerEvents: 'auto',
                });
                
                let popoverTop = rect.bottom + PADDING;
                let popoverLeft = rect.left;
                const popoverHeight = 180; // Estimated popover height
                const popoverWidth = 320; // Popover width

                if (popoverTop + popoverHeight > window.innerHeight) {
                    popoverTop = rect.top - popoverHeight - PADDING;
                }
                
                if (popoverLeft + popoverWidth > window.innerWidth) {
                    popoverLeft = window.innerWidth - popoverWidth - PADDING;
                }
                if (popoverLeft < PADDING) {
                    popoverLeft = PADDING;
                }

                setPopoverStyle({
                    top: `${popoverTop < PADDING ? PADDING : popoverTop}px`,
                    left: `${popoverLeft}px`,
                    opacity: 1,
                    pointerEvents: 'auto',
                });

            } else {
                 setHighlightStyle(prev => ({ ...prev, opacity: 0, pointerEvents: 'none' }));
                 setPopoverStyle(prev => ({ ...prev, opacity: 0, pointerEvents: 'none' }));
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [isActive, step, isComplete]);
    
    if (!isActive) return null;

    if (isComplete) {
        return (
            <div 
                className="fixed inset-0 z-[210] bg-black/60 flex items-center justify-center p-4 animate-fade-in-main"
                onClick={handleCloseTour}
            >
                <div 
                    className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all animate-scale-in"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >
                    <CelebrationIcon className="h-16 w-16 mx-auto text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4">¡Tour Completado!</h2>
                    <p className="text-stone-600 dark:text-stone-300 mb-8">
                        ¡Todo listo! Ahora estás preparado para explorar todo lo que Suelo Urbano tiene para ofrecer.
                    </p>
                    <button
                        onClick={handleCloseTour}
                        className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
                    >
                        Explorar Ahora
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200]">
            <div 
                className="absolute inset-0 bg-black/50 transition-opacity duration-300" 
                onClick={onFinish}
            />

            <div
                className="absolute bg-transparent rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-500 ease-in-out"
                style={highlightStyle}
            />

            <div
                className="fixed bg-white text-stone-800 rounded-lg shadow-2xl p-6 w-80 transition-all duration-300 dark:bg-stone-800 dark:text-stone-100"
                style={popoverStyle}
                role="dialog"
                aria-modal="true"
                aria-labelledby="tour-title"
            >
                <h3 id="tour-title" className="flex items-center gap-2 text-lg font-bold mb-2 text-green-800 dark:text-green-300">
                    <LeafIcon className="h-5 w-5" />
                    {step?.title || 'Cargando...'}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">{step?.content || ''}</p>
                
                <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">{stepIndex + 1} / {totalSteps}</span>
                    <div className="flex gap-2">
                        {stepIndex > 0 && (
                             <button onClick={onPrev} className="text-sm font-semibold text-stone-600 hover:text-stone-900 py-1 px-3 dark:text-stone-300 dark:hover:text-stone-100">
                                Anterior
                            </button>
                        )}
                        {stepIndex < totalSteps - 1 ? (
                            <button onClick={onNext} className="bg-green-600 text-white font-bold py-1 px-4 rounded-full text-sm hover:bg-green-700 transition-colors">
                                Siguiente
                            </button>
                        ) : (
                             <button onClick={() => setIsComplete(true)} className="bg-green-600 text-white font-bold py-1 px-4 rounded-full text-sm hover:bg-green-700 transition-colors">
                                Finalizar
                            </button>
                        )}
                    </div>
                </div>
                 <button onClick={onFinish} className="absolute top-2 right-2 text-stone-400 hover:text-stone-600 p-1 rounded-full dark:hover:text-stone-200" aria-label="Cerrar tour">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
            </div>
        </div>
    );
};

export default TourGuide;