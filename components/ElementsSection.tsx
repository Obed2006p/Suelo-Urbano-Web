import React from 'react';
import Card from './Card';
import { AtomIcon } from './icons/Icons';

const elementsData = [
    { element: 'Nitrógeno', func: 'Esencial para el crecimiento de hojas verdes y tallos; estimula la fotosíntesis.' },
    { element: 'Fósforo', func: 'Promueve el desarrollo de raíces y la floración.' },
    { element: 'Potasio', func: 'Mejora la resistencia a enfermedades y regula el equilibrio de agua.' },
    { element: 'Calcio', func: 'Fortalece las paredes celulares; vital para el desarrollo de nuevas raíces.' },
    { element: 'Magnesio', func: 'Parte central de la molécula de clorofila; vital para la fotosíntesis.' },
    { element: 'Azufre', func: 'Componente de aminoácidos; mejora el sabor y aroma de frutos.' },
    { element: 'Hierro', func: 'Ayuda a la producción de clorofila; importante para hojas verdes.' },
    { element: 'Cobre', func: 'Ayuda en la formación de enzimas; favorece el desarrollo de semillas.' },
    { element: 'Zinc', func: 'Regula el crecimiento y ayuda en la producción de hormonas vegetales.' },
    { element: 'Manganeso', func: 'Participa en la fotosíntesis y enzimología del suelo.' },
    { element: 'Sodio', func: 'Aunque no esencial en grandes cantidades, puede influir en el metabolismo de algunas plantas.' },
];

const ElementsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-stone-900">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 dark:text-stone-100">Riqueza Natural de la Emulsión</h2>
        <p className="max-w-3xl mx-auto text-stone-600 mb-12 dark:text-stone-300">
          Componentes 100% Naturales que nutren tus plantas. Cada elemento juega un papel crucial en el desarrollo y la vitalidad de tu jardín.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {elementsData.map((item, index) => (
            <Card 
              key={index} 
              icon={<AtomIcon className="h-10 w-10 text-indigo-600" />} 
              title={item.element} 
              description={item.func} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ElementsSection;