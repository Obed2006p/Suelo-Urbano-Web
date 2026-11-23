import React, { useState, useEffect, useRef } from 'react';
import { PlantDiagnosis } from './PlantDoctorSection';
import { HeartbeatIcon, SparklesIcon, CameraIcon, XIcon } from './icons/Icons';

interface LiveConsultaModalProps {
  diagnosis: PlantDiagnosis | null;
  imagePreview: string | null;
  onClose: () => void;
}

export const LiveConsultaModal: React.FC<LiveConsultaModalProps> = ({ diagnosis, imagePreview, onClose }) => {
  const [status, setStatus] = useState<string>('Iniciando consulta en vivo con Dr. Planta...');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3:00 minutes
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('Esperando voz...');
  const [isListening, setIsListening] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const isFallbackActiveRef = useRef<boolean>(false);

  const speakText = (text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = 1.0;
    utterance.onend = () => {
      setStatus('Escuchando...');
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      setStatus('Escuchando...');
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(utterance);
    setStatus('Dr. Planta hablando...');
  };

  const startFallbackVoiceAssistant = () => {
    isFallbackActiveRef.current = true;
    setStatus('Modo Voz HD Activo (Escuchando)');
    setErrorMessage(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Tu navegador no soporta reconocimiento de voz nativo, pero puedes escuchar a Dr. Planta.');
      speakText(diagnosis ? `Hola, soy Dr. Planta. Veo que tu planta es ${diagnosis.nombrePlanta} con estado ${diagnosis.estadoGeneral}. ¿Qué dudas tienes sobre su recuperación?` : "¡Hola! Soy Dr. Planta. ¿Cómo puedo ayudarte con tu jardín hoy?");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-MX';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setStatus('Escuchando tu voz...');
      };

      recognition.onresult = async (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.trim();
        if (text) {
          setTranscript(`Tú: "${text}"`);
          setIsListening(false);
          recognition.stop();

          // Send to chat API
          setStatus('Dr. Planta pensando...');
          try {
            const res = await fetch('/api/gemini/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: text,
                systemInstruction: `Eres Dr. Planta, experto botánico y asistente de jardín para Suelo Urbano. El usuario está en consulta de voz en vivo contigo. Contexto del diagnóstico actual: ${JSON.stringify(diagnosis)}. Responde de forma cálida, cercana, clara y práctica en español de México.`
              })
            });
            const data = await res.json();
            if (data.success && data.text) {
              setTranscript(`Dr. Planta: "${data.text}"`);
              speakText(data.text, () => {
                try { recognition.start(); } catch {}
              });
            } else {
              speakText("Entiendo. Te sugiero aplicar la emulsión Suelo Urbano para reactivar la microvida y ajustar el riego.");
            }
          } catch (e) {
            speakText("Disculpa, tuve un pequeño problema de conexión, pero recuerda mantener el sustrato aireado y bien drenado.");
          }
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isFallbackActiveRef.current && !isMuted) {
          try { recognition.start(); } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      // Initial greeting
      speakText(diagnosis ? `Hola, soy Dr. Planta. Analizamos tu ${diagnosis.nombrePlanta} y presenta ${diagnosis.estadoGeneral}. Te escucho, dime qué necesitas.` : "¡Hola! Soy Dr. Planta de Suelo Urbano. ¿En qué puedo ayudarte a mejorar tu jardín hoy?");

    } catch (e) {
      console.warn('Could not start speech recognition:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const startLiveSession = async () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/live`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setStatus('Conectado en Vivo');
          if (diagnosis) {
            const contextMsg = `[Contexto de Consulta en Vivo]: El usuario está consultando sobre su planta: "${diagnosis.nombrePlanta}". Estado: "${diagnosis.estadoGeneral}". Diagnóstico: "${diagnosis.diagnosticoBreve}". Por favor salúdalo y ayúdale a recuperar su planta usando la emulsión Suelo Urbano.`;
            ws.send(JSON.stringify({ text: contextMsg }));
          } else {
            ws.send(JSON.stringify({ text: "Hola Dr. Plant, inicie la consulta de bienvenida para mi planta." }));
          }
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.error) {
              console.warn('Live WS error, falling back to Web Speech API:', data.error);
              ws.close();
              startFallbackVoiceAssistant();
              return;
            }
            if (data.text) {
              setTranscript(`Dr. Planta: "${data.text}"`);
              speakText(data.text);
            }
          } catch (e) {
            console.warn('Error parsing message:', e);
          }
        };

        ws.onerror = () => {
          if (!isMounted) return;
          console.warn('WebSocket error, falling back to Web Speech API');
          startFallbackVoiceAssistant();
        };

        ws.onclose = (event) => {
          if (!isMounted) return;
          if (event.code !== 1000 && !isFallbackActiveRef.current) {
            startFallbackVoiceAssistant();
          }
        };

      } catch (err) {
        if (!isMounted) return;
        startFallbackVoiceAssistant();
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
    };

    startLiveSession();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isFallbackActiveRef.current = false;
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      setStatus('Micrófono silenciado');
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    } else {
      setStatus('Escuchando...');
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

        {/* Error banner if any */}
        {errorMessage && (
          <div className="mb-3 p-2.5 bg-rose-950/80 border border-rose-600/60 rounded-xl text-rose-200 text-xs font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

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
          <div className="bg-stone-950/80 border border-emerald-900/60 rounded-xl p-3 text-xs text-stone-200 min-h-[50px] flex items-center justify-center text-center font-medium">
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
