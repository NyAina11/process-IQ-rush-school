import React, { useEffect, useMemo, useState, useRef } from 'react'; // Support View 
import { AlertCircle, Bug, CheckCircle2, ChevronDown, Clock, Edit3, Image, Loader2, Plus, RefreshCw, Save, Search, ShieldCheck, Trash2, X, User } from 'lucide-react';
import ConfirmationModal from './ui/ConfirmationModal';
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
  assignee?: string;
  deadline?: string;
  createdAt: string;
}

interface NewRow {
  title: string;
  description: string;
  module: BugModule;
  priority: BugPriority;
  screenshotFile: File | null;
  screenshotPreview: string;
  assignee: string;
  deadline: string;
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
  assignee: string;
  deadline: string;
}

const statusLabel: Record<BugStatus, string> = { new: 'NOUVEAU', in_progress: 'EN COURS', resolved: 'RÉSOLU' };
const statusStyle: Record<BugStatus, string> = {
  new: 'bg-rose-50 text-rose-600 border-rose-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-300',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-300',
};
const statusDot: Record<BugStatus, string> = {
  new: 'bg-rose-500',
  in_progress: 'bg-amber-500',
  resolved: 'bg-emerald-500',
};
const priorityLabel: Record<BugPriority, string> = { low: 'Faible', medium: 'Moyenne', high: 'Haute', critical: 'Critique' };
const priorityStyle: Record<BugPriority, string> = {
  low:      'bg-slate-50 text-slate-500 border-slate-200',
  medium:   'bg-blue-50  text-blue-700  border-blue-200',
  high:     'bg-orange-50 text-orange-700 border-orange-300',
  critical: 'bg-slate-900 text-white border-slate-900',
};
const priorityDot: Record<BugPriority, string> = { low: 'bg-slate-400', medium: 'bg-blue-500', high: 'bg-orange-500', critical: 'bg-rose-100' };

const CELL = "px-6 py-4 border-b border-[#e2e8f0] border-r border-[#e2e8f0] text-sm text-[#1e293b]";
const CELL_INPUT = "w-full px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-[4px] text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#3b7cf4] transition-all";
const CELL_SELECT = "w-full px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-[4px] text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#3b7cf4] transition-all cursor-pointer appearance-none bg-[#f4f6fb]";

const BTN_PRIMARY = "flex items-center gap-2 px-5 py-2.5 bg-[#f0f7ff] border border-[#3b7cf4] text-[#3b7cf4] rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-[#3b7cf4] hover:text-white transition-all active:scale-95 shadow-sm shadow-blue-100";
const BTN_DANGER = "flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-400 text-rose-600 rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm shadow-rose-100";
const BTN_SUCCESS = "flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-400 text-emerald-600 rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-sm shadow-emerald-100";
const BTN_ACTION = "flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-300 text-slate-500 rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-500 hover:text-white transition-all active:scale-95 shadow-sm shadow-slate-100";

/** Correction Mojibake (Double-encodage) */
const WIN1252_REVERSE: Record<number, number> = {
    0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84,
    0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88,
    0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C,
    0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93,
    0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
    0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B,
    0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F,
};

const tryDecodeWin1252AsUtf8 = (s: string): string | null => {
    try {
        const bytes = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) {
            const cp = s.charCodeAt(i);
            if (cp > 0xFF) {
                const b = WIN1252_REVERSE[cp];
                if (b === undefined) return null;
                bytes[i] = b;
            } else {
                bytes[i] = cp;
            }
        }
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch { return null; }
};

const fixEncoding = (str: string): string => {
    if (!str) return str;
    let result = str;
    for (let pass = 0; pass < 3; pass++) {
        const next = tryDecodeWin1252AsUtf8(result);
        if (next === null || next === result) break;
        result = next;
    }
    return result;
};

