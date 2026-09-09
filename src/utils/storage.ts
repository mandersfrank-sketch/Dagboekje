import { DiaryEntry } from '../types';

const STORAGE_KEY = 'digitaal_dagboek_entries_v1';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format 'YYYY-MM-DD' into readable Dutch date, e.g. "Dinsdag 8 september 2026"
export function formatDutchDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, month, day);
  if (isNaN(dateObj.getTime())) return dateStr;

  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj);
}

export function formatShortDutchDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, month, day);
  if (isNaN(dateObj.getTime())) return dateStr;

  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
}

// Initial sample entry so user immediately sees how it looks on first load if empty
const INITIAL_SAMPLE_ENTRIES: DiaryEntry[] = [
  {
    id: 'sample-entry-1',
    date: getTodayDateString(),
    mood: 4,
    q1_feeling: 'Vandaag voelde ik me rustig en gemotiveerd. Het was een productieve ochtend met een heerlijke wandeling tussendoor.',
    q2_highlight: 'Samen met een vriend koffie gedronken in het zonnetje en plannen gemaakt voor het komend weekend.',
    q3_learned: 'Dat even stilstaan en een korte pauze nemen meer energie geeft dan non-stop doorwerken.',
    q4_lookingForward: 'Morgen begin ik aan een nieuw creatief project en ga ik lekker koken.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export function loadEntries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Save sample entry initially
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_ENTRIES));
      return INITIAL_SAMPLE_ENTRIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => {
        if (b.date !== a.date) {
          return b.date.localeCompare(a.date);
        }
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
    }
    return [];
  } catch (err) {
    console.error('Fout bij laden van dagboek-entries:', err);
    return [];
  }
}

export function saveEntries(entries: DiaryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Fout bij opslaan van dagboek-entries:', err);
  }
}
