export type UserRole = 'Admin' | 'Manager' | 'Sales Staff' | 'Tailor' | 'Accountant' | 'Inventory Staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  active: boolean;
}

export type ProductType = 'rental' | 'sale' | 'both';
export type GenderCategory = 'men' | 'women' | 'accessories' | 'unisex';

export interface Category {
  id: string;
  name: string;
  gender: GenderCategory;
  subcategories: string[];
  isCustom?: boolean;
}

export type PhysicalItemStatus =
  | 'Available'
  | 'Booked'
  | 'Rented'
  | 'Out for Delivery'
  | 'Returned'
  | 'Cleaning'
  | 'Repair'
  | 'Alteration'
  | 'Damaged'
  | 'Lost'
  | 'Sold'
  | 'Inactive';

export type ItemCondition = 'Excellent' | 'Good' | 'Minor Damage' | 'Major Damage' | 'Missing';

export interface PhysicalInventoryItem {
  id: string; // e.g. SH001, RG001
  productId: string;
  sku: string;
  barcode: string;
  qrCode?: string;
  size: string;
  color: string;
  condition: ItemCondition;
  status: PhysicalItemStatus;
  currentLocation: string; // Rack A-12, Boutique Section 3
  rentalCount: number;
  lastRentalDate?: string;
  lastCleaningDate?: string;
  nextAvailableDate?: string;
  totalRevenue: number;
  cleaningCount?: number;
  repairsCount?: number;
  notes?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  gender: GenderCategory;
  brand: string;
  designer: string;
  color: string;
  fabric: string;
  sizes: string[];
  style: string;
  description: string;
  images: string[];
  purchasePrice: number;
  sellingPrice: number;
  rentalPrice: number; // base 3-day rental
  securityDeposit: number;
  type: ProductType;
  condition: string;
  location: string;
  supplierId?: string;
  createdDate: string;
  featured?: boolean;
  tags?: string[];
}

export interface MeasurementField {
  label: string;
  value: string;
}

export interface MenMeasurements {
  height?: string;
  weight?: string;
  chest?: string;
  waist?: string;
  shoulder?: string;
  sleeve?: string;
  neck?: string;
  kurtaLength?: string;
  sherwaniLength?: string;
  pantLength?: string;
  thigh?: string;
  bottom?: string;
  shoeSize?: string;
  customFields?: MeasurementField[];
}

export interface WomenMeasurements {
  height?: string;
  bust?: string;
  waist?: string;
  hip?: string;
  shoulder?: string;
  sleeve?: string;
  blouseLength?: string;
  lehengaWaist?: string;
  lehengaLength?: string;
  dupattaLength?: string;
  shoeSize?: string;
  customFields?: MeasurementField[];
}

export interface Customer {
  id: string;
  customerId: string; // e.g. CUST-2024-001
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  dateOfBirth?: string;
  notes?: string;
  menMeasurements?: MenMeasurements;
  womenMeasurements?: WomenMeasurements;
  totalBookings: number;
  totalPurchases: number;
  outstandingAmount: number;
  createdDate: string;
}

export type WeddingEventType =
  | 'Wedding'
  | 'Engagement'
  | 'Haldi'
  | 'Mehndi'
  | 'Sangeet'
  | 'Reception'
  | 'Wedding Ceremony'
  | 'Cocktail'
  | 'Pre-Wedding'
  | 'Other';

export interface WeddingEvent {
  id: string;
  name: WeddingEventType;
  customName?: string;
  eventDate: string;
  eventTime?: string;
  venue?: string;
}

export interface BookingItem {
  productId: string;
  physicalItemId: string;
  productName: string;
  productImage?: string;
  sku: string;
  size: string;
  rentalPrice: number;
  securityDeposit: number;
  eventName: WeddingEventType | string;
  measurementSnapshot?: MenMeasurements | WomenMeasurements;
  alterationDetails?: string;
}

export type BookingStatus =
  | 'Inquiry'
  | 'Quotation'
  | 'Reserved'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Picked Up'
  | 'Delivered'
  | 'Active Rental'
  | 'Returned'
  | 'Inspection'
  | 'Completed'
  | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Partial' | 'Paid' | 'Refunded';

export interface Booking {
  id: string;
  bookingNumber: string; // e.g. BK-2026-0801
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  weddingTitle: string; // e.g. "Rahul & Ananya Wedding"
  events: WeddingEvent[];
  items: BookingItem[];
  rentalStartDate: string;
  rentalEndDate: string;
  pickupDate: string;
  returnDate: string;
  deliveryAddress?: string;
  rentalAmount: number;
  securityDeposit: number;
  discount: number;
  taxRate: number; // e.g. 5 or 12 for GST
  taxAmount: number;
  totalAmount: number;
  advancePaid: number;
  remainingAmount: number;
  depositCollected: number;
  depositHeld: number;
  depositRefunded: number;
  depositDeducted: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdDate: string;
}

