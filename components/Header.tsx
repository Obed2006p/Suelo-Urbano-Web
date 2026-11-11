import * as React from 'react';
import { MenuIcon, XIcon, SproutIcon, AtomIcon, WaterDropIcon, HeartbeatIcon, HomeIcon, PlayCircleIcon, HeartIcon, CalendarIcon, FlowerIcon, LockIcon, SparklesIcon } from './icons/Icons';

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

  // Cierre al hacer clic fuera o presionar tecla Escape
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
    { id: 'inicio', label: 'Inicio', isRoute: false },
    { id: 'doctor-plantas', label: 'Doctor Plantas 🩺', href: '#/doctor-plantas', isRoute: true },
    { id: 'mi-jardin', label: 'Mi Jardín 🌿', href: '#/mi-jardin', isRoute: true },
    { id: 'composicion', label: 'Composición 🧪', href: '#/composicion', isRoute: true },
    { id: 'beneficios', label: 'Beneficios', isRoute: false },
    { id: 'modo-uso', label: 'Modo de empleo', isRoute: false },
  ];
  
  const pageNavLinks: Array<{
    id: string;
    href: string;
    label: string;
    icon: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
  }> = [
    { href: '#', label: 'Inicio', icon: <HomeIcon className="h-5 w-5 text-emerald-400" /> },
    { 
      id: 'nav-link-welcome', 
      href: '#', 
      label: 'Inmersión Ecológica (Bienvenida)', 
      icon: <SparklesIcon className="h-5 w-5 text-yellow-300 animate-pulse" />, 
      onClick: (e: React.MouseEvent) => { 
        e.preventDefault(); 
        window.dispatchEvent(new CustomEvent('reset-welcome-splash')); 
        setIsMenuOpen(false); 
      } 
    },
    { id: 'nav-link-doctor-plantas', href: '#/doctor-plantas', label: 'Doctor de Plantas (IA)', icon: <HeartbeatIcon className="h-5 w-5 text-emerald-400" /> },
    { id: 'nav-link-mi-jardin', href: '#/mi-jardin', label: 'Mi Jardín Urbano', icon: <CalendarIcon className="h-5 w-5 text-emerald-400" /> },
    { id: 'nav-link-composicion', href: '#/composicion', label: 'Composición de la Emulsión', icon: <AtomIcon className="h-5 w-5 text-emerald-400" /> },
    { id: 'nav-link-guia-riego', href: '#/guia-riego', label: 'Guía de Riego Automatizada', icon: <WaterDropIcon className="h-5 w-5 text-emerald-400" /> },
    { id: 'nav-link-guia-interactiva', href: '#/guia-interactiva', label: 'Guía Interactiva Avanzada', icon: <PlayCircleIcon className="h-5 w-5 text-emerald-400" /> },
    { id: 'nav-link-utilidades', href: '#/utilidades', label: 'Utilidades Botánicas', icon: <SproutIcon className="h-5 w-5 text-emerald-400" /> },
    { id: 'nav-link-orquideas', href: '#/orquideas', label: 'Cuidado de Orquídeas', icon: <FlowerIcon className="h-5 w-5 text-emerald-400" /> },
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
      {/* Header Fijo / Sticky permanente que no se pierde al hacer scroll */}
      <header className="bg-green-800/95 backdrop-blur-md sticky top-0 z-50 shadow-lg border-b border-green-900 transition-all duration-300">
        <div className="container mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center relative">
            {/* Logo Container & Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-4 z-10">
                 <button 
                    ref={buttonRef}
                    id="main-menu-toggle" 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    className="text-green-100 hover:text-white focus:outline-none p-2 rounded-xl hover:bg-green-700/60 active:scale-95 transition-all flex items-center gap-1.5" 
                    aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú de opciones"} 
                    aria-expanded={isMenuOpen}
                    title="Ver todas las opciones"
                 >
                    {isMenuOpen ? (
                      <XIcon className="w-6 h-6 text-yellow-300" />
                    ) : (
                      <MenuIcon className="w-6 h-6" />
                    )}
                    <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider text-green-200">Menú</span>
                 </button>
                <a href="#" onClick={navigateHome} className="flex items-center gap-2 cursor-pointer relative group" aria-label="Volver a la página principal">
                    <img src="https://res.cloudinary.com/dsmzpsool/image/upload/v1759686619/WhatsApp_Image_2025-10-05_at_11.46.24_AM-removebg-preview_wleawb.png" alt="Alimento para plantas Logo" className="h-9 sm:h-11 relative z-10" />
                    
                    <div className="hidden md:block text-left">
                        <span className="block text-lg sm:text-xl font-bold text-white leading-tight">Alimento para plantas</span>
                        <span className="block text-xs font-semibold text-yellow-300 -mt-1 tracking-wide" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>en suelo urbano</span>
                    </div>
                </a>
            </div>

            {/* Navegación Visible en Header (Escritorio) - Acceso Directo sin depender de las 3 rayitas */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
                {inPageNavLinks.map((link) => {
                  if (link.isRoute && link.href) {
                    return (
                      <a
                        key={link.id}
                        href={link.href}
                        onClick={(e) => handleLinkClick(e, link.href!)}
                        className={`transition-all duration-200 text-xs xl:text-sm font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 ${
                          link.id === 'doctor-plantas'
                            ? 'text-yellow-300 hover:text-white bg-green-900/60 border border-yellow-400/30 hover:border-yellow-300'
                            : 'text-green-100 hover:text-white hover:bg-green-700/50'
                        }`}
                      >
                        {link.label}
                      </a>
                    );
                  }
                  return isHomePage && onNavigate ? (
                    <button
                        key={link.id}
                        onClick={() => onNavigate(link.id)}
                        className="text-green-100 hover:text-white transition-all duration-300 font-medium text-xs xl:text-sm relative group"
                    >
                        {link.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
                    </button>
                  ) : null;
                })}
            </nav>

            {/* Botón Destacado de Acceso Directo: Doctor de Plantas (Siempre visible en Header) */}
            <div className="flex items-center gap-2">
              <a
                href="#/doctor-plantas"
                onClick={(e) => handleLinkClick(e, '#/doctor-plantas')}
                className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold py-1.5 sm:py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm shadow-md transition-all active:scale-95 border border-emerald-300/40 hover:shadow-[0_0_15px_rgba(52,211,153,0.5)] group"
                aria-label="Abrir Doctor de Plantas"
                title="Diagnosticar con Doctor de Plantas"
              >
                <div className="p-0.5 bg-emerald-950/60 rounded-full">
                  <HeartbeatIcon className="w-4 h-4 text-yellow-300 group-hover:scale-110 transition-transform animate-pulse" />
                </div>
                <span className="tracking-wide">Doctor Plantas</span>
                <span className="hidden sm:inline text-[9px] bg-yellow-400 text-stone-900 font-black px-1.5 py-0.2 rounded-full uppercase">IA</span>
              </a>
            </div>
        </div>
      </header>
      

      
      {/* 
        MENÚ FLOTANTE COMPLETO (POPOVER / DROPDOWN)
        - Fondo 100% sólido y de alta legibilidad
        - Permanece accesible en cualquier punto del scroll
      */}
      {isMenuOpen && (
        <div 
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal de opciones"
          className="fixed top-16 left-3 sm:left-6 w-[22rem] max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-5rem)] bg-[#0a120e] border-2 border-emerald-500/60 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_25px_rgba(16,185,129,0.25)] flex flex-col z-[100] overflow-hidden animate-fade-in-down"
          style={{ backgroundColor: '#09110d' }}
        >
          {/* Header del menú flotante */}
          <div className="relative flex items-center justify-between px-4 py-3.5 border-b border-emerald-900/60 bg-[#060c09]">
            <div className="flex items-center gap-3">
              <div className="relative p-1 bg-emerald-950/80 rounded-xl border border-emerald-500/30 shadow-inner">
                <img 
                  src="https://res.cloudinary.com/dsmzpsool/image/upload/v1759686619/WhatsApp_Image_2025-10-05_at_11.46.24_AM-removebg-preview_wleawb.png" 
                  alt="Logo" 
                  className="h-8 w-auto object-contain" 
                />
              </div>
              <div>
                <span className="block text-sm font-extrabold text-white tracking-wide leading-tight flex items-center gap-1.5">
                  Suelo Urbano
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                </span>
                <span className="block text-[11px] font-bold text-yellow-300 tracking-wider uppercase">Todas las Opciones</span>
              </div>
            </div>
            <button 
              onClick={() => setIsMenuOpen(false)} 
              className="text-stone-400 hover:text-white p-1.5 rounded-xl bg-stone-900/80 hover:bg-emerald-900/50 border border-stone-800 hover:border-emerald-700/50 transition-all active:scale-90" 
              aria-label="Cerrar menú"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de enlaces navegables */}
          <nav 
            className="relative flex-1 overflow-y-auto p-2.5 space-y-1.5 bg-[#09110d] max-h-[58vh] 
              [scrollbar-width:thin] [scrollbar-color:#059669_#09110d] 
              [&::-webkit-scrollbar]:w-1.5 
              [&::-webkit-scrollbar-track]:bg-[#09110d] 
              [&::-webkit-scrollbar-thumb]:bg-emerald-600/70 
              [&::-webkit-scrollbar-thumb]:rounded-full 
              hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500"
          >
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
              const isDoctor = link.href === '#/doctor-plantas';
              return (
                <a
                  key={link.id + link.href}
                  id={link.id}
                  href={link.href}
                  onClick={(e) => {
                    if (link.onClick) {
                      link.onClick(e);
                    } else {
                      handleLinkClick(e, link.href);
                    }
                  }}
                  className={`flex items-center gap-3 text-stone-100 transition-all duration-150 font-semibold text-sm w-full text-left py-2.5 px-3 rounded-xl border group shadow-sm ${
                    isDoctor 
                      ? 'bg-gradient-to-r from-[#123120] to-[#0d2015] border-emerald-500/60 hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                      : 'bg-[#0e1a14] hover:bg-[#152a20] border-emerald-900/40 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all ${
                    isDoctor 
                      ? 'bg-emerald-900/80 border border-yellow-400/50 text-yellow-300' 
                      : 'bg-[#08100c] border border-emerald-900/60 text-emerald-400 group-hover:text-emerald-300 group-hover:bg-emerald-950'
                  }`}>
                    {link.icon}
                  </div>
                  <span className={`flex-1 truncate tracking-wide ${isDoctor ? 'text-yellow-200 font-bold' : 'text-white group-hover:text-emerald-200'}`}>
                    {link.label}
                  </span>
                  {isPremiumItem && (
                    <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 border shadow-sm ${
                      isPremiumUnlocked 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 animate-pulse' 
                        : 'bg-stone-900 text-stone-400 border-stone-800'
                    }`}>
                      {isPremiumUnlocked ? '✨ CLUB' : '🔒 CLUB'}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Panel Club Premium inferior */}
          <div className="relative p-3 border-t border-emerald-900/60 bg-[#060c09]">
            {isPremiumUnlocked ? (
              <div className="p-2.5 bg-gradient-to-r from-[#0d2218] to-[#08160f] border border-emerald-600/40 rounded-xl flex items-center justify-between text-xs font-bold shadow-md">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <div className="w-7 h-7 rounded-lg bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-sm shadow-sm">
                    🌟
                  </div>
                  <div>
                    <span className="block text-white text-[9px] uppercase font-black tracking-wider leading-none mb-0.5">
                      Acceso Completo
                    </span>
                    <span className="block text-[11px] text-emerald-300 font-bold">
                      Club Premium Activo
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (onLockStatusChange) {
                      onLockStatusChange();
                    }
                  }}
                  className="bg-stone-900 hover:bg-red-950/80 text-stone-300 hover:text-red-300 border border-stone-700 hover:border-red-600/50 font-bold py-1 px-3 rounded-lg text-[10px] uppercase tracking-wider transition-all shadow-sm active:scale-95" 
                  title="Salir de la sesión premium"
                >
                  Salir
                </button>
              </div>
            ) : (
              <a 
                href="#/orquideas"
                onClick={(e) => handleLinkClick(e, '#/orquideas')}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-center text-white font-extrabold py-2.5 px-3 rounded-xl text-xs tracking-wide transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.5)] active:scale-95 flex items-center justify-center gap-2"
              >
                <LockIcon className="h-4 w-4 text-emerald-200" />
                <span>Activar Club Premium</span>
              </a>
            )}

            <p className="mt-2 text-center text-[10px] text-stone-400 font-medium flex items-center justify-center gap-1">
              Hecho con <HeartIcon className="w-2.5 h-2.5 text-red-500 inline fill-red-500" /> para tu jardín
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
