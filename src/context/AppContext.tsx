import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, translations } from '../i18n/translations.js';
import { UserRole, Product, PhysicalInventoryItem, Booking } from '../types/index.js';

import { useRouter } from '../router/Router.js';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentView: string;
  setCurrentView: (view: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  // Modals & Drawers
  activeProductDetail: Product | null;
  setActiveProductDetail: (p: Product | null) => void;
  activeQrItem: PhysicalInventoryItem | null;
  setActiveQrItem: (item: PhysicalInventoryItem | null) => void;
  activeWhatsAppBooking: { booking: Booking; defaultType?: string } | null;
  setActiveWhatsAppBooking: (data: { booking: Booking; defaultType?: string } | null) => void;
  activeInvoice: { type: 'booking' | 'sale'; data: any } | null;
  setActiveInvoice: (inv: { type: 'booking' | 'sale'; data: any } | null) => void;

  // Wizard & Action Modals
  isNewBookingOpen: boolean;
  setIsNewBookingOpen: (open: boolean) => void;
  preselectedBookingOutfit: { product: Product; physicalItem?: PhysicalInventoryItem; eventDate?: string; returnDate?: string } | null;
  openBookingWizardWithOutfit: (product: Product, physicalItem?: PhysicalInventoryItem, eventDate?: string, returnDate?: string) => void;
  closeBookingWizard: () => void;

  isReturnModalOpen: boolean;
  setIsReturnModalOpen: (open: boolean) => void;
  preselectedReturnBookingId: string | null;
  openReturnModal: (bookingId?: string) => void;
  closeReturnModal: () => void;

  isNewProductOpen: boolean;
  setIsNewProductOpen: (open: boolean) => void;

  isNewCustomerOpen: boolean;
  setIsNewCustomerOpen: (open: boolean) => void;

  // Notifications & Refreshes
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { viewId, navigate } = useRouter();
  const currentView = viewId;
  const setCurrentView = (view: string) => {
    navigate(view);
  };
  const [language, setLanguage] = useState<Language>('en');
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');

  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);
  const [activeQrItem, setActiveQrItem] = useState<PhysicalInventoryItem | null>(null);
  const [activeWhatsAppBooking, setActiveWhatsAppBooking] = useState<{ booking: Booking; defaultType?: string } | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<{ type: 'booking' | 'sale'; data: any } | null>(null);

  const [isNewBookingOpen, setIsNewBookingOpen] = useState<boolean>(false);
  const [preselectedBookingOutfit, setPreselectedBookingOutfit] = useState<{
    product: Product;
    physicalItem?: PhysicalInventoryItem;
    eventDate?: string;
    returnDate?: string;
  } | null>(null);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
  const [preselectedReturnBookingId, setPreselectedReturnBookingId] = useState<string | null>(null);

  const [isNewProductOpen, setIsNewProductOpen] = useState<boolean>(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState<boolean>(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const openBookingWizardWithOutfit = (
    product: Product,
    physicalItem?: PhysicalInventoryItem,
    eventDate?: string,
    returnDate?: string
  ) => {
    setPreselectedBookingOutfit({ product, physicalItem, eventDate, returnDate });
    setIsNewBookingOpen(true);
  };

  const closeBookingWizard = () => {
    setPreselectedBookingOutfit(null);
    setIsNewBookingOpen(false);
  };

  const openReturnModal = (bookingId?: string) => {
    setPreselectedReturnBookingId(bookingId || null);
    setIsReturnModalOpen(true);
  };

  const closeReturnModal = () => {
    setPreselectedReturnBookingId(null);
    setIsReturnModalOpen(false);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        language,
        setLanguage,
        t,
        currentRole,
        setCurrentRole,
        activeProductDetail,
        setActiveProductDetail,
        activeQrItem,
        setActiveQrItem,
        activeWhatsAppBooking,
        setActiveWhatsAppBooking,
        activeInvoice,
        setActiveInvoice,
        isNewBookingOpen,
        setIsNewBookingOpen,
        preselectedBookingOutfit,
        openBookingWizardWithOutfit,
        closeBookingWizard,
        isReturnModalOpen,
        setIsReturnModalOpen,
        preselectedReturnBookingId,
        openReturnModal,
        closeReturnModal,
        isNewProductOpen,
        setIsNewProductOpen,
        isNewCustomerOpen,
        setIsNewCustomerOpen,
        toasts,
        showToast,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
