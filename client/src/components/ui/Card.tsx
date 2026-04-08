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
        ${glass ? 'glass' : 'bg-white border border-gray-100'}
        ${hover ? 'hover:shadow-lg hover:shadow-gray-200/50 transition-shadow duration-300' : 'shadow-sm'}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
