import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Shield, Mail, Key, ShieldCheck, ShieldAlert, Check, X, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';

const UserManagement: React.FC = () => {
  const { showToast } = useAppStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (error) {
      showToast('Erreur lors de la récupération des utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (email: string) => {
    if (!newPassword) return;
    try {
      await api.updateUserInfo(email, { password: newPassword });
      showToast('Mot de passe mis à jour', 'success');
      setEditingUser(null);
      setNewPassword('');
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${email} ?`)) return;
    try {
      await api.deleteUser(email);
      showToast('Utilisateur supprimé', 'success');
      fetchUsers();
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin': return <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-bold border border-rose-100 flex items-center gap-1"><ShieldAlert size={10}/> Admin</span>;
      case 'admission': return <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold border border-indigo-100 flex items-center gap-1"><ShieldCheck size={10}/> Admission</span>;
      case 'rh': return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100 flex items-center gap-1"><Shield size={10}/> RH</span>;
      case 'commercial': return <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-100 flex items-center gap-1"><Shield size={10}/> Commercial</span>;
      case 'eleve': return <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-full text-[10px] font-bold border border-slate-100 flex items-center gap-1"><Shield size={10}/> Élève</span>;
      default: return <span>{role}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Utilisateurs</h2>
          <p className="text-slate-500 font-medium mt-1">Gérez les accès et les comptes de l'application.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">
          <UserPlus size={18} />
          Nouvel Utilisateur
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un utilisateur..." 
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Users size={14} />
            {filteredUsers.length} Utilisateurs
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">Utilisateur</th>
                <th className="px-8 py-4">Rôle</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center">
                    <Loader2 size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-slate-400">Chargement...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center">
                    <span className="text-sm font-medium text-slate-400">Aucun utilisateur trouvé</span>
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.email} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{user.name}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Mail size={10}/> {user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-8 py-5">
                    <span className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      Actif
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingUser === user.email ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                            <input 
                              type="text" 
                              placeholder="Nouveau mdp"
                              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <button 
                            onClick={() => handleUpdatePassword(user.email)}
                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => { setEditingUser(null); setNewPassword(''); }}
                            className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => setEditingUser(user.email)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Modifier le mot de passe"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.email)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Supprimer l'utilisateur"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
