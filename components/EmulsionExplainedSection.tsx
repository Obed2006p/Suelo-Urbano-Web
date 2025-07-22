
import React from 'react';
import { CheckCircleIcon } from './icons/Icons';

const EmulsionExplainedSection: React.FC = () => {
  const features = [
    { text: 'Nutrientes de absorción inmediata para tus plantas.' },
    { text: 'Proceso 100% natural, libre de químicos sintéticos.' },
    { text: 'Inyecta vida y microorganismos benéficos al suelo.' },
  ];

  return (
    <section className="py-16 md:py-24 bg-stone-50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Columna de Texto */}
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-6">
              El Secreto de un Jardín Vibrante: <span className="text-green-700">Nuestra Emulsión</span>
            </h2>
            <p className="text-lg text-stone-600 mb-6 leading-relaxed">
              Es un <strong className="text-green-800 font-semibold">superalimento líquido</strong> para tus plantas. Nuestra emulsión es un cóctel de nutrientes esenciales, creados a partir de la transformación de materia natural y suspendidos en una base líquida para una asimilación directa y rápida por las raíces.
            </p>
            <p className="text-lg text-stone-600 mb-8 leading-relaxed">
              Es la forma más pura de entregar vitalidad, desbloqueando el máximo potencial de crecimiento de tu jardín de manera segura y efectiva.
            </p>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-stone-700">{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna de Visual */}
          <div className="flex items-center justify-center order-first lg:order-last">
             <img 
              src="https://i.pinimg.com/736x/d8/08/2d/d8082dabff41b3b260d95870178375f6.jpg" 
              alt="Botella de emulsión nutritiva para plantas." 
              className="rounded-2xl shadow-xl w-full h-full object-cover max-h-[450px] aspect-[4/5]"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default EmulsionExplainedSection;