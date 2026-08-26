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

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(url, options);

  const contentType = response.headers.get('content-type') || '';
  const json: ApiResponse<T> = contentType.includes('application/json')
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(
      json.message ||
        json.error ||
        `Request failed (${response.status} ${response.statusText})`
    );
  }

  return json;
}

async function requestData<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const json = await request<T>(url, options);
  return json.data as T;
}

const jsonOptions = (method: string, data: unknown): RequestInit => ({
  method,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});

export const api = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const json = await request<Category[]>('/api/categories');
    return json.data || [];
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    return requestData<Category>(
      '/api/categories',
      jsonOptions('POST', data)
    );
  },

  // Products
  async getProducts(params?: {
    category?: string;
    gender?: string;
    search?: string;
    type?: string;
  }): Promise<any[]> {
    const query = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.set(key, String(value));
        }
      });
    }

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const json = await request<any[]>(`/api/products${suffix}`);
    return json.data || [];
  },

  async getProduct(id: string): Promise<any> {
    return requestData<any>(
      `/api/products/${encodeURIComponent(id)}`
    );
  },

  async createProduct(data: any): Promise<Product> {
    return requestData<Product>(
      '/api/products',
      jsonOptions('POST', data)
    );
  },

  async updateProduct(
    id: string,
    data: Partial<Product>
  ): Promise<Product> {
    return requestData<Product>(
      `/api/products/${encodeURIComponent(id)}`,
      jsonOptions('PUT', data)
    );
  },

  async deleteProduct(id: string): Promise<boolean> {
    const json = await request<unknown>(
      `/api/products/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
    return Boolean(json.success);
  },

  // Inventory
  async getInventory(params?: {
    productId?: string;
    status?: string;
    size?: string;
    search?: string;
  }): Promise<any[]> {
    const query = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.set(key, String(value));
        }
      });
    }

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const json = await request<any[]>(`/api/inventory${suffix}`);
    return json.data || [];
  },

  async createInventoryItem(
    data: any
  ): Promise<PhysicalInventoryItem> {
    return requestData<PhysicalInventoryItem>(
      '/api/inventory',
      jsonOptions('POST', data)
    );
  },

  async updateInventoryItem(
    id: string,
    data: Partial<PhysicalInventoryItem>
  ): Promise<PhysicalInventoryItem> {
    return requestData<PhysicalInventoryItem>(
      `/api/inventory/${encodeURIComponent(id)}`,
      jsonOptions('PUT', data)
    );
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
  }): Promise<{
    query: any;
    data: AvailabilitySearchResult[];
  }> {
    return requestData<{
      query: any;
      data: AvailabilitySearchResult[];
    }>(
      '/api/inventory/check-availability',
      jsonOptions('POST', query)
    );
  },

  // Bookings
  async getBookings(params?: {
    status?: string;
    search?: string;
  }): Promise<Booking[]> {
    const query = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.set(key, String(value));
        }
      });
    }

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const json = await request<Booking[]>(`/api/bookings${suffix}`);
    return json.data || [];
  },

  async getBooking(id: string): Promise<any> {
    return requestData<any>(
      `/api/bookings/${encodeURIComponent(id)}`
    );
  },

  async createBooking(data: any): Promise<Booking> {
    return requestData<Booking>(
      '/api/bookings',
      jsonOptions('POST', data)
    );
  },

  async updateBookingStatus(
    id: string,
    status: string
  ): Promise<Booking> {
    return requestData<Booking>(
      `/api/bookings/${encodeURIComponent(id)}/status`,
      jsonOptions('PATCH', { status })
    );
  },

  // Returns
  async getReturns(): Promise<ReturnRecord[]> {
    const json = await request<ReturnRecord[]>('/api/returns');
    return json.data || [];
  },

  async processReturn(data: any): Promise<ReturnRecord> {
    return requestData<ReturnRecord>(
      '/api/returns',
      jsonOptions('POST', data)
    );
  },

  // Customers
  async getCustomers(search?: string): Promise<Customer[]> {
    const query = search
      ? `?search=${encodeURIComponent(search)}`
      : '';

    const json = await request<Customer[]>(
      `/api/customers${query}`
    );
    return json.data || [];
  },

  async getCustomer(id: string): Promise<any> {
    return requestData<any>(
      `/api/customers/${encodeURIComponent(id)}`
    );
  },

  async createCustomer(
    data: Partial<Customer>
  ): Promise<Customer> {
    return requestData<Customer>(
      '/api/customers',
      jsonOptions('POST', data)
    );
  },

  async updateCustomer(
    id: string,
    data: Partial<Customer>
  ): Promise<Customer> {
    return requestData<Customer>(
      `/api/customers/${encodeURIComponent(id)}`,
      jsonOptions('PUT', data)
    );
  },

  // Measurements
  async saveMeasurements(
    customerId: string,
    menMeasurements?: any,
    womenMeasurements?: any
  ): Promise<any> {
    return requestData<any>(
      '/api/measurements',
      jsonOptions('POST', {
        customerId,
        menMeasurements,
        womenMeasurements,
      })
    );
  },

  // Alterations
  async getAlterations(): Promise<AlterationTask[]> {
    const json = await request<AlterationTask[]>('/api/alterations');
    return json.data || [];
  },

  async createAlteration(
    data: Partial<AlterationTask>
  ): Promise<AlterationTask> {
    return requestData<AlterationTask>(
      '/api/alterations',
      jsonOptions('POST', data)
    );
  },

  async updateAlterationStatus(
    id: string,
    status: string
  ): Promise<AlterationTask> {
    return requestData<AlterationTask>(
      `/api/alterations/${encodeURIComponent(id)}`,
      jsonOptions('PATCH', { status })
    );
  },

  // Sales Orders
  async getSalesOrders(): Promise<SalesOrder[]> {
    const json = await request<SalesOrder[]>(
      '/api/sales-orders'
    );
    return json.data || [];
  },

  async createSalesOrder(data: any): Promise<SalesOrder> {
    return requestData<SalesOrder>(
      '/api/sales-orders',
      jsonOptions('POST', data)
    );
  },

  // Payments
  async getPayments(): Promise<PaymentRecord[]> {
    const json = await request<PaymentRecord[]>('/api/payments');
    return json.data || [];
  },

  async createPayment(
    data: Partial<PaymentRecord>
  ): Promise<PaymentRecord> {
    return requestData<PaymentRecord>(
      '/api/payments',
      jsonOptions('POST', data)
    );
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    const json = await request<Expense[]>('/api/expenses');
    return json.data || [];
  },

  async createExpense(
    data: Partial<Expense>
  ): Promise<Expense> {
    return requestData<Expense>(
      '/api/expenses',
      jsonOptions('POST', data)
    );
  },

  // Suppliers & Staff
  async getSuppliers(): Promise<Supplier[]> {
    const json = await request<Supplier[]>('/api/suppliers');
    return json.data || [];
  },

  async createSupplier(
    data: Partial<Supplier>
  ): Promise<Supplier> {
    return requestData<Supplier>(
      '/api/suppliers',
      jsonOptions('POST', data)
    );
  },

  async getStaff(): Promise<StaffMember[]> {
    const json = await request<StaffMember[]>('/api/staff');
    return json.data || [];
  },

  async createStaff(
    data: Partial<StaffMember>
  ): Promise<StaffMember> {
    return requestData<StaffMember>(
      '/api/staff',
      jsonOptions('POST', data)
    );
  },

  // Reports & Dashboard
  async getReportsSummary(): Promise<any> {
    return requestData<any>('/api/reports/summary');
  },

  async getDashboardStats(): Promise<any> {
    return requestData<any>('/api/reports/summary');
  },

  // Settings
  async getSettings(): Promise<StoreSettings> {
    return requestData<StoreSettings>('/api/settings');
  },

  async updateSettings(
    data: Partial<StoreSettings>
  ): Promise<StoreSettings> {
    return requestData<StoreSettings>(
      '/api/settings',
      jsonOptions('PUT', data)
    );
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const json = await request<AuditLog[]>('/api/audit-logs');
    return json.data || [];
  },

  // WhatsApp Link Generator
  async generateWhatsAppLink(
    bookingId: string,
    type:
      | 'confirmation'
      | 'pickup'
      | 'return_reminder'
      | 'late'
      | 'deposit_refund'
      | 'custom',
    customNotes?: string
  ): Promise<{
    text: string;
    phone: string;
    whatsappUrl: string;
  }> {
    const json = await request<{
      text: string;
      phone: string;
      whatsappUrl: string;
    }>(
      '/api/whatsapp/generate-link',
      jsonOptions('POST', {
        bookingId,
        type,
        customNotes,
      })
    );

    if (!json.data) {
      throw new Error(
        json.message || 'Failed to generate WhatsApp link'
      );
    }

    return json.data;
  },
};
