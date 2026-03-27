import React from 'react';
import { useStore } from '../StoreContext';
import { UserCheck, Shield, AlertCircle } from 'lucide-react';
import { User } from '../types';

const AdminDashboard: React.FC = () => {
  const { users, approveUser, confirm } = useStore();
  
  // Filter users that are not approved
  const pendingUsers = users.filter((u: User) => u.isApproved === false);

  const handleApprove = async (id: string) => {
    confirm({
      title: 'Persetujuan User',
      message: 'Apakah Anda yakin ingin menyetujui user ini?',
      onConfirm: async () => {
        await approveUser(id);
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Kelola persetujuan akses pengguna baru</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <UserCheck size={18} className="text-emerald-500" />
            Menunggu Persetujuan ({pendingUsers.length})
          </h2>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-4">
              <UserCheck size={24} />
            </div>
            <p className="text-gray-500">Tidak ada permintaan persetujuan saat ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingUsers.map((u: User) => (
              <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>@{u.username}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold uppercase tracking-wider text-gray-600">
                        {u.role}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleApprove(u.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  <UserCheck size={18} />
                  Setujui
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
        <AlertCircle className="text-amber-500 shrink-0" size={20} />
        <p className="text-sm text-amber-800">
          <strong>Penting:</strong> Hanya berikan persetujuan kepada staf yang Anda kenal. Setelah disetujui, user akan memiliki akses penuh sesuai dengan role yang diberikan.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
