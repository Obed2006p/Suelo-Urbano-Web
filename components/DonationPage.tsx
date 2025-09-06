import React from 'react';
import Footer from './Footer';
import { HeartIcon } from './icons/Icons';

interface DonationPageProps {
  header: React.ReactNode;
}

const DonationPage: React.FC<DonationPageProps> = ({ header }) => {
  // --- INSTRUCCIONES FINALES PARA EL USUARIO ---
  // Para activar este botón, pega aquí el "Enlace de Pago" que creaste en tu Dashboard de Stripe.
  // Debería empezar con https://buy.stripe.com/...
  const stripePaymentLink = 'https://buy.stripe.com/test_7sY14ofxicgOcKcez187K00';

  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      {header}
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <HeartIcon className="h-24 w-24 text-green-600 mx-auto mb-6 dark:text-green-400" />
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 dark:text-stone-100">Apoya Nuestra Misión</h2>
          <p className="text-stone-600 text-lg mb-8 leading-relaxed dark:text-stone-300">
            Así como nuestra emulsión nutre la tierra, tu donación nutre nuestra misión. Con tu apoyo, podemos rescatar más residuos orgánicos y transformarlos en el superalimento que da vida a miles de plantas en hogares y jardines urbanos. Cada contribución es una semilla que plantas para un futuro más verde y consciente. Juntos, estamos cultivando un cambio real, un jardín a la vez.
          </p>
          
          {/*
            FIX: Removed conditional rendering block for configuration warning.
            The Stripe payment link has been configured, so the check against a placeholder URL
            was causing a TypeScript error and is no longer necessary.
          */}

          <a
            href={stripePaymentLink}
            target="_blank"
            rel="noopener noreferrer"
            // FIX: Removed conditional logic from className, aria-disabled, and onClick.
            // This logic was intended to disable the link if it was a placeholder,
            // but now that it's configured, these checks cause TypeScript errors and are obsolete.
            className="bg-green-600 text-white font-bold py-4 px-10 rounded-full hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg text-lg inline-block"
          >
            Donar ahora con Stripe
          </a>
          <p className="text-xs text-stone-500 mt-4 dark:text-stone-400">Serás redirigido a una página de pago segura de Stripe.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonationPage;
