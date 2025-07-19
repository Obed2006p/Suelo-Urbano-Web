
import React from 'react';
import Card from './Card';
import { CalendarIcon, BeakerIcon, SpoonIcon, WateringCanIcon } from './icons/Icons';

const usageSteps = [
  {
    icon: <SpoonIcon className="h-10 w-10 text-cyan-600" />,
    title: "1. Dosificación",
    description: "Para una regadera de 10 litros, utiliza 300 gramos (aprox. una taza) de nuestra emulsión. Ajusta la cantidad según necesites."
  },
  {
    icon: <BeakerIcon className="h-10 w-10 text-purple-600" />,
    title: "2. Mezcla",
    description: "Agrega la emulsión al agua y remueve bien hasta que se disuelva, creando un 'té' nutritivo y oscuro para tus plantas."
  },
  {
    icon: <WateringCanIcon className="h-10 w-10 text-blue-600" />,
    title: "3. Aplicación",
    description: "Riega directamente sobre la tierra en la base de las plantas, cubriendo la zona de las raíces. Evita mojar el follaje."
  },
  {
    icon: <CalendarIcon className="h-10 w-10 text-orange-600" />,
    title: "4. Frecuencia",
    description: "Aplica esta mezcla nutritiva cada 2 a 4 semanas durante la temporada de crecimiento para obtener los mejores resultados."
  }
];

const UsageSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-stone-50">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Modo de Empleo</h2>
        <p className="max-w-3xl mx-auto text-stone-600 mb-12">
          Sigue estos sencillos pasos para aprovechar al máximo el poder de nuestra emulsión y darle a tu jardín la nutrición que merece.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {usageSteps.map((step, index) => (
            <Card key={index} icon={step.icon} title={step.title} description={step.description} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default UsageSection;
