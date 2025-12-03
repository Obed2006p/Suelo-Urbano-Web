
import React from 'react';
import { LeafIcon, FlowerIcon, ShrubIcon, RoseIcon, WaterDropIcon, SunIcon, BeakerIcon, SpoonIcon, CalendarIcon, XIcon } from './icons/Icons';

interface CareCardProps {
    title: string;
    icon: React.ReactNode;
    colorClass: string;
    problems: string[];
    watering: string;
    ph: string;
    nutrients: string;
    dose: string;
    frequency?: string;
    preparation?: string;
}

const CareCard: React.FC<CareCardProps> = ({ title, icon, colorClass, problems, watering, ph, nutrients, dose, frequency, preparation }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-stone-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 dark:bg-stone-800 dark:border-stone-700 flex flex-col h-full">
        <div className={`p-4 ${colorClass} flex items-center gap-3`}>
            <div className="p-2 bg-white/80 rounded-full shadow-sm dark:bg-stone-800/50">
                {icon}
            </div>
            <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100">{title}</h3>
        </div>
        <div className="p-6 space-y-4 flex-grow text-left">
            {/* Problemas */}
            <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Problemas Comunes</h4>
                <ul className="space-y-1">
                    {problems.map((prob, i) => (
                        <li key={i} className="text-sm text-stone-600 dark:text-stone-300 flex items-start gap-2">
                            <XIcon className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>{prob}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="border-t border-stone-100 dark:border-stone-700 pt-4 space-y-3">
                {/* Riego */}
                <div className="flex items-start gap-3">
                    <WaterDropIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div>
                        <span className="block text-xs font-bold text-stone-500 dark:text-stone-400">Riego</span>
                        <p className="text-sm text-stone-700 dark:text-stone-200">{watering}</p>
                    </div>
                </div>
                {/* pH */}
                <div className="flex items-start gap-3">
                    <BeakerIcon className="h-5 w-5 text-purple-500 flex-shrink-0" />
                    <div>
                        <span className="block text-xs font-bold text-stone-500 dark:text-stone-400">pH Ideal</span>
                        <p className="text-sm text-stone-700 dark:text-stone-200">{ph}</p>
                    </div>
                </div>
                {/* Nutrientes */}
                <div className="flex items-start gap-3">
                    <SunIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <div>
                        <span className="block text-xs font-bold text-stone-500 dark:text-stone-400">Nutrientes Clave</span>
                        <p className="text-sm text-stone-700 dark:text-stone-200">{nutrients}</p>
                    </div>
                </div>
            </div>

            {/* Producto Sugerido */}
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 mt-auto border border-green-100 dark:border-green-800">
                <h4 className="text-sm font-bold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                    <LeafIcon className="h-4 w-4" /> Uso de Suelo Urbano
                </h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                        <SpoonIcon className="h-4 w-4 text-stone-400" />
                        <span className="font-semibold">{dose}</span>
                    </div>
                    {frequency && (
                        <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                            <CalendarIcon className="h-4 w-4 text-stone-400" />
                            <span>{frequency}</span>
                        </div>
                    )}
                    {preparation && (
                        <p className="text-xs text-stone-500 italic mt-1 border-t border-green-200 pt-1 dark:border-green-800 dark:text-stone-400">
                            Nota: {preparation}
                        </p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const PlantCareGuideSection: React.FC = () => {
    const guides = [
        {
            title: "Plantas de Interior (Sombra)",
            icon: <LeafIcon className="h-6 w-6 text-emerald-600" />,
            colorClass: "bg-emerald-100 dark:bg-emerald-900",
            problems: ["Exceso de agua (Raíz podrida)", "Falta de luz (Hojas pálidas)", "Corrientes de aire", "Ambiente seco (Puntas secas)", "Plagas (Cochinilla)"],
            watering: "Cada 5-8 días. Revisar tierra seca arriba. No encharcar.",
            ph: "5.5 - 6.5 (Ligeramente ácido)",
            nutrients: "Nitrógeno suave, Potasio, Microorganismos.",
            dose: "½ a 1 cucharada por litro",
            preparation: "Reposar 8 hrs, colar.",
            frequency: "Cada 20 días"
        },
        {
            title: "Plantas de Exterior (Flor)",
            icon: <FlowerIcon className="h-6 w-6 text-pink-600" />,
            colorClass: "bg-pink-100 dark:bg-pink-900",
            problems: ["No florece (Exceso agua)", "Hojas amarillas (Mal drenaje)", "Pulgón y araña roja", "Mucho follaje sin flor"],
            watering: "Cada 5-7 días (2x/semana en calor). No encharcar.",
            ph: "6.0 - 7.0 (Neutro)",
            nutrients: "Fósforo (Floración), Potasio (Color), Poco nitrógeno.",
            dose: "1 cucharada por litro",
            frequency: "Cada 15 días (En floración)"
        },
        {
            title: "Plantas de Exterior (General)",
            icon: <ShrubIcon className="h-6 w-6 text-green-700" />,
            colorClass: "bg-green-100 dark:bg-green-900",
            problems: ["Hojas amarillas", "Tallos débiles", "Plagas (Mosca blanca)", "Exceso de sombra"],
            watering: "Cada 4-6 días. No dejar charcos.",
            ph: "7.0 - 7.5 (Neutro/Alcalino)",
            nutrients: "Potasio alto, Fósforo, Nitrógeno bajo.",
            dose: "1½ cucharadas por litro",
            frequency: "Cada 15 días"
        },
        {
            title: "Bulbos (Interior y Exterior)",
            icon: <RoseIcon className="h-6 w-6 text-purple-600" />,
            colorClass: "bg-purple-100 dark:bg-purple-900",
            problems: ["Pudrición del bulbo", "Falta de floración", "Hongos (Humedad)", "Hojas amarillas"],
            watering: "Cada 5-7 días. NO mojar el bulbo.",
            ph: "6.0 - 7.0 (Neutro)",
            nutrients: "Fósforo, Potasio, Nitrógeno moderado.",
            dose: "1 cucharada por litro",
            frequency: "Cada 8 a 15 días"
        },
        {
            title: "Helechos / Sombra Alta",
            icon: <LeafIcon className="h-6 w-6 text-teal-600" />,
            colorClass: "bg-teal-100 dark:bg-teal-900",
            problems: ["Puntas secas", "Hojas amarillas (Sol)", "Pudrición", "Falta de crecimiento"],
            watering: "Cada 3-5 días. Siempre húmedo, no encharcado.",
            ph: "5.0 - 6.0 (Ácido)",
            nutrients: "Nitrógeno suave, Materia orgánica, Microorganismos.",
            dose: "½ cucharada por litro"
        }
    ];

    return (
        <section className="py-16 md:py-24 bg-stone-50 dark:bg-stone-900/50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 dark:text-stone-100">Guía de Cuidados Específicos</h2>
                    <p className="max-w-3xl mx-auto text-stone-600 dark:text-stone-300">
                        Cada planta es un mundo. Encuentra aquí la receta perfecta de riego y nutrición para que tus plantas prosperen.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {guides.map((guide, index) => (
                        <CareCard key={index} {...guide} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PlantCareGuideSection;
