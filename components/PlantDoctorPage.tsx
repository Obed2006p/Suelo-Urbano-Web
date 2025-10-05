
import React from 'react';
import PlantDoctorSection from './PlantDoctorSection';
import Footer from './Footer';

interface PlantDoctorPageProps {
  header: React.ReactNode;
}

const PlantDoctorPage: React.FC<PlantDoctorPageProps> = ({ header }) => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      {header}
      <main className="flex-grow">
        <PlantDoctorSection /> 
      </main>
      <Footer />
    </div>
  );
};

export default PlantDoctorPage;