
import React from 'react';
import Header from '../Header';
import AdvantagesSection from './AdvantagesSection';
import Footer from './Footer';

const UtilitiesPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col dark:bg-stone-900">
      <Header />
      <main className="flex-grow">
        <AdvantagesSection />
      </main>
      <Footer />
    </div>
  );
};

export default UtilitiesPage;