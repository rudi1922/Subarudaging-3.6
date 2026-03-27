import React, { useState } from 'react';
import { MOCK_BANK_MUTATIONS } from '../constants';
import { useStore } from '../StoreContext';
import { Check, RefreshCw, AlertCircle, FileText, PieChart, TrendingUp, Calendar, ArrowDownRight, Printer, MessageCircle, Plus, X as XIcon, Download, Phone, Clock, Send, Upload, Save } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Expense, PrinterConnection, User as UserType } from '../types';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PrinterService } from '../utils/printer';

interface FinanceProps {
  user?: UserType;
}

const PrintableExpenseSlip = ({ exp, paperSize }: { exp: Expense; paperSize: string }) => {
  const isThermal = paperSize === '58mm' || paperSize === '80mm';
  const widthClass = isThermal ? `w-[${paperSize}]` : 'w-[80mm]';
  
  return (
    <div className={`print-only-container hidden print:block bg-white text-black p-8 mx-auto font-mono text-xs border border-black ${widthClass}`}>
        <div className="text-center border-b border-black pb-2 mb-4">
            <h2 className="text-sm font-bold">SUBARU DAGING SAPI</h2>
            <p className="text-[10px]">BUKTI PENGELUARAN KAS</p>
        </div>
        
        <div className="space-y-2 mb-4">
            <div className="flex justify-between"><span>Tanggal:</span><span>{exp.date}</span></div>
            <div className="flex justify-between"><span>Kategori:</span><span>{exp.category}</span></div>
            <div className="flex justify-between"><span>Divisi:</span><span>{exp.division}</span></div>
        </div>
        
        <div className="border-t border-b border-black py-2 mb-4">
            <p className="font-bold mb-1">Keterangan:</p>
            <p>{exp.description}</p>
        </div>
        
        <div className="flex justify-between font-bold text-sm mb-6">
            <span>TOTAL:</span>
            <span>Rp {exp.amount.toLocaleString()}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-[10px] text-center">
            <div>
                <p className="mb-10">Admin</p>
                <p className="border-t border-black">( ............ )</p>
            </div>
            <div>
                <p className="mb-10">Penerima</p>
                <p className="border-t border-black">( ............ )</p>
            </div>
        </div>
    </div>
  );
};

// --- PRINTABLE COMPONENT (HTML - A4 Report Style) ---
const PrintableReport = ({ totalRevenue, costOfGoods, totalExpenses, netProfit, cashOnHand, totalReceivables, inventoryValue, totalAssets, accountsPayable, capital, retainedEarnings, paperSize }: {
    totalRevenue: number;
    costOfGoods: number;
    totalExpenses: number;
    netProfit: number;
    cashOnHand: number;
    totalReceivables: number;
    inventoryValue: number;
    totalAssets: number;
    accountsPayable: number;
    capital: number;
    retainedEarnings: number;
    paperSize: string;
}) => {
    const isA4 = paperSize === 'A4';
    const isLegal = paperSize === 'Legal';
    const isFolio = paperSize === 'Folio';
    const widthClass = (isLegal || isFolio) ? 'w-[216mm]' : isA4 ? 'w-[210mm]' : 'w-full max-w-4xl';

    return (
      <div className={`print-only-container hidden print:block bg-white text-black p-8 mx-auto a4-report ${widthClass}`}>
          <header>
              <h1 className="text-2xl font-bold uppercase tracking-widest text-black">Subaru Daging Sapi</h1>
              <p className="text-sm">Ruko Jl. Tamin (depan pasar Tamin) Tanjungkarang Barat, Bandar Lampung</p>
              <p className="text-sm">Telp: 0812-3456-7890 | Email: ptsubarualammakmur@gmail.com</p>
          </header>

          <div className="text-center mb-8">
              <h2 className="text-xl font-bold uppercase underline">Laporan Keuangan</h2>
              <p className="text-sm mt-1">Periode Hingga: {new Date().toLocaleDateString('id-ID')}</p>
          </div>

          {/* P&L Section */}
          <div className="mb-8 break-inside-avoid">
              <h3 className="text-lg font-bold mb-4 border-b border-black pb-1">I. Laba Rugi (Income Statement)</h3>
              
              <table className="w-full text-sm border-collapse">
                  <tbody>
                      <tr className="border-b border-gray-200"><td className="py-2">Total Pendapatan</td><td className="py-2 text-right font-bold">Rp {totalRevenue.toLocaleString()}</td></tr>
                      <tr className="border-b border-gray-200"><td className="py-2 text-red-600">Harga Pokok Penjualan (HPP)</td><td className="py-2 text-right text-red-600">(Rp {costOfGoods.toLocaleString()})</td></tr>
                      <tr className="border-b border-black bg-gray-100 font-bold"><td className="py-2">Laba Kotor</td><td className="py-2 text-right">Rp {(totalRevenue - costOfGoods).toLocaleString()}</td></tr>
                      <tr className="border-b border-gray-200"><td className="py-2 text-red-600">Biaya Operasional</td><td className="py-2 text-right text-red-600">(Rp {totalExpenses.toLocaleString()})</td></tr>
                      <tr className="border-t-2 border-black font-bold text-lg"><td className="py-3">Laba Bersih</td><td className="py-3 text-right">Rp {netProfit.toLocaleString()}</td></tr>
                  </tbody>
              </table>
          </div>

          {/* Balance Sheet Section */}
          <div className="break-inside-avoid">
              <h3 className="text-lg font-bold mb-4 border-b border-black pb-1">II. Neraca (Balance Sheet)</h3>
              
              <div className="grid grid-cols-2 gap-12 text-sm">
                  {/* Assets */}
                  <div>
                      <h4 className="font-bold underline mb-2">ASET (AKTIVA)</h4>
                      <div className="space-y-1">
                          <div className="flex justify-between border-b border-gray-100 py-1"><span>Kas & Bank</span> <span>{cashOnHand.toLocaleString()}</span></div>
                          <div className="flex justify-between border-b border-gray-100 py-1"><span>Piutang</span> <span>{totalReceivables.toLocaleString()}</span></div>
                          <div className="flex justify-between border-b border-gray-100 py-1"><span>Stok</span> <span>{inventoryValue.toLocaleString()}</span></div>
                      </div>
                      <div className="border-t border-black mt-2 pt-1 font-bold flex justify-between">
                          <span>TOTAL ASET</span>
                          <span>Rp {totalAssets.toLocaleString()}</span>
                      </div>
                  </div>

                  {/* Liabilities */}
                  <div>
                      <h4 className="font-bold underline mb-2">KEWAJIBAN & EKUITAS</h4>
                      <div className="space-y-1">
                          <div className="flex justify-between border-b border-gray-100 py-1"><span>Hutang</span> <span>{accountsPayable.toLocaleString()}</span></div>
                          <div className="flex justify-between border-b border-gray-100 py-1"><span>Modal</span> <span>{capital.toLocaleString()}</span></div>
                          <div className="flex justify-between border-b border-gray-100 py-1"><span>Laba Ditahan</span> <span>{retainedEarnings.toLocaleString()}</span></div>
                      </div>
                      <div className="border-t border-black mt-2 pt-1 font-bold flex justify-between">
                          <span>TOTAL PASIVA</span>
                          <span>Rp {totalAssets.toLocaleString()}</span>
                      </div>
                  </div>
              </div>
          </div>
          
          <div className="mt-12 text-center text-xs italic text-gray-500">
              <p>Dokumen ini dihasilkan secara otomatis oleh sistem ERP. Tanda tangan tidak diperlukan.</p>
          </div>
      </div>
    );
};

