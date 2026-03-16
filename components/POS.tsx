import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Search, ShoppingCart, Trash2, CreditCard, Banknote, QrCode, Minus, Plus, X as XIcon, ArrowRight, Printer, Tag, Percent, CalendarClock, Download, Smartphone, Users, Bluetooth, AlertTriangle, BadgeDollarSign, Wallet, CheckCircle2, Truck } from 'lucide-react';
import { CartItem, Product, ProductCategory, User as UserType, Receivable, PrinterConnection, Customer } from '../types';
import { useStore } from '../StoreContext';
import { jsPDF } from "jspdf";
import { PrinterService } from '../utils/printer';
import Distribution from './Distribution';

interface POSProps {
    user: UserType;
}

const generateTransactionId = () => `INV-${Math.floor(1000 + Math.random() * 9000)}`;

const POS: React.FC<POSProps> = ({ user }) => {
  const { products, addTransaction, outlets, receivables, payReceivable, printerConfig, customers, addSystemLog, showToast } = useStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  // ... existing state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [selectedPayment, setSelectedPayment] = useState<'Tunai' | 'QRIS' | 'Debit' | 'Piutang' | 'E-Wallet'>('Tunai');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modals for Payments
  const [showReceipt, setShowReceipt] = useState(false);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [showDebitModal, setShowDebitModal] = useState(false);
  const [showEWalletModal, setShowEWalletModal] = useState(false);
  
  const [lastTransactionId, setLastTransactionId] = useState<string>('');
  
  // Debit State
  const [debitBank, setDebitBank] = useState('BCA');
  const [debitRef, setDebitRef] = useState('');

  // E-Wallet State
  const [eWalletProvider, setEWalletProvider] = useState<'Gopay' | 'OVO' | 'Dana' | 'ShopeePay'>('Gopay');
  const [eWalletPhone, setEWalletPhone] = useState('');

  // New Customer & Discount State
  const [customerName, setCustomerName] = useState('Umum');
  const [customerId, setCustomerId] = useState<string>(''); // Added customerId state
  const [customerType, setCustomerType] = useState<'Umum' | 'Tetap'>('Umum');
  const [customerPhone, setCustomerPhone] = useState(''); 
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  
  // Delivery State
  const [isDelivery, setIsDelivery] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  
  // Piutang (Receivables) & DP State
  const [dueDate, setDueDate] = useState('');
  const [downPayment, setDownPayment] = useState<number>(0);
  
  // Customer Search & Debt Warning State
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showDebtWarning, setShowDebtWarning] = useState(false);
  const [customerDebts, setCustomerDebts] = useState<Receivable[]>([]);
  const [currentCustomerTotalDebt, setCurrentCustomerTotalDebt] = useState(0); // New State for Total Debt Display
  const [paymentAmount, setPaymentAmount] = useState<{ [id: string]: number }>({}); 

  const receiptRef = useRef<HTMLDivElement>(null);

  // Identify Current Outlet
  const currentOutlet = outlets.find(o => o.id === user.outletId) || { 
      id: 'HEAD-OFFICE', 
      name: 'Subaru Daging Sapi', 
      address: 'Jl. Tamin No.30, Klp. Tiga, Kec. Tj. Karang Pusat, Kota Bandar Lampung, Lampung 35119',
      phone: ''
  };

  // Initialize Printer Service
  const printerService = new PrinterService(printerConfig);

  const handleConnectPrinter = () => {
      // Redirect to settings for full config
      showToast("Silakan atur koneksi printer di menu Settings > Printer Config", "info");
  };

  const addToCart = (product: Product) => {
    if (product.stock === 0) return;
    setCart(prev => {
      const exist = prev.find(item => item.id === product.id);
      if (exist && exist.qty >= product.stock) {
        showToast('Stok tidak mencukupi!');
        return prev;
      }
      if (exist) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const newQty = item.qty + delta;
        if (newQty <= 0) return item; 
        if (product && newQty > product.stock) {
             showToast('Stok Maksimal');
             return item;
        }
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  const discountAmount = discountType === 'flat' 
    ? discountValue 
    : (subtotal * discountValue) / 100;

  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = 0; 
  const total = totalAfterDiscount + tax + (isDelivery ? shippingCost : 0);

  // --- CUSTOMER SELECTION & DEBT CHECK ---
  const calculateTotalDebt = (name: string, id?: string) => {
      const debts = receivables.filter(r => {
          if (id && r.customerId) {
              return r.customerId === id && r.status !== 'Lunas';
          }
          return r.customerName.toLowerCase() === name.toLowerCase() && r.status !== 'Lunas';
      });
      const totalDebt = debts.reduce((sum, r) => sum + r.amount, 0);
      setCurrentCustomerTotalDebt(totalDebt);
      setCustomerDebts(debts);
      return { totalDebt, debts };
  };

  const handleSelectCustomer = (cust: Customer) => {
      setCustomerName(cust.name);
      setCustomerId(cust.id); // Set customerId
      setCustomerType(cust.type);
      setCustomerPhone(cust.phone);
      setShowCustomerSearch(false);
      setCustomerSearchTerm('');
      
      // Calculate Debt Immediately
      const { totalDebt } = calculateTotalDebt(cust.name, cust.id);
      
      if (totalDebt > 0) {
          showToast(`Pelanggan memiliki hutang Rp ${totalDebt.toLocaleString()}`);
      }
  };

  const handleManualCustomerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomerName(e.target.value);
      setCustomerId(''); // Reset ID
      // Reset debt if manual typing (exact match check needed in real app)
      setCurrentCustomerTotalDebt(0);
  };

  const filteredCustomerList = customers.filter(c => 
      c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  // --- DEBT REPAYMENT LOGIC (INSIDE POS) ---
  const handlePayDebt = (debtId: string, amountToPay: number, isFullPayment: boolean) => {
      if (amountToPay <= 0) {
          showToast("Masukkan nominal pembayaran");
          return;
      }
      
      const typeText = isFullPayment ? "PELUNASAN" : "PEMBAYARAN CICILAN";
      
      setConfirmData({
          isOpen: true,
          title: 'Konfirmasi Pembayaran Hutang',
          message: `Konfirmasi ${typeText} sebesar Rp ${amountToPay.toLocaleString()}?`,
          onConfirm: () => {
              payReceivable(debtId, amountToPay);
              showToast(isFullPayment ? "Hutang LUNAS!" : "Pembayaran cicilan berhasil", 'success');
              
              // Refresh list locally
              const updatedDebts = customerDebts.map(d => {
                  if (d.id === debtId) {
                      const remaining = d.amount - amountToPay;
                      return remaining <= 0 ? null : { ...d, amount: remaining };
                  }
                  return d;
              }).filter(Boolean) as Receivable[];
              
              setCustomerDebts(updatedDebts);
              // Recalculate total debt
              const newTotal = updatedDebts.reduce((sum, r) => sum + r.amount, 0);
              setCurrentCustomerTotalDebt(newTotal);
              
              // Clear input
              setPaymentAmount(prev => ({...prev, [debtId]: 0}));
          }
      });
  };

  const handleInputChange = (id: string, val: string) => {
      setPaymentAmount({...paymentAmount, [id]: Number(val)});
  }

  // --- PAYMENT LOGIC ---

  const validateTransaction = () => {
      if (!customerName) {
          showToast("Nama pelanggan harus diisi");
          return false;
      }
      if (selectedPayment === 'Piutang' && !customerPhone) {
          showToast("No. HP Wajib untuk Piutang");
          return false;
      }
      if (selectedPayment === 'Piutang' && downPayment >= total) {
          showToast("Jika DP lunas, gunakan metode Tunai/QRIS");
          return false;
      }
      return true;
  };

  const handlePayButton = () => {
      if (!validateTransaction()) return;

      if (selectedPayment === 'Tunai') {
          processTransaction();
      } else if (selectedPayment === 'QRIS') {
          setShowQrisModal(true);
      } else if (selectedPayment === 'Debit') {
          setShowDebitModal(true);
      } else if (selectedPayment === 'E-Wallet') {
          setShowEWalletModal(true);
      } else if (selectedPayment === 'Piutang') {
          const selectedDate = new Date(dueDate);
          const minDate = new Date(); minDate.setDate(minDate.getDate() + 2);
          if (selectedDate < minDate) { showToast("Jatuh tempo minimal 3 hari"); return; }
          processTransaction();
      }
  };

  const processTransaction = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const trxId = generateTransactionId();
    const now = new Date();
    
    // Calculate new debt accumulation immediately
    let newDebt = 0;
    if (selectedPayment === 'Piutang') {
        newDebt = total - downPayment;
        setCurrentCustomerTotalDebt(prev => prev + newDebt); // Update UI immediately
    }

    const transactionData = {
        id: trxId,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0,5),
        subtotal: subtotal,
        discount: discountAmount,
        tax: tax,
        shippingCost: isDelivery ? shippingCost : 0,
        isDelivery: isDelivery,
        total: total,
        downPayment: selectedPayment === 'Piutang' ? downPayment : undefined,
        items: [...cart],
        paymentMethod: selectedPayment,
        status: selectedPayment === 'Piutang' ? 'Pending' : 'Selesai',
        customerName: customerName,
        customerId: customerId, // Added customerId
        customerType: customerType,
        outletId: user.outletId,
        dueDate: selectedPayment === 'Piutang' ? dueDate : undefined,
        bankName: selectedPayment === 'Debit' ? debitBank : (selectedPayment === 'E-Wallet' ? eWalletProvider : undefined),
        bankRef: (selectedPayment === 'Debit' || selectedPayment === 'E-Wallet') ? (selectedPayment === 'Debit' ? debitRef : eWalletPhone) : undefined,
        cashier: user.name
    };

    addTransaction(transactionData as Transaction);

    // Create Delivery Record if needed
    if (isDelivery) {
        addDelivery({
            id: `del-${trxId}`,
            transactionId: trxId,
            customerName: customerName,
            address: 'Alamat Customer (Update di Detail)', // Placeholder, maybe add address input later
            status: 'Persiapan',
            driverId: '', // To be assigned
            vehicleId: '', // To be assigned
            startTime: now.toISOString(),
            notes: `Ongkir: Rp ${shippingCost.toLocaleString()}`
        });
    }

    // Log Activity
    addSystemLog({
        id: `log-${new Date().getTime()}`,
        userId: user.id,
        userName: user.name,
        role: user.role,
        action: 'ACTION',
        details: `Transaksi Penjualan ${trxId} senilai Rp ${total.toLocaleString()}`,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        location: 'POS',
        device: 'Web'
    });

    setLastTransactionId(trxId);
    setLastTransactionData(transactionData);
    
    setShowQrisModal(false);
    setShowDebitModal(false);
    
    setShowReceipt(true);
    setIsProcessing(false);

    // Auto Print Check
    if (printerConfig.autoPrint) {
        printerService.print(transactionData).catch(err => {
            console.error('Auto print failed:', err);
            if (err.message === 'PRINTER_NOT_CONFIGURED') {
                showToast('Printer belum dikonfigurasi', 'info');
            } else {
                showToast('Gagal cetak otomatis', 'error');
            }
        });
    }

    if (selectedPayment === 'Piutang' || (customerType === 'Tetap' && customerPhone)) {
        const sisaHutang = total - downPayment;
        const totalAkumulasi = currentCustomerTotalDebt; // Updated value
        
        const msg = selectedPayment === 'Piutang' 
            ? `Halo ${customerName}, tagihan Invoice ${trxId} sebesar Rp ${total.toLocaleString()} telah dibuat. DP: Rp ${downPayment.toLocaleString()}. Sisa Invoice: Rp ${sisaHutang.toLocaleString()}. Total Hutang Akumulasi: Rp ${totalAkumulasi.toLocaleString()} (Jatuh Tempo: ${dueDate}). Terima kasih.`
            : `Halo ${customerName}, terima kasih telah berbelanja di Subaru Meat. Total transaksi Anda Rp ${total.toLocaleString()}.`;
        const url = `https://wa.me/${customerPhone}?text=${encodeURIComponent(msg)}`;
        setTimeout(() => window.open(url, '_blank'), 1000);
    }
  };

  // --- THERMAL RECEIPT PDF GENERATOR (80mm) ---
  const generateReceiptPDF = () => {
      // Calculate dynamic height
      const baseHeight = 130; 
      const itemHeight = 10;
      const itemsHeight = cart.length * itemHeight; 
      const totalHeight = baseHeight + itemsHeight;

      const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [80, totalHeight] // 80mm width
      });

      // Font Settings
      doc.setFont("courier", "bold");
      doc.setFontSize(14);
      doc.text("SUBARU DAGING", 40, 10, { align: "center" });
      
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      doc.text(currentOutlet.name, 40, 15, { align: "center" });
      
      const splitAddress = doc.splitTextToSize(currentOutlet.address, 75);
      doc.text(splitAddress, 40, 19, { align: "center" });
      
      let y = 19 + (splitAddress.length * 3);
      doc.text("------------------------------------------", 40, y, { align: "center" });
      y += 4;

      // Metadata
      doc.text(`No : ${lastTransactionId}`, 2, y);
      doc.text(`Tgl: ${new Date().toLocaleString('id-ID')}`, 2, y + 4);
      doc.text(`Plg: ${customerName} (${customerType})`, 2, y + 8);
      
      y += 12;
      doc.text("------------------------------------------", 40, y - 2, { align: "center" });

      // Items
      cart.forEach(item => {
          const itemName = item.name.length > 25 ? item.name.substring(0, 25) + "..." : item.name;
          doc.text(itemName, 2, y);
          y += 4;
          const qtyPrice = `${item.qty} ${item.unit} x ${item.price.toLocaleString()}`;
          const totalItem = (item.qty * item.price).toLocaleString();
          
          doc.text(qtyPrice, 2, y);
          doc.text(totalItem, 78, y, { align: "right" });
          y += 5;
      });

      doc.text("------------------------------------------", 40, y, { align: "center" });
      y += 5;
      
      // Totals
      doc.text("Subtotal:", 2, y);
      doc.text(subtotal.toLocaleString(), 78, y, { align: "right" });
      y += 4;
      
      if (isDelivery && shippingCost > 0) {
          doc.text("Ongkir:", 2, y);
          doc.text(shippingCost.toLocaleString(), 78, y, { align: "right" });
          y += 4;
      }

      if (discountAmount > 0) {
          doc.text("Diskon:", 2, y);
          doc.text(`-${discountAmount.toLocaleString()}`, 78, y, { align: "right" });
          y += 4;
      }

      doc.setFont("courier", "bold");
      doc.setFontSize(12);
      doc.text("TOTAL:", 2, y + 2);
      doc.text(total.toLocaleString(), 78, y + 2, { align: "right" });
      y += 8;
      
      doc.setFontSize(9);
      doc.setFont("courier", "normal");
      
      if (selectedPayment === 'Piutang') {
          doc.text("Metode: PIUTANG", 2, y);
          y += 5;
          doc.text("Uang Muka (DP):", 2, y);
          doc.text(downPayment.toLocaleString(), 78, y, { align: "right" });
          y += 5;
          
          doc.setFont("courier", "bold");
          doc.text("SISA HUTANG TRX:", 2, y);
          doc.text((total - downPayment).toLocaleString(), 78, y, { align: "right" });
          doc.setFont("courier", "normal");
          y += 5;
          
          doc.text("Total Hutang Akumulasi:", 2, y);
          doc.text(currentCustomerTotalDebt.toLocaleString(), 78, y, { align: "right" });
          y += 5;

          doc.text(`Jatuh Tempo: ${dueDate}`, 2, y);
      } else {
          doc.text(`Bayar (${selectedPayment}):`, 2, y);
          doc.text(total.toLocaleString(), 78, y, { align: "right" });
      }

      y += 10;
      doc.text("Terima Kasih!", 40, y, { align: "center" });
      doc.text("Simpan struk ini sebagai bukti.", 40, y+4, { align: "center" });

      doc.save(`Struk_${lastTransactionId}.pdf`);
  };

  const closeReceipt = () => {
      setShowReceipt(false);
      setCart([]);
      setCustomerName('Umum');
      setCustomerPhone('');
      setDiscountValue(0);
      setDownPayment(0);
      setDebitRef('');
      setCurrentCustomerTotalDebt(0);
      showToast('Transaksi Selesai');
  }

  const handlePrintBT = async () => {
      // Use lastTransactionData if available to ensure consistency
      const dataToPrint = {
          transactionId: lastTransactionId,
          date: new Date().toISOString(),
          total: total, 
          items: cart
      };
      
      try {
        await printerService.print(dataToPrint);
        showToast('Cetak Berhasil', 'success');
      } catch (err: any) {
        if (err.message === 'PRINTER_NOT_CONFIGURED') {
            setConfirmData({
                title: 'Printer Belum Siap',
                message: 'Printer belum dikonfigurasi. Lanjutkan menggunakan dialog cetak sistem (Browser)?',
                onConfirm: () => {
                    setConfirmData(null);
                    window.print();
                }
            });
        } else {
            showToast(err.message || 'Gagal mencetak', 'error');
        }
      }
  }

  const handlePrintSystem = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Struk_${lastTransactionId}`,
  });

  // Filter Products Logic
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(term);
    const matchesCategory = activeCategory === 'Semua' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Semua', ...Object.values(ProductCategory)];

  // Date Logic
  const getMinDate = () => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      return d.toISOString().split('T')[0];
  };
  const getMaxDate = () => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d.toISOString().split('T')[0];
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 relative overflow-hidden min-h-[600px]">
      {/* LEFT SIDE: Product Catalog (Text Only Grid) */}
      <div className="flex-1 flex flex-col gap-3 min-w-0 order-2 lg:order-1 h-full overflow-hidden">
        
        {/* Search & Categories & Printer Connect */}
        <div className="bg-[#1e1e1e] p-2 rounded-xl border border-white/5 flex flex-col gap-2 shadow-sm shrink-0">
          <div className="flex gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari daging..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg py-2 pl-10 pr-10 text-xs text-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all placeholder:text-gray-600"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"><XIcon size={14} /></button>
                )}
             </div>
             {/* Printer Button */}
             <button 
                onClick={handleConnectPrinter}
                className={`flex items-center gap-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    printerConfig.connection === PrinterConnection.BLUETOOTH && printerConfig.deviceName
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' 
                    : 'bg-[#121212] text-gray-400 border-white/10 hover:text-white'
                }`}
             >
                <Bluetooth size={16} />
                <span className="hidden sm:inline">
                    {printerConfig.connection === PrinterConnection.BLUETOOTH && printerConfig.deviceName 
                        ? printerConfig.deviceName 
                        : 'Printer Setup'}
                </span>
             </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase whitespace-nowrap transition-all border ${
                  activeCategory === cat 
                    ? 'bg-brand-red text-white border-brand-red shadow-lg' 
                    : 'bg-[#121212] text-gray-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-[#2a2a2a]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid - MINIMALIST TEXT ONLY */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-0 custom-scrollbar">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 pb-20">
              {filteredProducts.map(product => {
                const isOutOfStock = product.stock === 0;
                const isPromo = product.category === ProductCategory.PROMO;
                return (
                  <div 
                    key={product.id} 
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={`relative group flex flex-col bg-[#1e1e1e] border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                      isOutOfStock 
                        ? 'border-white/5 opacity-60 cursor-not-allowed grayscale' 
                        : isPromo
                            ? 'border-brand-red/40 hover:border-brand-red hover:shadow-lg hover:shadow-brand-red/10'
                            : 'border-white/10 hover:border-white/30 hover:bg-[#252525]'
                    }`}
                  >
                    {isPromo && <span className="absolute top-1 right-1 bg-brand-red text-white text-[8px] font-bold px-1 py-0.5 rounded shadow-sm z-10">PROMO</span>}
                    {isOutOfStock && <span className="absolute top-1 right-1 bg-black/80 text-red-500 text-[8px] font-bold px-1 py-0.5 rounded border border-red-500/50 z-10">HABIS</span>}
                    
                    <h3 className="text-white text-xs font-bold leading-snug line-clamp-2 mb-2 pr-0 min-h-[2.5em]">{product.name}</h3>
                    
                    <div className="mt-auto flex justify-between items-end border-t border-white/5 pt-2">
                         <div className="min-w-0 flex-1">
                             <span className="text-[10px] text-gray-400 block truncate">{product.category}</span>
                             <span className={`text-[9px] block truncate ${product.stock < 5 ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                                Stok: {product.stock} {product.unit}
                             </span>
                         </div>
                         <div className="text-brand-gold font-mono font-bold text-sm whitespace-nowrap pl-2">
                            {product.price.toLocaleString('id-ID')}
                         </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-500 py-20">
               <Search size={48} className="opacity-20 mb-4" />
               <p className="text-lg font-medium opacity-60">Produk tidak ditemukan</p>
               <button onClick={() => {setSearchTerm(''); setActiveCategory('Semua');}} className="mt-4 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-brand-red hover:bg-white/10 transition-all">
                   Reset Pencarian
               </button>
             </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Cart Sidebar */}
      <div className="w-full lg:w-[350px] xl:w-[400px] bg-[#1e1e1e] border border-white/5 rounded-xl flex flex-col overflow-hidden shadow-2xl h-auto lg:h-full flex-shrink-0 order-1 lg:order-2 relative">
        
        {/* CUSTOMER SEARCH OVERLAY */}
        {showCustomerSearch && (
            <div className="absolute inset-0 bg-[#1e1e1e] z-20 p-4 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2"><Users size={18}/> Pilih Pelanggan</h3>
                    <button onClick={() => setShowCustomerSearch(false)} className="text-gray-400 hover:text-white"><XIcon size={20}/></button>
                </div>
                <input 
                    type="text" 
                    autoFocus
                    placeholder="Cari nama atau kode (SBR-)..." 
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-lg py-2 px-3 text-sm text-white mb-3 focus:border-brand-red outline-none"
                />
                <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredCustomerList.map(c => (
                        <div key={c.id} onClick={() => handleSelectCustomer(c)} className="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 hover:border-l-4 hover:border-brand-red">
                            <div className="flex justify-between">
                                <span className="font-bold text-white text-sm">{c.name}</span>
                                <span className="text-[10px] bg-gray-700 px-1.5 rounded text-gray-300">{c.type}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-500">{c.phone}</span>
                                <span className="text-[10px] text-gray-600 font-mono">{c.id}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Header */}
        <div className="p-3 border-b border-white/5 bg-[#252525]">
           <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-white flex items-center gap-2 text-sm">
                Keranjang <span className="bg-brand-red text-white text-[10px] px-1.5 rounded-full">{cart.reduce((a, b) => a + b.qty, 0)}</span>
                </h2>
                <button onClick={() => setCart([])} className="text-gray-500 hover:text-red-400"><Trash2 size={16} /></button>
           </div>
           
           {/* Customer Info Inputs */}
           <div className="space-y-1.5">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="Nama Pelanggan"
                            value={customerName} 
                            onChange={handleManualCustomerInput}
                            className="w-full bg-[#121212] border border-white/10 rounded-lg py-1.5 pl-3 pr-8 text-xs text-white focus:border-brand-red outline-none"
                        />
                        <button onClick={() => setShowCustomerSearch(true)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-brand-gold hover:text-white bg-white/5 rounded">
                            <Search size={12} />
                        </button>
                    </div>
                    <select 
                        value={customerType}
                        onChange={(e) => setCustomerType(e.target.value as Customer['type'])}
                        className="w-24 bg-[#121212] border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white focus:border-brand-red outline-none"
                    >
                        <option value="Umum">Umum</option>
                        <option value="Tetap">Tetap</option>
                    </select>
                </div>
                {(customerType === 'Tetap' || selectedPayment === 'Piutang' || customerPhone) && (
                    <div className="relative">
                        <Smartphone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="No. WhatsApp (Untuk Struk)"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full bg-[#121212] border border-white/10 rounded-lg py-1.5 pl-8 pr-2 text-xs text-white focus:border-brand-red outline-none"
                        />
                    </div>
                )}
                {/* DISPLAY CURRENT DEBT */}
                {currentCustomerTotalDebt > 0 && (
                    <div className="flex justify-between items-center bg-red-900/10 border border-red-500/30 p-2 rounded-lg mt-1">
                        <span className="text-[10px] text-red-300 font-bold flex items-center gap-1">
                            <AlertTriangle size={10} /> Total Hutang:
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-white font-mono font-bold">Rp {currentCustomerTotalDebt.toLocaleString()}</span>
                            <button 
                                onClick={() => setShowDebtWarning(true)}
                                className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded hover:bg-red-700"
                            >
                                Detail
                            </button>
                        </div>
                    </div>
                )}
           </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 bg-[#161616] max-h-[300px] lg:max-h-none">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
              <ShoppingCart size={32} strokeWidth={1} className="mb-2" />
              <p className="text-xs">Keranjang Kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-[#1e1e1e] p-2 rounded-lg border border-white/5 flex gap-2 group items-center">
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                       <h4 className="text-xs text-gray-200 font-semibold truncate pr-2">{item.name}</h4>
                       <span className="text-brand-gold font-mono text-xs font-bold whitespace-nowrap">{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-gray-500">{item.price.toLocaleString()}/{item.unit}</p>
                        <div className="flex items-center gap-1 bg-[#2a2a2a] rounded p-0.5 border border-white/5">
                            <button onClick={() => item.qty > 1 ? updateQty(item.id, -1) : removeFromCart(item.id)} className="w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded text-gray-400 hover:text-white"><Minus size={10} /></button>
                            <span className="text-xs w-4 text-center font-bold text-white">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded text-gray-400 hover:text-white"><Plus size={10} /></button>
                        </div>
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Area */}
        <div className="bg-[#1e1e1e] border-t border-white/5">
           <div className="p-3 pb-2 space-y-2">
              {/* Delivery Toggle */}
              <div className="flex items-center justify-between bg-[#121212] p-2 rounded-lg border border-white/5 mb-2">
                  <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${isDelivery ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                          <Truck size={14} />
                      </div>
                      <span className="text-xs text-gray-300">Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                      {isDelivery && (
                          <input 
                              type="number" 
                              placeholder="Ongkir"
                              value={shippingCost || ''}
                              onChange={(e) => setShippingCost(Number(e.target.value))}
                              className="w-20 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-right text-white focus:border-blue-500 outline-none"
                          />
                      )}
                      <button 
                          onClick={() => { 
                              const newState = !isDelivery;
                              setIsDelivery(newState); 
                              if(!newState) setShippingCost(0); 
                          }}
                          className={`w-8 h-4 rounded-full relative transition-colors ${isDelivery ? 'bg-blue-600' : 'bg-gray-700'}`}
                      >
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isDelivery ? 'left-4.5' : 'left-0.5'}`}></div>
                      </button>
                  </div>
              </div>

              {/* Discount Input */}
              <div className="flex items-center gap-2 bg-[#121212] p-1.5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-1 text-gray-500 min-w-[60px]">
                      {discountType === 'flat' ? <Tag size={14} /> : <Percent size={14} />}
                      <span className="text-[10px] text-gray-400">Diskon</span>
                  </div>
                  
                  <input 
                    type="number" 
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-transparent text-right text-sm text-white focus:outline-none"
                    placeholder="0"
                  />
                  
                  <button 
                    onClick={() => setDiscountType(discountType === 'flat' ? 'percent' : 'flat')}
                    className={`text-[10px] px-1.5 py-0.5 rounded ${discountType === 'flat' ? 'bg-brand-red text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                      {discountType === 'flat' ? 'Rp' : '%'}
                  </button>
              </div>

              {selectedPayment === 'Piutang' && (
                  <div className="bg-red-900/10 border border-red-500/30 p-2 rounded-lg mt-2 space-y-2">
                      <div className="flex justify-between items-center">
                          <label className="text-[10px] text-red-200 flex items-center gap-1"><CalendarClock size={10} /> Jatuh Tempo</label>
                          <input 
                            type="date" 
                            value={dueDate}
                            min={getMinDate()}
                            max={getMaxDate()}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-24 bg-[#121212] border border-white/10 rounded px-2 py-0.5 text-[10px] text-white focus:border-red-500 outline-none"
                          />
                      </div>
                      <div className="flex justify-between items-center">
                          <label className="text-[10px] text-red-200 flex items-center gap-1"><BadgeDollarSign size={10} /> Uang Muka (DP)</label>
                          <input 
                            type="number" 
                            value={downPayment || ''}
                            onChange={(e) => setDownPayment(Number(e.target.value))}
                            className="w-24 bg-[#121212] border border-white/10 rounded px-2 py-0.5 text-[10px] text-white text-right focus:border-red-500 outline-none"
                            placeholder="Rp 0"
                          />
                      </div>
                  </div>
              )}

              <div className="flex justify-between text-gray-400 text-xs pt-1">
                <span>Subtotal</span>
                <span className="font-mono text-white">Rp {subtotal.toLocaleString()}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-red-400 text-xs">
                    <span>Diskon {discountType === 'percent' ? `(${discountValue}%)` : ''}</span>
                    <span className="font-mono">- Rp {discountAmount.toLocaleString()}</span>
                </div>
              )}
              {isDelivery && shippingCost > 0 && (
                <div className="flex justify-between text-blue-400 text-xs">
                    <span>Ongkir</span>
                    <span className="font-mono">+ Rp {shippingCost.toLocaleString()}</span>
                </div>
              )}
              {selectedPayment === 'Piutang' && downPayment > 0 && (
                <div className="flex justify-between text-green-400 text-xs">
                    <span>DP (Dibayar)</span>
                    <span className="font-mono">- Rp {downPayment.toLocaleString()}</span>
                </div>
              )}
              
              <div className="border-t border-dashed border-white/10 my-1 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-sm">
                      {selectedPayment === 'Piutang' ? 'Sisa Hutang Baru' : 'Total Bayar'}
                  </span>
                  <div className="text-right">
                      <span className="text-brand-gold font-mono font-bold text-lg block">
                          Rp {(total - (selectedPayment === 'Piutang' ? downPayment : 0)).toLocaleString()}
                      </span>
                      {selectedPayment === 'Piutang' && currentCustomerTotalDebt > 0 && (
                          <span className="text-[10px] text-gray-400 block">
                              Total Akumulasi: Rp {(currentCustomerTotalDebt + (total - downPayment)).toLocaleString()}
                          </span>
                      )}
                  </div>
                </div>
              </div>
           </div>

           {/* Payment Methods */}
           <div className="px-3 pb-3">
             <div className="grid grid-cols-4 gap-1.5">
               {[
                  { id: 'Tunai', icon: Banknote, label: 'Tunai' },
                  { id: 'QRIS', icon: QrCode, label: 'QRIS' },
                  { id: 'Debit', icon: CreditCard, label: 'Debit' },
                  { id: 'E-Wallet', icon: Smartphone, label: 'E-Wallet' },
                  { id: 'Piutang', icon: CalendarClock, label: 'Tempo / DP' },
               ].map((method) => (
                 <button
                   key={method.id}
                   onClick={() => {
                       const methodId = method.id as 'Tunai' | 'QRIS' | 'Debit' | 'Piutang' | 'E-Wallet';
                       setSelectedPayment(methodId);
                       if (methodId === 'Piutang') {
                           const d = new Date();
                           d.setDate(d.getDate() + 3);
                           setDueDate(d.toISOString().split('T')[0]);
                       } else {
                           setDownPayment(0);
                       }
                   }}
                   className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg border transition-all ${
                     selectedPayment === method.id
                       ? 'bg-brand-red text-white border-brand-red'
                       : 'bg-[#2a2a2a] text-gray-400 border-white/5'
                   }`}
                 >
                   <method.icon size={14} />
                   <span className="text-[9px] font-bold">{method.label}</span>
                 </button>
               ))}
             </div>
           </div>
           
           <div className="p-3 pt-0">
             <button 
               onClick={handlePayButton}
               disabled={cart.length === 0 || isProcessing}
               className="w-full py-2.5 bg-white text-brand-black font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
             >
               {isProcessing ? <span className="animate-pulse">Memproses...</span> : <span>Proses Transaksi</span>}
               {!isProcessing && <ArrowRight size={16} />}
             </button>
           </div>
        </div>
      </div>

      {/* --- DEBT WARNING & REPAYMENT MODAL --- */}
      {showDebtWarning && customerDebts.length > 0 && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
              <div className="bg-[#1e1e1e] w-full max-w-lg rounded-xl border border-red-500/30 shadow-2xl shadow-red-900/20 overflow-hidden">
                  <div className="p-6 bg-gradient-to-b from-red-900/20 to-[#1e1e1e] border-b border-white/10">
                      <div className="flex items-start gap-4">
                          <div className="p-3 bg-red-500/20 rounded-full text-red-500">
                              <AlertTriangle size={32} />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-white">Peringatan Hutang</h3>
                              <p className="text-gray-300 text-sm mt-1">
                                  Pelanggan <b>{customerName}</b> memiliki {customerDebts.length} tagihan belum lunas.
                              </p>
                          </div>
                      </div>
                  </div>
                  
                  <div className="p-4 max-h-60 overflow-y-auto space-y-2 bg-[#151515]">
                      {customerDebts.map(debt => (
                          <div key={debt.id} className="p-3 border border-white/10 rounded-lg flex flex-col bg-white/5">
                              <div className="flex justify-between items-start mb-2">
                                  <div>
                                      <span className="text-xs font-mono text-gray-400">{debt.invoiceId}</span>
                                      <p className="text-sm font-bold text-white">Sisa: Rp {debt.amount.toLocaleString()}</p>
                                      <p className="text-[10px] text-red-400">Jatuh Tempo: {debt.dueDate}</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/20">Belum Lunas</span>
                                  </div>
                              </div>
                              
                              {/* Integrated Repayment Input */}
                              <div className="flex gap-2 mt-1 pt-2 border-t border-white/5 items-center">
                                  <input 
                                    type="number" 
                                    placeholder="Input Nominal..." 
                                    className="flex-1 bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-green-500 outline-none"
                                    value={paymentAmount[debt.id] || ''}
                                    onChange={(e) => handleInputChange(debt.id, e.target.value)}
                                  />
                                  
                                  {/* BUTTON LUNAS (Quick Pay Full Amount) */}
                                  <button 
                                    onClick={() => handlePayDebt(debt.id, debt.amount, true)}
                                    className="bg-brand-gold text-black text-xs px-3 py-1.5 rounded font-bold hover:bg-yellow-600 transition-colors flex items-center gap-1 shadow-sm"
                                    title="Lunasi Sekarang"
                                  >
                                      <CheckCircle2 size={12} /> Lunas
                                  </button>

                                  {/* BUTTON BAYAR (Partial/Input Amount) */}
                                  <button 
                                    onClick={() => handlePayDebt(debt.id, paymentAmount[debt.id], false)}
                                    disabled={!paymentAmount[debt.id] || paymentAmount[debt.id] <= 0}
                                    className={`text-xs px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1 shadow-sm ${
                                        (!paymentAmount[debt.id] || paymentAmount[debt.id] <= 0) 
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                                    title="Bayar Sebagian/Cicil"
                                  >
                                     <Wallet size={12} /> Bayar
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="p-4 bg-[#252525] border-t border-white/10 flex justify-between items-center">
                      <div>
                          <p className="text-xs text-gray-400">Total Akumulasi</p>
                          <p className="text-lg font-bold text-white">Rp {currentCustomerTotalDebt.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-3">
                        <button 
                            onClick={() => setShowDebtWarning(false)} 
                            className="px-4 py-2 bg-transparent hover:bg-white/5 text-gray-300 text-sm rounded-lg transition-colors"
                        >
                            Tutup
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- PAYMENT MODALS (QRIS & DEBIT Omitted for Brevity as unchanged) --- */}
      {/* 1. QRIS Modal */}
      {showQrisModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center text-black">
                  <h3 className="font-bold text-xl mb-4">Scan QRIS</h3>
                  <div className="w-64 h-64 bg-gray-200 mx-auto mb-4 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-400">
                      <QrCode size={128} className="text-gray-500" />
                  </div>
                  <p className="text-lg font-bold mb-6">Rp {total.toLocaleString()}</p>
                  <button onClick={processTransaction} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                      Konfirmasi Pembayaran Berhasil
                  </button>
                  <button onClick={() => setShowQrisModal(false)} className="mt-3 text-sm text-gray-500 hover:underline">Batal</button>
              </div>
          </div>
      )}

      {/* 2. Debit Modal */}
      {showDebitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
              <div className="bg-[#1e1e1e] border border-white/10 w-full max-w-sm rounded-2xl p-6">
                  <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-2"><CreditCard /> Pembayaran Debit</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-gray-400 text-sm mb-1">Pilih Bank</label>
                          <div className="grid grid-cols-3 gap-2">
                              {['BCA', 'Mandiri', 'BRI'].map(bank => (
                                  <button 
                                    key={bank}
                                    onClick={() => setDebitBank(bank)}
                                    className={`py-2 rounded border ${debitBank === bank ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/20 text-gray-400'}`}
                                  >
                                      {bank}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div>
                          <label className="block text-gray-400 text-sm mb-1">Nomor Referensi (EDC)</label>
                          <input 
                            type="text" 
                            className="w-full bg-black/50 border border-white/20 rounded p-2 text-white"
                            value={debitRef}
                            onChange={(e) => setDebitRef(e.target.value)}
                            placeholder="Input 4 digit terakhir..."
                          />
                      </div>
                      <div className="pt-4">
                          <button onClick={processTransaction} className="w-full py-3 bg-brand-red text-white font-bold rounded-lg hover:bg-red-900">
                              Proses Pembayaran
                          </button>
                          <button onClick={() => setShowDebitModal(false)} className="w-full mt-3 py-2 text-gray-400 hover:text-white">Batal</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- RECEIPT MODAL (PRINT VIEW) --- */}
      {showReceipt && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="print-receipt-modal print-only-container bg-white text-black w-full max-w-sm rounded-lg shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
               <div className="p-4">
                  {/* THERMAL RECEIPT STYLE - HTML Preview */}
                  <div className="thermal-receipt" ref={receiptRef}>
                      <div className="text-center font-bold mb-2">
                          <h1 className="text-lg">SUBARU DAGING</h1>
                          <p className="text-[10px] font-normal">{currentOutlet.address}</p>
                          <p className="text-[10px] font-normal">{currentOutlet.phone}</p>
                      </div>
                      <div className="dashed-line"></div>
                      <div className="flex justify-between text-[10px]">
                          <span>No: {lastTransactionId}</span>
                          <span>{new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="text-[10px] mb-1">
                          Kasir: {user.name}
                      </div>
                      <div className="flex justify-between text-[10px] mb-2">
                          <span>Plg: {customerName.substring(0,12)}</span>
                          <span>{new Date().toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="dashed-line"></div>
                      
                      <div className="space-y-1">
                          {cart.map((item, idx) => (
                              <div key={idx}>
                                  <div className="text-[10px] font-bold">{item.name}</div>
                                  <div className="flex justify-between text-[10px]">
                                      <span>{item.qty} {item.unit} x {item.price.toLocaleString()}</span>
                                      <span>{(item.price * item.qty).toLocaleString()}</span>
                                  </div>
                              </div>
                          ))}
                      </div>

                      <div className="dashed-line"></div>
                      
                      <div className="flex justify-between text-xs">
                          <span>Subtotal</span>
                          <span>{subtotal.toLocaleString()}</span>
                      </div>
                      {isDelivery && shippingCost > 0 && (
                          <div className="flex justify-between text-xs">
                              <span>Ongkir</span>
                              <span>{shippingCost.toLocaleString()}</span>
                          </div>
                      )}
                      {discountAmount > 0 && (
                          <div className="flex justify-between text-xs">
                              <span>Diskon</span>
                              <span>-{discountAmount.toLocaleString()}</span>
                          </div>
                      )}
                      
                      <div className="double-line"></div>
                      <div className="flex justify-between text-sm font-bold">
                          <span>TOTAL</span>
                          <span>Rp {total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                          <span>Bayar ({selectedPayment})</span>
                          {selectedPayment !== 'Piutang' && <span>{total.toLocaleString()}</span>}
                      </div>
                      
                      {selectedPayment === 'Piutang' && (
                          <>
                            <div className="flex justify-between text-xs mt-1">
                                <span>Uang Muka (DP)</span>
                                <span>{downPayment.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs mt-1 font-bold">
                                <span>SISA HUTANG TRX</span>
                                <span>{(total - downPayment).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px] mt-1 border-t border-dashed border-gray-400 pt-1">
                                <span>Total Akumulasi:</span>
                                <span>{currentCustomerTotalDebt.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px] mt-1">
                                <span>Jatuh Tempo:</span>
                                <span>{dueDate}</span>
                            </div>
                          </>
                      )}
                      
                      <div className="dashed-line"></div>
                      <div className="text-center text-[10px] mt-2">
                          <p>Terima Kasih</p>
                          <p>Simpan struk sebagai bukti pembayaran</p>
                          <p className="mt-1">Powered by Subaru ERP</p>
                      </div>
                  </div>

                  {/* ACTION BUTTONS (NO PRINT) */}
                  <div className="mt-6 space-y-3 no-print">
                     <div className="grid grid-cols-3 gap-2">
                       <button onClick={handlePrintBT} className="py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 flex flex-col items-center justify-center gap-1 text-[10px] shadow-lg">
                          <Printer size={16} /> 
                          <span>Cetak (BT)</span>
                       </button>
                       <button onClick={handlePrintSystem} className="py-3 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 flex flex-col items-center justify-center gap-1 text-[10px] shadow-lg">
                          <Printer size={16} /> 
                          <span>Cetak (Canon)</span>
                       </button>
                       <button onClick={generateReceiptPDF} className="py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex flex-col items-center justify-center gap-1 text-[10px] shadow-lg">
                          <Download size={16} /> 
                          <span>PDF</span>
                       </button>
                     </div>
                     <button onClick={closeReceipt} className="w-full py-2 bg-gray-100 text-black rounded-lg font-bold hover:bg-gray-200 text-sm border border-gray-300">
                        Tutup / Transaksi Baru
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
      
      {/* E-Wallet Modal */}
      {showEWalletModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#1e1e1e] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525]">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Smartphone className="text-brand-gold" /> Konfirmasi E-Wallet
              </h3>
              <button onClick={() => setShowEWalletModal(false)} className="text-gray-400 hover:text-white">
                <XIcon size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {['Gopay', 'OVO', 'Dana', 'ShopeePay'].map((provider) => (
                  <button
                    key={provider}
                    onClick={() => setEWalletProvider(provider as 'Gopay' | 'OVO' | 'Dana' | 'ShopeePay')}
                    className={`p-4 rounded-xl border transition-all text-center font-bold ${
                      eWalletProvider === provider
                        ? 'bg-brand-gold text-black border-brand-gold'
                        : 'bg-black/30 text-gray-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {provider}
                  </button>
                ))}
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest">Nomor HP / ID</label>
                <input
                  type="text"
                  placeholder="08xx..."
                  value={eWalletPhone}
                  onChange={(e) => setEWalletPhone(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white text-lg focus:border-brand-gold outline-none"
                />
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between text-gray-400 text-sm mb-1">
                  <span>Total Tagihan</span>
                  <span>Rp {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total Bayar</span>
                  <span className="text-brand-gold">Rp {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowEWalletModal(false);
                  processTransaction();
                }}
                disabled={!eWalletPhone}
                className="w-full py-4 bg-brand-gold text-black font-black rounded-xl shadow-lg shadow-brand-gold/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                Konfirmasi Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Module Section */}
      <div className="w-full mt-6 bg-[#1e1e1e] border border-white/5 rounded-xl p-6 order-3 lg:col-span-2">
          <Distribution />
      </div>
    </div>
  );
};

export default POS;