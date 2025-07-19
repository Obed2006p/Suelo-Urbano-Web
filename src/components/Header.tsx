import React, { useState } from 'react';
import { LeafIcon } from './icons/Icons';

interface HeaderProps {
  onNavigate: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navLinks = [
    { id: 'beneficios', label: 'Beneficios' },
    { id: 'ventajas', label: 'Utilidades' },
    { id: 'composicion', label: 'Composición' },
    { id: 'modo-uso', label: 'Modo de Empleo' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <LeafIcon className="h-8 w-8 text-green-600" />
          <span className="text-2xl font-bold text-green-800">Suelo Urbano</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className="text-stone-600 hover:text-green-700 transition-colors duration-300 font-medium"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:block">
            <button
                onClick={() => onNavigate('pedidos')}
                className="bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 transition-transform duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
                Hacer Pedido
            </button>
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-stone-700 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path></svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="flex flex-col items-center gap-4 py-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setIsMenuOpen(false);
                }}
                className="text-stone-600 hover:text-green-700 transition-colors duration-300 font-medium text-lg"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                onNavigate('pedidos');
                setIsMenuOpen(false);
              }}
              className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-transform duration-300 ease-in-out transform hover:scale-105 shadow-md w-full max-w-xs"
            >
              Hacer Pedido
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
