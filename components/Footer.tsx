
import * as React from 'react';
import { LeafIcon } from './icons/Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-900 text-green-100">
      <div className="container mx-auto px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
            <LeafIcon className="h-6 w-6" />
            <span className="text-xl font-bold">Suelo Urbano</span>
        </div>
        <p className="text-sm text-green-300">
          &copy; {new Date().getFullYear()} Suelo Urbano. Todos los derechos reservados.
        </p>
        <p className="text-xs text-green-400 mt-1">Transformando el mañana, un jardín a la vez.</p>
      </div>
    </footer>
  );
};

export default Footer;