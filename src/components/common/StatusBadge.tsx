import React from 'react';
import { PhysicalItemStatus, BookingStatus, AlterationStatus, ItemCondition, PaymentStatus } from '../../types/index.js';

interface StatusBadgeProps {
  status: PhysicalItemStatus | BookingStatus | AlterationStatus | ItemCondition | PaymentStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', className = '' }) => {
  let badgeStyle = 'bg-stone-100 text-stone-700 border-stone-200';
  let dotColor = 'bg-stone-400';

  const s = String(status).toLowerCase();

  // Available / Completed / Paid / Excellent / Ready
  if (
    s === 'available' ||
    s === 'completed' ||
    s === 'paid' ||
    s === 'excellent' ||
    s === 'ready' ||
    s === 'confirmed'
  ) {
    badgeStyle = 'bg-[#F2F7F2] text-[#2C6E49] border-[#D3E8D8]';
    dotColor = 'bg-[#2C6E49]';
  }
  // Rented / Active Rental / In Progress / Partial / Good
  else if (
    s === 'rented' ||
    s === 'active rental' ||
    s === 'in progress' ||
    s === 'partial' ||
    s === 'good' ||
    s === 'picked up'
  ) {
    badgeStyle = 'bg-[#FDF8EE] text-[#A67C1E] border-[#F4E6C3]';
    dotColor = 'bg-[#C5A059]';
  }
  // Booked / Reserved / Preparing / Inquiry
  else if (s === 'booked' || s === 'reserved' || s === 'preparing' || s === 'inquiry' || s === 'quotation') {
    badgeStyle = 'bg-[#F0F4F8] text-[#1E4E79] border-[#D2E0EE]';
    dotColor = 'bg-[#2D68C4]';
  }
  // Cleaning / Laundry
  else if (s === 'cleaning' || s === 'returned' || s === 'inspection') {
    badgeStyle = 'bg-[#F5F0FA] text-[#6B3FA0] border-[#E3D4F5]';
    dotColor = 'bg-[#8E51DB]';
  }
  // Repair / Alteration / Minor Damage
  else if (s === 'repair' || s === 'alteration' || s === 'minor damage' || s === 'pending') {
    badgeStyle = 'bg-[#FEF5ED] text-[#C05621] border-[#FBD38D]';
    dotColor = 'bg-[#DD6B20]';
  }
  // Damaged / Lost / Cancelled / Major Damage / Missing
  else if (s === 'damaged' || s === 'lost' || s === 'cancelled' || s === 'major damage' || s === 'missing' || s === 'inactive') {
    badgeStyle = 'bg-[#FDF2F2] text-[#9B2C2C] border-[#FEB2B2]';
    dotColor = 'bg-[#E53E3E]';
  }
  // Sold
  else if (s === 'sold') {
    badgeStyle = 'bg-stone-800 text-stone-100 border-stone-700';
    dotColor = 'bg-emerald-400';
  }

  const sizeClasses =
    size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${badgeStyle} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span className="whitespace-nowrap capitalize">{status}</span>
    </span>
  );
};
