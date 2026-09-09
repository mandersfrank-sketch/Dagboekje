import * as XLSX from 'xlsx';
import { DiaryEntry, MOOD_OPTIONS } from '../types';

/**
 * Exporteert alle dagboek-entries naar een net opgemaakt Excel-bestand (.xlsx).
 */
export function exportEntriesToExcel(entries: DiaryEntry[]) {
  if (entries.length === 0) return;

  // Sorteer van nieuwste naar oudste datum (of chronologisch indien gewenst)
  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  const dataRows = sortedEntries.map((entry) => {
    const moodInfo = MOOD_OPTIONS.find((m) => m.score === entry.mood);
    const moodDescription = moodInfo ? `${moodInfo.emoji} ${moodInfo.label}` : '';

    return {
      Datum: entry.date,
      'Stemmingsscore (1-5)': entry.mood,
      'Stemming': moodDescription,
      '1. Hoe voelde je je vandaag?': entry.q1_feeling || '',
      '2. Wat was het hoogtepunt van je dag?': entry.q2_highlight || '',
      '3. Wat heb je vandaag geleerd?': entry.q3_learned || '',
      '4. Waar kijk je morgen naar uit?': entry.q4_lookingForward || '',
    };
  });

  // Maak een worksheet aan op basis van de rijen
  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  // Pas kolombreedtes aan zodat teksten en vragen overzichtelijk leesbaar zijn
  worksheet['!cols'] = [
    { wch: 14 }, // Datum
    { wch: 20 }, // Stemmingsscore (1-5)
    { wch: 18 }, // Stemming
    { wch: 42 }, // Vraag 1
    { wch: 42 }, // Vraag 2
    { wch: 42 }, // Vraag 3
    { wch: 42 }, // Vraag 4
  ];

  // Maak een nieuw Excel-werkboek aan en voeg het blad toe
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dagboek');

  // Genereer bestandsnaam met huidige datum
  const todayStr = new Date().toISOString().split('T')[0];
  const fileName = `dagboek-entries-${todayStr}.xlsx`;

  // Schrijf en trigger de download direct in de browser
  XLSX.writeFile(workbook, fileName);
}
