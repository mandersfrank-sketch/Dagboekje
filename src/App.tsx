/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { BookOpen, Plus, BookHeart, Sparkles, Flame, Search, Lock, FileSpreadsheet } from 'lucide-react';
import { DiaryEntry } from './types';
import { loadEntries, saveEntries, formatDutchDate } from './utils/storage';
import { calculateStreak } from './utils/streak';
import { exportEntriesToExcel } from './utils/excelExport';
import { EntryForm } from './components/EntryForm';
import { EntryCard } from './components/EntryCard';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { DailyQuote } from './components/DailyQuote';
import { DailyRussianWord } from './components/DailyRussianWord';
import { StreakBanner } from './components/StreakBanner';
import { SearchEntriesBar } from './components/SearchEntriesBar';
import { ThemeToggle } from './components/ThemeToggle';
import { PinLockScreen } from './components/PinLockScreen';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<DiaryEntry | null>(null);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [searchDate, setSearchDate] = useState<string>('');
  const formRef = useRef<HTMLDivElement>(null);

  // Load entries on initial mount
  useEffect(() => {
    const stored = loadEntries();
    setEntries(stored);
  }, []);

  // Calculate current streak whenever entries change
  const streakInfo = useMemo(() => calculateStreak(entries), [entries]);

  // Filter entries based on search text and/or date
  const filteredEntries = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const dateFilter = searchDate.trim();

    if (!query && !dateFilter) {
      return entries;
    }

    return entries.filter((entry) => {
      // Filter by date if specified
      if (dateFilter && entry.date !== dateFilter) {
        return false;
      }

      // Filter by text query across all written reflection fields and date
      if (query) {
        const q1 = (entry.q1_feeling || '').toLowerCase();
        const q2 = (entry.q2_highlight || '').toLowerCase();
        const q3 = (entry.q3_learned || '').toLowerCase();
        const q4 = (entry.q4_lookingForward || '').toLowerCase();
        const dateStr = (entry.date || '').toLowerCase();
        const dutchDate = formatDutchDate(entry.date).toLowerCase();

        const matches =
          q1.includes(query) ||
          q2.includes(query) ||
          q3.includes(query) ||
          q4.includes(query) ||
          dateStr.includes(query) ||
          dutchDate.includes(query);

        if (!matches) {
          return false;
        }
      }

      return true;
    });
  }, [entries, searchText, searchDate]);

  // Save entries whenever state changes
  const updateEntriesAndSave = (updated: DiaryEntry[]) => {
    // Sort descending by date, then by creation time
    const sorted = [...updated].sort((a, b) => {
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    setEntries(sorted);
    saveEntries(sorted);
  };

  const handleSaveEntry = (
    entryData: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingEntry) {
      // Update existing entry
      const updatedList = entries.map((item) => {
        if (item.id === editingEntry.id) {
          return {
            ...item,
            ...entryData,
            updatedAt: Date.now(),
          };
        }
        return item;
      });
      updateEntriesAndSave(updatedList);
      setEditingEntry(null);
    } else {
      // Add new entry
      const newEntry: DiaryEntry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...entryData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      updateEntriesAndSave([newEntry, ...entries]);
    }
  };

  const handleStartEdit = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setIsFormVisible(true);
    // Smoothly scroll to the form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const handleDeleteRequest = (entry: DiaryEntry) => {
    setEntryToDelete(entry);
  };

  const handleConfirmDelete = () => {
    if (!entryToDelete) return;
    const updated = entries.filter((e) => e.id !== entryToDelete.id);
    updateEntriesAndSave(updated);
    if (editingEntry?.id === entryToDelete.id) {
      setEditingEntry(null);
    }
    setEntryToDelete(null);
  };

  if (!isUnlocked) {
    return <PinLockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div id="app-container" className="min-h-screen bg-[#faf7f2] dark:bg-[#19130f] text-[#163f57] dark:text-[#fffdfa] flex flex-col transition-colors duration-200">
      {/* Top Navigation Header */}
      <header
        id="app-header"
        className="sticky top-0 z-30 bg-[#faf7f2]/95 dark:bg-[#201814]/95 backdrop-blur-md border-b border-[#ded1be] dark:border-[#382b22] transition-colors"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#163f57] dark:bg-[#2c221b] flex items-center justify-center text-white shadow-xs border border-[#ded1be] dark:border-[#45362b]">
              <BookOpen className="w-5 h-5 text-[#cfa373]" />
            </div>
            <div>
              <h1 id="main-title" className="text-lg sm:text-xl font-bold text-[#163f57] dark:text-[#fffdfa] tracking-tight">
                Digitaal Dagboek
              </h1>
              <p className="text-xs text-[#6b5847] dark:text-[#c4b1a0] font-medium">
                Dagelijkse reflectie & herinneringen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Header Streak Counter */}
            <div
              id="header-streak-pill"
              title={
                streakInfo.streak === 0
                  ? 'Nog geen actieve streak. Voeg een entry toe!'
                  : streakInfo.hasEntryToday
                  ? 'Streak is vandaag veiliggesteld!'
                  : 'Voeg vandaag een entry toe om je streak vast te houden'
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ffffff] dark:bg-[#251d18] border border-[#ded1be] dark:border-[#3e3027] shadow-xs text-xs sm:text-sm font-bold text-[#163f57] dark:text-[#fffdfa]"
            >
              <Flame
                className={`w-4 h-4 ${
                  streakInfo.streak > 0 ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : 'text-[#a39082]'
                }`}
              />
              <span id="header-streak-text">
                {streakInfo.streak === 1 ? '1 dag op rij' : `${streakInfo.streak} dagen op rij`}
              </span>
            </div>

            {/* Dark Mode Toggle Button */}
            <ThemeToggle />

            {/* Lock App Button */}
            <button
              id="header-lock-app-btn"
              type="button"
              onClick={() => setIsUnlocked(false)}
              aria-label="Dagboek vergrendelen"
              title="Dagboek vergrendelen met pincode"
              className="inline-flex items-center justify-center p-2 rounded-xl text-[#163f57] dark:text-[#f2ebe1] bg-[#f4eee6] dark:bg-[#2c221b] hover:bg-[#eae0d2] dark:hover:bg-[#382c23] border border-[#ded3c5] dark:border-[#45362b] transition-all cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#163f57] dark:focus:ring-[#cfa373]"
            >
              <Lock className="w-4 h-4 text-[#8a5f2e] dark:text-[#cfa373]" />
              <span className="sr-only">Dagboek vergrendelen</span>
            </button>

            <button
              id="header-new-entry-btn"
              type="button"
              onClick={() => {
                setEditingEntry(null);
                setIsFormVisible(true);
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-sm font-bold text-white dark:text-[#163f57] bg-[#163f57] dark:bg-[#f2ebe1] hover:bg-[#102d3e] dark:hover:bg-[#e4d8c7] rounded-xl transition-colors shadow-xs cursor-pointer border border-[#163f57] dark:border-[#ded1be]"
            >
              <Plus className="w-4 h-4 text-[#cfa373] dark:text-[#163f57]" />
              <span className="hidden sm:inline">Nieuwe entry</span>
              <span className="sm:hidden">Nieuw</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Streak Teller: duidelijk zichtbaar boven in de app */}
        <StreakBanner streakInfo={streakInfo} />

        {/* Dagelijkse sectie: Spreuk van de dag & Russisch woord van de dag */}
        <section
          id="daily-features-grid"
          aria-label="Dagelijkse inspiratie"
          className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch"
        >
          <DailyQuote />
          <DailyRussianWord />
        </section>

        {/* Entry Form Section */}
        <section id="entry-form-section" ref={formRef} className="scroll-mt-24">
          {isFormVisible && (
            <EntryForm
              initialEntry={editingEntry}
              onSave={handleSaveEntry}
              onCancelEdit={editingEntry ? handleCancelEdit : undefined}
            />
          )}
        </section>

        {/* Previous Entries Overview Section */}
        <section id="entries-overview-section" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#ded1be] dark:border-[#382b22]">
            <div className="flex items-center gap-2">
              <h2 id="overview-heading" className="text-xl font-bold text-[#163f57] dark:text-[#fffdfa] tracking-tight">
                Eerdere entries
              </h2>
              <span
                id="entries-count-badge"
                className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffffff] dark:bg-[#251d18] text-[#163f57] dark:text-[#f2ebe1] border border-[#ded1be] dark:border-[#3e3027]"
              >
                {searchText.trim() || searchDate
                  ? `${filteredEntries.length} van ${entries.length}`
                  : entries.length}
              </span>
            </div>

            {entries.length > 0 && (
              <button
                id="export-excel-btn"
                type="button"
                onClick={() => exportEntriesToExcel(entries)}
                aria-label="Download alle dagboek-entries als Excel-bestand (.xlsx)"
                title="Download alle dagboek-entries als Excel-bestand (.xlsx)"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-[#163f57] dark:text-[#f2ebe1] bg-[#ffffff] dark:bg-[#251d18] hover:bg-[#f4eee6] dark:hover:bg-[#332720] border border-[#ded1be] dark:border-[#3e3027] rounded-xl transition-all cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#163f57] dark:focus:ring-[#cfa373]"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Download Excel (.xlsx)</span>
              </button>
            )}
          </div>

          {/* Search bar for searching by text and date (only shown when there are entries) */}
          {entries.length > 0 && (
            <SearchEntriesBar
              searchText={searchText}
              onSearchTextChange={setSearchText}
              searchDate={searchDate}
              onSearchDateChange={setSearchDate}
              onReset={() => {
                setSearchText('');
                setSearchDate('');
              }}
              totalEntriesCount={entries.length}
              filteredEntriesCount={filteredEntries.length}
            />
          )}

          {/* List of Entries or Empty / Search-empty State */}
          {entries.length === 0 ? (
            <div
              id="empty-entries-card"
              className="text-center py-16 px-6 bg-[#ffffff] dark:bg-[#251d18] rounded-2xl border border-dashed border-[#ded1be] dark:border-[#3e3027] shadow-xs"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-[#f4eee6] dark:bg-[#332720] flex items-center justify-center text-[#163f57] dark:text-[#f2ebe1] mb-4">
                <BookHeart className="w-6 h-6 text-[#163f57] dark:text-[#cfa373]" />
              </div>
              <h3 className="text-base font-bold text-[#163f57] dark:text-[#fffdfa] mb-1">
                Nog geen dagboek-entries
              </h3>
              <p className="text-sm text-[#6b5847] dark:text-[#c9b9a9] font-medium max-w-md mx-auto mb-6">
                Je hebt nog geen herinneringen opgeslagen. Vul het bovenstaande formulier in om je eerste dag vast te leggen!
              </p>
              <button
                id="empty-state-start-btn"
                type="button"
                onClick={() => {
                  setEditingEntry(null);
                  setIsFormVisible(true);
                  formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white dark:text-[#163f57] bg-[#163f57] dark:bg-[#f2ebe1] hover:bg-[#102d3e] dark:hover:bg-[#e4d8c7] rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#cfa373] dark:text-[#163f57]" />
                <span>Begin met schrijven</span>
              </button>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div
              id="no-search-results-card"
              className="text-center py-12 px-6 bg-[#ffffff] dark:bg-[#251d18] rounded-2xl border border-dashed border-[#ded1be] dark:border-[#3e3027] shadow-xs"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-[#f4eee6] dark:bg-[#332720] flex items-center justify-center text-[#163f57] dark:text-[#f2ebe1] mb-3">
                <Search className="w-5 h-5 text-[#163f57] dark:text-[#cfa373]" />
              </div>
              <h3 id="no-search-results-title" className="text-base font-bold text-[#163f57] dark:text-[#fffdfa] mb-1">
                Geen entries gevonden
              </h3>
              <p id="no-search-results-desc" className="text-sm text-[#6b5847] dark:text-[#c9b9a9] font-medium max-w-md mx-auto mb-4">
                Er zijn geen dagboek-entries die overeenkomen met je zoekopdracht
                {searchText ? ` "${searchText}"` : ''}
                {searchDate ? ` op datum ${searchDate}` : ''}.
              </p>
              <button
                id="clear-search-btn"
                type="button"
                onClick={() => {
                  setSearchText('');
                  setSearchDate('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-[#163f57] dark:text-[#f2ebe1] bg-[#ded1be] dark:bg-[#382c23] hover:bg-[#d0c0ab] dark:hover:bg-[#47382d] rounded-xl transition-colors cursor-pointer border border-[#c2b09c] dark:border-[#4d3c32]"
              >
                <span>Wis zoekopdracht</span>
              </button>
            </div>
          ) : (
            <div id="entries-list" className="space-y-5">
              {filteredEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={handleStartEdit}
                  onDeleteRequest={handleDeleteRequest}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer id="app-footer" className="mt-auto py-6 border-t border-[#ded1be] dark:border-[#382b22] text-center text-xs text-[#6b5847] dark:text-[#a8988a] font-medium">
        <p>Digitaal Dagboek &bull; Opgeslagen in je browser</p>
      </footer>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(entryToDelete)}
        entryDate={entryToDelete?.date || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryToDelete(null)}
      />
    </div>
  );
}
