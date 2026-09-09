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

function getRandomRussianWord() {
  const index = Math.floor(Math.random() * FALLBACK_RUSSIAN_WORDS.length);
  return FALLBACK_RUSSIAN_WORDS[index];
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
    return sendJson(res, 200, getRandomRussianWord());
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
        4500
      );

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.word && parsed.phonetic && parsed.translation) {
          return sendJson(res, 200, {
            word: parsed.word,
            phonetic: parsed.phonetic,
            translation: parsed.translation,
            exampleRu: parsed.exampleRu || "",
            exampleNl: parsed.exampleNl || "",
          });
        }
      }
    } catch {
      continue;
    }
  }

  return sendJson(res, 200, getRandomRussianWord());
}
