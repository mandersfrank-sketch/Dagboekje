import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, Quote } from 'lucide-react';

interface QuoteData {
  date: string;
  quote: string;
  author: string;
}

const STORAGE_KEY = 'dagboek_spreuk_van_de_dag';

// Helper to get local YYYY-MM-DD
function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const FALLBACK_QUOTE: QuoteData = {
  date: getLocalDateString(),
  quote: 'Elke nieuwe dag is een blanco bladzijde om met dankbaarheid te vullen.',
  author: 'Dagelijkse reflectie',
};

export const DailyQuote: React.FC = () => {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchNewQuote = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server status: ${response.status}`);
      }

      const data = await response.json();
      const newQuoteData: QuoteData = {
        date: getLocalDateString(),
        quote: data.quote || FALLBACK_QUOTE.quote,
        author: data.author || FALLBACK_QUOTE.author,
      };

      setQuoteData(newQuoteData);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newQuoteData));
      } catch (err) {
        console.warn('Kon spreuk niet opslaan in localStorage', err);
      }
    } catch (err) {
      console.error('Fout bij ophalen van spreuk:', err);
      setFetchError('Kon geen nieuwe spreuk ophalen. Er is een vervangende spreuk getoond.');
      // If no quote is set yet, show fallback
      if (!quoteData) {
        setQuoteData(FALLBACK_QUOTE);
      }
    } finally {
      setIsLoading(false);
    }
  }, [quoteData]);

  useEffect(() => {
    const today = getLocalDateString();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: QuoteData = JSON.parse(stored);
        // If the stored quote is from today, use it
        if (parsed && parsed.date === today && parsed.quote) {
          setQuoteData(parsed);
          return;
        }
      }
    } catch (err) {
      console.warn('Fout bij uitlezen localStorage voor spreuk:', err);
    }

    // Otherwise, generate quote of the day automatically
    fetchNewQuote(false);
  }, []);

  return (
    <section
      id="daily-quote-section"
      aria-label="Spreuk van de dag"
      className="bg-[#ffffff] dark:bg-[#251d18] rounded-2xl border border-[#d8cabb] dark:border-[#3e3027] shadow-xs p-5 sm:p-6 transition-colors flex flex-col justify-between"
    >
      <div>
      {/* Header Tag */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#ded1be] dark:border-[#3e3027]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f4eee6] dark:bg-[#332720] border border-[#ded3c5] dark:border-[#4d3c32] text-xs font-bold text-[#163f57] dark:text-[#f2ebe1]">
          <Sparkles className="w-3.5 h-3.5 text-[#8a5f2e] dark:text-[#cfa373]" />
          <span>Spreuk van de dag</span>
        </div>
        <Quote className="w-5 h-5 text-[#8a5f2e]/60 dark:text-[#cfa373]/60" />
      </div>

      {/* Quote Display */}
      <div className="py-4">
        {quoteData ? (
          <blockquote className="space-y-2">
            <p
              id="daily-quote-text"
              className="text-base sm:text-lg font-serif italic text-[#163f57] dark:text-[#f5ede6] leading-relaxed tracking-wide font-normal"
            >
              &ldquo;{quoteData.quote}&rdquo;
            </p>
            <footer className="text-right">
              <cite
                id="daily-quote-author"
                className="text-xs sm:text-sm font-semibold text-[#8a5f2e] dark:text-[#cfa373] not-italic block"
              >
                &mdash; {quoteData.author}
              </cite>
            </footer>
          </blockquote>
        ) : (
          <div className="py-4 flex items-center justify-center gap-2 text-sm text-[#6b5847] dark:text-[#c9b9a9] font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-[#8a5f2e] dark:text-[#cfa373]" />
            <span>Spreuk van de dag aan het laden...</span>
          </div>
        )}
      </div>

      {fetchError && (
        <p className="text-xs text-rose-800 dark:text-rose-300 font-medium mb-3">
          {fetchError}
        </p>
      )}
      </div>

      {/* Action Button: Nieuwe spreuk */}
      <div className="pt-3 border-t border-[#ded1be] dark:border-[#3e3027] flex items-center justify-between">
        <p className="text-xs text-[#6b5847] dark:text-[#c9b9a9] font-medium hidden sm:block">
          Gegenereerd door AI &bull; Verandert elke dag
        </p>
        <button
          id="new-quote-btn"
          type="button"
          onClick={() => fetchNewQuote(true)}
          disabled={isLoading}
          aria-label="Vraag een andere spreuk op"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#163f57] dark:text-[#f2ebe1] bg-[#f4eee6] dark:bg-[#332720] hover:bg-[#eae0d2] dark:hover:bg-[#3f3128] active:bg-[#ded1be] dark:active:bg-[#48372d] disabled:opacity-60 transition-all border border-[#ded3c5] dark:border-[#4d3c32] cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#8a5f2e] dark:text-[#cfa373] ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Spreuk genereren...' : 'Nieuwe spreuk'}</span>
        </button>
      </div>
    </section>
  );
};
