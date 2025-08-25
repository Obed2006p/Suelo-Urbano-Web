import React from 'react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-2 dark:bg-stone-800 dark:shadow-none dark:ring-1 dark:ring-stone-700">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-5 mx-auto dark:bg-green-900/50">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-stone-800 mb-2 dark:text-stone-100">{title}</h3>
      <p className="text-stone-600 leading-relaxed text-justify dark:text-stone-300">{description}</p>
    </div>
  );
};

export default Card;