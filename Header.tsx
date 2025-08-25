
import React, { useState, useEffect } from 'react';
import { MenuIcon, XIcon, SproutIcon, AtomIcon, WaterDropIcon, HeartbeatIcon, HomeIcon, PlayCircleIcon, SunIcon, MoonIcon } from './components/icons/Icons';

interface HeaderProps {
  onNavigate?: (id: string) => void;
  isHomePage?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, isHomePage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const inPageNavLinks = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'que-es', label: 'Qué es' },
    { id: 'beneficios', label: 'Beneficios' },
    { id: 'modo-uso', label: 'Modo de empleo' },
  ];
  
  const pageNavLinks = [
    { href: '#', label: 'Inicio', icon: <HomeIcon className="h-6 w-6 text-white" /> },
    { href: '#/utilidades', label: 'Utilidades', icon: <SproutIcon className="h-6 w-6 text-white" /> },
    { href: '#/composicion', label: 'Composición', icon: <AtomIcon className="h-6 w-6 text-white" /> },
    { href: '#/guia-riego', label: 'Guía de Riego', icon: <WaterDropIcon className="h-6 w-6 text-white" /> },
    { href: '#/guia-interactiva', label: 'Guía Interactiva', icon: <PlayCircleIcon className="h-6 w-6 text-white" /> },
    { href: '#/doctor-plantas', label: 'Doctor de Plantas', icon: <HeartbeatIcon className="h-6 w-6 text-white" /> },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    window.location.hash = href;
    setIsMenuOpen(false);
  };
  
  const handleInPageLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (onNavigate) {
        onNavigate(id);
    }
    setIsMenuOpen(false);
  }
  
  const navigateHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (isHomePage && onNavigate) {
        onNavigate('inicio');
    } else {
        window.location.hash = '#';
    }
  };


  return (
    <>
      <header className="bg-green-700 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center relative">
            {/* Left Side */}
            <div className="flex items-center gap-4">
                 <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-green-100 hover:text-white focus:outline-none z-50 p-2" aria-label="Abrir menú" aria-expanded={isMenuOpen}>
                    <MenuIcon className="w-7 h-7" />
                 </button>
                <a href="#" onClick={navigateHome} className="flex items-center gap-2 cursor-pointer" aria-label="Volver a la página principal">
                    <img src="https://res.cloudinary.com/dsmzpsool/image/upload/v1755534702/WhatsApp_Image_2025-08-18_at_10.24.22_AM-removebg-preview_itjnyf.png" alt="Suelo Urbano Logo" className="h-12" />
                    <span className="text-xl sm:text-2xl font-bold text-white">Suelo Urbano</span>
                </a>
            </div>

            {/* Desktop Center Nav (Homepage only) */}
            {isHomePage && onNavigate && (
                 <nav className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {inPageNavLinks.map((link) => (
                    <button
                        key={link.id}
                        onClick={() => onNavigate(link.id)}
                        className="text-green-200 hover:text-white transition-colors duration-300 font-medium"
                    >
                        {link.label}
                    </button>
                    ))}
                </nav>
            )}

             {/* Right Side CTA Removed */}
        </div>
      </header>
      
      {/* Mobile Menu Panel */}
      <div className={`fixed inset-0 z-[100] ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Overlay: Placed first to be behind the menu panel */}
        <div 
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
        ></div>
        
        {/* Menu Panel Content */}
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal"
          className={`absolute left-0 top-0 h-full w-full max-w-xs bg-green-700 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          aria-hidden={!isMenuOpen}
        >
            <div className="flex justify-between items-center p-5 border-b border-green-600">
                <div className="flex items-center gap-2">
                    <img src="https://res.cloudinary.com/dsmzpsool/image/upload/v1755534702/WhatsApp_Image_2025-08-18_at_10.24.22_AM-removebg-preview_itjnyf.png" alt="Suelo Urbano Logo" className="h-10" />
                    <span className="text-xl font-bold text-white">Suelo Urbano</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="text-green-200 hover:text-white p-2 rounded-full hover:bg-green-800 transition-colors" aria-label="Cerrar menú">
                    <XIcon className="w-7 h-7" />
                </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1 p-4">
              {pageNavLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="flex items-center gap-4 text-green-100 hover:bg-green-600 hover:text-white transition-all duration-200 font-semibold text-lg w-full text-left py-3 px-4 rounded-lg"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              ))}
            </nav>
            <div className="p-2 border-t border-green-600">
              <button 
                onClick={toggleDarkMode}
                className="w-full flex items-center gap-4 text-green-100 hover:bg-green-600 hover:text-white transition-all duration-200 font-semibold text-lg py-3 px-4 rounded-lg"
                aria-label={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                {isDarkMode ? <SunIcon className="h-6 w-6 text-yellow-300" /> : <MoonIcon className="h-6 w-6 text-blue-300" />}
                <span>Modo {isDarkMode ? 'Claro' : 'Oscuro'}</span>
              </button>
            </div>
            <div className="p-4 text-center text-green-300 text-sm border-t border-green-600">
              <p>&copy; 2025 Suelo Urbano.</p>
            </div>
        </div>
      </div>
    </>
  );
};

export default Header;
