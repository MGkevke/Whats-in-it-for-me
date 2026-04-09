import React from 'react';

interface CardProps {
  glass?: boolean;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const paddingClasses: Record<string, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  glass = false,
  hover = false,
  padding = 'md',
  className = '',
  children,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl
        ${glass
          ? 'bg-white/60 backdrop-blur-lg border border-cheetah-200/30 shadow-lg'
          : 'bg-white border border-cheetah-100/60 shadow-md shadow-cheetah-500/5'}
        ${hover ? 'hover:shadow-xl hover:shadow-cheetah-500/10 hover:border-cheetah-200 transition-all duration-300' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
