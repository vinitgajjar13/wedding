import React from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { MainLayout } from './components/layout/MainLayout.js';

// Views
import { DashboardView } from './views/DashboardView.js';
import { SmartAvailabilityView } from './views/SmartAvailabilityView.js';
import { ProductsView } from './views/ProductsView.js';
import { InventoryView } from './views/InventoryView.js';
import { BookingsView } from './views/BookingsView.js';
import { ReturnsView } from './views/ReturnsView.js';
import { CustomersView } from './views/CustomersView.js';
import { MeasurementsView } from './views/MeasurementsView.js';
import { AlterationsView } from './views/AlterationsView.js';
import { SalesOrdersView } from './views/SalesOrdersView.js';
import { CalendarView } from './views/CalendarView.js';
import { PaymentsView } from './views/PaymentsView.js';
import { ExpensesView } from './views/ExpensesView.js';
import { ReportsView } from './views/ReportsView.js';
import { SuppliersAndStaffView } from './views/SuppliersAndStaffView.js';
import { AuditLogsView } from './views/AuditLogsView.js';
import { SettingsView } from './views/SettingsView.js';

// Global Modals
import { ProductFormModal } from './components/products/ProductFormModal.js';
import { NewBookingWizardModal } from './components/bookings/NewBookingWizardModal.js';
import { ReturnInspectionModal } from './components/returns/ReturnInspectionModal.js';
import { CustomerFormModal } from './components/customers/CustomerFormModal.js';
import { InvoiceModal } from './components/common/InvoiceModal.js';
import { WhatsAppModal } from './components/common/WhatsAppModal.js';
import { QrModal } from './components/common/QrModal.js';
import { ToastContainer } from './components/common/ToastContainer.js';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'availability':
        return <SmartAvailabilityView />;
      case 'products':
        return <ProductsView />;
      case 'inventory':
        return <InventoryView />;
      case 'bookings':
        return <BookingsView />;
      case 'returns':
        return <ReturnsView />;
      case 'customers':
        return <CustomersView />;
      case 'measurements':
        return <MeasurementsView />;
      case 'alterations':
        return <AlterationsView />;
      case 'sales':
        return <SalesOrdersView />;
      case 'calendar':
        return <CalendarView />;
      case 'payments':
        return <PaymentsView />;
      case 'expenses':
        return <ExpensesView />;
      case 'reports':
        return <ReportsView />;
      case 'suppliers':
        return <SuppliersAndStaffView />;
      case 'audit':
        return <AuditLogsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <MainLayout>
      {renderView()}

      {/* Global Modals & Notifications */}
      <ProductFormModal />
      <NewBookingWizardModal />
      <ReturnInspectionModal />
      <CustomerFormModal />
      <InvoiceModal />
      <WhatsAppModal />
      <QrModal />
      <ToastContainer />
    </MainLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
