import React, { useState, useEffect, useRef } from 'react';
import { PlantDiagnosis } from './PlantDoctorSection';
import { HeartbeatIcon, SparklesIcon, XIcon } from './icons/Icons';

interface LiveConsultaModalProps {
  diagnosis: PlantDiagnosis | null;
  imagePreview: string | null;
  onClose: () => void;
}

export const LiveConsultaModal: React.FC<LiveConsultaModalProps> = ({ diagnosis, imagePreview, onClose }) => {
  const [status, setStatus] = useState<string>('Toca el botón para hablar con Dr. Planta');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3:00 minutes
  const [transcript, setTranscript] = useState<string>('Haz una pregunta sobre tu planta tocando el botón de abajo.');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);

  const recognitionRef = useRef<any | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const speakText = (text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    setStatus('Dr. Planta hablando...');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      if (!isMountedRef.current) return;
      setStatus('Toca el botón para preguntar de nuevo');
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (!isMountedRef.current) return;
      setStatus('Toca el botón para preguntar');
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    isMountedRef.current = true;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-MX';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsListening(true);
          setStatus('Escuchando tu pregunta...');
        };

        recognition.onresult = async (event: any) => {
          setIsListening(false);
          const last = event.results.length - 1;
          const text = event.results[last][0].transcript.trim();
          
          if (!text || text.length < 2) {
            setStatus('Toca el botón para hablar');
            return;
          }

          setTranscript(`Tú: "${text}"`);
          setStatus('Dr. Planta pensando...');

          const newHistory = [...conversationHistory, { role: 'user', content: text }];
          setConversationHistory(newHistory);

          try {
            const res = await fetch('/api/gemini/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: text,
                history: newHistory.slice(-6),
                systemInstruction: `Eres Dr. Planta, experto botánico y asistente de jardín para Suelo Urbano. REGLA ESTRICTA: Responde ÚNICAMENTE y de forma directa a la pregunta específica que acaba de hacer el usuario sobre su planta. NUNCA des respuestas genéricas ni repitas frases predeterminadas. Contexto del diagnóstico de su planta: ${JSON.stringify(diagnosis)}. Responde en máximo 2 oraciones, de forma directa, cálida y en español de México.`
              })
            });
            const data = await res.json();
            if (data.success && data.text) {
              setTranscript(`Dr. Planta: "${data.text}"`);
              setConversationHistory(prev => [...prev, { role: 'model', content: data.text }]);
              speakText(data.text);
            } else {
              speakText("Por favor repíteme tu pregunta sobre la planta.");
            }
          } catch (e) {
            speakText("¿Podrías repetirme tu pregunta?");
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
          setIsListening(false);
          setStatus('Toca el botón para hablar');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Could not initialize SpeechRecognition:', e);
      }
    }

    // Initial greeting
    const initialGreeting = diagnosis 
      ? `Hola, soy Dr. Planta. Veo tu ${diagnosis.nombrePlanta} con estado ${diagnosis.estadoGeneral}. Toca el botón de hablar y dime qué duda tienes.`
      : "¡Hola! Soy Dr. Planta de Suelo Urbano. Toca el botón y dime en qué puedo ayudarte hoy.";
    
    setTranscript(`Dr. Planta: "${initialGreeting}"`);
    speakText(initialGreeting);

    // Countdown Timer (3 minutes = 180 seconds)
    timerIntervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      isMountedRef.current = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleStartListening = () => {
    if (isListening || isSpeaking) return;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started
      }
    } else {
      alert('El reconocimiento de voz no está disponible en este navegador. Puedes usar los botones de diagnóstico o el chat.');
    }
  };

  const handleClose = () => {
    isMountedRef.current = false;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div 
      className="fixed inset-0 z-[250] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-gradient-to-b from-stone-900 to-emerald-950 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-2 rounded-xl bg-stone-800/80 hover:bg-rose-950/80 border border-stone-700 transition-all cursor-pointer"
          aria-label="Cerrar llamada"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-400/40 text-yellow-300">
            <HeartbeatIcon className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Consulta en Vivo con Dr. Planta
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-emerald-300 font-medium mb-3">
          {diagnosis ? `Planta: ${diagnosis.nombrePlanta}` : 'Asistente Botánico en Tiempo Real'}
        </p>

        {/* Visual Pulse Indicator */}
        <div className="relative my-3 flex items-center justify-center w-28 h-28">
          <div className={`absolute inset-0 rounded-full bg-emerald-500/20 ${isListening || isSpeaking ? 'animate-ping' : ''}`} style={{ animationDuration: '2s' }} />
          <div className="absolute inset-3 rounded-full bg-emerald-600/30 animate-pulse" />
          <div className="relative w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center shadow-lg">
            <SparklesIcon className={`w-8 h-8 text-yellow-300 ${isSpeaking || isListening ? 'animate-bounce' : ''}`} />
          </div>
        </div>

        {/* Status Text & Live Transcript */}
        <div className="mb-4 w-full">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-inner mb-3">
            ● {status}
          </span>
          <div className="bg-stone-950/80 border border-emerald-900/60 rounded-xl p-3 text-xs sm:text-sm text-stone-200 min-h-[60px] flex items-center justify-center text-center font-medium leading-relaxed">
            {transcript}
          </div>
          <p className="text-xs text-stone-400 font-mono mt-2">
            Tiempo restante: <strong className="text-yellow-300">{formatTime(timeLeft)}</strong> (Máx. 3:00 min)
          </p>
        </div>

        {/* Push to Talk Button & Close Button */}
        <div className="flex flex-col gap-3 w-full">
          <button
            type="button"
            onClick={handleStartListening}
            disabled={isListening || isSpeaking}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base border transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer active:scale-95 ${
              isListening
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                : isSpeaking
                ? 'bg-emerald-800 border-emerald-600 text-emerald-200 opacity-90 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-white border-emerald-300/40'
            }`}
          >
            <span className="text-xl">🎙️</span>
            <span>{isListening ? 'Escuchando tu pregunta...' : isSpeaking ? 'Dr. Planta hablando...' : 'Toca para hablar con Dr. Planta'}</span>
          </button>

          <button
            onClick={handleClose}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-all cursor-pointer"
          >
            Finalizar consulta
          </button>
        </div>

      </div>
    </div>
  );
};
