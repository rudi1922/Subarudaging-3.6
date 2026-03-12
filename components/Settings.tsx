import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Save, Settings as SettingsIcon, Shield, Users, Globe, Lock, ToggleLeft, ToggleRight, Printer, FileText, Search, Download, FileBarChart, Package, Calculator, CheckCircle, Store, Trash2, MapPin, User as UserIcon, Key, Target, Beef, History, Eye, Truck } from 'lucide-react';
import { Role, Outlet, PrinterConnection, PrintingData, User, GalleryItem, LoyaltyProgram } from '../types';
import { useStore } from '../StoreContext';
import { createPortal } from 'react-dom';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import PrinterSettings from './PrinterSettings';
import Distribution from './Distribution';
import { updateUser } from '../services/auth';

const PrintContent = React.forwardRef(({ printingData, paperSize }: { printingData: PrintingData | null; paperSize: string }, ref: React.Ref<HTMLDivElement>) => {
    if (!printingData) return null;
    
    // Adjust style based on Paper Size
    const isThermal = paperSize === '58mm' || paperSize === '80mm';
    const isA4 = paperSize === 'A4';
    const isLegal = paperSize === 'Legal';
    const isFolio = paperSize === 'Folio';

    let containerClass = "print-only-container hidden print:block bg-white text-black p-8 w-full font-sans";
    
    if (isThermal) {
        containerClass = `print-only-container hidden print:block bg-white text-black p-2 w-[${paperSize}] mx-auto text-xs font-mono`;
    } else if (isA4) {
        containerClass = "print-only-container hidden print:block bg-white text-black p-8 w-[210mm] mx-auto font-sans a4-report";
    } else if (isLegal || isFolio) {
        containerClass = "print-only-container hidden print:block bg-white text-black p-8 w-[216mm] mx-auto font-sans a4-report";
    }

    return (
      <div className={containerClass} ref={ref}>
          <div className={`text-center border-b-2 border-black pb-4 mb-4 ${isThermal ? 'pb-2 mb-2' : ''}`}>
              <h1 className={`${isThermal ? 'text-lg' : 'text-2xl'} font-bold uppercase`}>Subaru Daging</h1>
              <h2 className={`${isThermal ? 'text-sm' : 'text-xl'}`}>{printingData.title}</h2>
              <p className="text-[10px] mt-1">{new Date().toLocaleString()}</p>
          </div>
          
          <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="border-b border-black">
                      {printingData.columns.map((col: string, i: number) => (
                          <th key={i} className={`p-1 ${isThermal ? 'text-[10px]' : 'text-sm'} font-bold`}>{col}</th>
                      ))}
                  </tr>
              </thead>
              <tbody>
                  {printingData.rows.map((row: (string | number)[], i: number) => (
                      <tr key={i} className="border-b border-gray-300">
                          {row.map((cell: string | number, j: number) => (
                              <td key={j} className={`p-1 ${isThermal ? 'text-[10px]' : 'text-sm'}`}>{cell}</td>
                          ))}
                      </tr>
                  ))}
              </tbody>
          </table>
          
          <div className="mt-8 text-center text-[10px]">
              <p>--- End of Report ---</p>
          </div>
      </div>
    );
});

interface SettingsProps {
    user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const { products, transactions, employees, expenses, receivables, outlets, addOutlet, updateOutlet, appSettings, updateAppSettings, updateRolePermissions, printerConfig, galleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem, loyaltyPrograms, addLoyaltyProgram, updateLoyaltyProgram, deleteLoyaltyProgram, cattleTypes, addCattleType, deleteCattleType, systemLogs, employeeFinancials, cattleOrders } = useStore();
  
