
import React from 'react';
import ElementsSection from './ElementsSection';
import Footer from './Footer';

interface CompositionPageProps {
  header: React.ReactNode;
}

const CompositionPage: React.FC<CompositionPageProps> = ({ header }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 dark:bg-slate-950 text-white">
      {header}
      <main className="flex-grow">
        <ElementsSection />
      </main>
      <Footer />
    </div>
  );
};

export default CompositionPage;