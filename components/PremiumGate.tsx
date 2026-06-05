import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LockIcon, CheckCircleIcon, SproutIcon, CalendarIcon, HeartbeatIcon, PlayCircleIcon, FlowerIcon } from './icons/Icons';

// Valid codes set (case-insensitive & trimmed)
export const CUSTOMER_CODES = [
  'SU-2026',
  'SU-EMULSION',
  'SU-BIO',
  'SU-JARDI',
  'SU-ORQUI',
  'SU-PREMIUM',
  'SU-CLUB',
  'SUELO2026',
  'EMULSION'
];

export const VIP_CODES = [
  'SU-VIP-DEVELOPER',
  'VIP-SUELO-2026',
  'VIP-DEVELOPER',
  'SUVIP',
  'VIP'
];

interface PremiumGateProps {
  header: React.ReactNode;
  onUnlock: (code: string, isVip: boolean) => void;
  requestedRouteName?: string;
  requireVip?: boolean;
}

const PremiumGate: React.FC<PremiumGateProps> = ({ header, onUnlock, requestedRouteName = 'esta sección premium', requireVip = false }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successState, setSuccessState] = useState<'none' | 'customer' | 'vip'>('none');

  const checkCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      setError('Por favor, introduce un código de acceso.');
      return;
    }

    setIsLoading(true);

    // Simulated short verification delay for high-tech premium feel
    setTimeout(() => {
      setIsLoading(false);
      
      const isVip = VIP_CODES.includes(cleanCode);
      const isCustomer = CUSTOMER_CODES.includes(cleanCode);

      if (isVip) {
        setSuccessState('vip');
        setTimeout(() => {
          onUnlock(cleanCode, true);
        }, 3000); // Allow success screen animation to play
      } else if (isCustomer) {
        if (requireVip) {
          setError('Código de cliente válido, pero esta sección de analítica es exclusiva para Administradores y Programadores VIP de Suelo Urbano.');
          return;
        }
        setSuccessState('customer');
        setTimeout(() => {
          onUnlock(cleanCode, false);
        }, 2500); // Allow success screen animation to play
      } else {
        setError('Código inválido. Verifica la etiqueta de tu emulsión o escribe un código de cliente válido.');
      }
    }, 1200);
  };

  const getSectionIcon = () => {
    if (requestedRouteName.toLowerCase().includes('jardín') || requestedRouteName.toLowerCase().includes('jardin')) {
      return <CalendarIcon className="h-12 w-12 text-yellow-400" />;
    }
    if (requestedRouteName.toLowerCase().includes('doctor') || requestedRouteName.toLowerCase().includes('plantas')) {
      return <HeartbeatIcon className="h-12 w-12 text-emerald-400" />;
    }
    if (requestedRouteName.toLowerCase().includes('orquídea') || requestedRouteName.toLowerCase().includes('orquidea')) {
      return <FlowerIcon className="h-12 w-12 text-green-300 animate-pulse" />;
    }
    if (requestedRouteName.toLowerCase().includes('guía') || requestedRouteName.toLowerCase().includes('guia')) {
      return <PlayCircleIcon className="h-12 w-12 text-teal-400" />;
    }
    return <LockIcon className="h-12 w-12 text-green-400" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 selection:bg-green-600 selection:text-white relative">
      {header}

      {/* Ambient background decoration */}
      <div className="absolute top-24 left-10 w-72 h-72 bg-emerald-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-950/20 rounded-full blur-3xl pointer-events-none" />

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10 transition-all">
        <AnimatePresence mode="wait">
          
          {/* Default Input Gate State */}
          {successState === 'none' && (
            <motion.div 
              key="gate-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl bg-stone-900/90 border border-stone-800/80 rounded-3xl p-6 md:p-10 shadow-2xl relative"
            >
              {/* Glowing Top Frame */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-green-400 to-yellow-400 rounded-t-3xl" />

              {/* Icon & Title */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="p-4 bg-emerald-950/50 border border-emerald-800/50 rounded-2xl mb-4 shadow-lg">
                  {getSectionIcon()}
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
                  Sección Exclusiva de Suelo Urbano
                </h1>
                <p className="text-stone-400 text-sm md:text-base max-w-md">
                  Para acceder a <span className="text-green-300 font-extrabold">{requestedRouteName}</span> necesitas pertenecer al Club de Clientes de Suelo Urbano.
                </p>
              </div>

              {/* Grid of Lock Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-stone-950/40 p-4 md:p-6 rounded-2xl border border-stone-800/40">
                <div className="flex gap-3 items-start">
                  <div className="h-5 w-5 bg-green-900/40 border border-green-800 rounded-full flex items-center justify-center text-green-400 flex-shrink-0 mt-0.5">
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs md:text-sm">Doctor de Plantas con IA</h4>
                    <p className="text-stone-400 text-xs mt-0.5">Diagnósticos inteligentes por foto para sanar tu jardín urbano.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="h-5 w-5 bg-green-900/40 border border-green-800 rounded-full flex items-center justify-center text-green-400 flex-shrink-0 mt-0.5">
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs md:text-sm">Mi Jardín Urbano</h4>
                    <p className="text-stone-400 text-xs mt-0.5">Controla riegos, fertilizaciones y programa alarmas mensuales.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="h-5 w-5 bg-green-900/40 border border-green-800 rounded-full flex items-center justify-center text-green-400 flex-shrink-0 mt-0.5">
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs md:text-sm">Guía de Orquídeas Orgánicas</h4>
                    <p className="text-stone-400 text-xs mt-0.5">Nutre y dosifica flores exóticas con emulsión pura vegetal.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="h-5 w-5 bg-green-900/40 border border-green-800 rounded-full flex items-center justify-center text-green-400 flex-shrink-0 mt-0.5">
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs md:text-sm">Guía Interactiva Avanzada</h4>
                    <p className="text-stone-400 text-xs mt-0.5">Aprende paso a paso cómo acelerar el crecimiento foliar.</p>
                  </div>
                </div>
              </div>

              {/* Verification Form */}
              <form onSubmit={checkCode} className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="premium-code" className="text-xs uppercase tracking-widest text-stone-400 font-extrabold">
                    Introduce tu Código de Emulsión
                  </label>
                  <div className="relative">
                    <input
                      id="premium-code"
                      type="text"
                      placeholder="Ej: SU-EMULSION o SU-2026"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-stone-950 border border-stone-800 hover:border-stone-700 focus:border-green-500 rounded-2xl px-5 py-4 pb-4 font-bold text-center text-white text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-green-900/50 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs md:text-sm font-bold text-center"
                  >
                    ⚠️ {error}
                  </motion.p>
                )}

                <div className="mt-4 pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold py-4 px-6 rounded-2xl cursor-pointer shadow-lg hover:shadow-green-900/20 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verificando tu emulsión...</span>
                      </>
                    ) : (
                      <>
                        <span>Desbloquear Acceso Club Premium</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Informational Help Text */}
              <div className="text-center mt-6 text-xs text-stone-500 leading-relaxed max-w-md mx-auto">
                <p>
                  ¿Cómo conseguir un código? Te entregamos un código directo al comprar tu botella de emulsión en mercados públicos de Alimento para plantas Suelo Urbano.
                </p>
                <div className="mt-4 flex justify-center gap-4">
                  <a href="#/" className="text-stone-400 hover:text-white font-bold transition-colors">
                    ← Regresar al Inicio (Gratuito)
                  </a>
                  <span className="text-stone-705">|</span>
                  <a href="#/pedido" className="text-green-400 hover:text-green-300 font-bold transition-colors">
                    Pedir Emulsión Online →
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* Customer Success State */}
          {successState === 'customer' && (
            <motion.div 
              key="customer-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-lg bg-stone-900/90 border border-emerald-500/30 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Confetti-like ambient decoration */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-500 to-emerald-400" />
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />

              <div className="inline-flex p-4 bg-emerald-950/60 border border-green-500/40 rounded-full text-green-400 mb-6 relative animate-bounce-float">
                <CheckCircleIcon className="h-12 w-12" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-400 rounded-full animate-ping" />
              </div>

              <h2 className="text-3xl font-extrabold text-white mb-3">
                ¡Código de Cliente Aceptado! 🎉
              </h2>
              <p className="text-emerald-400 font-extrabold text-sm uppercase tracking-widest mb-6">
                BIENVENIDO AL CLUB SUELO URBANO
              </p>
              
              <div className="bg-stone-950/50 p-6 rounded-2xl border border-stone-850/85 mb-8">
                <p className="text-stone-300 text-sm md:text-base leading-relaxed">
                  Hemos verificado tu botella de emulsión orgánica. Tu acceso de por vida a todas nuestras herramientas interactivas, diagnóstico de plantas con IA, y paneles de seguimiento ha sido habilitado con éxito en este dispositivo.
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-1 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full animate-[progress_2.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
                </div>
                <p className="text-xs text-stone-400 italic">Redirigiendo a tu sección premium...</p>
              </div>
            </motion.div>
          )}

          {/* VIP Developer Success State */}
          {successState === 'vip' && (
            <motion.div 
              key="vip-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-lg bg-stone-900/90 border border-yellow-500/30 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Gold bar decoration */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600" />
              
              <div className="inline-flex p-4 bg-amber-950/60 border border-yellow-500/40 rounded-full text-yellow-400 mb-6 relative animate-[pulse_1.5s_infinite]">
                <SproutIcon className="h-12 w-12" />
              </div>

              <h2 className="text-3xl font-extrabold text-white mb-1">
                ¡Código VIP Programador! 🌟
              </h2>
              <p className="text-yellow-400 font-extrabold text-sm uppercase tracking-widest mb-6">
                Estatus: CO-CREADOR EXTRAORDINARIO
              </p>
              
              <div className="bg-stone-950/80 p-6 rounded-2xl border border-yellow-905/20 mb-8 font-mono text-left relative">
                <div className="absolute top-2 right-3 text-[10px] text-stone-500 font-sans tracking-wide">CACHÉ ACTIVO</div>
                <p className="text-yellow-100 text-xs md:text-sm leading-relaxed mb-1">
                  &gt; Acceso VIP Desarrollador concedido.
                </p>
                <p className="text-green-400 text-xs md:text-sm leading-relaxed mb-1">
                  &gt; LocalStorage.set(&apos;premium_unlocked&apos;, true)
                </p>
                <p className="text-stone-300 text-xs md:text-sm leading-relaxed">
                  &gt; ¡Gracias por co-crear la aplicación número uno de jardinería sustentable! Disfruta del control total.
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-1.5 w-full bg-stone-850 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full animate-[progress_3s_ease-in-out_infinite]" style={{ width: '60%' }} />
                </div>
                <p className="text-xs text-yellow-500/80 font-mono">Bypassing verification protocols...</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default PremiumGate;