/** Custom status dropdown — affiche un badge coloré + menu stylisé */
const STATUS_OPTIONS: { value: BugStatus; label: string }[] = [
  { value: 'new',        label: 'NOUVEAU'  },
  { value: 'in_progress', label: 'EN COURS' },
  { value: 'resolved',   label: 'RÉSOLU'   },
];

const StatusDropdown: React.FC<{
  value: BugStatus;
  onChange: (s: BugStatus) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      {/* trigger — same badge style as read-only */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap cursor-pointer select-none transition-all hover:brightness-95 ${statusStyle[value]}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[value]}`} />
        {statusLabel[value]}
        <ChevronDown size={10} className={`ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-[200] min-w-[140px] bg-white border border-[#e2e8f0] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors hover:brightness-95 ${
                value === opt.value ? statusStyle[opt.value] + ' font-black' : 'hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[opt.value]}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                value === opt.value ? '' : {
                  new: 'text-rose-600',
                  in_progress: 'text-amber-700',
                  resolved: 'text-emerald-700',
                }[opt.value]
              }`}>
                {opt.label}
              </span>
              {value === opt.value && (
                <CheckCircle2 size={11} className="ml-auto shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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

  const stats = useMemo(() => ({
    total: bugs.length,
    newCount: bugs.filter((b) => b.status === 'new').length,
    inProgressCount: bugs.filter((b) => b.status === 'in_progress').length,
    resolvedCount: bugs.filter((b) => b.status === 'resolved').length,
  }), [bugs]);

  const resetNewRow = () => {
    setNewRow({
       title: '', description: '', module: 'other', priority: 'medium', 
       screenshotFile: null, screenshotPreview: '', assignee: '', deadline: ''
    });
  };

  const handleAddRow = () => {
    resetNewRow();
    setTimeout(() => titleRef.current?.focus(), 50);
  };

  const handleCancelRow = () => {
    if (newRow?.screenshotPreview) URL.revokeObjectURL(newRow.screenshotPreview);
    setNewRow(null);
  };

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newRow) return;
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
        assignee: newRow.assignee || undefined,
        deadline: (newRow.deadline && !isNaN(new Date(newRow.deadline).getTime())) 
          ? new Date(newRow.deadline).toISOString() 
          : undefined,
      });
      showToast('Ticket créé', 'success');
      handleCancelRow();
      await loadBugs();
    } catch (error: any) {
      showToast(error?.message || 'Erreur lors de la création', 'error');
    } finally { setSubmitting(false); }
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
    if (editingRow?.id === bug._id) return;
    setEditingRow({
      id: bug._id,
      title: bug.title,
      description: bug.description,
      module: bug.module,
      priority: bug.priority,
      screenshotFile: null,
      screenshotPreview: '',
      originalScreenshotUrl: bug.screenshotUrl,
      assignee: bug.assignee || '',
      deadline: bug.deadline ? new Date(bug.deadline).toISOString().split('T')[0] : '',
    });
  };

  const cancelEditing = () => {
    if (editingRow?.screenshotPreview) URL.revokeObjectURL(editingRow.screenshotPreview);
    setEditingRow(null);
  };

  const handleEditScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingRow) return;
    if (editingRow.screenshotPreview) URL.revokeObjectURL(editingRow.screenshotPreview);
    setEditingRow({ ...editingRow, screenshotFile: file, screenshotPreview: URL.createObjectURL(file) });
  };

  const saveEditing = async () => {
    if (!editingRow || !editingRow.title.trim()) { showToast('Le titre est requis', 'error'); return; }
    setSavingIds(prev => new Set([...prev, editingRow.id]));
    try {
      let screenshotUrl = editingRow.originalScreenshotUrl || '';
      if (editingRow.screenshotFile) screenshotUrl = await api.uploadBugScreenshot(editingRow.screenshotFile);
      await api.updateBugReport(editingRow.id, {
        title: editingRow.title.trim(),
        description: editingRow.description.trim(),
        module: editingRow.module,
        priority: editingRow.priority,
        screenshotUrl: screenshotUrl || editingRow.originalScreenshotUrl,
        assignee: editingRow.assignee,
        deadline: (editingRow.deadline && !isNaN(new Date(editingRow.deadline).getTime())) 
          ? new Date(editingRow.deadline).toISOString() 
          : undefined,
        requesterRole: role,
      });
      showToast('Ticket mis à jour avec succès', 'success');
      cancelEditing();
      await loadBugs();
    } catch (error: any) {
      console.error('Update bug failed:', error);
      const is404 = error.message?.includes('404') || error.status === 404;
      showToast(is404 ? 'Erreur 404 : Route serveur introuvable. Veuillez redémarrer le backend (docker-compose up -d --build).' : (error?.message || 'Erreur lors de la mise à jour'), 'error');
    } finally {
      setSavingIds(prev => { const newSet = new Set(prev); newSet.delete(editingRow.id); return newSet; });
    }
  };

  const deleteBug = async (id: string) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setShowDeleteModal(false);
    setPendingDeleteId(null);
    
    setDeletingIds(prev => new Set([...prev, id]));
    try {
      await api.deleteBugReport(id, role);
      showToast('Ticket supprimé', 'success');
      await loadBugs();
    } catch (error: any) {
      showToast(error?.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeletingIds(prev => { const newSet = new Set(prev); newSet.delete(id); return newSet; });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editingRow) { e.preventDefault(); saveEditing(); }
    if (e.key === 'Escape') {
      cancelEditing();
      setPreviewImage(null);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const statusTabs: { key: 'all' | BugStatus; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: stats.total },
    { key: 'new', label: 'Nouveaux', count: stats.newCount },
    { key: 'in_progress', label: 'En cours', count: stats.inProgressCount },
    { key: 'resolved', label: 'Résolus', count: stats.resolvedCount },
  ];

  return (
    <div className="animate-fade-in pb-20">

      {/* ── HEADER ── */}
      <div className="p-6 border-b border-[#e2e8f0] bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] flex items-center justify-center text-[#3b7cf4]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-[#1e293b] flex items-center gap-2 tracking-tight">
                CENTRE DE SUPPORT
                <span className="px-1.5 py-0.5 bg-[#10b981]/10 text-[#10b981] text-[9px] rounded uppercase tracking-widest font-black border border-[#10b981]/20">ADMIN</span>
              </h1>
              <p className="text-[#8898aa] text-[10px] font-bold uppercase tracking-[0.15em] mt-0.5">Gestion globale des tickets techniques</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-lg border border-[#e2e8f0]">
            {['all', 'new', 'in_progress', 'resolved'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as any)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === s 
                    ? 'bg-[#1a1f2e] text-white shadow-sm' 
                    : 'text-[#64748b] hover:bg-white'
                }`}
              >
                {s === 'all' ? 'TOUS' : statusLabel[s as BugStatus]}
                <span className={`ml-2 px-1.5 py-0.5 rounded ${statusFilter === s ? 'bg-white/20' : 'bg-[#e2e8f0]'}`}>
                  {stats[s as keyof typeof stats] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="relative group flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] transition-colors group-focus-within:text-[#3b7cf4]" size={16} />
            <input
              type="text"
              placeholder="Rechercher un ticket (titre, responsable...)"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e8f0] rounded-lg text-sm outline-none focus:border-[#3b7cf4] transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => loadBugs()} className="p-2.5 bg-white border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc] transition-all" title="Rafraîchir">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

        {/* ── TABLE ── */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-[#e2e8f0] w-[120px]">DATE</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-[#e2e8f0] min-w-[180px]">TITRE</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-[#e2e8f0] min-w-[250px]">DESCRIPTION</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-[#e2e8f0] w-[120px]">MODULE</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-[#e2e8f0] w-[130px]">PRIORITÉ</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-[#e2e8f0] w-[160px]">STATUT</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-[#e2e8f0] w-[160px]">SIGNALÉ PAR</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-[#e2e8f0] w-[130px]">ASSIGNÉ À</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-[#e2e8f0] w-[120px]">DEADLINE</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-[#e2e8f0] w-[80px]">PIÈCE JOINT</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {/* NEW ROW */}
              {newRow && (
                <tr className="bg-indigo-50/30 border-b border-indigo-100">
                  <td className={CELL}>
                    <span className="text-[11px] text-indigo-600 font-black uppercase tracking-widest">Maintenant</span>
                  </td>
                  <td className={CELL}>
                    <input ref={titleRef} value={newRow.title} onChange={(e) => setNewRow({ ...newRow, title: e.target.value })} placeholder="Titre..." className={CELL_INPUT} onKeyDown={(e) => e.key === 'Enter' && handleSubmitRow()} />
                  </td>
                  <td className={CELL}>
                    <textarea value={newRow.description} onChange={(e) => setNewRow({ ...newRow, description: e.target.value })} placeholder="Détails du bug..." className={CELL_INPUT + " min-h-[80px] resize-none"} />
                  </td>
                  <td className={CELL}>
                    <select value={newRow.module} onChange={(e) => setNewRow({ ...newRow, module: e.target.value as BugModule })} className={CELL_SELECT}>
                      <option value="admission">Admission</option><option value="rh">RH</option><option value="commercial">Commercial</option><option value="other">Autre</option>
                    </select>
                  </td>
                  <td className={CELL}>
                    <select value={newRow.priority} onChange={(e) => setNewRow({ ...newRow, priority: e.target.value as BugPriority })} className={CELL_SELECT}>
                      <option value="low">Faible</option><option value="medium">Moyenne</option><option value="high">Haute</option><option value="critical">Critique</option>
                    </select>
                  </td>
                  <td className={CELL}><span className="text-[10px] font-black text-slate-400">EN ATTENTE</span></td>
                  <td className={CELL}><span className="text-[11px] font-bold text-slate-600">{userName}</span></td>
                  <td className={CELL}>
                    {isSuperAdmin ? (
                      <input value={newRow.assignee} onChange={(e) => setNewRow({ ...newRow, assignee: e.target.value })} placeholder="Dév/Admin..." className={CELL_INPUT} onKeyDown={(e) => e.key === 'Enter' && handleSubmitRow()} />
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400">—</span>
                    )}
                  </td>
                  <td className={CELL}>
                    {isSuperAdmin ? (
                      <input type="date" value={newRow.deadline} onChange={(e) => setNewRow({ ...newRow, deadline: e.target.value })} className={CELL_INPUT} onKeyDown={(e) => e.key === 'Enter' && handleSubmitRow()} />
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400">—</span>
                    )}
                  </td>
                  <td className={CELL}>
                    <div className="flex items-center gap-2">
                       <input ref={fileRef} type="file" accept="image/*" onChange={handleScreenshot} className="hidden" />
                       {newRow.screenshotPreview ? (
                         <img src={newRow.screenshotPreview} alt="p" className="w-8 h-8 rounded-[4px] object-cover cursor-pointer border border-[#e2e8f0]" onClick={() => fileRef.current?.click()} />
                       ) : (
                         <button onClick={() => fileRef.current?.click()} className="w-8 h-8 rounded-[4px] bg-white border border-[#e2e8f0] flex items-center justify-center text-slate-400 hover:text-[#3b7cf4]"><Image size={14} /></button>
                       )}
                    </div>
                  </td>
                  <td className={CELL}>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={handleSubmitRow} disabled={submitting} className={BTN_SUCCESS}>{submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}</button>
                      <button onClick={handleCancelRow} className={BTN_ACTION}><X size={14} /></button>
                    </div>
                  </td>
                </tr>
              )}

              {loading ? (
                <tr><td colSpan={11} className="px-6 py-20 text-center"><Loader2 size={30} className="animate-spin mx-auto text-[#3b7cf4]" /><p className="mt-4 text-xs font-black uppercase tracking-widest text-[#8898aa]">Chargement des tickets...</p></td></tr>
              ) : bugs.length === 0 && !newRow ? (
                <tr><td colSpan={11} className="px-6 py-20 text-center text-slate-400 text-sm italic">Aucun ticket trouvé.</td></tr>
              ) : (
                bugs.map((bug, i) => {
                  const isEditing = editingRow?.id === bug._id;
                  const isSaving = savingIds.has(bug._id);
                  const isDeleting = deletingIds.has(bug._id);
                  const title = fixEncoding(bug.title);
                  const description = fixEncoding(bug.description || '');
                  const rName = fixEncoding(bug.reporterName || 'Utilisateur');

                  return (
                    <tr key={bug._id} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100 last:border-0">
                      <td className={CELL}><span className="text-[10px] font-black text-slate-400 font-mono tracking-tighter">{new Date(bug.createdAt).toLocaleDateString('fr-FR')}</span></td>
                      <td className={CELL}>
                        {isEditing ? (
                          <input value={editingRow.title} onChange={(e) => setEditingRow({ ...editingRow, title: e.target.value })} className={CELL_INPUT} autoFocus onKeyDown={handleKeyDown} />
                        ) : (
                          <span className="font-bold text-slate-900">{title}</span>
                        )}
                      </td>
                      <td className={CELL}>
                        {isEditing ? (
                          <textarea value={editingRow.description} onChange={(e) => setEditingRow({ ...editingRow, description: e.target.value })} className={CELL_INPUT + " min-h-[80px] resize-none"} onKeyDown={handleKeyDown} />
                        ) : (
                          <div className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap max-w-md">{description || '-'}</div>
                        )}
                      </td>
                      <td className={CELL}>
                        {isEditing ? (
                          <select value={editingRow.module} onChange={(e) => setEditingRow({ ...editingRow, module: e.target.value as BugModule })} className={CELL_SELECT}>
                            <option value="admission">Admission</option><option value="rh">RH</option><option value="commercial">Commercial</option><option value="other">Autre</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest text-slate-500">
                            <Bug size={10} className="text-indigo-400" />
                            {bug.module || 'AUTRE'}
                          </div>
                        )}
                      </td>
                      <td className={CELL}>
                        {isEditing ? (
                          <select value={editingRow.priority} onChange={(e) => setEditingRow({ ...editingRow, priority: e.target.value as BugPriority })} className={CELL_SELECT}>
                            <option value="low">Faible</option><option value="medium">Moyenne</option><option value="high">Haute</option><option value="critical">Critique</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${priorityStyle[bug.priority]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot[bug.priority]}`} />
                            {priorityLabel[bug.priority]}
                          </span>
                        )}
                      </td>
                      <td className={CELL}>
                        {isSuperAdmin ? (
                          <StatusDropdown
                            value={bug.status}
                            onChange={(next) => handleStatusChange(bug._id, next)}
                          />
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${statusStyle[bug.status]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[bug.status]}`} />
                            {statusLabel[bug.status]}
                          </span>
                        )}
                      </td>
                      <td className={CELL}>
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1e293b]">{rName}</span>
                          <span className="text-[11px] text-[#8898aa]">{bug.reporterEmail || bug.reporterRole}</span>
                        </div>
                      </td>
                        <td className={CELL}>
                          {isEditing && isSuperAdmin ? (
                            <input value={editingRow.assignee} onChange={(e) => setEditingRow({ ...editingRow, assignee: e.target.value })} placeholder="Assigner à..." className={CELL_INPUT} onKeyDown={handleKeyDown} />
                          ) : (
                            <span className="text-[11px] font-bold text-[#64748b]">{bug.assignee || '—'}</span>
                          )}
                        </td>
                        <td className={CELL}>
                          {isEditing && isSuperAdmin ? (
                            <input type="date" value={editingRow.deadline} onChange={(e) => setEditingRow({ ...editingRow, deadline: e.target.value })} className={CELL_INPUT} onKeyDown={handleKeyDown} />
                          ) : (
                            <span className={`text-[11px] font-bold ${bug.deadline && new Date(bug.deadline) < new Date() && bug.status !== 'resolved' ? 'text-rose-500' : 'text-[#64748b]'}`}>
                              {bug.deadline ? new Date(bug.deadline).toLocaleDateString('fr-FR') : '—'}
                            </span>
                          )}
                        </td>
                      <td className={CELL}>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input ref={editFileRef} type="file" onChange={handleEditScreenshot} className="hidden" />
                            {(editingRow.screenshotPreview || editingRow.originalScreenshotUrl) ? (
                              <img src={editingRow.screenshotPreview || editingRow.originalScreenshotUrl} className="w-8 h-8 rounded-[4px] object-cover border border-[#e2e8f0] cursor-pointer" onClick={() => editFileRef.current?.click()} />
                            ) : (
                              <button onClick={() => editFileRef.current?.click()} className="w-8 h-8 rounded-[4px] bg-white border border-[#e2e8f0] flex items-center justify-center text-slate-400 hover:text-[#3b7cf4]"><Image size={14} /></button>
                            )}
                          </div>
                        ) : (
                          bug.screenshotUrl ? (
                            <div className="relative group w-8 h-8">
                              <img 
                                src={bug.screenshotUrl.replace('https://processiq.duckdns.org', '')} 
                                className="w-8 h-8 rounded-[4px] object-cover border border-[#e2e8f0] cursor-zoom-in group-hover:scale-110 transition-transform" 
                                onClick={() => setPreviewImage(bug.screenshotUrl?.replace('https://processiq.duckdns.org', '') || null)}
                                title="Agrandir"
                              />
                            </div>
                          ) : <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className={CELL}>
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={saveEditing} disabled={isSaving} className={BTN_SUCCESS}>{isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}</button>
                            <button onClick={cancelEditing} className={BTN_ACTION}><X size={12} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-[#8898aa]">
                            <button onClick={() => startEditing(bug)} className={BTN_ACTION} title="Modifier"><Edit3 size={15} /></button>
                            {isSuperAdmin && (
                              <button onClick={() => deleteBug(bug._id)} className={BTN_DANGER} title="Supprimer"><Trash2 size={15} /></button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}

              {!newRow && !editingRow && (
                <tr>
                  <td colSpan={9} className="px-6 py-4 bg-[#f8fafc]">
                    <button onClick={handleAddRow} className="w-full h-12 flex items-center justify-center gap-2 border-2 border-dashed border-[#3b7cf4]/20 rounded-[4px] text-[#3b7cf4] hover:bg-[#f0f7ff] hover:border-[#3b7cf4]/50 transition-all bg-white group shadow-sm">
                      <Plus size={16} className="group-hover:scale-125 transition-transform" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Nouveau ticket support</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── FOOTER ── */}
        <div className="px-6 py-3 border-t border-[#e2e8f0] flex items-center justify-between bg-white">
          <span className="text-[10px] text-[#8898aa] font-black uppercase tracking-widest">
            {stats.total} TICKET{stats.total > 1 ? 'S' : ''} AU TOTAL
          </span>
          <button onClick={loadBugs} className={BTN_PRIMARY}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>

      {/* ── LIGHTBOX MODAL ── */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] bg-white rounded-[4px] p-2 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-[4px] bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Fermer (Echap)"
            >
              <X size={20} />
            </button>
            <img 
              src={previewImage} 
              alt="Capture full size" 
              className="max-w-full max-h-[85vh] object-contain rounded-[2px]"
            />
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Supprimer ce ticket ?"
        message="Cette action est irréversible. Le ticket de support sera définitivement supprimé."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => { setShowDeleteModal(false); setPendingDeleteId(null); }}
      />
    </div>
  );
};

export default SupportView;
