import React, { useState, useEffect, useRef } from 'react';
import { PlantDiagnosis } from './PlantDoctorSection';
import { HeartbeatIcon, SparklesIcon, CameraIcon, XIcon } from './icons/Icons';

interface LiveConsultaModalProps {
  diagnosis: PlantDiagnosis | null;
  imagePreview: string | null;
  onClose: () => void;
}

export const LiveConsultaModal: React.FC<LiveConsultaModalProps> = ({ diagnosis, imagePreview, onClose }) => {
  const [status, setStatus] = useState<string>('Conectando con Dr. Planta...');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3:00 minutes
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Helper for PCM encoding
  const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output.buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const playAudioChunk = (base64Data: string) => {
    const outputCtx = outputAudioCtxRef.current;
    if (!outputCtx) return;

    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7fff);
      }

      const buffer = outputCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = outputCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(outputCtx.destination);

      const currentTime = outputCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
      activeSourcesRef.current.push(source);

      source.onended = () => {
        const idx = activeSourcesRef.current.indexOf(source);
        if (idx !== -1) activeSourcesRef.current.splice(idx, 1);
      };

      setStatus('Doctor Planta hablando...');
    } catch (e) {
      console.warn('Error playing audio chunk:', e);
    }
  };

  const stopAllPlayback = () => {
    activeSourcesRef.current.forEach(source => {
      try { source.stop(); } catch {}
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
  };

  // Initialize Call session
  useEffect(() => {
    let isMounted = true;

    const startCall = async () => {
      try {
        // 1. Audio Contexts
        inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        // 2. Microphone stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        mediaStreamRef.current = stream;

        const inputCtx = inputAudioCtxRef.current;
        const source = inputCtx.createMediaStreamSource(stream);
        sourceNodeRef.current = source;
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        // 3. WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/live`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setStatus('Escuchando...');

          // Send initial diagnosis context to model
          if (diagnosis) {
            const contextMsg = `[Contexto de Consulta en Vivo]: El usuario está consultando sobre su planta: "${diagnosis.nombrePlanta}". Estado: "${diagnosis.estadoGeneral}". Diagnóstico: "${diagnosis.diagnosticoBreve}". Por favor salúdalo y ayúdale a recuperar su planta usando la emulsión Suelo Urbano.`;
            ws.send(JSON.stringify({ text: contextMsg }));
          } else {
            ws.send(JSON.stringify({ text: "Hola Dr. Plant, inicie la consulta de bienvenida para mi planta." }));
          }

          // Also send initial image preview if available
          if (imagePreview) {
            const base64Data = imagePreview.includes(',') ? imagePreview.split(',')[1] : imagePreview;
            ws.send(JSON.stringify({
              video: { data: base64Data, mimeType: 'image/jpeg' }
            }));
          }
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.error) {
              setErrorMessage(data.error);
              setStatus('Error de conexión');
              return;
            }
            if (data.audio) {
              playAudioChunk(data.audio);
            }
            if (data.interrupted) {
              stopAllPlayback();
              setStatus('Escuchando...');
            }
          } catch (e) {
            console.warn('Error parsing message:', e);
          }
        };

        ws.onerror = () => {
          if (!isMounted) return;
          setErrorMessage('Error en la conexión con el servidor de voz en tiempo real.');
          setStatus('Error de red');
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setStatus('Llamada finalizada');
        };

        // Mic audio processor
        processor.onaudioprocess = (e) => {
          if (!isMounted || isMuted || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = floatTo16BitPCM(inputData);
          const base64 = arrayBufferToBase64(pcm16);
          wsRef.current.send(JSON.stringify({ audio: base64 }));
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);

        // 4. Countdown Timer (3 minutes = 180 seconds)
        timerIntervalRef.current = window.setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerIntervalRef.current!);
              handleHangUp();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

      } catch (err: any) {
        console.error('Error starting live session:', err);
        setErrorMessage('No se pudo acceder al micrófono. Por favor verifica los permisos en tu navegador.');
        setStatus('Error de permisos');
      }
    };

    startCall();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (cameraIntervalRef.current) clearInterval(cameraIntervalRef.current);

    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    if (processorRef.current && sourceNodeRef.current && inputAudioCtxRef.current) {
      try {
        sourceNodeRef.current.disconnect();
        processorRef.current.disconnect();
      } catch {}
    }

    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      try { inputAudioCtxRef.current.close(); } catch {}
    }

    if (outputAudioCtxRef.current && outputAudioCtxRef.current.state !== 'closed') {
      try { outputAudioCtxRef.current.close(); } catch {}
    }

    stopAllPlayback();
  };

  const handleHangUp = () => {
    cleanup();
    onClose();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      setStatus('Micrófono silenciado');
    } else {
      setStatus('Escuchando...');
    }
  };

  const toggleCamera = async () => {
    if (isCameraActive) {
      if (cameraIntervalRef.current) clearInterval(cameraIntervalRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
    } else {
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = camStream;
          videoRef.current.play();
        }
        setIsCameraActive(true);

        // Send 1 frame per second (1 FPS)
        cameraIntervalRef.current = window.setInterval(() => {
          if (!videoRef.current || !canvasRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 240;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            const base64Data = dataUrl.split(',')[1];
            wsRef.current.send(JSON.stringify({
              video: { data: base64Data, mimeType: 'image/jpeg' }
            }));
          }
        }, 1000);
      } catch (e) {
        console.warn('Could not activate camera:', e);
        alert('No se pudo activar la cámara del dispositivo.');
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
          onClick={handleHangUp}
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

        <p className="text-xs sm:text-sm text-emerald-300 font-medium mb-6">
          {diagnosis ? `Analizando: ${diagnosis.nombrePlanta}` : 'Asistente Botánico en Tiempo Real'}
        </p>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-600/60 rounded-xl text-rose-200 text-xs font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Visual Pulse Indicator (Optimized for low-end devices: transform & opacity only) */}
        <div className="relative my-6 flex items-center justify-center w-28 h-28">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-3 rounded-full bg-emerald-600/30 animate-pulse" />
          <div className="relative w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center shadow-lg">
            <SparklesIcon className="w-8 h-8 text-yellow-300" />
          </div>
        </div>

        {/* Status Text */}
        <div className="mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-inner">
            ● {status}
          </span>
          <p className="text-xs text-stone-400 font-mono mt-2">
            Tiempo restante: <strong className="text-yellow-300">{formatTime(timeLeft)}</strong> (Máx. 3:00 min)
          </p>
        </div>

        {/* Camera view if active */}
        <div className={`mb-6 w-full max-w-xs overflow-hidden rounded-2xl border border-emerald-500/40 bg-black ${isCameraActive ? 'block' : 'hidden'}`}>
          <video ref={videoRef} className="w-full h-40 object-cover" muted playsInline />
          <canvas ref={canvasRef} className="hidden" />
          <p className="text-[10px] text-emerald-400 font-mono py-1 bg-stone-900">Transmisión de cámara activa (1 FPS)</p>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3 flex-wrap justify-center w-full">
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

          {/* Camera Button */}
          <button
            onClick={toggleCamera}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm border transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
              isCameraActive 
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' 
                : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700'
            }`}
          >
            <CameraIcon className="w-4 h-4" />
            <span>{isCameraActive ? 'Cámara ON' : 'Cámara'}</span>
          </button>

          {/* Hang Up Button */}
          <button
            onClick={handleHangUp}
            className="flex-1 py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 shadow-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <span>📞 Colgar</span>
          </button>
        </div>

      </div>
    </div>
  );
};
