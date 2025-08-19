
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import InteractiveGuide from './InteractiveGuide';

const HowToUsePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-grow">
        <InteractiveGuide />
      </main>
      <Footer />
    </div>
  );
};

export default HowToUsePage;
