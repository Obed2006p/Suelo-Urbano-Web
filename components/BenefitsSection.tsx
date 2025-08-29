
import React from 'react';
import Card from './Card';
import { PlanetIcon, RecycleIcon, WaterDropIcon, WormIcon } from './icons/Icons';

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: <RecycleIcon className="h-10 w-10 text-green-600" />,
      title: "Reduce Residuos",
      description: "Disminuye la cantidad de desechos orgánicos que terminan en los vertederos, reduciendo la emisión de gases de efecto invernadero."
    },
    {
      icon: <WormIcon className="h-10 w-10 text-amber-800" />,
      title: "Enriquece el Suelo",
      description: "Aporta nutrientes esenciales de forma natural, mejorando la fertilidad y la vida microbiana del suelo sin químicos sintéticos."
    },
    {
      icon: <WaterDropIcon className="h-10 w-10 text-blue-500" />,
      title: "Conserva Agua",
      description: "Mejora la capacidad de retención de humedad del suelo, reduciendo la necesidad de riego frecuente y conservando este vital recurso."
    },
    {
      icon: <PlanetIcon className="h-10 w-10 text-teal-600" />,
      title: "Combate la Erosión",
      description: "Ayuda a mantener la estructura del suelo, previniendo la erosión causada por el viento y la lluvia, protegiendo la capa fértil."
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 dark:text-stone-100">Beneficios para el Planeta</h2>
        <p className="max-w-2xl mx-auto text-stone-600 mb-12 dark:text-stone-300">
          Usar emulsión no solo transforma tu jardín, sino que también es un paso poderoso hacia un futuro más sostenible.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} icon={benefit.icon} title={benefit.title} description={benefit.description} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;