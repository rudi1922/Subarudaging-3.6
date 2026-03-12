import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Pastikan path ini sesuai dengan file konfigurasi Anda

export default function VehicleManager() {
  const [vehicles, setVehicles] = useState([]);
  const [newPlate, setNewPlate] = useState('');

  // Fungsi untuk mengambil data dari Supabase
  const fetchVehicles = async () => {
    const { data, error } = await supabase.from('vehicles').select('*');
    if (!error) setVehicles(data);
  };

  // Fungsi untuk menambah data ke Supabase
  const addVehicle = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('vehicles').insert([
      { 
        id: `VHC-${Math.floor(Math.random() * 1000)}`, // ID Acak sederhana
        plate_number: newPlate, 
        type: 'Mobil Box Pendingin', 
        status: 'Tersedia' 
      }
    ]);
    
    if (!error) {
      setNewPlate('');
      fetchVehicles(); // Refresh daftar setelah sukses
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Manajemen Armada Subaru Daging</h2>
      
      <form onSubmit={addVehicle} className="mb-6 flex gap-2">
        <input 
          type="text" 
          value={newPlate}
          onChange={(e) => setNewPlate(e.target.value)}
          placeholder="Masukkan Plat Nomor (Misal: BE 1234 XY)" 
          className="border p-2 rounded w-full"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Tambah Armada
        </button>
      </form>

      <ul className="divide-y divide-gray-200">
        {vehicles.map((v) => (
          <li key={v.id} className="py-3 flex justify-between items-center">
            <div>
              <p className="font-semibold">{v.plate_number}</p>
              <p className="text-sm text-gray-500">{v.type}</p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {v.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

}
