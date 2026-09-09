import React from 'react';
import { Calendar, Edit3, Trash2 } from 'lucide-react';
import { DiaryEntry } from '../types';
import { MoodBadge } from './MoodBadge';
import { formatDutchDate } from '../utils/storage';

interface EntryCardProps {
  entry: DiaryEntry;
  onEdit: (entry: DiaryEntry) => void;
  onDeleteRequest: (entry: DiaryEntry) => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  onEdit,
  onDeleteRequest,
}) => {
  return (
    <article
      id={`diary-entry-card-${entry.id}`}
      className="bg-[#ffffff] dark:bg-[#251d18] rounded-2xl border border-[#d8cabb] dark:border-[#3e3027] shadow-xs hover:shadow-md hover:border-[#cfa373] dark:hover:border-[#cfa373] transition-colors p-6 sm:p-7"
    >
      {/* Top Header: Date, Mood Badge, and Edit/Delete Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#ded1be] dark:border-[#3e3027]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[#163f57] dark:text-[#f5ede6] font-bold text-base sm:text-lg">
            <Calendar className="w-4 h-4 text-[#8a5f2e] dark:text-[#cfa373] shrink-0" />
            <time dateTime={entry.date} className="capitalize">
              {formatDutchDate(entry.date)}
            </time>
          </div>
          <MoodBadge mood={entry.mood} size="sm" />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            id={`edit-entry-btn-${entry.id}`}
            type="button"
            onClick={() => onEdit(entry)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#163f57] dark:text-[#f2ebe1] bg-[#ded1be] dark:bg-[#382c23] hover:bg-[#d0c0ab] dark:hover:bg-[#47382d] rounded-lg transition-colors cursor-pointer border border-[#c2b09c] dark:border-[#4d3c32]"
            aria-label={`Entry van ${entry.date} bewerken`}
          >
            <Edit3 className="w-3.5 h-3.5 text-[#8a5f2e] dark:text-[#cfa373]" />
            <span>Bewerken</span>
          </button>

          <button
            id={`delete-entry-btn-${entry.id}`}
            type="button"
            onClick={() => onDeleteRequest(entry)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-800 dark:text-rose-200 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900/80 rounded-lg transition-colors cursor-pointer border border-rose-300 dark:border-rose-800"
            aria-label={`Entry van ${entry.date} verwijderen`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
            <span>Verwijderen</span>
          </button>
        </div>
      </div>

      {/* 4 Answers Grid/Stack */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Vraag 1 */}
        <div className="bg-[#f7f2ea] dark:bg-[#1d1713] rounded-xl p-4 border border-[#ded3c5] dark:border-[#382c23]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#4d3621] dark:text-[#cfa373] mb-1.5">
            1. Hoe voelde je je vandaag?
          </h4>
          <p className="text-sm text-[#163f57] dark:text-[#f5ede6] leading-relaxed whitespace-pre-wrap font-semibold">
            {entry.q1_feeling || <span className="text-[#6b5847]/75 dark:text-[#a8988a] italic font-normal">Geen antwoord ingevuld</span>}
          </p>
        </div>

        {/* Vraag 2 */}
        <div className="bg-[#f7f2ea] dark:bg-[#1d1713] rounded-xl p-4 border border-[#ded3c5] dark:border-[#382c23]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#4d3621] dark:text-[#cfa373] mb-1.5">
            2. Wat was het hoogtepunt van je dag?
          </h4>
          <p className="text-sm text-[#163f57] dark:text-[#f5ede6] leading-relaxed whitespace-pre-wrap font-semibold">
            {entry.q2_highlight || <span className="text-[#6b5847]/75 dark:text-[#a8988a] italic font-normal">Geen antwoord ingevuld</span>}
          </p>
        </div>

        {/* Vraag 3 */}
        <div className="bg-[#f7f2ea] dark:bg-[#1d1713] rounded-xl p-4 border border-[#ded3c5] dark:border-[#382c23]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#4d3621] dark:text-[#cfa373] mb-1.5">
            3. Wat heb je vandaag geleerd?
          </h4>
          <p className="text-sm text-[#163f57] dark:text-[#f5ede6] leading-relaxed whitespace-pre-wrap font-semibold">
            {entry.q3_learned || <span className="text-[#6b5847]/75 dark:text-[#a8988a] italic font-normal">Geen antwoord ingevuld</span>}
          </p>
        </div>

        {/* Vraag 4 */}
        <div className="bg-[#f7f2ea] dark:bg-[#1d1713] rounded-xl p-4 border border-[#ded3c5] dark:border-[#382c23]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#4d3621] dark:text-[#cfa373] mb-1.5">
            4. Waar kijk je morgen naar uit?
          </h4>
          <p className="text-sm text-[#163f57] dark:text-[#f5ede6] leading-relaxed whitespace-pre-wrap font-semibold">
            {entry.q4_lookingForward || <span className="text-[#6b5847]/75 dark:text-[#a8988a] italic font-normal">Geen antwoord ingevuld</span>}
          </p>
        </div>
      </div>
    </article>
  );
};
