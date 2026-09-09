import React, { useState, useEffect } from 'react';
import { Calendar, Heart, Check, X } from 'lucide-react';
import { DiaryEntry, MoodScore, MOOD_OPTIONS } from '../types';
import { getTodayDateString } from '../utils/storage';

interface EntryFormProps {
  initialEntry?: DiaryEntry | null;
  onSave: (entryData: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancelEdit?: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({
  initialEntry,
  onSave,
  onCancelEdit,
}) => {
  const [date, setDate] = useState<string>(getTodayDateString());
  const [mood, setMood] = useState<MoodScore>(3);
  const [q1, setQ1] = useState<string>('');
  const [q2, setQ2] = useState<string>('');
  const [q3, setQ3] = useState<string>('');
  const [q4, setQ4] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEntry) {
      setDate(initialEntry.date);
      setMood(initialEntry.mood);
      setQ1(initialEntry.q1_feeling);
      setQ2(initialEntry.q2_highlight);
      setQ3(initialEntry.q3_learned);
      setQ4(initialEntry.q4_lookingForward);
      setError(null);
    } else {
      setDate(getTodayDateString());
      setMood(3);
      setQ1('');
      setQ2('');
      setQ3('');
      setQ4('');
      setError(null);
    }
  }, [initialEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      setError('Kies een datum voor deze entry.');
      return;
    }

    if (!q1.trim() && !q2.trim() && !q3.trim() && !q4.trim()) {
      setError('Beantwoord ten minste één van de vragen om je entry op te slaan.');
      return;
    }

    setError(null);
    onSave({
      date,
      mood,
      q1_feeling: q1.trim(),
      q2_highlight: q2.trim(),
      q3_learned: q3.trim(),
      q4_lookingForward: q4.trim(),
    });

