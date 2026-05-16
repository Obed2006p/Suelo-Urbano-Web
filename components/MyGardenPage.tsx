import React, { useState, useEffect, useRef } from 'react';
import { getGardenPlants, updateAfterImage, deleteFromGarden, GardenPlant, resizeImageToBase64 } from '../lib/gardenStorage';
import { HeartIcon, CameraIcon, CalendarIcon, HeartbeatIcon } from './icons/Icons';

const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const PlantCard: React.FC<{ plant: GardenPlant, onUpdate: () => void }> = ({ plant, onUpdate }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const base64 = await resizeImageToBase64(e.target.files[0]);
                updateAfterImage(plant.id, base64);
                onUpdate();
            } catch (err) {
                alert("Hubo un error procesando la imagen");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleDelete = () => {
        if (window.confirm("¿Seguro que quieres eliminar esta planta de tu jardín?")) {
            deleteFromGarden(plant.id);
            onUpdate();
        }
    };

    const isAfter = !!plant.afterImage;

    return (
        <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden transform transition-all hover:-translate-y-1 hover:shadow-2xl flex flex-col h-full">
            <div className="relative">
                {isAfter ? (
                    <div className="grid grid-cols-2 relative h-48 bg-stone-100 dark:bg-stone-900">
                        <div className="relative border-r-2 border-white dark:border-stone-800 flex justify-center items-center overflow-hidden">
                            <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 backdrop-blur-sm">Antes</span>
                            <img src={plant.beforeImage} alt="Antes" className="w-full h-full object-cover" />
                        </div>
                        <div className="relative flex justify-center items-center overflow-hidden">
                            <span className="absolute top-2 right-2 bg-green-500/80 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 backdrop-blur-sm">Después</span>
                            <img src={plant.afterImage} alt="Después" className="w-full h-full object-cover" />
                        </div>
                        {/* Share Button Overlay */}
                        <div className="absolute -bottom-4 right-4 z-20">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full shadow-lg transform transition hover:scale-110 active:scale-95" title="Comparte tu progreso" onClick={() => alert("¡Toma captura para compartir en tus redes!")}>
                                <HeartIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative h-48 bg-stone-100 dark:bg-stone-900 overflow-hidden group">
                        <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 backdrop-blur-sm">Día 1</span>
                        <img src={plant.beforeImage} alt={plant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <main className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 leading-tight">{plant.name}</h3>
                        <button onClick={handleDelete} className="text-stone-400 hover:text-red-500 transition-colors p-1" title="Eliminar del jardín">
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium mb-3">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        Añadida el {new Date(plant.date).toLocaleDateString()}
                    </div>
                    
                    <div className="bg-stone-50 dark:bg-stone-700/30 p-3 rounded-xl border border-stone-100 dark:border-stone-600/50 mb-3 text-sm">
                        <div className="flex items-center gap-1.5 mb-1 text-green-700 dark:text-green-400 font-bold">
                            <HeartbeatIcon className="h-4 w-4" />
                            <span>Diagnóstico Inicial</span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-300 text-xs line-clamp-3">{plant.diagnosis}</p>
                    </div>

                    <div className="text-sm">
                        <strong className="text-stone-700 dark:text-stone-300 block mb-1">Calendario de Cuidados:</strong>
                        <ul className="space-y-1">
                            {plant.actionPlan.slice(0, 3).map((paso, i) => (
                                <li key={i} className="flex gap-2 items-start text-xs text-stone-600 dark:text-stone-400">
                                    <span className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0">{i+1}</span>
                                    <span className="line-clamp-2">{paso.paso}</span>
                                </li>
                            ))}
                            {plant.actionPlan.length > 3 && <li className="text-xs text-stone-400 ml-6 italic">...y más pasos.</li>}
                        </ul>
                    </div>
                </main>

                <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-700">
                    {!isAfter ? (
                        <>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-full bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 dark:hover:bg-stone-600 text-white py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <CameraIcon className="h-4 w-4" />
                                {isUploading ? 'Procesando...' : 'Añadir foto "Después"'}
                            </button>
                        </>
                    ) : (
                        <div className="text-center w-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 py-2.5 rounded-xl font-bold text-sm border border-green-200 dark:border-green-800/50">
                            ¡Misión Cumplida! 🌱
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface MyGardenPageProps {
    header?: React.ReactNode;
}

const MyGardenPage: React.FC<MyGardenPageProps> = ({ header }) => {
    const [plants, setPlants] = useState<GardenPlant[]>([]);

    const loadPlants = () => {
        setPlants(getGardenPlants());
    };

    useEffect(() => {
        loadPlants();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-900 font-sans">
            {header}
            <main className="flex-1 py-12 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10 max-w-2xl mx-auto">
                        <div className="inline-block bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-4 py-1.5 rounded-full text-sm font-bold mb-4 border border-green-200 dark:border-green-700/50 shadow-sm animate-fade-in-up">
                            Diario de Evolución
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-stone-900 dark:text-white mb-4 tracking-tight animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                            Mi Jardín Urbano
                        </h1>
                        <p className="text-stone-600 dark:text-stone-300 text-base md:text-lg animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                            Monitorea el progreso de tus plantas. Tómales una foto después de su tratamiento y observa cómo reviven gracias a tus cuidados. 🌿
                        </p>
                    </div>

                    {plants.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-stone-800 rounded-3xl border border-dashed border-stone-300 dark:border-stone-600 shadow-sm animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                            <div className="text-5xl mb-4 opacity-50">🪴</div>
                            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200 mb-2">Tu jardín está vacío</h2>
                            <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-sm mx-auto">Visita el Doctor de Plantas, diagnostica una planta y guárdala aquí para comenzar tu diario.</p>
                            <a href="#/doctor-plantas" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all">
                                Ir al Doctor de Plantas
                            </a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                            {plants.map(plant => (
                                <PlantCard key={plant.id} plant={plant} onUpdate={loadPlants} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyGardenPage;
