
import * as React from 'react';
// FIX: Corrected imports for icon components
import { MenuIcon, XIcon, SproutIcon, AtomIcon, WaterDropIcon, HeartbeatIcon, HomeIcon, PlayCircleIcon, MapPinIcon } from './icons/Icons';

interface HeaderProps {
  onNavigate?: (id: string) => void;
  isHomePage?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, isHomePage }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    localStorage.removeItem('theme');
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (isDark: boolean) => document.documentElement.classList.toggle('dark', isDark);
    applyTheme(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const inPageNavLinks = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'que-es', label: 'Qué es' },
    { id: 'beneficios', label: 'Beneficios' },
    { id: 'modo-uso', label: 'Modo de empleo' },
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
      <header className="bg-green-700 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center relative">
            <div className="flex items-center gap-4">
                 <button id="main-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-green-100 hover:text-white focus:outline-none z-50 p-2" aria-label="Abrir menú" aria-expanded={isMenuOpen}>
                    <MenuIcon className="w-7 h-7" />
                 </button>
                <a href="#" onClick={navigateHome} className="flex items-center gap-2 cursor-pointer" aria-label="Volver a la página principal">
                    <img src="https://res.cloudinary.com/dsmzpsool/image/upload/v1755534702/WhatsApp_Image_2025-08-18_at_10.24.22_AM-removebg-preview_itjnyf.png" alt="Suelo Urbano Logo" className="h-12" />
                    {/* INDICADOR VISUAL DE ACTUALIZACIÓN 2.0 */}
                    <span className="text-xl sm:text-2xl font-bold text-white">Suelo Urbano 2.0 🌿</span>
                </a>
            </div>

            {isHomePage && onNavigate && (
                 <nav className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {inPageNavLinks.map((link) => (
                    <button
                        key={link.id}
                        onClick={() => onNavigate(link.id)}
                        className="text-green-100 hover:text-white transition-all duration-300 font-medium hover:[text-shadow:0_0_6px_rgba(255,255,255,0.7)]"
                    >
                        {link.label}
                    </button>
                    ))}
                </nav>
            )}
        </div>
      </header>
      
      <div className={`fixed inset-0 z-[100] ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div 
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
        ></div>
        
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
                    id={link.id}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href!)}
                    className="flex items-center gap-4 text-green-100 hover:bg-green-600 hover:text-white transition-all duration-200 font-semibold text-lg w-full text-left py-3 px-4 rounded-lg"
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </a>
              ))}
            </nav>
            <div className="p-4 text-center text-green-300 text-sm border-t border-green-600 mt-auto">
              <p>&copy; {new Date().getFullYear()} Suelo Urbano.</p>
            </div>
        </div>
      </div>
    </>
  );
};

export default Header;
