
import React, { useState } from 'react';
import { VegetableIcon, FlowerIcon, MedicinalIcon, ShrubIcon, SaplingIcon, CactusIcon, RoseIcon, CaretDownIcon } from './icons/Icons';

const plantData = [
  {
    icon: <VegetableIcon className="h-10 w-10 text-green-600" />,
    type: "Comestible",
    examples: "(ej: albahaca, espinaca)",
    location: "Maceta o huerto",
    size: "20–40 cm",
    water: "150–300 ml",
    frequency: "Cada 1–2 días (si hace calor)"
  },
  {
    icon: <FlowerIcon className="h-10 w-10 text-pink-500" />,
    type: "Ornamental",
    examples: "(ej: geranios, petunias)",
    location: "Jardín o maceta",
    size: "30–60 cm",
    water: "250–500 ml",
    frequency: "2–3 veces por semana"
  },
  {
    icon: <MedicinalIcon className="h-10 w-10 text-teal-500" />,
    type: "Medicinal",
    examples: "(ej: sábila, romero)",
    location: "Maceta o suelo",
    size: "20–60 cm",
    water: "100–400 ml",
    frequency: "1–2 veces por semana"
  },
  {
    icon: <ShrubIcon className="h-10 w-10 text-purple-500" />,
    type: "Arbusto",
    examples: "(ej: bugambilia, lavanda)",
    location: "Jardín",
    size: "50 cm – 1.5 m",
    water: "1–2 litros",
    frequency: "1–2 veces por semana"
  },
  {
    icon: <SaplingIcon className="h-10 w-10 text-yellow-600" />,
    type: "Árbol joven",
    examples: "(ej: limón, guayaba)",
    location: "Suelo directo",
    size: "1–2 metros",
    water: "5–10 litros",
    frequency: "1 vez por semana"
  },
  {
    icon: <CactusIcon className="h-10 w-10 text-emerald-600" />,
    type: "Planta de maceta",
    examples: "(interior o terraza)",
    location: "Maceta 15-25 cm",
    size: "Pequeña (15–30 cm)",
    water: "100–250 ml",
    frequency: "Cada 3–7 días, según clima"
  },
  {
    icon: <RoseIcon className="h-10 w-10 text-red-500" />,
    type: "Planta de jardín",
    examples: "(ej: rosales)",
    location: "Jardín",
    size: "40–80 cm",
    water: "500 ml – 1.5 litros",
    frequency: "Cada 2–4 días"
  }
];

const WateringGuideSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Guía de Riego por Tipo de Planta</h2>
          <p className="max-w-3xl mx-auto text-stone-600">
            Cada planta es única. Usa esta guía como punto de partida y ajusta el riego según las necesidades específicas de tu jardín.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-4">
            {plantData.map((plant, index) => (
                <div key={index} className="border border-stone-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                    <button 
                        onClick={() => handleToggle(index)}
                        className="w-full flex items-center justify-between p-5 text-left bg-stone-50 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        aria-expanded={openIndex === index}
                        aria-controls={`plant-details-${index}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">{plant.icon}</div>
                            <div>
                                <h3 className="text-lg font-semibold text-stone-800">{plant.type}</h3>
                                <p className="text-sm text-stone-500">{plant.examples}</p>
                            </div>
                        </div>
                        <CaretDownIcon className={`h-6 w-6 text-stone-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                        id={`plant-details-${index}`}
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}
                    >
                        <div className="p-6 bg-white border-t border-stone-200">
                            <ul className="space-y-3 text-stone-700">
                                <li className="flex justify-between items-center">
                                    <span className="font-semibold">Ubicación:</span>
                                    <span className="text-right">{plant.location}</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="font-semibold">Tamaño (ejemplo):</span>
                                    <span className="text-right">{plant.size}</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="font-semibold">Cantidad de agua:</span>
                                    <span className="text-right">{plant.water}</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="font-semibold">Frecuencia:</span>
                                    <span className="text-right">{plant.frequency}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </section>
  );
};

export default WateringGuideSection;
