import React from 'react';
import { Flame } from 'lucide-react';
import { StreakInfo } from '../utils/streak';

interface StreakBannerProps {
  streakInfo: StreakInfo;
}

export const StreakBanner: React.FC<StreakBannerProps> = ({ streakInfo }) => {
  const { streak, hasEntryToday } = streakInfo;

  const streakLabel = streak === 1 ? '1 dag op rij' : `${streak} dagen op rij`;

  return (
    <section id="streak-banner-section" aria-label="Dagelijkse streak">
      <div
        id="streak-banner-card"
        className="bg-[#ffffff] dark:bg-[#251d18] border border-[#d8cabb] dark:border-[#3e3027] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs transition-colors"
      >
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div
            id="streak-flame-icon-container"
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
              streak > 0
                ? 'bg-[#163f57] border-[#8a6e55] text-amber-400 shadow-xs'
                : 'bg-[#ede4d8] dark:bg-[#382c23] border-[#d8cabb] dark:border-[#4d3c32] text-[#8a7767] dark:text-[#a39082]'
            }`}
          >
            <Flame
              className={`w-6 h-6 transition-transform ${
                streak > 0 ? 'fill-amber-400 text-amber-400 scale-110' : 'text-[#8a7767] dark:text-[#a39082]'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span
                id="streak-count-text"
                className="text-lg sm:text-2xl font-extrabold text-[#163f57] dark:text-[#fffdfa] tracking-tight"
              >
                {streakLabel}
              </span>
              {streak > 0 && (
                <span
                  id="streak-active-tag"
                  className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold border border-amber-500/30 whitespace-nowrap"
                >
                  Actief 🔥
                </span>
              )}
            </div>

            <p id="streak-subtext" className="text-xs sm:text-sm text-[#6b5847] dark:text-[#e8dacb] mt-0.5">
              {streak === 0
                ? 'Voeg vandaag een dagboek-entry toe om je streak te starten.'
                : hasEntryToday
                ? 'Geweldig! Je hebt vandaag al geschreven en je streak vastgehouden.'
                : 'Schrijf vandaag een entry om je streak niet te verliezen.'}
            </p>
          </div>
        </div>

        {/* Visual Mini Badge on larger screens */}
        <div className="hidden sm:flex flex-col items-end pl-4">
          <div className="text-xs uppercase tracking-wider text-[#8a7767] dark:text-[#d4c3b2] font-semibold">
            Dagboek Streak
          </div>
          <div className="text-xs text-[#523e2f] dark:text-[#ebdcd0] mt-0.5 font-medium">
            {hasEntryToday ? '✓ Vandaag voltooid' : 'Nog niet geschreven'}
          </div>
        </div>
      </div>
    </section>
  );
};
