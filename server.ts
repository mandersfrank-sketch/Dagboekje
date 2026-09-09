import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Curated fallbacks in case of API high demand, network issues, or absence of key
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

let lastFallbackIndex = -1;
function getRandomFallback() {
  let newIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  if (newIndex === lastFallbackIndex) {
    newIndex = (newIndex + 1) % FALLBACK_QUOTES.length;
  }
  lastFallbackIndex = newIndex;
  return FALLBACK_QUOTES[newIndex];
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timeout")), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

// API endpoint to generate an inspiring daily reflection quote
app.post("/api/quote", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json(getRandomFallback());
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

  const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];

  for (const model of candidateModels) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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
        3500
      );

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.quote) {
          return res.json({
            quote: parsed.quote,
            author: parsed.author || "Dagelijkse reflectie",
          });
        }
      }
    } catch {
      // Model temporarily busy or under high demand; silently proceed to next candidate or fallback
      continue;
    }
  }

  // If live models are temporarily under high demand, serve an inspiring curated quote
  return res.json(getRandomFallback());
});

// Curated verified Russian dictionary words with phonetic pronunciation and Dutch translation
const FALLBACK_RUSSIAN_WORDS = [
  {
    word: "Вдохновение",
    phonetic: "vdach-na-VEN-je",
    translation: "Inspiratie / bezieling",
    exampleRu: "Музыка дарит мне вдохновение.",
    exampleNl: "Muziek geeft mij inspiratie.",
  },
  {
    word: "Надежда",
    phonetic: "na-DJEZH-da",
    translation: "Hoop",
    exampleRu: "Надежда умирает последней.",
    exampleNl: "Hoop sterft als laatste.",
  },
  {
    word: "Дружба",
    phonetic: "DROEZJ-ba",
    translation: "Vriendschap",
    exampleRu: "Настоящая дружба бесценна.",
    exampleNl: "Echte vriendschap is onbetaalbaar.",
  },
  {
    word: "Мечта",
    phonetic: "mjetsj-TA",
    translation: "Droom / diepste wens",
    exampleRu: "Следуй за своей мечтой.",
    exampleNl: "Volg je droom.",
  },
  {
    word: "Спокойствие",
    phonetic: "spa-KOJ-stvi-je",
    translation: "Rust / sereniteit / kalmte",
    exampleRu: "Я ценю душевное спокойствие.",
    exampleNl: "Ik waardeer gemoedsrust.",
  },
  {
    word: "Спасибо",
    phonetic: "spa-SEE-ba",
    translation: "Dankjewel / bedankt",
    exampleRu: "Большое спасибо за помощь!",
    exampleNl: "Hartelijk dank voor de hulp!",
  },
  {
    word: "Доброта",
    phonetic: "da-bra-TA",
    translation: "Vriendelijkheid / goedheid",
    exampleRu: "Доброта согревает сердце.",
    exampleNl: "Vriendelijkheid verwarmt het hart.",
  },
  {
    word: "Уют",
    phonetic: "oe-JOET",
    translation: "Gezelligheid / behaaglijkheid / knusheid",
    exampleRu: "В этом доме царит настоящий уют.",
    exampleNl: "In dit huis heerst echte gezelligheid.",
  },
  {
    word: "Счастье",
    phonetic: "SHTSHAS-tje",
    translation: "Geluk / vreugde",
    exampleRu: "Счастье живёт в простых моментах.",
    exampleNl: "Geluk schuilt in eenvoudige momenten.",
  },
  {
    word: "Терпение",
    phonetic: "tjer-PJE-ni-je",
    translation: "Geduld",
    exampleRu: "Терпение помогает преодолеть всё.",
    exampleNl: "Geduld helpt alles te overwinnen.",
  },
  {
    word: "Мудрость",
    phonetic: "MOE-drast",
    translation: "Wijsheid",
    exampleRu: "Мудрость приходит с опытом.",
    exampleNl: "Wijsheid komt met ervaring.",
  },
  {
    word: "Любовь",
    phonetic: "lju-BOF",
    translation: "Liefde",
    exampleRu: "Любовь даёт нам силу.",
    exampleNl: "Liefde geeft ons kracht.",
  },
  {
    word: "Красота",
    phonetic: "kra-sa-TA",
    translation: "Schoonheid",
    exampleRu: "Красота вокруг нас.",
    exampleNl: "Schoonheid is overal om ons heen.",
  },
  {
    word: "Благодарность",
    phonetic: "bla-ga-DAR-nast",
    translation: "Dankbaarheid",
    exampleRu: "Благодарность открывает сердце.",
    exampleNl: "Dankbaarheid opent het hart.",
  },
  {
    word: "Искренность",
    phonetic: "EES-krjen-nast",
    translation: "Oprechtheid / eerlijkheid",
    exampleRu: "Я ценю искренность в людях.",
    exampleNl: "Ik waardeer oprechtheid in mensen.",
  },
  {
    word: "Свобода",
    phonetic: "sva-BO-da",
    translation: "Vrijheid",
    exampleRu: "Свобода начинается внутри нас.",
    exampleNl: "Vrijheid begint vanbinnen.",
  },
  {
    word: "Гармония",
    phonetic: "gar-MO-ni-ja",
    translation: "Harmonie / evenwicht",
    exampleRu: "Найди гармонию с природой.",
    exampleNl: "Vind harmonie met de natuur.",
  },
  {
    word: "Теплота",
    phonetic: "tjep-la-TA",
    translation: "Warmte / hartelijkheid",
    exampleRu: "Душевная теплота согревает душу.",
    exampleNl: "Gemoedelijke warmte verwarmt de ziel.",
  },
];

