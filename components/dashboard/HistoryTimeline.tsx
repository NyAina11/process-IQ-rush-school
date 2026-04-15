import React, { useState } from 'react';
import { HistoryEntry } from '../../types';
import { Clock, CheckCircle2, FileText, AlertCircle, User, Building2, Loader2, Search, X, Filter } from 'lucide-react';

interface HistoryTimelineProps {
    history: HistoryEntry[];
    loading?: boolean;
}

/** Table inverse Windows-1252 → byte d'origine
 *  Les chars U+0080–U+009F de CP-1252 ne correspondent PAS aux mêmes codepoints Latin-1. */
const WIN1252_REVERSE: Record<number, number> = {
    0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84,
    0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88,
    0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C,
    0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93,
    0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
    0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B,
    0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F,
};

/** Une seule passe de décodage Windows-1252 → UTF-8.
 *  Retourne null si le résultat n'est pas du UTF-8 valide. */
const tryDecodeWin1252AsUtf8 = (s: string): string | null => {
    try {
        const bytes = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) {
            const cp = s.charCodeAt(i);
            if (cp > 0xFF) {
                const b = WIN1252_REVERSE[cp];
                if (b === undefined) return null; // unmappable char — abort
                bytes[i] = b;
            } else {
                bytes[i] = cp;
            }
        }
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
        return null;
    }
};

