import * as React from 'react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ icon, title, description }) => {
  return (
    <div className="group relative bg-white dark:bg-stone-800 p-8 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-green-50 dark:bg-stone-700 mb-6 text-green-600 dark:text-green-400 group-hover:bg-green-100 transition-colors duration-300">
          <div className="transform transition-transform duration-500 group-hover:scale-110">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-3">{title}</h3>
        <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-center font-normal">{description}</p>
      </div>
    </div>
  );
};

export default Card;