let lastRussianIndex = -1;
function getRandomRussianWord() {
  let newIndex = Math.floor(Math.random() * FALLBACK_RUSSIAN_WORDS.length);
  if (newIndex === lastRussianIndex) {
    newIndex = (newIndex + 1) % FALLBACK_RUSSIAN_WORDS.length;
  }
  lastRussianIndex = newIndex;
  return FALLBACK_RUSSIAN_WORDS[newIndex];
}

// API endpoint for Russisch woord van de dag
app.post("/api/russian-word", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json(getRandomRussianWord());
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
    "Selecteer een echt bestaand, betekenisvol Russisch woord uit een officieel Russisch woordenboek voor een Nederlandse leerling (zoals Вдохновение, Надежда, Мечта, Уют, Дружба, Спокойствие, Счастье, etc.). Geef een JSON object terug met: 'word' (het woord in Cyrillisch schrift), 'phonetic' (de fonetische uitspraak in Latijns schrift voor Nederlandstaligen, bijv. 'vdach-na-VEN-je'), 'translation' (korte Nederlandse vertaling en betekenis), 'exampleRu' (één enkele korte Russische voorbeeldzin van maximaal 7 woorden), 'exampleNl' (de Nederlandse vertaling van die voorbeeldzin). Geen herhalingen.";

  const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];

  for (const model of candidateModels) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                word: {
                  type: Type.STRING,
                  description: "Het Russische woord in Cyrillisch schrift (1 enkel woord).",
                },
                phonetic: {
                  type: Type.STRING,
                  description: "De fonetische uitspraak van het woord voor Nederlandstaligen.",
                },
                translation: {
                  type: Type.STRING,
                  description: "De Nederlandse vertaling van het woord.",
                },
                exampleRu: {
                  type: Type.STRING,
                  description: "Eén enkele korte voorbeeldzin in het Russisch (maximaal 7 woorden).",
                },
                exampleNl: {
                  type: Type.STRING,
                  description: "De Nederlandse vertaling van de voorbeeldzin.",
                },
              },
              required: ["word", "phonetic", "translation", "exampleRu", "exampleNl"],
            },
          },
        }),
        3500
      );

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.word && parsed.phonetic && parsed.translation) {
          return res.json({
            word: parsed.word,
            phonetic: parsed.phonetic,
            translation: parsed.translation,
            exampleRu: parsed.exampleRu || "",
            exampleNl: parsed.exampleNl || "",
          });
        }
      }
    } catch {
      // Model temporarily busy or under high demand; silently try next candidate or curated fallback
      continue;
    }
  }

  return res.json(getRandomRussianWord());
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
