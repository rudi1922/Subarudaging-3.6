export enum Role {
  DIRECTOR = 'Director',
  MANAGER = 'Manager',
  ADMIN = 'Admin',
  CASHIER = 'Cashier',
  RPH_ADMIN = 'Admin RPH',
  SALES = 'Sales Marketing',
  DEBT_COLLECTOR = 'Debt Collector',
  CUSTOMER = 'Pelanggan',
  PUBLIC = 'Public'
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  phone?: string;
  coordinates?: { lat: number; lng: number };
  radius: number; // Required radius
}

export interface RolePermissions {
  role: Role;
  viewFinance: boolean;
  editStock: boolean;
  manageUsers: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  avatar?: string;
  outletId?: string;
  employeeId?: string;
  password?: string;
  isApproved: boolean; // Required
  referralCode?: string;
  referrerId?: string;
  totalEarnings?: number;
}

export interface Commission {
  id: string;
  referrerId: string;
  referredUserId: string;
  transactionId?: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  date: string;
  read: boolean;
  targetRoles: Role[];
}

export enum ProductCategory {
  PREMIUM = 'Daging Premium',
  OFFAL = 'Jeroan',
  BONE = 'Tulangan',
  FAT = 'Lemak/Gajih',
  OTHER = 'Lain-lain',
  PROMO = 'Daging Promo'
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice?: number; // Added costPrice
  stock: number;
  unit: string; // kg, pack
  minStock: number;
  image?: string; // Optional now
  description: string;
  batchNumber?: string;
  expiryDate?: string;
  outletId?: string; // Added for warehouse/location
}

export interface CartItem extends Product {
  qty: number;
  total?: number; // Added total property
}

export interface Transaction {
  id: string;
  date: string;
  time?: string;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost?: number; // Added shippingCost
  isDelivery?: boolean; // Added isDelivery
  total: number;
  downPayment?: number;
  items: CartItem[];
  paymentMethod: 'Tunai' | 'QRIS' | 'Debit' | 'Transfer' | 'Piutang';
  status: 'Selesai' | 'Pending';
  customerName: string;
  customerId?: string; // Added customerId
  customerType: 'Umum' | 'Tetap';
  outletId?: string;
  dueDate?: string;
  bankName?: string;
  bankRef?: string;
  cashier?: string;
}

export type Division = 'RPH Subaru' | 'Kantor Admin' | 'Subaru Tamin' | 'Subaru Way Halim' | 'Bagian Umum' | 'Tim Sales' | 'Tim Penagihan';

export interface Employee {
  id: string;
  name: string;
  division: Division;
  position: string;
  status: 'Hadir' | 'Terlambat' | 'Absen' | 'Pulang';
  checkInTime?: string;
  checkOutTime?: string; // Added checkOutTime
  baseSalary: number; // Daily Salary
  hourlyRate?: number; // Derived or explicit
  isWarehousePIC?: boolean;
  phone?: string;
  outletId?: string; // Assigned location
  deviceIp?: string; // Trusted IP
}

export interface EmployeeFinancial {
  id: string;
  employeeId: string;
  type: 'Kasbon' | 'Lembur' | 'Potongan' | 'Bonus';
  amount: number;
  date: string;
  description: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'Operasional' | 'Gaji' | 'Pembelian' | 'Lainnya';
  division: Division;
  amount: number;
  description: string;
  proofImage?: string;
  outletId?: string; // Added outletId
}

export interface BankMutation {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'CR' | 'DB';
  matched: boolean;
}

export type CustomerType = 'Umum' | 'Tetap';

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  phone: string;
  email: string;
  totalSpent: number;
  lastVisit: string;
  outstandingDebt?: number;
  address?: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  category: string; 
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export interface DebtPayment {
  id: string;
  receivableId: string;
  amount: number;
  date: string;
  collectorId?: string; // Who collected it
}

export interface Receivable {
  id: string;
  customerName: string;
  customerId?: string; // Added customerId
  amount: number;
  dueDate: string;
  status: 'Lunas' | 'Belum Lunas' | 'Jatuh Tempo';
  invoiceId: string;
  phone: string;
  outletId?: string; // Added outletId
}

export interface CattleOrder {
  id: string;
  supplierName: string;
  orderDate: string;
  quantity: number;
  weightType: string;
  healthCondition: string;
  arrivalDate: string;
  driverName: string;
  vehiclePlate: string;
  slaughterDate: string;
  slaughteredCount: number;
  totalLiveWeight: number;
  totalCarcassWeight: number;
  distribution: {
    taminTime: string;
    wayHalimTime: string;
    officeTime: string;
  };
}

// New Interface for Field Ops (Sales & DC)
export interface Lead {
  id: string;
  name: string;
  phone: string;
  location: string;
  status: 'Baru' | 'Prospek' | 'Closing' | 'Batal';
  notes: string;
  dateAdded: string;
  salesId: string;
  email?: string; // Added
  source?: string; // Added
  createdAt?: string; // Added
}

export interface VisitRecord {
  id: string;
  userId: string;
  userName: string;
  role: Role;
  customerName: string;
  location: string; // GPS coords or manual address
  timestamp: string;
  type: 'Sales Visit' | 'Penagihan';
  outcome: string; // "Janji Bayar", "Closing", "Follow Up"
  photo?: string; // URL for proof
  amountCollected?: number; // For DC
}

