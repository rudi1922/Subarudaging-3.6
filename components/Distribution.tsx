import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  User, 
  Calendar, 
  Package, 
  Map as MapIcon,
  MoreVertical,
  Edit2,
  Trash2,
  RefreshCw,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../StoreContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { User as UserType, Vehicle as VehicleType, Delivery as DeliveryType } from '../types';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for couriers
const courierIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #8B0000; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; items-center; justify-content: center; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

interface DistributionProps {
  user: UserType;
}

const Distribution: React.FC<DistributionProps> = ({ user }) => {
  const { 
    deliveries, 
    vehicles, 
    courierLocations, 
    users,
    outlets,
    addVehicle,
    addDelivery,
    transactions,
    customers
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'deliveries' | 'tracking'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddDeliveryModal, setShowAddDeliveryModal] = useState(false);

  const [newVehicle, setNewVehicle] = useState<Partial<VehicleType>>({
    name: '',
    plateNumber: '',
    type: 'Pickup',
    status: 'Available',
    capacity: 0,
    lastMaintenance: new Date().toISOString().split('T')[0]
  });

  const [newDelivery, setNewDelivery] = useState<Partial<DeliveryType>>({
    transactionId: '',
    vehicleId: '',
    driverId: '',
    status: 'Pending',
    notes: '',
    estimatedArrival: ''
  });

  const handleSubmitVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.plateNumber) return;

    const vehicle: VehicleType = {
      id: `v-${Date.now()}`,
      name: newVehicle.name as string,
      plateNumber: newVehicle.plateNumber as string,
      type: newVehicle.type as VehicleType['type'],
      status: newVehicle.status as VehicleType['status'],
      capacity: Number(newVehicle.capacity) || 0,
      lastMaintenance: newVehicle.lastMaintenance as string
    };

    addVehicle(vehicle);
    setShowAddVehicleModal(false);
    setNewVehicle({
      name: '',
      plateNumber: '',
      type: 'Pickup',
      status: 'Available',
      capacity: 0,
      lastMaintenance: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmitDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDelivery.transactionId || !newDelivery.vehicleId || !newDelivery.driverId) return;

    const transaction = transactions.find(t => t.id === newDelivery.transactionId);
    const customer = customers.find(c => c.id === transaction?.customerId);

    const delivery: DeliveryType = {
      id: `DEL-${Date.now()}`,
      transactionId: newDelivery.transactionId as string,
      customerName: transaction?.customerName || 'Unknown',
      address: customer?.address || transaction?.customerId || 'N/A',
      status: newDelivery.status as DeliveryType['status'],
      driverId: newDelivery.driverId as string,
      vehicleId: newDelivery.vehicleId as string,
      notes: newDelivery.notes as string,
      estimatedArrival: newDelivery.estimatedArrival as string
    };

    addDelivery(delivery);
    setShowAddDeliveryModal(false);
    setNewDelivery({
      transactionId: '',
      vehicleId: '',
      driverId: '',
      status: 'Pending',
      notes: '',
      estimatedArrival: ''
    });
  };

  // Stats
  const stats = useMemo(() => {
    const active = deliveries.filter(d => d.status === 'In Transit').length;
    const completed = deliveries.filter(d => d.status === 'Delivered').length;
    const pending = deliveries.filter(d => d.status === 'Pending').length;
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;

    return { active, completed, pending, totalVehicles, availableVehicles };
  }, [deliveries, vehicles]);

  const filteredDeliveries = deliveries.filter(d => 
    d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stable mock positions for outlets to satisfy linter (avoiding Math.random in render)
  const outletPositions = useMemo(() => {
    return outlets.map((outlet, index) => ({
      ...outlet,
      lat: -5.4 + (index * 0.02),
      lng: 105.2 + (index * 0.02)
    }));
  }, [outlets]);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Distribusi Armada</h1>
          <p className="text-white/60">Manajemen pengiriman, armada, dan pelacakan kurir real-time.</p>
          <p className="text-xs text-white/20 mt-1">Logged in as: {user.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'fleet' && (
            <button 
              onClick={() => setShowAddVehicleModal(true)}
              className="flex items-center gap-2 bg-[#8B0000] hover:bg-[#a00000] text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-[#8B0000]/20"
            >
              <Plus size={20} />
              <span>Tambah Armada</span>
            </button>
          )}
          {activeTab === 'deliveries' && (
            <button 
              onClick={() => setShowAddDeliveryModal(true)}
              className="flex items-center gap-2 bg-[#8B0000] hover:bg-[#a00000] text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-[#8B0000]/20"
            >
              <Plus size={20} />
              <span>Buat Pengiriman</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 no-scrollbar">
        {[
          { id: 'overview', label: 'Ringkasan', icon: Info },
          { id: 'deliveries', label: 'Pengiriman', icon: Package },
          { id: 'fleet', label: 'Armada', icon: Truck },
          { id: 'tracking', label: 'GPS Tracking', icon: MapIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'fleet' | 'deliveries' | 'tracking')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white/10 text-white border border-white/20 shadow-xl' 
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            <tab.icon size={18} />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <StatCard 
              title="Pengiriman Aktif" 
              value={stats.active} 
              icon={Navigation} 
              color="text-blue-500" 
              bg="bg-blue-500/10"
            />
            <StatCard 
              title="Selesai Hari Ini" 
              value={stats.completed} 
              icon={CheckCircle2} 
              color="text-green-500" 
              bg="bg-green-500/10"
            />
            <StatCard 
              title="Menunggu Antrean" 
              value={stats.pending} 
              icon={Clock} 
              color="text-yellow-500" 
              bg="bg-yellow-500/10"
            />
            <StatCard 
              title="Armada Tersedia" 
              value={`${stats.availableVehicles}/${stats.totalVehicles}`} 
              icon={Truck} 
              color="text-purple-500" 
              bg="bg-purple-500/10"
            />

            {/* Recent Activity or Map Preview */}
            <div className="md:col-span-2 lg:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Aktivitas Terkini</h3>
                <button className="text-white/40 hover:text-white text-sm">Lihat Semua</button>
              </div>
              <div className="space-y-4">
                {deliveries.slice(0, 5).map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        delivery.status === 'Delivered' ? 'bg-green-500/20 text-green-500' :
                        delivery.status === 'In Transit' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        <Truck size={20} />
                      </div>
                      <div>
                        <p className="font-medium">ID: {delivery.id}</p>
                        <p className="text-sm text-white/40">{delivery.notes || 'Tanpa catatan'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        delivery.status === 'Delivered' ? 'text-green-500' :
                        delivery.status === 'In Transit' ? 'text-blue-500' :
                        'text-yellow-500'
                      }`}>{delivery.status}</p>
                      <p className="text-xs text-white/40">{delivery.estimatedArrival || '-'}</p>
                    </div>
                  </div>
                ))}
                {deliveries.length === 0 && (
                  <div className="text-center py-12 text-white/20">
                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Belum ada data pengiriman</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-6">Aksi Cepat</h3>
              <div className="grid grid-cols-1 gap-3">
                <QuickActionBtn icon={Package} label="Buat Pengiriman Baru" onClick={() => setActiveTab('deliveries')} />
                <QuickActionBtn icon={Truck} label="Cek Status Armada" onClick={() => setActiveTab('fleet')} />
                <QuickActionBtn icon={MapPin} label="Pantau Lokasi Kurir" onClick={() => setActiveTab('tracking')} />
                <QuickActionBtn icon={RefreshCw} label="Sinkronisasi Data" onClick={() => window.location.reload()} />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'deliveries' && (
          <motion.div
            key="deliveries"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input 
                  type="text"
                  placeholder="Cari pengiriman..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-4 focus:outline-none focus:border-[#8B0000] transition-all"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-all">
                  <Filter size={18} />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredDeliveries.map((delivery) => (
                <div key={delivery.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all group">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        delivery.status === 'Delivered' ? 'bg-green-500/20 text-green-500' :
                        delivery.status === 'In Transit' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        <Truck size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-lg font-bold">ID: {delivery.id}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            delivery.status === 'Delivered' ? 'bg-green-500/20 text-green-500' :
                            delivery.status === 'In Transit' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>{delivery.status}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-white/60">
                          <div className="flex items-center gap-2">
                            <Truck size={14} className="text-white/40" />
                            <span>Armada: {vehicles.find(v => v.id === delivery.vehicleId)?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-white/40" />
                            <span>Kurir: {users.find(u => u.id === delivery.driverId)?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-white/40" />
                            <span>Estimasi: {delivery.estimatedArrival || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-white/40" />
                            <span>Tujuan: {delivery.notes || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                      <button className="bg-[#8B0000] text-white px-4 py-2 rounded-xl hover:bg-[#a00000] transition-all flex items-center gap-2">
                        <span>Detail</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredDeliveries.length === 0 && (
                <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                  <Package size={64} className="mx-auto mb-4 text-white/10" />
                  <p className="text-white/40">Tidak ada pengiriman yang ditemukan</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'fleet' && (
          <motion.div
            key="fleet"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${
                    vehicle.status === 'Available' ? 'bg-green-500/20 text-green-500' :
                    vehicle.status === 'In Use' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    <Truck size={32} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      vehicle.status === 'Available' ? 'bg-green-500/20 text-green-500' :
                      vehicle.status === 'In Use' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>{vehicle.status}</span>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/40">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-1">{vehicle.name}</h4>
                <p className="text-white/40 text-sm mb-6">{vehicle.plateNumber}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Tipe</span>
                    <span>{vehicle.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Kapasitas</span>
                    <span>{vehicle.capacity} Kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Servis Terakhir</span>
                    <span>{vehicle.lastMaintenance}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <button className="text-sm text-white/40 hover:text-white flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Riwayat Servis</span>
                  </button>
                  <button className="text-[#8B0000] hover:text-[#a00000] text-sm font-bold">
                    Edit Detail
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'tracking' && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-[calc(100vh-280px)] min-h-[500px] bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative"
          >
            <MapContainer 
              center={[-5.3971, 105.2668]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Courier Markers */}
              {courierLocations.map((loc) => (
                <Marker 
                  key={loc.userId} 
                  position={[loc.latitude, loc.longitude]}
                  icon={courierIcon}
                >
                  <Popup>
                    <div className="text-black p-2 min-w-[150px]">
                      <h4 className="font-bold border-bottom mb-2">
                        {users.find(u => u.id === loc.userId)?.name || 'Kurir'}
                      </h4>
                      <p className="text-xs mb-1">Status: <span className="font-medium">{loc.status}</span></p>
                      <p className="text-xs mb-1">Update: {new Date(loc.timestamp).toLocaleTimeString()}</p>
                      <button className="mt-2 w-full bg-[#8B0000] text-white text-[10px] py-1 rounded">
                        Hubungi Kurir
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Outlet Markers */}
              {outletPositions.map((outlet) => (
                <Marker 
                  key={outlet.id} 
                  position={[outlet.lat, outlet.lng]}
                >
                  <Popup>
                    <div className="text-black p-2">
                      <h4 className="font-bold">{outlet.name}</h4>
                      <p className="text-xs">{outlet.address}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Tracking Sidebar Overlay */}
            <div className="absolute top-4 right-4 z-[1000] w-72 max-h-[calc(100%-32px)] overflow-y-auto bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 no-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Kurir Aktif</h3>
                <span className="bg-green-500/20 text-green-500 text-[10px] px-2 py-0.5 rounded-full">
                  {courierLocations.length} Online
                </span>
              </div>
              <div className="space-y-3">
                {courierLocations.map((loc) => {
                  const courierUser = users.find(u => u.id === loc.userId);
                  return (
                    <div key={loc.userId} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#8B0000]/20 flex items-center justify-center text-[#8B0000]">
                          <User size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{courierUser?.name || 'Kurir'}</p>
                          <p className="text-[10px] text-white/40 truncate">{loc.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-white/40">{new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {courierLocations.length === 0 && (
                  <div className="text-center py-8 text-white/20 text-xs">
                    Tidak ada kurir aktif
                  </div>
                )}
              </div>
            </div>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px]">
                <div className="w-3 h-3 rounded-full bg-[#8B0000] border border-white/20"></div>
                <span>Kurir / Armada</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <div className="w-3 h-3 rounded-full bg-blue-500 border border-white/20"></div>
                <span>Kantor / Gerai</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#1e1e1e] border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Tambah Armada Baru</h3>
              <button onClick={() => setShowAddVehicleModal(false)} className="p-2 hover:bg-white/5 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitVehicle} className="space-y-4">
              <div>
                <label className="block text-sm text-white/40 mb-1">Nama Armada</label>
                <input 
                  type="text"
                  required
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-[#8B0000]"
                  placeholder="Contoh: Truck Pendingin 03"
                />
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-1">Nomor Polisi</label>
                <input 
                  type="text"
                  required
                  value={newVehicle.plateNumber}
                  onChange={(e) => setNewVehicle({...newVehicle, plateNumber: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-[#8B0000]"
                  placeholder="Contoh: BE 1234 XY"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/40 mb-1">Tipe</label>
                  <select 
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value as VehicleType['type']})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-[#8B0000]"
                  >
                    <option value="Motor">Motor</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Truk Engkel">Truk Engkel</option>
                    <option value="Truk Pendingin">Truk Pendingin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/40 mb-1">Kapasitas (Kg)</label>
                  <input 
                    type="number"
                    required
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({...newVehicle, capacity: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-[#8B0000]"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#8B0000] text-white py-3 rounded-xl font-bold hover:bg-[#a00000] transition-all mt-4"
              >
                Simpan Armada
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {showAddDeliveryModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#1e1e1e] border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Buat Pengiriman Baru</h3>
              <button onClick={() => setShowAddDeliveryModal(false)} className="p-2 hover:bg-white/5 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitDelivery} className="space-y-4">
              <div>
                <label className="block text-sm text-white/40 mb-1">Pilih Transaksi</label>
                <select 
                  required
                  value={newDelivery.transactionId}
                  onChange={(e) => setNewDelivery({...newDelivery, transactionId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-[#8B0000]"
                >
                  <option value="">Pilih Transaksi...</option>
                  {transactions.filter(t => t.status === 'Selesai' || t.status === 'Pending').map(t => (
                    <option key={t.id} value={t.id}>{t.id} - {t.customerName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-1">Pilih Armada</label>
                <select 
                  required
                  value={newDelivery.vehicleId}
                  onChange={(e) => setNewDelivery({...newDelivery, vehicleId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-[#8B0000]"
                >
                  <option value="">Pilih Armada...</option>
                  {vehicles.filter(v => v.status === 'Available').map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-1">Pilih Kurir</label>
                <select 
                  required
                  value={newDelivery.driverId}
                  onChange={(e) => setNewDelivery({...newDelivery, driverId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-[#8B0000]"
                >
                  <option value="">Pilih Kurir...</option>
                  {users.filter(u => u.role === 'Kurir' || u.role === 'Staff').map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-1">Estimasi Kedatangan</label>
                <input 
                  type="text"
                  required
                  value={newDelivery.estimatedArrival}
                  onChange={(e) => setNewDelivery({...newDelivery, estimatedArrival: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-[#8B0000]"
                  placeholder="Contoh: 14:30"
                />
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-1">Catatan / Alamat</label>
                <textarea 
                  value={newDelivery.notes}
                  onChange={(e) => setNewDelivery({...newDelivery, notes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-[#8B0000] h-20"
                  placeholder="Catatan tambahan atau detail alamat..."
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#8B0000] text-white py-3 rounded-xl font-bold hover:bg-[#a00000] transition-all mt-4"
              >
                Buat Pengiriman
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }: { title: string; value: string | number; icon: React.ElementType; color: string; bg: string }) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${bg} ${color}`}>
        <Icon size={24} />
      </div>
    </div>
    <p className="text-white/40 text-sm mb-1">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const QuickActionBtn = ({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all text-left group"
  >
    <div className="p-2 rounded-xl bg-white/5 group-hover:bg-[#8B0000]/20 group-hover:text-[#8B0000] transition-all">
      <Icon size={20} />
    </div>
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export default Distribution;
