import React, { useEffect, useMemo, useState, useRef } from 'react';
import { AlertCircle, Bug, CheckCircle2, ChevronDown, Clock, Edit3, Image, Loader2, Plus, Save, Search, ShieldCheck, Trash2, X } from 'lucide-react';
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

interface NewRow {
  title: string;
  description: string;
  module: BugModule;
  priority: BugPriority;
  screenshotFile: File | null;
  screenshotPreview: string;
}

interface EditingRow {
  id: string;
  title: string;
  description: string;
  module: BugModule;
  priority: BugPriority;
  screenshotFile: File | null;
  screenshotPreview: string;
  originalScreenshotUrl?: string;
}

const statusLabel: Record<BugStatus, string> = { new: 'NOUVEAU', in_progress: 'EN COURS', resolved: 'RÉSOLU' };
const statusStyle: Record<BugStatus, string> = {
  new: 'bg-rose-500 text-white border-rose-500',
  in_progress: 'bg-orange-500 text-white border-orange-500',
  resolved: 'bg-emerald-500 text-white border-emerald-500',
};
const priorityLabel: Record<BugPriority, string> = { low: 'Faible', medium: 'Moyenne', high: 'Haute', critical: 'Critique' };
const priorityDot: Record<BugPriority, string> = { low: 'bg-slate-300', medium: 'bg-blue-400', high: 'bg-orange-400', critical: 'bg-rose-500' };

const CELL = "px-6 py-4 border-b border-[#ece7ff] border-r border-r-gray-200 text-[15px]";
const CELL_INPUT = "w-full px-3 py-2 bg-white border border-[#e5e0f5] rounded-lg text-[15px] outline-none focus:border-[#6d28d9]/40 transition-colors";
const CELL_SELECT = "w-full px-3 py-2 bg-white border border-[#e5e0f5] rounded-lg text-[14px] outline-none focus:border-[#6d28d9]/40 appearance-none cursor-pointer";

