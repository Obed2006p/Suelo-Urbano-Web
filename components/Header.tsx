import * as React from 'react';
import { MenuIcon, XIcon, SproutIcon, AtomIcon, WaterDropIcon, HeartbeatIcon, HomeIcon, PlayCircleIcon, HeartIcon, CalendarIcon, FlowerIcon, LockIcon } from './icons/Icons';

interface HeaderProps {
  onNavigate?: (id: string) => void;
  isHomePage?: boolean;
  isPremiumUnlocked?: boolean;
  onLockStatusChange?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, isHomePage, isPremiumUnlocked = false, onLockStatusChange }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Tema oscuro fijo
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Cierre al hacer clic fuera o presionar tecla Escape (sin sombras oscuras ni capas de desenfoque de fondo)
  React.useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const inPageNavLinks = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'que-es', label: 'Qué es' },
    { id: 'beneficios', label: 'Beneficios' },
    { id: 'modo-uso', label: 'Modo de empleo' },
    { id: 'composta', label: 'Composta' },
  ];
  
  const pageNavLinks = [
    { href: '#', label: 'Inicio', icon: <HomeIcon className="h-5 w-5 text-emerald-400" /> },
    { id: 'nav-link-mi-jardin', href: '#/mi-jardin', label: 'Mi Jardín Urbano', icon: <CalendarIcon className="h-5 w-5 text-emerald-400" /> },
    { id: 'nav-link-utilidades', href: '#/utilidades', label: 'Utilidades', icon: <SproutIcon className="h-5 w-5 text-emerald-400" /> },
    { id: 'nav-link-composicion', href: '#/composicion', label: 'Composición', icon: <AtomIcon className="h-5 w-5 text-emerald-400" /> },
    { id: 'nav-link-guia-riego', href: '#/guia-riego', label: 'Guía de Riego', icon: <WaterDropIcon className="h-5 w-5 text-emerald-400" /> },
    { id: 'nav-link-guia-interactiva', href: '#/guia-interactiva', label: 'Guía Interactiva', icon: <PlayCircleIcon className="h-5 w-5 text-emerald-400" /> },
    { id: 'nav-link-doctor-plantas', href: '#/doctor-plantas', label: 'Doctor de Plantas', icon: <HeartbeatIcon className="h-5 w-5 text-emerald-400" /> },
    { id: 'nav-link-orquideas', href: '#/orquideas', label: 'Orquídeas', icon: <FlowerIcon className="h-5 w-5 text-emerald-400" /> },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    window.location.hash = href;
    setIsMenuOpen(false);
  };
  
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
      <header className="bg-green-800 sticky top-0 z-50 shadow-md border-b border-green-900 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center relative">
            {/* Logo Container & Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-4 z-10">
                 <button 
                    ref={buttonRef}
                    id="main-menu-toggle" 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    className="text-green-100 hover:text-white focus:outline-none p-2 rounded-full hover:bg-green-700/50 active:scale-95 transition-all" 
                    aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"} 
                    aria-expanded={isMenuOpen}
                 >
                    {isMenuOpen ? (
                      <XIcon className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-300" />
                    ) : (
                      <MenuIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                    )}
                 </button>
                <a href="#" onClick={navigateHome} className="flex items-center gap-2 cursor-pointer relative group" aria-label="Volver a la página principal">
                    <img src="https://res.cloudinary.com/dsmzpsool/image/upload/v1759686619/WhatsApp_Image_2025-10-05_at_11.46.24_AM-removebg-preview_wleawb.png" alt="Alimento para plantas Logo" className="h-10 sm:h-12 relative z-10" />
                    
                    <div className="hidden sm:block text-center">
                        <span className="block text-xl sm:text-2xl font-bold text-white leading-tight">Alimento para plantas</span>
                        <span className="block text-xs sm:text-sm font-semibold text-yellow-300 -mt-1 tracking-wide" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>en suelo urbano</span>
                    </div>
                </a>
            </div>

            {/* Centered Navigation (Desktop) */}
            {isHomePage && onNavigate && (
                 <nav className="hidden md:flex items-center gap-4 lg:gap-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-max">
                    {inPageNavLinks.map((link) => (
                    <button
                        key={link.id}
                        onClick={() => onNavigate(link.id)}
                        className="text-green-100 hover:text-white transition-all duration-300 font-medium hover:[text-shadow:0_0_6px_rgba(255,255,255,0.7)] text-sm lg:text-base relative group"
                    >
                        {link.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
                    </button>
                    ))}
                </nav>
            )}
        </div>
      </header>
      
      {/* 
        Menú Flotante Compacto (Popover / Dropdown)
        - NO tiene fondo oscuro (backdrop) que tape o desenfoque la página
        - NO es un bloque largo que se extienda hasta el fondo de la pantalla al hacer scroll
        - Cierra limpiamente al hacer clic afuera, presionar Escape o seleccionar una opción
      */}
      {isMenuOpen && (
        <div 
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal de navegación"
          className="fixed top-16 left-3 sm:left-6 w-80 max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-5rem)] bg-stone-900/98 border border-emerald-500/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col z-[100] overflow-hidden animate-fade-in-down"
        >
          {/* Header del menú flotante */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 bg-stone-950/70">
            <div className="flex items-center gap-2.5">
              <img 
                src="https://res.cloudinary.com/dsmzpsool/image/upload/v1759686619/WhatsApp_Image_2025-10-05_at_11.46.24_AM-removebg-preview_wleawb.png" 
                alt="Logo" 
                className="h-8 w-auto" 
              />
              <div>
                <span className="block text-sm font-bold text-white leading-tight">Suelo Urbano</span>
                <span className="block text-[10px] font-semibold text-yellow-300 tracking-wide">Tu Hogar</span>
              </div>
            </div>
            <button 
              onClick={() => setIsMenuOpen(false)} 
              className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors active:scale-95" 
              aria-label="Cerrar menú"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de enlaces navegables */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[55vh]">
            {pageNavLinks.map((link) => {
              const PREMIUM_HREFS = [
                '#/mi-jardin', 
                '#/guia-interactiva', 
                '#/doctor-plantas', 
                '#/orquideas',
                '#/utilidades',
                '#/composicion',
                '#/guia-riego'
              ];
              const isPremiumItem = PREMIUM_HREFS.includes(link.href);
              return (
                <a
                  key={link.href}
                  id={link.id}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="flex items-center gap-3 text-stone-200 hover:bg-emerald-950/50 hover:text-emerald-300 active:bg-emerald-900/60 transition-all duration-150 font-medium text-sm w-full text-left py-2 px-3 rounded-xl border border-transparent hover:border-emerald-800/40 group"
                >
                  <div className="p-1.5 bg-stone-800/80 group-hover:bg-emerald-950 rounded-lg transition-colors">
                    {link.icon}
                  </div>
                  <span className="flex-1 truncate">{link.label}</span>
                  {isPremiumItem && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1 border ${
                      isPremiumUnlocked 
                        ? 'bg-emerald-950 text-emerald-400 border-green-800/50 animate-pulse' 
                        : 'bg-stone-800/90 text-stone-400 border-stone-700'
                    }`}>
                      {isPremiumUnlocked ? '✨ CLUB' : '🔒 CLUB'}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Panel Club Premium inferior */}
          <div className="p-3 border-t border-stone-800/80 bg-stone-950/50">
            {isPremiumUnlocked ? (
              <div className="p-2.5 bg-gradient-to-r from-emerald-950 to-green-950 border border-emerald-800/50 rounded-xl flex items-center justify-between text-xs font-bold shadow-sm">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="text-sm">🌟</span>
                  <div>
                    <span className="block text-white text-[9px] uppercase font-extrabold tracking-wider leading-none mb-0.5">Acceso Completo</span>
                    <span className="block text-[10px] text-emerald-300 font-medium">Club Premium Activo</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (onLockStatusChange) {
                      onLockStatusChange();
                    }
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-red-400 border border-stone-700 font-bold py-1 px-2.5 rounded-lg text-[9px] uppercase transition-colors"
                  title="Salir de la sesión premium"
                >
                  Salir
                </button>
              </div>
            ) : (
              <a 
                href="#/orquideas"
                onClick={(e) => handleLinkClick(e, '#/orquideas')}
                className="w-full bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500 text-center text-white font-bold py-2 px-3 rounded-xl text-xs tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <LockIcon className="h-3.5 w-3.5 text-green-300" />
                <span>Activar Club Premium</span>
              </a>
            )}

            <p className="mt-2 text-center text-[10px] text-stone-500 flex items-center justify-center gap-1">
              Hecho con <HeartIcon className="w-2.5 h-2.5 text-red-500 inline" /> para tu jardín
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
