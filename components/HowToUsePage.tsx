
import React from 'react';
import Footer from './Footer';
import InteractiveGuide from './InteractiveGuide';

interface HowToUsePageProps {
  header: React.ReactNode;
}

const HowToUsePage: React.FC<HowToUsePageProps> = ({ header }) => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      {header}
      <main className="flex-grow">
        <InteractiveGuide />
      </main>
      <Footer />
    </div>
  );
};

export default HowToUsePage;