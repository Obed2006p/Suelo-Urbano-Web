import React, { useState } from 'react';
import { LeafIcon, ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';

interface Location {
    name: string;
    address: string;
    images: string[];
}

const locations: Location[] = [
    { 
        name: "Suelo Urbano", 
        address: "Av. San Bernabé 295, Independencia Batan Nte, La Magdalena Contreras, 10200 Ciudad de México, CDMX", 
        images: [
            "https://picsum.photos/seed/suelo1/800/600",
            "https://picsum.photos/seed/suelo2/800/600",
            "https://picsum.photos/seed/suelo3/800/600",
        ]
    },
    {
        name: "Mercado Melchor Múzquiz",
        address: "Múzquiz, San Ángel, Álvaro Obregón, 01000 Ciudad de México, CDMX",
        images: [
            "https://res.cloudinary.com/dsmzpsool/image/upload/v1756765431/WhatsApp_Image_2025-09-01_at_3.44.32_PM_yte3ly.jpg",
            "https://res.cloudinary.com/dsmzpsool/image/upload/v1756765431/WhatsApp_Image_2025-09-01_at_3.44.32_PM_1_o6z2wd.jpg",
        ]
    },
    {
        name: "Floreria Casa Blanca",
        address: "Mercado Tizapan, C. Frontera 2, Tizapán, San Ángel, 01090 Ciudad de México, CDMX",
        images: [
            "https://res.cloudinary.com/dsmzpsool/image/upload/v1756755782/WhatsApp_Image_2025-09-01_at_12.50.11_PM_zqedcm.jpg",
            "https://res.cloudinary.com/dsmzpsool/image/upload/v1756755781/WhatsApp_Image_2025-09-01_at_12.50.10_PM_zponx0.jpg",
            "https://res.cloudinary.com/dsmzpsool/image/upload/v1756755781/WhatsApp_Image_2025-09-01_at_12.50.10_PM_1_in5nx9.jpg",
            "https://res.cloudinary.com/dsmzpsool/image/upload/v1756765431/WhatsApp_Image_2025-09-01_at_3.43.33_PM_zjmf7t.jpg",
        ]
    },
    {
        name: "Venta de plantas y Alimentos con nutrientes",
        address: "Av. de las Torres & Av. Lea, El Tanque, La Magdalena Contreras, 10320 Ciudad de México, CDMX",
        images: [
            "https://res.cloudinary.com/dsmzpsool/image/upload/v1756755955/WhatsApp_Image_2025-08-31_at_9.22.30_PM_1_fqh17n.jpg",
            "https://res.cloudinary.com/dsmzpsool/image/upload/v1756755955/WhatsApp_Image_2025-08-31_at_9.22.30_PM_cyplle.jpg",
            "https://res.cloudinary.com/dsmzpsool/image/upload/v1756755954/WhatsApp_Image_2025-08-31_at_9.22.31_PM_bj6zdh.jpg",
        ]
    },
    {
        name: "Mercado del Jueves, venta de plantas",
        address: "C. Glaciar, La Cascada, La Magdalena Contreras, 10340 Ciudad de México, CDMX",
        images: [
            "https://picsum.photos/seed/jueves1/800/600",
            "https://picsum.photos/seed/jueves2/800/600",
        ]
    }
];

const LocationCard: React.FC<{ location: Location }> = ({ location }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? location.images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = currentIndex === location.images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden flex flex-col dark:bg-stone-800 dark:border-stone-700">
            <div className="p-4">
                <h3 className="font-bold text-green-800 dark:text-green-300 flex items-center gap-2"><LeafIcon className="h-5 w-5" />{location.name}</h3>
                <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">{location.address}</p>
            </div>
            {location.images.length > 0 && (
                <div className="aspect-video bg-stone-200 dark:bg-stone-700 relative group">
                    <div 
                        style={{ backgroundImage: `url(${location.images[currentIndex]})` }}
                        className="w-full h-full bg-center bg-cover transition-all duration-500"
                        role="img"
                        aria-label={`Imagen de ${location.name} - ${currentIndex + 1} de ${location.images.length}`}
                    ></div>
                    
                    {location.images.length > 1 && (
                        <>
                            {/* Left Arrow */}
                            <button onClick={prevSlide} className="opacity-0 group-hover:opacity-100 absolute top-1/2 -translate-y-1/2 left-2 text-white bg-black/40 hover:bg-black/60 p-2 rounded-full transition-opacity duration-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Imagen anterior">
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            {/* Right Arrow */}
                            <button onClick={nextSlide} className="opacity-0 group-hover:opacity-100 absolute top-1/2 -translate-y-1/2 right-2 text-white bg-black/40 hover:bg-black/60 p-2 rounded-full transition-opacity duration-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Siguiente imagen">
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                            
                            {/* Dots */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                                {location.images.map((_, slideIndex) => (
                                    <button
                                        key={slideIndex}
                                        onClick={() => setCurrentIndex(slideIndex)}
                                        className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${currentIndex === slideIndex ? 'bg-white shadow-md' : 'bg-white/50 hover:bg-white/75'}`}
                                        aria-label={`Ir a la imagen ${slideIndex + 1}`}
                                    ></button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};


const LocationsMap: React.FC = () => {
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 dark:text-stone-100">Puntos de Venta</h2>
                    <p className="max-w-3xl mx-auto text-stone-600 dark:text-stone-300">
                        Encuentra nuestras tiendas para adquirir la emulsión Suelo Urbano.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {locations.map((loc, index) => (
                        <LocationCard key={index} location={loc} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LocationsMap;