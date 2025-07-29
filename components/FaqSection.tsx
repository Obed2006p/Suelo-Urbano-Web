import React, { useState } from 'react';
import { QuestionMarkCircleIcon, CaretDownIcon } from './icons/Icons';

const faqData = [
  {
    question: "¿Es seguro para mascotas y niños?",
    answer: "Sí, completamente. Nuestra emulsión es 100% orgánica y no contiene químicos sintéticos. Es segura para que tus niños y mascotas jueguen en el jardín incluso justo después de la aplicación."
  },
  {
    question: "¿Cada cuánto tiempo debo aplicar la emulsión?",
    answer: "Para un crecimiento óptimo, recomendamos aplicar la emulsión cada 15-20 días durante la temporada de crecimiento (primavera y verano). En otoño e invierno, puedes reducir la frecuencia a una vez al mes."
  },
  {
    question: "¿Funciona para suculentas y cactus?",
    answer: "¡Claro! Aunque necesitan menos riego, las suculentas y cactus también se benefician de una nutrición balanceada. Simplemente usa una dosis más diluida (la mitad de lo recomendado) y aplícala con su riego normal, una vez cada 4-6 semanas."
  },
  {
    question: "¿Cómo son los métodos de pago y entrega?",
    answer: "Al llenar el formulario de pedido, nos pondremos en contacto contigo para coordinar la entrega a domicilio (si estás en nuestra zona de cobertura) o un punto de encuentro. El pago se realiza contra entrega en efectivo o por transferencia."
  },
  {
    question: "¿Qué diferencia hay entre la emulsión y el compost sólido?",
    answer: "La emulsión es un fertilizante líquido de acción rápida, ideal para dar un empuje de nutrientes inmediato que las raíces absorben fácilmente. El compost sólido mejora la estructura y la vida del suelo a largo plazo. Se complementan perfectamente: usa el compost al preparar la tierra y la emulsión para nutrir durante el crecimiento."
  }
];

const FaqSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div>
            <div className="text-left mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Preguntas Frecuentes</h2>
                <p className="max-w-3xl text-stone-600">
                    Resolvemos tus dudas más comunes para que uses nuestra emulsión con total confianza.
                </p>
            </div>
            
            <div className="space-y-4">
                {faqData.map((faq, index) => (
                    <div key={index} className="border border-stone-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                        <button 
                            onClick={() => handleToggle(index)}
                            className="w-full flex items-center justify-between p-5 text-left bg-stone-50 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            aria-expanded={openIndex === index}
                            aria-controls={`faq-answer-${index}`}
                        >
                            <div className="flex items-center gap-4">
                                <QuestionMarkCircleIcon className="h-7 w-7 text-green-600 flex-shrink-0" />
                                <h3 className="text-md font-semibold text-stone-800">{faq.question}</h3>
                            </div>
                            <CaretDownIcon className={`h-6 w-6 text-stone-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
                        </button>
                        <div
                            id={`faq-answer-${index}`}
                            className={`transition-all duration-500 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}
                        >
                            <div className="p-6 bg-white border-t border-stone-200">
                                <p className="text-stone-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FaqSection;
