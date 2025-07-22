
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import EmulsionExplainedSection from './components/EmulsionExplainedSection';
import BenefitsSection from './components/BenefitsSection';
import AdvantagesSection from './components/AdvantagesSection';
import ElementsSection from './components/ElementsSection';
import UsageSection from './components/UsageSection';
import WateringGuideSection from './components/WateringGuideSection';
import OrderSection from './components/OrderSection';
import Footer from './components/Footer';

const App: React.FC = () => {
  const scrollTo = (id: string) => {
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
      <Header onNavigate={scrollTo} />
      <main className="flex-grow">
        <Hero onOrderClick={() => scrollTo('pedidos')} />
        <div id="que-es">
          <EmulsionExplainedSection />
        </div>
        <div id="beneficios">
          <BenefitsSection />
        </div>
        <div id="ventajas">
          <AdvantagesSection />
        </div>
        <div id="composicion">
          <ElementsSection />
        </div>
        <div id="modo-uso">
          <UsageSection />
        </div>
        <div id="guia-riego">
          <WateringGuideSection />
        </div>
        <div id="pedidos">
          <OrderSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
