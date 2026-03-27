import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { calculateDistance } from './utils/location';
import { Product, ProductCategory, Transaction, Receivable, CartItem, Expense, EmployeeFinancial, Employee, CattleOrder, Outlet, Notification, Role, VisitRecord, Lead, SystemLog, CattlePrice, AppSettings, PrinterConfig, PrinterType, PrinterConnection, Customer, User, Delivery, Vehicle, CourierLocation, MarketNote, PricePoint, MarketSurvey, WeighingLog, AttendanceRecord, Supplier, DebtPayment, CattleType, RolePermissions, GalleryItem, LoyaltyProgram, Commission, Asset, PrivateTransaction } from './types';

interface StoreContextType {
  products: Product[];
  transactions: Transaction[];
  receivables: Receivable[];
  debtPayments: DebtPayment[];
  expenses: Expense[];
  employees: Employee[];
  employeeFinancials: EmployeeFinancial[];
  cattleOrders: CattleOrder[];
  outlets: Outlet[];
  notifications: Notification[];
  visitRecords: VisitRecord[];
  leads: Lead[];
  systemLogs: SystemLog[];
  cattlePrices: CattlePrice[];
  cattleTypes: CattleType[];
  appSettings: AppSettings;
  printerConfig: PrinterConfig;
  searchQuery: string;
  customers: Customer[];
  users: User[];
  deliveries: Delivery[];
  vehicles: Vehicle[];
  courierLocations: CourierLocation[];
  marketNotes: MarketNote[];
  pricePoints: PricePoint[];
  marketSurveys: MarketSurvey[];
  weighingLogs: WeighingLog[];
  attendanceHistory: AttendanceRecord[];
  suppliers: Supplier[];
  divisions: string[];
  commissions: Commission[];
  collectionTarget: number;
  navigationParams: { view?: string; tab?: string; action?: string; params?: Record<string, unknown> } | null;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  setDivisions: React.Dispatch<React.SetStateAction<string[]>>;
  setCommissions: React.Dispatch<React.SetStateAction<Commission[]>>;
  setCollectionTarget: React.Dispatch<React.SetStateAction<number>>;
  setNavigationParams: React.Dispatch<React.SetStateAction<{ view?: string; tab?: string; action?: string; params?: Record<string, unknown> } | null>>;
  galleryItems: GalleryItem[];
  loyaltyPrograms: LoyaltyProgram[];
  addGalleryItem: (item: GalleryItem) => void;
  updateGalleryItem: (item: GalleryItem) => void;
  deleteGalleryItem: (id: string) => void;
  addLoyaltyProgram: (program: LoyaltyProgram) => void;
  updateLoyaltyProgram: (program: LoyaltyProgram) => void;
  deleteLoyaltyProgram: (id: string) => void;
  addCommission: (commission: Commission) => void;
  addTransaction: (transaction: Transaction) => void;
  addExpense: (expense: Expense) => void;
  addEmployeeFinancial: (record: EmployeeFinancial) => void;
  addCattleOrder: (order: CattleOrder) => void;
  updateCattleOrder: (order: CattleOrder) => void;
  deleteCattleOrder: (id: string) => void;
  addOutlet: (outlet: Outlet) => void;
  updateOutlet: (outlet: Outlet) => void;
  deleteOutlet: (id: string) => void;
  addNotification: (notification: Notification) => void;
  addVisitRecord: (record: VisitRecord) => void;
  addLead: (lead: Lead) => void;
  addSystemLog: (log: SystemLog) => void;
  addCattlePrice: (price: CattlePrice) => void;
  addCattleType: (type: CattleType) => void;
  deleteCattleType: (id: string) => void;
  addCustomer: (customer: Customer) => void;
  addUser: (user: User) => void;
  deleteUser: (id: string) => void;
  checkInEmployee: (id: string, status: 'Hadir' | 'Terlambat' | 'Absen' | 'Pulang', time: string, location?: string, ip?: string) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  updateRolePermissions: (permissions: RolePermissions[]) => void;
  updatePrinterConfig: (config: Partial<PrinterConfig>) => void;
  markNotificationRead: (id: string) => void;
  updateProductStock: (items: CartItem[]) => void;
  transferStock: (productId: string, quantity: number, toOutlet: string) => void;
  setSearchQuery: (query: string) => void;
  payReceivable: (id: string, amount: number, collectorId?: string) => void;
  addDelivery: (delivery: Delivery) => void;
  updateDelivery: (delivery: Delivery) => void;
  updateCourierLocation: (location: CourierLocation) => void;
  addVehicle: (vehicle: Vehicle) => void;
  addMarketNote: (note: MarketNote) => void;
  deleteMarketNote: (id: string) => void;
  addPricePoint: (point: PricePoint) => void;
  addMarketSurvey: (survey: MarketSurvey) => void;
  addWeighingLog: (log: WeighingLog) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  initializeMeatProducts: () => Promise<void>;
  initializeEmployees: () => Promise<void>;
  approveUser: (id: string) => Promise<void>;
  customerMode: boolean;
  setCustomerMode: (mode: boolean) => void;
  assets: Asset[];
  addAsset: (asset: Asset) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  privateTransactions: PrivateTransaction[];
  addPrivateTransaction: (tx: PrivateTransaction) => void;
  deletePrivateTransaction: (id: string) => void;
  isLoading: boolean;
  confirm: (options: { title: string; message: string; onConfirm: () => void }) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(`Failed to parse localStorage for ${key}:`, e);
      }
    }
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const generateTimestampId = () => Date.now().toString();

  const [products, setProducts] = usePersistentState<Product[]>('app_products', []);
  const [transactions, setTransactions] = usePersistentState<Transaction[]>('app_transactions', []);
  const [receivables, setReceivables] = usePersistentState<Receivable[]>('app_receivables', []);
  const [debtPayments, setDebtPayments] = usePersistentState<DebtPayment[]>('app_debt_payments', []);
  const [expenses, setExpenses] = usePersistentState<Expense[]>('app_expenses', []);
  const [employees, setEmployees] = usePersistentState<Employee[]>('app_employees', []);
  const [employeeFinancials, setEmployeeFinancials] = usePersistentState<EmployeeFinancial[]>('app_employee_financials', []);
  const [cattleOrders, setCattleOrders] = usePersistentState<CattleOrder[]>('app_cattle_orders', []);
  const [outlets, setOutlets] = usePersistentState<Outlet[]>('app_outlets', [
    { id: 'o1', name: 'Kantor Pusat', address: 'Jl. Utama No. 1', phone: '08123456789', radius: 100, isStatic: true },
    { id: 'o2', name: 'RPH Subaru', address: 'Jl. RPH No. 2', phone: '08123456789', radius: 100, isStatic: true },
    { id: 'o3', name: 'Umum', address: 'Lokasi Umum', phone: '08123456789', radius: 100, isStatic: true },
    { id: 'o4', name: 'Gerai Pasar Tamin', address: 'Pasar Tamin', phone: '08123456789', radius: 100 },
    { id: 'o5', name: 'Gerai Pasar Way Halim', address: 'Pasar Way Halim', phone: '08123456789', radius: 100 },
    { id: 'o6', name: 'Gerai Pasar Tugu', address: 'Pasar Tugu', phone: '08123456789', radius: 100 }
  ]);
  const [notifications, setNotifications] = usePersistentState<Notification[]>('app_notifications', []);
  const [visitRecords, setVisitRecords] = usePersistentState<VisitRecord[]>('app_visit_records', []);
  const [leads, setLeads] = usePersistentState<Lead[]>('app_leads', []);
  const [systemLogs, setSystemLogs] = usePersistentState<SystemLog[]>('app_system_logs', []);
  const [cattlePrices, setCattlePrices] = usePersistentState<CattlePrice[]>('app_cattle_prices', []);
  const [cattleTypes, setCattleTypes] = usePersistentState<CattleType[]>('app_cattle_types', []);
  const [galleryItems, setGalleryItems] = usePersistentState<GalleryItem[]>('app_gallery_items', [
    { id: 'g1', title: 'Proses Produksi Higienis', subtitle: 'Standar keamanan pangan internasional', imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=1200", date: '01 Mar 2026', category: 'Produksi', content: 'Kami menerapkan standar HACCP dalam setiap proses produksi daging sapi kami...' },
    { id: 'g2', title: 'Distribusi Armada', subtitle: 'Pengiriman tepat waktu', imageUrl: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?q=80&w=600", date: '28 Feb 2026', category: 'Logistik', content: 'Armada kami dilengkapi dengan pendingin untuk menjaga kualitas daging tetap segar...' },
    { id: 'g3', title: 'Kunjungan Dinas', subtitle: 'Sinergi dengan pemerintah', imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600", date: '25 Feb 2026', category: 'Kegiatan', content: 'Menerima kunjungan dari Dinas Peternakan untuk peninjauan standar RPH...' },
    { id: 'g4', title: 'Kualitas Premium', subtitle: 'Daging pilihan terbaik', imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=1200", date: '20 Feb 2026', category: 'Produk', content: 'Setiap potongan daging melewati kontrol kualitas yang ketat sebelum dipasarkan...' }
  ]);
  const [loyaltyPrograms, setLoyaltyPrograms] = usePersistentState<LoyaltyProgram[]>('app_loyalty_programs', []);
  const [navigationParams, setNavigationParams] = usePersistentState<{ view?: string; tab?: string; action?: string; params?: Record<string, unknown> } | null>('app_nav_params', null);
  const [customers, setCustomers] = usePersistentState<Customer[]>('app_customers', []);
  const [users, setUsers] = usePersistentState<User[]>('app_users', []);
  const [deliveries, setDeliveries] = usePersistentState<Delivery[]>('app_deliveries', [
    { id: 'DEL-001', transactionId: 'T-001', vehicleId: 'v1', driverId: 'u1', status: 'In Transit', estimatedArrival: '14:30', notes: 'Jl. Merdeka No. 10' },
    { id: 'DEL-002', transactionId: 'T-002', vehicleId: 'v2', driverId: 'u2', status: 'Pending', estimatedArrival: '16:00', notes: 'Pasar Tamin' }
  ]);
  const [vehicles, setVehicles] = usePersistentState<Vehicle[]>('app_vehicles', [
    { id: 'v1', name: 'Truck Pendingin 01', type: 'Truck', plateNumber: 'BE 1234 AB', status: 'Available', capacity: 2000, lastMaintenance: '2026-01-15' },
    { id: 'v2', name: 'Pickup 02', type: 'Pickup', plateNumber: 'BE 5678 CD', status: 'In Use', capacity: 1000, lastMaintenance: '2026-02-10' }
  ]);
  const [courierLocations, setCourierLocations] = usePersistentState<CourierLocation[]>('app_courier_locations', [
    { userId: 'u1', latitude: -5.3971, longitude: 105.2668, status: 'In Transit', timestamp: new Date().toISOString() },
    { userId: 'u2', latitude: -5.4071, longitude: 105.2768, status: 'Delivering', timestamp: new Date().toISOString() }
  ]);
  const [marketNotes, setMarketNotes] = usePersistentState<MarketNote[]>('app_market_notes', []);
  const [pricePoints, setPricePoints] = usePersistentState<PricePoint[]>('app_price_points', []);
  const [marketSurveys, setMarketSurveys] = usePersistentState<MarketSurvey[]>('app_market_surveys', []);
  const [weighingLogs, setWeighingLogs] = usePersistentState<WeighingLog[]>('app_weighing_logs', []);
  const [attendanceHistory, setAttendanceHistory] = usePersistentState<AttendanceRecord[]>('app_attendance_history', []);
  const [suppliers, setSuppliers] = usePersistentState<Supplier[]>('app_suppliers', []);
  const [divisions, setDivisions] = usePersistentState<string[]>('app_divisions', [
    'DIVISI KANTOR PUSAT',
    'DIVISI RPH SUBARU',
    'DIVISI SUBARU PASAR TAMIN',
    'DIVISI SUBARU PASAR WAY HALIM',
    'DIVISI SUBARU PASAR TUGU',
    'DIVISI UMUM'
  ]);
  const [commissions, setCommissions] = usePersistentState<Commission[]>('app_commissions', []);
  const [collectionTarget, setCollectionTarget] = usePersistentState<number>('app_collection_target', 10000000); // Default 10jt
  const [customerMode, setCustomerMode] = usePersistentState<boolean>('app_customer_mode', false);
  const [assets, setAssets] = usePersistentState<Asset[]>('app_assets', []);
  const [privateTransactions, setPrivateTransactions] = usePersistentState<PrivateTransaction[]>('app_private_transactions', []);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmOptions, setConfirmOptions] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const confirm = (options: { title: string; message: string; onConfirm: () => void }) => {
    setConfirmOptions(options);
  };

  const [appSettings, setAppSettings] = usePersistentState<AppSettings>('app_settings', {
      allowNegativeStock: false,
      requireLocationForLogin: true,
      attendanceRadius: 100, // Default 100m
      maxDiscountPercentage: 10,
      enableDebtPayment: true,
      maintenanceMode: false,
      companyName: 'Subaru Daging Sapi',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/1134/1134447.png',
      heroImageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80',
      galleryImages: [
          'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=1200',
          'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?q=80&w=600',
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600',
          'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=1200'
      ]
  });
  const [printerConfig, setPrinterConfig] = usePersistentState<PrinterConfig>('app_printer_config', {
      type: PrinterType.THERMAL_58,
      connection: PrinterConnection.SYSTEM,
      autoPrint: false
  });
  
  // Initialize Global Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // --- OFFLINE SYNC QUEUE ---
  const isProcessingQueueRef = React.useRef(false);
  useEffect(() => {
    const processQueue = async () => {
        if (isProcessingQueueRef.current) return;
        if (navigator.onLine && isSupabaseConfigured) {
            isProcessingQueueRef.current = true;
            let queue = [];
            try {
                queue = JSON.parse(localStorage.getItem('offline_transaction_queue') || '[]');
            } catch (e) {
                console.error('Failed to parse offline queue:', e);
                localStorage.removeItem('offline_transaction_queue');
                isProcessingQueueRef.current = false;
                return;
            }
            if (queue.length > 0) {
                console.warn(`Processing ${queue.length} offline transactions...`);
                const newQueue = [];
                for (const tx of queue) {
                    try {
                        const { error } = await supabase.from('transactions').insert({
                             id: tx.id,
                             date: tx.date,
                             total: tx.total,
                             payment_method: tx.paymentMethod,
                             items: tx.items,
                             cash_amount: tx.cashAmount,
                             change_amount: tx.changeAmount,
                             customer_name: tx.customerName,
                             customer_id: tx.customerId,
                             outlet_id: tx.outletId,
                             shipping_cost: tx.shippingCost,
                             is_delivery: tx.isDelivery,
                             due_date: tx.dueDate,
                             down_payment: tx.downPayment,
                             bank_name: tx.bankName,
                             bank_ref: tx.bankRef,
                             status: tx.status
                        });
                        if (error) throw error;
                    } catch (err) {
                        console.error('Failed to sync transaction:', err);
                        newQueue.push(tx); // Keep in queue if failed
                    }
                }
                localStorage.setItem('offline_transaction_queue', JSON.stringify(newQueue));
                if (newQueue.length === 0) {
                    console.warn('All offline transactions synced!');
                    // Refresh data
                    // fetchTable('transactions', setTransactions, ...); // Ideally re-fetch
                }
            }
            isProcessingQueueRef.current = false;
        }
    };

    window.addEventListener('online', processQueue);
    // Try processing on mount too
    processQueue();

    return () => window.removeEventListener('online', processQueue);
  }, []);

  // --- SUPABASE INTEGRATION ---
  const isFetchingRef = React.useRef(false);
  useEffect(() => {
    const fetchData = async () => {
        // Only fetch if Supabase is configured and not already fetching
        if (!isSupabaseConfigured) {
            setIsLoading(false);
            return;
        }
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        const fetchTable = async <T,>(table: string, setter: (data: T[]) => void, transform?: (data: Record<string, unknown>[]) => T[]) => {
            try {
                // Add a timeout to prevent hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                const { data, error } = await supabase.from(table).select('*');
                clearTimeout(timeoutId);
                
                if (error) throw error;
                if (data) {
                    setter(transform ? transform(data as Record<string, unknown>[]) : data as T[]);
                }
            } catch (err) {
                console.warn(`Failed to fetch ${table} from Supabase:`, err);
            }
        };

        await Promise.all([
            fetchTable<Product>('products', setProducts, (data) => data.map((p) => ({
                ...p as unknown as Product,
                minStock: (p.min_stock as number) || 0,
                costPrice: (p.cost_price as number) || 0,
                outletId: (p.outlet_id as string) || 'HEAD-OFFICE'
            }))),
            fetchTable<Transaction>('transactions', setTransactions, (data) => data.map((t) => ({
                ...t as unknown as Transaction,
                paymentMethod: (t.payment_method as Transaction['paymentMethod']) || 'Tunai',
                customerName: (t.customer_name as string) || 'Umum',
                customerId: (t.customer_id as string) || '',
                outletId: (t.outlet_id as string) || 'HEAD-OFFICE',
                shippingCost: (t.shipping_cost as number) || 0,
                isDelivery: (t.is_delivery as boolean) || false,
                dueDate: (t.due_date as string) || '',
                downPayment: (t.down_payment as number) || 0,
                bankName: (t.bank_name as string) || '',
                bankRef: (t.bank_ref as string) || ''
            }))),
            fetchTable<Expense>('expenses', setExpenses, (data) => data.map((e) => ({
                ...e as unknown as Expense,
                proofImage: e.receipt_image as string,
                division: e.division as Expense['division'],
                outletId: e.outlet_id as string
            }))),
            fetchTable<DebtPayment>('debt_payments', setDebtPayments, (data) => data.map((dp) => ({
                id: dp.id as string,
                receivableId: dp.receivable_id as string,
                amount: dp.amount as number,
                date: dp.date as string,
                collectorId: dp.collector_id as string
            }))),
            fetchTable<Employee>('employees', setEmployees, (data) => data.map((e) => ({
                ...e as unknown as Employee,
                checkInTime: (e.check_in_time as string) || '',
                checkOutTime: (e.check_out_time as string) || '',
                baseSalary: (e.base_salary as number) || 0,
                outletId: (e.outlet_id as string) || 'HEAD-OFFICE',
                deviceIp: (e.device_ip as string) || '',
                isWarehousePIC: (e.is_warehouse_pic as boolean) || false
            }))),
            fetchTable<User>('users', setUsers, (data) => data.map((u) => {
                const dbRole = (u.role as string || '').toLowerCase();
                let normalizedRole = Role.CASHIER; // Default
                if (dbRole === 'admin') normalizedRole = Role.ADMIN;
                else if (dbRole === 'manager') normalizedRole = Role.MANAGER;
                else if (dbRole === 'director') normalizedRole = Role.DIRECTOR;
                else if (dbRole === 'cashier') normalizedRole = Role.CASHIER;
                else if (dbRole === 'staff') normalizedRole = Role.STAFF;
                else if (dbRole === 'sales' || dbRole === 'sales marketing' || dbRole === 'sales_marketing') normalizedRole = Role.SALES;
                else if (dbRole === 'debt collector' || dbRole === 'debt_collector') normalizedRole = Role.DEBT_COLLECTOR;
                else if (dbRole === 'rph_admin' || dbRole === 'admin rph' || dbRole === 'admin_rph') normalizedRole = Role.RPH_ADMIN;
                else if (dbRole === 'pelanggan' || dbRole === 'customer') normalizedRole = Role.CUSTOMER;
                else if (dbRole === 'public') normalizedRole = Role.PUBLIC;

                return {
                    ...u as unknown as User,
                    role: normalizedRole,
                    employeeId: u.employee_id as string,
                    outletId: u.outlet_id as string,
                    isApproved: (u.is_approved ?? u.isApproved) as boolean
                };
            })),
            fetchTable<AttendanceRecord>('attendance', setAttendanceHistory, (data) => data.map((item) => ({
                id: item.id as string,
                employeeId: item.employee_id as string,
                date: item.date as string,
                checkInTime: item.check_in_time as string,
                checkOutTime: item.check_out_time as string,
                status: item.status as AttendanceRecord['status'],
                totalHours: item.total_hours as number,
                checkInLocation: item.check_in_location as string,
                checkOutLocation: item.check_out_location as string,
                checkInIp: item.check_in_ip as string,
                checkOutIp: item.check_out_ip as string
            }))),
            fetchTable<SystemLog>('system_logs', setSystemLogs, (data) => data.map((log) => ({
                id: log.id as string,
                userId: log.user_id as string,
                userName: log.user_name as string,
                action: log.action as SystemLog['action'],
                details: log.details as string,
                role: log.role as Role,
                timestamp: (log.timestamp || log.created_at) as string,
                ip: log.ip as string,
                location: log.location as string,
                device: log.device as string
            }))),
            fetchTable<CattleType>('cattle_types', setCattleTypes, (data) => data.map((ct) => ({
                id: ct.id as string,
                name: ct.name as string,
                defaultLivePrice: ct.default_live_price as number,
                defaultCarcassPct: ct.default_carcass_pct as number
            }))),
            fetchTable<Customer>('customers', setCustomers, (data) => data.map((c) => ({
                ...c as unknown as Customer,
                totalSpent: c.total_spent as number,
                lastVisit: c.last_visit as string,
                outstandingDebt: c.outstanding_debt as number
            }))),
            fetchTable<Outlet>('outlets', setOutlets, (data) => data.map((o) => ({
                id: o.id as string,
                name: o.name as string,
                address: o.address as string,
                phone: o.phone as string,
                coordinates: o.coordinates as Outlet['coordinates'],
                radius: o.radius as number
            }))),
            fetchTable<EmployeeFinancial>('employee_financials', setEmployeeFinancials, (data) => data.map((ef) => ({
                ...ef as unknown as EmployeeFinancial,
                employeeId: ef.employee_id as string,
                approvedBy: ef.approved_by as string
            }))),
            fetchTable<CattleOrder>('cattle_orders', setCattleOrders, (data) => data.map((co) => ({
                ...co as unknown as CattleOrder,
                supplierId: co.supplier_id as string,
                orderDate: co.order_date as string,
                expectedArrival: co.expected_arrival as string,
                totalAmount: co.total_amount as number
            }))),
            fetchTable<VisitRecord>('visit_records', setVisitRecords, (data) => data.map((vr) => ({
                ...vr as unknown as VisitRecord,
                customerId: vr.customer_id as string,
                userId: vr.user_id as string
            }))),
            fetchTable<Lead>('leads', setLeads, (data) => data.map((l) => ({
                ...l as unknown as Lead,
                createdAt: l.created_at as string
            }))),
            fetchTable<CattlePrice>('cattle_prices', setCattlePrices, (data) => data.map((cp) => ({
                ...cp as unknown as CattlePrice,
                cattleTypeId: cp.cattle_type_id as string
            }))),
            fetchTable<Delivery>('deliveries', setDeliveries, (data) => data.map((d) => ({
                ...d as unknown as Delivery,
                transactionId: d.transaction_id as string,
                vehicleId: d.vehicle_id as string,
                driverId: d.driver_id as string,
                estimatedArrival: d.estimated_arrival as string,
                actualArrival: d.actual_arrival as string
            }))),
            fetchTable<Vehicle>('vehicles', setVehicles, (data) => data.map((v) => ({
                ...v as unknown as Vehicle,
                plateNumber: v.plate_number as string,
                lastMaintenance: v.last_maintenance as string
            }))),
            fetchTable<MarketNote>('market_notes', setMarketNotes, (data) => data.map((mn) => ({
                ...mn as unknown as MarketNote,
                userId: mn.user_id as string
            }))),
            fetchTable<PricePoint>('price_points', setPricePoints, (data) => data.map((pp) => ({
                ...pp as unknown as PricePoint,
                marketSurveyId: pp.market_survey_id as string,
                productName: pp.product_name as string
            }))),
            fetchTable<MarketSurvey>('market_surveys', setMarketSurveys, (data) => data.map((ms) => ({
                ...ms as unknown as MarketSurvey,
                userId: ms.user_id as string
            }))),
            fetchTable<WeighingLog>('weighing_logs', setWeighingLogs, (data) => data.map((wl) => ({
                ...wl as unknown as WeighingLog,
                cattleId: wl.cattle_id as string,
                userId: wl.user_id as string
            }))),
            fetchTable<GalleryItem>('gallery_items', setGalleryItems),
            fetchTable<LoyaltyProgram>('loyalty_programs', setLoyaltyPrograms),
            fetchTable<Commission>('commissions', setCommissions, (data) => data.map((c) => ({
                ...c as unknown as Commission,
                referrerId: c.referrer_id as string,
                referredUserId: c.referred_user_id as string,
                transactionId: c.transaction_id as string,
                createdAt: (c.created_at || c.timestamp) as string
            }))),
            fetchTable<AppSettings>('settings', (data) => {
                 if (data && data.length > 0) {
                    const s = data[0] as unknown as Record<string, unknown>;
                    setAppSettings(prev => ({
                        ...prev,
                        companyName: s.company_name as string,
                        logoUrl: s.logo_url as string,
                        heroImageUrl: s.hero_image_url as string,
                        maintenanceMode: s.maintenance_mode as boolean,
                        allowNegativeStock: s.allow_negative_stock as boolean,
                        requireLocationForLogin: s.require_location_for_login as boolean,
                        attendanceRadius: s.attendance_radius as number,
                        maxDiscountPercentage: s.max_discount_percentage as number,
                        enableDebtPayment: s.enable_debt_payment as boolean,
                        galleryImages: s.gallery_images as string[],
                        rolePermissions: s.role_permissions as RolePermissions[]
                    }));
                }
            })
        ]);
        setIsLoading(false);
    };

    fetchData();

    // Realtime Subscriptions
    if (isSupabaseConfigured) {
        const productSubscription = supabase
            .channel('public:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setProducts(prev => {
                        if (prev.some(p => p.id === payload.new.id)) return prev;
                        return [payload.new as Product, ...prev];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
                } else if (payload.eventType === 'DELETE') {
                    setProducts(prev => prev.filter(p => p.id !== payload.old.id));
                }
            })
            .subscribe();

        const transactionSubscription = supabase
            .channel('public:transactions')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
                setTransactions(prev => {
                    if (prev.some(t => t.id === payload.new.id)) return prev;
                    return [payload.new as Transaction, ...prev];
                });
            })
            .subscribe();

        const attendanceSubscription = supabase
            .channel('public:attendance')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newItem = payload.new as Record<string, unknown>;
                    const formattedItem: AttendanceRecord = {
                        id: newItem.id as string,
                        employeeId: newItem.employee_id as string,
                        date: newItem.date as string,
                        checkInTime: newItem.check_in_time as string,
                        checkOutTime: newItem.check_out_time as string,
                        status: newItem.status as AttendanceRecord['status'],
                        totalHours: newItem.total_hours as number,
                        checkInLocation: newItem.check_in_location as string,
                        checkOutLocation: newItem.check_out_location as string
                    };
                    setAttendanceHistory(prev => {
                        if (prev.some(a => a.id === formattedItem.id)) return prev;
                        return [formattedItem, ...prev];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    const updatedItem = payload.new as Record<string, unknown>;
                    setAttendanceHistory(prev => prev.map(item => item.id === updatedItem.id ? {
                        ...item,
                        checkOutTime: updatedItem.check_out_time as string,
                        status: updatedItem.status as AttendanceRecord['status'],
                        totalHours: updatedItem.total_hours as number,
                        checkOutLocation: updatedItem.check_out_location as string
                    } : item));
                }
            })
            .subscribe();

        const logsSubscription = supabase
            .channel('public:system_logs')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload) => {
                setSystemLogs(prev => {
                    if (prev.some(l => l.id === payload.new.id)) return prev;
                    return [payload.new as SystemLog, ...prev];
                });
            })
            .subscribe();

        const employeeSubscription = supabase
            .channel('public:employees')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setEmployees(prev => {
                        if (prev.some(e => e.id === payload.new.id)) return prev;
                        const e = payload.new as Record<string, unknown>;
                        return [{
                            ...e,
                            checkInTime: e.check_in_time || '',
                            checkOutTime: e.check_out_time || '',
                            baseSalary: e.base_salary || 0,
                            outletId: e.outlet_id || 'HEAD-OFFICE',
                            deviceIp: e.device_ip || '',
                            isWarehousePIC: e.is_warehouse_pic || false
                        } as Employee, ...prev];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    const e = payload.new as Record<string, unknown>;
                    setEmployees(prev => prev.map(emp => emp.id === e.id ? {
                        ...emp,
                        ...e,
                        checkInTime: e.check_in_time || emp.checkInTime,
                        checkOutTime: e.check_out_time || emp.checkOutTime,
                        baseSalary: e.base_salary || emp.baseSalary,
                        outletId: e.outlet_id || emp.outletId,
                        deviceIp: e.device_ip || emp.deviceIp,
                        isWarehousePIC: e.is_warehouse_pic ?? emp.isWarehousePIC
                    } as Employee : emp));
                } else if (payload.eventType === 'DELETE') {
                    setEmployees(prev => prev.filter(e => e.id !== payload.old.id));
                }
            })
            .subscribe();

        const financialSubscription = supabase
            .channel('public:employee_financials')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'employee_financials' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setEmployeeFinancials(prev => {
                        if (prev.some(f => f.id === payload.new.id)) return prev;
                        const f = payload.new as Record<string, unknown>;
                        return [{
                            ...f,
                            employeeId: f.employee_id,
                            approvedBy: f.approved_by
                        } as EmployeeFinancial, ...prev];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    const f = payload.new as Record<string, unknown>;
                    setEmployeeFinancials(prev => prev.map(fin => fin.id === f.id ? {
                        ...fin,
                        ...f,
                        employeeId: f.employee_id || fin.employeeId,
                        approvedBy: f.approved_by || fin.approvedBy
                    } as EmployeeFinancial : fin));
                } else if (payload.eventType === 'DELETE') {
                    setEmployeeFinancials(prev => prev.filter(f => f.id !== payload.old.id));
                }
            })
            .subscribe();

        const deliverySubscription = supabase
            .channel('public:deliveries')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setDeliveries(prev => {
                        if (prev.some(d => d.id === payload.new.id)) return prev;
                        const d = payload.new as Record<string, unknown>;
                        return [{
                            ...d,
                            transactionId: d.transaction_id,
                            vehicleId: d.vehicle_id,
                            driverId: d.driver_id,
                            estimatedArrival: d.estimated_arrival,
                            actualArrival: d.actual_arrival
                        } as Delivery, ...prev];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    const d = payload.new as Record<string, unknown>;
                    setDeliveries(prev => prev.map(del => del.id === d.id ? {
                        ...del,
                        ...d,
                        transactionId: d.transaction_id || del.transactionId,
                        vehicleId: d.vehicle_id || del.vehicleId,
                        driverId: d.driver_id || del.driverId,
                        estimatedArrival: d.estimated_arrival || del.estimatedArrival,
                        actualArrival: d.actual_arrival || del.actualArrival
                    } as Delivery : del));
                } else if (payload.eventType === 'DELETE') {
                    setDeliveries(prev => prev.filter(d => d.id !== payload.old.id));
                }
            })
            .subscribe();

        const vehicleSubscription = supabase
            .channel('public:vehicles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setVehicles(prev => {
                        if (prev.some(v => v.id === payload.new.id)) return prev;
                        const v = payload.new as Record<string, unknown>;
                        return [{
                            ...v,
                            plateNumber: v.plate_number,
                            lastMaintenance: v.last_maintenance
                        } as Vehicle, ...prev];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    const v = payload.new as Record<string, unknown>;
                    setVehicles(prev => prev.map(veh => veh.id === v.id ? {
                        ...veh,
                        ...v,
                        plateNumber: v.plate_number || veh.plateNumber,
                        lastMaintenance: v.last_maintenance || veh.lastMaintenance
                    } as Vehicle : veh));
                } else if (payload.eventType === 'DELETE') {
                    setVehicles(prev => prev.filter(v => v.id !== payload.old.id));
                }
            })
            .subscribe();

        const usersSubscription = supabase
            .channel('public:users')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    const u = payload.new as Record<string, unknown>;
                    const dbRole = (u.role as string || '').toLowerCase();
                    let normalizedRole = Role.CASHIER;
                    if (dbRole === 'admin') normalizedRole = Role.ADMIN;
                    else if (dbRole === 'manager') normalizedRole = Role.MANAGER;
                    else if (dbRole === 'director') normalizedRole = Role.DIRECTOR;
                    else if (dbRole === 'cashier') normalizedRole = Role.CASHIER;
                    else if (dbRole === 'staff') normalizedRole = Role.STAFF;
                    else if (dbRole === 'sales' || dbRole === 'sales marketing' || dbRole === 'sales_marketing') normalizedRole = Role.SALES;
                    else if (dbRole === 'debt collector' || dbRole === 'debt_collector') normalizedRole = Role.DEBT_COLLECTOR;
                    else if (dbRole === 'rph_admin' || dbRole === 'admin rph' || dbRole === 'admin_rph') normalizedRole = Role.RPH_ADMIN;
                    else if (dbRole === 'pelanggan' || dbRole === 'customer') normalizedRole = Role.CUSTOMER;
                    else if (dbRole === 'public') normalizedRole = Role.PUBLIC;

                    setUsers(prev => prev.map(user => user.id === u.id ? {
                        ...user,
                        ...u as unknown as User,
                        role: normalizedRole,
                        isApproved: (u.is_approved ?? u.isApproved) as boolean
                    } : user));
                }
            })
            .subscribe();

        const commissionSubscription = supabase
            .channel('public:commissions')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'commissions' }, (payload) => {
                setCommissions(prev => {
                    if (prev.some(c => c.id === payload.new.id)) return prev;
                    const c = payload.new as Record<string, unknown>;
                    return [{
                        id: c.id,
                        referrerId: c.referrer_id,
                        referredUserId: c.referred_user_id,
                        transactionId: c.transaction_id,
                        amount: c.amount,
                        percentage: c.percentage,
                        status: c.status,
                        createdAt: c.created_at
                    } as Commission, ...prev];
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(productSubscription);
            supabase.removeChannel(transactionSubscription);
            supabase.removeChannel(attendanceSubscription);
            supabase.removeChannel(logsSubscription);
            supabase.removeChannel(usersSubscription);
            supabase.removeChannel(commissionSubscription);
            supabase.removeChannel(employeeSubscription);
            supabase.removeChannel(financialSubscription);
            supabase.removeChannel(deliverySubscription);
            supabase.removeChannel(vehicleSubscription);
        };
    }
  }, [setProducts, setTransactions, setExpenses, setDebtPayments, setEmployees, setUsers, setAttendanceHistory, setSystemLogs, setCattleTypes, setCustomers, setOutlets, setEmployeeFinancials, setCattleOrders, setVisitRecords, setLeads, setCattlePrices, setDeliveries, setVehicles, setMarketNotes, setPricePoints, setMarketSurveys, setWeighingLogs, setGalleryItems, setLoyaltyPrograms, setCommissions, setAppSettings]);

  const approveUser = async (id: string) => {
    try {
        if (import.meta.env.VITE_SUPABASE_URL) {
            const { data, error } = await supabase
                .from('users')
                .update({ is_approved: true })
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            if (data) {
                setUsers(prev => prev.map(u => u.id === id ? { ...u, isApproved: true } : u));
                addSystemLog({
                    id: generateTimestampId(),
                    userId: 'SYSTEM',
                    userName: 'System',
                    role: Role.ADMIN,
                    action: 'ACTION',
                    details: `User ${data.name} approved`,
                    timestamp: new Date().toISOString(),
                    ip: '',
                    location: '',
                    device: ''
                });
            }
        }
    } catch (error) {
        console.error('Failed to approve user:', error);
    }
  };

  const addDelivery = async (delivery: Delivery) => {
      setDeliveries(prev => [delivery, ...prev]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('deliveries').insert({
              id: delivery.id,
              transaction_id: delivery.transactionId,
              vehicle_id: delivery.vehicleId,
              driver_id: delivery.driverId,
              status: delivery.status,
              estimated_arrival: delivery.estimatedArrival,
              actual_arrival: delivery.actualArrival,
              notes: delivery.notes,
              proof_image: delivery.proofImage
          });
      }
  };

  const updateDelivery = async (delivery: Delivery) => {
      setDeliveries(prev => prev.map(d => d.id === delivery.id ? delivery : d));
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('deliveries').update({
              transaction_id: delivery.transactionId,
              vehicle_id: delivery.vehicleId,
              driver_id: delivery.driverId,
              status: delivery.status,
              estimated_arrival: delivery.estimatedArrival,
              actual_arrival: delivery.actualArrival,
              notes: delivery.notes,
              proof_image: delivery.proofImage,
              current_location: delivery.currentLocation
          }).eq('id', delivery.id);
      }
  };

  const updateCourierLocation = (location: CourierLocation) => {
    setCourierLocations(prev => {
      const exists = prev.find(l => l.userId === location.userId);
      if (exists) {
        return prev.map(l => l.userId === location.userId ? location : l);
      }
      return [...prev, location];
    });
  };

  const addVehicle = async (vehicle: Vehicle) => {
      setVehicles(prev => [vehicle, ...prev]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('vehicles').insert({
              id: vehicle.id,
              plate_number: vehicle.plateNumber,
              type: vehicle.type,
              status: vehicle.status,
              last_maintenance: vehicle.lastMaintenance
          });
      }
  };

  const addMarketNote = async (note: MarketNote) => {
      setMarketNotes(prev => [note, ...prev]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('market_notes').insert({
              id: note.id,
              user_id: note.userId,
              content: note.content,
              date: note.date,
              tags: note.tags
          });
      }
  };

  const deleteMarketNote = async (id: string) => {
      setMarketNotes(prev => prev.filter(n => n.id !== id));
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('market_notes').delete().eq('id', id);
      }
  };

  const addPricePoint = async (point: PricePoint) => {
      setPricePoints(prev => [...prev, point]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('price_points').insert({
              id: point.id,
              market_survey_id: point.marketSurveyId,
              product_name: point.productName,
              price: point.price,
              unit: point.unit
          });
      }
  };

  const addMarketSurvey = async (survey: MarketSurvey) => {
      setMarketSurveys(prev => [survey, ...prev]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('market_surveys').insert({
              id: survey.id,
              location: survey.location,
              date: survey.date,
              user_id: survey.userId,
              notes: survey.notes
          });
      }
  };

  const addWeighingLog = async (log: WeighingLog) => {
      setWeighingLogs(prev => [log, ...prev]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('weighing_logs').insert({
              id: log.id,
              cattle_id: log.cattleId,
              weight: log.weight,
              date: log.date,
              user_id: log.userId,
              notes: log.notes
          });
      }
  };

  const addProduct = async (product: Product) => {
      setProducts(prev => [product, ...prev]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          const { error } = await supabase.from('products').insert({
              id: product.id,
              name: product.name,
              category: product.category,
              price: product.price,
              stock: product.stock,
              unit: product.unit,
              min_stock: product.minStock,
              description: product.description,
              image: product.image,
              cost_price: product.costPrice,
              outlet_id: product.outletId
          });
          if (error) console.error('Error adding product to Supabase:', error);
      }
  };

  const updateProduct = async (product: Product) => {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      if (import.meta.env.VITE_SUPABASE_URL) {
          const { error } = await supabase.from('products').update({
              name: product.name,
              category: product.category,
              price: product.price,
              stock: product.stock,
              unit: product.unit,
              min_stock: product.minStock,
              description: product.description,
              image: product.image,
              cost_price: product.costPrice,
              outlet_id: product.outletId
          }).eq('id', product.id);
          if (error) console.error('Error updating product in Supabase:', error);
      }
  };

  const deleteProduct = async (id: string) => {
      setProducts(prev => prev.filter(p => p.id !== id));
      if (import.meta.env.VITE_SUPABASE_URL) {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (error) console.error('Error deleting product from Supabase:', error);
      }
  };

  const addAsset = (asset: Asset) => {
    setAssets(prev => [...prev, asset]);
  };

  const updateAsset = (asset: Asset) => {
    setAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const addPrivateTransaction = (tx: PrivateTransaction) => {
    setPrivateTransactions(prev => [...prev, tx]);
  };

  const deletePrivateTransaction = (id: string) => {
    setPrivateTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCattlePrice = async (price: CattlePrice) => {
      setCattlePrices(prev => [price, ...prev]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('cattle_prices').insert({
              id: price.id,
              cattle_type_id: price.cattleTypeId,
              price: price.price,
              date: price.date,
              source: price.source
          });
      }
  };

  const addCustomer = async (customer: Customer) => {
      setCustomers(prev => [customer, ...prev]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('customers').insert({
              id: customer.id,
              name: customer.name,
              type: customer.type,
              phone: customer.phone,
              email: customer.email,
              address: customer.address,
              total_spent: customer.totalSpent,
              last_visit: customer.lastVisit,
              outstanding_debt: customer.outstandingDebt
          });
      }
  };

  const addUser = async (user: User) => {
      setUsers(prev => [user, ...prev]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('users').insert({
              id: user.id,
              name: user.name,
              username: user.username,
              role: user.role,
              avatar: user.avatar,
              employee_id: user.employeeId,
              outlet_id: user.outletId
          });
      }
  };

  const deleteUser = async (id: string) => {
      try {
          if (import.meta.env.VITE_SUPABASE_URL) {
              const { error } = await supabase.from('users').delete().eq('id', id);
              if (error) throw error;
          }
          setUsers(prev => prev.filter(u => u.id !== id));
      } catch (error) {
          console.error("Failed to delete user:", error);
          alert("Gagal menghapus user. Silakan coba lagi.");
      }
  };

  const checkInEmployee = async (id: string, status: 'Hadir' | 'Terlambat' | 'Absen' | 'Pulang', time: string, location?: string, ip?: string) => {
      const today = new Date().toISOString().split('T')[0];
      
      // Find employee to get outletId
      const employee = (employees || []).find(e => e.id === id);
      const outlet = employee?.outletId ? (outlets || []).find(o => o.id === employee.outletId) : null;
      
      // Use outlet specific radius or global default
      const radius = outlet?.radius || appSettings.attendanceRadius || 100;

      // If location is provided, validate distance
      if (location && outlet?.coordinates && appSettings.requireLocationForLogin) {
          const [lat, lng] = location.split(',').map(Number);
          const distance = calculateDistance(lat, lng, outlet.coordinates.lat, outlet.coordinates.lng);
          
          if (distance > radius) {
              alert(`Anda berada di luar radius kantor/gerai! Jarak terdekat: ${Math.round(distance)}m. Maksimal: ${radius}m.`);
              return; // Stop check-in
          }
      }

      setEmployees(prev => prev.map(emp => 
          emp.id === id ? { ...emp, status, checkInTime: status === 'Pulang' ? emp.checkInTime : time } : emp
      ));

      // Sync Attendance to Supabase
      if (import.meta.env.VITE_SUPABASE_URL) {
          const { data: existing } = await supabase.from('attendance')
            .select('*')
            .eq('employee_id', id)
            .eq('date', today)
            .single();

          if (existing && status === 'Pulang') {
             await supabase.from('attendance').update({
                 check_out_time: time,
                 status: status,
                 check_out_location: location
             }).eq('id', existing.id);
          } else if (!existing) {
             await supabase.from('attendance').insert({
                 employee_id: id,
                 date: today,
                 check_in_time: time,
                 status: status,
                 check_in_location: location
             });
          }
      }

      setAttendanceHistory(prev => {
          const existingRecordIndex = prev.findIndex(r => r.employeeId === id && r.date === today);
          
          if (existingRecordIndex >= 0) {
              const updated = [...prev];
              if (status === 'Pulang') {
                  const checkIn = updated[existingRecordIndex].checkInTime;
                  // Calculate hours
                  const start = new Date(`${today}T${checkIn}`);
                  const end = new Date(`${today}T${time}`);
                  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
                  
                  updated[existingRecordIndex] = {
                      ...updated[existingRecordIndex],
                      checkOutTime: time,
                      totalHours: parseFloat(diff.toFixed(2)),
                      checkOutLocation: location,
                      checkOutIp: ip
                  };
              } else {
                  updated[existingRecordIndex] = {
                      ...updated[existingRecordIndex],
                      status,
                      checkInLocation: location,
                      checkInIp: ip
                  };
              }
              return updated;
          } else {
              if (status === 'Pulang') return prev;
              
              return [{
                  id: `att-${Date.now()}`,
                  employeeId: id,
                  date: today,
                  checkInTime: time,
                  status,
                  totalHours: 0,
                  checkInLocation: location,
                  checkInIp: ip
              }, ...prev];
          }
      });
  };

  const addCattleType = async (type: CattleType) => {
      setCattleTypes(prev => [...prev, type]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('cattle_types').insert({
              id: type.id,
              name: type.name,
              default_live_price: type.defaultLivePrice,
              default_carcass_pct: type.defaultCarcassPct
          });
      }
  };

  const deleteCattleType = async (id: string) => {
      setCattleTypes(prev => prev.filter(t => t.id !== id));
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('cattle_types').delete().eq('id', id);
      }
  };

  const updateAppSettings = async (settings: Partial<AppSettings>) => {
      setAppSettings(prev => ({ ...prev, ...settings }));
      if (import.meta.env.VITE_SUPABASE_URL) {
          const { data } = await supabase.from('settings').select('id').limit(1);
          const payload: Record<string, unknown> = {};
          if (settings.companyName !== undefined) payload.company_name = settings.companyName;
          if (settings.logoUrl !== undefined) payload.logo_url = settings.logoUrl;
          if (settings.heroImageUrl !== undefined) payload.hero_image_url = settings.heroImageUrl;
          if (settings.maintenanceMode !== undefined) payload.maintenance_mode = settings.maintenanceMode;
          if (settings.allowNegativeStock !== undefined) payload.allow_negative_stock = settings.allowNegativeStock;
          if (settings.requireLocationForLogin !== undefined) payload.require_location_for_login = settings.requireLocationForLogin;
          if (settings.attendanceRadius !== undefined) payload.attendance_radius = settings.attendanceRadius;
          if (settings.maxDiscountPercentage !== undefined) payload.max_discount_percentage = settings.maxDiscountPercentage;
          if (settings.enableDebtPayment !== undefined) payload.enable_debt_payment = settings.enableDebtPayment;
          if (settings.galleryImages !== undefined) payload.gallery_images = settings.galleryImages;

          if (data && data.length > 0) {
              await supabase.from('settings').update(payload).eq('id', data[0].id);
          } else {
              await supabase.from('settings').insert(payload);
          }
      }
  };

  // Derive Receivables from Transactions (for persistence across sessions)
  const derivedReceivables = React.useMemo(() => {
    if (transactions.length === 0) return [];
    
    return transactions
      .filter(t => t.paymentMethod === 'Piutang' && t.status === 'Pending' && t.dueDate)
      .map(t => {
          const paidAmount = debtPayments
              .filter(dp => dp.receivableId === `rec-${t.id}`)
              .reduce((sum, dp) => sum + dp.amount, 0);
          
          const initialDebt = t.total - (t.downPayment || 0);
          const remainingDebt = Math.max(0, initialDebt - paidAmount);

          return {
              id: `rec-${t.id}`,
              invoiceId: t.id,
              customerName: t.customerName,
              customerId: t.customerId,
              amount: remainingDebt,
              dueDate: t.dueDate!,
              status: remainingDebt <= 0 ? 'Lunas' : 'Belum Lunas',
              phone: '',
              outletId: t.outletId
          };
      });
  }, [transactions, debtPayments]);

  // Sync state with derived values if needed (for components that rely on state)
  useEffect(() => {
    if (derivedReceivables.length > 0) {
        setReceivables(derivedReceivables);
    }
  }, [derivedReceivables, setReceivables]);

  const updatePrinterConfig = (config: Partial<PrinterConfig>) => {
      setPrinterConfig(prev => ({ ...prev, ...config }));
  };

  const addGalleryItem = async (item: GalleryItem) => {
    setGalleryItems(prev => [item, ...prev]);
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('gallery_items').insert({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            image_url: item.imageUrl,
            content: item.content,
            date: item.date,
            category: item.category
        });
    }
  };

  const updateGalleryItem = async (item: GalleryItem) => {
    setGalleryItems(prev => prev.map(i => i.id === item.id ? item : i));
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('gallery_items').update({
            title: item.title,
            subtitle: item.subtitle,
            image_url: item.imageUrl,
            content: item.content,
            date: item.date,
            category: item.category
        }).eq('id', item.id);
    }
  };

  const deleteGalleryItem = async (id: string) => {
    setGalleryItems(prev => prev.filter(i => i.id !== id));
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('gallery_items').delete().eq('id', id);
    }
  };

  const addEmployee = async (employee: Employee) => {
      setEmployees(prev => [employee, ...prev]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('employees').insert({
              id: employee.id,
              name: employee.name,
              division: employee.division,
              position: employee.position,
              status: employee.status,
              check_in_time: employee.checkInTime,
              check_out_time: employee.checkOutTime,
              base_salary: employee.baseSalary,
              hourly_rate: employee.hourlyRate,
              is_warehouse_pic: employee.isWarehousePIC,
              phone: employee.phone,
              outlet_id: employee.outletId,
              device_ip: employee.deviceIp
          });
      }
  };

  const updateEmployee = async (employee: Employee) => {
      setEmployees(prev => prev.map(e => e.id === employee.id ? employee : e));
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('employees').update({
              name: employee.name,
              division: employee.division,
              position: employee.position,
              status: employee.status,
              check_in_time: employee.checkInTime,
              check_out_time: employee.checkOutTime,
              base_salary: employee.baseSalary,
              hourly_rate: employee.hourlyRate,
              is_warehouse_pic: employee.isWarehousePIC,
              phone: employee.phone,
              outlet_id: employee.outletId,
              device_ip: employee.deviceIp
          }).eq('id', employee.id);
      }
  };

  const deleteEmployee = async (id: string) => {
      setEmployees(prev => prev.filter(e => e.id !== id));
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('employees').delete().eq('id', id);
      }
  };

  const initializeMeatProducts = async () => {
      const meatProducts = [
          { name: 'Daging', price: 140000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Daging HAS', price: 160000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'BR Babat Rawon', price: 35000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Babat', price: 35000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Tulang', price: 40000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Tulang Merah', price: 60000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Iga', price: 80000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Kepala', price: 35000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Limpa / Hati', price: 60000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Daging SOP', price: 100000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Daging Sengkel', price: 130000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Daging Kepala', price: 100000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Paru', price: 70000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Urat Dengkul', price: 75000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Dengkul', price: 100000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Bersihan', price: 60000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Buntut', price: 95000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Kulit', price: 15000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Babat Usus', price: 35000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Jantung', price: 90000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Kaki', price: 35000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Tetelan', price: 60000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Gajih Tipis', price: 35000, category: ProductCategory.MEAT, unit: 'Kg' },
          { name: 'Gajih Lamur', price: 35000, category: ProductCategory.MEAT, unit: 'Kg' },
      ];

      for (const item of meatProducts) {
          const existingProduct = products.find(p => p.name === item.name);
          if (existingProduct) {
              // Update existing product price
              await updateProduct({
                  ...existingProduct,
                  price: item.price,
                  costPrice: item.price * 0.8
              });
          } else {
              // Add new product
              const newProduct: Product = {
                  id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: item.name,
                  price: item.price,
                  category: item.category,
                  unit: item.unit,
                  stock: 0,
                  minStock: 5,
                  description: `Potongan daging ${item.name}`,
                  image: '',
                  costPrice: item.price * 0.8,
                  outletId: outlets[0]?.id || 'main'
              };
              await addProduct(newProduct);
          }
      }
  };

  const initializeEmployees = async () => {
      // Ensure outlets exist
      const requiredOutlets = [
          { id: 'o5', name: 'Kantor Pusat', address: 'Kantor Pusat', phone: '', manager: 'Admin' },
          { id: 'o6', name: 'RPH Subaru', address: 'RPH Subaru', phone: '', manager: 'Admin' },
          { id: 'o7', name: 'Umum', address: 'Umum', phone: '', manager: 'Admin' },
          { id: 'o1', name: 'Pasar Tamin', address: 'Pasar Tamin', phone: '', manager: 'Admin' },
          { id: 'o2', name: 'Pasar Way Halim', address: 'Pasar Way Halim', phone: '', manager: 'Admin' },
          { id: 'o3', name: 'Pasar Tugu', address: 'Pasar Tugu', phone: '', manager: 'Admin' },
      ];

      for (const outlet of requiredOutlets) {
          const existingOutlet = outlets.find(o => o.id === outlet.id);
          if (!existingOutlet) {
              await addOutlet(outlet);
          } else {
              await updateOutlet({ ...existingOutlet, ...outlet });
          }
      }

      // Sync divisions to Supabase if configured
      if (isSupabaseConfigured) {
          try {
              for (const div of divisions) {
                  const { error } = await supabase
                      .from('divisions')
                      .upsert({ name: div }, { onConflict: 'name' });
                  if (error) console.error('Error syncing division:', error);
              }
          } catch (err) {
              console.error('Supabase division sync failed:', err);
          }
      }

      const employeeData = [
          // DIVISI KANTOR PUSAT
          { name: 'TAMPAN SUJARWADI', phone: '+6282183118377', position: 'DIREKTUR UTAMA', division: 'DIVISI KANTOR PUSAT', outletId: 'o5' },
          { name: 'DIAN EKA ARLIANTO, S.IP', phone: '+6281369612006', position: 'MANAGER OPERASIONAL', division: 'DIVISI KANTOR PUSAT', outletId: 'o5' },
          { name: 'EKO', phone: '+62811111111', position: 'KONSULTAN', division: 'DIVISI KANTOR PUSAT', outletId: 'o5' },
          { name: 'M. AZMI GHULAM DZAKY', phone: '+62811111111', position: 'DIREKTUR', division: 'DIVISI KANTOR PUSAT', outletId: 'o5' },
          { name: 'EKI', phone: '+6289649005383', position: 'MANAGER KEUANGAN', division: 'DIVISI KANTOR PUSAT', outletId: 'o5' },
          { name: 'DESI HERMALA.', phone: '+6281366577909', position: 'ADMIN RPH', division: 'DIVISI KANTOR PUSAT', outletId: 'o5' },
          { name: 'RUDI YANTO', phone: '+6285166599976', position: 'OFFICER', division: 'DIVISI KANTOR PUSAT', outletId: 'o5' },
          { name: 'NILAM CAHYA RAMADANI', phone: '+6282294439224', position: 'ADMIN KEUANGAN', division: 'DIVISI KANTOR PUSAT', outletId: 'o5' },
          { name: 'FAFA', phone: '+6281373132418', position: 'ADMIN KEUANGAN', division: 'DIVISI KANTOR PUSAT', outletId: 'o5' },

          // DIVISI RPH SUBARU
          { name: 'MANG DODO', phone: '+62895323107782', position: 'KOORDINATOR', division: 'DIVISI RPH SUBARU', outletId: 'o6' },
          { name: 'MUKSIN', phone: '+6285789014800', position: 'STAF', division: 'DIVISI RPH SUBARU', outletId: 'o6' },
          { name: 'MAMAT', phone: '+6281367936440', position: 'STAF', division: 'DIVISI RPH SUBARU', outletId: 'o6' },
          { name: 'H. EDI SURYADI', phone: '+6281221306066', position: 'STAF JULEHA', division: 'DIVISI RPH SUBARU', outletId: 'o6' },
          { name: 'SIS', phone: '+62895705115915', position: 'STAF', division: 'DIVISI RPH SUBARU', outletId: 'o6' },
          { name: 'SETO', phone: '+62895644268577', position: 'STAF', division: 'DIVISI RPH SUBARU', outletId: 'o6' },
          { name: 'BAMBANG', phone: '+62811111111', position: 'STAF', division: 'DIVISI RPH SUBARU', outletId: 'o6' },
          { name: 'MANG SOLEH B', phone: '+6285366937691', position: 'STAF', division: 'DIVISI RPH SUBARU', outletId: 'o6' },
          { name: 'M. NASIR', phone: '+6282185161676', position: 'STAF', division: 'DIVISI RPH SUBARU', outletId: 'o6' },
          { name: 'MANG NAS', phone: '+62811111111', position: 'STAF', division: 'DIVISI RPH SUBARU', outletId: 'o6' },

          // DIVISI UMUM
          { name: 'ROBIANSYAH/ REBIN', phone: '+6283146481450', position: 'STAF', division: 'DIVISI UMUM', outletId: 'o7' },
          { name: 'SADIMAN / SADIMONG', phone: '+62811111111', position: 'STAF', division: 'DIVISI UMUM', outletId: 'o7' },
          { name: 'KIYAI MANJA / ALPIAN', phone: '+6289602340234', position: 'STAF', division: 'DIVISI UMUM', outletId: 'o7' },
          { name: 'HADIMAN / DIMAN', phone: '+62811111111', position: 'STAF', division: 'DIVISI UMUM', outletId: 'o7' },

          // DIVISI SUBARU PASAR TAMIN
          { name: 'MANG SOLEH', phone: '+6285764244933', position: 'STAF', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },
          { name: 'IKHSAN', phone: '+6285382213341', position: 'STAF', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },
          { name: 'RAYHAN', phone: '+628975369231', position: 'STAF', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },
          { name: 'ANDA', phone: '+62895620474051', position: 'STAF', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },
          { name: 'REZA', phone: '+62811111111', position: 'STAF', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },
          { name: 'TUM', phone: '+62811111111', position: 'STAF', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },
          { name: 'ARIS GIANTO', phone: '+6289652939311', position: 'PIC', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },
          { name: 'SUKRON', phone: '+62811111111', position: 'STAF', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },
          { name: 'AMIN', phone: '+62895403397525', position: 'STAF', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },
          { name: 'FAUZAN', phone: '+62811111111', position: 'STAF', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },
          { name: 'PIAN', phone: '+62811111111', position: 'STAF', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },
          { name: 'BAIN', phone: '+62811111111', position: 'STAF', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },
          { name: 'TAUFIK', phone: '+628986658363', position: 'STAF', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },
          { name: 'ENDANG', phone: '+6289528885448', position: 'STAF', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },
          { name: 'FAHMI', phone: '+62811111111', position: 'STAF', division: 'DIVISI SUBARU PASAR TAMIN', outletId: 'o1' },

          // DIVISI SUBARU PASAR WAY HALIM
          { name: 'M. NAUFAL AL FARUQ', phone: '+6289632544456', position: 'PIC', division: 'DIVISI SUBARU PASAR WAY HALIM', outletId: 'o2' },
          { name: 'SUHAERLI/MANG LILI', phone: '+628980563652', position: 'STAF', division: 'DIVISI SUBARU PASAR WAY HALIM', outletId: 'o2' },
          { name: 'DEDY HARYANTO', phone: '+62811111111', position: 'STAF', division: 'DIVISI SUBARU PASAR WAY HALIM', outletId: 'o2' },
          { name: 'DAUD', phone: '+62811111111', position: 'STAF', division: 'DIVISI SUBARU PASAR WAY HALIM', outletId: 'o2' },

          // DIVISI SUBARU PASAR TUGU
          { name: 'HERI', phone: '+6289514077980', position: 'SALESMAN', division: 'DIVISI SUBARU PASAR TUGU', outletId: 'o3' },
          { name: 'AL IMRON', phone: '+6285381132000', position: 'PIC/SALESMAN', division: 'DIVISI SUBARU PASAR TUGU', outletId: 'o3' },
          { name: 'ANJAR', phone: '+6289510280473', position: 'STAF', division: 'DIVISI SUBARU PASAR TUGU', outletId: 'o3' },
          { name: 'EMI', phone: '+6283152792686', position: 'STAF', division: 'DIVISI SUBARU PASAR TUGU', outletId: 'o3' },
          { name: 'ROHMAN', phone: '+628978692422', position: 'STAF', division: 'DIVISI SUBARU PASAR TUGU', outletId: 'o3' },
          { name: 'DANI', phone: '+6281379681346', position: 'STAF', division: 'DIVISI SUBARU PASAR TUGU', outletId: 'o3' },
      ];

      for (const item of employeeData) {
          const existingEmployee = employees.find(e => e.name === item.name);
          if (existingEmployee) {
              // Update existing employee
              await updateEmployee({
                  ...existingEmployee,
                  phone: item.phone,
                  position: item.position,
                  division: item.division,
                  outletId: item.outletId
              });
          } else {
              // Add new employee
              const newEmployee: Employee = {
                  id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: item.name,
                  phone: item.phone,
                  position: item.position,
                  division: item.division,
                  outletId: item.outletId,
                  status: 'Absen',
                  checkInTime: '',
                  checkOutTime: '',
                  baseSalary: 0,
                  hourlyRate: 0,
                  deviceIp: ''
              };
              await addEmployee(newEmployee);
          }
      }
  };

  const addLoyaltyProgram = async (program: LoyaltyProgram) => {
    setLoyaltyPrograms(prev => [program, ...prev]);
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('loyalty_programs').insert({
            id: program.id,
            title: program.title,
            description: program.description,
            target_kg: program.targetKg,
            duration_months: program.durationMonths,
            reward: program.reward,
            is_active: program.isActive
        });
    }
  };

  const updateLoyaltyProgram = async (program: LoyaltyProgram) => {
    setLoyaltyPrograms(prev => prev.map(p => p.id === program.id ? program : p));
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('loyalty_programs').update({
            title: program.title,
            description: program.description,
            target_kg: program.targetKg,
            duration_months: program.durationMonths,
            reward: program.reward,
            is_active: program.isActive
        }).eq('id', program.id);
    }
  };

  const deleteLoyaltyProgram = async (id: string) => {
    setLoyaltyPrograms(prev => prev.filter(p => p.id !== id));
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('loyalty_programs').delete().eq('id', id);
    }
  };

  const addCommission = async (commission: Commission) => {
    setCommissions(prev => [commission, ...prev]);
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('commissions').insert({
            id: commission.id,
            referrer_id: commission.referrerId,
            referred_user_id: commission.referredUserId,
            transaction_id: commission.transactionId,
            amount: commission.amount,
            percentage: commission.percentage,
            status: commission.status
        });
        
        // Update referrer's total earnings
        const { data: userData } = await supabase.from('users').select('total_earnings').eq('id', commission.referrerId).single();
        if (userData) {
            const newTotal = (userData.total_earnings || 0) + commission.amount;
            await supabase.from('users').update({ total_earnings: newTotal }).eq('id', commission.referrerId);
        }
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);

    // --- AUTOMATIC STOCK REDUCTION ---
    if (transaction.items && transaction.items.length > 0) {
        updateProductStock(transaction.items as CartItem[]);
    }

    // --- REFERRAL COMMISSION LOGIC ---
    // If transaction is from a customer who was referred, calculate commission
    if (transaction.customerId) {
        const referredUser = users.find(u => u.id === transaction.customerId);
        if (referredUser && referredUser.referrerId) {
            const commissionPct = 2.5; // Default 2.5% commission
            const commissionAmount = (transaction.total * commissionPct) / 100;
            
            const newCommission: Commission = {
                id: `comm-${Date.now()}`,
                referrerId: referredUser.referrerId,
                referredUserId: referredUser.id,
                transactionId: transaction.id,
                amount: commissionAmount,
                percentage: commissionPct,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            addCommission(newCommission);
            
            // Notify referrer
            addNotification({
                id: `n-comm-${Date.now()}`,
                title: 'Komisi Baru!',
                message: `Anda mendapatkan komisi Rp ${commissionAmount.toLocaleString()} dari transaksi ${referredUser.name}`,
                type: 'success',
                date: 'Baru saja',
                read: false,
                targetRoles: [Role.SALES, Role.ADMIN, Role.MANAGER] // Or specific user ID if we had that
            });
        }
    }

    // Sync to Supabase with Offline Support
    if (import.meta.env.VITE_SUPABASE_URL) {
        const payload = {
            id: transaction.id,
            date: transaction.date,
            total: transaction.total,
            payment_method: transaction.paymentMethod,
            status: transaction.status,
            customer_name: transaction.customerName,
            customer_id: transaction.customerId,
            items: transaction.items,
            outlet_id: transaction.outletId,
            shipping_cost: transaction.shippingCost,
            is_delivery: transaction.isDelivery,
            due_date: transaction.dueDate,
            down_payment: transaction.downPayment,
            bank_name: transaction.bankName,
            bank_ref: transaction.bankRef
        };

        if (navigator.onLine) {
            const { error } = await supabase.from('transactions').insert(payload);
            if (error) {
                console.error('Supabase insert failed, adding to offline queue', error);
                const queue = JSON.parse(localStorage.getItem('offline_transaction_queue') || '[]');
                queue.push(transaction);
                localStorage.setItem('offline_transaction_queue', JSON.stringify(queue));
            }
        } else {
            console.warn('Offline: Adding transaction to queue');
            const queue = JSON.parse(localStorage.getItem('offline_transaction_queue') || '[]');
            queue.push(transaction);
            localStorage.setItem('offline_transaction_queue', JSON.stringify(queue));
        }
    }

    // Integrate with Finance (Receivables) if Payment Method is 'Piutang'
    if (transaction.paymentMethod === 'Piutang' && transaction.dueDate) {
        // Calculate Debt Amount (Total - Down Payment)
        const dp = transaction.downPayment || 0;
        const debtAmount = transaction.total - dp;

        if (debtAmount > 0) {
            const newReceivable: Receivable = {
                id: `rec-${transaction.id}`,
                invoiceId: transaction.id,
                customerName: transaction.customerName,
                customerId: transaction.customerId, // Added customerId
                amount: debtAmount, // Correctly store only remaining debt
                dueDate: transaction.dueDate,
                status: 'Belum Lunas',
                phone: '', // Ideally fetched from Customer database
                outletId: transaction.outletId // Added outletId
            };
            setReceivables(prev => [newReceivable, ...prev]);
            
            // Add Notification for Managers/Admin
            addNotification({
                id: `n-${generateTimestampId()}`,
                title: 'Piutang Baru Dicatat',
                message: `Invoice ${transaction.id} utk ${transaction.customerName}. DP: Rp ${dp.toLocaleString()} Sisa: Rp ${debtAmount.toLocaleString()}`,
                type: 'alert',
                date: 'Baru saja',
                read: false,
                targetRoles: [Role.MANAGER, Role.ADMIN, Role.DEBT_COLLECTOR]
            });
        }
    }
  };

  const payReceivable = async (id: string, amountPaid: number, collectorId?: string) => {
      let isFullyPaid = false;
      let invoiceId = '';

      setReceivables(prev => prev.map(rec => {
          if (rec.id === id) {
              const newAmount = rec.amount - amountPaid;
              if (newAmount <= 0) {
                  isFullyPaid = true;
                  invoiceId = rec.invoiceId;
              }
              return {
                  ...rec,
                  amount: Math.max(0, newAmount),
                  status: newAmount <= 0 ? 'Lunas' : rec.status
              };
          }
          return rec;
      }));

      // Record Payment
      const payment: DebtPayment = {
          id: `pay-${Date.now()}`,
          receivableId: id,
          amount: amountPaid,
          date: new Date().toISOString().split('T')[0],
          collectorId
      };
      setDebtPayments(prev => [payment, ...prev]);

      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('debt_payments').insert({
              id: payment.id,
              receivable_id: payment.receivableId,
              amount: payment.amount,
              date: payment.date,
              collector_id: payment.collectorId
          });
      }

      // Sync Status to Supabase
      if (isFullyPaid && invoiceId && import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('transactions').update({ status: 'Selesai' }).eq('id', invoiceId);
      }
  };

  const transferStock = async (productId: string, quantity: number, toOutlet: string) => {
      // 1. Update Stock Logic
      setProducts(prev => prev.map(p => {
          if (p.id === productId) {
              const newStock = Math.max(0, p.stock - quantity);
              return { ...p, stock: newStock };
          }
          return p;
      }));

      // Sync to Supabase
      if (import.meta.env.VITE_SUPABASE_URL) {
          const product = products.find(p => p.id === productId);
          if (product) {
              const newStock = Math.max(0, product.stock - quantity);
              await supabase.from('products').update({ stock: newStock }).eq('id', productId);
          }
      }

      // 2. Log Notification / Activity
      const productName = products.find(p => p.id === productId)?.name || 'Produk';
      addNotification({
          id: `trf-${generateTimestampId()}`,
          title: 'Transfer Stok Berhasil',
          message: `Transfer ${quantity} unit ${productName} ke ${toOutlet} berhasil.`,
          type: 'success',
          date: 'Baru saja',
          read: false,
          targetRoles: [Role.MANAGER, Role.ADMIN, Role.CASHIER]
      });
  };

  const addExpense = async (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('expenses').insert({
            id: expense.id,
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
            division: expense.division,
            receipt_image: expense.proofImage,
            outlet_id: expense.outletId
        });
    }
  };

  const addEmployeeFinancial = async (record: EmployeeFinancial) => {
    setEmployeeFinancials(prev => [record, ...prev]);
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('employee_financials').insert({
            id: record.id,
            employee_id: record.employeeId,
            type: record.type,
            amount: record.amount,
            date: record.date,
            description: record.description,
            status: record.status,
            approved_by: record.approvedBy
        });
    }
  }

  const addCattleOrder = async (order: CattleOrder) => {
    setCattleOrders(prev => [order, ...prev]);
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('cattle_orders').insert({
            id: order.id,
            supplier_id: order.supplierId,
            order_date: order.orderDate,
            expected_arrival: order.expectedArrival,
            status: order.status,
            total_amount: order.totalAmount,
            items: order.items,
            notes: order.notes
        });
    }
  }

  const updateCattleOrder = async (order: CattleOrder) => {
    setCattleOrders(prev => prev.map(o => o.id === order.id ? order : o));
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('cattle_orders').update({
            supplier_id: order.supplierId,
            order_date: order.orderDate,
            expected_arrival: order.expectedArrival,
            status: order.status,
            total_amount: order.totalAmount,
            items: order.items,
            notes: order.notes
        }).eq('id', order.id);
    }
  }

  const deleteCattleOrder = async (id: string) => {
    setCattleOrders(prev => prev.filter(o => o.id !== id));
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('cattle_orders').delete().eq('id', id);
    }
  }

  const addOutlet = async (outlet: Outlet) => {
    setOutlets(prev => [...prev, outlet]);
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('outlets').insert({
            id: outlet.id,
            name: outlet.name,
            address: outlet.address,
            phone: outlet.phone,
            coordinates: outlet.coordinates,
            radius: outlet.radius
        });
    }
  }

  const updateOutlet = async (outlet: Outlet) => {
    setOutlets(prev => prev.map(o => o.id === outlet.id ? outlet : o));
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('outlets').update({
            name: outlet.name,
            address: outlet.address,
            phone: outlet.phone,
            coordinates: outlet.coordinates,
            radius: outlet.radius
        }).eq('id', outlet.id);
    }
  }

  const deleteOutlet = async (id: string) => {
    const outlet = outlets.find(o => o.id === id);
    if (outlet?.isStatic) return;
    setOutlets(prev => prev.filter(o => o.id !== id));
    if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.from('outlets').delete().eq('id', id);
    }
  }

  const updateRolePermissions = async (permissions: RolePermissions[]) => {
      setAppSettings(prev => ({ ...prev, rolePermissions: permissions }));
      if (import.meta.env.VITE_SUPABASE_URL) {
          // Assuming settings table has a single row for app config
          // First get the ID of the settings row
           const { data: settingsData } = await supabase.from('settings').select('id').limit(1);
           if (settingsData && settingsData.length > 0) {
               await supabase.from('settings').update({
                   role_permissions: permissions
               }).eq('id', settingsData[0].id);
           } else {
               // Create if not exists (should exist from init)
               await supabase.from('settings').insert({
                   role_permissions: permissions
               });
           }
      }
  };

  const addNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
  }

  const addVisitRecord = async (record: VisitRecord) => {
      setVisitRecords(prev => [record, ...prev]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('visit_records').insert({
              id: record.id,
              customer_id: record.customerId,
              user_id: record.userId,
              date: record.date,
              notes: record.notes,
              location: record.location,
              outcome: record.outcome
          });
      }
  }

  const addLead = async (lead: Lead) => {
      setLeads(prev => [lead, ...prev]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('leads').insert({
              id: lead.id,
              name: lead.name,
              phone: lead.phone,
              email: lead.email,
              source: lead.source,
              status: lead.status,
              notes: lead.notes,
              created_at: lead.createdAt
          });
      }
  }

  const addSystemLog = async (log: SystemLog) => {
      setSystemLogs(prev => [log, ...prev]);
      if (import.meta.env.VITE_SUPABASE_URL) {
          await supabase.from('system_logs').insert({
              id: log.id,
              timestamp: log.timestamp,
              user_id: log.userId,
              user_name: log.userName,
              action: log.action,
              details: log.details,
              role: log.role,
              ip: log.ip,
              location: log.location,
              device: log.device
          });
      }
  }

  const markNotificationRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  const updateProductStock = async (items: CartItem[]) => {
    setProducts(prevProducts => 
      prevProducts.map(prod => {
        const cartItem = items.find(item => item.id === prod.id);
        if (cartItem) {
          const newStock = Math.max(0, prod.stock - cartItem.qty);
          if (newStock < prod.minStock) {
              addNotification({
                  id: `stock-${prod.id}-${Date.now()}`,
                  title: 'Peringatan Stok',
                  message: `Stok ${prod.name} menipis (${newStock} ${prod.unit})`,
                  type: 'warning',
                  date: 'Baru saja',
                  read: false,
                  targetRoles: [Role.CASHIER, Role.MANAGER, Role.ADMIN]
              });
          }
          return { ...prod, stock: newStock };
        }
        return prod;
      })
    );

    // Sync Stock to Supabase
    if (import.meta.env.VITE_SUPABASE_URL) {
        for (const item of items) {
             const product = (products || []).find(p => p.id === item.id);
             if (product) {
                 const newStock = Math.max(0, product.stock - item.qty);
                 await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
             }
        }
    }
  };

  return (
    <StoreContext.Provider value={{ 
        products, 
        transactions, 
        receivables, 
        debtPayments,
        expenses,
        employees,
        employeeFinancials,
        cattleOrders,
        outlets,
        notifications,
        visitRecords,
        leads,
        systemLogs,
        cattlePrices,
        cattleTypes,
        appSettings,
        printerConfig,
        searchQuery,
        customers,
        users,
        commissions,
        setProducts,
        setEmployees, 
        addEmployee,
        updateEmployee,
        deleteEmployee,
        setCustomers,
        setUsers,
        setCommissions,
        addTransaction, 
        addExpense,
        addEmployeeFinancial,
        addCattleOrder,
        updateCattleOrder,
        deleteCattleOrder,
        addOutlet,
        updateOutlet,
        deleteOutlet,
        updateRolePermissions,
        addNotification,
        addVisitRecord,
        addLead,
        addSystemLog,
        addCattlePrice,
        addCattleType,
        deleteCattleType,
        addCustomer,
        addUser,
        deleteUser,
        checkInEmployee,
        updateAppSettings,
        updatePrinterConfig,
        markNotificationRead,
        updateProductStock,
        transferStock,
        setSearchQuery,
        payReceivable,
        deliveries,
        vehicles,
        courierLocations,
        addDelivery,
        updateDelivery,
        updateCourierLocation,
        addVehicle,
        marketNotes,
        addMarketNote,
        deleteMarketNote,
        pricePoints,
        addPricePoint,
        marketSurveys,
        addMarketSurvey,
        weighingLogs,
        addWeighingLog,
        attendanceHistory,
        suppliers,
        setSuppliers,
        divisions,
        setDivisions,
        collectionTarget,
        setCollectionTarget,
        addProduct,
        updateProduct,
        deleteProduct,
        initializeMeatProducts,
        initializeEmployees,
        approveUser,
        customerMode,
        setCustomerMode,
        assets,
        addAsset,
        updateAsset,
        deleteAsset,
        privateTransactions,
        addPrivateTransaction,
        deletePrivateTransaction,
        navigationParams,
        setNavigationParams,
        galleryItems,
        loyaltyPrograms,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        addLoyaltyProgram,
        updateLoyaltyProgram,
        deleteLoyaltyProgram,
        isLoading,
        confirm
    }}>
      {children}
      {confirmOptions && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[#1e1e1e] border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white">{confirmOptions.title}</h3>
              <p className="mt-2 text-gray-400 leading-relaxed">{confirmOptions.message}</p>
            </div>
            <div className="flex border-t border-white/5">
              <button
                onClick={() => setConfirmOptions(null)}
                className="flex-1 px-6 py-4 text-sm font-semibold text-gray-500 transition-colors hover:bg-white/5 active:bg-white/10"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  confirmOptions.onConfirm();
                  setConfirmOptions(null);
                }}
                className="flex-1 bg-brand-red px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-red-700 active:bg-red-800"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </StoreContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};