// NEW: System Activity Log
export interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  role: Role;
  action: 'LOGIN' | 'LOGOUT' | 'NAVIGATION' | 'ACTION';
  details: string;
  timestamp: string;
  ip: string;
  location: string; // Coordinates "Lat, Long"
  device: string;
}

export interface CattleType {
  id: string;
  name: string;
  defaultLivePrice: number;
  defaultCarcassPct: number;
}

export interface CattlePrice {
  id: string;
  date: string;
  cattleType: string; // e.g., 'Brahman', 'Limousin', 'Ongole'
  livePricePerKg: number; // Harga Hidup per KG
  estimatedCarcassPercentage: number; // e.g., 0.5 (50%)
  calculatedHPP: number; // Harga Pokok Produksi per KG Daging
  cattleTypeId?: string; // Added
  source?: string; // Added
}

export interface GalleryItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  content?: string; // For articles
  date: string;
  category?: string;
}

export interface LoyaltyProgram {
  id: string;
  title: string;
  description: string;
  targetKg: number;
  durationMonths: number;
  reward: string;
  isActive: boolean;
}

export interface AppSettings {
  allowNegativeStock: boolean;
  requireLocationForLogin: boolean;
  attendanceRadius: number;
  maxDiscountPercentage: number;
  enableDebtPayment: boolean;
  maintenanceMode: boolean;
  companyName?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  galleryImages?: string[];
  galleryItems?: GalleryItem[]; // Added dynamic gallery items
  loyaltyPrograms?: LoyaltyProgram[]; // Added loyalty programs
  rolePermissions?: RolePermissions[];
}

export enum PrinterType {
  THERMAL_58 = '58mm',
  THERMAL_80 = '80mm',
  A4 = 'A4',
  LEGAL = 'Legal',
  FOLIO = 'Folio',
}

export enum PrinterConnection {
  SYSTEM = 'System (USB/WiFi)',
  BLUETOOTH = 'Bluetooth (Thermal)',
  USB = 'Direct USB (WebUSB)',
}

export interface PrinterConfig {
  type: PrinterType;
  connection: PrinterConnection;
  deviceName?: string; // For Bluetooth
  deviceId?: string; // For Bluetooth
  autoPrint: boolean;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: 'Motor' | 'Pickup' | 'Truk Engkel' | 'Truk Pendingin';
  status: 'Tersedia' | 'Dalam Pengiriman' | 'Perbaikan';
  driverId?: string; // Assigned Driver
}

export interface Delivery {
  id: string;
  transactionId: string; // Linked Transaction
  customerName: string;
  address: string;
  status: 'Persiapan' | 'Dikirim' | 'Selesai' | 'Gagal';
  driverId: string;
  vehicleId: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  proofImage?: string;
}

export interface MarketNote {
  id: string;
  date: string;
  title: string;
  category: 'Nasional' | 'Lokal (Lampung)' | 'Kompetitor' | 'Regulasi';
  content: string;
  source?: string; // URL or "Internal Observation"
  author: string;
  tags: string[];
}

export interface MarketSurvey {
  id: string;
  date: string;
  marketName?: string; // e.g., Pasar Tugu, Pasar Panjang
  commodity?: 'Sapi Hidup' | 'Daging Murni' | 'Daging Fat' | 'Jeroan';
  price?: number;
  reporter?: string;
  notes?: string;
  location?: string; // Added
  userId?: string; // Added
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkInTime: string;
  checkOutTime?: string;
  status: 'Hadir' | 'Terlambat' | 'Absen' | 'Izin' | 'Sakit';
  totalHours?: number;
  notes?: string;
  checkInLocation?: string;
  checkOutLocation?: string;
  checkInIp?: string;
  checkOutIp?: string;
}

export interface WeighingLog {
  id: string;
  date: string;
  type?: 'RPH_TO_WAREHOUSE' | 'WAREHOUSE_TO_OUTLET' | 'WAREHOUSE_TO_CONSUMER';
  referenceId?: string; // PO ID or Product ID
  referenceName?: string;
  weight: number;
  notes?: string;
  operator?: string;
  cattleId?: string; // Added
  userId?: string; // Added
}

export interface PricePoint {
  id: string;
  date: string; // YYYY-MM-DD
  sapiHidup: number;
  dagingSapi: number;
}

export interface PrintingData {
    title: string;
    columns: string[];
    rows: (string | number)[][];
}

export interface ReceiptItem {
    name: string;
    price: number;
    qty: number;
    total?: number;
}

export interface Asset {
  id: string;
  name: string;
  category: 'Kendaraan' | 'Peralatan' | 'Properti' | 'Lainnya';
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  depreciationRate: number; // Percentage per year
  notes?: string;
  outletId?: string;
}

export interface PrivateTransaction {
  id: string;
  date: string;
  type: 'Pemasukan' | 'Pengeluaran';
  category: string;
  amount: number;
  description: string;
  userId: string; // Only for Director/Admin
}

export interface ReceiptData {
    title?: string;
    subtitle?: string;
    date: string;
    expense?: {
        category: string;
        division: string;
        description: string;
        amount: number;
    };
    transactionId?: string;
    id?: string;
    cashier?: string;
    user?: string;
    items?: ReceiptItem[];
    total: number;
    subtotal?: number;
    shippingCost?: number;
    isDelivery?: boolean;
    paymentMethod?: string;
    employee?: {
        name: string;
        division: string;
    };
    earnings?: { label: string; value: number }[];
    deductions?: { label: string; value: number }[];
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}