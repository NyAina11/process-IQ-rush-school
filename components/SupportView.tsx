import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Bug, CheckCircle2, Loader2, Send, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';

type BugStatus = 'new' | 'in_progress' | 'resolved';
type BugPriority = 'low' | 'medium' | 'high' | 'critical';
type BugModule = 'admission' | 'rh' | 'commercial' | 'other';

interface BugItem {
  _id: string;
  title: string;
  description: string;
  status: BugStatus;
  priority: BugPriority;
  module: BugModule;
  reporterRole: string;
  reporterName?: string;
  reporterEmail?: string;
  pagePath?: string;
  createdAt: string;
}

const statusLabel: Record<BugStatus, string> = {
  new: 'Nouveau',
  in_progress: 'En cours',
  resolved: 'Résolu',
};

const statusClass: Record<BugStatus, string> = {
  new: 'bg-rose-50 text-rose-700 border-rose-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const priorityLabel: Record<BugPriority, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute',
  critical: 'Critique',
};

const SupportView: React.FC = () => {
  const { showToast } = useAppStore();
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BugStatus>('all');
  const [form, setForm] = useState({
    title: '',
    description: '',
    module: 'admission' as BugModule,
    priority: 'medium' as BugPriority,
  });

  const role = (localStorage.getItem('userRole') || 'unknown').toLowerCase();
  const email = localStorage.getItem('userEmail') || '';
  const name = localStorage.getItem('userName') || '';
  const isSuperAdmin = role === 'super_admin' || role === 'admin';

  const loadBugs = async () => {
    setLoading(true);
    try {
      const response = await api.getBugReports({
        scope: isSuperAdmin ? 'all' : 'mine',
        requesterRole: role,
        reporterRole: role,
        reporterEmail: isSuperAdmin ? undefined : email || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
      });
      setBugs(response.data || []);
    } catch (error: any) {
      showToast(error?.message || 'Erreur lors du chargement des tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBugs();
  }, [statusFilter, isSuperAdmin]);

  const stats = useMemo(() => {
    return {
      total: bugs.length,
      newCount: bugs.filter((b) => b.status === 'new').length,
      inProgressCount: bugs.filter((b) => b.status === 'in_progress').length,
      resolvedCount: bugs.filter((b) => b.status === 'resolved').length,
    };
  }, [bugs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      showToast('Titre et description requis', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createBugReport({
        title: form.title.trim(),
        description: form.description.trim(),
        module: form.module,
        priority: form.priority,
        reporterRole: role,
        reporterName: name,
        reporterEmail: email,
        pagePath: window.location.pathname,
      });
      showToast('Bug signalé avec succès', 'success');
      setForm({
        title: '',
        description: '',
        module: role === 'rh' ? 'rh' : 'admission',
        priority: 'medium',
      });
      await loadBugs();
    } catch (error: any) {
      showToast(error?.message || 'Erreur lors du signalement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, nextStatus: BugStatus) => {
    try {
      await api.updateBugStatus(id, nextStatus, role);
      showToast('Statut mis à jour', 'success');
      await loadBugs();
    } catch (error: any) {
      showToast(error?.message || 'Mise à jour impossible', 'error');
    }
  };

  return (
    <div className="animate-fade-in pb-20" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="relative overflow-hidden rounded-2xl min-h-[148px] flex items-center px-10 py-8 mb-6 bg-gradient-to-r from-[#1f1b4d] via-[#332a86] to-[#4338ca]">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-lg mb-3">
              <Bug size={13} />
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/90">Support & Qualité</span>
            </div>
            <h1 className="text-[28px] font-extrabold text-white leading-tight tracking-tight mb-1">
              {isSuperAdmin ? 'Centre Support Superadmin' : 'Signaler un bug'}
            </h1>
            <p className="text-white/70 text-[14px] font-medium">
              {isSuperAdmin
                ? 'Tous les bugs remontés par les équipes Admission et RH.'
                : 'Remontez vos bugs pour qu’ils soient traités dans la section Support.'}
            </p>
          </div>
          {isSuperAdmin && (
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-300/40 px-4 py-2 rounded-xl text-white text-[12px] font-semibold">
              <ShieldCheck size={14} />
              Vue globale activée
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-white border border-[#e5e0f5] rounded-xl p-4"><div className="text-2xl font-black text-[#1e1b2e]">{stats.total}</div><div className="text-[11px] text-slate-500">Total tickets</div></div>
        <div className="bg-white border border-[#e5e0f5] rounded-xl p-4"><div className="text-2xl font-black text-rose-600">{stats.newCount}</div><div className="text-[11px] text-slate-500">Nouveaux</div></div>
        <div className="bg-white border border-[#e5e0f5] rounded-xl p-4"><div className="text-2xl font-black text-amber-600">{stats.inProgressCount}</div><div className="text-[11px] text-slate-500">En cours</div></div>
        <div className="bg-white border border-[#e5e0f5] rounded-xl p-4"><div className="text-2xl font-black text-emerald-600">{stats.resolvedCount}</div><div className="text-[11px] text-slate-500">Résolus</div></div>
      </div>

      {!isSuperAdmin && (
        <form onSubmit={handleSubmit} className="bg-white border border-[#e5e0f5] rounded-2xl p-5 mb-5 space-y-4 shadow-sm">
          <h2 className="text-[16px] font-bold text-[#1e1b2e]">Nouveau signalement</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Titre du bug"
              className="md:col-span-3 px-4 py-2.5 bg-[#fafafa] border border-[#e5e0f5] rounded-xl text-[13px] outline-none focus:border-[#6d28d9]/40"
            />
            <select
              value={form.module}
              onChange={(e) => setForm((prev) => ({ ...prev, module: e.target.value as BugModule }))}
              className="px-4 py-2.5 bg-[#fafafa] border border-[#e5e0f5] rounded-xl text-[13px] outline-none focus:border-[#6d28d9]/40"
            >
              <option value="admission">Admission</option>
              <option value="rh">RH</option>
              <option value="commercial">Commercial</option>
              <option value="other">Autre</option>
            </select>
            <select
              value={form.priority}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as BugPriority }))}
              className="px-4 py-2.5 bg-[#fafafa] border border-[#e5e0f5] rounded-xl text-[13px] outline-none focus:border-[#6d28d9]/40"
            >
              <option value="low">Priorité faible</option>
              <option value="medium">Priorité moyenne</option>
              <option value="high">Priorité haute</option>
              <option value="critical">Priorité critique</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d28d9] text-white text-[13px] font-semibold hover:bg-[#5b21b6] transition-all disabled:opacity-60"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Envoyer
            </button>
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            placeholder="Décrivez le bug, les étapes pour le reproduire, et le résultat attendu."
            className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e0f5] rounded-xl text-[13px] outline-none focus:border-[#6d28d9]/40 resize-y"
          />
        </form>
      )}

      <div className="bg-white border border-[#e5e0f5] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#f3f0ff] flex flex-wrap gap-3 items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un ticket..."
            className="flex-1 min-w-[220px] px-4 py-2.5 bg-[#fafafa] border border-[#e5e0f5] rounded-xl text-[13px] outline-none focus:border-[#6d28d9]/40"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 bg-[#fafafa] border border-[#e5e0f5] rounded-xl text-[13px] outline-none focus:border-[#6d28d9]/40"
          >
            <option value="all">Tous les statuts</option>
            <option value="new">Nouveaux</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolus</option>
          </select>
          <button
            onClick={loadBugs}
            className="px-4 py-2.5 rounded-xl bg-[#f5f3ff] border border-[#e5e0f5] text-[#6d28d9] text-[13px] font-semibold hover:bg-[#ede9fe]"
          >
            Actualiser
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#faf8ff]">
                {['Date', 'Titre', 'Module', 'Priorité', 'Statut', 'Signalé par', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] border-b border-[#ece7ff] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    Chargement des tickets...
                  </td>
                </tr>
              ) : bugs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle size={24} className="mx-auto mb-2" />
                    Aucun ticket trouvé
                  </td>
                </tr>
              ) : (
                bugs.map((bug) => (
                  <tr key={bug._id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3 border-b border-[#f5f3ff] text-[12px] text-slate-500 whitespace-nowrap">
                      {new Date(bug.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 border-b border-[#f5f3ff] min-w-[320px]">
                      <div className="text-[13px] font-semibold text-[#1e1b2e]">{bug.title}</div>
                      <div className="text-[12px] text-slate-500 line-clamp-2">{bug.description}</div>
                    </td>
                    <td className="px-4 py-3 border-b border-[#f5f3ff] text-[12px] font-medium text-slate-600 uppercase">{bug.module}</td>
                    <td className="px-4 py-3 border-b border-[#f5f3ff] text-[12px] text-slate-600">{priorityLabel[bug.priority]}</td>
                    <td className="px-4 py-3 border-b border-[#f5f3ff]">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${statusClass[bug.status]}`}>
                        {statusLabel[bug.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-[#f5f3ff] text-[12px] text-slate-600">
                      <div>{bug.reporterName || 'Utilisateur'}</div>
                      <div className="text-[11px] text-slate-400">{bug.reporterEmail || bug.reporterRole}</div>
                    </td>
                    <td className="px-4 py-3 border-b border-[#f5f3ff]">
                      {isSuperAdmin ? (
                        <select
                          value={bug.status}
                          onChange={(e) => handleStatusChange(bug._id, e.target.value as BugStatus)}
                          className="px-2.5 py-1.5 bg-[#fafafa] border border-[#e5e0f5] rounded-lg text-[12px] outline-none"
                        >
                          <option value="new">Nouveau</option>
                          <option value="in_progress">En cours</option>
                          <option value="resolved">Résolu</option>
                        </select>
                      ) : bug.status === 'resolved' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-[12px] font-semibold"><CheckCircle2 size={12} /> Corrigé</span>
                      ) : (
                        <span className="text-[12px] text-slate-400">En attente</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupportView;

