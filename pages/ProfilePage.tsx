import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Lock, Save, Key, Camera, ChevronRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';

const ProfilePage: React.FC = () => {
  const { showToast } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Load data from localStorage or API
    setUserName(localStorage.getItem('userName') || '');
    setUserEmail(localStorage.getItem('userEmail') || '');
    setUserRole(localStorage.getItem('userRole') || 'Utilisateur');
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile({ name: userName });
      localStorage.setItem('userName', userName);
      showToast('Profil mis à jour avec succès', 'success');
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      showToast('Mot de passe modifié avec succès', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super_admin': return 'Super Administrateur';
      case 'admission': return 'Responsable Admissions';
      case 'rh': return 'Responsable RH';
      case 'commercial': return 'Responsable Commercial';
      case 'eleve': return 'Étudiant';
      default: return role;
    }
  };

  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-100/50 transition-colors duration-700" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#6c63ff] to-[#8b5cf6] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-500/20">
              {initials}
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-slate-100 text-[#6c63ff] hover:scale-110 transition-transform">
              <Camera size={16} />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{userName}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              <span className="px-3 py-1 bg-indigo-50 text-[#6c63ff] rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-indigo-100">
                <Shield size={12} /> {getRoleLabel(userRole)}
              </span>
              <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-slate-100">
                <Mail size={12} /> {userEmail}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 rounded-xl text-[#6c63ff]">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Informations Personnelles</h2>
                <p className="text-sm text-slate-500">Mettez à jour vos informations de base</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#6c63ff]/20 focus:border-[#6c63ff] outline-none transition-all font-semibold text-slate-700"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Adresse Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 cursor-not-allowed font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                {userRole === 'super_admin' ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3.5 bg-[#6c63ff] text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Save size={18} />
                    {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                ) : (
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                    <Shield size={12} /> Modifications réservées à l'administrateur
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-8 shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Sécurité du compte</h3>
                <p className="text-indigo-100 text-sm max-w-md">Votre compte est protégé par une authentification sécurisée. Assurez-vous d'utiliser un mot de passe complexe.</p>
              </div>
              <Shield size={48} className="text-white/20" />
            </div>
          </div>
        </div>

        {/* Right Column: Password Change */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
                <Key size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Mot de passe</h2>
                <p className="text-xs text-slate-500">Sécurisez votre accès</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe actuel</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6c63ff]/20 focus:border-[#6c63ff] outline-none transition-all text-sm font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmer</label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6c63ff]/20 focus:border-[#6c63ff] outline-none transition-all text-sm font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || userRole !== 'super_admin'}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {userRole === 'super_admin' ? (loading ? 'Traitement...' : 'Modifier le mot de passe') : 'Modification désactivée'}
              </button>
            </form>
          </div>

          <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <p className="text-sm font-bold text-rose-900">Zone de danger</p>
                <p className="text-xs text-rose-600 leading-relaxed">La suppression du compte ou la modification d'accès critique nécessite une validation de l'administrateur.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
