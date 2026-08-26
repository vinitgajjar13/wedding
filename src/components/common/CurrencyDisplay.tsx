import React from 'react';

interface CurrencyDisplayProps {
  amount: number | undefined | null;
  className?: string;
  symbolClassName?: string;
  showZero?: boolean;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  className = 'font-semibold text-[#1F2421]',
  symbolClassName = 'text-[#C5A059] mr-0.5 font-normal',
  showZero = true,
}) => {
  const val = Number(amount) || 0;
  if (!showZero && val === 0) return <span>-</span>;

  // Format using Indian Numbering System (e.g. 1,25,000)
  const formatted = val.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });

  return (
    <span className={`inline-flex items-baseline tracking-tight ${className}`}>
      <span className={symbolClassName}>₹</span>
      <span>{formatted}</span>
    </span>
  );
};