export type AlterationStatus = 'Pending' | 'In Progress' | 'Ready' | 'Completed';

export interface AlterationTask {
  id: string;
  bookingId: string;
  bookingNumber?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  productId?: string;
  productName: string;
  physicalItemId?: string;
  size?: string;
  alterationType?: string; // Sleeve shortening, Waist adjustment, Kurta length cut
  instructions?: string;
  measurements?: any;
  assignedTailorId?: string;
  assignedTailorName?: string;
  tailorName?: string;
  dueDate: string;
  status: AlterationStatus | string;
  notes?: string;
  createdDate?: string;
  completedDate?: string;
}

export interface ReturnInspectionItem {
  physicalItemId: string;
  productId: string;
  productName: string;
  size: string;
  condition: ItemCondition;
  damageType?: string;
  damageDescription?: string;
  damageRepairCost: number;
  customerDeduction: number;
  cleaningRequired: boolean;
  repairRequired: boolean;
}

export interface ReturnRecord {
  id: string;
  bookingId: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  returnDate: string;
  scheduledReturnDate: string;
  isLate: boolean;
  lateDays: number;
  lateFeePerDay: number;
  totalLateFee: number;
  inspectedItems: ReturnInspectionItem[];
  totalDamageCost: number;
  totalCustomerDeduction: number;
  securityDepositHeld: number;
  netDepositRefund: number;
  netCustomerPayable: number;
  processedBy: string;
  status: 'Inspected' | 'Completed';
  notes?: string;
  createdDate: string;
}

export interface SalesOrderItem {
  productId: string;
  physicalItemId?: string;
  productName: string;
  sku: string;
  size: string;
  price: number;
  quantity: number;
  total: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string; // e.g. SO-2026-042
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: SalesOrderItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  finalTotal: number;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Debit Card' | 'Credit Card';
  paymentStatus: 'Paid' | 'Partial' | 'Pending';
  deliveryStatus: 'Pending' | 'Ready' | 'Delivered';
  createdDate: string;
  notes?: string;
}

export type PaymentType =
  | 'Advance'
  | 'Partial Payment'
  | 'Final Payment'
  | 'Deposit'
  | 'Deposit Refund'
  | 'Refund'
  | 'Late Fee'
  | 'Damage Charge';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Debit Card' | 'Credit Card' | 'Other';

export interface PaymentRecord {
  id: string;
  bookingId?: string;
  bookingNumber?: string;
  salesOrderId?: string;
  orderNumber?: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  invoiceNumber?: string;
  date: string;
  notes?: string;
  receivedBy?: string;
}

export type ExpenseCategory =
  | 'Rent'
  | 'Salary'
  | 'Cleaning'
  | 'Laundry'
  | 'Tailoring'
  | 'Transport'
  | 'Packaging'
  | 'Repair'
  | 'Marketing'
  | 'Utilities'
  | 'Supplier'
  | 'Other';

export interface Expense {
  id: string;
  category: ExpenseCategory | string;
  title: string;
  amount: number;
  date: string;
  paidTo?: string;
  recipient?: string;
  paymentMethod: PaymentMethod | string;
  associatedType?: 'Wedding' | 'Booking' | 'Product' | 'Business';
  associatedId?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  categoriesProvided?: string[];
  categories?: string[];
  gstNumber?: string;
  gstin?: string;
  totalSupplied?: number;
  pendingBalance?: number;
  notes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: UserRole | string;
  phone: string;
  email?: string;
  salary?: number;
  joiningDate?: string;
  active: boolean;
  tasksAssigned?: number;
  permissions?: string[];
  specialization?: string; // "Master Sherwani Tailor", "Bridal Zari Specialist", etc.
}

export interface StoreSettings {
  businessName?: string;
  storeName?: string;
  tagline?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  upiId?: string;
  currencySymbol?: string;
  defaultTaxRate?: number; // e.g. 5%
  defaultGstRate?: number;
  defaultDepositRate?: number; // e.g. 50% of rental
  defaultSecurityDepositPercent?: number;
  lateFeePerDay?: number; // e.g. ₹500
  cleaningBufferDays?: number; // e.g. 1
  bufferDaysCleaning?: number;
  alterationBufferDays?: number; // e.g. 2
  defaultRentalDays?: number;
  termsAndConditions?: string;
  language?: 'en' | 'gu' | 'hi';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user?: string;
  userName?: string;
  action: string;
  target?: string;
  entityType?: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
}

export interface AvailabilitySearchResult {
  product: Product;
  availableItems: PhysicalInventoryItem[];
  isAvailable: boolean;
  reason?: string;
}
