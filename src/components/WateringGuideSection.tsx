import React from 'react';

const WateringGuideSection: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-16 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 dark:text-stone-100">
        Guía de Riego
      </h2>
      <p className="max-w-2xl mx-auto text-stone-600 dark:text-stone-300">
        Información sobre cómo regar tus plantas próximamente.
      </p>
    </div>
  );
};

export default WateringGuideSection;
