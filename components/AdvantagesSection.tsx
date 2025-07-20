
import React from 'react';
import Card from './Card';
import { SproutIcon, TomatoIcon, ShieldCheckIcon, UserIcon } from './icons/Icons';

const AdvantagesSection: React.FC = () => {
  const advantages = [
    {
      icon: <SproutIcon className="h-10 w-10 text-lime-600" />,
      title: "Crecimiento Vigoroso",
      description: "Estimula el desarrollo de raíces fuertes y un crecimiento saludable en todo tipo de plantas, desde flores hasta hortalizas."
    },
    {
      icon: <TomatoIcon className="h-10 w-10 text-red-600" />,
      title: "Mejores Cosechas",
      description: "Aumenta el rendimiento y mejora el sabor y valor nutricional de tus frutas y verduras cultivadas en casa."
    },
    {
      icon: <ShieldCheckIcon className="h-10 w-10 text-indigo-600" />,
      title: "Defensa Natural",
      description: "Fortalece las plantas, haciéndolas más resistentes a plagas y enfermedades comunes de forma completamente orgánica."
    },
    {
      icon: <UserIcon className="h-10 w-10 text-emerald-600" />,
      title: "Sustituto de Fertilizantes",
      description: "Elimina la necesidad de usar fertilizantes químicos, ahorrándote dinero y protegiendo a tu familia y mascotas."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-stone-50">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Utilidades para tu Jardín</h2>
        <p className="max-w-2xl mx-auto text-stone-600 mb-12">
          Integra nuestra emulsión en tu rutina de jardinería y observa la diferencia que puede hacer la nutrición de calidad.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => (
            <Card key={index} icon={advantage.icon} title={advantage.title} description={advantage.description} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
