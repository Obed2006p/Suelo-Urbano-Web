import * as React from 'react';
import { LeafIcon, YouTubeIcon } from './icons/Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-900 text-green-100">
      <div className="container mx-auto px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
            <LeafIcon className="h-6 w-6" />
            <span className="text-xl font-bold">Suelo Urbano</span>
        </div>
        <div className="mb-4">
          <a
            href="https://youtu.be/kuCRR-3TbxI?si=9SOi4dL6LFf1OsVy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Suelo Urbano en YouTube"
            className="inline-block text-green-300 hover:text-white transition-transform duration-300 hover:scale-110"
          >
            <YouTubeIcon className="h-8 w-8" />
          </a>
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