export interface ProcessSpot {
    id: string;
    stepNumber: number;
    title: string;
    tagline: string;
    badge: string;
    shortLabel: string;
    icon: string;
    videoUrl: string;
    description: string;
    whatsappText: string;
    whatsappNumber: string;
}

export const PROCESS_SPOTS: ProcessSpot[] = [
    {
        id: 'spot-1',
        stepNumber: 1,
        title: 'Nutrición Botánica Activa',
        tagline: 'Regeneración y vitalidad desde la raíz',
        badge: 'Proceso 1 · Regeneración Radicular',
        shortLabel: '1. Nutrición',
        icon: '🌿',
        videoUrl: 'https://res.cloudinary.com/dsmzpsool/video/upload/v1789422763/WhatsApp_Video_2026-09-14_at_1.36.39_PM_yyllvu.mp4',
        description: 'Observa cómo los minerales orgánicos activos despiertan las defensas naturales y la masa radicular.',
        whatsappNumber: '525652420968',
        whatsappText: 'Hola! Vi el Spot 1 de Nutrición Botánica de Suelo Urbano y quiero cotizar para mis plantas.',
    },
    {
        id: 'spot-2',
        stepNumber: 2,
        title: 'Cuidado y Aplicación de Fórmulas',
        tagline: 'Técnicas efectivas de nutrición foliar y biológica',
        badge: 'Proceso 2 · Aplicación y Cuidado',
        shortLabel: '2. Aplicación',
        icon: '🪴',
        videoUrl: 'https://res.cloudinary.com/dsmzpsool/video/upload/v1789422954/WhatsApp_Video_2026-09-14_at_1.36.39_PM_1_kj8urd.mp4',
        description: 'Técnicas clave de aplicación para que cada planta absorba al 100% los nutrientes.',
        whatsappNumber: '525652420968',
        whatsappText: 'Hola! Vi el Spot 2 de Cuidado y Aplicación de Suelo Urbano y quiero cotizar productos.',
    },
    {
        id: 'spot-3',
        stepNumber: 3,
        title: 'Fortalecimiento de Follaje',
        tagline: 'Hojas más verdes, turgentes y libres de estrés',
        badge: 'Proceso 3 · Vitalidad Foliar',
        shortLabel: '3. Follaje',
        icon: '🌻',
        videoUrl: 'https://res.cloudinary.com/dsmzpsool/video/upload/v1789423103/WhatsApp_Video_2026-09-14_at_1.36.39_PM_2_simad2.mp4',
        description: 'Revierte el amarilleo y estimula brotes nuevos con oxigenación y equilibrio de sales.',
        whatsappNumber: '525652420968',
        whatsappText: 'Hola! Vi el Spot 3 de Fortalecimiento de Follaje de Suelo Urbano y me gustaría cotizar.',
    },
    {
        id: 'spot-4',
        stepNumber: 4,
        title: 'Resultados y Transformación Botánica',
        tagline: 'Casos reales de recuperación en pocos días',
        badge: 'Proceso 4 · Transformación Real',
        shortLabel: '4. Resultados',
        icon: '🌺',
        videoUrl: 'https://res.cloudinary.com/dsmzpsool/video/upload/v1789423191/WhatsApp_Video_2026-09-14_at_2.04.30_PM_d8zlg2.mp4',
        description: 'Comprobación paso a paso de plantas rescatadas que volvieron a florecer.',
        whatsappNumber: '525652420968',
        whatsappText: 'Hola! Vi el Spot 4 de Resultados Reales de Suelo Urbano y me interesa para mi jardín.',
    },
    {
        id: 'spot-5',
        stepNumber: 5,
        title: 'Experiencia Verde Suelo Urbano',
        tagline: 'Asesoría experta y fórmulas orgánicas para tu hogar',
        badge: 'Proceso 5 · Ecosistema Suelo Urbano',
        shortLabel: '5. Experiencia',
        icon: '🌿',
        videoUrl: 'https://res.cloudinary.com/dsmzpsool/video/upload/v1789423268/WhatsApp_Video_2026-09-14_at_3.18.50_PM_amvvam.mp4',
        description: 'Acompañamiento integral para convertir cualquier rincón en un oasis verde.',
        whatsappNumber: '525652420968',
        whatsappText: 'Hola! Vi el Spot 5 de Experiencia Verde de Suelo Urbano y quiero una asesoría personalizada.',
    },
];
