
import * as React from 'react';
import { MenuIcon, XIcon, SproutIcon, AtomIcon, WaterDropIcon, HeartbeatIcon, HomeIcon, PlayCircleIcon, MapPinIcon, HeartIcon } from './icons/Icons';

interface HeaderProps {
  onNavigate?: (id: string) => void;
  isHomePage?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, isHomePage }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Tema oscuro fijo, eliminada la lógica de detección automática para evitar parpadeos
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const inPageNavLinks = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'que-es', label: 'Qué es' },
    { id: 'beneficios', label: 'Beneficios' },
    { id: 'modo-uso', label: 'Modo de empleo' },
    { id: 'composta', label: 'Composta' },
  ];
  
  const pageNavLinks = [
    { href: '#', label: 'Inicio', icon: <HomeIcon className="h-6 w-6 text-white" /> },
    { id: 'nav-link-utilidades', href: '#/utilidades', label: 'Utilidades', icon: <SproutIcon className="h-6 w-6 text-white" /> },
    { id: 'nav-link-composicion', href: '#/composicion', label: 'Composición', icon: <AtomIcon className="h-6 w-6 text-white" /> },
    { id: 'nav-link-guia-riego', href: '#/guia-riego', label: 'Guía de Riego', icon: <WaterDropIcon className="h-6 w-6 text-white" /> },
    { id: 'nav-link-guia-interactiva', href: '#/guia-interactiva', label: 'Guía Interactiva', icon: <PlayCircleIcon className="h-6 w-6 text-white" /> },
    { id: 'nav-link-doctor-plantas', href: '#/doctor-plantas', label: 'Doctor de Plantas', icon: <HeartbeatIcon className="h-6 w-6 text-white" /> },
    { id: 'nav-link-puntos-de-venta', href: '#/puntos-de-venta', label: 'Puntos de Venta', icon: <MapPinIcon className="h-6 w-6 text-white" /> },
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
      <header className="bg-green-800 sticky top-0 z-50 shadow-md border-b border-green-900">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center relative">
            {/* Logo Container */}
            <div className="flex items-center gap-2 sm:gap-4 z-10">
                 <button id="main-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-green-100 hover:text-white focus:outline-none z-50 p-2" aria-label="Abrir menú" aria-expanded={isMenuOpen}>
                    <MenuIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                 </button>
                <a href="#" onClick={navigateHome} className="flex items-center gap-2 cursor-pointer relative group" aria-label="Volver a la página principal">
                    <img src="https://res.cloudinary.com/dsmzpsool/image/upload/v1759686619/WhatsApp_Image_2025-10-05_at_11.46.24_AM-removebg-preview_wleawb.png" alt="Alimento para plantas Logo" className="h-10 sm:h-12 relative z-10" />
                    {/* Valentine's decoration on logo hover */}
                    <HeartIcon className="absolute -top-1 -right-1 h-4 w-4 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse z-20" />
                    
                    <div className="hidden sm:block text-center">
                        <span className="block text-xl sm:text-2xl font-bold text-white leading-tight">Alimento para plantas</span>
                        <span className="block text-xs sm:text-sm font-semibold text-yellow-300 -mt-1 tracking-wide" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>en suelo urbano</span>
                    </div>
                </a>
            </div>

            {/* Centered Navigation */}
            {isHomePage && onNavigate && (
                 <nav className="hidden md:flex items-center gap-4 lg:gap-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-max">
                    {inPageNavLinks.map((link) => (
                    <button
                        key={link.id}
                        onClick={() => onNavigate(link.id)}
                        className="text-green-100 hover:text-rose-200 transition-all duration-300 font-medium hover:[text-shadow:0_0_6px_rgba(255,200,200,0.7)] text-sm lg:text-base relative group"
                    >
                        {link.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-400 transition-all duration-300 group-hover:w-full"></span>
                    </button>
                    ))}
                </nav>
            )}
        </div>
      </header>
      
      <div className={`fixed inset-0 z-[100] ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div 
            className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
        ></div>
        
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal"
          className={`absolute left-0 top-0 h-full w-full max-w-xs bg-gray-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          aria-hidden={!isMenuOpen}
        >
            <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-gray-900">
                <div className="flex items-center gap-2">
                    <img src="https://res.cloudinary.com/dsmzpsool/image/upload/v1759686619/WhatsApp_Image_2025-10-05_at_11.46.24_AM-removebg-preview_wleawb.png" alt="Alimento para plantas Logo" className="h-10" />
                    <div>
                        <span className="block text-xl font-bold text-white leading-tight">Alimento para plantas</span>
                        <span className="block text-sm font-semibold text-yellow-300 -mt-1 tracking-wide" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>en suelo urbano</span>
                    </div>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="Cerrar menú">
                    <XIcon className="w-7 h-7" />
                </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1 p-4 bg-gray-900">
              {pageNavLinks.map((link) => (
                  <a
                    key={link.href}
                    id={link.id}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href!)}
                    className="flex items-center gap-4 text-gray-300 hover:bg-rose-900/50 hover:text-rose-200 transition-all duration-200 font-semibold text-lg w-full text-left py-3 px-4 rounded-lg"
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </a>
              ))}
            </nav>
            <div className="p-4 text-center text-gray-500 text-sm border-t border-gray-800 bg-gray-900 mt-auto">
              <p className="flex items-center justify-center gap-1">
                  Hecho con <HeartIcon className="w-3 h-3 text-rose-500 animate-pulse" /> para tu jardín.
              </p>
              <p>&copy; {new Date().getFullYear()} Alimento para plantas.</p>
            </div>
        </div>
      </div>
    </>
  );
};

export default Header;
