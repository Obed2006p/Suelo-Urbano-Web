
import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, LeafIcon, LockIcon, XIcon } from '../components/icons/Icons';

// --- CONFIGURACIÓN ---
// AQUÍ PUEDES CAMBIAR EL CÓDIGO DE 8 DÍGITOS
const VALID_CODES = ['12345678', 'SUELO2025']; 
const TRIAL_DAYS = 7;

interface PremiumGateProps {
    children: React.ReactNode;
    featureName: string; // 'Dr. Plantas' o 'Chatbot'
    isEmbedded?: boolean; // Si es true, se ajusta al tamaño del contenedor (para el chatbot)
}

const PremiumGate: React.FC<PremiumGateProps> = ({ children, featureName, isEmbedded = false }) => {
    const [accessStatus, setAccessStatus] = useState<'loading' | 'granted' | 'locked'>('loading');
    const [inputCode, setInputCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = () => {
        // 1. Revisar si ya tiene premium activado
        const isPremium = localStorage.getItem('suelo_urbano_premium_activated') === 'true';
        if (isPremium) {
            setAccessStatus('granted');
            return;
        }

        // 2. Revisar lógica de prueba gratuita
        const firstVisit = localStorage.getItem('suelo_urbano_first_visit');
        let visitDate;

        if (!firstVisit) {
            // Si es la primera vez que se ejecuta este chequeo, guardamos la fecha
            visitDate = Date.now();
            localStorage.setItem('suelo_urbano_first_visit', visitDate.toString());
        } else {
            visitDate = parseInt(firstVisit);
        }

        const now = Date.now();
        const diffTime = Math.abs(now - visitDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const remaining = TRIAL_DAYS - diffDays;

        if (remaining >= 0) {
            setDaysLeft(remaining);
            setAccessStatus('granted');
        } else {
            setAccessStatus('locked');
        }
    };

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (VALID_CODES.includes(inputCode.trim())) {
            localStorage.setItem('suelo_urbano_premium_activated', 'true');
            setAccessStatus('granted');
        } else {
            setError('Código incorrecto. Verifica los 8 dígitos en tu producto.');
        }
    };

    if (accessStatus === 'loading') return null;

    // Si el acceso está concedido, mostramos el contenido
    if (accessStatus === 'granted') {
        return (
            <div className="relative">
                {/* Pequeña insignia de prueba si aplica */}
                {daysLeft > 0 && localStorage.getItem('suelo_urbano_premium_activated') !== 'true' && (
                    <div className="absolute top-0 right-0 z-10 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm pointer-events-none">
                        Prueba: {daysLeft} días restantes
                    </div>
                )}
                {children}
            </div>
        );
    }

    // INTERFAZ DE BLOQUEO (PREMIUM GATE)
    return (
        <div className={`flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl ${isEmbedded ? 'h-full w-full absolute inset-0 z-50' : 'min-h-[400px]'}`}>
            <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-full mb-4 animate-bounce-float">
                <LockIcon className="h-10 w-10 text-green-700 dark:text-green-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                Acceso Premium Requerido
            </h3>
            
            <p className="text-stone-600 dark:text-stone-300 mb-6 max-w-md">
                Tu prueba gratuita de <strong>{featureName}</strong> ha terminado. Para continuar disfrutando de esta herramienta, introduce el código de 8 dígitos que viene con tu <strong>Emulsión Suelo Urbano</strong>.
            </p>

            <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-4">
                <div>
                    <input 
                        type="text" 
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="Código (Ej: 12345678)"
                        maxLength={8}
                        className="w-full px-4 py-3 text-center text-lg tracking-widest font-mono border-2 border-stone-300 rounded-lg focus:border-green-500 focus:ring-green-500 dark:bg-stone-700 dark:border-stone-600 dark:text-white uppercase"
                    />
                </div>
                
                {error && (
                    <p className="text-red-500 text-sm font-medium flex items-center justify-center gap-1">
                        <XIcon className="h-4 w-4" /> {error}
                    </p>
                )}

                <button 
                    type="submit"
                    className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    <ShieldCheckIcon className="h-5 w-5" />
                    Desbloquear Acceso
                </button>
            </form>

            <p className="mt-6 text-xs text-stone-400 dark:text-stone-500">
                ¿No tienes un código? Adquiere nuestra emulsión para obtener acceso ilimitado.
                <br/>
                <a href="#/pedido" className="text-green-600 hover:underline dark:text-green-400 mt-1 inline-block">Comprar ahora</a>
            </p>
        </div>
    );
};

// Necesitamos añadir el LockIcon a Icons.tsx o usar uno existente. Usaré un SVG inline si no existe, 
// pero asumiré que puedo añadirlo a Icons.tsx para mantener consistencia.
// Como no puedo editar dos archivos en un solo bloque si no me los pides explicitamente,
// añadiré el icono aquí localmente o reutilizaré uno si es necesario, 
// pero para mejor práctica, añadiré el LockIcon al archivo Icons.tsx en el siguiente bloque.

export default PremiumGate;
