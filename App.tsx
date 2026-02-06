
import * as React from 'react';
// Imports for components in Root
import Header from './components/Header';
import Hero from './components/Hero';
import BenefitsSection from './components/BenefitsSection';
import UsageSection from './components/UsageSection';
import Footer from './components/Footer';
import EmulsionExplainedSection from './components/EmulsionExplainedSection';
import OrderPage from './components/OrderPage';
import UtilitiesPage from './components/UtilitiesPage';
import CompositionPage from './components/CompositionPage';
import WateringGuidePage from './components/WateringGuidePage';
import PlantDoctorPage from './components/PlantDoctorPage';
import HowToUsePage from './components/HowToUsePage';
import LocationsPage from './components/LocationsPage';
import DonationPage from './components/DonationPage';
import FallingLeaves from './components/FallingLeaves';
import WelcomeSplash from './components/WelcomeSplash';
import FloatingDonationButton from './components/FloatingDonationButton';
import VideoIntro from './components/VideoIntro';
import Chatbot from './components/Chatbot';
import CompostInfoSection from './components/CompostInfoSection';
import PlantCareGuideSection from './components/PlantCareGuideSection';
import PhInfoSection from './components/PhInfoSection';
import CuriousFactPopup from './components/CuriousFactPopup';

// Declara la función global gtag para que TypeScript la reconozca
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: { [key: string]: any }) => void;
  }
}

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
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

                    <div id="guia-cuidados">
                        <PlantCareGuideSection />
                    </div>

                    <div id="info-ph">
                        <PhInfoSection />
                    </div>

                    <div id="modo-uso">
                        <UsageSection />
                    </div>

                    <div id="composta">
                        <CompostInfoSection />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

const getCurrentHash = () => window.location.hash || '#';

type AppState = 'splash' | 'video' | 'home';

const App: React.FC = () => {
  const [route, setRoute] = React.useState(getCurrentHash());
  const [appState, setAppState] = React.useState<AppState>('splash');
  const [showFactPopup, setShowFactPopup] = React.useState(false);

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

  // Lógica del temporizador para Datos Curiosos
  React.useEffect(() => {
    let intervalId: number;

    if (appState === 'home') {
        // Configurar el intervalo para que se ejecute cada 2 minutos (120,000 ms)
        // Se puede ajustar a 30000 (30 seg) para pruebas rápidas
        intervalId = window.setInterval(() => {
            // Solo mostrar si no hay otro modal intrusivo abierto (por ahora asumimos que no)
            // y si el popup no está ya visible
            setShowFactPopup(prev => !prev ? true : prev);
        }, 120000); 
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [appState]);

  const handleEnterSplash = () => {
    const hasSeenVideo = localStorage.getItem('hasSeenIntroVideo');
    if (hasSeenVideo) {
      setAppState('home');
    } else {
      setAppState('video');
    }
  };

  const handleVideoComplete = () => {
    localStorage.setItem('hasSeenIntroVideo', 'true');
    setAppState('home');
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
    return <Header onNavigate={isHome ? scrollTo : undefined} isHomePage={isHome} />;
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
    case '#/donar':
      pageContent = <DonationPage header={renderHeader()} />;
      break;
    case '#/donacion-exitosa':
      window.location.hash = '#';
      pageContent = <HomePage />;
      isHomePage = true;
      break;
    default:
      pageContent = <HomePage />;
      isHomePage = true;
      break;
  }
  
  return (
      <div className="relative font-sans text-gray-800 dark:text-gray-100">
        {/* Main Content Wrapper - gets blurred */}
        <div className={`transition-all duration-500 ${appState === 'video' ? 'blur-md brightness-75 pointer-events-none' : ''}`}>
            <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 -z-20" />
            
            {/* Content that is part of the page and should be blurred */}
            <div className={appState === 'splash' ? 'opacity-0' : (appState === 'home' ? 'animate-fade-in-main' : 'opacity-100')}>
                {appState === 'home' && !isHomePage && <FallingLeaves position="fixed" />}
                {appState === 'home' && isHomePage && <FloatingDonationButton />}
                
                {isHomePage ? renderHeader(true) : null}
                {pageContent}
            </div>
        </div>

        {/* Overlays that are not blurred */}
        <Chatbot />
        <CuriousFactPopup isVisible={showFactPopup} onClose={() => setShowFactPopup(false)} />
        
        {appState === 'splash' && <WelcomeSplash onEnter={handleEnterSplash} />}
        {appState === 'video' && <VideoIntro onComplete={handleVideoComplete} />}
      </div>
  );
};

export default App;