const SupportView: React.FC = () => {
  const { showToast } = useAppStore();
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BugStatus>('all');
  const [newRow, setNewRow] = useState<NewRow | null>(null);
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const titleRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const normalizeRole = (raw: string): string => {
    const role = String(raw || '').trim().toLowerCase();
    if (role === 'admissions') return 'admission';
    if (role === 'superadmin') return 'super_admin';
    return role || 'unknown';
  };
  const role = normalizeRole(localStorage.getItem('userRole') || 'unknown');
  const email = localStorage.getItem('userEmail') || '';
  const userName = localStorage.getItem('userName') || '';
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

  useEffect(() => { loadBugs(); }, [statusFilter, isSuperAdmin]);

  useEffect(() => {
    return () => {
      if (newRow?.screenshotPreview) URL.revokeObjectURL(newRow.screenshotPreview);
      if (editingRow?.screenshotPreview) URL.revokeObjectURL(editingRow.screenshotPreview);
    };
  }, [newRow?.screenshotPreview, editingRow?.screenshotPreview]);

  const stats = useMemo(() => ({
    total: bugs.length,
    newCount: bugs.filter((b) => b.status === 'new').length,
    inProgressCount: bugs.filter((b) => b.status === 'in_progress').length,
    resolvedCount: bugs.filter((b) => b.status === 'resolved').length,
  }), [bugs]);

  const handleAddRow = () => {
    setNewRow({ title: '', description: '', module: role === 'rh' ? 'rh' : 'admission', priority: 'medium', screenshotFile: null, screenshotPreview: '' });
    setTimeout(() => titleRef.current?.focus(), 50);
  };

  const handleCancelRow = () => {
    if (newRow?.screenshotPreview) URL.revokeObjectURL(newRow.screenshotPreview);
    setNewRow(null);
  };

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newRow) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) { showToast('Format invalide (PNG, JPG, WEBP)', 'error'); e.target.value = ''; return; }
    if (file.size > 8 * 1024 * 1024) { showToast('Image trop lourde (max 8MB)', 'error'); e.target.value = ''; return; }
    if (newRow.screenshotPreview) URL.revokeObjectURL(newRow.screenshotPreview);
    setNewRow({ ...newRow, screenshotFile: file, screenshotPreview: URL.createObjectURL(file) });
  };

  const handleSubmitRow = async () => {
    if (!newRow || !newRow.title.trim()) { showToast('Le titre est requis', 'error'); titleRef.current?.focus(); return; }
    setSubmitting(true);
    try {
      let screenshotUrl = '';
      if (newRow.screenshotFile) { screenshotUrl = await api.uploadBugScreenshot(newRow.screenshotFile); }
      await api.createBugReport({
        title: newRow.title.trim(),
        description: newRow.description.trim(),
        module: newRow.module,
        priority: newRow.priority,
        reporterRole: role,
        reporterName: userName,
        reporterEmail: email,
        pagePath: window.location.pathname,
        screenshotUrl: screenshotUrl || undefined,
      });
<<<<<<< HEAD
      showToast('Bug signalé avec succès', 'success');
      setForm({
        title: '',
        description: '',
        module: role === 'rh' ? 'rh' : role === 'commercial' ? 'commercial' : 'admission',
        priority: 'medium',
      });
      setScreenshotFile(null);
      setScreenshotPreview('');
=======
      showToast('Ticket créé', 'success');
      handleCancelRow();
>>>>>>> d9d9c7361e04442fd8efc05e6f672f8b1dcde87a
      await loadBugs();
    } catch (error: any) {
      showToast(error?.message || 'Erreur lors de la création', 'error');
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

  const startEditing = (bug: BugItem) => {
    if (editingRow?.id === bug._id) return; // Déjà en édition
    setEditingRow({
      id: bug._id,
      title: bug.title,
      description: bug.description,
      module: bug.module,
      priority: bug.priority,
      screenshotFile: null,
      screenshotPreview: '',
      originalScreenshotUrl: bug.screenshotUrl,
    });
  };

  const cancelEditing = () => {
    if (editingRow?.screenshotPreview) {
      URL.revokeObjectURL(editingRow.screenshotPreview);
    }
    setEditingRow(null);
  };

  const handleEditScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingRow) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) { showToast('Format invalide (PNG, JPG, WEBP)', 'error'); e.target.value = ''; return; }
    if (file.size > 8 * 1024 * 1024) { showToast('Image trop lourde (max 8MB)', 'error'); e.target.value = ''; return; }
    if (editingRow.screenshotPreview) URL.revokeObjectURL(editingRow.screenshotPreview);
    setEditingRow({ ...editingRow, screenshotFile: file, screenshotPreview: URL.createObjectURL(file) });
  };

  const saveEditing = async () => {
    if (!editingRow || !editingRow.title.trim()) {
      showToast('Le titre est requis', 'error');
      return;
    }

    setSavingIds(prev => new Set([...prev, editingRow.id]));
    try {
      let screenshotUrl = editingRow.originalScreenshotUrl || '';

      // Upload new screenshot if provided
      if (editingRow.screenshotFile) {
        screenshotUrl = await api.uploadBugScreenshot(editingRow.screenshotFile);
      }

      // Update the bug
      await api.updateBugReport(editingRow.id, {
        title: editingRow.title.trim(),
        description: editingRow.description.trim(),
        module: editingRow.module,
        priority: editingRow.priority,
        screenshotUrl: screenshotUrl || undefined,
      });

      showToast('Ticket mis à jour', 'success');
      cancelEditing();
      await loadBugs();
    } catch (error: any) {
      showToast(error?.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(editingRow.id);
        return newSet;
      });
    }
  };

  const deleteBug = async (id: string) => {
    if (!confirm('Supprimer définitivement ce ticket ?')) return;

    setDeletingIds(prev => new Set([...prev, id]));
    try {
      await api.deleteBugReport(id);
      showToast('Ticket supprimé', 'success');
      await loadBugs();
    } catch (error: any) {
      showToast(error?.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editingRow) {
      e.preventDefault();
      saveEditing();
    }
    if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const statusTabs: { key: 'all' | BugStatus; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: stats.total },
    { key: 'new', label: 'Nouveaux', count: stats.newCount },
    { key: 'in_progress', label: 'En cours', count: stats.inProgressCount },
    { key: 'resolved', label: 'Résolus', count: stats.resolvedCount },
  ];

  const colCount = isSuperAdmin ? 9 : 8;

  return (
    <div className="animate-fade-in pb-20" style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', sans-serif" }}>

      {/* ── HEADER ── */}
      <div className="bg-white border border-[#e5e0f5] rounded-2xl overflow-hidden shadow-sm">

        <div className="px-6 py-4 flex items-center justify-between border-b border-[#f3f0ff]">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6d28d9] to-[#4338ca] flex items-center justify-center shadow-md shadow-violet-200">
              <Bug size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-extrabold text-[#1e1b2e] tracking-tight leading-tight">
                {isSuperAdmin ? 'Centre Support' : 'Support & Bugs'}
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                {isSuperAdmin ? 'Gestion globale des tickets' : 'Signalez et suivez vos bugs'}
              </p>
            </div>
            {isSuperAdmin && (
              <span className="ml-2 inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-emerald-600 text-[9px] font-bold uppercase tracking-wider">
                <ShieldCheck size={10} /> Admin
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Filters */}
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                  statusFilter === tab.key
                    ? 'bg-[#6d28d9] text-white border-[#6d28d9]'
                    : 'bg-[#fafafa] text-slate-500 border-[#e5e0f5] hover:bg-[#f5f3ff]'
                }`}
              >
                {tab.label}
                <span className={`text-[9px] font-black px-1 py-0.5 rounded ${statusFilter === tab.key ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="px-5 py-2.5 flex items-center gap-3 border-b border-[#f3f0ff] bg-[#faf8ff]">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white border border-[#e5e0f5] rounded-lg">
            <Search size={13} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadBugs()}
              placeholder="Rechercher..."
              className="bg-transparent text-[12px] outline-none w-full placeholder-slate-400"
            />
            {search && (
              <button onClick={() => { setSearch(''); setTimeout(loadBugs, 0); }} className="text-slate-300 hover:text-slate-500"><X size={12} /></button>
            )}
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#faf8ff] border-b-2 border-gray-200">
                <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-wider text-slate-600 border-b border-[#ece7ff] border-r border-r-gray-200 w-[120px]">DATE</th>
                <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-wider text-slate-600 border-b border-[#ece7ff] border-r border-r-gray-200 min-w-[200px]">TITRE</th>
                <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-wider text-slate-600 border-b border-[#ece7ff] border-r border-r-gray-200 min-w-[220px]">DESCRIPTION</th>
                <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-wider text-slate-600 border-b border-[#ece7ff] border-r border-r-gray-200 w-[120px]">MODULE</th>
                <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-wider text-slate-600 border-b border-[#ece7ff] border-r border-r-gray-200 w-[120px]">PRIORITÉ</th>
                <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-wider text-slate-600 border-b border-[#ece7ff] border-r border-r-gray-200 w-[130px]">STATUT</th>
                <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-wider text-slate-600 border-b border-[#ece7ff] border-r border-r-gray-200 w-[150px]">SIGNALÉ PAR</th>
                <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-wider text-slate-600 border-b border-[#ece7ff] border-r border-r-gray-200 w-[80px]">CAPTURE</th>
                <th className="px-6 py-4 text-center text-[12px] font-bold uppercase tracking-wider text-slate-600 border-b border-[#ece7ff] w-[120px]">ACTIONS</th>
              </tr>
            </thead>
            <tbody>


              {/* ── NEW ROW (inline) ── */}
              {newRow && (
                <tr className="bg-[#f5f3ff] border-b-2 border-[#6d28d9]/20">
                  <td className={CELL}>
                    <span className="text-[11px] text-[#6d28d9] font-bold">Maintenant</span>
                  </td>
                  <td className={CELL}>
                    <input
                      ref={titleRef}
                      value={newRow.title}
                      onChange={(e) => setNewRow({ ...newRow, title: e.target.value })}
                      placeholder="Titre du bug..."
                      className={CELL_INPUT}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitRow()}
                    />
                  </td>
                  <td className={CELL}>
                    <input
                      value={newRow.description}
                      onChange={(e) => setNewRow({ ...newRow, description: e.target.value })}
                      placeholder="Description..."
                      className={CELL_INPUT}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitRow()}
                    />
                  </td>
                  <td className={CELL}>
                    <select
                      value={newRow.module}
                      onChange={(e) => setNewRow({ ...newRow, module: e.target.value as BugModule })}
                      className={CELL_SELECT}
                    >
                      <option value="admission">Admission</option>
                      <option value="rh">RH</option>
                      <option value="commercial">Commercial</option>
                      <option value="other">Autre</option>
                    </select>
                  </td>
                  <td className={CELL}>
                    <select
                      value={newRow.priority}
                      onChange={(e) => setNewRow({ ...newRow, priority: e.target.value as BugPriority })}
                      className={CELL_SELECT}
                    >
                      <option value="low">Faible</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                      <option value="critical">Critique</option>
                    </select>
                  </td>
                  <td className={CELL}>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-rose-500 text-white border-rose-500">
                      <AlertCircle size={12} /> NOUVEAU
                    </span>
                  </td>
                  <td className={CELL}>
                    <span className="text-[14px] font-bold text-slate-700">{userName || 'Moi'}</span>
                  </td>
                  <td className={CELL}>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleScreenshot} className="hidden" />
                    {newRow.screenshotPreview ? (
                      <img src={newRow.screenshotPreview} alt="capture" className="h-8 w-12 rounded object-cover border border-[#e5e0f5] cursor-pointer" onClick={() => fileRef.current?.click()} />
                    ) : (
                      <button type="button" onClick={() => fileRef.current?.click()} className="w-8 h-8 rounded-lg bg-[#f5f3ff] border border-[#e5e0f5] flex items-center justify-center text-slate-400 hover:text-[#6d28d9] hover:border-[#6d28d9]/30 transition-colors">
                        <Image size={14} />
                      </button>
                    )}
                  </td>
                  <td className={CELL}></td>
                  {/* Action buttons in a floating bar */}
                </tr>
              )}
              {newRow && (
                <tr className="bg-[#f5f3ff]/50">
                  <td colSpan={9} className="px-4 py-2 border-b border-[#ece7ff]">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={handleCancelRow}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        <X size={12} /> Annuler
                      </button>
                      <button
                        onClick={handleSubmitRow}
                        disabled={submitting}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#6d28d9] text-white text-[11px] font-bold hover:bg-[#5b21b6] transition-all disabled:opacity-50"
                      >
                        {submitting ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        Enregistrer
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* ── EXISTING ROWS ── */}
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#6d28d9]" />
                    <p className="text-[12px] text-slate-400">Chargement...</p>
                  </td>
                </tr>
              ) : bugs.length === 0 && !newRow ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#f5f3ff] flex items-center justify-center mx-auto mb-2">
                      <Bug size={18} className="text-[#c4b5fd]" />
                    </div>
                    <p className="text-[13px] text-slate-500 font-semibold">Aucun ticket</p>
                    <p className="text-[11px] text-slate-400 mt-1">Cliquez sur "Nouveau ticket" pour ajouter une ligne</p>
                  </td>
                </tr>
              ) : (
                bugs.map((bug, i) => {
                  const isEditing = editingRow?.id === bug._id;
                  const isSaving = savingIds.has(bug._id);
                  const isDeleting = deletingIds.has(bug._id);

                  return (
                    <tr
                      key={bug._id}
                      className={`transition-colors ${
                        isEditing ? 'bg-[#f5f3ff] border-l-2 border-l-[#6d28d9]'
                        : 'hover:bg-[#fcfbff]'
                      } ${i !== bugs.length - 1 ? 'border-b border-[#f3f0ff]' : ''} ${
                        (isDeleting || isSaving) ? 'opacity-60' : ''
                      }`}
                      onDoubleClick={() => !isEditing && !isDeleting && startEditing(bug)}
                    >
                      {/* Date */}
                      <td className={CELL}>
                        <div className="text-[14px] font-bold text-slate-700">
                          {new Date(bug.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </div>
                        <div className="text-[12px] text-slate-500 font-mono">
                          {new Date(bug.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Title */}
                      <td className={CELL}>
                        {isEditing ? (
                          <input
                            value={editingRow.title}
                            onChange={(e) => setEditingRow({ ...editingRow, title: e.target.value })}
                            onKeyDown={handleKeyDown}
                            placeholder="Titre du bug..."
                            className={CELL_INPUT}
                            autoFocus
                          />
                        ) : (
                          <span className="text-[15px] font-bold text-[#1e1b2e] cursor-pointer">{bug.title}</span>
                        )}
                      </td>

                      {/* Description */}
                      <td className={CELL}>
                        {isEditing ? (
                          <input
                            value={editingRow.description}
                            onChange={(e) => setEditingRow({ ...editingRow, description: e.target.value })}
                            onKeyDown={handleKeyDown}
                            placeholder="Description..."
                            className={CELL_INPUT}
                          />
                        ) : (
                          <span className="text-[14px] text-slate-600 line-clamp-2 cursor-pointer">{bug.description || '—'}</span>
                        )}
                      </td>

                      {/* Module */}
                      <td className={CELL}>
                        {isEditing ? (
                          <select
                            value={editingRow.module}
                            onChange={(e) => setEditingRow({ ...editingRow, module: e.target.value as BugModule })}
                            className={CELL_SELECT}
                          >
                            <option value="admission">Admission</option>
                            <option value="rh">RH</option>
                            <option value="commercial">Commercial</option>
                            <option value="other">Autre</option>
                          </select>
                        ) : (
                          <span className="text-[12px] font-bold text-slate-700 bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 cursor-pointer">
                            {bug.module === 'admission' ? 'ADMISSION' : bug.module === 'rh' ? 'RH' : bug.module === 'commercial' ? 'COMMERCIAL' : 'AUTRE'}
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className={CELL}>
                        {isEditing ? (
                          <select
                            value={editingRow.priority}
                            onChange={(e) => setEditingRow({ ...editingRow, priority: e.target.value as BugPriority })}
                            className={CELL_SELECT}
                          >
                            <option value="low">Faible</option>
                            <option value="medium">Moyenne</option>
                            <option value="high">Haute</option>
                            <option value="critical">Critique</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-3 h-3 rounded-full ${priorityDot[bug.priority]}`} />
                            <span className="text-[13px] font-semibold text-slate-700">{priorityLabel[bug.priority]}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className={CELL}>
                        {isSuperAdmin ? (
                          <div className="relative">
                            <select
                              value={bug.status}
                              onChange={(e) => handleStatusChange(bug._id, e.target.value as BugStatus)}
                              className={`${CELL_SELECT} text-[10px] font-semibold`}
                            >
                              <option value="new">Nouveau</option>
                              <option value="in_progress">En cours</option>
                              <option value="resolved">Résolu</option>
                            </select>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold border ${statusStyle[bug.status]}`}>
                            {bug.status === 'new' && <AlertCircle size={12} />}
                            {bug.status === 'in_progress' && <Clock size={12} />}
                            {bug.status === 'resolved' && <CheckCircle2 size={12} />}
                            {statusLabel[bug.status]}
                          </span>
                        )}
                      </td>

                      {/* Reporter */}
                      <td className={CELL}>
                        <div className="text-[14px] font-bold text-slate-700">{bug.reporterName || 'Utilisateur'}</div>
                        <div className="text-[12px] text-slate-500">{bug.reporterEmail || bug.reporterRole}</div>
                      </td>

                      {/* Screenshot */}
                      <td className={CELL}>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              ref={editFileRef}
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp"
                              onChange={handleEditScreenshot}
                              className="hidden"
                            />
                            {(editingRow.screenshotPreview || editingRow.originalScreenshotUrl) ? (
                              <img
                                src={editingRow.screenshotPreview || editingRow.originalScreenshotUrl}
                                alt="capture"
                                className="h-8 w-12 rounded object-cover border border-[#e5e0f5] cursor-pointer"
                                onClick={() => editFileRef.current?.click()}
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => editFileRef.current?.click()}
                                className="w-8 h-8 rounded-lg bg-[#f5f3ff] border border-[#e5e0f5] flex items-center justify-center text-slate-400 hover:text-[#6d28d9] hover:border-[#6d28d9]/30 transition-colors"
                              >
                                <Image size={14} />
                              </button>
                            )}
                          </div>
                        ) : (
                          bug.screenshotUrl ? (
                            <a href={bug.screenshotUrl} target="_blank" rel="noreferrer">
                              <img src={bug.screenshotUrl} alt="capture" className="h-8 w-12 rounded object-cover border border-[#e5e0f5] hover:opacity-80 transition-opacity" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-300">—</span>
                          )
                        )}
                      </td>

                      {/* Actions */}
                      <td className={`${CELL} text-center`}>
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={saveEditing}
                              disabled={isSaving}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                              title="Sauvegarder (Enter)"
                            >
                              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={isSaving}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors disabled:opacity-50"
                              title="Annuler (Escape)"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEditing(bug)}
                              disabled={isDeleting}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                              title="Éditer (double-clic)"
                            >
                              <Edit3 size={14} />
                            </button>
                            {isSuperAdmin && (
                              <button
                                onClick={() => deleteBug(bug._id)}
                                disabled={isDeleting}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50"
                                title="Supprimer"
                              >
                                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}

              {/* ── ADD NEW TICKET ROW (BOTTOM) ── */}
              {!newRow && !editingRow && (
                <tr>
                  <td colSpan={9} className="px-6 py-4 border-t border-gray-200">
                    <button
                      onClick={handleAddRow}
                      className="w-full flex items-center justify-center gap-2 py-3 text-[#6d28d9] hover:bg-[#f5f3ff] rounded-lg transition-colors border-2 border-dashed border-[#e5e0f5] hover:border-[#6d28d9]/30"
                    >
                      <Plus size={18} />
                      <span className="text-[15px] font-semibold">Nouveau ticket</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── FOOTER ── */}
        {(bugs.length > 0 || newRow) && (
          <div className="px-4 py-2.5 border-t border-[#f3f0ff] flex items-center justify-between bg-[#faf8ff]">
            <span className="text-[10px] text-slate-400 font-medium">
              {bugs.length} ticket{bugs.length > 1 ? 's' : ''}
            </span>
            <button onClick={loadBugs} className="text-[10px] text-[#6d28d9] font-semibold hover:underline">Actualiser</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportView;
