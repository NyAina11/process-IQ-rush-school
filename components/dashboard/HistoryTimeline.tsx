import React, { useState } from 'react';
import { HistoryEntry } from '../../types';
import { Clock, CheckCircle2, FileText, AlertCircle, User, Building2, Loader2, Search, X, Filter } from 'lucide-react';

interface HistoryTimelineProps {
    history: HistoryEntry[];
    loading?: boolean;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ history, loading }) => {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'etudiant' | 'entreprise' | 'document' | 'other'>('all');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-[#6d28d9] mb-3" />
                <p className="text-[13px] text-slate-400 font-medium">Chargement de l'historique...</p>
            </div>
        );
    }

    if (!history || history.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-12 h-12 bg-[#f5f3ff] rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Clock size={22} className="text-[#c4b5fd]" />
                </div>
                <p className="text-[14px] text-slate-500 font-semibold">Aucun historique disponible</p>
                <p className="text-[12px] text-slate-400 mt-1">Les actions seront enregistrées ici</p>
            </div>
        );
    }

    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getType = (action: string): 'etudiant' | 'entreprise' | 'document' | 'other' => {
        const lower = action.toLowerCase();
        if (lower.includes('étudiant') || lower.includes('etudiant')) return 'etudiant';
        if (lower.includes('entreprise')) return 'entreprise';
        if (lower.includes('document') || lower.includes('cerfa') || lower.includes('convention') || lower.includes('fiche')) return 'document';
        return 'other';
    };

    const getIcon = (action: string) => {
        const type = getType(action);
        if (type === 'etudiant') return <User size={14} />;
        if (type === 'entreprise') return <Building2 size={14} />;
        if (type === 'document') return <FileText size={14} />;
        const lower = action.toLowerCase();
        if (lower.includes('création') || lower.includes('validé')) return <CheckCircle2 size={14} />;
        if (lower.includes('erreur') || lower.includes('suppression')) return <AlertCircle size={14} />;
        return <Clock size={14} />;
    };

    const getIconStyle = (action: string) => {
        const type = getType(action);
        if (type === 'etudiant') return 'bg-blue-50 text-blue-500 border-blue-200';
        if (type === 'entreprise') return 'bg-amber-50 text-amber-500 border-amber-200';
        if (type === 'document') return 'bg-violet-50 text-violet-500 border-violet-200';
        const lower = action.toLowerCase();
        if (lower.includes('création') || lower.includes('validé')) return 'bg-emerald-50 text-emerald-500 border-emerald-200';
        if (lower.includes('erreur') || lower.includes('suppression')) return 'bg-rose-50 text-rose-500 border-rose-200';
        return 'bg-slate-50 text-slate-400 border-slate-200';
    };

    const getTypeBadge = (action: string) => {
        const type = getType(action);
        const styles: Record<string, { label: string; cls: string }> = {
            etudiant: { label: 'Étudiant', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
            entreprise: { label: 'Entreprise', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
            document: { label: 'Document', cls: 'bg-violet-50 text-violet-600 border-violet-200' },
            other: { label: 'Autre', cls: 'bg-slate-50 text-slate-500 border-slate-200' },
        };
        const s = styles[type];
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${s.cls}`}>
                {s.label}
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return {
                date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                year: d.getFullYear().toString(),
            };
        } catch {
            return { date: dateStr, time: '', year: '' };
        }
    };

    // Filter
    const filtered = sortedHistory.filter((item) => {
        if (typeFilter !== 'all' && getType(item.action) !== typeFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                item.action.toLowerCase().includes(q) ||
                (item.details || '').toLowerCase().includes(q) ||
                (item.utilisateur || '').toLowerCase().includes(q)
            );
        }
        return true;
    });

    const typeTabs: { key: typeof typeFilter; label: string; count: number }[] = [
        { key: 'all', label: 'Tout', count: sortedHistory.length },
        { key: 'etudiant', label: 'Étudiants', count: sortedHistory.filter(h => getType(h.action) === 'etudiant').length },
        { key: 'entreprise', label: 'Entreprises', count: sortedHistory.filter(h => getType(h.action) === 'entreprise').length },
        { key: 'document', label: 'Documents', count: sortedHistory.filter(h => getType(h.action) === 'document').length },
    ];

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {typeTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setTypeFilter(tab.key)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                            typeFilter === tab.key
                                ? 'bg-[#6d28d9] text-white border-[#6d28d9]'
                                : 'bg-[#fafafa] text-slate-500 border-[#e5e0f5] hover:bg-[#f5f3ff] hover:text-[#6d28d9]'
                        }`}
                    >
                        {tab.label}
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                            typeFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}

                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-[#fafafa] border border-[#e5e0f5] rounded-lg ml-auto max-w-xs">
                    <Search size={13} className="text-slate-400 shrink-0" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher..."
                        className="bg-transparent text-[12px] outline-none w-full placeholder-slate-400"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-slate-300 hover:text-slate-500">
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="border border-[#e5e0f5] rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#faf8ff]">
                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#ece7ff] w-[100px]">Date</th>
                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#ece7ff] w-[40px]"></th>
                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#ece7ff]">Action</th>
                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#ece7ff] w-[100px]">Type</th>
                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#ece7ff] w-[140px]">Utilisateur</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center">
                                    <div className="w-10 h-10 rounded-xl bg-[#f5f3ff] flex items-center justify-center mx-auto mb-2">
                                        <Filter size={18} className="text-[#c4b5fd]" />
                                    </div>
                                    <p className="text-[13px] text-slate-400 font-medium">Aucun résultat</p>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((item, i) => {
                                const d = formatDate(item.date);
                                return (
                                    <tr
                                        key={item.id || i}
                                        className={`group hover:bg-[#fcfbff] transition-colors ${i !== filtered.length - 1 ? 'border-b border-[#f3f0ff]' : ''}`}
                                    >
                                        {/* Date */}
                                        <td className="px-4 py-3 align-top">
                                            <div className="text-[12px] font-semibold text-slate-600">{d.date}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">{d.time}</div>
                                        </td>

                                        {/* Icon */}
                                        <td className="px-2 py-3 align-top">
                                            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${getIconStyle(item.action)}`}>
                                                {getIcon(item.action)}
                                            </div>
                                        </td>

                                        {/* Action + Details */}
                                        <td className="px-4 py-3 align-top">
                                            <div className="text-[13px] font-bold text-[#1e1b2e] leading-tight">{item.action}</div>
                                            {item.details && (
                                                <div className="text-[12px] text-slate-400 leading-snug mt-0.5 line-clamp-2">{item.details}</div>
                                            )}
                                        </td>

                                        {/* Type badge */}
                                        <td className="px-4 py-3 align-top">
                                            {getTypeBadge(item.action)}
                                        </td>

                                        {/* User */}
                                        <td className="px-4 py-3 align-top">
                                            {item.utilisateur ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                                                    <User size={10} className="text-slate-400" />
                                                    {item.utilisateur}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-300">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            {filtered.length > 0 && (
                <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] text-slate-400 font-medium">
                        {filtered.length} action{filtered.length > 1 ? 's' : ''}{filtered.length !== sortedHistory.length ? ` sur ${sortedHistory.length}` : ''}
                    </span>
                </div>
            )}
        </div>
    );
};

export default HistoryTimeline;
