import React, { useState, useEffect, useCallback } from 'react';
import { Languages, RefreshCw, Volume2 } from 'lucide-react';

interface RussianWordData {
  date: string;
  word: string;
  phonetic: string;
  translation: string;
  exampleRu?: string;
  exampleNl?: string;
}

const STORAGE_KEY = 'dagboek_russisch_woord_van_de_dag';

function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const FALLBACK_RUSSIAN_WORD: RussianWordData = {
  date: getLocalDateString(),
  word: "Вдохновение",
  phonetic: "vdach-na-VEN-je",
  translation: "Inspiratie / bezieling",
  exampleRu: "Музыка дарит мне вдохновение.",
  exampleNl: "Muziek geeft mij inspiratie.",
};

export const DailyRussianWord: React.FC = () => {
  const [wordData, setWordData] = useState<RussianWordData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchNewWord = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await fetch('/api/russian-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server status: ${response.status}`);
      }

      const data = await response.json();
      const newWordData: RussianWordData = {
        date: getLocalDateString(),
        word: data.word || FALLBACK_RUSSIAN_WORD.word,
        phonetic: data.phonetic || FALLBACK_RUSSIAN_WORD.phonetic,
        translation: data.translation || FALLBACK_RUSSIAN_WORD.translation,
        exampleRu: data.exampleRu || FALLBACK_RUSSIAN_WORD.exampleRu,
        exampleNl: data.exampleNl || FALLBACK_RUSSIAN_WORD.exampleNl,
      };

      setWordData(newWordData);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newWordData));
      } catch (err) {
        console.warn('Kon Russisch woord niet opslaan in localStorage', err);
      }
    } catch (err) {
      console.warn('Fout bij ophalen van Russisch woord:', err);
      setFetchError('Kon geen nieuw woord ophalen. Er is een woordenboekwoord getoond.');
      if (!wordData) {
        setWordData(FALLBACK_RUSSIAN_WORD);
      }
    } finally {
      setIsLoading(false);
    }
  }, [wordData]);

  useEffect(() => {
    const today = getLocalDateString();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: RussianWordData = JSON.parse(stored);
        if (parsed && parsed.date === today && parsed.word) {
          setWordData(parsed);
          return;
        }
      }
    } catch (err) {
      console.warn('Fout bij uitlezen localStorage voor Russisch woord:', err);
    }

    fetchNewWord(false);
  }, []);

  return (
    <section
      id="daily-russian-word-section"
      aria-label="Russisch woord van de dag"
      className="bg-[#ffffff] dark:bg-[#251d18] rounded-2xl border border-[#d8cabb] dark:border-[#3e3027] shadow-xs p-5 sm:p-6 transition-colors flex flex-col justify-between"
    >
      <div>
        {/* Header Tag */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#ded1be] dark:border-[#3e3027]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f4eee6] dark:bg-[#332720] border border-[#ded3c5] dark:border-[#4d3c32] text-xs font-bold text-[#163f57] dark:text-[#f2ebe1]">
            <Languages className="w-3.5 h-3.5 text-[#8a5f2e] dark:text-[#cfa373]" />
            <span>Russisch woord van de dag</span>
          </div>
          <span className="text-xs font-serif font-bold text-[#8a5f2e]/70 dark:text-[#cfa373]/70">RU &rarr; NL</span>
        </div>

        {/* Content Display */}
        <div className="py-4 space-y-2.5">
          {wordData ? (
            <div>
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span
                  id="daily-russian-word-cyrillic"
                  className="text-2xl sm:text-3xl font-serif font-bold text-[#163f57] dark:text-[#fffdfa] tracking-wide"
                >
                  {wordData.word}
                </span>
                <span
                  id="daily-russian-word-phonetic"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-[#f4eee6] dark:bg-[#332720] text-[#6b5847] dark:text-[#d4c3b2] border border-[#ded3c5] dark:border-[#4d3c32]"
                  title="Fonetische uitspraak"
                >
                  <Volume2 className="w-3 h-3 text-[#8a5f2e] dark:text-[#cfa373]" />
                  [{wordData.phonetic}]
                </span>
              </div>

              <div className="mt-2">
                <p className="text-xs font-semibold text-[#8a5f2e] dark:text-[#cfa373] uppercase tracking-wider">
                  Betekenis
                </p>
                <p
                  id="daily-russian-word-translation"
                  className="text-base sm:text-lg font-medium text-[#163f57] dark:text-[#f5ede6]"
                >
                  {wordData.translation}
                </p>
              </div>

              {wordData.exampleRu && (
                <div className="mt-3 p-2.5 rounded-xl bg-[#f7f2ea] dark:bg-[#1d1713] border border-[#ded3c5] dark:border-[#382c23] text-xs space-y-1">
                  <p className="font-serif italic text-[#163f57] dark:text-[#f5ede6]">
                    &ldquo;{wordData.exampleRu}&rdquo;
                  </p>
                  {wordData.exampleNl && (
                    <p className="text-[#6b5847] dark:text-[#c9b9a9] font-medium">
                      {wordData.exampleNl}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 flex items-center justify-center gap-2 text-sm text-[#6b5847] dark:text-[#c9b9a9] font-medium">
              <RefreshCw className="w-4 h-4 animate-spin text-[#8a5f2e] dark:text-[#cfa373]" />
              <span>Russisch woord aan het laden...</span>
            </div>
          )}
        </div>

        {fetchError && (
          <p className="text-xs text-rose-800 dark:text-rose-300 font-medium mb-3">
            {fetchError}
          </p>
        )}
      </div>

      {/* Action Button: Nieuw woord */}
      <div className="pt-3 border-t border-[#ded1be] dark:border-[#3e3027] flex items-center justify-between">
        <p className="text-xs text-[#6b5847] dark:text-[#c9b9a9] font-medium hidden sm:block">
          Woordenboek &bull; Fonetische transcriptie
        </p>
        <button
          id="new-russian-word-btn"
          type="button"
          onClick={() => fetchNewWord(true)}
          disabled={isLoading}
          aria-label="Vraag een ander woord op"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#163f57] dark:text-[#f2ebe1] bg-[#f4eee6] dark:bg-[#332720] hover:bg-[#eae0d2] dark:hover:bg-[#3f3128] active:bg-[#ded1be] dark:active:bg-[#48372d] disabled:opacity-60 transition-all border border-[#ded3c5] dark:border-[#4d3c32] cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#8a5f2e] dark:text-[#cfa373] ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Laden...' : 'Nieuw woord'}</span>
        </button>
      </div>
    </section>
  );
};
