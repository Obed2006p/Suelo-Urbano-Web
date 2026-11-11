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
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    if (!diagnosisData) {
      throw lastError || new Error('No se pudo generar el diagnóstico con los modelos disponibles.');
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

    for (const modelName of chatModels) {
      try {
        const chat = ai.chats.create({
          model: modelName,
          config: {
            systemInstruction: systemInstruction || undefined,
          },
          history: Array.isArray(history) ? history : [],
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
