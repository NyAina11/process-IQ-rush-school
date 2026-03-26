import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Bug, CheckCircle2, ChevronDown, Clock, Filter, Loader2, Plus, Search, Send, ShieldCheck, X } from 'lucide-react';
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
  screenshotUrl?: string;
  createdAt: string;
}

const statusLabel: Record<BugStatus, string> = {
  new: 'Nouveau',
  in_progress: 'En cours',
  resolved: 'Résolu',
};

const statusIcon: Record<BugStatus, React.ReactNode> = {
  new: <AlertCircle size={12} />,
  in_progress: <Clock size={12} />,
  resolved: <CheckCircle2 size={12} />,
};

const statusStyle: Record<BugStatus, string> = {
  new: 'bg-rose-50 text-rose-600 border-rose-200',
  in_progress: 'bg-amber-50 text-amber-600 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const priorityLabel: Record<BugPriority, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute',
  critical: 'Critique',
};

const priorityDot: Record<BugPriority, string> = {
  low: 'bg-slate-300',
  medium: 'bg-blue-400',
  high: 'bg-orange-400',
  critical: 'bg-rose-500',
};

const moduleLabel: Record<BugModule, string> = {
  admission: 'Admission',
  rh: 'RH',
  commercial: 'Commercial',
  other: 'Autre',
};

