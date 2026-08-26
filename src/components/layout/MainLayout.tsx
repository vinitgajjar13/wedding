import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Shirt,
  Boxes,
  CalendarDays,
  Users,
  Ruler,
  Scissors,
  RotateCcw,
  ShoppingBag,
  CreditCard,
  Receipt,
  Truck,
  UserCheck,
  BarChart3,
  Settings,
  History,
  Menu,
  X,
  Plus,
  Search,
  Globe,
  Crown,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { UserRole } from '../../types/index.js';

interface NavItem {
  id: string;
  labelKey: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roleRestriction?: UserRole[];
}

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentView,
    setCurrentView,
    t,
    language,
    setLanguage,
    currentRole,
    setCurrentRole,
    setIsNewBookingOpen,
    openReturnModal,
    setIsNewProductOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const navItems: NavItem[] = [
    { id: 'dashboard', labelKey: 'dashboard', defaultLabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'smart-search', labelKey: 'smartAvailability', defaultLabel: 'Smart Outfit Finder', icon: Sparkles, badge: 'Live Dates' },
    { id: 'products', labelKey: 'products', defaultLabel: 'Products & Wear', icon: Shirt },
    { id: 'inventory', labelKey: 'inventory', defaultLabel: 'Physical Inventory', icon: Boxes },
    { id: 'bookings', labelKey: 'bookings', defaultLabel: 'Rental Bookings', icon: CalendarDays },
    { id: 'returns', labelKey: 'returns', defaultLabel: 'Returns & Inspection', icon: RotateCcw },
    { id: 'calendar', labelKey: 'calendar', defaultLabel: 'Wedding Calendar', icon: CalendarDays },
    { id: 'customers', labelKey: 'customers', defaultLabel: 'Customers', icon: Users },
    { id: 'measurements', labelKey: 'measurements', defaultLabel: 'Measurements', icon: Ruler },
    { id: 'alterations', labelKey: 'alterations', defaultLabel: 'Alterations & Tailoring', icon: Scissors },
    { id: 'orders', labelKey: 'orders', defaultLabel: 'Sales Orders', icon: ShoppingBag },
    { id: 'payments', labelKey: 'payments', defaultLabel: 'Payments & Deposits', icon: CreditCard },
    { id: 'expenses', labelKey: 'expenses', defaultLabel: 'Expenses', icon: Receipt },
    { id: 'suppliers-staff', labelKey: 'suppliers', defaultLabel: 'Suppliers & Staff', icon: Truck },
    { id: 'reports', labelKey: 'reports', defaultLabel: 'Reports & Profit', icon: BarChart3 },
    { id: 'audit-logs', labelKey: 'auditLogs', defaultLabel: 'Audit Logs', icon: History },
    { id: 'settings', labelKey: 'settings', defaultLabel: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setCurrentView(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#FAF8F5] overflow-hidden text-[#1E2022]">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#EBE4D5] bg-[#FFFFFF] shadow-xs z-30 select-none">
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-[#F0ECE1] bg-gradient-to-b from-[#FAF8F5] to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1F2421] text-[#C5A059] flex items-center justify-center shadow-xs">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-luxury font-extrabold text-lg tracking-wider text-[#1F2421]">
                VASTRAVEDA
              </h1>
              <p className="text-[10px] text-[#9E7B3B] font-semibold uppercase tracking-widest -mt-0.5">
                Couture & Rental SaaS
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="p-3 border-b border-[#F5F2EC]">
          <button
            onClick={() => setIsNewBookingOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#1F2421] text-white hover:bg-[#303833] rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer group"
          >
            <Plus className="w-4 h-4 text-[#C5A059] group-hover:rotate-90 transition-transform" />
            <span>+ New Rental Booking</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#F5EFE3] text-[#1F2421] font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-[#9E7B3B]' : 'text-stone-400'}`}
                  />
                  <span>{t(item.labelKey) || item.defaultLabel}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#FAF2DE] text-[#9E7B3B] rounded-full border border-[#EBDCB9]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Language & Role */}
        <div className="p-3 border-t border-[#F0ECE1] bg-[#FAF8F5] space-y-2">
          {/* Language Switcher */}
          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-[#EBE4D5] text-xs">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
              <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Language:</span>
            </div>
            <div className="flex gap-1">
              {(['en', 'gu', 'hi'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                    language === lang
                      ? 'bg-[#1F2421] text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'gu' ? 'ગુજ' : 'हिन्दी'}
                </button>
              ))}
            </div>
          </div>

          {/* Active Role Selector */}
          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-[#EBE4D5] text-xs">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
              <UserCheck className="w-3.5 h-3.5 text-stone-400" />
              <span>Role:</span>
            </div>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              aria-label="User role switch"
              className="text-[11px] font-semibold text-stone-800 bg-transparent outline-none cursor-pointer"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Sales Staff">Sales Staff</option>
              <option value="Tailor">Tailor</option>
              <option value="Accountant">Accountant</option>
              <option value="Inventory Staff">Inventory Staff</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[80%] bg-white h-full shadow-2xl z-10">
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#C5A059]" />
                <span className="font-luxury font-bold text-base">VASTRAVEDA</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                      isActive ? 'bg-[#F5EFE3] text-[#1F2421] font-bold' : 'text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-stone-500" />
                      <span>{t(item.labelKey) || item.defaultLabel}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#FAF2DE] text-[#9E7B3B] rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#EBE4D5] bg-white px-4 lg:px-8 flex items-center justify-between gap-4 shrink-0 z-20">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-stone-400">VastraVeda Studio</span>
              <span className="text-stone-300">/</span>
              <span className="font-semibold text-stone-800 capitalize">
                {navItems.find((n) => n.id === currentView)?.defaultLabel || currentView}
              </span>
            </div>
          </div>

          {/* Center/Right Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Smart Outfit Finder Button */}
            <button
              onClick={() => setCurrentView('smart-search')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                currentView === 'smart-search'
                  ? 'bg-[#1F2421] text-white border-[#1F2421]'
                  : 'bg-[#FAF4E6] text-[#8C6B28] border-[#EBDCB9] hover:bg-[#F5EAD2]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="hidden md:inline">Smart Outfit Availability</span>
              <span className="md:hidden">Check Dates</span>
            </button>

            {/* Inspect Return Quick Action */}
            <button
              onClick={() => openReturnModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-50 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Inspect Return</span>
            </button>

            {/* Add Garment Quick Action */}
            <button
              onClick={() => setIsNewProductOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-50 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <Shirt className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">+ Add Garment</span>
            </button>

            {/* Role Chip */}
            <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-stone-200 text-xs">
              <div className="w-7 h-7 rounded-full bg-[#FAF4E6] border border-[#EBDCB9] flex items-center justify-center font-luxury font-bold text-xs text-[#9E7B3B]">
                {currentRole[0]}
              </div>
              <div className="leading-tight">
                <div className="font-semibold text-stone-800 text-[11px]">{currentRole}</div>
                <div className="text-[10px] text-stone-400">Bodakdev Flagship</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};
