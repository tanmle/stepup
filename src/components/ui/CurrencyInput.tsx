import React, { useState, useEffect } from 'react';
import { formatNumber, parseNumber } from '@/utils/format';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onChange: (value: string) => void;
}

export default function CurrencyInput({ value, onChange, className = '', ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Nếu value là chuỗi rỗng hoặc undefined/null, hiển thị rỗng
    if (value === '' || value === undefined || value === null) {
      setDisplayValue('');
    } else {
      setDisplayValue(formatNumber(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanStr = rawValue.replace(/[^0-9-]/g, '');
    
    if (cleanStr === '' || cleanStr === '-') {
      setDisplayValue(cleanStr);
      onChange(''); // Pass empty to parent
      return;
    }

    const numberValue = parseInt(cleanStr, 10);
    setDisplayValue(formatNumber(numberValue));
    onChange(numberValue.toString());
  };

  return (
    <input
      type="text"
      className={`input-field ${className}`}
      value={displayValue}
      onChange={handleChange}
      {...props}
    />
  );
}
