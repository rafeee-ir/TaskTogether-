import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const PORT = 3000;
const app = express();

app.use(express.json());

// Lazy-initialize Gemini client to prevent startup crash if GEMINI_API_KEY is not defined
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// 1. API: HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. API: FAMILY CHAT PROXY
app.post('/api/chat', async (req, res) => {
  const { message, tasksList } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message payload is required' });
    return;
  }

  const ai = getGeminiClient();

  // If Gemini API is not configured, reply with a simulated smart auto-response
  if (!ai) {
    let replyText = "I recorded your message. (Configure GEMINI_API_KEY in Secrets panel for live AI behavior!)";
    let autoCreatedTask: any = null;

    const lower = message.toLowerCase();
    if (lower.includes("buy") || lower.includes("grocery") || lower.includes("bread") || lower.includes("خرید")) {
      replyText = "I noticed you mentioned buying items! I've automatically added 'Food Shopping' to the household board for Maryam (Mom).";
      autoCreatedTask = {
        title: "Grocery Shopping",
        description: "Fetch groceries including bread, dairy, and fruits.",
        priority: "MEDIUM",
        assignedTo: "Maryam (Mom)"
      };
    } else if (lower.includes("clean") || lower.includes("wash") || lower.includes("تمیز")) {
      replyText = "Chores scheduled! I added 'Clean living room' to the board for Sarah.";
      autoCreatedTask = {
        title: "Clean living room",
        description: "Dust shelves and vacuum carpet.",
        priority: "HIGH",
        assignedTo: "Sarah"
      };
    } else if (lower.includes("car") || lower.includes("oil") || lower.includes("ماشین")) {
      replyText = "Maintenance logged! Added 'Car inspection' onto the shared task board.";
      autoCreatedTask = {
        title: "Check car oil",
        description: "Verify lubricant levels and tire pressures.",
        priority: "HIGH",
        assignedTo: "Ali (Dad)"
      };
    } else {
      replyText = "Got it! Feel free to ask me to add chore lists or tasks, e.g. 'add task grocery shopping'.";
    }

    res.json({ reply: replyText, createdTask: autoCreatedTask, simulated: true });
    return;
  }

  try {
    const formattedTasks = tasksList && Array.isArray(tasksList) ? tasksList.join(', ') : 'None listed';

    const systemInstruction = 
      `You are TaskBot, the collaborative AI Family Companion in the "TaskTogether" smartphone application (for com.karamana.tasktogether).
      Your job is to respond to family chat messages in a warm, helpful, family-oriented tone. Highlight cooperation.
      
      Here are the current listed active family tasks: [ ${formattedTasks} ].
      
      CRITICAL INSTRUCTION:
      If the user is asking you to make, add, plan, schedule, or include a task/milestone/chore on their board (e.g. "add task clean the yard" or "can Maryam buy eggs?"),
      you must return a structured JSON response identifying that task.
      
      Your response MUST match this JSON Schema strictly:
      {
        "reply": "Your friendly text message speaking to the family group chat.",
        "createdTask": {
          "title": "A short descriptive title for the task to be created",
          "description": "More context on who should do it and when",
          "priority": "LOW" | "MEDIUM" | "HIGH",
          "assignedTo": "Maryam (Mom)" | "Ali (Dad)" | "Sarah" | "Everyone"
        } (This createdTask object is OPTIONAL. Include it ONLY if the user explicitly requested to schedule/add/write a task)
      }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: message,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "The friendly written conversational chatbot response in the chat thread."
            },
            createdTask: {
              type: Type.OBJECT,
              description: "Optional task structure if requested.",
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: {
                  type: Type.STRING,
                  enum: ["LOW", "MEDIUM", "HIGH"]
                },
                assignedTo: { type: Type.STRING }
              },
              required: ["title"]
            }
          },
          required: ["reply"]
        }
      }
    });

    const bodyText = response.text || "{}";
    const data = JSON.parse(bodyText);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ 
      reply: "Sorry family, I hit a snag connecting to my thinking core. Let's try again in a moment!",
      error: error.message 
    });
  }
});

// Configure Vite or Static Assets based on deployment environment
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TaskTogether Server] Running on http://0.0.0.0:${PORT}`);
  });
}

start().catch(err => {
  console.error("Failed to start full-stack server:", err);
});
