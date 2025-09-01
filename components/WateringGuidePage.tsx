
import React from 'react';
import WateringGuideSection from './WateringGuideSection';
import Footer from './Footer';

interface WateringGuidePageProps {
  header: React.ReactNode;
}

const WateringGuidePage: React.FC<WateringGuidePageProps> = ({ header }) => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      {header}
      <main className="flex-grow">
         <section className="py-16 md:py-24">
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
