import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  color?: 'cheetah' | 'green' | 'coral';
  showPercent?: boolean;
  variant?: 'bar' | 'dots';
  steps?: number;
  currentStep?: number;
}

const colorClasses: Record<string, string> = {
  cheetah: 'bg-gradient-to-r from-primary-400 to-cheetah-500',
  green: 'bg-gradient-to-r from-success-400 to-success-500',
  coral: 'bg-gradient-to-r from-coral-400 to-coral-500',
};

const trackColors: Record<string, string> = {
  cheetah: 'bg-cheetah-100',
  green: 'bg-success-100',
  coral: 'bg-coral-100',
};

const dotActiveColors: Record<string, string> = {
  cheetah: 'bg-cheetah-500',
  green: 'bg-success-500',
  coral: 'bg-coral-500',
};

export default function ProgressBar({
  value,
  color = 'cheetah',
  showPercent = false,
  variant = 'bar',
  steps,
  currentStep,
}: ProgressBarProps) {
  if (variant === 'dots' && steps !== undefined && currentStep !== undefined) {
    return (
      <div className="flex items-center gap-2">
        {Array.from({ length: steps }, (_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              i <= currentStep ? dotActiveColors[color] : 'bg-earth-200'
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 h-2 rounded-full ${trackColors[color]} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorClasses[color]}`}
        />
      </div>
      {showPercent && (
        <span className="text-sm font-medium text-earth-600 min-w-[3ch] text-right">
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}
