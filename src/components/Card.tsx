import React from 'react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 text-left transform hover:-translate-y-2">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-stone-800 mb-2">{title}</h3>
      <p className="text-stone-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default Card;