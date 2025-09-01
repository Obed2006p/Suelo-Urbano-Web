





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

// Declara la función global gtag para que TypeScript la reconozca
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: { [key: string]: any }) => void;
  }
}

const HomePage: React.FC = () => {
    const scrollTo = (id: string) => {
        if (id === 'inicio') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
            <Header onNavigate={scrollTo} isHomePage />
            <main className="flex-grow">
                <Hero onOrderClick={() => { window.location.hash = '#/pedido'; }} />
                {/* This relative container will contain the leaves for the homepage */}
                <div className="relative">
                    {/* The leaves start here, behind the content */}
                    <FallingLeaves position="absolute" />
                    
                    {/* The rest of the page content sits on top */}
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

  React.useEffect(() => {
    // The initial pageview is sent by the gtag.js script in index.html.
    // This effect only needs to handle subsequent SPA navigation.
    const handleHashChange = () => {
      const newRoute = getCurrentHash();
      setRoute(newRoute);
      window.scrollTo(0, 0);

      // Send a `page_view` event to Google Analytics for SPA navigation.
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_path: newRoute,
          page_location: window.location.href,
        });
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    // Clean up the listener when the component unmounts.
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleEnter = () => {
    setShowSplash(false);
  };
  
  let pageContent;
  let isHomePage = false;
  switch (route) {
    case '#/pedido':
      pageContent = <OrderPage />;
      break;
    case '#/utilidades':
      pageContent = <UtilitiesPage />;
      break;
    case '#/composicion':
      pageContent = <CompositionPage />;
      break;
    case '#/guia-riego':
      pageContent = <WateringGuidePage />;
      break;
    case '#/doctor-plantas':
      pageContent = <PlantDoctorPage />;
      break;
    case '#/guia-interactiva':
        pageContent = <HowToUsePage />;
        break;
    case '#/puntos-de-venta':
        pageContent = <LocationsPage />;
        break;
    default:
      pageContent = <HomePage />;
      isHomePage = true;
      break;
  }
  
  return (
      <div className="relative">
        {/* Background Color Layer */}
        <div className="fixed inset-0 bg-stone-50 dark:bg-stone-900 -z-20" />

        {/* Falling Leaves Layer (visible when splash is gone AND not on homepage) */}
        {!showSplash && !isHomePage && <FallingLeaves position="fixed" />}

        {/* Splash Screen on top */}
        {showSplash && <WelcomeSplash onEnter={handleEnter} />}

        {/* Main Content Layer */}
        <div className={!showSplash ? 'animate-fade-in-main' : 'opacity-0'}>
          {pageContent}
        </div>
      </div>
  );
};

export default App;