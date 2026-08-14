import { useState, useRef } from 'react';

interface ScoreInputProps {
  onSubmit: (value: number) => void;
  placeholder?: string;
  label: string;
  min?: number;
  disabled?: boolean;
}

export function ScoreInput({ onSubmit, placeholder = '0', label, min, disabled }: ScoreInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    const num = Number(value);
    if (value === '' || isNaN(num)) return;
    onSubmit(num);
    setValue('');
    inputRef.current?.focus();
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={value}
      onChange={e => setValue(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
      placeholder={placeholder}
      aria-label={label}
      min={min}
      disabled={disabled}
      className="min-h-11 w-20 rounded-lg border border-edge bg-surface px-2 text-center text-heading placeholder:text-faint disabled:opacity-50"
    />
  );
}
