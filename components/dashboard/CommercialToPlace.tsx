import React, { useRef, useCallback } from 'react';
import { Search, List, LayoutGrid, Eye, CheckCircle2, FileUser, FileText, ChevronLeft, ChevronRight, HeartPulse, Phone, Cake, Hash } from 'lucide-react';
import Pagination from '../ui/Pagination';
import { formatFormation } from '../../utils/formatters';

interface CommercialToPlaceProps {
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
    getC: (raw: any) => any;
    isPlaced: (raw: any) => boolean;
    onPlacer?: (student: any) => void;
}

const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

const CommercialToPlace: React.FC<CommercialToPlaceProps> = ({
    candidates, searchQuery, setSearchQuery, filterFormation, setFilterFormation,
    viewMode, setViewMode, currentPage, setCurrentPage, itemsPerPage,
    handleViewDetails, getC, isPlaced, onPlacer
}) => {
    const tableScrollRef = useRef<HTMLDivElement>(null);
    const scrollAnimRef = useRef<number | null>(null);

    const startScroll = useCallback((direction: 'left' | 'right') => {
        const el = tableScrollRef.current;
        if (!el) return;
        const step = () => {
            el.scrollLeft += direction === 'right' ? 6 : -6;
            scrollAnimRef.current = requestAnimationFrame(step);
        };
        scrollAnimRef.current = requestAnimationFrame(step);
    }, []);

    const stopScroll = useCallback(() => {
        if (scrollAnimRef.current !== null) {
            cancelAnimationFrame(scrollAnimRef.current);
            scrollAnimRef.current = null;
        }
    }, []);

    const availableFormations = [
        'BTS MCO A', 'BTS MCO 2', 'BTS NDRC 1', 'BTS COM',
        'Titre Pro NTC', 'Titre Pro NTC B (rentrée decalée)', 'Bachelor RDC'
    ];

    const filteredStudents = (candidates || []).filter(c => !isPlaced(c)).filter(raw => {
        if (!raw) return false;
        const s = getC(raw);
        if (!s) return false;
        const q = (searchQuery || '').toLowerCase();
        const match = `${s.nom || ''} ${s.prenom || ''} ${s.email || ''} ${s.formation || ''} ${s.telephone || ''} ${s.numero_inscription || ''}`.toLowerCase();
        if (!match.includes(q)) return false;
        if (filterFormation && filterFormation !== 'all' && s.formation !== filterFormation) return false;
        return true;
    }).sort((a, b) => {
        const nA = parseInt(getC(a).numero_inscription || '0', 10);
        const nB = parseInt(getC(b).numero_inscription || '0', 10);
        if (!isNaN(nA) && !isNaN(nB)) return nA - nB;
        return (getC(a).numero_inscription || '').localeCompare(getC(b).numero_inscription || '');
    });

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginated = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const DocBtn = ({ has, url, name, icon: Icon, color, hoverBg }: any) => has ? (
        <button
            onClick={() => { if (!url) return; const a = document.createElement('a'); a.href = url; a.download = name || 'document'; a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
            style={{ background: `${color}15`, color, borderColor: `${color}30` }}
            title="Télécharger"
        >
            <Icon size={14} strokeWidth={2.5} />
        </button>
    ) : (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#e5e0f5] bg-[#fafafa] text-[#d1d5db]">
            <Icon size={14} strokeWidth={2.5} />
        </div>
    );

    return (
        <div className="animate-fade-in pb-10 space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* ── HERO ── */}
            <div className="relative overflow-hidden rounded-2xl min-h-[148px] flex items-center px-10 py-8"
                style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)' }}>
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
                <div className="absolute top-[-40px] right-[-40px] w-56 h-56 rounded-full opacity-20 blur-3xl" style={{ background: '#a78bfa' }} />
                <div className="absolute bottom-[-30px] left-[30%] w-40 h-40 rounded-full opacity-15 blur-2xl" style={{ background: '#c4b5fd' }} />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-lg mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/80">Recherche active • Commercial</span>
                    </div>
                    <h1 className="text-[28px] font-extrabold text-white leading-tight tracking-tight mb-1">Étudiants à placer</h1>
                    <p className="text-white/65 text-[14px] font-medium">
                        {filteredStudents.length} candidats recherchent actuellement une alternance.
                    </p>
                </div>
            </div>

            {/* ── FILTERS ── */}
            <div className="bg-white border border-[#e5e0f5] rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-sm">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, téléphone ou n° inscription..."
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
                    <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${viewMode === 'table' ? 'bg-white text-[#6d28d9] shadow-sm border border-[#e5e0f5]' : 'text-[#9ca3af] hover:text-[#6d28d9]'}`}
                    >
                        <List size={15} /> Liste
                    </button>
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${viewMode === 'cards' ? 'bg-white text-[#6d28d9] shadow-sm border border-[#e5e0f5]' : 'text-[#9ca3af] hover:text-[#6d28d9]'}`}
                    >
                        <LayoutGrid size={15} /> Cartes
                    </button>
                </div>
            </div>

            {/* ── TABLE ── */}
            {viewMode === 'table' ? (
                <div className="bg-white border border-[#e5e0f5] rounded-2xl overflow-hidden shadow-sm relative group/table">
                    <div className="absolute left-0 top-0 bottom-0 w-10 z-10 opacity-0 group-hover/table:opacity-100 transition-opacity cursor-w-resize flex items-center justify-start pl-1"
                        style={{ background: 'linear-gradient(to right, rgba(109,40,217,0.08), transparent)' }}
                        onMouseEnter={() => startScroll('left')} onMouseLeave={stopScroll}>
                        <ChevronLeft size={20} color="#6d28d9" strokeWidth={2.5} />
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-10 z-10 opacity-0 group-hover/table:opacity-100 transition-opacity cursor-e-resize flex items-center justify-end pr-1"
                        style={{ background: 'linear-gradient(to left, rgba(109,40,217,0.08), transparent)' }}
                        onMouseEnter={() => startScroll('right')} onMouseLeave={stopScroll}>
                        <ChevronRight size={20} color="#6d28d9" strokeWidth={2.5} />
                    </div>

                    <div className="overflow-x-auto" ref={tableScrollRef}>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#e5e0f5]">
                                    {['N° Inscription', 'Étudiant', 'Formation', 'Âge / Tél', 'Docs', 'Ville', 'Actions'].map(h => (
                                        <th key={h} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(raw => {
                                    const c = getC(raw);
                                    return (
                                        <tr key={c.id} className="border-b border-[#f5f3ff] hover:bg-[#fafafa] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="w-9 h-9 rounded-lg bg-[#f5f3ff] border border-[#e5e0f5] flex items-center justify-center text-[#6d28d9] font-bold text-[11px]">
                                                    {c.numero_inscription || '–'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-[#f5f3ff] border border-[#e5e0f5] flex items-center justify-center font-bold text-[#6d28d9] text-[11px]">
                                                        {String(c.nom || '?')[0]}{String(c.prenom || '?')[0]}
                                                    </div>
                                                    <div>
                                                        <div className="text-[13px] font-semibold text-[#1e1b2e]">{c.nom?.toUpperCase()} {c.prenom}</div>
                                                        <div className="text-[11px] text-[#9ca3af]">{c.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#f5f3ff] text-[#6d28d9] border border-[#e5e0f5] text-[11px] font-semibold whitespace-nowrap">
                                                    {formatFormation(c.formation)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#374151]">
                                                        <Phone size={11} color="#6d28d9" strokeWidth={2.5} />
                                                        {c.telephone || '–'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-[#9ca3af]">
                                                        <Cake size={11} color="#9ca3af" />
                                                        {calculateAge(c.date_naissance) ? `${calculateAge(c.date_naissance)} ans` : '–'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[9px] font-semibold text-[#9ca3af] uppercase tracking-wider">CV</span>
                                                        <DocBtn has={c.has_cv} url={c.cv_url} name={c.cv_name} icon={FileUser} color="#6d28d9" />
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[9px] font-semibold text-[#9ca3af] uppercase tracking-wider">Lettre</span>
                                                        <DocBtn has={c.has_lettre_motivation} url={c.lettre_motivation_url} name={c.lettre_motivation_name} icon={FileText} color="#f97316" />
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[9px] font-semibold text-[#9ca3af] uppercase tracking-wider">Vitale</span>
                                                        <DocBtn has={c.has_vitale} url={c.vitale_url} name={c.vitale_name} icon={HeartPulse} color="#22c55e" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] font-medium text-[#374151]">{c.ville}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleViewDetails(c.id)}
                                                        className="p-2 rounded-lg bg-[#f5f3ff] text-[#6d28d9] border border-[#e5e0f5] hover:bg-[#6d28d9] hover:text-white transition-all">
                                                        <Eye size={15} />
                                                    </button>
                                                    <button onClick={() => onPlacer?.(raw)}
                                                        className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/20">
                                                        <CheckCircle2 size={15} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {paginated.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-[#9ca3af] text-[13px] font-medium">
                                            Aucun étudiant ne correspond à votre recherche.
                                        </td>
                                    </tr>
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
                        return (
                            <div key={c.id} className="bg-white border border-[#e5e0f5] rounded-2xl p-6 hover:shadow-md hover:border-[#6d28d9]/20 transition-all group flex flex-col">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="w-11 h-11 rounded-xl bg-[#f5f3ff] border border-[#e5e0f5] flex items-center justify-center text-[#6d28d9] font-bold text-[13px]">
                                        {String(c.nom || '?')[0]}{String(c.prenom || '?')[0]}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="px-2.5 py-1 bg-[#f5f3ff] text-[#6d28d9] border border-[#e5e0f5] rounded-lg text-[9px] font-semibold uppercase tracking-widest">Hors poste</span>
                                        <div className="flex items-center gap-1 text-[9px] text-[#9ca3af] font-medium uppercase tracking-wider">
                                            <Hash size={9} /> {c.numero_inscription}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-[15px] font-semibold text-[#1e1b2e] mb-0.5 tracking-tight">{c.nom?.toUpperCase()} {c.prenom}</h3>
                                    <p className="text-[11px] text-[#9ca3af] truncate mb-3">{c.email}</p>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#f5f3ff] text-[#6d28d9] border border-[#e5e0f5] text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">
                                        {formatFormation(c.formation)}
                                    </span>
                                </div>

                                <div className="space-y-2.5 mb-4 flex-grow text-[12px]">
                                    {[
                                        { label: 'Localisation', value: c.ville },
                                        { label: 'Âge', value: calculateAge(c.date_naissance) ? `${calculateAge(c.date_naissance)} ans` : '–' },
                                        { label: 'Contact', value: c.telephone },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-center py-2 border-b border-[#f5f3ff]">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">{label}</span>
                                            <span className="font-medium text-[#374151]">{value || '–'}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-[#fafafa] border border-[#e5e0f5] rounded-xl mb-4">
                                    <span className="text-[9px] font-semibold text-[#9ca3af] uppercase tracking-wider mr-auto">Documents</span>
                                    <DocBtn has={c.has_cv} url={c.cv_url} name={c.cv_name} icon={FileUser} color="#6d28d9" />
                                    <DocBtn has={c.has_lettre_motivation} url={c.lettre_motivation_url} name={c.lettre_motivation_name} icon={FileText} color="#f97316" />
                                    <DocBtn has={c.has_vitale} url={c.vitale_url} name={c.vitale_name} icon={HeartPulse} color="#22c55e" />
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => handleViewDetails(c.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#e5e0f5] text-[12px] font-semibold text-[#6d28d9] hover:bg-[#f5f3ff] transition-all">
                                        <Eye size={14} /> Détails
                                    </button>
                                    <button onClick={() => onPlacer?.(raw)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-[12px] font-semibold hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/20">
                                        <CheckCircle2 size={14} strokeWidth={2.5} /> Placer
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

export default CommercialToPlace;
