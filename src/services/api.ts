import {
  Product,
  PhysicalInventoryItem,
  Customer,
  Booking,
  AlterationTask,
  ReturnRecord,
  SalesOrder,
  PaymentRecord,
  Expense,
  Supplier,
  StaffMember,
  StoreSettings,
  AuditLog,
  Category,
  AvailabilitySearchResult,
} from '../types/index.js';

export const api = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    const json = await res.json();
    return json.data || [];
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // Products
  async getProducts(params?: { category?: string; gender?: string; search?: string; type?: string }): Promise<any[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/products?${query}`);
    const json = await res.json();
    return json.data || [];
  },

  async getProduct(id: string): Promise<any> {
    const res = await fetch(`/api/products/${id}`);
    const json = await res.json();
    return json.data;
  },

  async createProduct(data: any): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  },

  // Inventory
  async getInventory(params?: { productId?: string; status?: string; size?: string; search?: string }): Promise<any[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/inventory?${query}`);
    const json = await res.json();
    return json.data || [];
  },

  async createInventoryItem(data: any): Promise<PhysicalInventoryItem> {
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async updateInventoryItem(id: string, data: Partial<PhysicalInventoryItem>): Promise<PhysicalInventoryItem> {
    const res = await fetch(`/api/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // Smart Availability Check
  async checkAvailability(query: {
    startDate: string;
    endDate: string;
    category?: string;
    gender?: string;
    size?: string;
    maxBudget?: number;
    searchQuery?: string;
  }): Promise<{ query: any; data: AvailabilitySearchResult[] }> {
    const res = await fetch('/api/inventory/check-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    });
    const json = await res.json();
    return json;
  },

  // Bookings
  async getBookings(params?: { status?: string; search?: string }): Promise<Booking[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/bookings?${query}`);
    const json = await res.json();
    return json.data || [];
  },

  async getBooking(id: string): Promise<any> {
    const res = await fetch(`/api/bookings/${id}`);
    const json = await res.json();
    return json.data;
  },

  async createBooking(data: any): Promise<Booking> {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Failed to create booking');
    }
    return json.data;
  },

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    return json.data;
  },

  // Returns
  async getReturns(): Promise<ReturnRecord[]> {
    const res = await fetch('/api/returns');
    const json = await res.json();
    return json.data || [];
  },

  async processReturn(data: any): Promise<ReturnRecord> {
    const res = await fetch('/api/returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to process return');
    return json.data;
  },

  // Customers
  async getCustomers(search?: string): Promise<Customer[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`/api/customers${query}`);
    const json = await res.json();
    return json.data || [];
  },

  async getCustomer(id: string): Promise<any> {
    const res = await fetch(`/api/customers/${id}`);
    const json = await res.json();
    return json.data;
  },

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // Measurements
  async saveMeasurements(customerId: string, menMeasurements?: any, womenMeasurements?: any): Promise<any> {
    const res = await fetch('/api/measurements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, menMeasurements, womenMeasurements }),
    });
    const json = await res.json();
    return json.data;
  },

  // Alterations
  async getAlterations(): Promise<AlterationTask[]> {
    const res = await fetch('/api/alterations');
    const json = await res.json();
    return json.data || [];
  },

  async createAlteration(data: Partial<AlterationTask>): Promise<AlterationTask> {
    const res = await fetch('/api/alterations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async updateAlterationStatus(id: string, status: string): Promise<AlterationTask> {
    const res = await fetch(`/api/alterations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    return json.data;
  },

  // Sales Orders
  async getSalesOrders(): Promise<SalesOrder[]> {
    const res = await fetch('/api/sales-orders');
    const json = await res.json();
    return json.data || [];
  },

  async createSalesOrder(data: any): Promise<SalesOrder> {
    const res = await fetch('/api/sales-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // Payments
  async getPayments(): Promise<PaymentRecord[]> {
    const res = await fetch('/api/payments');
    const json = await res.json();
    return json.data || [];
  },

  async createPayment(data: Partial<PaymentRecord>): Promise<PaymentRecord> {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    const res = await fetch('/api/expenses');
    const json = await res.json();
    return json.data || [];
  },

  async createExpense(data: Partial<Expense>): Promise<Expense> {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // Suppliers & Staff
  async getSuppliers(): Promise<Supplier[]> {
    const res = await fetch('/api/suppliers');
    const json = await res.json();
    return json.data || [];
  },

  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async getStaff(): Promise<StaffMember[]> {
    const res = await fetch('/api/staff');
    const json = await res.json();
    return json.data || [];
  },

  async createStaff(data: Partial<StaffMember>): Promise<StaffMember> {
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // Reports & Dashboard
  async getReportsSummary(): Promise<any> {
    const res = await fetch('/api/reports/summary');
    const json = await res.json();
    return json.data;
  },

  async getDashboardStats(): Promise<any> {
    const res = await fetch('/api/reports/summary');
    const json = await res.json();
    return json.data;
  },

  // Settings
  async getSettings(): Promise<StoreSettings> {
    const res = await fetch('/api/settings');
    const json = await res.json();
    return json.data;
  },

  async updateSettings(data: Partial<StoreSettings>): Promise<StoreSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs');
    const json = await res.json();
    return json.data || [];
  },

  // WhatsApp Link Generator
  async generateWhatsAppLink(
    bookingId: string,
    type: 'confirmation' | 'pickup' | 'return_reminder' | 'late' | 'deposit_refund' | 'custom',
    customNotes?: string
  ): Promise<{ text: string; phone: string; whatsappUrl: string }> {
    const res = await fetch('/api/whatsapp/generate-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, type, customNotes }),
    });
    const json = await res.json();
    return json;
  },
};
