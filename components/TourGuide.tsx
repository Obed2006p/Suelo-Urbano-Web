
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
                
                if (rect.width === 0 || rect.height === 0) {
                    setHighlightStyle(prev => ({ ...prev, opacity: 0, pointerEvents: 'none' }));
                    setPopoverStyle(prev => ({ ...prev, opacity: 0, pointerEvents: 'none' }));
                    return;
                }

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
                const popoverHeight = 200; // Estimated popover height
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
        }, 400); // Increased timeout for animations

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
                    onClick={(e) => e.stopPropagation()}
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
                className="absolute bg-transparent rounded-lg shadow-[0_0_0_9999px_rgba(28,25,23,0.7)] transition-all duration-500 ease-in-out"
                style={highlightStyle}
                onClick={onFinish}
            />

            <div
                className="fixed bg-green-800 text-white rounded-xl shadow-2xl p-0 w-80 transition-all duration-300 overflow-hidden"
                style={popoverStyle}
                role="dialog"
                aria-modal="true"
                aria-labelledby="tour-title"
            >
                 <div className="bg-green-700 p-4">
                    <h3 id="tour-title" className="flex items-center gap-3 text-lg font-bold">
                        <LeafIcon className="h-6 w-6 text-green-200" />
                        <span>{step?.title || 'Cargando...'}</span>
                    </h3>
                </div>
                <div className="p-4">
                    <p className="text-sm text-green-200 mb-4 min-h-[40px]">{step?.content || ''}</p>
                    
                    <div className="flex justify-between items-center border-t border-green-700 pt-3 mt-3">
                        <span className="text-xs font-semibold text-green-300 bg-green-900/50 py-1 px-2 rounded">Paso {stepIndex + 1} de {totalSteps}</span>
                        <div className="flex gap-2 items-center">
                            {stepIndex > 0 && (
                                 <button onClick={onPrev} className="text-sm font-semibold text-green-200 hover:text-white py-1 px-3 rounded hover:bg-green-700/50 transition-colors">
                                    Anterior
                                </button>
                            )}
                            {stepIndex < totalSteps - 1 ? (
                                <button onClick={onNext} className="bg-white text-green-800 font-bold py-1 px-4 rounded-full text-sm hover:bg-green-100 transition-colors">
                                    Siguiente
                                </button>
                            ) : (
                                 <button onClick={() => setIsComplete(true)} className="bg-yellow-400 text-yellow-900 font-bold py-1 px-4 rounded-full text-sm hover:bg-yellow-300 transition-colors">
                                    Finalizar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                 <button onClick={onFinish} className="absolute top-3 right-3 text-green-300 hover:text-white p-1 rounded-full hover:bg-green-700/50 transition-colors" aria-label="Cerrar tour">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
            </div>
        </div>
    );
};

export default TourGuide;
