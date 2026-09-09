import type { IncomingMessage, ServerResponse } from "http";
import { GoogleGenAI, Type } from "@google/genai";

interface VercelRequest extends IncomingMessage {
  method?: string;
  body?: any;
  query?: { [key: string]: string | string[] };
}

interface VercelResponse extends ServerResponse {
  status?: (statusCode: number) => VercelResponse;
  json?: (body: any) => void;
  send?: (body: any) => void;
}

function sendJson(res: VercelResponse, statusCode: number, data: any) {
  if (typeof res.status === "function") {
    res.status(statusCode);
  } else {
    res.statusCode = statusCode;
  }
  if (typeof res.json === "function") {
    return res.json(data);
  }
  if (typeof res.send === "function") {
    return res.send(JSON.stringify(data));
  }
  if (typeof res.setHeader === "function") {
    res.setHeader("Content-Type", "application/json");
  }
  if (typeof res.end === "function") {
    return res.end(JSON.stringify(data));
  }
}

const FALLBACK_QUOTES = [
  {
    quote: "Sta even stil bij wat er vandaag wél goed ging, hoe klein het ook leek.",
    author: "Dagelijkse reflectie",
  },
  {
    quote: "Geluk zit niet in het bezitten van veel, maar in het waarderen van het gewone.",
    author: "Seneca",
  },
  {
    quote: "Elke nieuwe dag is een blanco bladzijde in het boek van je leven.",
    author: "Dagelijkse wijsheid",
  },
  {
    quote: "Wie tevreden is met wat hij heeft, is de rijkste mens ter wereld.",
    author: "Laozi",
  },
  {
    quote: "Aandacht is de meest zeldzame en pure vorm van vrijgevigheid.",
    author: "Simone Weil",
  },
  {
    quote: "Neem de tijd om rustig adem te halen. Rust is ook productief.",
    author: "Mindfulness",
  },
  {
    quote: "Je hoeft niet de hele trap te zien om de eerste trede te zetten.",
    author: "Martin Luther King Jr.",
  },
  {
    quote: "De stilte tussen de woorden is net zo belangrijk als de woorden zelf.",
    author: "Dagelijkse wijsheid",
  },
  {
    quote: "Wat je vandaag plant in geduld, oogst je morgen in vrede.",
    author: "Marcus Aurelius",
  },
  {
    quote: "Wees mild voor jezelf. Groeien gebeurt niet van de ene op de andere dag.",
    author: "Zelfcompassie",
  },
  {
    quote: "Het mooiste wat je kunt ontdekken is dat je genoeg bent zoals je bent.",
    author: "Dagelijkse reflectie",
  },
  {
    quote: "Kleine stappen in de goede richting zijn nog steeds vooruitgang.",
    author: "Levenskunst",
  },
];

function getRandomFallback() {
  const index = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return FALLBACK_QUOTES[index];
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timeout")), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  if (typeof res.setHeader === "function") {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    );
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return sendJson(res, 200, getRandomFallback());
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const prompt =
    "Genereer een unieke, inspirerende en bemoedigende spreuk of reflectiegedachte in het Nederlands voor een persoonlijk dagboek. Geen clichés, maar een betekenisvol inzicht over dankbaarheid, rust, levenslust, veerkracht of zelfcompassie. Geef het resultaat in JSON formaat met twee velden: 'quote' (maximaal 2 zinnen) en 'author' (naam van een filosoof/auteur of 'Dagelijkse reflectie').";

  const candidateModels = ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite"];

  for (const model of candidateModels) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                quote: {
                  type: Type.STRING,
                  description: "De inspirerende spreuk in het Nederlands (1 tot 2 zinnen).",
                },
                author: {
                  type: Type.STRING,
                  description: "De naam van de bedenker of 'Dagelijkse reflectie'.",
                },
              },
              required: ["quote", "author"],
            },
          },
        }),
        4500
      );

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.quote) {
          return sendJson(res, 200, {
            quote: parsed.quote,
            author: parsed.author || "Dagelijkse reflectie",
          });
        }
      }
    } catch {
      continue;
    }
  }

  return sendJson(res, 200, getRandomFallback());
}
