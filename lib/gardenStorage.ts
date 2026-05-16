export interface GardenPlant {
    id: string;
    date: number; // timestamp
    name: string;
    health: string;
    diagnosis: string;
    actionPlan: { paso: string; detalle: string }[];
    beforeImage: string; // base64
    afterImage?: string; // base64
}

// Helper para redimensionar imagen antes de guardar (evitar llenar localStorage)
export const resizeImageToBase64 = (file: File, maxWidth = 400): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ratio = maxWidth / img.width;
                const newWidth = maxWidth;
                const newHeight = img.height * ratio;
                
                canvas.width = newWidth;
                canvas.height = newHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject("No 2d context");
                    return;
                }
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                // Comprimir con jpeg a 0.7 para ahorrar espacio
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const saveToGarden = (plant: Omit<GardenPlant, 'id' | 'date'>) => {
    const plants = getGardenPlants();
    const newPlant: GardenPlant = {
        ...plant,
        id: Math.random().toString(36).substr(2, 9),
        date: Date.now()
    };
    plants.unshift(newPlant);
    try {
        localStorage.setItem('my_urban_garden', JSON.stringify(plants));
        return true;
    } catch (e) {
        console.error("No se pudo guardar la planta, tal vez el almacenamiento está lleno", e);
        return false;
    }
};

export const getGardenPlants = (): GardenPlant[] => {
    const data = localStorage.getItem('my_urban_garden');
    if (!data) return [];
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

export const updateAfterImage = (id: string, afterImageBase64: string) => {
    const plants = getGardenPlants();
    const updated = plants.map(p => p.id === id ? { ...p, afterImage: afterImageBase64 } : p);
    localStorage.setItem('my_urban_garden', JSON.stringify(updated));
};

export const deleteFromGarden = (id: string) => {
    const plants = getGardenPlants();
    const updated = plants.filter(p => p.id !== id);
    localStorage.setItem('my_urban_garden', JSON.stringify(updated));
};
