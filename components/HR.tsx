import React, { useState, useEffect } from 'react';
import { MapPin, Clock, UserCheck, Search, Printer, Plus, X as XIcon, Save, Edit, Shield, Download, MessageCircle, MessageSquare, Megaphone, Bluetooth, Loader2, Send, Trash2, UserPlus, Key, AlertCircle } from 'lucide-react';
import { useStore } from '../StoreContext';
import { Employee, EmployeeFinancial, PrinterConnection, User as UserType, Role, ReceiptData } from '../types';
import { createPortal } from 'react-dom';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { PrinterService } from '../utils/printer';
import { getUsers, createUser, updateUser, deleteUser } from '../services/auth';

interface HRProps {
  user?: UserType;
}

const PrintableSlip = ({ slipData, paperSize }: { slipData: ReceiptData | null; paperSize: string }) => {
  const isThermal = paperSize === '58mm' || paperSize === '80mm';
  const isA4 = paperSize === 'A4';
  const isLegal = paperSize === 'Legal';
  const isFolio = paperSize === 'Folio';
  const widthClass = isThermal ? `w-[${paperSize}]` : (isLegal || isFolio) ? 'w-[216mm]' : isA4 ? 'w-[210mm]' : 'w-[80mm]';
  const containerClass = isThermal ? "thermal-receipt" : "a4-report";

  return (
    <div className={`print-only-container hidden print:block bg-white text-black p-4 mx-auto font-mono ${widthClass}`}>
      {slipData && (
          <div className={containerClass}>
             <div className="text-center font-bold mb-2">
                 <h2 className="text-sm">SUBARU DAGING</h2>
                 <p className="text-[10px]">SLIP GAJI MINGGUAN</p>
                 <p className="text-[8px] mt-1">{slipData.periodStart} - {slipData.periodEnd}</p>
             </div>
           
           <div className="dashed-line"></div>
           
           <div className="space-y-1 my-2">
               <div className="flex justify-between"><span>Nama</span><span className="font-bold">{slipData.emp.name}</span></div>
               <div className="flex justify-between"><span>ID</span><span>{slipData.emp.id}</span></div>
               <div className="flex justify-between"><span>Jabatan</span><span>{slipData.emp.position}</span></div>
               <div className="flex justify-between"><span>Divisi</span><span>{slipData.emp.division}</span></div>
           </div>
           
           <div className="dashed-line"></div>
           
           {/* Earnings */}
           <div className="font-bold my-1">PENERIMAAN</div>
           <div className="space-y-1">
               <div className="flex justify-between"><span>Gaji Pokok</span><span>{slipData.calc.base.toLocaleString()}</span></div>
               <div className="flex justify-between"><span>Lembur</span><span>{slipData.calc.lembur.toLocaleString()}</span></div>
               <div className="flex justify-between"><span>Bonus</span><span>{slipData.calc.bonus.toLocaleString()}</span></div>
               <div className="flex justify-between border-t border-black border-dotted pt-1 font-bold"><span>Total Kotor</span><span>{slipData.calc.gross.toLocaleString()}</span></div>
           </div>

           {/* Deductions */}
           <div className="font-bold my-1 mt-2">POTONGAN</div>
           <div className="space-y-1">
               <div className="flex justify-between"><span>Kasbon</span><span>({slipData.calc.kasbon.toLocaleString()})</span></div>
               <div className="flex justify-between"><span>Lainnya</span><span>({slipData.calc.potongan.toLocaleString()})</span></div>
               <div className="flex justify-between border-t border-black border-dotted pt-1 font-bold"><span>Total Potongan</span><span>({slipData.calc.totalDeductions.toLocaleString()})</span></div>
           </div>

           <div className="double-line"></div>

           <div className="flex justify-between text-sm font-bold my-2">
               <span>DITERIMA (THP)</span>
               <span>Rp {slipData.calc.net.toLocaleString()}</span>
           </div>
           
           <div className="mt-8 flex justify-between text-center text-[8px]">
               <div className="w-1/2">
                  <p>Disetujui,</p>
                  <br /><br />
                  <p className="border-t border-black w-2/3 mx-auto">HRD</p>
               </div>
               <div className="w-1/2">
                  <p>Diterima,</p>
                  <br /><br />
                  <p className="border-t border-black w-2/3 mx-auto">{slipData.emp.name}</p>
               </div>
           </div>
           <p className="text-center text-[8px] mt-4 italic">{new Date().toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

type HRTab = 'overview' | 'attendance' | 'payroll' | 'financials' | 'users' | 'monitor';

const HR: React.FC<HRProps> = ({ user }) => {
  const { 
    employees, 
    addEmployee,
    updateEmployee,
    deleteEmployee,
    employeeFinancials, 
    addEmployeeFinancial, 
    searchQuery, 
    printerConfig, 
    addSystemLog, 
    attendanceHistory, 
    appSettings, 
    outlets, 
    checkInEmployee, 
    users: allUsers, 
    approveUser,
    divisions,
    confirm
  } = useStore();
  const [activeTab, setActiveTab] = useState<HRTab>('overview');
  const [localSearch, setLocalSearch] = useState('');
  const [viewHistory, setViewHistory] = useState(false);
  
  // User Management State
  const [users, setUsers] = useState<UserType[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [userFormData, setUserFormData] = useState({
      name: '',
      username: '',
      password: '',
      role: Role.CASHIER,
      employeeId: '',
      outletId: ''
  });

  useEffect(() => {
      if (activeTab === 'users') {
          getUsers().then(setUsers);
      }
  }, [activeTab]);

  const handleOpenUserModal = (userToEdit?: UserType) => {
      if (userToEdit) {
          setEditingUser(userToEdit);
          setUserFormData({
              name: userToEdit.name,
              username: userToEdit.username,
              password: '', // Don't show password
              role: userToEdit.role,
              employeeId: userToEdit.employeeId || '',
              outletId: userToEdit.outletId || ''
          });
      } else {
          setEditingUser(null);
          setUserFormData({
              name: '',
              username: '',
              password: '',
              role: Role.CASHIER,
              employeeId: '',
              outletId: ''
          });
      }
      setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingUser) {
          const updated = await updateUser(editingUser.id, userFormData);
          if (updated) {
              alert('User updated successfully');
              setIsUserModalOpen(false);
              getUsers().then(setUsers);
          } else {
              alert('Failed to update user');
          }
      } else {
          if (!userFormData.password) return alert('Password is required for new users');
          const created = await createUser(userFormData as Parameters<typeof createUser>[0]);
          if (created) {
              alert('User created successfully');
              setIsUserModalOpen(false);
              getUsers().then(setUsers);
          } else {
              alert('Failed to create user');
          }
      }
  };

  const handleDeleteUser = async (id: string) => {
      confirm({
        title: 'Hapus User',
        message: 'Apakah Anda yakin ingin menghapus user ini?',
        onConfirm: async () => {
          const success = await deleteUser(id);
          if (success) {
              getUsers().then(setUsers);
          } else {
              alert('Failed to delete user');
          }
        }
      });
  };

  // Financial Modal
  const [isFinModalOpen, setIsFinModalOpen] = useState(false);
  const [newFinancial, setNewFinancial] = useState<Partial<EmployeeFinancial>>({
      type: 'Kasbon', amount: 0, description: '', date: new Date().toISOString().split('T')[0]
  });
  const [selectedEmpId, setSelectedEmpId] = useState('');

  // Edit Employee Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Broadcast Modal State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Printer State
  const [printerStatus, setPrinterStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [slipData, setSlipData] = useState<ReceiptData | null>(null);

  const printerService = new PrinterService(printerConfig);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
  };

  const fetchIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'Unknown';
    }
  };

  const handleCheckIn = async () => {
    if (!user || !user.employeeId) {
        alert("Anda tidak terdaftar sebagai karyawan.");
        return;
    }

    const emp = employees.find(e => e.id === user.employeeId);
    if (!emp) {
        alert("Data karyawan tidak ditemukan.");
        return;
    }

    const outlet = outlets.find(o => o.id === emp.outletId);
    if (!outlet || !outlet.coordinates) {
        alert("Lokasi kerja tidak terkonfigurasi untuk Anda.");
        return;
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(latitude, longitude, outlet.coordinates!.lat, outlet.coordinates!.lng);
        const currentIp = await fetchIp();
        
        // Radius check
        const isValidLocation = distance <= appSettings.attendanceRadius;
        // IP check (if deviceIp is set)
        const isValidIp = !emp.deviceIp || emp.deviceIp === currentIp;

        if (!isValidLocation) {
            alert(`Gagal Absensi: Anda berada di luar radius lokasi kerja (${Math.round(distance)}m dari ${outlet.name}).`);
            return;
        }

        if (!isValidIp) {
            alert(`Gagal Absensi: Perangkat Anda tidak terdaftar (${currentIp}). Gunakan HP Anda sendiri.`);
            return;
        }

        const isCheckingOut = emp.status === 'Hadir' || emp.status === 'Terlambat';
        const newStatus = isCheckingOut ? 'Pulang' : 'Hadir';
        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        checkInEmployee(emp.id, newStatus, time, `${latitude}, ${longitude}`, currentIp);

        addSystemLog({
            id: `log-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            role: user.role,
            action: 'ACTION',
            details: `${isCheckingOut ? 'Check-Out' : 'Check-In'} Berhasil: ${outlet.name} (Dist: ${Math.round(distance)}m, IP: ${currentIp})`,
            timestamp: new Date().toISOString(),
            ip: currentIp,
            location: `${latitude}, ${longitude}`,
            device: navigator.userAgent
        });

        alert(`${isCheckingOut ? 'Check-Out' : 'Check-In'} Berhasil di ${outlet.name}!`);
      }, (err) => {
        alert(`Gagal mendapatkan lokasi: ${err.message}`);
      });
    } else {
      alert("Geolocation tidak didukung oleh browser ini.");
    }
  };

  // Printer Connection Logic (Simulation)
  const handleConnectPrinter = () => {
      if (printerStatus === 'connected') {
          confirm({
              title: 'Putuskan Koneksi',
              message: 'Putuskan koneksi printer?',
              onConfirm: () => setPrinterStatus('disconnected')
          });
          return;
      }
      setPrinterStatus('connecting');
      // Simulate Bluetooth/USB handshake delay
      setTimeout(() => {
          setPrinterStatus('connected');
          alert('Printer Thermal Terhubung (Ready)');
      }, 1500);
  };

  // Combine Global Search with Local Search
  const effectiveSearch = searchQuery || localSearch;

  const getPositionRank = (pos: string) => {
    const p = pos.toUpperCase();
    if (p.includes('DIREKTUR UTAMA')) return 100;
    if (p.includes('DIREKTUR')) return 90;
    if (p.includes('MANAGER')) return 80;
    if (p.includes('KONSULTAN')) return 70;
    if (p.includes('KOORDINATOR')) return 60;
    if (p.includes('ADMIN')) return 50;
    if (p.includes('PIC')) return 40;
    if (p.includes('OFFICER')) return 30;
    if (p.includes('SALESMAN')) return 20;
    return 10;
  };

  const filteredEmployees = employees
    .filter(e => 
      e.name.toLowerCase().includes(effectiveSearch.toLowerCase()) || 
      e.division.toLowerCase().includes(effectiveSearch.toLowerCase())
    )
    .sort((a, b) => {
      // Primary sort by division
      const divCompare = a.division.localeCompare(b.division);
      if (divCompare !== 0) return divCompare;
      // Secondary sort by position rank (descending)
      const rankA = getPositionRank(a.position);
      const rankB = getPositionRank(b.position);
      if (rankA !== rankB) return rankB - rankA;
      // Tertiary sort by name
      return a.name.localeCompare(b.name);
    });

  const presentCount = employees.filter(e => e.status === 'Hadir').length;
  const lateCount = employees.filter(e => e.status === 'Terlambat').length;
  const absentCount = employees.filter(e => e.status === 'Absen').length;

  // --- WEEKLY PAYROLL LOGIC ---
  const calculateWeeklySalary = (emp: Employee) => {
      const financials = employeeFinancials.filter(f => f.employeeId === emp.id);
      
      const kasbon = financials.filter(f => f.type === 'Kasbon').reduce((sum, f) => sum + f.amount, 0);
      const lembur = financials.filter(f => f.type === 'Lembur').reduce((sum, f) => sum + f.amount, 0);
      const potongan = financials.filter(f => f.type === 'Potongan').reduce((sum, f) => sum + f.amount, 0);
      const bonus = financials.filter(f => f.type === 'Bonus').reduce((sum, f) => sum + f.amount, 0);
      
      // Base salary is now 0 by default as per request, to be input manually via "Gaji Pokok" financial entry or similar if needed.
      // Or we assume the "Gaji Pokok" is now manually handled by the admin outside or via a specific financial entry.
      // For now, we use emp.baseSalary which will be 0.
      
      const hourlyRate = 0; 

      const gross = emp.baseSalary + lembur + bonus; 
      const totalDeductions = kasbon + potongan;
      const net = gross - totalDeductions;

      return {
          base: emp.baseSalary, 
          daily: 0,
          hourly: hourlyRate,
          lembur,
          bonus,
          kasbon,
          potongan,
          gross,
          totalDeductions,
          net
      };
  };

  const handleSaveFinancial = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedEmpId) return alert('Pilih karyawan');
      
      addEmployeeFinancial({
          id: `fin-${Date.now()}`,
          employeeId: selectedEmpId,
          type: newFinancial.type as EmployeeFinancial['type'],
          amount: newFinancial.amount || 0,
          date: newFinancial.date || '',
          description: newFinancial.description || ''
      });
      
      if (user) {
          const empName = employees.find(e => e.id === selectedEmpId)?.name || selectedEmpId;
          addSystemLog({
              id: `log-${Date.now()}`,
              userId: user.id,
              userName: user.name,
              role: user.role,
              action: 'ACTION',
              details: `Input Keuangan Karyawan (${newFinancial.type}): ${empName} - Rp ${(newFinancial.amount || 0).toLocaleString()}`,
              timestamp: new Date().toISOString(),
              ip: '127.0.0.1',
              location: 'HR',
              device: 'Web'
          });
      }

      setIsFinModalOpen(false);
  };
  
  // State for Overtime Calculation
  const [otHours, setOtHours] = useState(0);
  const [otMinutes, setOtMinutes] = useState(0);

  const calculateAndSetAmount = (h: number, m: number, empId: string, type: string) => {
      if (type === 'Lembur' && empId) {
          const emp = employees.find(e => e.id === empId);
          if (emp) {
              const hourly = emp.baseSalary / 8;
              const totalHours = h + (m / 60);
              const amount = Math.round(hourly * totalHours);
              setNewFinancial(prev => ({ ...prev, amount }));
          }
      }
  };


  const handleEditEmployee = (emp: Employee) => {
      setEditingEmployee(emp);
      setIsEditModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
      e.preventDefault();
      if (editingEmployee) {
          const isNew = !employees.find(emp => emp.id === editingEmployee.id);
          
          if (isNew) {
              await addEmployee(editingEmployee);
          } else {
              await updateEmployee(editingEmployee);
          }
          
          if (user) {
              addSystemLog({
                  id: `log-${Date.now()}`,
                  userId: user.id,
                  userName: user.name,
                  role: user.role,
                  action: 'ACTION',
                  details: `${isNew ? 'Tambah' : 'Update'} Data Karyawan: ${editingEmployee.name}`,
                  timestamp: new Date().toISOString(),
                  ip: '127.0.0.1',
                  location: 'HR',
                  device: 'Web'
              });
          }

          setIsEditModalOpen(false);
      }
  };

  const handleDeleteEmployee = async (id: string) => {
      confirm({
        title: 'Hapus Karyawan',
        message: 'Apakah Anda yakin ingin menghapus data karyawan ini?',
        onConfirm: async () => {
          await deleteEmployee(id);
          setIsEditModalOpen(false);
        }
      });
  };

  // --- WHATSAPP FEATURES ---
  const handleChatWA = (emp: Employee) => {
      if (!emp.phone) {
          alert('Nomor telepon tidak tersedia.');
          return;
      }
      const msg = `Halo ${emp.name}, ada hal yang ingin saya diskusikan terkait pekerjaan.`;
      const url = `https://wa.me/${emp.phone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!broadcastMessage) return;
      
      confirm({
        title: 'Kirim Pengumuman',
        message: `Kirim pengumuman ini ke ${filteredEmployees.length} karyawan yang tampil di daftar?`,
        onConfirm: () => {
          alert(`Pesan Broadcast Terkirim:\n"${broadcastMessage}"\n\nTarget: ${filteredEmployees.length} Penerima.`);
          setIsBroadcastOpen(false);
          setBroadcastMessage('');
        }
      });
  };

  // --- PRINT & EXPORT LOGIC ---
  const handlePrintSlip = (emp: Employee) => {
      const calc = calculateWeeklySalary(emp);
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const periodStart = lastWeek.toLocaleDateString('id-ID');
      const periodEnd = today.toLocaleDateString('id-ID');

      if (printerConfig.connection === PrinterConnection.BLUETOOTH) {
          const printData = {
              title: 'SLIP GAJI MINGGUAN',
              subtitle: 'SUBARU DAGING',
              date: `${periodStart} - ${periodEnd}`,
              employee: {
                  name: emp.name,
                  id: emp.id,
                  position: emp.position,
                  division: emp.division
              },
              earnings: [
                  { label: 'Gaji Pokok', value: calc.base },
                  { label: 'Lembur', value: calc.lembur },
                  { label: 'Bonus', value: calc.bonus }
              ],
              deductions: [
                  { label: 'Kasbon', value: calc.kasbon },
                  { label: 'Lainnya', value: calc.potongan }
              ],
              total: calc.net
          };
          printerService.print(printData);
      } else {
          // System Print
          setSlipData({ 
              emp, 
              calc, 
              periodStart, 
              periodEnd 
          });
          
          // Allow DOM to update then print
          setTimeout(() => {
              window.print();
          }, 500);
      }
  };

  const handleSendSalaryWA = (emp: Employee) => {
      if (!emp.phone) {
          alert('Nomor telepon karyawan tidak tersedia!');
          return;
      }
      const calc = calculateWeeklySalary(emp);
      const msg = `*SLIP GAJI MINGGUAN SUBARU DAGING*\n\n` +
                  `Nama: ${emp.name}\n` +
                  `Jabatan: ${emp.position}\n` +
                  `Gaji Pokok: Rp ${calc.base.toLocaleString()}\n` +
                  `Lembur/Bonus: Rp ${(calc.lembur + calc.bonus).toLocaleString()}\n` +
                  `Potongan: Rp ${calc.totalDeductions.toLocaleString()}\n` +
                  `-------------------------\n` +
                  `*TOTAL DITERIMA: Rp ${calc.net.toLocaleString()}*`;
      
      const url = `https://wa.me/${emp.phone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
  };

  const handleExportSlipPDF = (emp: Employee) => {
      const calc = calculateWeeklySalary(emp);
      const today = new Date();
      const periodEnd = today.toLocaleDateString('id-ID');
      const periodStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID');

      // Create a narrow 80mm PDF for thermal compatibility
      const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [80, 200]
      });
      
      // Header
      doc.setFont("courier", "bold");
      doc.setFontSize(12);
      doc.text("SLIP GAJI - SUBARU", 40, 10, { align: "center" });
      
      doc.setFontSize(8);
      doc.setFont("courier", "normal");
      doc.text(`Periode: ${periodStart} - ${periodEnd}`, 40, 15, { align: "center" });
      
      doc.text("------------------------------------------------", 40, 19, { align: "center" });

      // Employee Info
      let y = 23;
      doc.text(`Nama: ${emp.name}`, 5, y);
      doc.text(`Div : ${emp.division}`, 5, y + 4);
      doc.text(`Jab : ${emp.position}`, 5, y + 8);
      
      y += 12;
      doc.text("------------------------------------------------", 40, y, { align: "center" });
      y += 4;

      // Earnings
      doc.setFont("courier", "bold");
      doc.text("PENERIMAAN", 5, y);
      y += 4;
      doc.setFont("courier", "normal");
      doc.text("Gaji Pokok", 5, y); doc.text(calc.base.toLocaleString(), 75, y, { align: "right" });
      y += 4;
      doc.text("Lembur", 5, y); doc.text(calc.lembur.toLocaleString(), 75, y, { align: "right" });
      y += 4;
      doc.text("Bonus", 5, y); doc.text(calc.bonus.toLocaleString(), 75, y, { align: "right" });
      y += 4;
      
      doc.text("------------------------------------------------", 40, y, { align: "center" });
      y += 4;

      // Deductions
      doc.setFont("courier", "bold");
      doc.text("POTONGAN", 5, y);
      y += 4;
      doc.setFont("courier", "normal");
      doc.text("Kasbon", 5, y); doc.text(`(${calc.kasbon.toLocaleString()})`, 75, y, { align: "right" });
      y += 4;
      doc.text("Lain-lain", 5, y); doc.text(`(${calc.potongan.toLocaleString()})`, 75, y, { align: "right" });
      y += 4;

      doc.text("================================================", 40, y, { align: "center" });
      y += 5;

      // Total
      doc.setFont("courier", "bold");
      doc.setFontSize(11);
      doc.text("TAKE HOME PAY:", 5, y);
      doc.text(`Rp ${calc.net.toLocaleString()}`, 75, y + 5, { align: "right" });
      
      y += 15;
      
      // Signatures
      doc.setFontSize(8);
      doc.setFont("courier", "normal");
      doc.text("Diterima,", 15, y, { align: "center" });
      doc.text("Disetujui,", 65, y, { align: "center" });
      
      y += 12;
      doc.text(`( ${emp.name} )`, 15, y, { align: "center" });
      doc.text("( HRD )", 65, y, { align: "center" });

      doc.save(`Slip_Gaji_${emp.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      {createPortal(<PrintableSlip slipData={slipData} paperSize={printerConfig.type} />, document.body)}

      {/* Header & CheckIn */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
         <div>
             <h2 className="text-2xl font-semibold text-white font-serif">Karyawan & HR</h2>
             <p className="text-gray-400 text-sm">{employees.length} Karyawan Aktif</p>
         </div>
         <button 
           onClick={handleCheckIn}
           className="hidden sm:flex bg-brand-red hover:bg-red-900 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-brand-red/20 transition-all items-center gap-2"
         >
           <MapPin size={18} /> GPS Check-In
         </button>
      </div>

      {/* Mobile Floating Action Button for Check-In */}
      <button 
        onClick={handleCheckIn}
        className="sm:hidden fixed bottom-20 right-4 z-50 bg-brand-red text-white p-4 rounded-full shadow-2xl shadow-brand-red/40 flex items-center justify-center animate-bounce-subtle"
        title="Check-In Absensi"
      >
        <MapPin size={24} />
      </button>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 shrink-0 overflow-x-auto">
        {['overview', 'attendance', 'payroll', 'financials', 'users', 'monitor'].map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab as HRTab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 ${
                    activeTab === tab ? 'border-brand-red text-white' : 'border-transparent text-gray-400 hover:text-white'
                }`}
            >
                {tab === 'financials' ? 'Catatan Keuangan' : 
                 tab === 'payroll' ? 'Gaji Mingguan' : 
                 tab === 'attendance' ? 'Kehadiran' : 
                 tab === 'users' ? 'Manajemen User' : 
                 tab === 'monitor' ? 'System Monitor' : tab}
            </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
            <div className="space-y-6">
                <div className="bg-[#1e1e1e] border border-white/5 rounded-xl p-6 shrink-0">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <UserCheck size={18} className="text-brand-gold" /> Ringkasan Kehadiran (Hari Ini)
                    </h3>
                    <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden flex">
                        <div className="bg-green-600 h-full" style={{ width: `${(presentCount/employees.length)*100}%` }}></div>
                        <div className="bg-amber-500 h-full" style={{ width: `${(lateCount/employees.length)*100}%` }}></div>
                        <div className="bg-red-600 h-full" style={{ width: `${(absentCount/employees.length)*100}%` }}></div>
                    </div>
                    <div className="flex gap-6 mt-3 text-xs text-gray-400">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-600"></div> Hadir ({presentCount})</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Terlambat ({lateCount})</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-600"></div> Absen ({absentCount})</div>
                    </div>
                </div>

                 {/* Division Breakdown */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {divisions.map(div => (
                        <div key={div} className="bg-[#1e1e1e] border border-white/5 p-4 rounded-xl">
                            <h4 className="text-white font-medium">{div}</h4>
                            <p className="text-2xl font-bold text-brand-red mt-2">{employees.filter(e => e.division === div).length} <span className="text-sm font-normal text-gray-400">Orang</span></p>
                        </div>
                    ))}
                 </div>
            </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
            <div>
                 <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                            type="text"
                            placeholder="Cari nama karyawan..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-red outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                setEditingEmployee({
                                    id: `emp-${Date.now()}`,
                                    name: '',
                                    division: outlets[0]?.name || 'RPH Subaru',
                                    position: '',
                                    status: 'Absen',
                                    checkInTime: '',
                                    checkOutTime: '',
                                    baseSalary: 0,
                                    hourlyRate: 0,
                                    isWarehousePIC: false,
                                    phone: '',
                                    outletId: outlets[0]?.id || 'main',
                                    deviceIp: ''
                                });
                                setIsEditModalOpen(true);
                            }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg"
                        >
                            <UserPlus size={18} /> Tambah Karyawan
                        </button>
                        <button 
                            onClick={() => setViewHistory(!viewHistory)}
                            className="bg-[#2a2a2a] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#333] transition-colors border border-white/10"
                        >
                            <Clock size={18} /> {viewHistory ? 'Lihat Status Hari Ini' : 'Lihat Riwayat'}
                        </button>
                        <button 
                            onClick={() => setIsBroadcastOpen(true)}
                            className="bg-brand-red text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-red-900 transition-colors shadow-lg"
                        >
                            <Megaphone size={18} /> Broadcast
                        </button>
                    </div>
                </div>

                {viewHistory ? (
                    <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400 min-w-[800px]">
                            <thead className="bg-black/20 text-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4">Nama</th>
                                    <th className="px-6 py-4">Masuk</th>
                                    <th className="px-6 py-4">Keluar</th>
                                    <th className="px-6 py-4">IP / Lokasi</th>
                                    <th className="px-6 py-4">Total Jam</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {attendanceHistory.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Belum ada data riwayat kehadiran.</td></tr>
                                ) : (
                                    attendanceHistory.map(record => {
                                        const emp = employees.find(e => e.id === record.employeeId);
                                        if (!emp?.name.toLowerCase().includes(localSearch.toLowerCase())) return null;
                                        return (
                                            <tr key={record.id} className="hover:bg-white/5">
                                                <td className="px-6 py-4">{record.date}</td>
                                                <td className="px-6 py-4 text-white">{emp?.name || 'Unknown'}</td>
                                                <td className="px-6 py-4">{record.checkInTime}</td>
                                                <td className="px-6 py-4">{record.checkOutTime || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-[10px] text-gray-500">
                                                        <p>IP: {record.checkInIp || '-'}</p>
                                                        <p className="truncate w-24" title={record.checkInLocation}>Loc: {record.checkInLocation || '-'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{record.totalHours ? `${record.totalHours} Jam` : '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        record.status === 'Hadir' ? 'bg-green-500/10 text-green-500' : 
                                                        record.status === 'Terlambat' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                    {outlets.map(outlet => {
                        const employeesInOutlet = filteredEmployees.filter(e => e.outletId === outlet.id);
                        if (employeesInOutlet.length === 0) return null;

                        return (
                            <div key={outlet.id} className="space-y-3">
                                <h4 className="text-brand-gold font-medium text-sm flex items-center gap-2 px-2">
                                    <MapPin size={14} /> {outlet.name} ({employeesInOutlet.length} Karyawan)
                                </h4>
                                <div className="space-y-2">
                                    {employeesInOutlet.map(emp => (
                                        <div key={emp.id} className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#1e1e1e] border border-white/5 rounded-lg hover:bg-white/[0.02] transition-colors gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg ${
                                                    emp.status === 'Hadir' ? 'bg-green-600' : emp.status === 'Terlambat' ? 'bg-amber-600' : 'bg-red-600'
                                                }`}>
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-white font-medium text-sm">{emp.name}</h4>
                                                        {emp.isWarehousePIC && (
                                                            <span className="bg-purple-900/50 text-purple-300 text-[10px] px-1.5 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
                                                                <Shield size={10} />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-500 text-xs">{emp.division} • {emp.position}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none border-white/5 pt-3 md:pt-0">
                                                <div className="flex flex-col md:items-end">
                                                    <span className={`text-xs font-bold ${
                                                        emp.status === 'Hadir' ? 'text-green-400' : emp.status === 'Terlambat' ? 'text-amber-400' : 'text-red-400'
                                                    }`}>
                                                        {emp.status}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                        <Clock size={10} /> {emp.checkInTime || '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleChatWA(emp)}
                                                        className="p-2 bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white rounded-lg transition-colors border border-green-600/30"
                                                        title="Chat WhatsApp"
                                                    >
                                                        <MessageSquare size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditEmployee(emp)} 
                                                        className="p-2 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                        title="Edit Data"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    </div>
                )}
            </div>
        )}

        {/* PAYROLL TAB */}
        {activeTab === 'payroll' && (
             <div className="space-y-4">
                 {/* Printer Connect Header */}
                 <div className="bg-[#1e1e1e] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-[#1e1e1e] to-[#252525]">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full shadow-inner ${printerStatus === 'connected' ? 'bg-green-500/20 text-green-500 shadow-green-500/20' : 'bg-red-500/20 text-red-500'}`}>
                            {printerStatus === 'connecting' ? <Loader2 size={24} className="animate-spin" /> : <Bluetooth size={24} />}
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                Koneksi Printer
                                {printerStatus === 'connected' && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>}
                            </h4>
                            <p className="text-xs text-gray-400">
                                {printerStatus === 'connected' ? 'Terhubung ke Printer Thermal (Siap Cetak)' : 'Bluetooth/USB Terputus. Klik untuk menghubungkan.'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleConnectPrinter}
                        className={`px-6 py-3 rounded-lg text-sm font-bold border transition-all shadow-lg flex items-center gap-2 ${
                            printerStatus === 'connected' 
                            ? 'bg-transparent text-red-400 border-red-500/30 hover:bg-red-500/10' 
                            : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:scale-105'
                        }`}
                    >
                        {printerStatus === 'connected' ? 'Putuskan Koneksi' : 'Hubungkan Printer'}
                    </button>
                 </div>

                 {/* Payroll Table */}
                 <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-[#121212] text-gray-200 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Nama Karyawan</th>
                                    <th className="px-6 py-4">Divisi</th>
                                    {/* <th className="px-6 py-4 text-right">Gaji Pokok</th> REMOVED AS PER REQUEST */}
                                    <th className="px-6 py-4 text-right">Lembur/Bonus</th>
                                    <th className="px-6 py-4 text-right">Potongan</th>
                                    <th className="px-6 py-4 text-right font-bold text-white">Total (THP)</th>
                                    <th className="px-6 py-4 text-center">Aksi (Cetak/Export)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredEmployees.map(emp => {
                                    const calc = calculateWeeklySalary(emp);
                                    return (
                                        <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-medium">
                                                {emp.name}
                                                {emp.isWarehousePIC && <span className="ml-2 text-[10px] bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">PIC</span>}
                                            </td>
                                            <td className="px-6 py-4 text-xs">{emp.division}</td>
                                            {/* <td className="px-6 py-4 text-right font-mono">Rp {calc.base.toLocaleString()}</td> REMOVED */}
                                            <td className="px-6 py-4 text-right text-green-500 font-mono">+ {(calc.lembur + calc.bonus).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right text-red-500 font-mono">- {calc.totalDeductions.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-bold text-brand-gold text-lg font-mono">Rp {calc.net.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => handlePrintSlip(emp)}
                                                        className={`p-2 rounded-lg transition-all shadow-md flex items-center gap-1 text-xs font-bold ${
                                                            printerStatus === 'connected' 
                                                            ? 'bg-brand-red text-white hover:bg-red-900 hover:scale-105' 
                                                            : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                                                        }`}
                                                        title={printerStatus === 'connected' ? "Cetak Struk Thermal" : "Hubungkan Printer Dahulu"}
                                                        disabled={printerStatus !== 'connected'}
                                                    >
                                                        <Printer size={16} /> Slip
                                                    </button>
                                                    <button 
                                                        onClick={() => handleExportSlipPDF(emp)}
                                                        className="bg-[#2a2a2a] hover:bg-[#333] border border-white/10 text-white p-2 rounded-lg transition-all shadow-md flex items-center gap-1 text-xs font-bold hover:scale-105" 
                                                        title="Download PDF (80mm)"
                                                    >
                                                        <Download size={16} /> PDF
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSendSalaryWA(emp)}
                                                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all shadow-md hover:scale-105" 
                                                        title="Kirim Info via WA"
                                                    >
                                                        <MessageCircle size={16} /> 
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                 </div>
             </div>
        )}

        {/* FINANCIALS TAB (Kasbon etc) */}
        {activeTab === 'financials' && (
            <div>
                <div className="flex justify-between mb-4">
                     <h3 className="text-white font-medium">Catatan Keuangan Karyawan</h3>
                     <button onClick={() => setIsFinModalOpen(true)} className="bg-brand-red text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg">
                         <Plus size={16} /> Input Kasbon/Lembur
                     </button>
                </div>
                <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400 min-w-[800px]">
                        <thead className="bg-black/20 text-gray-200">
                            <tr>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4">Karyawan</th>
                                <th className="px-6 py-4">Tipe</th>
                                <th className="px-6 py-4">Keterangan</th>
                                <th className="px-6 py-4 text-right">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {employeeFinancials.map(fin => {
                                const emp = employees.find(e => e.id === fin.employeeId);
                                return (
                                    <tr key={fin.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4">{fin.date}</td>
                                        <td className="px-6 py-4 text-white">{emp?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                fin.type === 'Kasbon' || fin.type === 'Potongan' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                                            }`}>
                                                {fin.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{fin.description}</td>
                                        <td className="px-6 py-4 text-right font-mono text-white">Rp {fin.amount.toLocaleString()}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-white font-medium flex items-center gap-2">
                        <UserCheck size={18} className="text-brand-gold" /> Daftar Pengguna Sistem
                    </h3>
                    <button 
                        onClick={() => handleOpenUserModal()}
                        className="bg-brand-red hover:bg-red-900 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-brand-red/20 transition-all flex items-center gap-2 text-sm"
                    >
                        <UserPlus size={16} /> Tambah User
                    </button>
                </div>

                <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400 min-w-[800px]">
                        <thead className="bg-black/20 text-gray-200 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-6 py-4">Username</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Karyawan Terkait</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4 text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                                            {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold">{u.name.charAt(0)}</div>}
                                        </div>
                                        {u.name}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{u.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs border ${
                                            u.role === Role.ADMIN ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                            u.role === Role.MANAGER ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            u.role === Role.DIRECTOR ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20' :
                                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        {u.employeeId ? (
                                            <span className="text-green-400 flex items-center gap-1">
                                                <UserCheck size={12} /> {employees.find(e => e.id === u.employeeId)?.name || u.employeeId}
                                            </span>
                                        ) : <span className="text-gray-600">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleOpenUserModal(u)}
                                                className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                                title="Hapus User"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        )}

        {/* SYSTEM MONITOR TAB */}
        {activeTab === 'monitor' && (
            <div className="space-y-6">
                <div className="bg-[#1e1e1e] border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-white/[0.02]">
                        <h3 className="text-white font-medium flex items-center gap-2">
                            <Shield size={18} className="text-brand-gold" />
                            Menunggu Persetujuan ({allUsers.filter(u => !u.isApproved).length})
                        </h3>
                    </div>
                    
                    <div className="divide-y divide-white/5">
                        {allUsers.filter(u => !u.isApproved).length === 0 ? (
                            <div className="p-12 text-center">
                                <UserCheck size={48} className="mx-auto text-gray-700 mb-4" />
                                <p className="text-gray-500">Tidak ada permintaan persetujuan saat ini.</p>
                            </div>
                        ) : (
                            allUsers.filter(u => !u.isApproved).map(u => (
                                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red font-bold">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{u.name}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                                <span>@{u.username}</span>
                                                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                                <span className="text-brand-gold uppercase tracking-wider">{u.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            confirm({
                                                title: 'Konfirmasi Persetujuan',
                                                message: `Setujui akses untuk ${u.name}?`,
                                                onConfirm: async () => {
                                                    await approveUser(u.id);
                                                    getUsers().then(setUsers);
                                                }
                                            });
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-emerald-900/20"
                                    >
                                        <UserCheck size={16} /> Setujui Akses
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-4 bg-amber-900/10 border border-amber-500/20 rounded-xl flex gap-3">
                    <AlertCircle className="text-amber-500 shrink-0" size={20} />
                    <p className="text-xs text-amber-200/70 leading-relaxed">
                        <strong className="text-amber-400">Penting:</strong> Hanya berikan persetujuan kepada staf yang Anda kenal. Setelah disetujui, user akan memiliki akses penuh sesuai dengan role yang diberikan.
                    </p>
                </div>
            </div>
        )}
      </div>

      {/* MODAL USER MANAGEMENT */}
      {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525]">
                    <h3 className="text-xl font-bold text-white">{editingUser ? 'Edit User' : 'Tambah User Baru'}</h3>
                    <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-white"><XIcon size={24} /></button>
                </div>
                <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nama Lengkap</label>
                        <input 
                            type="text" required 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={userFormData.name}
                            onChange={e => setUserFormData({...userFormData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Username (Login)</label>
                        <input 
                            type="text" required 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={userFormData.username}
                            onChange={e => setUserFormData({...userFormData, username: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password {editingUser && <span className="text-xs text-gray-500">(Kosongkan jika tidak diubah)</span>}</label>
                        <div className="relative">
                            <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input 
                                type="password" 
                                required={!editingUser}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 pl-10 text-white focus:border-brand-red outline-none"
                                value={userFormData.password}
                                onChange={e => setUserFormData({...userFormData, password: e.target.value})}
                                placeholder="******"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Avatar URL (Opsional)</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={userFormData.avatar || ''}
                            onChange={e => setUserFormData({...userFormData, avatar: e.target.value})}
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Role / Hak Akses</label>
                        <select 
                            required 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={userFormData.role}
                            onChange={e => setUserFormData({...userFormData, role: e.target.value as Role})}
                        >
                            {Object.values(Role).map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Hubungkan ke Karyawan (Opsional)</label>
                        <select 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={userFormData.employeeId}
                            onChange={e => setUserFormData({...userFormData, employeeId: e.target.value})}
                        >
                            <option value="">- Tidak Terhubung -</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.name} ({e.division})</option>
                            ))}
                        </select>
                    </div>
                    {userFormData.role === Role.CASHIER && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Outlet (Khusus Kasir)</label>
                            <select 
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                                value={userFormData.outletId}
                                onChange={e => setUserFormData({...userFormData, outletId: e.target.value})}
                            >
                                <option value="">- Pilih Outlet -</option>
                                {outlets.map(o => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        {editingUser && (
                            <button 
                                type="button"
                                onClick={() => {
                                    confirm({
                                        title: 'Hapus User',
                                        message: `Apakah Anda yakin ingin menghapus user ${editingUser.name}?`,
                                        onConfirm: () => {
                                            handleDeleteUser(editingUser.id);
                                            setIsUserModalOpen(false);
                                        }
                                    });
                                }}
                                className="flex-1 py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <Trash2 size={18} /> Hapus
                            </button>
                        )}
                        <button type="submit" className="flex-[2] py-3 bg-brand-red hover:bg-red-900 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors">
                             <Save size={18} /> {editingUser ? 'Update User' : 'Buat User Baru'}
                        </button>
                    </div>
                </form>
            </div>
          </div>
      )}

      {/* MODAL INPUT FINANCIAL */}
      {isFinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525]">
                    <h3 className="text-xl font-bold text-white">Input Kasbon / Lembur</h3>
                    <button onClick={() => setIsFinModalOpen(false)} className="text-gray-400 hover:text-white"><XIcon size={24} /></button>
                </div>
                <form onSubmit={handleSaveFinancial} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Karyawan</label>
                        <select 
                            required 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={selectedEmpId}
                            onChange={e => {
                                const val = e.target.value;
                                setSelectedEmpId(val);
                                calculateAndSetAmount(otHours, otMinutes, val, newFinancial.type);
                            }}
                        >
                            <option value="">Pilih Karyawan</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name} - {e.division}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Tipe</label>
                        <select 
                             required
                             className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                             value={newFinancial.type}
                             onChange={e => {
                                 const val = e.target.value as EmployeeFinancial['type'];
                                 setNewFinancial({...newFinancial, type: val});
                                 calculateAndSetAmount(otHours, otMinutes, selectedEmpId, val);
                             }}
                        >
                            <option value="Kasbon">Kasbon (Potongan)</option>
                            <option value="Potongan">Potongan Lain</option>
                            <option value="Lembur">Lembur (Tambahan)</option>
                            <option value="Bonus">Bonus</option>
                        </select>
                    </div>

                    {newFinancial.type === 'Lembur' && (
                        <div className="grid grid-cols-2 gap-4 bg-white/5 p-3 rounded-lg border border-white/10">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Jam Lembur</label>
                                <input 
                                    type="number" min="0"
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:border-brand-red outline-none"
                                    value={otHours}
                                    onChange={e => {
                                        const val = Number(e.target.value);
                                        setOtHours(val);
                                        calculateAndSetAmount(val, otMinutes, selectedEmpId, newFinancial.type);
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Menit Lembur</label>
                                <input 
                                    type="number" min="0" max="59"
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:border-brand-red outline-none"
                                    value={otMinutes}
                                    onChange={e => {
                                        const val = Number(e.target.value);
                                        setOtMinutes(val);
                                        calculateAndSetAmount(otHours, val, selectedEmpId, newFinancial.type);
                                    }}
                                />
                            </div>
                            <div className="col-span-2 text-xs text-gray-400 italic">
                                *Otomatis menghitung berdasarkan gaji harian / 8 jam.
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Jumlah (Rp)</label>
                        <input 
                            type="number" required 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={newFinancial.amount}
                            onChange={e => setNewFinancial({...newFinancial, amount: Number(e.target.value)})}
                            readOnly={newFinancial.type === 'Lembur'} // Read only if auto-calculated
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Tanggal</label>
                        <input 
                            type="date" required 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={newFinancial.date}
                            onChange={e => setNewFinancial({...newFinancial, date: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Keterangan</label>
                        <input 
                            type="text" required 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={newFinancial.description}
                            onChange={e => setNewFinancial({...newFinancial, description: e.target.value})}
                        />
                    </div>
                    <button type="submit" className="w-full py-3 bg-brand-red hover:bg-red-900 rounded-lg text-white font-medium flex items-center justify-center gap-2 mt-4">
                         <Save size={18} /> Simpan Data
                    </button>
                </form>
            </div>
          </div>
      )}

      {/* MODAL EDIT EMPLOYEE */}
      {isEditModalOpen && editingEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525]">
                    <h3 className="text-xl font-bold text-white">Edit Data Karyawan</h3>
                    <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white"><XIcon size={24} /></button>
                </div>
                <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nama Lengkap</label>
                        <input 
                            type="text" required 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={editingEmployee.name}
                            onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nomor WhatsApp</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={editingEmployee.phone || ''}
                            onChange={e => setEditingEmployee({...editingEmployee, phone: e.target.value})}
                            placeholder="628..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Jabatan</label>
                        <input 
                            type="text" required 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={editingEmployee.position}
                            onChange={e => setEditingEmployee({...editingEmployee, position: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Divisi</label>
                        <select 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={editingEmployee.division}
                            onChange={e => {
                                const div = e.target.value;
                                const outlet = outlets.find(o => o.name === div);
                                setEditingEmployee({
                                    ...editingEmployee, 
                                    division: div,
                                    outletId: outlet?.id || editingEmployee.outletId
                                });
                            }}
                        >
                            {divisions.map(div => (
                                <option key={div} value={div}>{div}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Honor Mingguan (Rp)</label>
                        <input 
                            type="number" required 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none"
                            value={editingEmployee.baseSalary}
                            onChange={e => setEditingEmployee({...editingEmployee, baseSalary: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Device IP (Untuk Absensi)</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-red outline-none font-mono text-sm"
                                value={editingEmployee.deviceIp || ''}
                                onChange={e => setEditingEmployee({...editingEmployee, deviceIp: e.target.value})}
                                placeholder="ex: 192.168.1.1"
                            />
                            <button 
                                type="button"
                                onClick={() => {
                                    fetch('https://api.ipify.org?format=json')
                                    .then(res => res.json())
                                    .then(data => setEditingEmployee({...editingEmployee, deviceIp: data.ip}))
                                    .catch(err => alert('Gagal mendapatkan IP: ' + err.message));
                                }}
                                className="bg-blue-600/20 text-blue-400 px-3 rounded-lg border border-blue-600/30 hover:bg-blue-600/30 text-xs whitespace-nowrap"
                            >
                                Get Current IP
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">IP perangkat yang diizinkan untuk check-in.</p>
                    </div>
                    
                    {editingEmployee.division === 'RPH Subaru' && (
                        <div className="flex items-center justify-between p-3 bg-purple-900/10 border border-purple-500/20 rounded-lg">
                            <div>
                                <p className="text-white font-medium text-sm flex items-center gap-2"><Shield size={14} className="text-purple-400"/> Warehouse PIC</p>
                                <p className="text-[10px] text-gray-400">Penanggung jawab stok gudang RPH.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={editingEmployee.isWarehousePIC || false}
                                    onChange={e => setEditingEmployee({...editingEmployee, isWarehousePIC: e.target.checked})}
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    )}

                    <div className="flex gap-3 mt-2">
                        {employees.find(emp => emp.id === editingEmployee.id) && (
                            <button 
                                type="button"
                                onClick={() => handleDeleteEmployee(editingEmployee.id)}
                                className="flex-1 py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <Trash2 size={18} /> Hapus
                            </button>
                        )}
                        <button type="submit" className="flex-[2] py-3 bg-brand-red hover:bg-red-900 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors">
                             <Save size={18} /> {employees.find(emp => emp.id === editingEmployee.id) ? 'Update Karyawan' : 'Tambah Karyawan'}
                        </button>
                    </div>
                </form>
            </div>
          </div>
      )}

      {/* MODAL BROADCAST WA */}
      {isBroadcastOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e1e] w-full max-w-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525]">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Megaphone size={20} className="text-green-500" /> Broadcast Pengumuman</h3>
                    <button onClick={() => setIsBroadcastOpen(false)} className="text-gray-400 hover:text-white"><XIcon size={24} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-400">
                        Kirim pesan ke seluruh karyawan yang sedang ditampilkan di daftar ({filteredEmployees.length} orang) via WhatsApp.
                    </p>
                    <textarea 
                        rows={6}
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Tulis pengumuman di sini..."
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                    ></textarea>
                    <button 
                        onClick={handleBroadcastSubmit}
                        disabled={!broadcastMessage}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} /> Kirim ke {filteredEmployees.length} Karyawan
                    </button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default HR;