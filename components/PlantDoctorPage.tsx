
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
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-6">
                <PlantDoctorSection />
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PlantDoctorPage;
