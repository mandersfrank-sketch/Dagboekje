import React from 'react';
import { Search, Calendar, X } from 'lucide-react';

interface SearchEntriesBarProps {
  searchText: string;
  onSearchTextChange: (val: string) => void;
  searchDate: string;
  onSearchDateChange: (val: string) => void;
  onReset: () => void;
  totalEntriesCount: number;
  filteredEntriesCount: number;
}

export const SearchEntriesBar: React.FC<SearchEntriesBarProps> = ({
  searchText,
  onSearchTextChange,
  searchDate,
  onSearchDateChange,
  onReset,
  totalEntriesCount,
  filteredEntriesCount,
}) => {
  const isFiltering = searchText.trim().length > 0 || searchDate.length > 0;

  return (
    <div
      id="search-entries-container"
      className="bg-[#ffffff] dark:bg-[#251d18] border border-[#d8cabb] dark:border-[#3e3027] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 transition-colors"
    >
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Text Search Input (takes 7 or 8 columns on desktop) */}
        <div className="sm:col-span-7 relative">
          <label htmlFor="search-text-input" className="sr-only">
            Zoek op tekst of woorden
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8a7767] dark:text-[#d4c3b2]">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="search-text-input"
            type="text"
            value={searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
            placeholder="Zoek op tekst (bijv. een woord of herinnering)..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#faf7f2] dark:bg-[#1a1512] border border-[#c7b7a1] dark:border-[#45362b] rounded-xl text-[#163f57] dark:text-[#fffdfa] placeholder-[#8a7767] dark:placeholder-[#c4b1a0] focus:outline-hidden focus:ring-2 focus:ring-[#163f57] dark:focus:ring-[#cfa373] focus:border-transparent transition-all"
          />
          {searchText && (
            <button
              id="clear-search-text-btn"
              type="button"
              onClick={() => onSearchTextChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8a7767] hover:text-[#163f57] dark:text-[#d4c3b2] dark:hover:text-[#fffdfa] transition-colors cursor-pointer"
              title="Tekst wissen"
              aria-label="Tekst zoekopdracht wissen"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Date Filter Input (takes 5 columns on desktop) */}
        <div className="sm:col-span-5 relative">
          <label htmlFor="search-date-input" className="sr-only">
            Zoek op datum
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8a7767] dark:text-[#d4c3b2]">
            <Calendar className="w-4 h-4" />
          </div>
          <input
            id="search-date-input"
            type="date"
            value={searchDate}
            onChange={(e) => onSearchDateChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#faf7f2] dark:bg-[#1a1512] border border-[#c7b7a1] dark:border-[#45362b] rounded-xl text-[#163f57] dark:text-[#fffdfa] focus:outline-hidden focus:ring-2 focus:ring-[#163f57] dark:focus:ring-[#cfa373] focus:border-transparent transition-all cursor-pointer scheme-light dark:scheme-dark"
          />
          {searchDate && (
            <button
              id="clear-search-date-btn"
              type="button"
              onClick={() => onSearchDateChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8a7767] hover:text-[#163f57] dark:text-[#d4c3b2] dark:hover:text-[#fffdfa] transition-colors cursor-pointer"
              title="Datum wissen"
              aria-label="Datum filter wissen"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Status & Reset */}
      {isFiltering && (
        <div
          id="search-status-bar"
          className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#ded1be] dark:border-[#3e3027] text-xs sm:text-sm text-[#6b5847] dark:text-[#e8dacb]"
        >
          <div className="flex items-center gap-2">
            <span>
              {filteredEntriesCount === 1
                ? '1 resultaat gevonden'
                : `${filteredEntriesCount} resultaten gevonden`}{' '}
              (van {totalEntriesCount} totaal)
            </span>
          </div>

          <button
            id="reset-search-filters-btn"
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#163f57] dark:text-[#f2ebe1] bg-[#ded1be] dark:bg-[#382c23] hover:bg-[#d0c0ab] dark:hover:bg-[#47382d] rounded-lg transition-colors cursor-pointer border border-[#c2b09c] dark:border-[#4d3c32]"
          >
            <X className="w-3.5 h-3.5" />
            <span>Wis zoekopdracht</span>
          </button>
        </div>
      )}
    </div>
  );
};
