import React from 'react';
import { CheckCircle2, Download, Search, List, LayoutGrid, Eye, Edit, Users, FileCheck, Building, GraduationCap, MapPin, ArrowUpRight } from 'lucide-react';
import Pagination from '../ui/Pagination';
import { formatFormation } from '../../utils/formatters';

interface CommercialAlternanceProps {
    candidates: any[];
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    filterFormation: string;
    setFilterFormation: (val: string) => void;
    viewMode: 'table' | 'cards';
    setViewMode: (val: 'table' | 'cards') => void;
    currentPage: number;
    setCurrentPage: (val: number) => void;
    itemsPerPage: number;
    handleViewDetails: (id: string) => void;
    handleEdit: (id: string) => void;
    getC: (raw: any) => any;
    isPlaced: (raw: any) => boolean;
    statsPlaced: any;
}

const formationColor = (f: string) => {
    if ((f || '').includes('MCO')) return { bg: '#eff6ff', text: '#3b82f6', border: '#bfdbfe' };
    if ((f || '').includes('NDRC')) return { bg: '#f0fdf4', text: '#22c55e', border: '#bbf7d0' };
    if ((f || '').includes('RDC') || (f || '').includes('Bachelor')) return { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' };
    return { bg: '#fff7ed', text: '#f97316', border: '#fed7aa' };
};

const CommercialAlternance: React.FC<CommercialAlternanceProps> = ({
    candidates, searchQuery, setSearchQuery, filterFormation, setFilterFormation,
    viewMode, setViewMode, currentPage, setCurrentPage, itemsPerPage,
    handleViewDetails, handleEdit, getC, isPlaced, statsPlaced
}) => {
    const availableFormations = [
        'BTS MCO A', 'BTS MCO 2', 'BTS NDRC 1', 'BTS COM',
        'Titre Pro NTC', 'Titre Pro NTC B (rentrée decalée)', 'Bachelor RDC'
    ];

    const filteredStudents = (candidates || []).filter(c => isPlaced(c)).filter(raw => {
        if (!raw) return false;
        const c = getC(raw);
        if (!c) return false;
        const q = (searchQuery || '').toLowerCase();
        const match = `${c.nom || ''} ${c.prenom || ''} ${c.email || ''} ${c.telephone || ''}`.toLowerCase();
        const matchesSearch = match.includes(q);
        const formation = String(c.formation || '').toLowerCase();
        const matchesFormation = filterFormation === 'all' || !filterFormation || formation === filterFormation.toLowerCase() || formation.includes(filterFormation.toLowerCase());
        return matchesSearch && matchesFormation;
    });

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginated = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const stats = [
        { label: 'Total Alternants', value: statsPlaced.total, icon: Users, bg: '#f5f3ff', color: '#6d28d9', trend: 'Actif', trendIcon: CheckCircle2 },
        { label: 'Contrats signés', value: statsPlaced.contratsSignes, icon: FileCheck, bg: '#f0fdf4', color: '#22c55e', trend: `${statsPlaced.total > 0 ? Math.round((statsPlaced.contratsSignes / statsPlaced.total) * 100) : 0}%`, trendIcon: ArrowUpRight },
        { label: 'Entreprises partenaires', value: statsPlaced.entreprisesPartenaires, icon: Building, bg: '#eff6ff', color: '#3b82f6', trend: 'Diversifié', trendIcon: MapPin },
        { label: 'Missions validées', value: statsPlaced.missionsValidees, icon: GraduationCap, bg: '#fdf4ff', color: '#a855f7', trend: `${statsPlaced.total > 0 ? Math.round((statsPlaced.missionsValidees / statsPlaced.total) * 100) : 0}%`, trendIcon: CheckCircle2 },
    ];

    return (
        <div className="animate-fade-in pb-10 space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* ── HERO ── */}
            <div className="relative overflow-hidden rounded-2xl min-h-[148px] flex items-center px-10 py-8"
                style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)' }}>
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
                <div className="absolute top-[-40px] right-[-40px] w-56 h-56 rounded-full opacity-20 blur-3xl" style={{ background: '#a78bfa' }} />
                <div className="absolute bottom-[-30px] left-[30%] w-40 h-40 rounded-full opacity-15 blur-2xl" style={{ background: '#c4b5fd' }} />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-lg mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/80">Contrats actifs • Commercial</span>
                        </div>
                        <h1 className="text-[28px] font-extrabold text-white leading-tight tracking-tight mb-1">Élèves en alternance</h1>
                        <p className="text-white/65 text-[14px] font-medium">
                            Félicitations à nos alternants. Suivez leur progression et gérez les documents de placement.
                        </p>
                    </div>
                    <button className="shrink-0 flex items-center gap-2 px-5 py-3 bg-white/15 border border-white/30 backdrop-blur-sm rounded-xl text-white text-[13px] font-semibold hover:bg-white/25 transition-all">
                        <Download size={16} /> Exporter la liste
                    </button>
                </div>
            </div>

            {/* ── STATS ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white border border-[#e5e0f5] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                                <s.icon size={20} color={s.color} />
                            </div>
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold" style={{ background: s.bg, color: s.color }}>
                                <s.trendIcon size={11} strokeWidth={2.5} /> {s.trend}
                            </span>
                        </div>
                        <div className="text-3xl font-black text-[#1e1b2e] mb-1">{s.value}</div>
                        <div className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-widest">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── FILTERS ── */}
            <div className="bg-white border border-[#e5e0f5] rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-sm">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher un alternant..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#fafafa] border border-[#e5e0f5] rounded-xl text-[13px] font-medium text-[#374151] placeholder:text-[#9ca3af] outline-none focus:border-[#6d28d9]/40 focus:bg-white transition-all"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2.5 bg-[#fafafa] border border-[#e5e0f5] rounded-xl text-[13px] font-medium text-[#374151] outline-none focus:border-[#6d28d9]/40 cursor-pointer transition-all"
                    value={filterFormation}
                    onChange={e => setFilterFormation(e.target.value)}
                >
                    <option value="all">Toutes formations</option>
                    {availableFormations.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <div className="flex items-center gap-1 p-1 bg-[#f5f3ff] rounded-xl border border-[#e5e0f5]">
                    <button onClick={() => setViewMode('table')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${viewMode === 'table' ? 'bg-white text-[#6d28d9] shadow-sm border border-[#e5e0f5]' : 'text-[#9ca3af] hover:text-[#6d28d9]'}`}>
                        <List size={15} /> Liste
                    </button>
                    <button onClick={() => setViewMode('cards')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${viewMode === 'cards' ? 'bg-white text-[#6d28d9] shadow-sm border border-[#e5e0f5]' : 'text-[#9ca3af] hover:text-[#6d28d9]'}`}>
                        <LayoutGrid size={15} /> Cartes
                    </button>
                </div>
            </div>

            {/* ── TABLE ── */}
            {viewMode === 'table' ? (
                <div className="bg-white border border-[#e5e0f5] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#e5e0f5]">
                                    {['Formation', 'Étudiant', 'Entreprise', 'Ville', 'Actions'].map(h => (
                                        <th key={h} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(raw => {
                                    const c = getC(raw);
                                    const fc = formationColor(c.formation);
                                    return (
                                        <tr key={c.id} className="border-b border-[#f5f3ff] hover:bg-[#fafafa] transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap"
                                                    style={{ background: fc.bg, color: fc.text, border: `1px solid ${fc.border}` }}>
                                                    {formatFormation(c.formation)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-[#f5f3ff] border border-[#e5e0f5] flex items-center justify-center text-[#6d28d9] font-bold text-[11px]">
                                                        {c.nom?.[0]}{c.prenom?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="text-[13px] font-semibold text-[#1e1b2e]">{c.nom?.toUpperCase()} {c.prenom}</div>
                                                        <div className="text-[11px] text-[#9ca3af]">{c.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#f5f3ff] text-[#6d28d9] border border-[#e5e0f5] text-[11px] font-semibold">
                                                    {c.entreprise || '–'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] font-medium text-[#374151]">{c.ville}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleViewDetails(c.id)}
                                                        className="p-2 rounded-lg bg-[#f5f3ff] text-[#6d28d9] border border-[#e5e0f5] hover:bg-[#6d28d9] hover:text-white transition-all">
                                                        <Eye size={15} />
                                                    </button>
                                                    <button onClick={() => handleEdit(c.id)}
                                                        className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all">
                                                        <Edit size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {paginated.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-16 text-center text-[#9ca3af] text-[13px] font-medium">Aucun alternant trouvé.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* ── CARDS ── */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginated.map(raw => {
                        const c = getC(raw);
                        const fc = formationColor(c.formation);
                        return (
                            <div key={c.id} className="bg-white border border-[#e5e0f5] rounded-2xl p-6 hover:shadow-md hover:border-[#6d28d9]/20 transition-all flex flex-col">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="w-11 h-11 rounded-xl bg-[#f5f3ff] border border-[#e5e0f5] flex items-center justify-center text-[#6d28d9] font-bold text-[13px]">
                                        {c.nom?.[0]}{c.prenom?.[0]}
                                    </div>
                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-semibold uppercase tracking-widest">
                                        Contrat actif
                                    </span>
                                </div>

                                <h3 className="text-[15px] font-semibold text-[#1e1b2e] mb-2 tracking-tight">{c.nom?.toUpperCase()} {c.prenom}</h3>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider mb-4 w-fit whitespace-nowrap"
                                    style={{ background: fc.bg, color: fc.text, border: `1px solid ${fc.border}` }}>
                                    {formatFormation(c.formation)}
                                </span>

                                <div className="space-y-2.5 mb-5 flex-grow">
                                    {[
                                        { label: 'Entreprise', value: c.entreprise },
                                        { label: 'Localisation', value: c.ville },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-center py-2 border-b border-[#f5f3ff] text-[12px]">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">{label}</span>
                                            <span className="font-medium text-[#374151]">{value || '–'}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => handleViewDetails(c.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#e5e0f5] text-[12px] font-semibold text-[#6d28d9] hover:bg-[#f5f3ff] transition-all">
                                        <Eye size={14} /> Détails
                                    </button>
                                    <button onClick={() => handleEdit(c.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6d28d9] text-white text-[12px] font-semibold hover:bg-[#5b21b6] transition-all shadow-sm shadow-[#6d28d9]/20">
                                        <Edit size={14} /> Modifier
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
};

export default CommercialAlternance;
