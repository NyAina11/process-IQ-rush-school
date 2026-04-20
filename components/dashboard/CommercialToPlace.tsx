import React, { useRef, useCallback, memo, useMemo } from 'react';
import { Search, List, LayoutGrid, Eye, CheckCircle2, FileUser, FileText, ChevronLeft, ChevronRight, HeartPulse, Phone, Cake } from 'lucide-react';
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
    statsToPlace?: { total: number; enCours: number; cvAActualiser: number };
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

const CommercialToPlace: React.FC<CommercialToPlaceProps> = memo(({
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

    const { filteredStudents, paginated, totalPages } = useMemo(() => {
        const filtered = (candidates || []).filter(c => !isPlaced(c)).map(raw => ({
            raw,
            normalized: getC(raw)
        })).filter(({ normalized: s }) => {
            if (!s) return false;
            const q = (searchQuery || '').toLowerCase();
            const match = `${s.nom || ''} ${s.prenom || ''} ${s.email || ''} ${s.formation || ''} ${s.telephone || ''} ${s.numero_inscription || ''}`.toLowerCase();
            if (!match.includes(q)) return false;
            if (filterFormation && filterFormation !== 'all' && s.formation !== filterFormation) return false;
            return true;
        }).sort((a, b) => {
            const nA = parseInt(a.normalized.numero_inscription || '0', 10);
            const nB = parseInt(b.normalized.numero_inscription || '0', 10);
            if (!isNaN(nA) && !isNaN(nB)) return nA - nB;
            return (a.normalized.numero_inscription || '').localeCompare(b.normalized.numero_inscription || '');
        });

        return {
            filteredStudents: filtered,
            totalPages: Math.ceil(filtered.length / itemsPerPage),
            paginated: filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        };
    }, [candidates, searchQuery, filterFormation, currentPage, itemsPerPage, getC, isPlaced]);

    const DocBtn = ({ has, url, name, icon: Icon, color, label }: any) => (
        <div className="flex flex-col items-center gap-1">
            <span style={{ fontSize: 9, fontWeight: 700, color: '#8b92a9', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
            {has ? (
                <button
                    onClick={() => { if (!url) return; const a = document.createElement('a'); a.href = url; a.download = name || 'document'; a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a); }}
                    className="flex items-center justify-center transition-all hover:scale-105"
                    style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e8eaf0', background: `${color}15`, color }}
                    title="Telecharger"
                >
                    <Icon size={14} strokeWidth={2.5} />
                </button>
            ) : (
                <div className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e8eaf0', background: '#f9fafb', color: '#d1d5db' }}>
                    <Icon size={14} strokeWidth={2.5} />
                </div>
            )}
        </div>
    );

    return (
        <div className="pb-10 space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* HERO CARD */}
            <div
                className="relative overflow-hidden flex items-center"
                style={{
                    background: '#eef0fb',
                    border: '1px solid #dde0f5',
                    borderRadius: 16,
                    padding: '28px 32px',
                    minHeight: 140,
                }}
            >
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 mb-3" style={{ background: '#22c55e', borderRadius: 20, padding: '4px 12px' }}>
                        <span className="animate-pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffffff', display: 'inline-block' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ffffff' }}>
                            Recherche active
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', opacity: 0.8 }}>&bull;</span>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ffffff' }}>
                            Commercial
                        </span>
                    </div>
                    <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1a1d2e', lineHeight: 1.2, marginBottom: 4 }}>
                        Etudiants a placer
                    </h1>
                    <p style={{ fontSize: 13, fontWeight: 400, color: '#6b7280' }}>
                        {filteredStudents.length} candidats recherchent actuellement une alternance.
                    </p>
                </div>
            </div>

            {/* FILTERS */}
            <div
                className="flex flex-wrap items-center gap-3"
                style={{
                    background: '#ffffff',
                    border: '1px solid #e8eaf0',
                    borderRadius: 12,
                    padding: 16,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
            >
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, telephone ou n inscription..."
                        className="w-full outline-none transition-all"
                        style={{
                            paddingLeft: 36,
                            paddingRight: 14,
                            paddingTop: 8,
                            paddingBottom: 8,
                            background: '#ffffff',
                            border: '1px solid #e8eaf0',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#1a1d2e',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="outline-none cursor-pointer transition-all"
                    style={{
                        padding: '8px 14px',
                        background: '#ffffff',
                        border: '1px solid #e8eaf0',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#1a1d2e',
                    }}
                    value={filterFormation}
                    onChange={e => setFilterFormation(e.target.value)}
                >
                    <option value="all">Toutes formations</option>
                    {availableFormations.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <div className="flex items-center gap-1" style={{ background: '#f0f2f8', borderRadius: 8, padding: 4 }}>
                    <button
                        onClick={() => setViewMode('table')}
                        className="flex items-center gap-2 px-4 py-2 transition-all"
                        style={{
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            background: viewMode === 'table' ? '#ffffff' : 'transparent',
                            color: viewMode === 'table' ? '#6c63ff' : '#9ca3af',
                            boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                            border: viewMode === 'table' ? '1px solid #e8eaf0' : '1px solid transparent',
                        }}
                    >
                        <List size={15} /> Liste
                    </button>
                    <button
                        onClick={() => setViewMode('cards')}
                        className="flex items-center gap-2 px-4 py-2 transition-all"
                        style={{
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                            color: viewMode === 'cards' ? '#6c63ff' : '#9ca3af',
                            boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                            border: viewMode === 'cards' ? '1px solid #e8eaf0' : '1px solid transparent',
                        }}
                    >
                        <LayoutGrid size={15} /> Cartes
                    </button>
                </div>
            </div>

            {/* TABLE VIEW */}
            {viewMode === 'table' ? (
                <div
                    className="overflow-hidden relative group/table"
                    style={{
                        background: '#ffffff',
                        border: '1px solid #e8eaf0',
                        borderRadius: 12,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                >
                    {/* Scroll arrows */}
                    <div className="absolute left-0 top-0 bottom-0 w-10 z-10 opacity-0 group-hover/table:opacity-100 transition-opacity cursor-w-resize flex items-center justify-start pl-1"
                        style={{ background: 'linear-gradient(to right, rgba(108,99,255,0.08), transparent)' }}
                        onMouseEnter={() => startScroll('left')} onMouseLeave={stopScroll}>
                        <ChevronLeft size={20} style={{ color: '#6c63ff' }} strokeWidth={2.5} />
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-10 z-10 opacity-0 group-hover/table:opacity-100 transition-opacity cursor-e-resize flex items-center justify-end pr-1"
                        style={{ background: 'linear-gradient(to left, rgba(108,99,255,0.08), transparent)' }}
                        onMouseEnter={() => startScroll('right')} onMouseLeave={stopScroll}>
                        <ChevronRight size={20} style={{ color: '#6c63ff' }} strokeWidth={2.5} />
                    </div>

                    <div className="overflow-x-auto" ref={tableScrollRef}>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e8eaf0' }}>
                                    {['N\u00b0 Inscription', 'Etudiant', 'Formation', 'Age / Tel', 'Docs', 'Ville', 'Actions'].map(h => (
                                        <th key={h} className="px-6" style={{
                                            paddingTop: 14,
                                            paddingBottom: 8,
                                            fontSize: 10,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            color: '#8b92a9',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(({ raw, normalized: c }) => {
                                    return (
                                        <tr key={c.id} className="group" style={{ borderBottom: '1px solid #f0f2f8', transition: 'background 150ms ease' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                            {/* N inscription */}
                                            <td className="px-6" style={{ paddingTop: 14, paddingBottom: 14 }}>
                                                <div className="flex items-center justify-center" style={{
                                                    width: 32, height: 32, borderRadius: 8,
                                                    background: '#f0f2f8', fontSize: 12, fontWeight: 700, color: '#6b7280',
                                                }}>
                                                    {c.numero_inscription || '\u2013'}
                                                </div>
                                            </td>
                                            {/* Etudiant */}
                                            <td className="px-6" style={{ paddingTop: 14, paddingBottom: 14 }}>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center" style={{
                                                        width: 36, height: 36, borderRadius: 8,
                                                        background: '#ede9ff', color: '#6c63ff',
                                                        fontSize: 12, fontWeight: 700,
                                                    }}>
                                                        {String(c.prenom || '?')[0]}{String(c.nom || '?')[0]}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1d2e' }}>
                                                            {c.nom?.toUpperCase()} {c.prenom}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                                                            {c.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Formation */}
                                            <td className="px-6" style={{ paddingTop: 14, paddingBottom: 14 }}>
                                                <span className="inline-flex items-center whitespace-nowrap" style={{
                                                    padding: '4px 10px', borderRadius: 6,
                                                    background: '#f0f2f8', border: '1px solid #e8eaf0',
                                                    fontSize: 12, fontWeight: 500, color: '#6b7280',
                                                }}>
                                                    {formatFormation(c.formation)}
                                                </span>
                                            </td>
                                            {/* Age / Tel */}
                                            <td className="px-6" style={{ paddingTop: 14, paddingBottom: 14 }}>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 500, color: '#1a1d2e' }}>
                                                        <Phone size={12} style={{ color: '#6c63ff' }} strokeWidth={2} />
                                                        {c.telephone || '\u2013'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: '#9ca3af' }}>
                                                        <Cake size={11} style={{ color: '#9ca3af' }} />
                                                        {calculateAge(c.date_naissance) ? `${calculateAge(c.date_naissance)} ans` : '\u2013'}
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Docs */}
                                            <td className="px-6" style={{ paddingTop: 14, paddingBottom: 14 }}>
                                                <div className="flex items-center gap-2">
                                                    <DocBtn has={c.has_cv} url={c.cv_url} name={c.cv_name} icon={FileUser} color="#6c63ff" label="CV" />
                                                    <DocBtn has={c.has_lettre_motivation} url={c.lettre_motivation_url} name={c.lettre_motivation_name} icon={FileText} color="#f97316" label="Lettre" />
                                                    <DocBtn has={c.has_vitale} url={c.vitale_url} name={c.vitale_name} icon={HeartPulse} color="#22c55e" label="Vitale" />
                                                </div>
                                            </td>
                                            {/* Ville */}
                                            <td className="px-6" style={{ paddingTop: 14, paddingBottom: 14, fontSize: 13, fontWeight: 500, color: '#1a1d2e' }}>
                                                {c.ville}
                                            </td>
                                            {/* Actions */}
                                            <td className="px-6" style={{ paddingTop: 14, paddingBottom: 14 }}>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleViewDetails(c.id)}
                                                        className="transition-all hover:scale-105"
                                                        style={{
                                                            padding: 6, borderRadius: 8,
                                                            background: '#ede9ff', color: '#6c63ff',
                                                            border: '1px solid #e8eaf0',
                                                        }}
                                                        title="Voir details"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button onClick={() => onPlacer?.(raw)}
                                                        className="transition-all hover:scale-105"
                                                        style={{
                                                            padding: 6, borderRadius: 8,
                                                            background: '#dcfce7', color: '#16a34a',
                                                            border: '1px solid #86efac',
                                                        }}
                                                        title="Placer"
                                                    >
                                                        <CheckCircle2 size={15} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {paginated.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center" style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>
                                            Aucun etudiant ne correspond a votre recherche.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* CARDS VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginated.map(({ raw, normalized: c }) => {
                        return (
                            <div key={c.id}
                                className="flex flex-col transition-all"
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid #e8eaf0',
                                    borderRadius: 12,
                                    padding: 24,
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#6c63ff30'; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e8eaf0'; }}
                            >
                                {/* Card header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center justify-center" style={{
                                        width: 40, height: 40, borderRadius: 10,
                                        background: '#ede9ff', color: '#6c63ff',
                                        fontSize: 13, fontWeight: 700,
                                    }}>
                                        {String(c.prenom || '?')[0]}{String(c.nom || '?')[0]}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span style={{
                                            padding: '3px 8px', borderRadius: 6,
                                            background: '#f0f2f8', border: '1px solid #e8eaf0',
                                            fontSize: 9, fontWeight: 700, color: '#6b7280',
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                        }}>Hors poste</span>
                                        <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>
                                            #{c.numero_inscription}
                                        </span>
                                    </div>
                                </div>

                                {/* Student info */}
                                <div className="mb-4">
                                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1d2e', marginBottom: 2 }}>
                                        {c.nom?.toUpperCase()} {c.prenom}
                                    </h3>
                                    <p className="truncate" style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{c.email}</p>
                                    <span className="inline-flex items-center" style={{
                                        padding: '4px 10px', borderRadius: 6,
                                        background: '#f0f2f8', border: '1px solid #e8eaf0',
                                        fontSize: 11, fontWeight: 500, color: '#6b7280',
                                    }}>
                                        {formatFormation(c.formation)}
                                    </span>
                                </div>

                                {/* Details rows */}
                                <div className="mb-4 flex-grow">
                                    {[
                                        { label: 'Localisation', value: c.ville },
                                        { label: 'Age', value: calculateAge(c.date_naissance) ? `${calculateAge(c.date_naissance)} ans` : '\u2013' },
                                        { label: 'Contact', value: c.telephone },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #f0f2f8' }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b92a9' }}>{label}</span>
                                            <span style={{ fontSize: 12, fontWeight: 500, color: '#1a1d2e' }}>{value || '\u2013'}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Documents */}
                                <div className="flex items-center gap-2 mb-4" style={{
                                    padding: 12, borderRadius: 8,
                                    background: '#f0f2f8', border: '1px solid #e8eaf0',
                                }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, color: '#8b92a9', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 'auto' }}>Documents</span>
                                    <DocBtn has={c.has_cv} url={c.cv_url} name={c.cv_name} icon={FileUser} color="#6c63ff" label="" />
                                    <DocBtn has={c.has_lettre_motivation} url={c.lettre_motivation_url} name={c.lettre_motivation_name} icon={FileText} color="#f97316" label="" />
                                    <DocBtn has={c.has_vitale} url={c.vitale_url} name={c.vitale_name} icon={HeartPulse} color="#22c55e" label="" />
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2">
                                    <button onClick={() => handleViewDetails(c.id)}
                                        className="flex-1 flex items-center justify-center gap-2 transition-all"
                                        style={{
                                            padding: '8px 12px', borderRadius: 8,
                                            border: '1px solid #e8eaf0',
                                            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                                            color: '#6c63ff', background: '#ffffff',
                                        }}>
                                        <Eye size={14} /> Details
                                    </button>
                                    <button onClick={() => onPlacer?.(raw)}
                                        className="flex-1 flex items-center justify-center gap-2 transition-all"
                                        style={{
                                            padding: '8px 12px', borderRadius: 8,
                                            background: '#dcfce7', color: '#16a34a',
                                            border: '1px solid #86efac',
                                            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                                        }}>
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
});

export default CommercialToPlace;
