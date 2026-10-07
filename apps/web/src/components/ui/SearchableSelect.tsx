'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown } from 'lucide-react';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = options.find((opt) => opt.value === value)?.label || '';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[var(--sv-ring-focus)] focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-red-400 focus:ring-red-500'
            : 'border-[var(--sv-border-input)]',
          isOpen && 'ring-2 ring-[var(--sv-ring-focus)] border-transparent'
        )}
      >
        <span
          className={cn(
            'truncate',
            !selectedLabel && 'text-[var(--sv-text-muted)]'
          )}
        >
          {selectedLabel || placeholder || 'Select...'}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-[var(--sv-text-muted)] transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-[var(--sv-border)] bg-[var(--sv-bg-card)] shadow-lg">
          <div className="flex items-center gap-2 border-b border-[var(--sv-border)] px-3 py-2">
            <Search className="h-4 w-4 text-[var(--sv-text-muted)]" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-[var(--sv-text-primary)] placeholder:text-[var(--sv-text-muted)] focus:outline-none"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[var(--sv-text-muted)]">
                No results found
              </li>
            ) : (
              filteredOptions.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-start text-sm transition-colors',
                      'hover:bg-indigo-50 dark:hover:bg-indigo-950/30',
                      opt.value === value
                        ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'text-[var(--sv-text-primary)]'
                    )}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
