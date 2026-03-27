import { Product, Role, User, Employee, BankMutation, Transaction, Customer, Supplier, Receivable, Expense, EmployeeFinancial, CattleOrder, Outlet, Notification, VisitRecord, Lead, SystemLog, ProductCategory } from './types';

export const MOCK_OUTLETS: Outlet[] = [];

export const MOCK_USERS: User[] = [
  { id: 'u0', name: 'Super Admin', username: 'admin', role: Role.ADMIN, avatar: 'https://i.pravatar.cc/150?u=admin', isApproved: true },
  { id: 'u3', name: 'Rudi AF', username: 'rudiaf', role: Role.ADMIN, avatar: 'https://i.pravatar.cc/150?u=3', employeeId: 'EMP-006', isApproved: true },
];

export const MOCK_VISIT_RECORDS: VisitRecord[] = [];

export const MOCK_SYSTEM_LOGS: SystemLog[] = [];

export const MOCK_LEADS: Lead[] = [];

export const MOCK_NOTIFICATIONS: Notification[] = [];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'P1', name: 'Daging Murni Premium', category: ProductCategory.PREMIUM, price: 135000, costPrice: 120000, stock: 50, unit: 'kg', minStock: 10, description: 'Daging sapi segar kualitas premium' },
  { id: 'P2', name: 'Daging Sop / Tetelan', category: ProductCategory.BONE, price: 95000, costPrice: 80000, stock: 30, unit: 'kg', minStock: 5, description: 'Cocok untuk sop dan soto' },
  { id: 'P3', name: 'Hati Sapi Segar', category: ProductCategory.OFFAL, price: 85000, costPrice: 70000, stock: 15, unit: 'kg', minStock: 3, description: 'Hati sapi segar harian' },
  { id: 'P4', name: 'Lemak / Gajih', category: ProductCategory.FAT, price: 45000, costPrice: 35000, stock: 20, unit: 'kg', minStock: 5, description: 'Lemak sapi untuk campuran masakan' },
  { id: 'P5', name: 'Iga Sapi', category: ProductCategory.BONE, price: 110000, costPrice: 95000, stock: 25, unit: 'kg', minStock: 5, description: 'Iga sapi potong' },
];

export const MOCK_EXPENSES: Expense[] = [];

export const MOCK_EMPLOYEES_FINANCIALS: EmployeeFinancial[] = [];

export const MOCK_EMPLOYEE_FINANCIALS = MOCK_EMPLOYEES_FINANCIALS;

export const MOCK_BANK_MUTATIONS: BankMutation[] = [];

export const MOCK_TRANSACTIONS: Transaction[] = [];

// --- UPDATED CUSTOMER DATA & DEBT ---
export const MOCK_CUSTOMERS: Customer[] = [];

// AUTO-GENERATE RECEIVABLES FROM CUSTOMERS WITH DEBT
export const MOCK_RECEIVABLES: Receivable[] = [];

export const MOCK_SUPPLIERS: Supplier[] = [];

export const MOCK_CATTLE_ORDERS: CattleOrder[] = [];

// --- UPDATED EMPLOYEE DATA ---
export const MOCK_EMPLOYEES: Employee[] = [];
