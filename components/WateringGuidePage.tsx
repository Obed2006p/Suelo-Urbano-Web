import React from 'react';
import Header from './Header';
import WateringGuideSection from './WateringGuideSection';
import Footer from './Footer';

const WateringGuidePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
         <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-6">
              <WateringGuideSection />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WateringGuidePage;