const SupportView: React.FC = () => {
  const { showToast } = useAppStore();
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BugStatus>('all');
  const [showForm, setShowForm] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
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

  useEffect(() => {
    return () => {
      if (screenshotPreview) {
        URL.revokeObjectURL(screenshotPreview);
      }
    };
  }, [screenshotPreview]);

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
      let screenshotUrl = '';
      if (screenshotFile) {
        screenshotUrl = await api.uploadBugScreenshot(screenshotFile);
      }

      await api.createBugReport({
        title: form.title.trim(),
        description: form.description.trim(),
        module: form.module,
        priority: form.priority,
        reporterRole: role,
        reporterName: name,
        reporterEmail: email,
        pagePath: window.location.pathname,
        screenshotUrl: screenshotUrl || undefined,
      });
      showToast('Bug signalé avec succès', 'success');
      setForm({
        title: '',
        description: '',
        module: role === 'rh' ? 'rh' : 'admission',
        priority: 'medium',
      });
      setScreenshotFile(null);
      setScreenshotPreview('');
      setShowForm(false);
      await loadBugs();
    } catch (error: any) {
      showToast(error?.message || 'Erreur lors du signalement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
      setScreenshotFile(null);
      setScreenshotPreview('');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Format image invalide. Utilisez PNG, JPG ou WEBP.', 'error');
      e.target.value = '';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image trop lourde (max 8MB).', 'error');
      e.target.value = '';
      return;
    }

    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
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

  const statusTabs: { key: 'all' | BugStatus; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: stats.total },
    { key: 'new', label: 'Nouveaux', count: stats.newCount },
    { key: 'in_progress', label: 'En cours', count: stats.inProgressCount },
    { key: 'resolved', label: 'Résolus', count: stats.resolvedCount },
  ];

  return (
    <div className="animate-fade-in pb-20" style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', sans-serif" }}>

      {/* ── HEADER ── */}
      <div className="bg-white border border-[#e5e0f5] rounded-2xl mb-5 overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6d28d9] to-[#4338ca] flex items-center justify-center shadow-md shadow-violet-200">
              <Bug size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-[20px] font-extrabold text-[#1e1b2e] tracking-tight leading-tight">
                {isSuperAdmin ? 'Centre Support' : 'Support & Bugs'}
              </h1>
              <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                {isSuperAdmin ? 'Gestion globale des tickets signalés' : 'Signalez et suivez vos bugs'}
              </p>
            </div>
            {isSuperAdmin && (
              <span className="ml-3 inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck size={12} /> Admin
              </span>
            )}
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d28d9] text-white text-[12px] font-bold hover:bg-[#5b21b6] transition-all shadow-md shadow-violet-200"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Fermer' : 'Nouveau ticket'}
          </button>
        </div>

        {/* ── STAT CHIPS ── */}
        <div className="px-6 pb-4 flex items-center gap-3">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                statusFilter === tab.key
                  ? 'bg-[#6d28d9] text-white border-[#6d28d9] shadow-sm'
                  : 'bg-[#fafafa] text-slate-500 border-[#e5e0f5] hover:bg-[#f5f3ff] hover:text-[#6d28d9]'
              }`}
            >
              {tab.label}
              <span className={`ml-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── NEW TICKET FORM (collapsible) ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-[#e5e0f5] rounded-2xl p-5 mb-5 shadow-sm animate-fade-in">
          <h2 className="text-[14px] font-bold text-[#1e1b2e] mb-4">Nouveau signalement</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Titre du bug"
              className="md:col-span-4 px-4 py-2.5 bg-[#fafafa] border border-[#e5e0f5] rounded-xl text-[13px] outline-none focus:border-[#6d28d9]/40"
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
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="critical">Critique</option>
            </select>
            <div className="md:col-span-2 flex gap-2">
              <label className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-[#fafafa] border border-[#e5e0f5] rounded-xl text-[12px] text-slate-500 cursor-pointer hover:border-[#6d28d9]/30">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />
                {screenshotFile ? (
                  <span className="text-[#6d28d9] font-medium truncate">{screenshotFile.name}</span>
                ) : (
                  'Capture ecran (optionnel)'
                )}
              </label>
            </div>
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            placeholder="Decrivez le bug, les etapes pour le reproduire, et le resultat attendu."
            className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e0f5] rounded-xl text-[13px] outline-none focus:border-[#6d28d9]/40 resize-y mb-3"
          />
          {screenshotPreview && (
            <img
              src={screenshotPreview}
              alt="Apercu capture bug"
              className="h-20 rounded-lg border border-[#e5e0f5] object-cover mb-3"
            />
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6d28d9] text-white text-[13px] font-bold hover:bg-[#5b21b6] transition-all disabled:opacity-60 shadow-md shadow-violet-200"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Envoyer le ticket
            </button>
          </div>
        </form>
      )}

      {/* ── SEARCH BAR ── */}
      <div className="bg-white border border-[#e5e0f5] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-[#f3f0ff] flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2 bg-[#fafafa] border border-[#e5e0f5] rounded-xl">
            <Search size={14} className="text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadBugs()}
              placeholder="Rechercher un ticket..."
              className="bg-transparent text-[13px] outline-none w-full placeholder-slate-400"
            />
            {search && (
              <button onClick={() => { setSearch(''); setTimeout(loadBugs, 0); }} className="text-slate-300 hover:text-slate-500">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={loadBugs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f5f3ff] border border-[#e5e0f5] text-[#6d28d9] text-[12px] font-semibold hover:bg-[#ede9fe] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Filter size={13} />}
            Rechercher
          </button>
        </div>

        {/* ── TABLE ── */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#faf8ff]">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#ece7ff] w-[140px]">Date</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#ece7ff]">Ticket</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#ece7ff] w-[100px]">Module</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#ece7ff] w-[100px]">Priorité</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#ece7ff] w-[110px]">Statut</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#ece7ff] w-[150px]">Signalé par</th>
                {isSuperAdmin && (
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#ece7ff] w-[130px]">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 7 : 6} className="py-16 text-center">
                    <Loader2 size={28} className="animate-spin mx-auto mb-3 text-[#6d28d9]" />
                    <p className="text-[13px] text-slate-400 font-medium">Chargement des tickets...</p>
                  </td>
                </tr>
              ) : bugs.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 7 : 6} className="py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#f5f3ff] flex items-center justify-center mx-auto mb-3">
                      <Bug size={22} className="text-[#c4b5fd]" />
                    </div>
                    <p className="text-[14px] text-slate-500 font-semibold">Aucun ticket trouvé</p>
                    <p className="text-[12px] text-slate-400 mt-1">
                      {search ? 'Essayez une recherche différente' : 'Aucun bug signalé pour le moment'}
                    </p>
                  </td>
                </tr>
              ) : (
                bugs.map((bug, i) => (
                  <tr
                    key={bug._id}
                    className={`group transition-colors hover:bg-[#fcfbff] ${i !== bugs.length - 1 ? 'border-b border-[#f3f0ff]' : ''}`}
                  >
                    {/* Date */}
                    <td className="px-5 py-4 align-top">
                      <div className="text-[12px] font-semibold text-slate-600">
                        {new Date(bug.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(bug.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Ticket info */}
                    <td className="px-5 py-4 align-top">
                      <div className="text-[13px] font-bold text-[#1e1b2e] leading-tight mb-0.5">{bug.title}</div>
                      <div className="text-[12px] text-slate-400 leading-snug line-clamp-2">{bug.description}</div>
                      {bug.screenshotUrl && (
                        <a href={bug.screenshotUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block">
                          <img
                            src={bug.screenshotUrl}
                            alt={`Capture ${bug.title}`}
                            className="h-12 w-20 rounded-md object-cover border border-[#e5e0f5] opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        </a>
                      )}
                    </td>

                    {/* Module */}
                    <td className="px-5 py-4 align-top">
                      <span className="text-[11px] font-semibold text-slate-500 bg-[#f5f3ff] px-2 py-1 rounded-md border border-[#ece7ff]">
                        {moduleLabel[bug.module]}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${priorityDot[bug.priority]}`} />
                        <span className="text-[12px] font-medium text-slate-600">{priorityLabel[bug.priority]}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 align-top">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${statusStyle[bug.status]}`}>
                        {statusIcon[bug.status]}
                        {statusLabel[bug.status]}
                      </span>
                    </td>

                    {/* Reporter */}
                    <td className="px-5 py-4 align-top">
                      <div className="text-[12px] font-semibold text-slate-600">{bug.reporterName || 'Utilisateur'}</div>
                      <div className="text-[10px] text-slate-400">{bug.reporterEmail || bug.reporterRole}</div>
                    </td>

                    {/* Action (admin only) */}
                    {isSuperAdmin && (
                      <td className="px-5 py-4 align-top">
                        <div className="relative">
                          <select
                            value={bug.status}
                            onChange={(e) => handleStatusChange(bug._id, e.target.value as BugStatus)}
                            className="appearance-none w-full px-3 py-1.5 pr-7 bg-[#fafafa] border border-[#e5e0f5] rounded-lg text-[11px] font-semibold outline-none hover:border-[#6d28d9]/30 transition-colors cursor-pointer"
                          >
                            <option value="new">Nouveau</option>
                            <option value="in_progress">En cours</option>
                            <option value="resolved">Résolu</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── FOOTER ── */}
        {bugs.length > 0 && (
          <div className="px-5 py-3 border-t border-[#f3f0ff] flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              {bugs.length} ticket{bugs.length > 1 ? 's' : ''} affiché{bugs.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={loadBugs}
              className="text-[11px] text-[#6d28d9] font-semibold hover:underline"
            >
              Actualiser
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportView;
