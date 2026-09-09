export type MoodScore = 1 | 2 | 3 | 4 | 5;

export interface MoodOption {
  score: MoodScore;
  emoji: string;
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export interface DiaryEntry {
  id: string;
  date: string; // ISO format 'YYYY-MM-DD'
  mood: MoodScore;
  q1_feeling: string; // 1. Hoe voelde je je vandaag?
  q2_highlight: string; // 2. Wat was het hoogtepunt van je dag?
  q3_learned: string; // 3. Wat heb je vandaag geleerd?
  q4_lookingForward: string; // 4. Waar kijk je morgen naar uit?
  createdAt: number;
  updatedAt: number;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    score: 1,
    emoji: '😞',
    label: 'Slecht',
    colorClass: 'text-[#163f57]',
    bgClass: 'bg-[#e4dbcf]',
    borderClass: 'border-[#baa493]',
  },
  {
    score: 2,
    emoji: '😐',
    label: 'Matig',
    colorClass: 'text-[#4d3621]',
    bgClass: 'bg-[#ecd9c7]',
    borderClass: 'border-[#c09b7b]',
  },
  {
    score: 3,
    emoji: '🙂',
    label: 'Goed',
    colorClass: 'text-[#163f57]',
    bgClass: 'bg-[#d8e6e8]',
    borderClass: 'border-[#abc7cd]',
  },
  {
    score: 4,
    emoji: '😊',
    label: 'Heel goed',
    colorClass: 'text-[#4d3621]',
    bgClass: 'bg-[#f4e2c6]',
    borderClass: 'border-[#cfa373]',
  },
  {
    score: 5,
    emoji: '✨',
    label: 'Fantastisch',
    colorClass: 'text-white',
    bgClass: 'bg-[#163f57]',
    borderClass: 'border-[#163f57]',
  },
];
