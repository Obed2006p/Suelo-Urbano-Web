import React, { useState, useEffect, useRef } from 'react';
import { PlantDiagnosis } from './PlantDoctorSection';
import { HeartbeatIcon, SparklesIcon } from './icons/Icons';

interface PlantAudioAssistantProps {
  diagnosis: PlantDiagnosis;
}

export const PlantAudioAssistant: React.FC<PlantAudioAssistantProps> = ({ diagnosis }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Prepare sentences to read aloud
  const sentences = React.useMemo(() => {
    if (!diagnosis) return [];
    const list: string[] = [];
    list.push(`Hola, soy el asistente de voz de Doctor Plantas en Suelo Urbano. Analicemos el caso de tu planta.`);
    list.push(`Nombre identificado: ${diagnosis.nombrePlanta}. Estado general: ${diagnosis.estadoGeneral}.`);
    list.push(`Diagnóstico botánico: ${diagnosis.diagnosticoBreve}.`);
    
    if (diagnosis.problemasDetectados && diagnosis.problemasDetectados.length > 0) {
      list.push(`Problemas principales detectados: ${diagnosis.problemasDetectados.join('. ')}.`);
    }
    
    if (diagnosis.causasPosibles && diagnosis.causasPosibles.length > 0) {
      list.push(`Causas posibles: ${diagnosis.causasPosibles.join('. ')}.`);
    }

    if (diagnosis.tratamiento && diagnosis.tratamiento.length > 0) {
      list.push(`Plan de tratamiento recomendado:`);
      diagnosis.tratamiento.forEach((t, idx) => {
        list.push(`Paso ${idx + 1}: ${t.paso}. ${t.detalle}`);
      });
    }

    if (diagnosis.sustratoRecomendado) {
      list.push(`Sustrato recomendado por Suelo Urbano: ${diagnosis.sustratoRecomendado}.`);
    }

    if (diagnosis.luzYRiego) {
      list.push(`Guía de luz y riego: ${diagnosis.luzYRiego}.`);
    }

    if (diagnosis.seguimiento) {
      list.push(`Seguimiento y evolución esperada: ${diagnosis.seguimiento}.`);
    }

    list.push(`Recuerda seguir estos consejos para devolverle la salud y vitalidad a tu jardín. ¡Mucho éxito!`);
    return list;
  }, [diagnosis]);

  useEffect(() => {
    const loadVoices = () => {
      if (!window.speechSynthesis) return;
      const allVoices = window.speechSynthesis.getVoices();
      // Filter for Spanish voices
      const spanishVoices = allVoices.filter(v => v.lang.startsWith('es'));
      setVoices(spanishVoices);
      if (spanishVoices.length > 0) {
        // Prefer Mexican Spanish or Latin American / Spanish
        const preferred = spanishVoices.find(v => v.lang.includes('MX') || v.lang.includes('ES')) || spanishVoices[0];
        setSelectedVoice(preferred);
      }
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSentenceIndex(0);
  };

  const pauseAudio = () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      playAudioFromIndex(currentSentenceIndex);
    }
  };

  const playAudioFromIndex = (index: number) => {
    if (!window.speechSynthesis) {
      alert('Tu navegador no soporta la síntesis de voz por IA.');
      return;
    }

    window.speechSynthesis.cancel();

    if (index >= sentences.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSentenceIndex(0);
      return;
    }

    const textToSpeak = sentences[index];
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onboundary = () => {
      // Current sentence is actively being spoken
    };

    utterance.onend = () => {
      const nextIdx = index + 1;
      if (nextIdx < sentences.length) {
        setCurrentSentenceIndex(nextIdx);
        playAudioFromIndex(nextIdx);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSentenceIndex(0);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentSentenceIndex(index);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else if (isPaused) {
      resumeAudio();
    } else {
      playAudioFromIndex(0);
    }
  };

  const handleRateChange = (newRate: number) => {
    setSpeechRate(newRate);
    if (isPlaying || isPaused) {
      playAudioFromIndex(currentSentenceIndex);
    }
  };

  if (!diagnosis) return null;

  return (
    <div className="w-full bg-gradient-to-r from-emerald-950 via-green-950 to-stone-900 border-2 border-emerald-500/60 rounded-2xl p-4 sm:p-5 shadow-xl text-white mb-6 relative overflow-hidden">
      {/* Decorative Glow background */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-emerald-900/80 border border-emerald-400/40 shadow-inner flex-shrink-0">
            <SparklesIcon className={`w-6 h-6 text-yellow-300 ${isPlaying ? 'animate-spin' : 'animate-pulse'}`} />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-sm sm:text-base text-white tracking-wide">
                Asistente de Voz IA — Dr. Planta
              </h4>
              <span className="text-[10px] font-black bg-yellow-400 text-stone-900 px-2 py-0.5 rounded-full uppercase">
                Audio HD
              </span>
            </div>
            <p className="text-xs text-emerald-300/90 font-medium">
              {isPlaying 
                ? `Leyendo: "${sentences[currentSentenceIndex]?.slice(0, 50)}..."` 
                : isPaused 
                  ? 'Audio en pausa. Presiona continuar.' 
                  : 'Escucha el diagnóstico completo y la receta botánica en voz alta'}
            </p>
          </div>
        </div>

        {/* Audio controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          {/* Speed Selector */}
          <div className="flex items-center bg-stone-900/90 border border-emerald-800 rounded-xl p-0.5 text-xs">
            {[0.9, 1.0, 1.25].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleRateChange(rate)}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  speechRate === rate 
                    ? 'bg-emerald-600 text-white shadow' 
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Play / Pause / Resume Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg border border-emerald-300/40 transition-all active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <span className="w-2.5 h-2.5 bg-yellow-300 rounded-sm animate-pulse" />
                <span>Pausar Audio</span>
              </>
            ) : isPaused ? (
              <>
                <span>▶️</span>
                <span>Continuar</span>
              </>
            ) : (
              <>
                <span>🔊</span>
                <span>Escuchar Diagnóstico</span>
              </>
            )}
          </button>

          {/* Stop Button */}
          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={stopAudio}
              className="bg-stone-900/80 hover:bg-rose-950 text-stone-300 hover:text-rose-300 border border-stone-700 hover:border-rose-600/50 font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer active:scale-95"
              title="Detener audio"
            >
              ⏹️ Detener
            </button>
          )}
        </div>
      </div>

      {/* Visual Audio Waveform Simulation when Playing */}
      {isPlaying && (
        <div className="mt-3 pt-3 border-t border-emerald-900/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
            <span className="text-[11px] text-emerald-400 font-mono">Progreso:</span>
            <div className="flex-1 bg-stone-900 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-yellow-300 h-full transition-all duration-300"
                style={{ width: `${((currentSentenceIndex + 1) / sentences.length) * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-stone-400 font-mono">
              {currentSentenceIndex + 1} / {sentences.length}
            </span>
          </div>

      <div className="flex items-center gap-1">
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className="w-1 bg-emerald-400 rounded-full animate-bounce"
                style={{ 
                  height: `${Math.max(8, (i % 3 + 1) * 6)}px`, 
                  animationDelay: `${i * 0.15}s` 
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
