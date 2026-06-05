import * as React from 'react';
import { LeafIcon, YouTubeIcon } from './icons/Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-900 text-green-100">
      <div className="container mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
            <LeafIcon className="h-6 w-6" />
            <span className="text-xl font-bold">Alimento para plantas</span>
        </div>
        <div className="mb-4">
          <a
            href="https://youtu.be/kuCRR-3TbxI?si=9SOi4dL6LFf1OsVy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Alimento para plantas en YouTube"
            className="inline-block text-green-300 hover:text-white transition-transform duration-300 hover:scale-110"
          >
            <YouTubeIcon className="h-8 w-8" />
          </a>
        </div>
        <p className="text-sm text-green-300">
          &copy; {new Date().getFullYear()} Alimento para plantas. Todos los derechos reservados.
        </p>
        <p className="text-xs text-green-400 mt-1">Transformando el mañana, un jardín a la vez.</p>
        <div className="mt-4 pt-4 border-t border-green-800/60 max-w-xs mx-auto">
          <a 
            href="#/panel-analitico" 
            className="text-[11px] text-green-400 hover:text-white transition-colors bg-green-950/45 border border-green-800/40 px-3 py-1.5 rounded-sm inline-flex items-center gap-1.5 hover:border-green-600 font-semibold uppercase tracking-wider"
          >
            📊 Consola Analítica y Tráfico
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;