import React, { forwardRef, useState, useEffect } from 'react';
import { Input, InputProps } from './Input';
import { cn } from '@/lib/utils';

export interface PhoneInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  defaultCountryCode?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, defaultCountryCode = '+20', ...props }, ref) => {
    // Extract the local part of the number by removing the country code if it exists
    const getLocalNumber = (val: string | undefined) => {
      if (!val) return '';
      if (val.startsWith(defaultCountryCode)) {
        return val.slice(defaultCountryCode.length);
      }
      return val;
    };

    const [localValue, setLocalValue] = useState(getLocalNumber(value));

    // Keep internal state in sync with external value if it changes
    useEffect(() => {
      setLocalValue(getLocalNumber(value));
    }, [value, defaultCountryCode]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow navigation and edit keys: backspace, delete, arrows, tab, enter
      const allowedKeys = [
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'Home', 'End'
      ];
      // Allow copy/paste/select all shortcuts
      if (e.ctrlKey || e.metaKey) {
        return;
      }
      if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value.replace(/\D/g, ''); // Ensure only digits
      
      // Auto-strip leading zero if the user types '0' (since Egypt standard is +20 1...)
      if (newValue.startsWith('0')) {
        newValue = newValue.substring(1);
      }

      setLocalValue(newValue);
      
      if (onChange) {
        // Send full E.164 format or empty string
        onChange(newValue ? `${defaultCountryCode}${newValue}` : '');
      }
    };

    return (
      <div className={cn("relative flex items-center group", className)}>
        {/* Country Code Badge - Absolutely positioned at the start */}
        <div className="absolute inset-y-0 start-0 flex items-center justify-center ps-3 pe-2 border-e border-[var(--sv-border-input)] bg-[var(--sv-bg-input)] rounded-s-lg pointer-events-none z-10 h-10">
          <span className="flex items-center gap-1.5 text-sm text-[var(--sv-text-primary)]">
            <span>🇪🇬</span>
            <span className="font-medium" dir="ltr">{defaultCountryCode}</span>
          </span>
        </div>
        
        {/* Input Field - padding-start accommodates the badge size */}
        <Input
          ref={ref}
          type="tel"
          inputMode="numeric"
          dir="ltr"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="ps-[5.5rem] text-left"
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
