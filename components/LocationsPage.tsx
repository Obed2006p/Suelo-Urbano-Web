import React from 'react';
import Header from '../Header';
import Footer from './Footer';
import LocationsMap from './LocationsMap';

const LocationsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      <Header />
      <main className="flex-grow">
        <LocationsMap />
      </main>
      <Footer />
    </div>
  );
};

export default LocationsPage;
