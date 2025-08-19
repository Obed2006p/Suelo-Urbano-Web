
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
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
import { PottedPlantIcon } from './components/icons/Icons';

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
        <div className="min-h-screen flex flex-col">
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
            {/* Floating Action Button */}
            <button
                onClick={() => { window.location.hash = '#/pedido'; }}
                className="fixed z-40 bottom-6 right-6 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-110 shadow-xl flex items-center gap-2 py-3 px-5"
                aria-label="Haz aqui tu pedido"
            >
                <PottedPlantIcon className="h-7 w-7" />
                <span className="hidden sm:inline">Haz aqui tu pedido</span>
            </button>
        </div>
    );
};


const App: React.FC = () => {
  // On initial load, always default to the home page route to prevent flicker.
  // The useEffect will then sync the URL hash if it was different.
  const [route, setRoute] = useState('#');

  useEffect(() => {
    // This effect runs once on component mount.

    // If the URL has a hash that isn't the homepage, reset it.
    // This will trigger the hashchange listener to sync state,
    // but the UI is already showing the homepage, so there's no flicker.
    if (window.location.hash && window.location.hash !== '#') {
      window.location.hash = '#';
    }

    const handleHashChange = () => {
      setRoute(window.location.hash);
      window.scrollTo(0, 0); 
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []); // Empty dependency array ensures this runs only once.

  switch (route) {
    case '#/pedido':
      return <OrderPage />;
    case '#/utilidades':
      return <UtilitiesPage />;
    case '#/composicion':
      return <CompositionPage />;
    case '#/guia-riego':
      return <WateringGuidePage />;
    case '#/doctor-plantas':
      return <PlantDoctorPage />;
    case '#/guia-interactiva':
        return <HowToUsePage />;
    default:
      return <HomePage />;
  }
};

export default App;
