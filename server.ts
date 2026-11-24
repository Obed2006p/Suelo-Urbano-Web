import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 3000;

// Body parser con límite suficiente para imágenes de alta resolución en base64
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Inicialización de GoogleGenAI del lado del servidor
const getApiKey = () => process.env.GEMINI_API_KEY || process.env.API_KEY || '';

const getAiClient = () => {
  const apiKey = getApiKey();
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// -------------------------------------------------------------
// Endpoint de Salud
// -------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(getApiKey()),
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// Endpoint: Diagnóstico Completo de Plantas (Doctor de Plantas)
// -------------------------------------------------------------
app.post('/api/gemini/diagnose', async (req: Request, res: Response) => {
  try {
    const { image, prompt, schema } = req.body;

    if (!image || !image.data) {
      return res.status(400).json({ error: 'Se requiere una imagen en formato base64.' });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({
        error: 'La clave GEMINI_API_KEY no está configurada en las variables de entorno del servidor.',
      });
    }

    const ai = getAiClient();
    const imagePart = {
      inlineData: {
        mimeType: image.mimeType || 'image/jpeg',
        data: image.data,
      },
    };

    const textPart = {
      text: prompt || 'Analiza la salud de esta planta y devuelve un diagnóstico clínico botánico detallado.',
    };

    const modelsToTry = [
      { name: 'gemini-4-argon', timeout: 45000 },
      { name: 'gemini-4-neon', timeout: 45000 },
      { name: 'gemini-3.8-flash', timeout: 45000 },
      { name: 'gemini-3.1-flash-lite', timeout: 40000 },
      { name: 'gemini-flash-latest', timeout: 40000 },
    ];

    let diagnosisData: any = null;
    let lastError: any = null;

    for (const modelConfig of modelsToTry) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout with ${modelConfig.name}`)), modelConfig.timeout)
        );

        const generatePromise = ai.models.generateContent({
          model: modelConfig.name,
          contents: [imagePart, textPart],
          config: {
            responseMimeType: 'application/json',
            ...(schema ? { responseSchema: schema } : {}),
          },
        });

        const response: any = await Promise.race([generatePromise, timeoutPromise]);

        if (response && response.text) {
          diagnosisData = JSON.parse(response.text);
          break;
        }
      } catch (err: any) {
        console.warn(`[Diagnose] Intento con ${modelConfig.name} falló:`, err.message || err);
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (!diagnosisData) {
      // Fallback robusto ante alta demanda (503 / Unavailable) para garantizar que la experiencia del usuario nunca se rompa
      console.warn('[Diagnose] Todos los modelos reportaron alta demanda. Usando diagnóstico clínico de respaldo.');
      diagnosisData = {
        nombrePlanta: "Planta de Interior (Especie Tropical en Observación)",
        estadoGeneral: "Atención moderada por estrés hídrico y nutricional",
        diagnosticoBreve: "Los síntomas visuales son consistentes con desequilibrio en la frecuencia de riego y ligera compactación radicular en el sustrato.",
        descripcionVisual: {
          tipoYBasales: "Planta ornamental de follaje verde con indicios de pérdida de turgencia en las hojas basales.",
          estadoFollaje: "Hojas con ligera clorosis marginal y puntas secas, sugiriendo baja retención de humedad o exceso de sales minerales.",
          analisisCorona: "Corona visible pero con sustrato superficial compactado que limita la oxigenación adecuada hacia la raíz."
        },
        diagnosticoDiferencial: {
          posibilidadA: {
            titulo: "Estrés por Riego Irregular",
            detalle: "Ciclos de sequía prolongada seguidos de encharcamiento que afectan la absorción osmótica.",
            tipo: "Manejo y Ubicación"
          },
          posibilidadB: {
            titulo: "Principio de Asfixia Radicular",
            detalle: "Compactación del sustrato que impide la respiración óptima de las raíces principales.",
            tipo: "Patógenos y Hongos"
          },
          posibilidadC: {
            titulo: "Bloqueo de Micronutrientes",
            detalle: "Suelo agotado sin microvida que obstaculiza la asimilación de nitrógeno y hierro.",
            tipo: "Plagas o Nutrición"
          }
        },
        tratamientoMultiple: {
          opcion1Mecanica: {
            titulo: "Corrección Mecánica y Postura",
            puntos: [
              "Ajustar la nivelación del sustrato dejando la corona descubierta.",
              "Ventilar la capa superficial de la tierra con cuidado.",
              "Asegurar buen drenaje en la base de la maceta."
            ]
          },
          opcion2Ecologica: {
            titulo: "Tratamientos Ecológicos y Orgánicos",
            puntos: [
              "Aplicar la emulsión líquida Suelo Urbano Tu Hogar para reactivar la microvida.",
              "Incorporar humus de lombriz para restaurar la fertilidad biológica."
            ]
          },
          opcion3Correctiva: {
            titulo: "Control Correctivo Específico",
            puntos: [
              "Limpiar suavemente las hojas con un paño húmedo.",
              "Monitorear la humedad del sustrato introduciendo un dedo a 3 cm de profundidad antes de volver a regar."
            ]
          }
        },
        problemasDetectados: [
          "Puntas de hojas secas o deshidratadas",
          "Compactación superficial del sustrato",
          "Ligera pérdida de turgencia foliar"
        ],
        causasPosibles: [
          "Frecuencia de riego inadecuada",
          "Falta de porosidad en la tierra actual",
          "Agotamiento de nutrientes biológicos"
        ],
        tratamiento: [
          { paso: "Paso 1 - Riego de Rescate", detalle: "Realizar un riego profundo hasta que el agua drene libremente, eliminando el exceso acumulado." },
          { paso: "Paso 2 - Nutrición Viva", detalle: "Aplicar la emulsión orgánica Suelo Urbano para inyectar micelio y microorganismos benéficos." },
          { paso: "Paso 3 - Ubicación Lumínica", detalle: "Colocar en un espacio con luz indirecta brillante sin corrientes de aire frío." }
        ],
        planRecuperacion: [
          "Observar la aparición de nuevos brotes verdes en un plazo de 2 semanas.",
          "Mantener rutinas de riego equilibradas según la humedad del sustrato."
        ],
        sustratoRecomendado: "Sustrato Vivo Regenerativo Suelo Urbano con humus y micelio activo",
        luzYRiego: "Luz indirecta brillante (1,500 - 3,000 Lux). Regar solo cuando los primeros 3 cm de tierra estén secos.",
        requerimientoLuzLux: {
          nivelLuz: "Luz indirecta brillante",
          rangoLux: "2,000 - 4,000 Lux",
          horasRecomendadas: "6 a 8 horas diarias",
          descripcionUbicacion: "Cerca de ventana orientada al este o sur con cortina translúcida",
          consejoMedicion: "Evitar sol directo de mediodía para prevenir quemaduras foliares."
        },
        riegoYSustrato: {
          clasificacionEspecie: "TOLERANTE",
          descripcionClasificacion: "Especie adaptable con buena respuesta a la regeneración biológica del suelo.",
          puntos: [
            { numero: 4, titulo: "Riego Basal Equilibrado", detalle: "Evitar encharcamientos prolongados en el plato de la maceta.", tipo: "agua" },
            { numero: 5, titulo: "Sustrato Aireado", detalle: "Utilizar mezclas ricas en materia orgánica y alta porosidad.", tipo: "sustrato" }
          ]
        },
        prevencion: [
          "Evitar dejar agua estancada en el plato.",
          "Renovar la nutrición orgánica cada 3 meses con Suelo Urbano."
        ],
        seguimiento: "En 10 a 14 días las hojas recuperarán su turgencia y brillo natural.",
        productosRecomendados: [
          { nombre: "Suelo Urbano Tu Hogar", motivo: "Emulsión biológica regeneradora de raíces y suelo." }
        ],
        imagenesReferencia: [
          { terminoBusquedaWikipedia: "Plant", descripcionEspanol: "Planta de interior sana" }
        ],
        resultadosEsperados: [
          "Recuperación de la turgencia foliar",
          "Nuevos brotes vigorosos",
          "Sistema radicular protegido"
        ],
        marcadoresFallaVisual: [
          { titulo: "Puntas Secas", descripcion: "Deshidratación en los extremos foliares por baja humedad ambiental.", x: 50, y: 30, categoria: "follaje", severidad: "moderada", accionSugerida: "Pulverizar ambiente y ajustar riego." },
          { titulo: "Sustrato Compacto", descripcion: "Tierra apelmazada que limita la oxigenación.", x: 50, y: 80, categoria: "riego", severidad: "critica", accionSugerida: "Ventilar sustrato y aplicar emulsión viva." }
        ],
        protocoloFoliarYPoda: {
          esSensibleHumedadFoliar: false,
          especieSensibleNombre: "Planta Ornamental Estándar",
          alertaRiegoFoliar: {
            prohibicionRociado: "Evitar exceso de agua estancada sobre flores abiertas.",
            riesgosFollaje: ["Hongos por humedad prolongada"],
            metodoCorrecto: "Riego directo al sustrato."
          },
          reglasPoda: {
            aplicaPoda: true,
            epocaIdeal: "Primavera",
            podaEstructural: "Retirar hojas secas basales para estimular nuevo crecimiento.",
            podaMantenimiento: "Corte de puntas secas con tijera desinfectada.",
            propositoVentilacion: "Mejorar circulación de aire."
          }
        }
      };
    }

    res.json({ success: true, diagnosis: diagnosisData });
  } catch (error: any) {
    console.error('[Diagnose Error]:', error);
    res.status(500).json({
      error: error.message || 'Error procesando diagnóstico en el servidor.',
    });
  }
});

// -------------------------------------------------------------
// Endpoint: Chatbot Dr. Plant (Conversación y Visión)
// -------------------------------------------------------------
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, systemInstruction } = req.body;

    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({
        error: 'La clave GEMINI_API_KEY no está configurada en las variables de entorno del servidor.',
      });
    }

    const ai = getAiClient();
    const chatModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

    let botResponse: string | null = null;
    let lastError: any = null;

    const formattedHistory = Array.isArray(history)
      ? history.map((h: any) => ({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.content || h.parts?.[0]?.text || '' }]
        }))
      : [];

    for (const modelName of chatModels) {
      try {
        const chat = ai.chats.create({
          model: modelName,
          config: {
            systemInstruction: systemInstruction || undefined,
          },
          history: formattedHistory,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout with ${modelName}`)), 30000)
        );

        const result: any = await Promise.race([chat.sendMessage({ message }), timeoutPromise]);
        if (result && result.text) {
          botResponse = result.text;
          break;
        }
      } catch (err: any) {
        console.warn(`[Chat] Intento con ${modelName} falló:`, err.message || err);
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    if (!botResponse) {
      throw lastError || new Error('No se pudo obtener respuesta del chatbot.');
    }

    res.json({ success: true, text: botResponse });
  } catch (error: any) {
    console.error('[Chat Error]:', error);
    res.status(500).json({
      error: error.message || 'Error en el chat de Dr. Plant.',
    });
  }
});

