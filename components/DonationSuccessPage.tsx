import React from 'react';
import Footer from './Footer';
import { CelebrationIcon } from './icons/Icons';

interface DonationSuccessPageProps {
  header: React.ReactNode;
}

const DonationSuccessPage: React.FC<DonationSuccessPageProps> = ({ header }) => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      {header}
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <CelebrationIcon className="h-24 w-24 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 dark:text-stone-100">¡Gracias por tu apoyo!</h2>
          <p className="text-stone-600 text-lg mb-8 dark:text-stone-300">
            Tu donación ha sido procesada con éxito. Has dado un paso increíble para ayudarnos a construir un futuro más verde. ¡Agradecemos enormemente tu generosidad!
          </p>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.location.hash = '#'; }}
            className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-colors duration-300"
          >
            Volver al Inicio
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonationSuccessPage;
