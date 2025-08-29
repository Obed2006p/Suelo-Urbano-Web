import React, { useState, useEffect } from 'react';
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
                <div id="que-es">
                    <EmulsionExplainedSection />
                </div>
                <div id="beneficios">
                    <BenefitsSection />
                </div>
                <div id="modo-uso">
                    <UsageSection />
                </div>
            </main>
            <Footer />
        </div>
    );
};

const getCurrentHash = () => window.location.hash || '#';

const App: React.FC = () => {
  const [route, setRoute] = useState(getCurrentHash());

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getCurrentHash());
      window.scrollTo(0, 0); 
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  let pageContent;
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
      break;
  }
  
  return (
      <div className="relative bg-stone-50 dark:bg-stone-900">
        <FallingLeaves />
        {pageContent}
      </div>
  );
};

export default App;