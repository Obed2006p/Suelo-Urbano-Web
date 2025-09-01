import React from 'react';
import { LeafIcon } from './icons/Icons';

interface Location {
    name: string;
    address: string;
    lat: number;
    lng: number;
}

const locations: Location[] = [
    { 
        name: "Suelo Urbano", 
        address: "Av. San Bernabé 295, Independencia Batan Nte, La Magdalena Contreras, 10200 Ciudad de México, CDMX", 
        lat: 19.3344129, 
        lng: -99.2169784 
    },
    {
        name: "Mercado Melchor Múzquiz",
        address: "Múzquiz, San Ángel, Álvaro Obregón, 01000 Ciudad de México, CDMX",
        lat: 19.3427195,
        lng: -99.1908684
    },
    {
        name: "Floreria Casa Blanca",
        address: "Mercado Tizapan, C. Frontera 2, Tizapán, San Ángel, 01090 Ciudad de México, CDMX",
        lat: 19.3361,
        lng: -99.1956
    },
    {
        name: "Venta de plantas y Alimentos con nutrientes",
        address: "Av. de las Torres & Av. Lea, El Tanque, La Magdalena Contreras, 10320 Ciudad de México, CDMX",
        lat: 19.32454,
        lng: -99.23188
    },
    {
        name: "Mercado del Jueves, venta de plantas",
        address: "C. Glaciar, La Cascada, La Magdalena Contreras, 10340 Ciudad de México, CDMX",
        lat: 19.3373164,
        lng: -99.2078457
    }
];

const LocationCard: React.FC<{ location: Location }> = ({ location }) => {
    // Define a small bounding box around the single point for zoom level
    const padding = 0.002;
    const bbox = [
        location.lng - padding,
        location.lat - padding,
        location.lng + padding,
        location.lat + padding
    ].join(',');

    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${location.lat},${location.lng}`;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden flex flex-col dark:bg-stone-800 dark:border-stone-700">
            <div className="p-4">
                <h3 className="font-bold text-green-800 dark:text-green-300 flex items-center gap-2"><LeafIcon className="h-5 w-5" />{location.name}</h3>
                <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">{location.address}</p>
            </div>
            <div className="flex-grow min-h-[300px] bg-stone-200 dark:bg-stone-700">
                <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={mapUrl}
                    title={`Mapa de ${location.name}`}
                    aria-label={`Mapa interactivo mostrando la ubicación de ${location.name}`}
                >
                </iframe>
            </div>
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