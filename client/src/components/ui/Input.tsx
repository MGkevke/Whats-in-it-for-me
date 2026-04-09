import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  as?: 'textarea';
}

export default function Input({
  label,
  error,
  helperText,
  icon,
  as,
  className = '',
  ...props
}: InputProps) {
  const Component = as === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-earth-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className={`absolute left-3 ${as === 'textarea' ? 'top-3' : 'top-1/2 -translate-y-1/2'} text-cheetah-400 pointer-events-none`}>
            {icon}
          </div>
        )}
        <Component
          className={`
            w-full rounded-xl border border-cheetah-200/60 bg-white
            px-4 py-3 text-sm text-earth-900 placeholder-earth-300
            transition-all duration-200
            focus:border-cheetah-400 focus:ring-2 focus:ring-cheetah-100 focus:outline-none
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-coral-400 focus:border-coral-400 focus:ring-coral-100' : ''}
            ${as === 'textarea' ? 'min-h-[100px] resize-y' : ''}
            ${className}
          `}
          {...(props as any)}
        />
      </div>
      {error && <p className="text-xs text-coral-600">{error}</p>}
      {helperText && !error && <p className="text-xs text-earth-400">{helperText}</p>}
    </div>
  );
}
