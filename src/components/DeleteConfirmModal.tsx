import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { formatDutchDate } from '../utils/storage';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  entryDate: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  entryDate,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="delete-confirm-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#163f57]/50 backdrop-blur-xs"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div
        id="delete-confirm-dialog"
        className="w-full max-w-md rounded-2xl bg-[#ffffff] dark:bg-[#251d18] p-6 shadow-2xl border border-[#d8cabb] dark:border-[#3e3027] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f4eee6] dark:bg-[#332720] text-[#163f57] dark:text-[#f2ebe1] shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#8a5f2e] dark:text-[#cfa373]" />
          </div>
          <button
            id="delete-modal-close-btn"
            type="button"
            onClick={onCancel}
            className="text-[#163f57]/70 dark:text-[#f2ebe1]/70 hover:text-[#163f57] dark:hover:text-[#fffdfa] p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 id="delete-dialog-title" className="text-lg font-bold text-[#163f57] dark:text-[#fffdfa]">
            Entry verwijderen?
          </h3>
          <p className="mt-2 text-sm text-[#6b5847] dark:text-[#c9b9a9] leading-relaxed font-normal">
            Weet je zeker dat je de dagboek-entry van{' '}
            <strong className="text-[#163f57] dark:text-[#fffdfa] font-bold">{formatDutchDate(entryDate)}</strong> wilt
            verwijderen? Deze actie kan niet ongedaan worden gemaakt.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            id="delete-modal-cancel-btn"
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-[#163f57] dark:text-[#f2ebe1] bg-[#ded1be] dark:bg-[#382c23] hover:bg-[#d0c0ab] dark:hover:bg-[#47382d] rounded-xl transition-colors cursor-pointer border border-[#c2b09c] dark:border-[#4d3c32]"
          >
            Annuleren
          </button>
          <button
            id="delete-modal-confirm-btn"
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-200" />
            <span>Verwijderen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
