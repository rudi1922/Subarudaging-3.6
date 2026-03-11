import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { Product, Transaction, Receivable, CartItem, Expense, EmployeeFinancial, Employee, CattleOrder, Outlet, Notification, Role, VisitRecord, Lead, SystemLog, CattlePrice, AppSettings, PrinterConfig, PrinterType, PrinterConnection, Customer, User, Delivery, Vehicle, MarketNote, PricePoint, MarketSurvey, WeighingLog, AttendanceRecord, Supplier, DebtPayment, CattleType, RolePermissions, GalleryItem, LoyaltyProgram, Commission } from './types';

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
  marketNotes: MarketNote[];
  pricePoints: PricePoint[];
  marketSurveys: MarketSurvey[];
  weighingLogs: WeighingLog[];
  attendanceHistory: AttendanceRecord[];
  suppliers: Supplier[];
  commissions: Commission[];
  collectionTarget: number;
  navigationParams: { view?: string; tab?: string; action?: string; params?: Record<string, unknown> } | null;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
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
  addVehicle: (vehicle: Vehicle) => void;
  addMarketNote: (note: MarketNote) => void;
  deleteMarketNote: (id: string) => void;
  addPricePoint: (point: PricePoint) => void;
  addMarketSurvey: (survey: MarketSurvey) => void;
  addWeighingLog: (log: WeighingLog) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  approveUser: (id: string) => Promise<void>;
  customerMode: boolean;
  setCustomerMode: (mode: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const generateTimestampId = () => Date.now().toString();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [debtPayments, setDebtPayments] = useState<DebtPayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeFinancials, setEmployeeFinancials] = useState<EmployeeFinancial[]>([]);
  const [cattleOrders, setCattleOrders] = useState<CattleOrder[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visitRecords, setVisitRecords] = useState<VisitRecord[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [cattlePrices, setCattlePrices] = useState<CattlePrice[]>([]);
  const [cattleTypes, setCattleTypes] = useState<CattleType[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([]);
  const [navigationParams, setNavigationParams] = useState<{ view?: string; tab?: string; action?: string; params?: Record<string, unknown> } | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [marketNotes, setMarketNotes] = useState<MarketNote[]>([]);
  const [pricePoints, setPricePoints] = useState<PricePoint[]>([]);
  const [marketSurveys, setMarketSurveys] = useState<MarketSurvey[]>([]);
  const [weighingLogs, setWeighingLogs] = useState<WeighingLog[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [collectionTarget, setCollectionTarget] = useState<number>(10000000); // Default 10jt
  const [customerMode, setCustomerMode] = useState<boolean>(false);

  const [appSettings, setAppSettings] = useState<AppSettings>({
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
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>({
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
        if (!isSupabaseConfigured || isFetchingRef.current) return;
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
            fetchTable<User>('users', setUsers, (data) => data.map((u) => ({
                ...u as unknown as User,
                employeeId: u.employee_id as string,
                outletId: u.outlet_id as string
            }))),
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
            supabase.removeChannel(commissionSubscription);
        };
    }
  }, []);

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
              notes: delivery.notes
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
              notes: delivery.notes
          }).eq('id', delivery.id);
      }
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
  }, [derivedReceivables]);

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
        addDelivery,
        updateDelivery,
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
        collectionTarget,
        setCollectionTarget,
        addProduct,
        updateProduct,
        deleteProduct,
        approveUser,
        customerMode,
        setCustomerMode,
        navigationParams,
        setNavigationParams,
        galleryItems,
        loyaltyPrograms,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        addLoyaltyProgram,
        updateLoyaltyProgram,
        deleteLoyaltyProgram
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};