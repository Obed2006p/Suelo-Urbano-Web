import * as React from 'react';
import { HeartIcon } from './icons/Icons';

const FloatingDonationButton: React.FC = () => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.hash = '#/donar';
  };

  return (
    <a
      href="#/donar"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 bg-green-600 text-white font-bold py-3 px-5 rounded-full shadow-xl flex items-center gap-3 transition-transform duration-300 ease-in-out hover:scale-110 animate-bounce-float group"
      aria-label="Realizar una donación"
    >
      <div className="absolute inset-0 rounded-full animate-pulse-shadow group-hover:animate-none"></div>
      <HeartIcon className="h-7 w-7" />
      <span>¡Dona Ahora!</span>
    </a>
  );
};

export default FloatingDonationButton;