    if (!initialEntry) {
      // Reset form for next entry if in create mode
      setQ1('');
      setQ2('');
      setQ3('');
      setQ4('');
    }
  };

  const isEditing = Boolean(initialEntry);

  return (
    <form
      id="diary-entry-form"
      onSubmit={handleSubmit}
      className="bg-[#ffffff] dark:bg-[#251d18] rounded-2xl border border-[#d8cabb] dark:border-[#3e3027] shadow-xs p-6 sm:p-8 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ded1be] dark:border-[#3e3027]">
        <div>
          <h2 id="form-heading" className="text-xl sm:text-2xl font-bold text-[#163f57] dark:text-[#fffdfa] tracking-tight">
            {isEditing ? 'Entry bewerken' : 'Nieuwe dagboek-entry'}
          </h2>
          <p className="text-sm text-[#6b5847] dark:text-[#c9b9a9] mt-1 font-medium">
            {isEditing
              ? 'Pas je antwoorden of datum aan en sla je wijzigingen op.'
              : 'Neem even een rustig moment om stil te staan bij je dag.'}
          </p>
        </div>

        {isEditing && onCancelEdit && (
          <button
            id="cancel-edit-btn"
            type="button"
            onClick={onCancelEdit}
            className="inline-flex items-center gap-1.5 self-start sm:self-center px-3.5 py-1.5 text-sm font-bold text-[#163f57] dark:text-[#f2ebe1] bg-[#ded1be] dark:bg-[#382c23] hover:bg-[#d0c0ab] dark:hover:bg-[#47382d] rounded-lg transition-colors cursor-pointer border border-[#c2b09c] dark:border-[#4d3c32]"
          >
            <X className="w-4 h-4" />
            <span>Annuleren</span>
          </button>
        )}
      </div>

      {error && (
        <div
          id="form-error-alert"
          className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-sm font-bold text-rose-900 dark:text-rose-200"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Date & Mood row */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Selector */}
        <div>
          <label htmlFor="entry-date-input" className="block text-sm font-bold text-[#163f57] dark:text-[#f5ede6] mb-2">
            Datum
          </label>
          <div className="relative">
            <input
              type="date"
              id="entry-date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#faf7f2] dark:bg-[#1a1512] border border-[#c7b7a1] dark:border-[#45362b] focus:border-[#163f57] dark:focus:border-[#cfa373] focus:bg-[#ffffff] dark:focus:bg-[#16120f] focus:outline-hidden focus:ring-2 focus:ring-[#abc7cd]/60 rounded-xl text-[#163f57] dark:text-[#fffdfa] font-bold text-sm transition-colors scheme-light dark:scheme-dark"
            />
            <Calendar className="w-4 h-4 text-[#8a5f2e] dark:text-[#cfa373] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Mood Selector */}
        <div>
          <label className="block text-sm font-bold text-[#163f57] dark:text-[#f5ede6] mb-2">
            Stemming van vandaag
          </label>
          <div id="mood-selector-group" className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Stemming">
            {MOOD_OPTIONS.map((option) => {
              const isSelected = mood === option.score;
              return (
                <button
                  key={option.score}
                  id={`mood-option-${option.score}`}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setMood(option.score)}
                  title={`${option.label} (${option.score}/5)`}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? `${option.bgClass} ${option.borderClass} ring-2 ring-[#163f57] dark:ring-[#cfa373] shadow-xs scale-102 font-bold`
                      : 'bg-[#f4eee6] dark:bg-[#332720] border-[#ded3c5] dark:border-[#4d3c32] hover:bg-[#eae0d2] dark:hover:bg-[#3f3128] text-[#163f57] dark:text-[#f2ebe1]'
                  }`}
                >
                  <span className="text-xl leading-none" role="img" aria-label={option.label}>
                    {option.emoji}
                  </span>
                  <span className="text-[11px] font-bold mt-1 truncate max-w-full">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* The 4 Specific Questions */}
      <div className="mt-8 space-y-6">
        {/* Vraag 1 */}
        <div>
          <label htmlFor="q1-feeling-input" className="block text-sm font-bold text-[#163f57] dark:text-[#f5ede6] mb-1">
            1. Hoe voelde je je vandaag?
          </label>
          <p className="text-xs text-[#6b5847] dark:text-[#c9b9a9] mb-2 font-medium">
            Beschrijf je gemoedstoestand, emoties of energiepeil door de dag heen.
          </p>
          <textarea
            id="q1-feeling-input"
            rows={3}
            value={q1}
            onChange={(e) => setQ1(e.target.value)}
            placeholder="Bijvoorbeeld: Ik voelde me rustig en opgewekt, met veel focus in de ochtend..."
            className="w-full px-4 py-3 bg-[#faf7f2] dark:bg-[#1a1512] border border-[#c7b7a1] dark:border-[#45362b] focus:border-[#163f57] dark:focus:border-[#cfa373] focus:bg-[#ffffff] dark:focus:bg-[#16120f] focus:outline-hidden focus:ring-2 focus:ring-[#abc7cd]/60 rounded-xl text-[#163f57] dark:text-[#fffdfa] text-sm placeholder:text-[#8a7767] dark:placeholder:text-[#a8988a] leading-relaxed transition-colors resize-y font-medium"
          />
        </div>

        {/* Vraag 2 */}
        <div>
          <label htmlFor="q2-highlight-input" className="block text-sm font-bold text-[#163f57] dark:text-[#f5ede6] mb-1">
            2. Wat was het hoogtepunt van je dag?
          </label>
          <p className="text-xs text-[#6b5847] dark:text-[#c9b9a9] mb-2 font-medium">
            Het mooiste moment, een fijn gesprek of een behaald succes.
          </p>
          <textarea
            id="q2-highlight-input"
            rows={3}
            value={q2}
            onChange={(e) => setQ2(e.target.value)}
            placeholder="Bijvoorbeeld: Een gezellige wandeling tijdens de lunch en een leuk berichtje van een vriend..."
            className="w-full px-4 py-3 bg-[#faf7f2] dark:bg-[#1a1512] border border-[#c7b7a1] dark:border-[#45362b] focus:border-[#163f57] dark:focus:border-[#cfa373] focus:bg-[#ffffff] dark:focus:bg-[#16120f] focus:outline-hidden focus:ring-2 focus:ring-[#abc7cd]/60 rounded-xl text-[#163f57] dark:text-[#fffdfa] text-sm placeholder:text-[#8a7767] dark:placeholder:text-[#a8988a] leading-relaxed transition-colors resize-y font-medium"
          />
        </div>

        {/* Vraag 3 */}
        <div>
          <label htmlFor="q3-learned-input" className="block text-sm font-bold text-[#163f57] dark:text-[#f5ede6] mb-1">
            3. Wat heb je vandaag geleerd?
          </label>
          <p className="text-xs text-[#6b5847] dark:text-[#c9b9a9] mb-2 font-medium">
            Een nieuw inzicht, een handige vaardigheid of een les over jezelf.
          </p>
          <textarea
            id="q3-learned-input"
            rows={3}
            value={q3}
            onChange={(e) => setQ3(e.target.value)}
            placeholder="Bijvoorbeeld: Dat het helpt om taken in kleinere stukjes op te delen als ik me overweldigd voel..."
            className="w-full px-4 py-3 bg-[#faf7f2] dark:bg-[#1a1512] border border-[#c7b7a1] dark:border-[#45362b] focus:border-[#163f57] dark:focus:border-[#cfa373] focus:bg-[#ffffff] dark:focus:bg-[#16120f] focus:outline-hidden focus:ring-2 focus:ring-[#abc7cd]/60 rounded-xl text-[#163f57] dark:text-[#fffdfa] text-sm placeholder:text-[#8a7767] dark:placeholder:text-[#a8988a] leading-relaxed transition-colors resize-y font-medium"
          />
        </div>

        {/* Vraag 4 */}
        <div>
          <label htmlFor="q4-looking-forward-input" className="block text-sm font-bold text-[#163f57] dark:text-[#f5ede6] mb-1">
            4. Waar kijk je morgen naar uit?
          </label>
          <p className="text-xs text-[#6b5847] dark:text-[#c9b9a9] mb-2 font-medium">
            Iets om naar uit te kijken of een intentie voor morgen.
          </p>
          <textarea
            id="q4-looking-forward-input"
            rows={3}
            value={q4}
            onChange={(e) => setQ4(e.target.value)}
            placeholder="Bijvoorbeeld: Morgenochtend een verse kop koffie drinken en beginnen aan het nieuwe project..."
            className="w-full px-4 py-3 bg-[#faf7f2] dark:bg-[#1a1512] border border-[#c7b7a1] dark:border-[#45362b] focus:border-[#163f57] dark:focus:border-[#cfa373] focus:bg-[#ffffff] dark:focus:bg-[#16120f] focus:outline-hidden focus:ring-2 focus:ring-[#abc7cd]/60 rounded-xl text-[#163f57] dark:text-[#fffdfa] text-sm placeholder:text-[#8a7767] dark:placeholder:text-[#a8988a] leading-relaxed transition-colors resize-y font-medium"
          />
        </div>
      </div>

      {/* Form Submission */}
      <div className="mt-8 pt-6 border-t border-[#ded1be] dark:border-[#3e3027] flex flex-col sm:flex-row items-center justify-end gap-3">
        {isEditing && onCancelEdit && (
          <button
            id="cancel-edit-bottom-btn"
            type="button"
            onClick={onCancelEdit}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-[#163f57] dark:text-[#f2ebe1] bg-[#ded1be] dark:bg-[#382c23] hover:bg-[#d0c0ab] dark:hover:bg-[#47382d] rounded-xl transition-colors cursor-pointer border border-[#c2b09c] dark:border-[#4d3c32]"
          >
            Annuleren
          </button>
        )}
        <button
          id="submit-entry-btn"
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white dark:text-[#163f57] bg-[#163f57] dark:bg-[#f2ebe1] hover:bg-[#102d3e] dark:hover:bg-[#e4d8c7] rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <Check className="w-4 h-4 text-[#cfa373] dark:text-[#163f57]" />
          <span>{isEditing ? 'Wijzigingen opslaan' : 'Dagboek-entry opslaan'}</span>
        </button>
      </div>
    </form>
  );
};
