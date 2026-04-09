import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-cheetah-100 text-cheetah-800',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-earth-100 text-earth-600',
  danger: 'bg-coral-100 text-coral-700',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export default function Badge({
  variant = 'neutral',
  size = 'sm',
  children,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
      `}
    >
      {children}
    </span>
  );
}