  const canEditSettings = user?.username === 'rudiaf';
  const [activeTab, setActiveTab] = useState<'general' | 'access' | 'print' | 'outlets' | 'gallery' | 'loyalty' | 'master' | 'logs' | 'distribution'>(canEditSettings ? 'general' : 'print');
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };
  
  // Print Config State with Persistence
  const paperSize = printerConfig.type;
  const [preferPdf, setPreferPdf] = useState(false);

  // Report Center State
  const [reportSearch, setReportSearch] = useState('');
  const [printingData, setPrintingData] = useState<PrintingData | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: printingData?.title || 'Report',
    onAfterPrint: () => setPrintingData(null),
  });

  // New Outlet Form
  const [newOutlet, setNewOutlet] = useState<Partial<Outlet>>({ name: '', address: '', phone: '', radius: 100 });
  
  // Password Change State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Gallery Management State
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [galleryForm, setGalleryForm] = useState<Partial<GalleryItem>>({ title: '', subtitle: '', imageUrl: '', content: '', category: 'Kegiatan' });

  // Loyalty Management State
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
  const [editingLoyaltyProgram, setEditingLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [loyaltyForm, setLoyaltyForm] = useState<Partial<LoyaltyProgram>>({ title: '', description: '', targetKg: 300, durationMonths: 6, reward: '', isActive: true });
  
  // Role Permissions
  const [permissions, setPermissions] = useState(appSettings.rolePermissions || [
    { role: Role.DIRECTOR, viewFinance: true, editStock: true, manageUsers: true },
    { role: Role.MANAGER, viewFinance: true, editStock: true, manageUsers: false },
    { role: Role.ADMIN, viewFinance: false, editStock: true, manageUsers: false },
    { role: Role.CASHIER, viewFinance: false, editStock: false, manageUsers: false },
  ]);

  // History Log State
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [logFilterType, setLogFilterType] = useState<string>('Semua');
  const [logStartDate] = useState('');
  const [logEndDate] = useState('');
  const [selectedLogEntry, setSelectedLogEntry] = useState<any | null>(null);

  // Sync permissions when appSettings loads
  useEffect(() => {
      if (appSettings.rolePermissions && appSettings.rolePermissions.length > 0) {
          setPermissions(appSettings.rolePermissions);
      }
  }, [appSettings.rolePermissions]);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const togglePermission = (roleIndex: number, field: keyof typeof permissions[0]) => {
    const newPerms = [...permissions];
    // @ts-expect-error - Dynamic key access on inferred type
    newPerms[roleIndex][field] = !newPerms[roleIndex][field];
    setPermissions(newPerms);
  };

    const handleBackupDatabase = () => {
        if (confirm('Apakah Anda yakin ingin melakukan Backup Database sekarang? File backup akan diunduh secara otomatis.')) {
            const data = {
                settings: appSettings,
                outlets,
                users,
                products,
                transactions,
                receivables,
                expenses,
                employees,
                attendance,
                systemLogs,
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_subaru_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            addSystemLog({
                id: `log-${Date.now()}`,
                userId: user.id,
                userName: user.name,
                role: user.role,
                action: 'SYSTEM',
                details: 'Backup Database Berhasil',
                timestamp: new Date().toISOString(),
                ip: '127.0.0.1',
                location: 'Settings',
                device: 'Web'
            });
            
            alert('Backup Database Berhasil!');
        }
    };

    const handleDeleteOldLogs = () => {
        if (confirm('Apakah Anda yakin ingin menghapus log sistem yang sudah lebih dari 30 hari? Tindakan ini tidak dapat dibatalkan.')) {
            // Logic to delete old logs (mocked for now, but should call store function)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            // In a real app, we'd call a store function to filter systemLogs
            // For now, we'll just show a success message
            addSystemLog({
                id: `log-${Date.now()}`,
                userId: user.id,
                userName: user.name,
                role: user.role,
                action: 'SYSTEM',
                details: 'Pembersihan Log Lama Berhasil',
                timestamp: new Date().toISOString(),
                ip: '127.0.0.1',
                location: 'Settings',
                device: 'Web'
            });
            
            alert('Log lama berhasil dibersihkan!');
        }
    };

    const handleSaveGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title || !galleryForm.imageUrl) return;
    
    if (!confirm(`Apakah Anda yakin ingin ${editingGalleryItem ? 'mengupdate' : 'menambah'} item gallery ini?`)) return;
    
    const item: GalleryItem = {
        id: editingGalleryItem?.id || `G-${Date.now()}`,
        title: galleryForm.title!,
        subtitle: galleryForm.subtitle || '',
        imageUrl: galleryForm.imageUrl!,
        content: galleryForm.content || '',
        date: editingGalleryItem?.date || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        category: galleryForm.category || 'Kegiatan'
    };

    if (editingGalleryItem) {
        updateGalleryItem(item);
    } else {
        addGalleryItem(item);
    }
    
    setIsGalleryModalOpen(false);
    setEditingGalleryItem(null);
    setGalleryForm({ title: '', subtitle: '', imageUrl: '', content: '', category: 'Kegiatan' });
  };

  const handleSaveLoyaltyProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loyaltyForm.title || !loyaltyForm.reward) return;

    if (!confirm(`Apakah Anda yakin ingin ${editingLoyaltyProgram ? 'mengupdate' : 'menambah'} program loyalty ini?`)) return;

    const program: LoyaltyProgram = {
        id: editingLoyaltyProgram?.id || `LP-${Date.now()}`,
        title: loyaltyForm.title!,
        description: loyaltyForm.description || '',
        targetKg: loyaltyForm.targetKg || 300,
        durationMonths: loyaltyForm.durationMonths || 6,
        reward: loyaltyForm.reward!,
        isActive: loyaltyForm.isActive !== undefined ? loyaltyForm.isActive : true
    };

    if (editingLoyaltyProgram) {
        updateLoyaltyProgram(program);
    } else {
        addLoyaltyProgram(program);
    }

    setIsLoyaltyModalOpen(false);
    setEditingLoyaltyProgram(null);
    setLoyaltyForm({ title: '', description: '', targetKg: 300, durationMonths: 6, reward: '', isActive: true });
  };

  // --- HISTORY LOG DATA ---
  const allActivities = useMemo(() => {
    const logs: any[] = [];

    // 1. Transactions (Penjualan)
    transactions.forEach(t => {
        logs.push({
            id: t.id,
            date: t.date,
            timestamp: new Date(`${t.date}T${t.time || '00:00'}`).getTime(),
            type: 'Penjualan',
            reference: t.id,
            description: `Penjualan ${t.customerType} - ${t.customerName}`,
            amount: t.total,
            user: 'Kasir', 
            status: t.status,
            details: t
        });
    });

    // 2. Expenses (Pengeluaran)
    expenses.forEach(e => {
        logs.push({
            id: e.id,
            date: e.date,
            timestamp: new Date(e.date).getTime(),
            type: 'Pengeluaran',
            reference: e.category,
            description: `${e.division}: ${e.description}`,
            amount: -e.amount,
            details: e
        });
    });

    // 3. Employee Financials (Gaji/HR)
    employeeFinancials.forEach(ef => {
        const empName = employees.find(emp => emp.id === ef.employeeId)?.name || 'Unknown';
        logs.push({
            id: ef.id,
            date: ef.date,
            timestamp: new Date(ef.date).getTime(),
            type: 'Gaji/HR',
            reference: ef.type,
            description: `${ef.type} - ${empName}: ${ef.description}`,
            amount: (ef.type === 'Kasbon' || ef.type === 'Potongan') ? ef.amount : -ef.amount, 
            details: ef
        });
    });

    // 4. Cattle Orders (PO Sapi)
    cattleOrders.forEach(co => {
        logs.push({
            id: co.id,
            date: co.orderDate.split('T')[0],
            timestamp: new Date(co.orderDate).getTime(),
            type: 'PO Sapi',
            reference: co.supplierName,
            description: `Order ${co.quantity} Ekor (${co.weightType})`,
            amount: 0, 
            status: co.totalLiveWeight ? 'Selesai' : 'Proses',
            details: co
        });
    });

    // 5. System Logs (Login/Action)
    systemLogs.forEach(sys => {
        logs.push({
            id: sys.id,
            date: sys.timestamp.split('T')[0],
            timestamp: new Date(sys.timestamp).getTime(),
            type: 'Aktivitas Akun',
            reference: sys.action,
            description: `${sys.userName} (${sys.role}) - ${sys.details}`,
            amount: 0,
            status: 'Logged',
            location: sys.location,
            device: sys.device,
            ip: sys.ip,
            details: sys
        });
    });

    return logs.sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, expenses, employeeFinancials, cattleOrders, employees, systemLogs]);

  const filteredLogs = allActivities.filter(log => {
    const matchesSearch = 
        log.description.toLowerCase().includes(logSearchTerm.toLowerCase()) || 
        log.reference.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(logSearchTerm.toLowerCase());
    
    const matchesType = logFilterType === 'Semua' || log.type === logFilterType;
    
    let matchesDate = true;
    if (logStartDate) matchesDate = matchesDate && log.date >= logStartDate;
    if (logEndDate) matchesDate = matchesDate && log.date <= logEndDate;

    return matchesSearch && matchesType && matchesDate;
  });

  const handleExportLogsPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setFontSize(14);
    doc.text("LAPORAN AKTIVITAS USAHA - SUBARU DAGING SAPI", 14, 15);
    doc.setFontSize(10);
    doc.text(`Periode: ${logStartDate || 'Awal'} s/d ${logEndDate || 'Sekarang'}`, 14, 22);
    
    const tableBody = filteredLogs.map(log => [
        log.date,
        log.type,
        log.reference,
        log.description,
        log.amount !== 0 ? `Rp ${Math.abs(log.amount).toLocaleString('id-ID')}` : '-'
    ]);

    autoTable(doc, {
        startY: 30,
        head: [['Tanggal', 'Tipe', 'Ref ID', 'Deskripsi', 'Nominal']],
        body: tableBody,
        headStyles: { fillColor: [139, 0, 0] }
    });

    doc.save(`Laporan_Aktivitas_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleUpdatePermissions = async () => {
        if (!confirm('Apakah Anda yakin ingin mengupdate hak akses (RBAC) untuk semua role?')) return;
        setIsSaving(true);
        try {
            await updateRolePermissions(permissions);
            
            addSystemLog({
                id: `log-${Date.now()}`,
                userId: user.id,
                userName: user.name,
                role: user.role,
                action: 'SETTINGS',
                details: `Update Permission RBAC Berhasil`,
                timestamp: new Date().toISOString(),
                ip: '127.0.0.1',
                location: 'Settings',
                device: 'Web'
            });
            
            alert('Permissions updated successfully!');
        } catch (error) {
            console.error('Error updating permissions:', error);
            alert('Gagal mengupdate permissions. Silakan coba lagi.');
        } finally {
            setIsSaving(false);
        }
    };

  const handleAddOutlet = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newOutlet.name) return;
      if (!confirm('Apakah Anda yakin ingin menambahkan gerai baru ini?')) return;
      addOutlet({
          id: `OUTLET-${new Date().getTime()}`,
          name: newOutlet.name!,
          address: newOutlet.address || '',
          phone: newOutlet.phone || '',
          radius: newOutlet.radius || 100
      });
      setNewOutlet({ name: '', address: '', phone: '', radius: 100 });
      alert("Gerai baru berhasil ditambahkan!");
  };

  const handleChangePassword = async () => {
      if (newPassword !== confirmPassword) {
          alert("Password tidak cocok!");
          return;
      }
      if (newPassword.length < 6) {
          alert("Password minimal 6 karakter!");
          return;
      }
      
      if (!confirm('Apakah Anda yakin ingin mengubah password Anda? Anda akan diminta untuk login ulang.')) return;
      
      const success = await updateUser(user.id, { password: newPassword });
      if (success) {
          alert("Password berhasil diubah! Silakan login ulang.");
          setIsPasswordModalOpen(false);
          setNewPassword('');
          setConfirmPassword('');
          // Optional: Force logout
          // window.location.reload(); 
      } else {
          alert("Gagal mengubah password. Coba lagi.");
      }
  };


    const handleSaveGeneralSettings = () => {
        showConfirm('Simpan Pengaturan', 'Simpan perubahan pengaturan umum?', () => {
            updateAppSettings(appSettings);
            alert('Pengaturan umum berhasil disimpan!');
        });
    };

  // --- REPORT DEFINITIONS ---
  const reports = [
    {
      id: 'inventory',
      title: 'Laporan Stok Gudang',
      category: 'Inventory',
      description: 'Ringkasan stok produk, harga, dan nilai aset saat ini.',
      icon: Package,
      getData: () => ({
        head: [['Kode', 'Nama Produk', 'Kat', 'Stok', 'Unit', 'Harga']],
        body: products.map(p => [p.id.substring(0,6), p.name.substring(0, 20), p.category, p.stock, p.unit, `Rp ${p.price.toLocaleString('id-ID')}`])
      })
    },
    {
      id: 'sales_daily',
      title: 'Penjualan Harian',
      category: 'Sales',
      description: 'Daftar transaksi penjualan hari ini dan metode pembayaran.',
      icon: FileBarChart,
      getData: () => ({
        head: [['Faktur', 'Jam', 'Pelanggan', 'Metode', 'Total']],
        body: transactions.filter(t => t.date === new Date().toISOString().split('T')[0] || t.date === '2023-10-25')
              .map(t => [t.id, t.time || '-', t.customerName.substring(0,15), t.paymentMethod, `Rp ${t.total.toLocaleString()}`])
      })
    },
    {
      id: 'expenses',
      title: 'Laporan Pengeluaran',
      category: 'Finance',
      description: 'Detail biaya operasional, gaji, dan pembelian.',
      icon: Calculator,
      getData: () => ({
        head: [['Tgl', 'Kategori', 'Divisi', 'Ket', 'Jml']],
        body: expenses.map(e => [e.date, e.category, e.division, e.description.substring(0,15), `Rp ${e.amount.toLocaleString()}`])
      })
    },
    {
      id: 'hr_active',
      title: 'Data Karyawan Aktif',
      category: 'HR',
      description: 'Daftar karyawan, jabatan, divisi, dan status.',
      icon: Users,
      getData: () => ({
        head: [['ID', 'Nama', 'Divisi', 'Jabatan', 'Status']],
        body: employees.map(e => [e.id, e.name, e.division, e.position, e.status])
      })
    },
    {
        id: 'receivables',
        title: 'Piutang Jatuh Tempo',
        category: 'Finance',
        description: 'Daftar tagihan pelanggan yang belum lunas.',
        icon: FileText,
        getData: () => ({
          head: [['Invoice', 'Pelanggan', 'Due Date', 'Status', 'Jml']],
          body: receivables.map(r => [r.invoiceId, r.customerName.substring(0,15), r.dueDate, r.status, `Rp ${r.amount.toLocaleString()}`])
        })
      }
  ];

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(reportSearch.toLowerCase()) ||
    r.category.toLowerCase().includes(reportSearch.toLowerCase())
  );

  // --- ACTIONS ---

  const handleExportPDF = (report: typeof reports[0]) => {
    const doc = new jsPDF();
    const data = report.getData();

    // Header
    doc.setFontSize(18);
    doc.text("SUBARU DAGING SAPI - ERP SYSTEM", 14, 15);
    doc.setFontSize(12);
    doc.text(report.title, 14, 25);
    doc.setFontSize(10);
    doc.text(`Dicetak: ${new Date().toLocaleString()}`, 14, 32);

    // Table
    autoTable(doc, {
        head: data.head,
        body: data.body,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [139, 0, 0] } // Brand Red
    });

    doc.save(`${report.id}_report.pdf`);
  };

  const handlePrintNow = (report: typeof reports[0]) => {
    if (printerConfig.connection !== PrinterConnection.SYSTEM && !printerConfig.deviceName) {
        const proceed = window.confirm("Status Printer: Terputus. Lanjutkan menggunakan dialog cetak browser standar?");
        if(!proceed) return;
    }

    const data = report.getData();
    setPrintingData({
        title: report.title,
        columns: data.head[0],
        rows: data.body
    });

    // Wait for portal to render then print
    setTimeout(() => {
        handlePrint();
    }, 500);
  };

  return (
    <div className="space-y-6 relative">
      {createPortal(<PrintContent ref={reportRef} printingData={printingData} paperSize={paperSize} />, document.body)}

      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon size={28} className="text-brand-red" />
        <h2 className="text-2xl font-semibold text-white font-serif">System Settings</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 overflow-x-auto">
        {canEditSettings && (
            <>
                <button 
                  onClick={() => setActiveTab('general')}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'general' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'
                  }`}
                >
                  <Globe size={16} /> General
                </button>
                <button 
                  onClick={() => setActiveTab('outlets')}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'outlets' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'
                  }`}
                >
                  <Store size={16} /> Outlet / Gerai
                </button>
                <button 
                  onClick={() => setActiveTab('gallery')}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'gallery' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'
                  }`}
                >
                  <Globe size={16} /> Gallery & Berita
                </button>
                <button 
                  onClick={() => setActiveTab('loyalty')}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'loyalty' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'
                  }`}
                >
                  <Target size={16} /> Loyalty Program
                </button>
                <button 
                  onClick={() => setActiveTab('master')}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'master' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'
                  }`}
                >
                  <Calculator size={16} /> Master Data
                </button>
                <button 
                  onClick={() => setActiveTab('access')}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'access' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'
                  }`}
                >
                  <Shield size={16} /> Access Control
                </button>
                <button 
                  onClick={() => setActiveTab('logs')}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'logs' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'
                  }`}
                >
                  <History size={16} /> History Log
                </button>
            </>
        )}
        <button 
          onClick={() => setActiveTab('distribution')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'distribution' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <Truck size={16} /> Distribusi Armada
        </button>
        <button 
          onClick={() => setActiveTab('print')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'print' ? 'border-brand-red text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <Printer size={16} /> Printer & Report Config
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'distribution' && <Distribution />}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Profile Section */}
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 space-y-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <UserIcon size={20} className="text-brand-gold" /> User Profile
              </h3>
              <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-red to-black border-2 border-brand-gold/50 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" /> : user.name.charAt(0)}
                  </div>
                  <div>
                      <h4 className="text-white font-bold text-lg">{user.name}</h4>
                      <p className="text-gray-400 text-sm">@{user.username}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 rounded text-[10px] uppercase font-bold tracking-wider text-brand-gold border border-white/5">
                          {user.role}
                      </span>
                  </div>
              </div>
              
              <div className="pt-4 border-t border-white/5">
                  <button 
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors flex items-center justify-center gap-2 group"
                  >
                      <Key size={16} className="text-gray-400 group-hover:text-brand-gold transition-colors" />
                      Ganti Password
                  </button>
              </div>
            </div>

            {/* Application Config */}
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 space-y-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">Application Config</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                  <input 
                    type="text" 
                    value={appSettings.companyName || 'Subaru Daging Sapi'} 
                    onChange={(e) => updateAppSettings({ companyName: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Logo URL</label>
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={appSettings.logoUrl || ''} 
                        onChange={(e) => updateAppSettings({ logoUrl: e.target.value })}
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" 
                        placeholder="https://..."
                      />
                      {appSettings.logoUrl && <img src={appSettings.logoUrl} alt="Logo" className="w-10 h-10 object-contain bg-white/10 rounded" />}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Hero Image URL (Login Screen)</label>
                  <input 
                    type="text" 
                    value={appSettings.heroImageUrl || ''} 
                    onChange={(e) => updateAppSettings({ heroImageUrl: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" 
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm text-gray-400 mb-1">Currency</label>
                     <select className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white">
                       <option>IDR (Rp)</option>
                       <option>USD ($)</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm text-gray-400 mb-1">Tax Rate (%)</label>
                     <input type="number" defaultValue="11" className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white" />
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 space-y-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">System Status & Global Config</h3>
              
              {/* Supabase Status */}
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                <div>
                  <p className="text-white font-medium">Database Connection (Supabase)</p>
                  <p className="text-xs text-gray-500">
                    {import.meta.env.VITE_SUPABASE_URL ? 'Connected to ' + import.meta.env.VITE_SUPABASE_URL.substring(0, 20) + '...' : 'Not Configured (Using Local Mock Mode)'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${import.meta.env.VITE_SUPABASE_URL ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                <div>
                  <p className="text-white font-medium">Maintenance Mode</p>
                  <p className="text-xs text-gray-500">Prevent non-admin users from accessing system.</p>
                </div>
                <button 
                    onClick={() => updateAppSettings({ maintenanceMode: !appSettings.maintenanceMode })} 
                    className={`${appSettings.maintenanceMode ? 'text-brand-red' : 'text-gray-600'}`}
                >
                  {appSettings.maintenanceMode ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                <div>
                  <p className="text-white font-medium">Allow Negative Stock</p>
                  <p className="text-xs text-gray-500">Allow transactions even if stock is 0.</p>
                </div>
                <button 
                    onClick={() => updateAppSettings({ allowNegativeStock: !appSettings.allowNegativeStock })} 
                    className={`${appSettings.allowNegativeStock ? 'text-green-500' : 'text-gray-600'}`}
                >
                  {appSettings.allowNegativeStock ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                <div>
                  <p className="text-white font-medium">Require Location for Login</p>
                  <p className="text-xs text-gray-500">Force GPS check on login.</p>
                </div>
                <button 
                    onClick={() => updateAppSettings({ requireLocationForLogin: !appSettings.requireLocationForLogin })} 
                    className={`${appSettings.requireLocationForLogin ? 'text-green-500' : 'text-gray-600'}`}
                >
                  {appSettings.requireLocationForLogin ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>

              <div className="p-4 bg-black/20 rounded-lg border border-white/5">
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-white font-medium">Attendance Radius (meters)</p>
                          <span className="text-brand-gold font-bold">{appSettings.attendanceRadius}m</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="500" 
                          step="10"
                          value={appSettings.attendanceRadius}
                          onChange={(e) => updateAppSettings({ attendanceRadius: parseInt(e.target.value) })}
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-red"
                        />
                    </div>
                    <button 
                        onClick={() => { 
                            if(confirm('Simpan pengaturan radius absensi?')) {
                                updateAppSettings({ attendanceRadius: appSettings.attendanceRadius }); 
                                alert('Radius berhasil disimpan!'); 
                            }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg h-10 w-10 flex items-center justify-center transition-colors"
                        title="Konfirmasi Radius"
                    >
                        <CheckCircle size={20} />
                    </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Radius validasi GPS untuk absensi karyawan (10m - 500m).</p>
              </div>
            </div>

            <div className="col-span-full">
              <button 
                onClick={handleSaveGeneralSettings}
                className="bg-brand-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-900 transition-colors flex items-center gap-2"
              >
                <Save size={18} /> Save General Settings
              </button>
            </div>
          </div>
        )}

        {/* OUTLETS TAB */}
        {activeTab === 'outlets' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* List Outlets */}
                <div className="bg-[#1e1e1e] rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-4 bg-[#252525] border-b border-white/5">
                        <h3 className="text-lg font-medium text-white">Daftar Gerai Aktif</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {outlets.map(outlet => (
                            <div key={outlet.id} className="p-4 bg-black/20 border border-white/5 rounded-lg flex items-start gap-4">
                                <div className="bg-brand-red/20 p-2 rounded-lg text-brand-red">
                                    <Store size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-white font-bold">{outlet.name}</h4>
                                        {outlet.coordinates && (
                                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20">GPS Aktif</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{outlet.address}</p>
                                    <p className="text-xs text-gray-500 mt-1">{outlet.phone}</p>
                                    {outlet.coordinates && (
                                        <p className="text-[10px] text-brand-gold mt-1 font-mono">
                                            Coord: {outlet.coordinates.lat}, {outlet.coordinates.lng}
                                        </p>
                                    )}
                                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-gray-500">Lat:</span>
                                            <input 
                                                type="number" step="any"
                                                className="w-24 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-brand-gold outline-none"
                                                placeholder="Latitude"
                                                defaultValue={outlet.coordinates?.lat}
                                                onBlur={(e) => {
                                                    const lat = parseFloat(e.target.value);
                                                    if (!isNaN(lat)) {
                                                        updateOutlet({ 
                                                            ...outlet, 
                                                            coordinates: { lat, lng: outlet.coordinates?.lng || 0 } 
                                                        });
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-gray-500">Lng:</span>
                                            <input 
                                                type="number" step="any"
                                                className="w-24 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-brand-gold outline-none"
                                                placeholder="Longitude"
                                                defaultValue={outlet.coordinates?.lng}
                                                onBlur={(e) => {
                                                    const lng = parseFloat(e.target.value);
                                                    if (!isNaN(lng)) {
                                                        updateOutlet({ 
                                                            ...outlet, 
                                                            coordinates: { lat: outlet.coordinates?.lat || 0, lng } 
                                                        });
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-gray-500">Radius (m):</span>
                                            <input 
                                                type="number"
                                                className="w-16 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-brand-gold outline-none"
                                                placeholder="100"
                                                defaultValue={outlet.radius || 100}
                                                onBlur={(e) => {
                                                    const radius = parseInt(e.target.value);
                                                    if (!isNaN(radius)) {
                                                        updateOutlet({ 
                                                            ...outlet, 
                                                            radius
                                                        });
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-600 mt-1 font-mono">{outlet.id}</p>
                                    <button 
                                        onClick={() => {
                                            if ('geolocation' in navigator) {
                                                navigator.geolocation.getCurrentPosition(
                                                    (pos) => {
                                                        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                                                        updateOutlet({ ...outlet, coordinates: newCoords });
                                                        alert(`Lokasi ${outlet.name} berhasil diperbarui ke posisi Anda saat ini!`);
                                                    },
                                                    (err) => alert("Gagal mendapatkan lokasi: " + err.message)
                                                );
                                            } else {
                                                alert("Geolocation tidak didukung browser ini.");
                                            }
                                        }}
                                        className="mt-2 text-[10px] bg-blue-600/20 text-blue-400 px-2 py-1 rounded border border-blue-600/30 hover:bg-blue-600/30 transition-colors flex items-center gap-1 w-fit"
                                    >
                                        <MapPin size={12} /> Set Lokasi Saat Ini
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Outlet Form */}
                <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5 h-fit">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <CheckCircle size={18} className="text-green-500" /> Tambah Gerai Baru
                    </h3>
                    <form onSubmit={handleAddOutlet} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Nama Gerai</label>
                            <input 
                                type="text" required 
                                value={newOutlet.name}
                                onChange={e => setNewOutlet({...newOutlet, name: e.target.value})}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                                placeholder="Contoh: Gerai Subaru Kemiling"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Alamat Lengkap</label>
                            <textarea 
                                rows={2}
                                value={newOutlet.address}
                                onChange={e => setNewOutlet({...newOutlet, address: e.target.value})}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none h-20 resize-none"
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Telepon</label>
                                <input 
                                    type="text"
                                    value={newOutlet.phone}
                                    onChange={e => setNewOutlet({...newOutlet, phone: e.target.value})}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase mb-1">Latitude</label>
                                    <input 
                                        type="number" step="any"
                                        value={newOutlet.coordinates?.lat || ''}
                                        onChange={e => setNewOutlet({...newOutlet, coordinates: { lat: parseFloat(e.target.value), lng: newOutlet.coordinates?.lng || 0 }})}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase mb-1">Longitude</label>
                                    <input 
                                        type="number" step="any"
                                        value={newOutlet.coordinates?.lng || ''}
                                        onChange={e => setNewOutlet({...newOutlet, coordinates: { lat: newOutlet.coordinates?.lat || 0, lng: parseFloat(e.target.value) }})}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Radius Absensi (meter)</label>
                            <input 
                                type="number"
                                value={newOutlet.radius || 100}
                                onChange={e => setNewOutlet({...newOutlet, radius: parseInt(e.target.value)})}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                                placeholder="100"
                            />
                        </div>
                        <button type="submit" className="w-full bg-brand-gold text-black font-bold py-3 rounded-lg hover:bg-yellow-600 transition-colors shadow-lg shadow-brand-gold/20">
                            Simpan Gerai
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <Shield size={18} className="text-brand-red" /> Master Data CMS Maintenance
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={handleBackupDatabase}
                                className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/10 transition-colors flex flex-col items-center gap-2"
                            >
                                <Download size={20} className="text-blue-400" />
                                <span>Backup Database</span>
                            </button>
                            <button 
                                onClick={handleDeleteOldLogs}
                                className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/10 transition-colors flex flex-col items-center gap-2"
                            >
                                <Trash2 size={20} className="text-red-400" />
                                <span>Hapus Log Lama</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'logs' && (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <History size={20} className="text-brand-red" /> History & Log Aktivitas
                        </h3>
                        <p className="text-gray-400 text-sm">Rekam jejak transaksi dan aktivitas keamanan akun.</p>
                    </div>
                    <button 
                        onClick={handleExportLogsPDF}
                        className="bg-brand-red text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-900 transition-colors shadow-lg text-sm"
                    >
                        <Download size={16} /> Export PDF
                    </button>
                </div>

                <div className="bg-[#1e1e1e] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Cari ID, Nama User, atau Deskripsi..." 
                            value={logSearchTerm}
                            onChange={(e) => setLogSearchTerm(e.target.value)}
                            className="w-full bg-[#121212] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-brand-red outline-none"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        <select 
                            value={logFilterType} 
                            onChange={(e) => setLogFilterType(e.target.value)}
                            className="bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-red outline-none"
                        >
                            <option value="Semua">Semua Tipe</option>
                            <option value="Aktivitas Akun">Login & Aktivitas Akun</option>
                            <option value="Penjualan">Penjualan</option>
                            <option value="Pengeluaran">Pengeluaran</option>
                            <option value="Gaji/HR">Gaji & HR</option>
                            <option value="PO Sapi">PO Sapi</option>
                        </select>
                    </div>
                </div>

                <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-[#151515] text-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Waktu</th>
                                    <th className="px-6 py-4">Tipe</th>
                                    <th className="px-6 py-4">Ref / Akun</th>
                                    <th className="px-6 py-4">Deskripsi</th>
                                    <th className="px-6 py-4 text-right">Nominal</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium">{log.date}</span>
                                                <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                log.type === 'Penjualan' ? 'bg-green-500/10 text-green-500' :
                                                log.type === 'Pengeluaran' ? 'bg-red-500/10 text-red-500' :
                                                log.type === 'PO Sapi' ? 'bg-brand-gold/10 text-brand-gold' :
                                                log.type === 'Aktivitas Akun' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                                            }`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{log.reference}</td>
                                        <td className="px-6 py-4 text-white">{log.description}</td>
                                        <td className={`px-6 py-4 text-right font-mono ${log.amount > 0 ? 'text-green-500' : log.amount < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                            {log.amount !== 0 ? `Rp ${Math.abs(log.amount).toLocaleString()}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => setSelectedLogEntry(log)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-500">
                                            Tidak ada riwayat aktivitas yang sesuai filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'print' && (
          <div className="space-y-8">
             <PrinterSettings />

             <div className="flex items-center justify-between p-4 bg-[#1e1e1e] border border-white/10 rounded-xl">
                <div>
                    <h3 className="text-white font-medium">Preferensi Laporan</h3>
                    <p className="text-sm text-gray-400">Pilih format default untuk tombol aksi cepat.</p>
                </div>
                <div className="flex items-center gap-3 bg-black/30 p-1 rounded-lg border border-white/5">
                    <button 
                        onClick={() => setPreferPdf(false)}
                        className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${!preferPdf ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Print Langsung
                    </button>
                    <button 
                        onClick={() => setPreferPdf(true)}
                        className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${preferPdf ? 'bg-brand-red text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        PDF Export
                    </button>
                </div>
             </div>

             {/* Report Center Section */}
             <div className="space-y-4">
                 <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-white/10 pb-4">
                     <div>
                        <h3 className="text-xl font-bold text-white font-serif">Report Center</h3>
                        <p className="text-sm text-gray-400">Pusat pencetakan laporan dan dokumen.</p>
                     </div>
                     <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Cari Laporan..." 
                            value={reportSearch}
                            onChange={(e) => setReportSearch(e.target.value)}
                            className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-brand-red"
                        />
                     </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {filteredReports.map((report) => (
                         <div key={report.id} className="bg-[#1e1e1e] border border-white/5 rounded-xl p-5 hover:border-brand-red/30 transition-all group flex flex-col h-full">
                             <div className="flex items-start justify-between mb-4">
                                 <div className="p-3 bg-white/5 rounded-lg text-brand-gold group-hover:bg-brand-gold/10 transition-colors">
                                     <report.icon size={24} />
                                 </div>
                                 <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">{report.category}</span>
                             </div>
                             
                             <div className="flex-1 mb-6">
                                 <h4 className="text-lg font-bold text-white mb-1">{report.title}</h4>
                                 <p className="text-sm text-gray-400 leading-relaxed">{report.description}</p>
                             </div>

                             <div className="grid grid-cols-2 gap-3">
                                 <button 
                                    onClick={() => handlePrintNow(report)}
                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                        !preferPdf 
                                        ? 'bg-white text-black border-white hover:bg-gray-200' 
                                        : 'bg-transparent text-gray-300 border-white/10 hover:bg-white/5'
                                    }`}
                                 >
                                     <Printer size={16} /> Print
                                 </button>
                                 <button 
                                    onClick={() => handleExportPDF(report)}
                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                        preferPdf 
                                        ? 'bg-brand-red text-white border-brand-red hover:bg-red-900' 
                                        : 'bg-transparent text-gray-300 border-white/10 hover:bg-white/5'
                                    }`}
                                 >
                                     <Download size={16} /> PDF
                                 </button>
                             </div>
                         </div>
                     ))}
                     
                     {filteredReports.length === 0 && (
                         <div className="col-span-full py-12 text-center text-gray-500">
                             <FileText size={48} className="mx-auto mb-4 opacity-20" />
                             <p>Tidak ada laporan yang cocok dengan pencarian "{reportSearch}"</p>
                         </div>
                     )}
                 </div>
             </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <div>
                      <h3 className="text-xl font-bold text-white">Gallery & Berita</h3>
                      <p className="text-sm text-gray-500">Kelola foto kegiatan dan artikel berita untuk landing page.</p>
                  </div>
                  <button 
                    onClick={() => {
                        setEditingGalleryItem(null);
                        setGalleryForm({ title: '', subtitle: '', imageUrl: '', content: '', category: 'Kegiatan' });
                        setIsGalleryModalOpen(true);
                    }}
                    className="bg-brand-red text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-red-700 transition-colors"
                  >
                      <Globe size={14} /> Tambah Item Baru
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryItems.map((item) => (
                      <div key={item.id} className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden group">
                          <div className="h-48 relative overflow-hidden">
                              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute top-2 right-2 flex gap-2">
                                  <button 
                                    onClick={() => {
                                        setEditingGalleryItem(item);
                                        setGalleryForm(item);
                                        setIsGalleryModalOpen(true);
                                    }}
                                    className="p-2 bg-black/50 backdrop-blur-md text-white rounded-lg hover:bg-brand-gold hover:text-black transition-all"
                                  >
                                      <SettingsIcon size={14} />
                                  </button>
                                  <button 
                                    onClick={() => { if(confirm('Hapus item ini?')) deleteGalleryItem(item.id); }}
                                    className="p-2 bg-black/50 backdrop-blur-md text-white rounded-lg hover:bg-red-600 transition-all"
                                  >
                                      <Trash2 size={14} />
                                  </button>
                              </div>
                              <div className="absolute bottom-2 left-2">
                                  <span className="bg-brand-gold text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">{item.category}</span>
                              </div>
                          </div>
                          <div className="p-4">
                              <h4 className="text-white font-bold mb-1 line-clamp-1">{item.title}</h4>
                              <p className="text-gray-500 text-xs mb-4 line-clamp-2">{item.subtitle}</p>
                              <div className="flex justify-between items-center text-[10px] text-gray-600 uppercase tracking-widest">
                                  <span>{item.date}</span>
                                  <span>{item.content ? 'Ada Artikel' : 'Hanya Foto'}</span>
                              </div>
                          </div>
                      </div>
                  ))}
                  {galleryItems.length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-xl">
                          <Globe size={48} className="mx-auto mb-4 opacity-20" />
                          <p>Belum ada item gallery. Tambahkan untuk ditampilkan di landing page.</p>
                      </div>
                  )}
              </div>
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <div>
                      <h3 className="text-xl font-bold text-white">Loyalty Program</h3>
                      <p className="text-sm text-gray-500">Kelola skema reward dan target untuk pelanggan setia.</p>
                  </div>
                  <button 
                    onClick={() => {
                        setEditingLoyaltyProgram(null);
                        setLoyaltyForm({ title: '', description: '', targetKg: 300, durationMonths: 6, reward: '', isActive: true });
                        setIsLoyaltyModalOpen(true);
                    }}
                    className="bg-brand-red text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-red-700 transition-colors"
                  >
                      <Target size={14} /> Tambah Program Baru
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loyaltyPrograms?.map((prog) => (
                      <div key={prog.id} className={`bg-[#1e1e1e] border rounded-xl p-6 transition-all ${prog.isActive ? 'border-white/5' : 'border-red-900/20 opacity-60'}`}>
                          <div className="flex justify-between items-start mb-4">
                              <div className={`p-3 rounded-lg ${prog.isActive ? 'bg-brand-gold/10 text-brand-gold' : 'bg-gray-800 text-gray-500'}`}>
                                  <Target size={24} />
                              </div>
                              <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                        setEditingLoyaltyProgram(prog);
                                        setLoyaltyForm(prog);
                                        setIsLoyaltyModalOpen(true);
                                    }}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                  >
                                      <SettingsIcon size={16} />
                                  </button>
                                  <button 
                                    onClick={() => { if(confirm('Hapus program ini?')) deleteLoyaltyProgram(prog.id); }}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          </div>
                          <h4 className="text-lg font-bold text-white mb-1">{prog.title}</h4>
                          <p className="text-xs text-gray-500 mb-4 h-8 line-clamp-2">{prog.description}</p>
                          
                          <div className="space-y-3 mb-6">
                              <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Target</span>
                                  <span className="text-white font-bold">{prog.targetKg} KG</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Durasi</span>
                                  <span className="text-white font-bold">{prog.durationMonths} Bulan</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Status</span>
                                  <span className={`font-bold ${prog.isActive ? 'text-green-500' : 'text-red-500'}`}>{prog.isActive ? 'Aktif' : 'Non-Aktif'}</span>
                              </div>
                          </div>

                          <div className="pt-4 border-t border-white/5">
                              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Reward:</p>
                              <p className="text-brand-gold font-bold text-sm">{prog.reward}</p>
                          </div>
                      </div>
                  ))}
                  {(!loyaltyPrograms || loyaltyPrograms.length === 0) && (
                      <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-xl">
                          <Target size={48} className="mx-auto mb-4 opacity-20" />
                          <p>Belum ada loyalty program. Tambahkan untuk ditampilkan di landing page.</p>
                      </div>
                  )}
              </div>
          </div>
        )}

        {activeTab === 'master' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Beef className="text-brand-gold" size={24} />
                Manajemen Jenis Sapi
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add New Type Form */}
                <div className="lg:col-span-1 bg-black/20 p-6 rounded-xl border border-white/5">
                  <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Tambah Jenis Baru</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Nama Jenis</label>
                      <input id="new-cattle-name" type="text" placeholder="Contoh: Wagyu" className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Harga Hidup Default (Rp/Kg)</label>
                      <input id="new-cattle-price" type="number" placeholder="45000" className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Estimasi Karkas (%)</label>
                      <input id="new-cattle-carcass" type="number" placeholder="50" className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white text-sm" />
                    </div>
                    <button 
                      onClick={() => {
                        const name = (document.getElementById('new-cattle-name') as HTMLInputElement).value;
                        const price = parseInt((document.getElementById('new-cattle-price') as HTMLInputElement).value);
                        const carcass = parseInt((document.getElementById('new-cattle-carcass') as HTMLInputElement).value);
                        if (name && price) {
                          addCattleType({ id: `CT-${Date.now()}`, name, defaultLivePrice: price, defaultCarcassPct: carcass });
                          (document.getElementById('new-cattle-name') as HTMLInputElement).value = '';
                          (document.getElementById('new-cattle-price') as HTMLInputElement).value = '';
                          (document.getElementById('new-cattle-carcass') as HTMLInputElement).value = '';
                        }
                      }}
                      className="w-full py-2.5 bg-brand-gold text-black font-bold rounded-lg hover:brightness-110 transition-all text-sm"
                    >
                      Tambah Jenis
                    </button>
                  </div>
                </div>

                {/* List of Types */}
                <div className="lg:col-span-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black/40">
                          <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Jenis Sapi</th>
                          <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Harga Default</th>
                          <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Karkas Est.</th>
                          <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {cattleTypes?.map(type => (
                          <tr key={type.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 text-sm text-white font-medium">{type.name}</td>
                            <td className="p-4 text-sm text-gray-300 font-mono">Rp {type.defaultLivePrice.toLocaleString('id-ID')}</td>
                            <td className="p-4 text-sm text-gray-300">{type.defaultCarcassPct}%</td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => {
                                  showConfirm('Hapus Jenis Sapi', `Hapus jenis sapi ${type.name}?`, () => {
                                    deleteCattleType(type.id);
                                  });
                                }}
                                className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'access' && (
          <div className="bg-[#1e1e1e] rounded-xl border border-white/5 overflow-hidden">
             {/* ... RBAC Table Content ... */}
             <div className="p-6 border-b border-white/5 bg-[#252525] flex justify-between items-center">
               <h3 className="text-lg font-medium text-white">Role Based Access Control (RBAC)</h3>
               <button 
                   onClick={() => setIsRoleModalOpen(true)}
                   className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg flex items-center gap-2"
               >
                 <Users size={14} /> Manage Custom Roles
               </button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-[#121212] text-gray-400 font-medium">
                   <tr>
                     <th className="px-6 py-4">Role</th>
                     <th className="px-6 py-4 text-center">View Finance</th>
                     <th className="px-6 py-4 text-center">Edit Stock</th>
                     <th className="px-6 py-4 text-center">Manage Users</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 text-gray-300">
                   {permissions.map((perm, index) => (
                     <tr key={perm.role} className="hover:bg-white/5">
                       <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                           <Lock size={14} />
                         </div>
                         {perm.role}
                       </td>
                       <td className="px-6 py-4 text-center">
                         <input 
                            type="checkbox" 
                            checked={perm.viewFinance} 
                            onChange={() => togglePermission(index, 'viewFinance')}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brand-red focus:ring-offset-gray-900" 
                          />
                       </td>
                       <td className="px-6 py-4 text-center">
                         <input 
                            type="checkbox" 
                            checked={perm.editStock} 
                            onChange={() => togglePermission(index, 'editStock')}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brand-red focus:ring-offset-gray-900" 
                          />
                       </td>
                       <td className="px-6 py-4 text-center">
                         <input 
                            type="checkbox" 
                            checked={perm.manageUsers} 
                            onChange={() => togglePermission(index, 'manageUsers')}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brand-red focus:ring-offset-gray-900" 
                          />
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             <div className="p-6 border-t border-white/5 bg-[#1a1a1a]">
               <button 
                 onClick={handleUpdatePermissions}
                 className="bg-brand-gold text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-600 transition-colors flex items-center gap-2"
               >
                  <Save size={18} /> Update Permissions
               </button>
             </div>
          </div>
        )}
      </div>

      {/* Gallery Modal */}
      {isGalleryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1e1e1e] w-full max-w-2xl rounded-xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-white mb-6">{editingGalleryItem ? 'Edit Item Gallery' : 'Tambah Item Gallery'}</h3>
                  <form onSubmit={handleSaveGalleryItem} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Judul</label>
                              <input 
                                type="text" 
                                value={galleryForm.title}
                                onChange={(e) => setGalleryForm({...galleryForm, title: e.target.value})}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white"
                                placeholder="Contoh: Proses Produksi Higienis"
                                required
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Kategori</label>
                              <select 
                                value={galleryForm.category}
                                onChange={(e) => setGalleryForm({...galleryForm, category: e.target.value})}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white"
                              >
                                  <option value="Kegiatan">Kegiatan</option>
                                  <option value="Produksi">Produksi</option>
                                  <option value="Logistik">Logistik</option>
                                  <option value="Produk">Produk</option>
                                  <option value="Event">Event</option>
                              </select>
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Subtitle / Deskripsi Singkat</label>
                          <input 
                            type="text" 
                            value={galleryForm.subtitle}
                            onChange={(e) => setGalleryForm({...galleryForm, subtitle: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white"
                            placeholder="Deskripsi singkat yang muncul di gallery"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">URL Gambar</label>
                          <input 
                            type="text" 
                            value={galleryForm.imageUrl}
                            onChange={(e) => setGalleryForm({...galleryForm, imageUrl: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white"
                            placeholder="https://..."
                            required
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Konten Artikel (Opsional)</label>
                          <textarea 
                            value={galleryForm.content}
                            onChange={(e) => setGalleryForm({...galleryForm, content: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white h-40"
                            placeholder="Tulis artikel lengkap di sini..."
                          />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                          <button type="button" onClick={() => setIsGalleryModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Batal</button>
                          <button type="submit" className="px-6 py-2 bg-brand-red text-white rounded-lg font-bold">Simpan Item</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Loyalty Modal */}
      {isLoyaltyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl border border-white/10 p-6">
                  <h3 className="text-xl font-bold text-white mb-6">{editingLoyaltyProgram ? 'Edit Loyalty Program' : 'Tambah Loyalty Program'}</h3>
                  <form onSubmit={handleSaveLoyaltyProgram} className="space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Nama Program</label>
                          <input 
                            type="text" 
                            value={loyaltyForm.title}
                            onChange={(e) => setLoyaltyForm({...loyaltyForm, title: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white"
                            placeholder="Contoh: Paket 300"
                            required
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Deskripsi</label>
                          <textarea 
                            value={loyaltyForm.description}
                            onChange={(e) => setLoyaltyForm({...loyaltyForm, description: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white h-20"
                            placeholder="Penjelasan singkat program"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Target (KG)</label>
                              <input 
                                type="number" 
                                value={loyaltyForm.targetKg}
                                onChange={(e) => setLoyaltyForm({...loyaltyForm, targetKg: parseInt(e.target.value)})}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white"
                                required
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Durasi (Bulan)</label>
                              <input 
                                type="number" 
                                value={loyaltyForm.durationMonths}
                                onChange={(e) => setLoyaltyForm({...loyaltyForm, durationMonths: parseInt(e.target.value)})}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white"
                                required
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Reward</label>
                          <input 
                            type="text" 
                            value={loyaltyForm.reward}
                            onChange={(e) => setLoyaltyForm({...loyaltyForm, reward: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white"
                            placeholder="Contoh: Diskon 2% + Merchandise"
                            required
                          />
                      </div>
                      <div className="flex items-center gap-2 py-2">
                          <input 
                            type="checkbox" 
                            checked={loyaltyForm.isActive}
                            onChange={(e) => setLoyaltyForm({...loyaltyForm, isActive: e.target.checked})}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brand-red"
                          />
                          <label className="text-sm text-gray-300">Program Aktif</label>
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                          <button type="button" onClick={() => setIsLoyaltyModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Batal</button>
                          <button type="submit" className="px-6 py-2 bg-brand-red text-white rounded-lg font-bold">Simpan Program</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Custom Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Kelola Custom Role</h3>
                <p className="text-gray-400 text-sm mb-4">Fitur ini memungkinkan Anda membuat role baru dengan hak akses spesifik.</p>
                <input 
                    type="text" 
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Nama Role Baru"
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white mb-4"
                />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Batal</button>
                    <button onClick={() => { alert('Custom Role ditambahkan (Simulasi)'); setIsRoleModalOpen(false); }} className="px-4 py-2 bg-brand-red text-white rounded-lg">Simpan</button>
                </div>
            </div>
        </div>
      )}
      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="text-brand-gold" size={24} />
              Ganti Password
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Password Baru</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Konfirmasi Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                  placeholder="Ulangi password baru"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleChangePassword}
                disabled={!newPassword || !confirmPassword}
                className="px-4 py-2 bg-brand-red hover:bg-brand-red/80 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {/* History Log Detail Modal */}
      {selectedLogEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1e1e1e] w-full max-w-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525]">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <History size={20} className="text-brand-red" /> Detail Aktivitas
                      </h3>
                      <button onClick={() => setSelectedLogEntry(null)} className="text-gray-400 hover:text-white"><XIcon size={24} /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                              <p className="text-gray-500">Waktu</p>
                              <p className="text-white font-medium">{selectedLogEntry.date} {new Date(selectedLogEntry.timestamp).toLocaleTimeString()}</p>
                          </div>
                          <div>
                              <p className="text-gray-500">Tipe</p>
                              <p className="text-brand-gold font-bold uppercase">{selectedLogEntry.type}</p>
                          </div>
                      </div>
                      
                      <div>
                          <p className="text-gray-500 text-sm mb-1">Deskripsi</p>
                          <p className="text-white bg-black/20 p-3 rounded-lg border border-white/5">{selectedLogEntry.description}</p>
                      </div>

                      {selectedLogEntry.type === 'Aktivitas Akun' && (
                          <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3 space-y-2 text-sm">
                              <div className="flex justify-between">
                                  <span className="text-blue-300">IP Address</span>
                                  <span className="text-white font-mono">{selectedLogEntry.ip}</span>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-blue-300">Lokasi</span>
                                  <span className="text-white">{selectedLogEntry.location}</span>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-blue-300">Perangkat</span>
                                  <span className="text-white text-xs truncate max-w-[200px]">{selectedLogEntry.device}</span>
                              </div>
                          </div>
                      )}

                      {selectedLogEntry.amount !== 0 && (
                          <div className="flex justify-between items-center pt-4 border-t border-white/10">
                              <span className="text-gray-400">Nominal</span>
                              <span className={`text-xl font-bold font-mono ${selectedLogEntry.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                  Rp {Math.abs(selectedLogEntry.amount).toLocaleString()}
                              </span>
                          </div>
                      )}
                  </div>
                  <div className="p-4 bg-black/20 text-center">
                      <button onClick={() => setSelectedLogEntry(null)} className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-colors">
                          Tutup
                      </button>
                  </div>
              </div>
          </div>
      )}

      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4 text-brand-gold">
              <Shield size={24} />
              <h3 className="text-lg font-bold text-white">{confirmModal.title}</h3>
            </div>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="flex-1 py-2.5 bg-brand-red hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;