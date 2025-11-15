import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'compact' | 'micro';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', variant = 'default', ...props }, ref) => {
    const inputStyles = {
      default: 'h-10 px-3 py-2 text-sm',
      compact: 'compact-height-input px-2 py-1 compact-text-sm',
      micro: 'micro-input',
    };

    const labelStyles = {
      default: 'block text-sm font-medium text-foreground mb-1',
      compact: 'block compact-text-sm font-medium text-foreground mb-0.5',
      micro: 'block compact-text-xs font-medium text-foreground',
    };

    const messageStyles = {
      default: 'mt-1 text-sm',
      compact: 'mt-0.5 compact-text-sm',
      micro: 'compact-text-xs',
    };

    return (
      <div className="w-full">
        {label && (
          <label className={labelStyles[variant]}>
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full border rounded-md bg-background
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-destructive' : 'border-input'}
            ${inputStyles[variant]}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className={`${messageStyles[variant]} text-destructive`}>{error}</p>
        )}
        {helperText && !error && (
          <p className={`${messageStyles[variant]} text-muted-foreground`}>{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