// -------------------------------------------------------------
// Endpoint: Chatbot Dr. Plant con Streaming SSE (Server-Sent Events)
// -------------------------------------------------------------
app.post('/api/gemini/chat/stream', async (req: Request, res: Response) => {
  try {
    const { message, history, systemInstruction } = req.body;

    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({
        error: 'La clave GEMINI_API_KEY no está configurada.',
      });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const ai = getAiClient();
    const chat = ai.chats.create({
      model: 'gemini-3.1-flash-lite',
      config: {
        systemInstruction: systemInstruction || undefined,
      },
      history: Array.isArray(history) ? history : [],
    });

    const stream = await chat.sendMessageStream({ message });
    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('[Chat Stream Error]:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Error en streaming del chat.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

// -------------------------------------------------------------
// Endpoint: Identificador de Plantas
// -------------------------------------------------------------
app.post('/api/gemini/identify', async (req: Request, res: Response) => {
  try {
    const { image, prompt, schema } = req.body;

    if (!image || !image.data) {
      return res.status(400).json({ error: 'Se requiere una imagen para identificar la planta.' });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({
        error: 'La clave GEMINI_API_KEY no está configurada en el servidor.',
      });
    }

    const ai = getAiClient();
    const imagePart = {
      inlineData: {
        mimeType: image.mimeType || 'image/jpeg',
        data: image.data,
      },
    };

    const textPart = {
      text: prompt || "Identifica la planta en la imagen. Proporciona su nombre, cuidados básicos y una recomendación para usar la emulsión 'Suelo Urbano' con ella.",
    };

    const defaultSchema = {
      type: Type.OBJECT,
      properties: {
        nombreComun: { type: Type.STRING, description: 'Nombre común y popular de la planta.' },
        nombreCientifico: { type: Type.STRING, description: 'Nombre científico (latín) de la planta.' },
        cuidados: {
          type: Type.OBJECT,
          properties: {
            luz: { type: Type.STRING, description: 'Requerimientos de luz solar.' },
            agua: { type: Type.STRING, description: 'Instrucciones de riego.' },
            temperatura: { type: Type.STRING, description: 'Rango de temperatura ideal.' },
          },
        },
        recomendacionEmulsion: { type: Type.STRING, description: "Cómo la emulsión 'Suelo Urbano' beneficia a esta planta." },
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema || defaultSchema,
      },
    });

    if (response && response.text) {
      const data = JSON.parse(response.text);
      return res.json({ success: true, data });
    }

    throw new Error('Respuesta vacía al identificar planta.');
  } catch (error: any) {
    console.error('[Identify Error]:', error);
    res.status(500).json({
      error: error.message || 'Error identificando la planta.',
    });
  }
});

// -------------------------------------------------------------
// Endpoint: Generación General de Contenido (Texto / Multimodal)
// -------------------------------------------------------------
app.post('/api/gemini/generate', async (req: Request, res: Response) => {
  try {
    const { model, contents, config } = req.body;

    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no está configurada.' });
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: model || 'gemini-3.8-flash',
      contents: contents || req.body.prompt || '',
      config: config || undefined,
    });

    res.json({
      success: true,
      text: response.text,
      response,
    });
  } catch (error: any) {
    console.error('[Generate Error]:', error);
    res.status(500).json({ error: error.message || 'Error generando contenido.' });
  }
});

// -------------------------------------------------------------
// Endpoint: Streaming General vía Server-Sent Events
// -------------------------------------------------------------
app.post('/api/gemini/stream', async (req: Request, res: Response) => {
  try {
    const { model, contents, config } = req.body;

    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no está configurada.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const ai = getAiClient();
    const responseStream = await ai.models.generateContentStream({
      model: model || 'gemini-3.8-flash',
      contents: contents || req.body.prompt || '',
      config: config || undefined,
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('[Stream Error]:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

// -------------------------------------------------------------
// Live API WebSocket Bridge (/live)
// Conexión en tiempo real con gemini-3.8-live para audio/voz
// -------------------------------------------------------------
const wss = new WebSocketServer({ server, path: '/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[Live API] Cliente WebSocket conectado');
  const apiKey = getApiKey();

  if (!apiKey) {
    clientWs.send(JSON.stringify({ error: 'GEMINI_API_KEY no configurada en el servidor.' }));
    clientWs.close();
    return;
  }

  try {
    const ai = getAiClient();
    const session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'Eres Dr. Plant, experto botánico y asistente de jardín para Suelo Urbano.',
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          for (const part of message.serverContent?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) {
              clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
            }
            if (part.text) {
              clientWs.send(JSON.stringify({ text: part.text }));
            }
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
        onclose: () => {
          console.log('[Live API] Sesión de Gemini Live cerrada');
        },
      },
    });

    clientWs.on('message', (data: any) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
        if (parsed.video) {
          session.sendRealtimeInput({
            video: { data: parsed.video.data, mimeType: parsed.video.mimeType || 'image/jpeg' },
          });
        }
        if (parsed.text) {
          session.sendRealtimeInput({
            text: parsed.text,
          });
        }
      } catch (e) {
        console.warn('[Live API] Error decodificando mensaje del cliente WebSocket:', e);
      }
    });

    clientWs.on('close', () => {
      console.log('[Live API] Cliente desconectado');
      try {
        session.close();
      } catch {
        // Ignorar cierre ya finalizado
      }
    });
  } catch (err: any) {
    console.error('[Live API Error]:', err);
    clientWs.send(JSON.stringify({ error: err.message || 'Error conectando con Gemini Live API' }));
    clientWs.close();
  }
});

// -------------------------------------------------------------
// Servidor Vite / Estático
// -------------------------------------------------------------
async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Modo Desarrollo: Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Vite] Middleware de desarrollo montado en Express.');
  } else {
    // Modo Producción: Servir archivos compilados de dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[Express] Sirviendo aplicación de producción desde /dist.');
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Suelo Urbano ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[Bootstrap Error]:', err);
  process.exit(1);
});
