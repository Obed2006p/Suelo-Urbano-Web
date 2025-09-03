
import * as React from 'react';
import Header from './Header';
import Hero from './components/Hero';
import EmulsionExplainedSection from './components/EmulsionExplainedSection';
import BenefitsSection from './components/BenefitsSection';
import UsageSection from './components/UsageSection';
import Footer from './components/Footer';
import OrderPage from './components/OrderPage';
import UtilitiesPage from './components/UtilitiesPage';
import CompositionPage from './components/CompositionPage';
import WateringGuidePage from './components/WateringGuidePage';
import PlantDoctorPage from './components/PlantDoctorPage';
import HowToUsePage from './components/HowToUsePage';
import LocationsPage from './components/LocationsPage';
import FallingLeaves from './components/FallingLeaves';
import WelcomeSplash from './components/WelcomeSplash';
import TourGuide from './components/TourGuide';
import WelcomeTourModal from './components/WelcomeTourModal';

// Declara la función global gtag para que TypeScript la reconozca
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: { [key: string]: any }) => void;
  }
}

const tourSteps = [
    { selector: '#que-es', title: '¿Qué es Suelo Urbano?', content: 'Bienvenido. Primero, descubre qué es nuestra emulsión y su magia para convertir residuos en vida para tus plantas.', route: '#' },
    { selector: '#beneficios', title: 'Beneficios Clave', content: 'Conoce los increíbles beneficios de usar nuestra emulsión, tanto para tu jardín como para el planeta.', route: '#' },
    { selector: '#modo-uso', title: 'Modo de Empleo', content: 'Aprende en 3 sencillos pasos cómo aplicar la emulsión para obtener los mejores resultados en tus plantas.', route: '#' },
    { selector: '#main-menu-toggle', title: 'Menú de Navegación', content: 'Desde este botón puedes explorar todas las secciones y herramientas. ¡Vamos a abrirlo!', route: '#' },
    { selector: '#nav-link-composicion', title: 'Composición', content: 'Aquí podrás ver en detalle los elementos naturales que hacen tan poderosa a nuestra emulsión.', route: '#', openMenu: true },
    { selector: '#nav-link-guia-riego', title: 'Guía de Riego', content: 'Una guía de referencia rápida para saber cuánta agua necesita cada tipo de planta.', route: '#', openMenu: true },
    { selector: '#nav-link-guia-interactiva', title: '¡Guía Interactiva!', content: 'Aprende a usar el producto de forma divertida con este minijuego. ¡Muy recomendable!', route: '#', openMenu: true },
    { selector: '#nav-link-doctor-plantas', title: 'Doctor de Plantas con IA', content: 'Nuestra herramienta estrella. Sube una foto de tu planta y obtén un diagnóstico y plan de acción al instante.', route: '#', openMenu: true },
    { selector: '#order-form-container', title: 'Realiza tu Pedido', content: 'Y por último, cuando estés listo para transformar tu jardín, puedes solicitar tu emulsión desde aquí.', route: '#/pedido' },
];

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
            <main className="flex-grow">
                <Hero onOrderClick={() => { window.location.hash = '#/pedido'; }} />
                <div className="relative">
                    <FallingLeaves position="absolute" />
                    <div id="que-es">
                        <EmulsionExplainedSection />
                    </div>
                    <div id="beneficios">
                        <BenefitsSection />
                    </div>
                    <div id="modo-uso">
                        <UsageSection />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

const getCurrentHash = () => window.location.hash || '#';