/** Corrige le double-encodage UTF-8/Windows-1252 (Mojibake) jusqu'à 3 passes.
 *  Ex : "Ãƒâ€°tudiant" → "Ã‰tudiant" → "Étudiant" */
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

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ history, loading }) => {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'etudiant' | 'entreprise' | 'document' | 'other'>('all');

    if (loading) {
        return (
            <div className="space-y-3">
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="flex items-start gap-4 px-4 py-3 border-b border-[#e2e8f0] animate-pulse last:border-b-0">
                        <div className="w-16 flex-shrink-0">
                            <div className="h-3 bg-[#e2e8f0] rounded-[4px] w-10 mb-1.5" />
                            <div className="h-2.5 bg-[#f4f6fb] rounded-[4px] w-8" />
                        </div>
                        <div className="w-7 h-7 rounded-[4px] bg-[#e2e8f0] flex-shrink-0" />
                        <div className="flex-1">
                            <div className="h-3 bg-[#e2e8f0] rounded-[4px] w-48 mb-1.5" />
                            <div className="h-2.5 bg-[#f4f6fb] rounded-[4px] w-64" />
                        </div>
                        <div className="h-5 bg-[#f4f6fb] rounded-[4px] w-16" />
                        <div className="h-3 bg-[#f4f6fb] rounded-[4px] w-20" />
                    </div>
                ))}
            </div>
        );
    }

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 bg-[#f4f6fb] border border-[#e2e8f0] rounded-[4px] flex items-center justify-center mx-auto mb-4">
                    <Clock size={24} className="text-slate-300" />
                </div>
                <p className="text-[14px] font-black text-slate-700 mb-1">Aucun historique disponible</p>
                <p className="text-[12px] text-slate-400 font-medium">Les actions effectuées seront enregistrées ici</p>
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

    // Icon badge — same token system as Doc icons in the main table
    const getIconStyle = (action: string): string => {
        const type = getType(action);
        if (type === 'etudiant')    return 'bg-[#dbeafe] text-[#1d4ed8] border-[#93c5fd]';    // blue  — CIN
        if (type === 'entreprise')  return 'bg-[#fef3c7] text-[#d97706] border-[#fcd34d]';    // amber — Diplôme
        if (type === 'document')    return 'bg-[#ede9fe] text-[#7c3aed] border-[#c4b5fd]';    // violet — CERFA
        const lower = action.toLowerCase();
        if (lower.includes('création') || lower.includes('validé'))
                                    return 'bg-[#d1fae5] text-[#10c98f] border-[#6ee7b7]';    // green — Fiche
        if (lower.includes('erreur') || lower.includes('suppression'))
                                    return 'bg-[#fee2e2] text-[#b91c1c] border-[#fca5a5]';    // red
        return 'bg-[#f4f6fb] text-slate-400 border-[#e2e8f0]';
    };

    const getTypeBadge = (action: string) => {
        const type = getType(action);
        const styles: Record<string, { label: string; cls: string }> = {
            etudiant:   { label: 'Étudiant',   cls: 'bg-[#dbeafe] text-[#1d4ed8] border-[#93c5fd]' },
            entreprise: { label: 'Entreprise', cls: 'bg-[#fef3c7] text-[#d97706] border-[#fcd34d]' },
            document:   { label: 'Document',   cls: 'bg-[#ede9fe] text-[#7c3aed] border-[#c4b5fd]' },
            other:      { label: 'Autre',      cls: 'bg-[#f4f6fb] text-slate-500 border-[#e2e8f0]' },
        };
        const s = styles[type];
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest border ${s.cls}`}>
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
            };
        } catch {
            return { date: dateStr, time: '' };
        }
    };

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
        { key: 'all',        label: 'Tout',        count: sortedHistory.length },
        { key: 'etudiant',   label: 'Étudiants',   count: sortedHistory.filter(h => getType(h.action) === 'etudiant').length },
        { key: 'entreprise', label: 'Entreprises', count: sortedHistory.filter(h => getType(h.action) === 'entreprise').length },
        { key: 'document',   label: 'Documents',   count: sortedHistory.filter(h => getType(h.action) === 'document').length },
    ];

    return (
        <div className="space-y-4">

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-0 bg-white border border-[#e2e8f0] overflow-hidden">
                {/* Filter pills — same pattern as "Tous / Avec Fiche / Complets" tabs */}
                {typeTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setTypeFilter(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all border-r border-[#e2e8f0] whitespace-nowrap ${
                            typeFilter === tab.key
                                ? 'bg-[#1a1f2e] text-white'
                                : 'text-slate-500 hover:bg-[#f4f6fb]'
                        }`}
                    >
                        {tab.label}
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-[4px] ${
                            typeFilter === tab.key ? 'bg-white/20 text-white' : 'bg-[#f4f6fb] text-slate-400'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}

                {/* Search — same style as the search bar in the main table toolbar */}
                <div className="flex items-center gap-2 px-3 py-2.5 ml-auto border-l border-[#e2e8f0] min-w-[220px]">
                    <Search size={13} className="text-slate-400 shrink-0" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher..."
                        className="bg-transparent text-[12px] outline-none w-full placeholder:text-slate-400 text-slate-700 font-medium"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-slate-300 hover:text-slate-500 transition-colors">
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Table — same token language as the student table ── */}
            <div className="bg-white border border-[#e2e8f0] overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#f4f6fb] border-b border-[#e2e8f0]">
                            <th className="px-5 py-4 text-left text-[10px] font-bold text-[#8898aa] uppercase tracking-[0.08em] w-[110px]">Date</th>
                            <th className="px-3 py-4 text-left text-[10px] font-bold text-[#8898aa] uppercase tracking-[0.08em] w-[40px]"></th>
                            <th className="px-5 py-4 text-left text-[10px] font-bold text-[#8898aa] uppercase tracking-[0.08em]">Action</th>
                            <th className="px-5 py-4 text-left text-[10px] font-bold text-[#8898aa] uppercase tracking-[0.08em] w-[110px]">Type</th>
                            <th className="px-5 py-4 text-left text-[10px] font-bold text-[#8898aa] uppercase tracking-[0.08em] w-[160px]">Utilisateur</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                    <div className="w-14 h-14 bg-[#f4f6fb] border border-[#e2e8f0] flex items-center justify-center mx-auto mb-4">
                                        <Filter size={24} className="text-slate-300" />
                                    </div>
                                    <div className="text-slate-700 font-black text-sm mb-1">Aucun résultat</div>
                                    <p className="text-slate-400 text-xs font-medium">Modifiez votre recherche ou votre filtre.</p>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((item, i) => {
                                const d = formatDate(item.date);
                                const action = fixEncoding(item.action);
                                const details = fixEncoding(item.details || '');
                                const utilisateur = fixEncoding(item.utilisateur || '');
                                return (
                                    <tr
                                        key={item.id || i}
                                        className="hover:bg-[#f4f6fb] transition-colors border-b border-[#e2e8f0] last:border-b-0"
                                    >
                                        {/* Date */}
                                        <td className="px-5 py-3 align-middle">
                                            <div className="text-[12px] font-bold text-[#1e293b]">{d.date}</div>
                                            <div className="text-[10px] text-[#8898aa] font-mono mt-0.5">{d.time}</div>
                                        </td>

                                        {/* Icon — same w-8 h-8 rounded-[4px] style as doc icons */}
                                        <td className="px-3 py-3 align-middle">
                                            <div className={`w-8 h-8 rounded-[4px] border flex items-center justify-center ${getIconStyle(action)}`}>
                                                {getIcon(action)}
                                            </div>
                                        </td>

                                        {/* Action + Details */}
                                        <td className="px-5 py-3 align-middle">
                                            <div className="text-[13px] font-bold text-[#1e293b] leading-tight">{action}</div>
                                            {details && (
                                                <div className="text-[11px] text-[#8898aa] leading-snug mt-0.5 line-clamp-2">{details}</div>
                                            )}
                                        </td>

                                        {/* Type badge */}
                                        <td className="px-5 py-3 align-middle">
                                            {getTypeBadge(action)}
                                        </td>

                                        {/* User */}
                                        <td className="px-5 py-3 align-middle">
                                            {utilisateur ? (
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#475569]">
                                                    <User size={10} className="text-[#8898aa]" />
                                                    {utilisateur}
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

            {/* Footer count — same style as pagination label */}
            {filtered.length > 0 && (
                <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] text-[#8898aa] font-medium">
                        {filtered.length} action{filtered.length > 1 ? 's' : ''}
                        {filtered.length !== sortedHistory.length ? ` sur ${sortedHistory.length}` : ''}
                    </span>
                </div>
            )}
        </div>
    );
};

export default HistoryTimeline;
