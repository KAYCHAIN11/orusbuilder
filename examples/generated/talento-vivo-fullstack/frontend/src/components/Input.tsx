import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[rgb(var(--orus-text))]">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[rgb(var(--orus-text-muted))]">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full ${leftIcon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border ${error ? 'border-red-400 focus:ring-red-500' : 'border-[rgb(var(--orus-border))] focus:ring-[rgb(var(--orus-primary))]'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>{error}</p>}
      {hint && !error && <p className="text-xs text-[rgb(var(--orus-text-muted))]">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;