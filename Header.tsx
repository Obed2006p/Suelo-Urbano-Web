
import React, { useState } from 'react';
import { LeafIcon, MenuIcon, XIcon } from './icons/Icons';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navLinks = [
    { href: '#/utilidades', label: 'Utilidades' },
    { href: '#/composicion', label: 'Composición' },
    { href: '#/guia-riego', label: 'Guía de Riego' },
    { href: '#/doctor-plantas', label: 'Doctor de Plantas' },
  ];

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };
  
  const navigateHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMenuOpen(false);
    window.location.hash = '#';
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <a href="#" onClick={navigateHome} className="flex items-center gap-2 cursor-pointer" aria-label="Volver a la página principal">
            <LeafIcon className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">Suelo Urbano</span>
          </a>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-stone-700 focus:outline-none z-50 p-2" aria-label="Abrir menú" aria-expanded={isMenuOpen}>
            <MenuIcon className="w-7 h-7" />
          </button>
        </div>
      </header>
      
      {/* Menu Panel */}
      <div className={`fixed inset-0 z-[100] transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" onClick={() => setIsMenuOpen(false)}></div>
        
        <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-stone-200">
                <h2 className="text-xl font-bold text-green-800">Menú</h2>
                <button onClick={() => setIsMenuOpen(false)} className="text-stone-600 hover:text-green-700 p-2" aria-label="Cerrar menú">
                    <XIcon className="w-7 h-7" />
                </button>
            </div>
            <nav className="flex flex-col gap-2 p-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="text-stone-700 hover:bg-green-50 hover:text-green-800 transition-all duration-200 font-semibold text-lg w-full text-left py-3 px-4 rounded-lg"
                >
                  {link.label}
                </a>
              ))}
            </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
