import React from 'react';
import { MoodScore, MOOD_OPTIONS } from '../types';

interface MoodBadgeProps {
  mood: MoodScore;
  size?: 'sm' | 'md' | 'lg';
}

export const MoodBadge: React.FC<MoodBadgeProps> = ({ mood, size = 'md' }) => {
  const option = MOOD_OPTIONS.find((m) => m.score === mood) || MOOD_OPTIONS[2];

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5',
  };

  return (
    <span
      id={`mood-badge-${mood}`}
      className={`inline-flex items-center rounded-full font-medium border transition-colors ${option.bgClass} ${option.borderClass} ${option.colorClass} ${sizeClasses[size]}`}
    >
      <span className="text-base leading-none" role="img" aria-label={option.label}>
        {option.emoji}
      </span>
      <span className="whitespace-nowrap font-medium">
        {option.label} ({option.score}/5)
      </span>
    </span>
  );
};
