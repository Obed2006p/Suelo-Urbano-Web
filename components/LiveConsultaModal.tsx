import React, { useState, useEffect, useRef } from 'react';
import { PlantDiagnosis } from './PlantDoctorSection';
import { HeartbeatIcon, SparklesIcon, XIcon } from './icons/Icons';

interface LiveConsultaModalProps {
  diagnosis: PlantDiagnosis | null;
  imagePreview: string | null;
  onClose: () => void;
}

export const LiveConsultaModal: React.FC<LiveConsultaModalProps> = ({ diagnosis, imagePreview, onClose }) => {
  const [status, setStatus] = useState<string>('Iniciando consulta con Dr. Planta...');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3:00 minutes
  const [transcript, setTranscript] = useState<string>('Iniciando asistente de voz...');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);

  const recognitionRef = useRef<any | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const lastSpokenTextRef = useRef<string>('');

  const speakText = (text: string, onReadyToListen?: () => void) => {
    if (!window.speechSynthesis) {
      if (onReadyToListen) onReadyToListen();
      return;
    }

    // Stop recognition while speaking to prevent mic from picking up speaker audio (echo loop)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    window.speechSynthesis.cancel();
    isSpeakingRef.current = true;
    lastSpokenTextRef.current = text.toLowerCase();
    setStatus('Dr. Planta hablando...');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = 1.0;

    utterance.onend = () => {
      isSpeakingRef.current = false;
      if (!isMountedRef.current || isMuted) {
        if (onReadyToListen) onReadyToListen();
        return;
      }
      
      // Short cooldown before listening again to clear audio echo
      setTimeout(() => {
        if (!isMountedRef.current || isMuted || isSpeakingRef.current) {
          if (onReadyToListen) onReadyToListen();
          return;
        }
        setStatus('Escuchando...');
        isProcessingRef.current = false;
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started or restarting
          }
        }
        if (onReadyToListen) onReadyToListen();
      }, 1000);
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      if (!isMountedRef.current || isMuted) {
        if (onReadyToListen) onReadyToListen();
        return;
      }
      setStatus('Escuchando...');
      isProcessingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch {}
      }
      if (onReadyToListen) onReadyToListen();
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    isMountedRef.current = true;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('Modo Lectura (Voz no soportada en este navegador)');
      speakText(diagnosis ? `Hola, soy Dr. Planta. Analicemos tu ${diagnosis.nombrePlanta}.` : "¡Hola! Soy Dr. Planta de Suelo Urbano.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-MX';
      recognition.continuous = false; // Restart after each utterance for better turn-taking
      recognition.interimResults = false;

      recognition.onstart = () => {
        if (!isSpeakingRef.current && !isMuted && !isProcessingRef.current) {
          setStatus('Escuchando...');
        }
      };

      recognition.onresult = async (event: any) => {
        if (isSpeakingRef.current || isMuted || isProcessingRef.current) return;
        isProcessingRef.current = true;

        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch {}
        }

        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.trim();
        
        if (!text || text.length < 2) {
          isProcessingRef.current = false;
          return;
        }

        // Ignore if recognized text matches what Dr. Planta just said (echo prevention)
        if (text.toLowerCase().includes(lastSpokenTextRef.current.slice(0, 15))) {
          isProcessingRef.current = false;
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
              history: newHistory.slice(-6), // keep last 6 turns
              systemInstruction: `Eres Dr. Planta, experto botánico y asistente de jardín para Suelo Urbano. REGLA ESTRICTA: Responde ÚNICAMENTE y de forma directa a la pregunta específica que acaba de hacer el usuario (ej. si te pregunta el nombre de la planta, responde exactamente el nombre; si pregunta el riego, da el riego exacto). NUNCA repitas respuestas anteriores ni des consejos genéricos. Contexto del diagnóstico de su planta: ${JSON.stringify(diagnosis)}. Responde en máximo 1 o 2 oraciones, de forma directa y en español de México.`
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
          isProcessingRef.current = false;
          speakText("¿Podrías repetirme tu pregunta?");
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition event error:', e);
      };

      recognition.onend = () => {
        if (!isMountedRef.current || isSpeakingRef.current || isMuted || isProcessingRef.current) return;
        // Automatically restart listening if not speaking or muted
        try {
          recognition.start();
        } catch (err) {
          // Ignore if already started
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      // Initial greeting
      const initialGreeting = diagnosis 
        ? `Hola, soy Dr. Planta. Veo tu ${diagnosis.nombrePlanta} con estado ${diagnosis.estadoGeneral}. ¿Qué te gustaría saber sobre su recuperación?`
        : "¡Hola! Soy Dr. Planta de Suelo Urbano. ¿En qué puedo ayudarte con tu jardín hoy?";
      
      setTranscript(`Dr. Planta: "${initialGreeting}"`);
      speakText(initialGreeting);

    } catch (e) {
      console.warn('Could not initialize SpeechRecognition:', e);
      setStatus('Modo Asistente Activo');
      speakText("¡Hola! Soy Dr. Planta. ¿Cómo puedo ayudarte?");
    }

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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      setStatus('Micrófono silenciado');
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else {
      setStatus('Escuchando...');
      isProcessingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch {}
      }
    }
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

        <p className="text-xs sm:text-sm text-emerald-300 font-medium mb-4">
          {diagnosis ? `Planta: ${diagnosis.nombrePlanta}` : 'Asistente Botánico en Tiempo Real'}
        </p>

        {/* Visual Pulse Indicator */}
        <div className="relative my-4 flex items-center justify-center w-28 h-28">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-3 rounded-full bg-emerald-600/30 animate-pulse" />
          <div className="relative w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center shadow-lg">
            <SparklesIcon className="w-8 h-8 text-yellow-300 animate-pulse" />
          </div>
        </div>

        {/* Status Text & Live Transcript */}
        <div className="mb-5 w-full">
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

        {/* Control Buttons */}
        <div className="flex items-center gap-3 justify-center w-full">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm border transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
              isMuted 
                ? 'bg-rose-950/80 border-rose-500 text-rose-300' 
                : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700'
            }`}
          >
            <span>{isMuted ? '🔇 Silenciado' : '🎤 Silenciar'}</span>
          </button>

          {/* Close / Hang Up Button */}
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 shadow-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <span>📞 Finalizar</span>
          </button>
        </div>

      </div>
    </div>
  );
};
