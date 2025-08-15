import React from 'react';
import Header from './Header';
import ElementsSection from './ElementsSection';
import Footer from './Footer';

const CompositionPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <ElementsSection />
      </main>
      <Footer />
    </div>
  );
};

export default CompositionPage;
