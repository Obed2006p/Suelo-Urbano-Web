
import React from 'react';
import { LeafIcon, UniversityIcon } from './icons/Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-900 text-green-100">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start gap-10 md:gap-8 text-center md:text-left">
          
          {/* Brand Info - Left Column */}
          <div className="flex-shrink-0">
            <div 
              className="inline-flex items-center justify-center md:justify-start gap-2 mb-2 cursor-pointer" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <LeafIcon className="h-7 w-7 text-green-400" />
              <span className="text-2xl font-bold">Suelo Urbano</span>
            </div>
            <p className="text-sm text-green-300">
              &copy; {new Date().getFullYear()} Suelo Urbano. Todos los derechos reservados.
            </p>
            <p className="text-xs text-green-400 mt-1">Transformando el mañana, un jardín a la vez.</p>
          </div>

          {/* Contact & Affiliation - Right Column */}
          <div className="md:text-right">
            <h3 className="text-lg font-semibold text-white mb-3">Contacto y Afiliación</h3>
            <p className="text-sm text-green-300">Ing. Maurizzio Valencia</p>
            <p className="text-xs text-green-400 mt-1">Constitucion SN, Centro, Minatitlan, Colima, 28750</p>
            <div className="flex items-center justify-center md:justify-end gap-2 mt-4">
              <UniversityIcon className="h-6 w-6 text-green-400" />
              <span className="text-sm font-medium text-green-200">FIE - UDC Manzanillo</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
