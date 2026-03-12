import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const VehicleManager = () => {
  const [vehicles, setVehicles] = useState([]);
  const [newPlate, setNewPlate] = useState('');
  const [type, setType] = useState('Motor');

  // Load data armada dari Supabase
  const fetchVehicles = async () => {
    const { data, error } = await supabase.from('vehicles').select('*');
    if (!error) setVehicles(data);
  };

  useEffect(() => { fetchVehicles(); }, []);

  const addVehicle = async () => {
    if (!newPlate) return;
    const { error } = await supabase.from('vehicles').insert([
      { id: `VH-${Date.now()}`, plate_number: newPlate, type: type, status: 'Tersedia' }
    ]);
    if (!error) {
      setNewPlate('');
      fetchVehicles();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md text-gray-800">
      <h2 className="text-2xl font-bold mb-4">Manajemen Armada Subaru Daging</h2>
      
      {/* Form Tambah */}
      <div className="flex gap-2 mb-6">
        <input 
          className="border p-2 rounded w-full"
          placeholder="Plat Nomor (Contoh: BE 1234 XY)"
          value={newPlate}
          onChange={(e) => setNewPlate(e.target.value)}
        />
        <select className="border p-2 rounded" onChange={(e) => setType(e.target.value)}>
          <option value="Motor">Motor</option>
          <option value="Mobil Box">Mobil Box</option>
          <option value="Engkel">Engkel</option>
        </select>
        <button onClick={addVehicle} className="bg-blue-600 text-white px-4 py-2 rounded">
          Tambah
        </button>
      </div>

      {/* Tabel Armada */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2">Plat Nomor</th>
            <th className="p-2">Tipe</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id} className="border-b">
              <td className="p-2 font-mono">{v.plate_number}</td>
              <td className="p-2">{v.type}</td>
              <td className="p-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                  {v.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleManager;
