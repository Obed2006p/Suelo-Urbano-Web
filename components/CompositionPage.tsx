
import React from 'react';
import ElementsSection from './ElementsSection';
import Footer from './Footer';

interface CompositionPageProps {
  header: React.ReactNode;
}

const CompositionPage: React.FC<CompositionPageProps> = ({ header }) => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      {header}
      <main className="flex-grow">
        <ElementsSection />
      </main>
      <Footer />
    </div>
  );
};

export default CompositionPage;