const App: React.FC = () => {
  const [route, setRoute] = React.useState(getCurrentHash());
  const [showSplash, setShowSplash] = React.useState(true);
  const [tourState, setTourState] = React.useState({ isActive: false, stepIndex: 0, forceMenuOpen: false });
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);

  const startTour = () => {
    setShowWelcomeModal(false);
    goToStep(0);
  };
  
  const endTour = () => {
    setTourState({ isActive: false, stepIndex: 0, forceMenuOpen: false });
    localStorage.setItem('tourStatus', 'completed');
  };
  
  const skipTour = () => {
    setShowWelcomeModal(false);
    sessionStorage.setItem('tourSkippedThisSession', 'true');
  };

  const goToStep = (index: number) => {
    if (index < 0 || index >= tourSteps.length) {
      endTour();
      return;
    }

    const step = tourSteps[index];
    const currentRoute = getCurrentHash();

    const performStepUpdate = () => {
      const updateStateAndScroll = () => {
        setTourState({ isActive: true, stepIndex: index, forceMenuOpen: !!step.openMenu });

        if (step.route === '#' && !step.openMenu) {
          setTimeout(() => {
            const element = document.querySelector(step.selector);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }
          }, 350);
        }
      };
      
      if (step.openMenu) {
        const menuToggle = document.getElementById('main-menu-toggle');
        const isMenuOpen = menuToggle?.getAttribute('aria-expanded') === 'true';
        if (menuToggle && !isMenuOpen) {
          menuToggle.click();
          setTimeout(updateStateAndScroll, 400); // Wait for menu animation
        } else {
          updateStateAndScroll();
        }
      } else {
        updateStateAndScroll();
      }
    };
    
    if (step.route !== currentRoute) {
      window.location.hash = step.route;
      // Wait for React to re-render the new page content after hash change
      setTimeout(performStepUpdate, 250);
    } else {
      performStepUpdate();
    }
  };

  const handleNextStep = () => goToStep(tourState.stepIndex + 1);
  const handlePrevStep = () => goToStep(tourState.stepIndex - 1);

  React.useEffect(() => {
    const handleHashChange = () => {
      const newRoute = getCurrentHash();
      setRoute(newRoute);
      window.scrollTo(0, 0);
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_path: newRoute,
          page_location: window.location.href,
        });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  React.useEffect(() => {
      if (!showSplash) {
          const tourStatus = localStorage.getItem('tourStatus');
          const tourSkippedThisSession = sessionStorage.getItem('tourSkippedThisSession');
          
          if (tourStatus !== 'completed' && !tourSkippedThisSession) {
              setTimeout(() => {
                setShowWelcomeModal(true);
              }, 500);
          }
      }
  }, [showSplash]);

  const handleEnter = () => {
    setShowSplash(false);
  };
  
  let pageContent;
  let isHomePage = false;
  
  const renderHeader = (isHome = false) => {
    const scrollTo = (id: string) => {
      if (id === 'inicio') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    return <Header onNavigate={isHome ? scrollTo : undefined} isHomePage={isHome} forceMenuOpen={tourState.isActive && tourState.forceMenuOpen} onMenuStateChange={endTour} />;
  };

  switch (route) {
    case '#/pedido':
      pageContent = <OrderPage header={renderHeader()} />;
      break;
    case '#/utilidades':
      pageContent = <UtilitiesPage header={renderHeader()} />;
      break;
    case '#/composicion':
      pageContent = <CompositionPage header={renderHeader()} />;
      break;
    case '#/guia-riego':
      pageContent = <WateringGuidePage header={renderHeader()} />;
      break;
    case '#/doctor-plantas':
      pageContent = <PlantDoctorPage header={renderHeader()} />;
      break;
    case '#/guia-interactiva':
      pageContent = <HowToUsePage header={renderHeader()} />;
      break;
    case '#/puntos-de-venta':
      pageContent = <LocationsPage header={renderHeader()} />;
      break;
    default:
      pageContent = <HomePage />;
      isHomePage = true;
      break;
  }
  
  return (
      <div className="relative">
        <div className="fixed inset-0 bg-stone-50 dark:bg-stone-900 -z-20" />
        {!showSplash && !isHomePage && <FallingLeaves position="fixed" />}
        {showSplash && <WelcomeSplash onEnter={handleEnter} />}

        <div className={!showSplash ? 'animate-fade-in-main' : 'opacity-0'}>
          {isHomePage ? renderHeader(true) : null}
          {pageContent}
        </div>
        
        {showWelcomeModal && <WelcomeTourModal onStart={startTour} onSkip={skipTour} />}

        <TourGuide
            isActive={tourState.isActive}
            step={tourSteps[tourState.stepIndex]}
            stepIndex={tourState.stepIndex}
            totalSteps={tourSteps.length}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onFinish={endTour}
        />
      </div>
  );
};

export default App;
