
import React, { useState } from 'react';
import { PhIcon, BeakerIcon, CheckCircleIcon, XIcon, SproutIcon } from './icons/Icons';

const PhInfoSection: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            title: "Paso 1: Muestreo",
            desc: "Toma una pequeña muestra de tierra (aprox. una cucharada) de la zona de las raíces, a unos 5-10 cm de profundidad.",
            icon: <SproutIcon className="h-8 w-8 text-amber-700" />
        },
        {
            title: "Paso 2: Disolución",
            desc: "Mezcla la tierra con agua destilada (o de garrafón) en un vaso limpio. La proporción ideal es 1 parte de tierra por 2 de agua.",
            icon: <BeakerIcon className="h-8 w-8 text-blue-500" />
        },
        {
            title: "Paso 3: Medición",
            desc: "Sumerge la tira reactiva de 'Suelo Urbano' en la mezcla durante 3 segundos y retírala. Sacude suavemente el exceso de agua.",
            icon: <div className="h-8 w-2 bg-gradient-to-b from-red-500 via-yellow-400 to-green-500 rounded-sm border border-stone-300"></div>
        },
        {
            title: "Paso 4: Interpretación",
            desc: "Espera 1 minuto y compara el color de la tira con nuestra tabla de referencia para conocer la salud de tu suelo.",
            icon: <PhIcon className="h-8 w-8 text-purple-600" />
        }
    ];

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-800">
            <div className="container mx-auto px-6">
                
                {/* Encabezado */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 dark:text-stone-100">
                        El Secreto Invisible: <span className="text-purple-600">El pH del Suelo</span>
                    </h2>
                    <p className="max-w-3xl mx-auto text-stone-600 dark:text-stone-300">
                        ¿Sabías que tu planta puede estar "muriendo de hambre" aunque le des fertilizante? Si el pH no es el correcto, las raíces no pueden absorber los nutrientes.
                    </p>
                </div>

                {/* Sección Educativa: Datos Interesantes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 dark:bg-stone-800 dark:border-stone-600 hover:-translate-y-1 transition-transform">
                        <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 dark:bg-blue-900/30">
                            <PhIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 mb-2 dark:text-stone-100">¿Qué es el pH?</h3>
                        <p className="text-stone-600 text-sm dark:text-stone-300">
                            Es una medida de acidez o alcalinidad. Va del 0 al 14. La mayoría de las plantas aman el punto medio (entre 5.5 y 7.0).
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-yellow-500 dark:bg-stone-800 dark:border-stone-600 hover:-translate-y-1 transition-transform">
                        <div className="bg-yellow-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 dark:bg-yellow-900/30">
                            <XIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 mb-2 dark:text-stone-100">El Bloqueo de Nutrientes</h3>
                        <p className="text-stone-600 text-sm dark:text-stone-300">
                            Si el suelo es muy ácido o muy alcalino, nutrientes como el Hierro o el Calcio se "bloquean" químicamente y la planta no puede comerlos.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500 dark:bg-stone-800 dark:border-stone-600 hover:-translate-y-1 transition-transform">
                        <div className="bg-green-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 dark:bg-green-900/30">
                            <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 mb-2 dark:text-stone-100">La Solución Suelo Urbano</h3>
                        <p className="text-stone-600 text-sm dark:text-stone-300">
                            Nuestra emulsión ayuda a tamponar (regular) el pH del suelo naturalmente, creando el ambiente perfecto para la absorción.
                        </p>
                    </div>
                </div>

                {/* Sección Interactiva: Guía de Uso de Tiras */}
                <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-700">
                    <div className="bg-stone-900 p-6 text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">¿Cómo medir el pH en casa?</h3>
                        <p className="text-stone-300 text-sm">Guía rápida con las Tiras Reactivas Suelo Urbano</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Lista de Pasos */}
                        <div className="p-8 space-y-6">
                            {steps.map((step, index) => (
                                <div 
                                    key={index}
                                    className={`flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer ${activeStep === index ? 'bg-purple-50 border-l-4 border-purple-500 shadow-sm dark:bg-purple-900/20 dark:border-purple-400' : 'hover:bg-stone-50 dark:hover:bg-stone-700/50'}`}
                                    onClick={() => setActiveStep(index)}
                                >
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm flex-shrink-0 ${activeStep === index ? 'bg-purple-600 text-white' : 'bg-stone-200 text-stone-500 dark:bg-stone-600 dark:text-stone-300'}`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${activeStep === index ? 'text-purple-700 dark:text-purple-300' : 'text-stone-700 dark:text-stone-300'}`}>{step.title}</h4>
                                        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Visualizador Dinámico */}
                        <div className="bg-stone-100 dark:bg-stone-900 p-8 flex flex-col items-center justify-center border-l border-stone-200 dark:border-stone-700">
                            <div className="w-48 h-48 bg-white dark:bg-stone-800 rounded-full flex items-center justify-center shadow-inner mb-6 relative overflow-hidden">
                                <div className={`transition-all duration-500 transform ${activeStep === 0 ? 'scale-100 opacity-100' : 'scale-90 opacity-0 absolute'}`}>
                                    <SproutIcon className="h-24 w-24 text-amber-700" />
                                </div>
                                <div className={`transition-all duration-500 transform ${activeStep === 1 ? 'scale-100 opacity-100' : 'scale-90 opacity-0 absolute'}`}>
                                    <BeakerIcon className="h-24 w-24 text-blue-500" />
                                </div>
                                <div className={`transition-all duration-500 transform ${activeStep === 2 ? 'scale-100 opacity-100' : 'scale-90 opacity-0 absolute'}`}>
                                    <div className="h-32 w-8 bg-gradient-to-b from-red-500 via-yellow-400 to-green-500 rounded-md border border-stone-300 shadow-md transform rotate-12"></div>
                                </div>
                                <div className={`transition-all duration-500 transform ${activeStep === 3 ? 'scale-100 opacity-100' : 'scale-90 opacity-0 absolute'}`}>
                                    <PhIcon className="h-24 w-24 text-purple-600" />
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <p className="text-stone-500 text-sm uppercase tracking-widest font-bold mb-2 dark:text-stone-400">Paso {activeStep + 1} de 4</p>
                                <div className="flex gap-2 justify-center">
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i === activeStep ? 'bg-purple-600' : 'bg-stone-300 dark:bg-stone-600'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Referencia Rápida */}
                    <div className="bg-stone-50 dark:bg-stone-900/50 p-6 border-t border-stone-200 dark:border-stone-700">
                        <h4 className="text-center font-bold text-stone-700 mb-4 dark:text-stone-300">Interpretación Rápida</h4>
                        <div className="flex justify-between items-center text-xs font-bold text-white text-center rounded-lg overflow-hidden h-8">
                            <div className="bg-red-500 flex-1 h-full flex items-center justify-center">Ácido (4)</div>
                            <div className="bg-orange-400 flex-1 h-full flex items-center justify-center">5</div>
                            <div className="bg-yellow-400 flex-1 h-full flex items-center justify-center text-stone-800">Ideal (6-7)</div>
                            <div className="bg-green-500 flex-1 h-full flex items-center justify-center">8</div>
                            <div className="bg-blue-600 flex-1 h-full flex items-center justify-center">Alcalino (9)</div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default PhInfoSection;
