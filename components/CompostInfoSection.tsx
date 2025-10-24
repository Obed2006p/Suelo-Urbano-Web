import React, { useState } from 'react';
import { LeafIcon, CheckCircleIcon, XIcon, SunIcon, SparklesIcon, CalendarIcon, ChevronDownIcon } from './icons/Icons';

// Subcomponente para los bloques de información
const InfoBlock: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="bg-white/50 dark:bg-stone-800/40 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">{title}</h3>
        </div>
        <div className="text-stone-600 dark:text-stone-300 space-y-3 text-justify">{children}</div>
    </div>
);

// Subcomponente para el acordeón
const AccordionItem: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onClick: () => void; }> = ({ title, children, isOpen, onClick }) => (
    <div className="border-b border-stone-200 dark:border-stone-600">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
            aria-expanded={isOpen}
        >
            <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-200">{title}</h3>
            <ChevronDownIcon className={`w-6 h-6 text-stone-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
                <div className="pb-4 pt-2 text-stone-600 dark:text-stone-300 space-y-3 text-justify">{children}</div>
            </div>
        </div>
    </div>
);

const CompostInfoSection: React.FC = () => {
    const [openAccordion, setOpenAccordion] = useState<number | null>(0);

    const handleAccordionToggle = (index: number) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    return (
        <section className="py-12 md:py-24 bg-lime-50 dark:bg-stone-800/30">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 dark:text-green-300">Composta 100% Natural</h2>
                    <p className="max-w-3xl mx-auto text-stone-600 mt-4 dark:text-stone-300">
                        Cuidado natural para tus plantas: orgánica, segura y eficaz durante todo el año. Aprende a nutrir de forma inteligente para fortalecer tus plantas y evitar plagas.
                    </p>
                </div>

                {/* --- Tarjeta Principal --- */}
                <div className="mt-12 max-w-4xl mx-auto bg-white dark:bg-stone-800 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                    <div className="p-8">
                        <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">Beneficios Principales</h3>
                        <ul className="space-y-3">
                            {['Aporta nutrientes naturales sin químicos.', 'Mejora la aireación y retención de agua.', 'Estimula raíces y mejora la floración.', 'Ideal para macetas, huertos y jardines.', '100% natural y biodegradable.'].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircleIcon className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-stone-700 dark:text-stone-300">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-6 text-sm font-semibold text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/50 p-3 rounded-md">
                            <strong>Úsala todo el año:</strong> segura para aplicar en cualquier temporada, solo ajustando la dosis.
                        </p>
                    </div>
                    <div className="bg-cover bg-center min-h-[250px] lg:min-h-full" style={{ backgroundImage: "url('https://res.cloudinary.com/dsmzpsool/image/upload/v1759714881/abono_natural_r7c75a.jpg')" }} role="img" aria-label="Mano sosteniendo abono natural fértil"></div>
                </div>

                {/* --- Guía de Nutrientes --- */}
                <div className="mt-16 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8 text-stone-800 dark:text-stone-100">Potencia tus Plantas con el Nutriente Adecuado</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white/80 dark:bg-stone-800 p-6 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 text-center">
                            <p className="text-4xl font-bold text-green-600 dark:text-green-400">N</p>
                            <p className="font-bold text-stone-800 dark:text-stone-100 mt-2">Nitrógeno</p>
                            <p className="text-stone-600 dark:text-stone-300 text-sm mt-1">Para un follaje denso y brillante en plantas de hoja verde.</p>
                        </div>
                        <div className="bg-white/80 dark:bg-stone-800 p-6 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 text-center">
                            <p className="text-4xl font-bold text-pink-600 dark:text-pink-400">P</p>
                            <p className="font-bold text-stone-800 dark:text-stone-100 mt-2">Fósforo</p>
                            <p className="text-stone-600 dark:text-stone-300 text-sm mt-1">Estimula raíces fuertes y flores abundantes y duraderas.</p>
                        </div>
                        <div className="bg-white/80 dark:bg-stone-800 p-6 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 text-center">
                            <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">K</p>
                            <p className="font-bold text-stone-800 dark:text-stone-100 mt-2">Potasio</p>
                            <p className="text-stone-600 dark:text-stone-300 text-sm mt-1">Fortalece la resistencia general de la planta contra enfermedades.</p>
                        </div>
                    </div>
                </div>

                {/* --- Acordeón de Información --- */}
                <div className="mt-16 max-w-4xl mx-auto">
                     <AccordionItem title="¿Cuándo y cómo debo abonar?" isOpen={openAccordion === 0} onClick={() => handleAccordionToggle(0)}>
                        <p>Primavera y verano son ideales, ya que las plantas crecen activamente. Aplica cada 15-30 días. En otoño, reduce la frecuencia para fortalecer raíces, y en invierno, úsala como capa superficial (mulch) para proteger del frío.</p>
                        <ol className="list-decimal list-inside space-y-2 pl-2">
                           <li>Remueve suavemente la capa superior del sustrato.</li>
                           <li>Coloca una capa delgada de abono (1–2 cm en macetas).</li>
                           <li>Riega ligeramente para que los nutrientes lleguen a las raíces.</li>
                        </ol>
                    </AccordionItem>
                    <AccordionItem title="Errores Frecuentes al Abonar" isOpen={openAccordion === 1} onClick={() => handleAccordionToggle(1)}>
                         <ul className="space-y-2">
                             <li className="flex items-start gap-2"><XIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0"/>Abonar por costumbre y no por necesidad real.</li>
                             <li className="flex items-start gap-2"><XIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0"/>Aplicar fertilizante a plantas recién trasplantadas (espera unas semanas).</li>
                             <li className="flex items-start gap-2"><XIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0"/>Hacerlo con el sustrato completamente seco o bajo sol intenso.</li>
                             <li className="flex items-start gap-2"><XIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0"/>No respetar los periodos de reposo invernal de las plantas.</li>
                         </ul>
                         <p className="text-sm italic pt-2"><strong>Consejo:</strong> Si crees que te excediste, riega abundantemente para drenar el exceso de nutrientes.</p>
                    </AccordionItem>
                     <AccordionItem title="¿Cómo sé si mi planta necesita abono?" isOpen={openAccordion === 2} onClick={() => handleAccordionToggle(2)}>
                        <ul className="space-y-2">
                           <li><strong className="text-yellow-600 dark:text-yellow-400">Hojas pálidas o amarillas:</strong> Puede indicar falta de nutrientes.</li>
                           <li><strong className="text-amber-700 dark:text-amber-500">Bordes secos o manchas:</strong> Podría ser exceso de abono o acumulación de sales.</li>
                           <li><strong className="text-stone-500 dark:text-stone-400">Crecimiento lento o nulo:</strong> El suelo podría estar agotado.</li>
                        </ul>
                    </AccordionItem>
                </div>

                {/* --- CTA Final --- */}
                <div className="mt-16 max-w-4xl mx-auto text-center bg-green-700 text-white p-8 rounded-2xl shadow-xl">
                    <h3 className="text-2xl font-bold">Disponible todo el año</h3>
                    <p className="mt-2 text-green-200 max-w-2xl mx-auto">Nuestra composta natural nutre, protege y mejora tu suelo durante todas las estaciones. Perfecta para macetas, jardines y huertos urbanos.</p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                         <a href="https://wa.me/523141555988" target="_blank" rel="noopener noreferrer" className="bg-white text-green-700 font-bold py-3 px-6 rounded-full hover:bg-green-100 transition-transform duration-300 transform hover:scale-105 shadow-md">
                            Pedir por WhatsApp
                        </a>
                        <a href="#/pedido" onClick={(e) => { e.preventDefault(); window.location.hash = '#/pedido'; }} className="bg-transparent text-white font-bold py-3 px-6 rounded-full border-2 border-white hover:bg-white/20 transition-transform duration-300 transform hover:scale-105">
                            Ver Opciones de Pedido
                        </a>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default CompostInfoSection;