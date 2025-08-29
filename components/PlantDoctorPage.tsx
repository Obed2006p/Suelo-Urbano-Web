
import React from 'react';
import Header from '../Header';
import PlantDoctorSection from './PlantDoctorSection';
import Footer from './Footer';

const PlantDoctorPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      <Header />
      <main className="flex-grow">
        <PlantDoctorSection /> 
      </main>
      <Footer />
    </div>
  );
};

export default PlantDoctorPage;
