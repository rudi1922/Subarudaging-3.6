import React, { useState } from 'react';
import { FileText, Printer, Download, FolderOpen, Search, Archive as ArchiveIcon, Package, Users, DollarSign, Calendar } from 'lucide-react';
import { useStore } from '../StoreContext';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createPortal } from 'react-dom';
import { Product, Employee } from '../types';

type DocType = 'Financial' | 'Inventory' | 'HR' | 'Sales' | 'Operational';

interface ArchiveDocument {
    id: string;
    title: string;
    type: DocType;
    date: string;
    size: string;
    description: string;
}

interface PrintData {
    title: string;
    type: DocType;
    content: {
        products: Product[];
        employees: Employee[];
    };
}

// --- PRINTABLE COMPONENT ---
const PrintableContent = ({ printData, paperSize }: { printData: PrintData | null; paperSize: string }) => {
    if (!printData) return null;
    
    const isA4 = paperSize === 'A4';
    const isLegal = paperSize === 'Legal';
    const isFolio = paperSize === 'Folio';
    const widthClass = (isLegal || isFolio) ? 'w-[216mm]' : isA4 ? 'w-[210mm]' : 'w-full max-w-4xl';

    return (
        <div className={`print-only-container hidden print:block bg-white text-black p-10 font-sans mx-auto a4-report ${widthClass}`}>
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase">Subaru Daging Sapi</h1>
                <h2 className="text-xl">{printData.title}</h2>
                <p className="text-sm text-gray-600">Dokumen Arsip Operasional</p>
                <p className="text-xs mt-2">Dicetak: {new Date().toLocaleString()}</p>
            </div>

            <div className="mb-8">
                {/* Simplified Render Logic based on type for printing */}
                <table className="w-full text-sm border-collapse border border-black">
                    <thead className="bg-gray-200">
                        <tr>
                            {printData.type === 'Inventory' ? (
                                <>
                                    <th className="border border-black p-2">Produk</th>
                                    <th className="border border-black p-2">Stok</th>
                                    <th className="border border-black p-2 text-right">Nilai</th>
                                </>
                            ) : printData.type === 'HR' ? (
                                <>
                                    <th className="border border-black p-2">Nama</th>
                                    <th className="border border-black p-2">Posisi</th>
                                    <th className="border border-black p-2 text-right">Gaji Base</th>
                                </>
                            ) : (
                                <>
                                    <th className="border border-black p-2">Item</th>
                                    <th className="border border-black p-2">Detail</th>
                                    <th className="border border-black p-2 text-right">Nilai</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Rendering only top 20 items for print preview simplicity */}
                        {printData.type === 'Inventory' && printData.content.products.slice(0,20).map((p: Product) => (
                            <tr key={p.id}>
                                <td className="border border-black p-2">{p.name}</td>
                                <td className="border border-black p-2">{p.stock} {p.unit}</td>
                                <td className="border border-black p-2 text-right">Rp {p.price.toLocaleString()}</td>
                            </tr>
                        ))}
                        {printData.type === 'HR' && printData.content.employees.map((e: Employee) => (
                            <tr key={e.id}>
                                <td className="border border-black p-2">{e.name}</td>
                                <td className="border border-black p-2">{e.position}</td>
                                <td className="border border-black p-2 text-right">Rp {e.baseSalary.toLocaleString()}</td>
                            </tr>
                        ))}
                        {/* Fallback for others */}
                        {(printData.type === 'Financial' || printData.type === 'Sales') && (
                            <tr>
                                <td colSpan={3} className="border border-black p-4 text-center">Silakan gunakan mode Export PDF untuk laporan keuangan lengkap.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between mt-12 pt-8 border-t border-gray-300 text-xs">
                <div className="text-center w-1/3">
                    <p>Disiapkan Oleh,</p>
                    <br/><br/>
                    <p className="font-bold border-t border-black pt-1 w-3/4 mx-auto">Admin</p>
                </div>
                <div className="text-center w-1/3">
                    <p>Diketahui Oleh,</p>
                    <br/><br/>
                    <p className="font-bold border-t border-black pt-1 w-3/4 mx-auto">Manager Ops</p>
                </div>
            </div>
        </div>
    );
};

const Archive: React.FC = () => {
    const { transactions, expenses, products, employees, receivables, cattleOrders, printerConfig } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<DocType | 'All'>('All');
    const [printData, setPrintData] = useState<PrintData | null>(null);

    // --- MOCK DOCUMENTS GENERATOR ---
    // In a real app, these would be files stored in a backend. 
    // Here, we dynamically generate "available reports" based on current data.
    const documents: ArchiveDocument[] = [
        { id: 'DOC-FIN-001', title: 'Laporan Laba Rugi (YTD)', type: 'Financial', date: new Date().toISOString().split('T')[0], size: '2.4 MB', description: 'Rekapitulasi pendapatan dan pengeluaran tahun berjalan.' },
        { id: 'DOC-INV-001', title: 'Laporan Stok Opname', type: 'Inventory', date: new Date().toISOString().split('T')[0], size: '1.1 MB', description: 'Status stok terkini dan nilai aset gudang.' },
        { id: 'DOC-HR-001', title: 'Rekap Gaji Karyawan', type: 'HR', date: new Date().toISOString().split('T')[0], size: '850 KB', description: 'Data payroll mingguan seluruh divisi.' },
        { id: 'DOC-SAL-001', title: 'Jurnal Transaksi Penjualan', type: 'Sales', date: new Date().toISOString().split('T')[0], size: '3.2 MB', description: 'Detail seluruh transaksi penjualan harian.' },
        { id: 'DOC-OPS-001', title: 'Laporan PO Sapi Hidup', type: 'Operational', date: new Date().toISOString().split('T')[0], size: '1.5 MB', description: 'Data logistik dan pemotongan sapi.' },
        { id: 'DOC-FIN-002', title: 'Daftar Piutang Pelanggan', type: 'Financial', date: new Date().toISOString().split('T')[0], size: '900 KB', description: 'Status tagihan outstanding dan jatuh tempo.' },
    ];

    const filteredDocs = documents.filter(doc => 
        (filterType === 'All' || doc.type === filterType) &&
        (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // --- PDF GENERATION LOGIC ---
    const generatePDF = (docType: DocType, title: string) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(18);
        doc.text("SUBARU DAGING SAPI - ARSIP DIGITAL", 14, 20);
        doc.setFontSize(12);
        doc.text(title, 14, 30);
        doc.setFontSize(10);
        doc.text(`Dicetak Oleh: Manager Operasional | Tanggal: ${new Date().toLocaleString('id-ID')}`, 14, 36);
        doc.line(14, 40, 196, 40);

        let bodyData: (string | number)[][] = [];
        let headData: string[] = [];

        if (docType === 'Financial') {
            if (title.includes('Piutang')) {
                headData = ['Invoice', 'Pelanggan', 'Jatuh Tempo', 'Status', 'Jumlah'];
                bodyData = receivables.map(r => [r.invoiceId, r.customerName, r.dueDate, r.status, `Rp ${r.amount.toLocaleString()}`]);
            } else {
                // P&L
                const revenue = transactions.reduce((a, b) => a + b.total, 0);
                const expenseTotal = expenses.reduce((a, b) => a + b.amount, 0);
                headData = ['Kategori', 'Nilai (IDR)'];
                bodyData = [
                    ['Total Pendapatan', revenue.toLocaleString()],
                    ['Total Pengeluaran', `(${expenseTotal.toLocaleString()})`],
                    ['Laba Bersih', (revenue - expenseTotal).toLocaleString()]
                ];
            }
        } else if (docType === 'Inventory') {
            headData = ['Kode', 'Produk', 'Kategori', 'Stok', 'Nilai Aset'];
            bodyData = products.map(p => [p.id.substring(0,6), p.name, p.category, `${p.stock} ${p.unit}`, `Rp ${(p.price * p.stock).toLocaleString()}`]);
        } else if (docType === 'HR') {
            headData = ['ID', 'Nama', 'Divisi', 'Jabatan', 'Gaji Pokok'];
            bodyData = employees.map(e => [e.id, e.name, e.division, e.position, `Rp ${e.baseSalary.toLocaleString()}`]);
        } else if (docType === 'Sales') {
            headData = ['ID Trx', 'Tgl', 'Pelanggan', 'Metode', 'Total'];
            bodyData = transactions.map(t => [t.id, t.date, t.customerName, t.paymentMethod, `Rp ${t.total.toLocaleString()}`]);
        } else if (docType === 'Operational') {
            headData = ['ID PO', 'Supplier', 'Jml Sapi', 'Tgl Potong', 'Hasil Daging'];
            bodyData = cattleOrders.map(c => [c.id, c.supplierName, c.quantity, c.slaughterDate.split('T')[0], `${c.totalCarcassWeight} Kg`]);
        }

        autoTable(doc, {
            head: [headData],
            body: bodyData,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [139, 0, 0] },
            styles: { fontSize: 8 }
        });

        doc.save(`${title.replace(/\s/g, '_')}.pdf`);
    };

    // --- PRINT LOGIC ---
    const handlePrint = (docType: DocType, title: string) => {
        setPrintData({ title, type: docType, content: { products, employees } });
        // Wait for portal to render then print
        setTimeout(() => {
            window.print();
            // Clear data after print dialog closes
            setTimeout(() => setPrintData(null), 1000);
        }, 500);
    };

    return (
        <div className="space-y-6 relative h-[calc(100vh-6rem)] flex flex-col">
            {createPortal(<PrintableContent printData={printData} paperSize={printerConfig.type} />, document.body)}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h2 className="text-2xl font-semibold text-white font-serif flex items-center gap-2">
                        <ArchiveIcon className="text-brand-gold" /> Arsip Digital
                    </h2>
                    <p className="text-gray-400 text-sm">Pusat penyimpanan laporan dan dokumen usaha.</p>
                </div>
                <div className="flex bg-[#1e1e1e] p-1 rounded-lg border border-white/5">
                    {['All', 'Financial', 'Inventory', 'HR', 'Operational'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type as DocType | 'All')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                filterType === type ? 'bg-brand-red text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {type === 'All' ? 'Semua' : type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Cari dokumen (judul, ID)..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-red outline-none"
                />
            </div>

            {/* Document Grid */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 pb-4">
                    {filteredDocs.map(doc => (
                        <div key={doc.id} className="bg-[#1e1e1e] border border-white/5 rounded-xl p-5 hover:border-brand-red/30 transition-all group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-3 rounded-lg ${
                                    doc.type === 'Financial' ? 'bg-green-500/10 text-green-500' :
                                    doc.type === 'Inventory' ? 'bg-blue-500/10 text-blue-500' :
                                    doc.type === 'HR' ? 'bg-purple-500/10 text-purple-500' :
                                    'bg-orange-500/10 text-orange-500'
                                }`}>
                                    {doc.type === 'Financial' ? <DollarSign size={24} /> :
                                     doc.type === 'Inventory' ? <Package size={24} /> :
                                     doc.type === 'HR' ? <Users size={24} /> : <FileText size={24} />}
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono bg-black/20 px-2 py-1 rounded">{doc.id}</span>
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-brand-gold transition-colors">{doc.title}</h3>
                                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{doc.description}</p>
                                
                                <div className="flex items-center gap-4 text-[10px] text-gray-500 mb-4 border-t border-white/5 pt-2">
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {doc.date}</span>
                                    <span className="flex items-center gap-1"><FolderOpen size={12}/> {doc.size}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <button 
                                    onClick={() => handlePrint(doc.type, doc.title)}
                                    className="flex items-center justify-center gap-2 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-xs font-bold border border-white/5"
                                >
                                    <Printer size={14} /> Cetak
                                </button>
                                <button 
                                    onClick={() => generatePDF(doc.type, doc.title)}
                                    className="flex items-center justify-center gap-2 py-2 bg-brand-red text-white rounded-lg hover:bg-red-900 transition-colors text-xs font-bold shadow-lg shadow-brand-red/10"
                                >
                                    <Download size={14} /> PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredDocs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <FolderOpen size={48} className="opacity-20 mb-2" />
                        <p>Tidak ada dokumen yang ditemukan.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Archive;