const Finance: React.FC<FinanceProps> = ({ user }) => {
  const { transactions, receivables, expenses, addExpense, products, printerConfig, addSystemLog, debtPayments, divisions, confirm } = useStore();
  const [activeTab, setActiveTab] = useState<'daily' | 'pnl' | 'receivables' | 'reconcile' | 'expenses' | 'debt_history'>('daily');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
      date: new Date().toISOString().split('T')[0], amount: 0, category: 'Operasional', description: '', division: divisions[0] || 'DIVISI KANTOR PUSAT', proofImage: ''
  });
  const [fileName, setFileName] = useState('');

  const printerService = new PrinterService(printerConfig);

  // --- ROLE BASED DATA FILTERING ---
  const isCashier = user?.role === 'Cashier'; // Check Role.CASHIER string value
  
  const filteredTransactions = isCashier 
      ? transactions.filter(t => t.outletId === user?.outletId) 
      : transactions;

  const filteredExpenses = isCashier 
      ? expenses.filter(e => e.outletId === user?.outletId) 
      : expenses;

  const filteredReceivables = isCashier 
      ? receivables.filter(r => r.outletId === user?.outletId) 
      : receivables;

  // Daily Stats Logic
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const todaysTransactions = filteredTransactions.filter(t => new Date(t.date).toDateString() === new Date().toDateString());
  const dailyTotal = todaysTransactions.reduce((sum, t) => sum + t.total, 0);

  const handlePrintExpense = (exp: Expense) => {
      if (printerConfig.connection === PrinterConnection.BLUETOOTH) {
          const printData = {
              date: exp.date,
              expense: exp
          };
          printerService.print(printData);
      } else {
          setSelectedExpense(exp);
          setTimeout(() => {
              window.print();
          }, 500);
      }
  };

  // ... existing logic ...

  // P&L Logic
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
  
  // Calculate COGS based on actual product costPrice if available
  const costOfGoods = filteredTransactions.reduce((totalCOGS, t) => {
      const transactionCOGS = t.items.reduce((itemSum, item) => {
          // Use item.costPrice if available, else fallback to item.price * 0.65 (estimate)
          const itemCost = item.costPrice ?? (item.price * 0.65);
          return itemSum + (itemCost * item.qty);
      }, 0);
      return totalCOGS + transactionCOGS;
  }, 0);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - costOfGoods - totalExpenses;

  // Balance Sheet Logic (Mocked & Derived)
  const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalReceivables = filteredReceivables.filter(r => r.status !== 'Lunas').reduce((sum, r) => sum + r.amount, 0);
  
  // Cash Flow Calculation
  const capital = 200000000; // Mock Capital
  // Include all liquid payments (Tunai, QRIS, Debit, Transfer) + Down Payments from Credit Sales
  const cashSales = filteredTransactions.reduce((sum, t) => {
      if (t.paymentMethod === 'Piutang') {
          return sum + (t.downPayment || 0);
      }
      return sum + t.total;
  }, 0);
  const totalDebtPayments = debtPayments.reduce((sum, p) => sum + p.amount, 0);
  const cashOnHand = capital + cashSales + totalDebtPayments - totalExpenses;

  const totalAssets = cashOnHand + totalReceivables + inventoryValue;
  const accountsPayable = 45000000; // Mock AP
  const retainedEarnings = totalAssets - accountsPayable - capital;

  // --- PDF GENERATION LOGIC ---
  const generateFinancialPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header Standard
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.text("SUBARU DAGING SAPI", pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text("Ruko Jl. Tamin (Depan Pasar Tamin) Tanjungkarang Barat, Bandar Lampung", pageWidth / 2, 27, { align: 'center' });
    doc.text("Telp: 0812-3456-7890 | Email: ptsubarualammakmur@gmail.com", pageWidth / 2, 32, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(14, 38, pageWidth - 14, 38);
    doc.line(14, 39, pageWidth - 14, 39);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("LAPORAN KEUANGAN KOMPREHENSIF", pageWidth / 2, 50, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Periode Hingga: ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, 56, { align: 'center' });

    let finalY = 65;

    // 1. LABA RUGI (Income Statement)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("I. Laporan Laba Rugi (Income Statement)", 14, finalY);
    finalY += 5;

    autoTable(doc, {
        startY: finalY,
        head: [['Deskripsi', 'Nilai (IDR)']],
        body: [
            ['Total Pendapatan', totalRevenue.toLocaleString()],
            ['Harga Pokok Penjualan (HPP)', `(${costOfGoods.toLocaleString()})`],
            [{ content: 'Laba Kotor', styles: { fontStyle: 'bold' } }, { content: (totalRevenue - costOfGoods).toLocaleString(), styles: { fontStyle: 'bold' } }],
            ['Total Pengeluaran Operasional', `(${totalExpenses.toLocaleString()})`],
            [{ content: 'LABA BERSIH', styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }, { content: netProfit.toLocaleString(), styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }]
        ],
        theme: 'grid',
        headStyles: { fillColor: [50, 50, 50] },
        columnStyles: { 1: { halign: 'right' } }
    });

    // @ts-expect-error - jspdf-autotable adds lastAutoTable
    finalY = doc.lastAutoTable.finalY + 15;

    // 2. NERACA (Balance Sheet)
    doc.setFontSize(12);
    doc.text("II. Neraca Keuangan (Balance Sheet)", 14, finalY);
    finalY += 5;

    // Assets Table
    doc.setFontSize(10);
    doc.text("Aset (Aktiva)", 14, finalY + 5);
    autoTable(doc, {
        startY: finalY + 7,
        body: [
            ['Kas & Bank', cashOnHand.toLocaleString()],
            ['Piutang Usaha', totalReceivables.toLocaleString()],
            ['Persediaan Stok', inventoryValue.toLocaleString()],
            [{ content: 'TOTAL ASET', styles: { fontStyle: 'bold' } }, { content: totalAssets.toLocaleString(), styles: { fontStyle: 'bold' } }]
        ],
        theme: 'plain',
        columnStyles: { 1: { halign: 'right' } }
    });
    
    // @ts-expect-error - jspdf-autotable adds lastAutoTable
    const midY = doc.lastAutoTable.finalY + 5;

    // Liabilities Table
    doc.text("Kewajiban & Ekuitas (Pasiva)", 14, midY + 5);
    autoTable(doc, {
        startY: midY + 7,
        body: [
            ['Hutang Dagang', accountsPayable.toLocaleString()],
            ['Modal Disetor', capital.toLocaleString()],
            ['Laba Ditahan', retainedEarnings.toLocaleString()],
            [{ content: 'TOTAL PASIVA', styles: { fontStyle: 'bold' } }, { content: totalAssets.toLocaleString(), styles: { fontStyle: 'bold' } }]
        ],
        theme: 'plain',
        columnStyles: { 1: { halign: 'right' } }
    });

    // Footer
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.text("Dicetak otomatis oleh Sistem ERP Subaru Daging Sapi", 14, footerY);
    doc.text(`Halaman 1 dari 1`, pageWidth - 30, footerY);

    doc.save("Laporan_Keuangan_Subaru.pdf");
  };

  const handlePrintReport = () => {
    window.print();
  };

  const sendWhatsAppReminder = (rec: { invoiceId: string, customerName: string, amount: number, dueDate: string, phone: string }) => {
    const daysLate = getDaysUntilDue(rec.dueDate);
    const greeting = daysLate < 0 ? "Selamat Pagi/Siang," : "Halo,";
    const status = daysLate < 0 ? `*TELAT ${Math.abs(daysLate)} HARI*` : "akan segera jatuh tempo";
    
    const msg = `*REMINDER TAGIHAN - SUBARU DAGING*\n\n${greeting} ${rec.customerName},\n\nKami menginfokan Invoice *${rec.invoiceId}* senilai *Rp ${rec.amount.toLocaleString()}* statusnya ${status} (Jatuh Tempo: ${rec.dueDate}).\n\nMohon segera dilakukan pembayaran. Terima kasih.`;
    
    const url = `https://wa.me/${rec.phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleAutoReminders = () => {
    // Filter piutang yang jatuh tempo (H-3 sampai H+seterusnya) dan belum lunas
    // Serta memiliki nomor telepon valid
    const dueReceivables = receivables.filter(rec => {
        const days = getDaysUntilDue(rec.dueDate);
        return days <= 3 && rec.status !== 'Lunas' && rec.phone && rec.phone.length > 5;
    });
    
    if(dueReceivables.length === 0) {
        alert('Tidak ada tagihan jatuh tempo (dengan No. HP valid) untuk diingatkan saat ini.');
        return;
    }

    const confirmMsg = `Ditemukan ${dueReceivables.length} tagihan prioritas/jatuh tempo.\n\nSistem akan membuka WhatsApp Web untuk pelanggan berikut:\n\n${dueReceivables.map(r => "- " + r.customerName).join("\n")}\n\nPastikan 'Popup Blocker' dimatikan agar semua tab bisa terbuka. Lanjutkan?`;

    confirm({
      title: 'Kirim Pengingat Otomatis',
      message: confirmMsg,
      onConfirm: () => {
        // Loop dengan delay agar tidak dianggap spam/diblokir browser
        dueReceivables.forEach((rec, index) => {
            setTimeout(() => {
                sendWhatsAppReminder(rec);
            }, index * 1500); // Jeda 1.5 detik per pesan
        });
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setFileName(file.name);
          setNewExpense({ ...newExpense, proofImage: URL.createObjectURL(file) });
      }
  };

  const handleSaveExpense = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Enforce proof upload
      if (!newExpense.proofImage) {
          alert('Wajib upload bukti pengeluaran (Struk/Nota)! Tanpa bukti, pengeluaran dianggap tidak sah.');
          return;
      }

      const expenseData = {
          ...newExpense as Expense,
          id: `exp-${Date.now()}`,
          outletId: user?.outletId // Added outletId
      };
      addExpense(expenseData);

      if (user) {
          addSystemLog({
              id: `log-${Date.now()}`,
              userId: user.id,
              userName: user.name,
              role: user.role,
              action: 'ACTION',
              details: `Input Pengeluaran: ${expenseData.category} - Rp ${expenseData.amount.toLocaleString()} (${expenseData.division})`,
              timestamp: new Date().toISOString(),
              ip: '127.0.0.1',
              location: 'Finance',
              device: 'Web'
          });
      }

      // WhatsApp Integration
      const adminNumber = "6289649005383"; // Admin Retail Number
      const msg = `*LAPORAN PENGELUARAN*\n\n` +
                  `Tanggal: ${expenseData.date}\n` +
                  `Kategori: ${expenseData.category}\n` +
                  `Divisi: ${expenseData.division}\n` +
                  `Item: ${expenseData.description}\n` +
                  `Jumlah: Rp ${expenseData.amount.toLocaleString()}\n\n` +
                  `*Bukti foto telah diupload ke sistem.*`;
      
      const url = `https://wa.me/${adminNumber}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');

      setIsExpModalOpen(false);
      setFileName('');
      setNewExpense({
          date: new Date().toISOString().split('T')[0], amount: 0, category: 'Operasional', description: '', division: divisions[0] || 'DIVISI KANTOR PUSAT', proofImage: ''
      });
  };

  const handleSendExpenseWA = (exp: Expense) => {
      const adminNumber = "6289649005383";
      const msg = `*LAPORAN PENGELUARAN (RE-SEND)*\n\n` +
                  `Tanggal: ${exp.date}\n` +
                  `Kategori: ${exp.category}\n` +
                  `Divisi: ${exp.division}\n` +
                  `Item: ${exp.description}\n` +
                  `Jumlah: Rp ${exp.amount.toLocaleString()}\n\n` +
                  `*Bukti foto tersedia di sistem.*`;
      
      const url = `https://wa.me/${adminNumber}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
  };

  const getDaysUntilDue = (dueDate: string) => {
      const due = new Date(dueDate).getTime();
      // Use mock today for demo purposes
      const mockNow = new Date('2026-02-05').getTime(); 
      return Math.ceil((due - mockNow) / (1000 * 3600 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Portal for Print View */}
      {createPortal(<PrintableReport 
        totalRevenue={totalRevenue}
        costOfGoods={costOfGoods}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        cashOnHand={cashOnHand}
        totalReceivables={totalReceivables}
        inventoryValue={inventoryValue}
        totalAssets={totalAssets}
        accountsPayable={accountsPayable}
        capital={capital}
        retainedEarnings={retainedEarnings}
        paperSize={printerConfig.type}
      />, document.body)}
      {selectedExpense && createPortal(<PrintableExpenseSlip exp={selectedExpense} paperSize={printerConfig.type} />, document.body)}

      {/* Navigation Tabs - Swipeable on mobile */}
      <div className="flex gap-4 border-b border-white/10 pb-1 overflow-x-auto snap-x scrollbar-hide whitespace-nowrap">
        <button 
          onClick={() => setActiveTab('daily')}
          className={`snap-start px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'daily' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-400 hover:text-white'}`}
        >
          <Calendar size={16} /> Penjualan Harian
        </button>
        <button 
          onClick={() => setActiveTab('pnl')}
          className={`snap-start px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'pnl' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-400 hover:text-white'}`}
        >
          <TrendingUp size={16} /> Laba Rugi
        </button>
        <button 
            onClick={() => setActiveTab('expenses')}
            className={`snap-start px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'expenses' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-400 hover:text-white'}`}
        >
            <ArrowDownRight size={16} /> Pengeluaran
        </button>
        <button 
          onClick={() => setActiveTab('receivables')}
          className={`snap-start px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'receivables' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-400 hover:text-white'}`}
        >
          <Clock size={16} /> Piutang
        </button>
         <button 
          onClick={() => setActiveTab('reconcile')}
          className={`snap-start px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'reconcile' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-400 hover:text-white'}`}
        >
          <RefreshCw size={16} /> Rekonsiliasi
        </button>
        <button 
          onClick={() => setActiveTab('debt_history')}
          className={`snap-start px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'debt_history' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-400 hover:text-white'}`}
        >
          <FileText size={16} /> Riwayat Pembayaran
        </button>
      </div>

      {/* --- CONTENT TABS --- */}

      {activeTab === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 bg-[#252525] border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                 <h3 className="font-semibold text-white">Transaksi ({today})</h3>
                 <span className="text-xs bg-brand-red px-2 py-1 rounded text-white">{todaysTransactions.length} penjualan</span>
              </div>
              {/* Horizontal Scroll Table */}
              <div className="overflow-x-auto flex-1">
                 <table className="w-full text-left text-sm text-gray-400 min-w-[600px]">
                    <thead className="bg-black/20 text-gray-200">
                       <tr>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Waktu</th>
                          <th className="px-4 py-3">Metode</th>
                          <th className="px-4 py-3">Pelanggan</th>
                          <th className="px-4 py-3 text-right">Total</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {todaysTransactions.map(t => (
                          <tr key={t.id} className="hover:bg-white/5">
                             <td className="px-4 py-3 text-white">{t.id}</td>
                             <td className="px-4 py-3">{t.time || '00:00'}</td>
                             <td className="px-4 py-3">{t.paymentMethod}</td>
                             <td className="px-4 py-3">{t.customerName || '-'}</td>
                             <td className="px-4 py-3 text-right font-mono text-white">Rp {t.total.toLocaleString()}</td>
                          </tr>
                       ))}
                       {todaysTransactions.length === 0 && (
                          <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Tidak ada transaksi hari ini</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
           
           <div className="space-y-4">
              <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5">
                 <h4 className="text-gray-400 text-sm mb-1">Pendapatan Hari Ini</h4>
                 <p className="text-3xl font-bold text-brand-gold font-mono">Rp {dailyTotal.toLocaleString()}</p>
              </div>
               <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/5">
                 <h4 className="text-gray-400 text-sm mb-1">Metode Pembayaran</h4>
                 <div className="mt-4 space-y-2 text-center text-gray-500 text-xs py-4">
                    Data visualisasi belum tersedia
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'pnl' && (
         <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button 
                    onClick={generateFinancialPDF}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2a2a2a] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#333] border border-white/10 shadow-lg transition-transform active:scale-95"
                >
                    <Download size={16} /> Export PDF
                </button>
                <button 
                    onClick={handlePrintReport} 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-200 shadow-lg transition-transform active:scale-95"
                >
                    <Printer size={16} /> Cetak Laporan
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#1e1e1e] p-6 sm:p-8 rounded-xl border border-white/5 shadow-lg">
                <h3 className="text-xl font-serif font-bold text-white mb-6">Laporan Laba Rugi (YTD)</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-base sm:text-lg">
                        <span className="text-gray-300">Total Pendapatan</span>
                        <span className="text-white font-mono font-bold">Rp {totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm text-red-400">
                        <span>Harga Pokok Penjualan (HPP)</span>
                        <span className="font-mono">- Rp {costOfGoods.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-white/10 my-2"></div>
                    <div className="flex justify-between items-center font-bold text-white">
                        <span>Laba Kotor</span>
                        <span className="font-mono">Rp {(totalRevenue - costOfGoods).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm text-red-400">
                        <span>Biaya Operasional</span>
                        <span className="font-mono">- Rp {totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-double border-white/20 my-4 pt-4">
                        <div className="flex justify-between items-center text-xl sm:text-2xl font-bold">
                            <span className="text-brand-gold">Laba Bersih</span>
                            <span className={`font-mono ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            Rp {netProfit.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
                </div>
                
                <div className="bg-[#1e1e1e] p-8 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                <div className="w-48 h-48 rounded-full border-[16px] border-[#252525] relative flex items-center justify-center">
                    <PieChart size={64} className="text-brand-red opacity-50" />
                    <div className="absolute inset-0 rounded-full border-[16px] border-green-500 border-r-transparent border-b-transparent rotate-45"></div>
                </div>
                <div className="mt-8 text-center">
                    <p className="text-gray-400">Margin Keuntungan</p>
                    <p className="text-4xl font-bold text-white mt-2">{totalRevenue > 0 ? ((netProfit/totalRevenue)*100).toFixed(1) : 0}%</p>
                </div>
                </div>
            </div>
         </div>
      )}

      {/* EXPENSES TAB */}
      {activeTab === 'expenses' && (
          <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                 <div>
                    <h3 className="text-white font-medium">Daftar Pengeluaran</h3>
                    <p className="text-xs text-gray-400 mt-1">
                        Total Tercatat: <span className="text-red-400 font-bold font-mono">Rp {expenses.reduce((a,b)=>a+b.amount,0).toLocaleString()}</span>
                    </p>
                 </div>
                 <button onClick={() => setIsExpModalOpen(true)} className="w-full sm:w-auto bg-brand-red text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                     <Plus size={16} /> Tambah Pengeluaran
                 </button>
              </div>
              <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400 min-w-[700px]">
                        <thead className="bg-black/20 text-gray-200">
                            <tr>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Divisi</th>
                                <th className="px-6 py-4">Keterangan</th>
                                <th className="px-6 py-4">Bukti</th>
                                <th className="px-6 py-4 text-right">Jumlah</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {expenses.map(exp => (
                                <tr key={exp.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4">{exp.date}</td>
                                    <td className="px-6 py-4"><span className="bg-gray-800 px-2 py-1 rounded text-xs">{exp.category}</span></td>
                                    <td className="px-6 py-4">{exp.division}</td>
                                    <td className="px-6 py-4">{exp.description}</td>
                                    <td className="px-6 py-4">
                                        {exp.proofImage ? (
                                            <a href={exp.proofImage} target="_blank" rel="noreferrer" className="text-blue-400 underline cursor-pointer flex items-center gap-1">
                                                <FileText size={12}/> Lihat
                                            </a>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-white">Rp {exp.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handlePrintExpense(exp)} className="text-gray-400 hover:text-white hover:bg-white/10 p-1 rounded transition-colors" title="Cetak Bukti">
                                                <Printer size={16} />
                                            </button>
                                            <button onClick={() => handleSendExpenseWA(exp)} className="text-green-500 hover:text-green-400 hover:bg-green-500/10 p-1 rounded transition-colors" title="Kirim WA">
                                                <MessageCircle size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-[#151515] border-t-2 border-white/10 font-bold">
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-right text-white">TOTAL PENGELUARAN</td>
                                <td className="px-6 py-4 text-right font-mono text-brand-red">
                                    Rp {expenses.reduce((a,b)=>a+b.amount,0).toLocaleString()}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
              </div>
          </div>
      )}

      {activeTab === 'receivables' && (
         <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden">
             <div className="p-4 bg-[#252525] border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="font-semibold text-white">Daftar Piutang</h3>
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                    <button 
                        onClick={handleAutoReminders}
                        className="flex-1 sm:flex-none items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-lg active:scale-95 flex"
                    >
                        <Send size={14} /> Reminder Otomatis
                    </button>
                    <div className="text-right flex-1 sm:flex-none">
                        <p className="text-xs text-gray-500">Total Outstanding</p>
                        <p className="text-white font-bold">Rp {receivables.filter(r => r.status !== 'Lunas').reduce((a,b) => a + b.amount, 0).toLocaleString()}</p>
                    </div>
                </div>
             </div>
             
             {/* Horizontal Sliding Table */}
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-gray-400 min-w-[700px]">
                   <thead className="bg-black/20 text-gray-200">
                      <tr>
                         <th className="px-6 py-4">No. Invoice</th>
                         <th className="px-6 py-4">Pelanggan</th>
                         <th className="px-6 py-4">Jatuh Tempo</th>
                         <th className="px-6 py-4 text-center">Status</th>
                         <th className="px-6 py-4 text-right">Sisa Hutang</th>
                         <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {receivables.map(rec => {
                         const daysLeft = getDaysUntilDue(rec.dueDate);
                         const isWarning = daysLeft <= 3 && daysLeft >= -30 && rec.status !== 'Lunas';
                         
                         return (
                         <tr key={rec.id} className="hover:bg-white/5 group">
                            <td className="px-6 py-4 font-mono text-white text-xs">{rec.invoiceId}</td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-white">{rec.customerName}</div>
                                {rec.phone && (
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                        <Phone size={10} /> {rec.phone}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className={isWarning ? 'text-brand-red font-bold' : ''}>{rec.dueDate}</span>
                                    {isWarning && rec.status !== 'Lunas' && <span className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle size={10} /> {daysLeft < 0 ? `Telat ${Math.abs(daysLeft)} Hari` : `H-${daysLeft}`}</span>}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                               <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  rec.status === 'Lunas' ? 'bg-green-500/10 text-green-500' :
                                  rec.status === 'Jatuh Tempo' ? 'bg-red-500/10 text-red-500' :
                                  'bg-amber-500/10 text-amber-500'
                               }`}>
                                  {rec.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-white">Rp {rec.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">
                               {rec.status !== 'Lunas' && (
                                  <button 
                                    onClick={() => sendWhatsAppReminder(rec)}
                                    className="flex items-center gap-2 text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 font-bold ml-auto transition-colors"
                                  >
                                     <MessageCircle size={14} /> Tagih WA
                                  </button>
                               )}
                            </td>
                         </tr>
                      )})}
                   </tbody>
                 </table>
             </div>
         </div>
      )}

      {activeTab === 'reconcile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto lg:h-[600px]">
          {/* Internal System */}
          <div className="bg-[#1e1e1e] border border-white/5 rounded-xl flex flex-col overflow-hidden max-h-[500px] lg:max-h-full">
             <div className="p-4 bg-[#252525] border-b border-white/5 flex justify-between items-center">
                <h3 className="font-semibold text-white">Transaksi Sistem</h3>
                <span className="text-xs text-gray-500">Database Internal</span>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {transactions.map(trx => (
                  <div key={trx.id} className="p-3 bg-black/20 border border-white/5 rounded-lg flex justify-between items-center group hover:border-brand-red/30 cursor-pointer">
                    <div>
                      <p className="text-white font-medium">{trx.id}</p>
                      <p className="text-xs text-gray-500">{trx.date} • {trx.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-brand-gold font-mono font-bold">Rp {(trx.total || 0).toLocaleString()}</p>
                       <span className="text-[10px] bg-green-900/30 text-green-500 px-2 rounded-full"> tercatat</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Bank Mutations */}
          <div className="bg-[#1e1e1e] border border-white/5 rounded-xl flex flex-col overflow-hidden max-h-[500px] lg:max-h-full relative">
             <div className="p-4 bg-[#252525] border-b border-white/5 flex justify-between items-center">
                <h3 className="font-semibold text-white">Mutasi Bank</h3>
                <button className="text-xs bg-brand-red/20 text-brand-red px-2 py-1 rounded hover:bg-brand-red hover:text-white transition-colors">Sinkronisasi</button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {MOCK_BANK_MUTATIONS.map(mut => (
                  <div key={mut.id} className="p-3 bg-black/20 border border-white/5 rounded-lg flex justify-between items-center group hover:border-blue-500/30">
                    <div className="max-w-[60%]">
                      <p className="text-white text-sm line-clamp-1">{mut.description}</p>
                      <p className="text-xs text-gray-500">{mut.date} • {mut.type}</p>
                    </div>
                    <div className="text-right">
                       <p className={`font-mono font-bold ${mut.type === 'CR' ? 'text-green-400' : 'text-red-400'}`}>
                         {mut.type === 'CR' ? '+' : '-'} Rp {mut.amount.toLocaleString()}
                       </p>
                       {mut.matched ? (
                         <div className="flex items-center justify-end gap-1 text-[10px] text-green-500 mt-1">
                           <Check size={10} /> cocok
                         </div>
                       ) : (
                         <button className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded mt-1 hover:bg-blue-600 hover:text-white">Cocokkan</button>
                       )}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

       {activeTab === 'debt_history' && (
         <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden">
             <div className="p-4 bg-[#252525] border-b border-white/5 flex justify-between items-center">
                <h3 className="font-semibold text-white">Riwayat Pembayaran Hutang</h3>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Total Terkumpul</p>
                    <p className="text-white font-bold">Rp {debtPayments.reduce((a,b) => a + b.amount, 0).toLocaleString()}</p>
                </div>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-gray-400 min-w-[600px]">
                   <thead className="bg-black/20 text-gray-200">
                      <tr>
                         <th className="px-6 py-4">ID Pembayaran</th>
                         <th className="px-6 py-4">Tanggal</th>
                         <th className="px-6 py-4">Pelanggan</th>
                         <th className="px-6 py-4">Kolektor</th>
                         <th className="px-6 py-4 text-right">Jumlah</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {debtPayments.length > 0 ? debtPayments.map(pay => {
                         const rec = receivables.find(r => r.id === pay.receivableId);
                         return (
                         <tr key={pay.id} className="hover:bg-white/5">
                            <td className="px-6 py-4 font-mono text-xs">{pay.id}</td>
                            <td className="px-6 py-4">{pay.date}</td>
                            <td className="px-6 py-4 text-white font-medium">{rec ? rec.customerName : 'Unknown'}</td>
                            <td className="px-6 py-4 text-xs">{pay.collectorId || '-'}</td>
                            <td className="px-6 py-4 text-right font-mono text-green-400">+ Rp {pay.amount.toLocaleString()}</td>
                         </tr>
                      )}) : (
                         <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada riwayat pembayaran</td></tr>
                      )}
                   </tbody>
                 </table>
             </div>
         </div>
      )}

      {/* EXPENSE MODAL - Responsive Width */}
      {isExpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e1e] w-[95%] max-w-md rounded-xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525]">
                    <h3 className="text-xl font-bold text-white">Input Pengeluaran</h3>
                    <button onClick={() => setIsExpModalOpen(false)} className="text-gray-400 hover:text-white"><XIcon size={24} /></button>
                </div>
                <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Kategori</label>
                        <select 
                             className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                             value={newExpense.category}
                             onChange={e => setNewExpense({...newExpense, category: e.target.value as Expense['category']})}
                        >
                            <option>Operasional</option>
                            <option>Gaji</option>
                            <option>Pembelian</option>
                            <option>Lainnya</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Divisi</label>
                        <select 
                             className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                             value={newExpense.division}
                             onChange={e => setNewExpense({...newExpense, division: e.target.value as Division})}
                        >
                            {divisions.map(div => <option key={div} value={div}>{div}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Jumlah (Rp)</label>
                        <input 
                            type="number" required 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={newExpense.amount || ''} 
                            placeholder="0"
                            onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Tanggal</label>
                        <input 
                            type="date" required 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={newExpense.date}
                            onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Keterangan</label>
                        <input 
                            type="text" required 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={newExpense.description}
                            onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Upload Bukti (Foto)</label>
                        <div className="relative border border-dashed border-white/20 rounded-lg p-4 text-center cursor-pointer hover:bg-white/5 transition-colors">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="pointer-events-none">
                                <Upload className="mx-auto text-gray-500 mb-2" size={24} />
                                <p className="text-xs text-gray-400">{fileName ? fileName : 'Klik untuk upload gambar'}</p>
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-brand-red hover:bg-red-900 rounded-lg text-white font-medium flex items-center justify-center gap-2 mt-4">
                         <Save size={18} /> Simpan Pengeluaran
                    </button>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};

export default Finance;