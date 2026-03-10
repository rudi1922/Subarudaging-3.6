import React, { useState, useMemo } from 'react';
import { useStore } from '../StoreContext';
import { 
    Search, Calendar, Printer, Download, 
    ArrowUpRight, ArrowDownRight, Beef, Users, 
    FileText, X as XIcon, Eye, 
    MapPin, Smartphone, ShieldCheck
} from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createPortal } from 'react-dom';
import { PrinterService } from '../utils/printer';
import { PrinterConnection, Transaction, CartItem } from '../types';

type ActivityType = 'Penjualan' | 'Pengeluaran' | 'Gaji/HR' | 'PO Sapi' | 'Aktivitas Akun';

interface LogEntry {
    id: string;
    date: string; // YYYY-MM-DD
    timestamp: number; // for sorting
    type: ActivityType;
    reference: string;
    description: string;
    amount: number;
    user?: string;
    status?: string;
    details?: Transaction | any;
    // New fields for System Activity
    location?: string;
    device?: string;
    ip?: string;
}

const PrintContent = ({ printMode, filterType, filteredLogs, selectedEntry, paperSize }: { printMode: 'list' | 'detail', filterType: ActivityType | 'Semua', filteredLogs: LogEntry[], selectedEntry: LogEntry | null, paperSize: string }) => {
    const isThermal = paperSize === '58mm' || paperSize === '80mm';
    const isA4 = paperSize === 'A4';
    const isLegal = paperSize === 'Legal';
    const isFolio = paperSize === 'Folio';
    const widthClass = (isLegal || isFolio) ? 'w-[216mm]' : isA4 ? 'w-[210mm]' : 'w-full max-w-4xl';

    if (printMode === 'list') {
        return (
            <div className={`print-only-container hidden print:block bg-white text-black p-8 mx-auto a4-report ${widthClass}`}>
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <h1 className="text-2xl font-bold uppercase">Laporan Aktivitas & Log</h1>
                    <p>Subaru Daging Sapi - {filterType}</p>
                    <p className="text-xs mt-1">Dicetak: {new Date().toLocaleString()}</p>
                </div>
                <table className="w-full text-xs border-collapse border border-black">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-black p-2">Tanggal</th>
                            <th className="border border-black p-2">Tipe</th>
                            <th className="border border-black p-2">Referensi</th>
                            <th className="border border-black p-2">Deskripsi</th>
                            <th className="border border-black p-2">Detail/Lokasi</th>
                            <th className="border border-black p-2 text-right">Nominal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id}>
                                <td className="border border-black p-1">{log.date}</td>
                                <td className="border border-black p-1">{log.type}</td>
                                <td className="border border-black p-1">{log.reference}</td>
                                <td className="border border-black p-1">{log.description}</td>
                                <td className="border border-black p-1">
                                    {log.type === 'Aktivitas Akun' ? log.location : '-'}
                                </td>
                                <td className={`border border-black p-1 text-right`}>
                                    {log.amount !== 0 ? `Rp ${Math.abs(log.amount).toLocaleString()}` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (printMode === 'detail' && selectedEntry && selectedEntry.type === 'Penjualan') {
        const transaction = selectedEntry.details;
        const items = transaction.items || transaction.details?.items || [];
        const detailWidthClass = isThermal ? `w-[${paperSize}]` : 'w-[80mm]';
        
        return (
            <div className={`print-only-container hidden print:block bg-white text-black p-4 mx-auto font-mono text-xs ${detailWidthClass}`}>
                 <div className="text-center mb-4">
                    <h2 className="font-bold text-sm">SUBARU DAGING SAPI</h2>
                    <p>Jl. Tamin No. 40, Bandar Lampung</p>
                 </div>
                 <div className="border-b border-black pb-2 mb-2">
                    <p>No: {transaction.id}</p>
                    <p>Tgl: {transaction.date}</p>
                    <p>Kasir: {selectedEntry.user || 'Admin'}</p>
                 </div>
                 <div className="mb-2">
                    {items.map((item: CartItem, idx: number) => (
                        <div key={idx} className="flex justify-between mb-1">
                            <span>{item.qty}x {item.name}</span>
                            <span>{(item.qty * item.price).toLocaleString()}</span>
                        </div>
                    ))}
                 </div>
                 <div className="border-t border-black pt-2 mb-4">
                    <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>Rp {transaction.total.toLocaleString()}</span>
                    </div>
                    {transaction.paymentMethod && (
                        <div className="flex justify-between text-[10px]">
                            <span>Bayar ({transaction.paymentMethod})</span>
                            <span>Rp {transaction.total.toLocaleString()}</span>
                        </div>
                    )}
                 </div>
                 <div className="text-center text-[10px]">
                    <p>Terima Kasih</p>
                    <p>Selamat Belanja Kembali</p>
                 </div>
            </div>
        );
    }

    return null;
};

const HistoryLog: React.FC = () => {
    const { transactions, expenses, employeeFinancials, cattleOrders, employees, systemLogs, printerConfig } = useStore();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<ActivityType | 'Semua'>('Semua');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);
    
    // State to determine what is being printed (List or Single Detail)
    const [printMode, setPrintMode] = useState<'list' | 'detail'>('list');

    // --- REPRINT & EXPORT RECEIPT ---
    const handleReprint = async () => {
        if (!selectedEntry || selectedEntry.type !== 'Penjualan') return;

        if (printerConfig.connection === PrinterConnection.SYSTEM) {
            setPrintMode('detail');
            setTimeout(() => {
                window.print();
            }, 500);
            return;
        }

        const transaction = selectedEntry.details;
        const printerService = new PrinterService(printerConfig);

        const receiptData = {
            transactionId: transaction.id,
            date: transaction.date,
            cashier: selectedEntry.user,
            items: transaction.items,
            subtotal: transaction.subtotal,
            shippingCost: transaction.shippingCost,
            isDelivery: transaction.isDelivery,
            total: transaction.total,
            paymentMethod: transaction.paymentMethod
        };

        await printerService.print(receiptData);
    };

    const handleExportReceiptPDF = () => {
        if (!selectedEntry || selectedEntry.type !== 'Penjualan') return;
        
        const transaction = selectedEntry.details;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 200]
        });

        doc.setFontSize(10);
        doc.text('SUBARU DAGING SAPI', 40, 10, { align: 'center' });
        doc.setFontSize(8);
        doc.text('Jl. Tamin No. 40, Bandar Lampung', 40, 15, { align: 'center' });
        
        doc.text(`No: ${transaction.id}`, 5, 25);
        doc.text(`Tgl: ${transaction.date}`, 5, 30);
        doc.text(`Kasir: ${selectedEntry.user || 'Admin'}`, 5, 35);
        
        let y = 45;
        doc.line(5, y-2, 75, y-2);

        transaction.items.forEach((item: CartItem) => {
            doc.text(`${item.name}`, 5, y);
            y += 4;
            const line = `${item.qty} x ${item.price.toLocaleString()}`;
            doc.text(line, 5, y);
            const total = item.qty * item.price;
            doc.text(`${total.toLocaleString()}`, 75, y, { align: 'right' });
            y += 6;
        });
        
        doc.line(5, y, 75, y);
        y += 5;
        
        if (transaction.isDelivery && transaction.shippingCost > 0) {
             const sub = transaction.subtotal || (transaction.total - transaction.shippingCost);
             doc.text(`Subtotal: Rp ${sub.toLocaleString()}`, 75, y, { align: 'right' });
             y += 4;
             doc.text(`Ongkir: Rp ${transaction.shippingCost.toLocaleString()}`, 75, y, { align: 'right' });
             y += 4;
        }

        doc.setFontSize(10);
        doc.text(`Total: Rp ${transaction.total.toLocaleString()}`, 75, y, { align: 'right' });
        
        if (transaction.paymentMethod) {
            y += 5;
            doc.setFontSize(8);
            doc.text(`Bayar (${transaction.paymentMethod}): Rp ${transaction.total.toLocaleString()}`, 75, y, { align: 'right' });
        }

        y += 10;
        doc.text('Terima Kasih', 40, y, { align: 'center' });
        
        doc.save(`Struk_${transaction.id}.pdf`);
    };

    // --- DATA AGGREGATION ---
    const allActivities: LogEntry[] = useMemo(() => {
        const logs: LogEntry[] = [];

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
                amount: -e.amount, // Negative for expense
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

    // --- FILTERING ---
    const filteredLogs = allActivities.filter(log => {
        const matchesSearch = 
            log.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
            log.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === 'Semua' || log.type === filterType;
        
        let matchesDate = true;
        if (startDate) matchesDate = matchesDate && log.date >= startDate;
        if (endDate) matchesDate = matchesDate && log.date <= endDate;

        return matchesSearch && matchesType && matchesDate;
    });

    // --- EXPORT PDF (LIST) ---
    const handleExportListPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        
        // Header
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("LAPORAN AKTIVITAS USAHA - SUBARU DAGING SAPI", 14, 15);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Periode: ${startDate || 'Awal'} s/d ${endDate || 'Sekarang'}`, 14, 22);
        doc.text(`Filter: ${filterType}`, 14, 27);
        doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 280, 15, { align: 'right' });

        const tableBody = filteredLogs.map(log => [
            log.date,
            new Date(log.timestamp).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}),
            log.type,
            log.reference,
            log.description,
            log.type === 'Aktivitas Akun' ? (log.location || '-') : (log.amount > 0 ? 'Masuk' : log.amount < 0 ? 'Keluar' : '-'),
            log.type === 'Aktivitas Akun' ? '-' : (log.amount !== 0 ? `Rp ${Math.abs(log.amount).toLocaleString('id-ID')}` : '-')
        ]);

        autoTable(doc, {
            startY: 35,
            head: [['Tanggal', 'Jam', 'Tipe', 'Ref ID', 'Deskripsi', 'Ket/Lokasi', 'Nominal']],
            body: tableBody,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [139, 0, 0], textColor: 255, fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 22 },
                1: { cellWidth: 15 },
                2: { cellWidth: 25 },
                3: { cellWidth: 35 },
                4: { cellWidth: 'auto' },
                5: { cellWidth: 25 },
                6: { cellWidth: 35, halign: 'right' },
            },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        doc.save(`Laporan_Aktivitas_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // --- RENDER ICONS ---
    const getTypeIcon = (type: ActivityType) => {
        switch (type) {
            case 'Penjualan': return <ArrowDownRight className="text-green-500" size={18} />;
            case 'Pengeluaran': return <ArrowUpRight className="text-red-500" size={18} />;
            case 'Gaji/HR': return <Users className="text-blue-400" size={18} />;
            case 'PO Sapi': return <Beef className="text-brand-gold" size={18} />;
            case 'Aktivitas Akun': return <ShieldCheck className="text-purple-400" size={18} />;
            default: return <FileText size={18} />;
        }
    };

    const handlePrintList = () => {
        setPrintMode('list');
        setTimeout(() => window.print(), 500);
    };



    return (
        <div className="space-y-6 relative h-[calc(100vh-6rem)] flex flex-col">
            {createPortal(<PrintContent printMode={printMode} filterType={filterType} filteredLogs={filteredLogs} selectedEntry={selectedEntry} paperSize={printerConfig.type} />, document.body)}

            {/* Header Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
                <div>
                    <h2 className="text-2xl font-semibold text-white font-serif">History & Log Aktivitas</h2>
                    <p className="text-gray-400 text-sm">Rekam jejak transaksi dan aktivitas keamanan akun.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handlePrintList}
                        className="bg-white text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-lg text-sm"
                    >
                        <Printer size={16} /> Cetak Log
                    </button>
                    <button 
                        onClick={handleExportListPDF}
                        className="bg-brand-red text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-900 transition-colors shadow-lg text-sm"
                    >
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#1e1e1e] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center shrink-0">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="Cari ID, Nama User, atau Deskripsi..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-brand-red outline-none"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value as ActivityType | 'Semua')}
                        className="bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-red outline-none"
                    >
                        <option value="Semua">Semua Tipe</option>
                        <option value="Aktivitas Akun">Login & Aktivitas Akun</option>
                        <option value="Penjualan">Penjualan</option>
                        <option value="Pengeluaran">Pengeluaran</option>
                        <option value="Gaji/HR">Gaji & HR</option>
                        <option value="PO Sapi">PO Sapi</option>
                    </select>
                    <div className="flex items-center gap-2 bg-[#121212] border border-white/10 rounded-lg px-2">
                        <Calendar size={14} className="text-gray-500" />
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-white text-sm py-2 focus:outline-none w-28" 
                        />
                        <span className="text-gray-500">-</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-white text-sm py-2 focus:outline-none w-28" 
                        />
                    </div>
                </div>
            </div>

            {/* Timeline / Table */}
            <div className="flex-1 bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto overflow-y-auto flex-1">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#151515] text-gray-200 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">Tipe</th>
                                <th className="px-6 py-4">Ref / Akun</th>
                                <th className="px-6 py-4">Deskripsi / Aktivitas</th>
                                <th className="px-6 py-4 text-center">Info Teknis</th>
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
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-full bg-white/5 ${
                                                log.type === 'Penjualan' ? 'text-green-500' :
                                                log.type === 'Pengeluaran' ? 'text-red-500' :
                                                log.type === 'PO Sapi' ? 'text-brand-gold' :
                                                log.type === 'Aktivitas Akun' ? 'text-purple-400' : 'text-blue-400'
                                            }`}>
                                                {getTypeIcon(log.type)}
                                            </div>
                                            <span className="text-white">{log.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.type === 'Aktivitas Akun' ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs bg-purple-900/30 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20">{log.reference}</span>
                                            </div>
                                        ) : (
                                            <span className="font-mono text-xs">{log.reference}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="line-clamp-1 text-white">{log.description}</p>
                                        {log.amount !== 0 && (
                                            <span className={`text-[10px] font-mono ${log.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {log.amount > 0 ? '+' : ''} Rp {Math.abs(log.amount).toLocaleString()}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {log.type === 'Aktivitas Akun' && log.location ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <a 
                                                    href={`https://www.google.com/maps/search/?api=1&query=${log.location}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 bg-blue-900/20 px-2 py-1 rounded border border-blue-500/30"
                                                >
                                                    <MapPin size={10} /> {log.location.substring(0, 15)}...
                                                </a>
                                                {log.device && (
                                                    <span className="text-[9px] text-gray-500 flex items-center gap-1">
                                                        <Smartphone size={8} /> {log.device.split('(')[0].substring(0, 15)}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-600 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => setSelectedEntry(log)}
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

            {/* DETAIL MODAL */}
            {selectedEntry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1e1e1e] w-full max-w-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525]">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                {getTypeIcon(selectedEntry.type)} Detail {selectedEntry.type}
                            </h3>
                            <button onClick={() => setSelectedEntry(null)} className="text-gray-400 hover:text-white"><XIcon size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Tanggal</p>
                                    <p className="text-white font-medium">{selectedEntry.date} {new Date(selectedEntry.timestamp).toLocaleTimeString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Referensi / Akun</p>
                                    <p className="text-brand-gold font-mono">{selectedEntry.reference}</p>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Deskripsi</p>
                                <p className="text-white bg-black/20 p-3 rounded-lg border border-white/5">{selectedEntry.description}</p>
                            </div>

                            {/* --- SYSTEM LOG SPECIFIC DETAILS --- */}
                            {selectedEntry.type === 'Aktivitas Akun' && (
                                <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3 space-y-2 text-sm">
                                    <div className="flex justify-between border-b border-blue-500/20 pb-2">
                                        <span className="text-blue-300">Geo Lokasi</span>
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${selectedEntry.location}`} target="_blank" rel="noreferrer" className="text-blue-400 underline flex items-center gap-1">
                                            <MapPin size={12}/> {selectedEntry.location}
                                        </a>
                                    </div>
                                    <div className="flex justify-between border-b border-blue-500/20 pb-2">
                                        <span className="text-blue-300">IP Address</span>
                                        <span className="text-white font-mono">{selectedEntry.ip}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-300">Perangkat</span>
                                        <span className="text-white text-xs max-w-[200px] text-right truncate">{selectedEntry.device}</span>
                                    </div>
                                </div>
                            )}

                            {selectedEntry.type === 'Penjualan' && (
                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-xs text-gray-400 mb-2 border-b border-white/5 pb-1">Item Penjualan</p>
                                    <ul className="space-y-1">
                                        {selectedEntry.details.items?.map((item: CartItem, idx: number) => (
                                            <li key={idx} className="flex justify-between text-sm text-gray-300">
                                                <span>{item.qty}x {item.name}</span>
                                                <span>Rp {(item.price * item.qty).toLocaleString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedEntry.amount !== 0 && (
                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                    <span className="text-gray-400">Total Nominal</span>
                                    <span className={`text-xl font-bold font-mono ${selectedEntry.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {selectedEntry.amount !== 0 ? `Rp ${Math.abs(selectedEntry.amount).toLocaleString()}` : '-'}
                                    </span>
                                </div>
                            )}

                            {/* --- ACTION BUTTONS FOR TRANSACTION --- */}
                            {selectedEntry.type === 'Penjualan' && (
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                                    <button 
                                        onClick={handleReprint}
                                        className="py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Printer size={16} /> Cetak Struk
                                    </button>
                                    <button 
                                        onClick={handleExportReceiptPDF}
                                        className="py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Download size={16} /> Export PDF
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 bg-black/20 text-center flex gap-3">
                            <button onClick={() => setSelectedEntry(null)} className="flex-1 py-2 bg-gray-700 text-white font-bold rounded text-sm">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryLog;