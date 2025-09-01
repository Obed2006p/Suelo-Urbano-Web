
import React from 'react';
import AdvantagesSection from './AdvantagesSection';
import Footer from './Footer';

interface UtilitiesPageProps {
  header: React.ReactNode;
}

const UtilitiesPage: React.FC<UtilitiesPageProps> = ({ header }) => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      {header}
      <main className="flex-grow">
        <AdvantagesSection />
      </main>
      <Footer />
    </div>
  );
};

export default UtilitiesPage;
