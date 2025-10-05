
import React from 'react';
import Footer from './Footer';
import LocationsMap from './LocationsMap';

interface LocationsPageProps {
  header: React.ReactNode;
}

const LocationsPage: React.FC<LocationsPageProps> = ({ header }) => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      {header}
      <main className="flex-grow">
        <LocationsMap />
      </main>
      <Footer />
    </div>
  );
};

export default LocationsPage;