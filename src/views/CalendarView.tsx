import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, Clock, User, Shirt } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { Booking } from '../types/index.js';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay.js';
import { StatusBadge } from '../components/common/StatusBadge.js';

export const CalendarView: React.FC = () => {
  const { openReturnModal, refreshTrigger } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    api.getBookings().then(setBookings).catch(console.error);
  }, [refreshTrigger]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // Generate calendar cells
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const getEventsForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(
      (b) =>
        b.eventDate === dayStr ||
        b.rentalStartDate === dayStr ||
        b.returnDate === dayStr
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Wedding Season & Rental Dispatch Calendar
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Visual calendar for pickup schedules, wedding event dates, and return deadlines
          </p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-3 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-stone-200">
          <button
            onClick={prevMonth}
            className="p-1 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-luxury font-bold text-xs text-stone-900 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden">
        <div className="grid grid-cols-7 border-b border-stone-200 bg-[#FAF8F5] text-center text-xs font-bold text-stone-600 py-3">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-stone-100 min-h-[500px]">
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="bg-[#FAF8F5]/30 p-2 min-h-[90px]" />;
            }

            const events = getEventsForDay(day);
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day-${day}`}
                className={`p-2 min-h-[90px] transition-colors flex flex-col justify-between ${
                  isToday ? 'bg-[#FAF4E6]/40' : 'hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'w-5 h-5 bg-[#1F2421] text-white rounded-full flex items-center justify-center text-[10px]'
                        : 'text-stone-700'
                    }`}
                  >
                    {day}
                  </span>
                  {events.length > 0 && (
                    <span className="text-[10px] text-[#9E7B3B] font-bold">
                      {events.length} Event{events.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="space-y-1 mt-1 overflow-y-auto max-h-24">
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-1 rounded bg-[#FCFAF7] border border-[#EFE8DC] text-[10px] text-stone-800 leading-tight"
                    >
                      <div className="font-bold truncate text-[#1F2421]">{ev.customerName}</div>
                      <div className="text-stone-500 truncate text-[9px]">{ev.weddingTitle}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
