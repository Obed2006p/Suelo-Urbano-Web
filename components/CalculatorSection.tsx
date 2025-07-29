
import React, { useState } from 'react';
import { CalculatorIcon } from './icons/Icons';

interface CalculatorSectionProps {
    onNavigate: (id: string) => void;
}

const GRAMS_PER_SMALL_POT = 15;
const GRAMS_PER_MEDIUM_POT = 45;
const GRAMS_PER_LARGE_POT = 90;
const GRAMS_PER_SQ_METER = 150;
const BAG_SIZE_GRAMS = 300;

const CalculatorSection: React.FC<CalculatorSectionProps> = ({ onNavigate }) => {
    const [mode, setMode] = useState<'pots' | 'area'>('pots');
    const [inputs, setInputs] = useState({ smallPots: 0, mediumPots: 0, largePots: 0, area: 0 });
    const [result, setResult] = useState<{ grams: number; bags: number } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: Math.max(0, parseInt(value, 10) || 0) }));
    };

    const handleCalculate = () => {
        let totalGrams = 0;
        if (mode === 'pots') {
            totalGrams = 
                (inputs.smallPots * GRAMS_PER_SMALL_POT) +
                (inputs.mediumPots * GRAMS_PER_MEDIUM_POT) +
                (inputs.largePots * GRAMS_PER_LARGE_POT);
        } else {
            totalGrams = inputs.area * GRAMS_PER_SQ_METER;
        }

        if (totalGrams > 0) {
            const bagsNeeded = Math.ceil(totalGrams / BAG_SIZE_GRAMS);
            setResult({ grams: totalGrams, bags: bagsNeeded });
        } else {
            setResult(null);
        }
    };
    
    const handleReset = () => {
        setInputs({ smallPots: 0, mediumPots: 0, largePots: 0, area: 0 });
        setResult(null);
    }

    const renderPotCalculator = () => (
        <div className="space-y-4 animate-fade-in-up">
            <p className="text-stone-600">Indica cuántas macetas de cada tamaño tienes.</p>
            <div>
                <label htmlFor="smallPots" className="block text-sm font-medium text-stone-700 mb-1">Macetas Chicas (hasta 20cm)</label>
                <input type="number" name="smallPots" id="smallPots" value={inputs.smallPots || ''} onChange={handleInputChange} min="0" className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800"/>
            </div>
            <div>
                <label htmlFor="mediumPots" className="block text-sm font-medium text-stone-700 mb-1">Macetas Medianas (20-40cm)</label>
                <input type="number" name="mediumPots" id="mediumPots" value={inputs.mediumPots || ''} onChange={handleInputChange} min="0" className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800"/>
            </div>
            <div>
                <label htmlFor="largePots" className="block text-sm font-medium text-stone-700 mb-1">Macetas Grandes (+40cm)</label>
                <input type="number" name="largePots" id="largePots" value={inputs.largePots || ''} onChange={handleInputChange} min="0" className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800"/>
            </div>
        </div>
    );
    
    const renderAreaCalculator = () => (
        <div className="space-y-4 animate-fade-in-up">
            <p className="text-stone-600">Ingresa el área total de tu jardín o huerto.</p>
            <div>
                <label htmlFor="area" className="block text-sm font-medium text-stone-700 mb-1">Área en metros cuadrados (m²)</label>
                <input type="number" name="area" id="area" value={inputs.area || ''} onChange={handleInputChange} min="0" className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800"/>
            </div>
        </div>
    );


    return (
        <section className="py-16 md:py-24 bg-stone-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Calculadora de Dosis</h2>
                    <p className="max-w-3xl mx-auto text-stone-600">
                        ¿No sabes cuánta emulsión necesitas? Usa nuestra calculadora para obtener una estimación precisa.
                    </p>
                </div>
                
                <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Calculator Inputs */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-stone-200">
                        <div className="flex border-b border-stone-200 mb-6">
                            <button
                                onClick={() => setMode('pots')}
                                className={`flex-1 py-2 text-center font-semibold transition-colors duration-300 ${mode === 'pots' ? 'text-green-700 border-b-2 border-green-700' : 'text-stone-500 hover:text-green-600'}`}
                            >
                                Por Macetas
                            </button>
                            <button
                                onClick={() => setMode('area')}
                                className={`flex-1 py-2 text-center font-semibold transition-colors duration-300 ${mode === 'area' ? 'text-green-700 border-b-2 border-green-700' : 'text-stone-500 hover:text-green-600'}`}
                            >
                                Por Área de Jardín
                            </button>
                        </div>
                        
                        {mode === 'pots' ? renderPotCalculator() : renderAreaCalculator()}
                        
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleCalculate}
                                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                            >
                                Calcular
                            </button>
                             <button
                                onClick={handleReset}
                                className="w-auto bg-stone-200 text-stone-700 font-bold py-3 px-6 rounded-lg hover:bg-stone-300 transition-colors"
                                aria-label="Reiniciar calculadora"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>

                    {/* Calculator Results */}
                    <div className="bg-green-50 border-2 border-dashed border-green-300 p-8 rounded-2xl h-full flex flex-col items-center justify-center text-center">
                        {result ? (
                             <div className="animate-fade-in-up w-full">
                                <h3 className="text-xl font-bold text-green-800 mb-2">Resultado Estimado</h3>
                                <p className="text-stone-700 mb-4">Para una aplicación, necesitas aproximadamente:</p>
                                <p className="text-4xl font-extrabold text-green-700 mb-2">{result.grams.toLocaleString()} gramos</p>
                                <div className="bg-green-200 text-green-900 font-bold py-2 px-4 rounded-full inline-block mb-6">
                                    Recomendamos {result.bags} bolsa{result.bags > 1 ? 's' : ''} de 300gr
                                </div>
                                <button
                                    onClick={() => onNavigate('pedidos')}
                                    className="w-full bg-yellow-400 text-yellow-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-500 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
                                >
                                    ¡Hacer mi Pedido!
                                </button>
                            </div>
                        ) : (
                            <div className="text-stone-500">
                                <CalculatorIcon className="h-16 w-16 mx-auto mb-4 text-stone-400"/>
                                <h3 className="text-lg font-semibold">Tu resultado aparecerá aquí</h3>
                                <p className="text-sm">Completa los datos y haz clic en "Calcular".</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CalculatorSection;
