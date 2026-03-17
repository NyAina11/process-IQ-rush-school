import React, { useRef, useCallback } from 'react';
import { Search, List, LayoutGrid, Eye, CheckCircle2, FileUser, FileText, Download, Hash, Phone, Cake, ChevronLeft, ChevronRight, HeartPulse } from 'lucide-react';
import Button from '../ui/Button';
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
    candidates,
    searchQuery,
    setSearchQuery,
    filterFormation,
    setFilterFormation,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleViewDetails,
    getC,
    isPlaced,
    onPlacer
}) => {
    const tableScrollRef = useRef<HTMLDivElement>(null);
    const scrollAnimRef = useRef<number | null>(null);

    const startScroll = useCallback((direction: 'left' | 'right') => {
        const el = tableScrollRef.current;
        if (!el) return;
        const speed = 6;
        const step = () => {
            el.scrollLeft += direction === 'right' ? speed : -speed;
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
        'BTS MCO A',
        'BTS MCO 2',
        'BTS NDRC 1',
        'BTS COM',
        'Titre Pro NTC',
        'Titre Pro NTC B (rentrée decalée)',
        'Bachelor RDC'
    ];

    const filteredStudents = (candidates || []).filter(c => !isPlaced(c)).filter(raw => {
        if (!raw) return false;
        const studentInfo = getC(raw);
        if (!studentInfo) return false;

        const searchLower = (searchQuery || '').toLowerCase();
        const fullName = `${studentInfo.nom || ''} ${studentInfo.prenom || ''}`.toLowerCase();
        const email = (studentInfo.email || '').toLowerCase();
        const formation = (studentInfo.formation || '').toLowerCase();
        const telephone = String(studentInfo.telephone || '').toLowerCase();
        const numInscription = String(studentInfo.numero_inscription || '').toLowerCase();

        // Search match
        const matchesSearch = fullName.includes(searchLower) ||
            email.includes(searchLower) ||
            formation.includes(searchLower) ||
            telephone.includes(searchLower) ||
            numInscription.includes(searchLower);

        if (!matchesSearch) return false;

        // Formation filter match
        if (filterFormation && filterFormation !== 'all' && studentInfo.formation !== filterFormation) {
            return false;
        }

        return true;
    }).sort((a, b) => {
        const numA = parseInt(getC(a).numero_inscription || '0', 10);
        const numB = parseInt(getC(b).numero_inscription || '0', 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return (getC(a).numero_inscription || '').localeCompare(getC(b).numero_inscription || '');
    });

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDownload = (element: any, url: string, filename: string) => {
        if (!url) return;
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'document';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-orange-600 rounded-[2.5rem] p-10 mb-10 text-white shadow-2xl shadow-rose-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-white/20 transition-all duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                            <Search size={40} className="text-white drop-shadow-md" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter mb-2 drop-shadow-sm">Étudiants à placer</h1>
                            <p className="text-rose-50 font-semibold text-lg opacity-90 max-w-xl leading-relaxed">
                                {filteredStudents.length} candidats recherchent actuellement une alternance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 mb-10 border border-white/20 shadow-xl flex flex-wrap justify-between items-center gap-6">
                <div className="flex flex-wrap items-center gap-6 flex-1 min-w-[300px]">
                    <div className="relative flex-1 min-w-[240px] max-w-md group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors duration-300" size={22} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email, téléphone ou n° inscription..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-rose-500 focus:shadow-lg focus:shadow-rose-500/10 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <select
                            className="px-6 py-4 bg-slate-50/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-rose-500 outline-none transition-all duration-300 font-black text-sm text-slate-600 cursor-pointer hover:bg-slate-100"
                            value={filterFormation}
                            onChange={(e) => setFilterFormation(e.target.value)}
                        >
                            <option value="all">Toutes formations</option>
                            {availableFormations.map(f => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-1 p-1.5 bg-slate-100/50 rounded-[1.5rem] border border-slate-200/50 shrink-0">
                    <button onClick={() => setViewMode('table')} className={`flex items-center gap-2 px-4 py-2.5 rounded-[1.2rem] font-black text-xs md:text-sm transition-all duration-300 ${viewMode === 'table' ? 'bg-white text-rose-600 shadow-lg shadow-rose-500/10' : 'text-slate-500 hover:text-slate-700'}`}>
                        <List size={18} strokeWidth={3} /> Liste
                    </button>
                    <button onClick={() => setViewMode('cards')} className={`flex items-center gap-2 px-4 py-2.5 rounded-[1.2rem] font-black text-xs md:text-sm transition-all duration-300 ${viewMode === 'cards' ? 'bg-white text-rose-600 shadow-lg shadow-rose-500/10' : 'text-slate-500 hover:text-slate-700'}`}>
                        <LayoutGrid size={18} strokeWidth={3} /> Cartes
                    </button>
                </div>
            </div>
            {viewMode === 'table' ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden relative group/table">
                    {/* Left scroll zone */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-12 z-10 flex items-center justify-start pl-1 opacity-0 group-hover/table:opacity-100 transition-opacity cursor-w-resize"
                        style={{ background: 'linear-gradient(to right, rgba(244,63,94,0.1), transparent)' }}
                        onMouseEnter={() => startScroll('left')}
                        onMouseLeave={stopScroll}
                    >
                        <ChevronLeft size={24} className="text-rose-500" strokeWidth={3} />
                    </div>
                    {/* Right scroll zone */}
                    <div
                        className="absolute right-0 top-0 bottom-0 w-12 z-10 flex items-center justify-end pr-1 opacity-0 group-hover/table:opacity-100 transition-opacity cursor-e-resize"
                        style={{ background: 'linear-gradient(to left, rgba(244,63,94,0.1), transparent)' }}
                        onMouseEnter={() => startScroll('right')}
                        onMouseLeave={stopScroll}
                    >
                        <ChevronRight size={24} className="text-rose-500" strokeWidth={3} />
                    </div>

                    <div className="overflow-x-auto no-scrollbar" ref={tableScrollRef}>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">N° Inscription</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Étudiant</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Formation</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400 text-center">Âge / Tél</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400 text-center">Docs</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Ville</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedStudents.map((raw) => {
                                    const c = getC(raw);
                                    return (
                                        <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="w-10 h-10 rounded-[4px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase shadow-inner">
                                                    {c.numero_inscription || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-[4px] bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-500 text-xs"> {String(c.nom || '?')[0]}{String(c.prenom || '?')[0]} </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-800 tracking-tight">{c.nom?.toUpperCase()} {c.prenom}</div>
                                                        <div className="text-[10px] font-bold text-slate-400">{c.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="inline-flex items-center px-3 py-1.5 rounded-[4px] bg-slate-50 text-slate-500 border border-slate-100 text-[10px] font-black uppercase tracking-wider">
                                                    {formatFormation(c.formation)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                        <Phone size={12} className="text-rose-500" strokeWidth={3} />
                                                        {c.telephone || "N/A"}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                                        <Cake size={11} className="text-rose-400" />
                                                        {calculateAge(c.date_naissance) ? `${calculateAge(c.date_naissance)} ans` : "N/A"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">CV</span>
                                                        {c.has_cv ? (
                                                            <button 
                                                                onClick={() => handleDownload(raw, c.cv_url, c.cv_name)}
                                                                className="w-8 h-8 rounded-[4px] bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-sm"
                                                                title="Télécharger le CV"
                                                            >
                                                                <FileUser size={14} strokeWidth={2.5} />
                                                            </button>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-[4px] bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100" title="CV non disponible">
                                                                <FileUser size={14} strokeWidth={2.5} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Lettre</span>
                                                        {c.has_lettre_motivation ? (
                                                            <button 
                                                                onClick={() => handleDownload(raw, c.lettre_motivation_url, c.lettre_motivation_name)}
                                                                className="w-8 h-8 rounded-[4px] bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all border border-orange-100 shadow-sm"
                                                                title="Télécharger la lettre de motivation"
                                                            >
                                                                <FileText size={14} strokeWidth={2.5} />
                                                            </button>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-[4px] bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100" title="Lettre non disponible">
                                                                <FileText size={14} strokeWidth={2.5} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Vitale</span>
                                                        {c.has_vitale ? (
                                                            <button 
                                                                onClick={() => handleDownload(raw, c.vitale_url, c.vitale_name)}
                                                                className="w-8 h-8 rounded-[4px] bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm"
                                                                title="Télécharger la carte vitale"
                                                            >
                                                                <HeartPulse size={14} strokeWidth={2.5} />
                                                            </button>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-[4px] bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100" title="Carte vitale non disponible">
                                                                <HeartPulse size={14} strokeWidth={2.5} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-600">{c.ville}</td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleViewDetails(c.id)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all" title="Détails"> <Eye size={18} /> </button>
                                                    <button 
                                                        onClick={() => onPlacer?.(raw)}
                                                        className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 text-white hover:bg-emerald-600 transition-all scale-110"
                                                        title="Placer l'étudiant (Fiche Entreprise)"
                                                    > 
                                                        <CheckCircle2 size={18} strokeWidth={3} /> 
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedStudents.map((raw) => {
                        const c = getC(raw);
                        return (
                            <div key={c.id} className="bg-white rounded-none p-7 border border-slate-200 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-rose-500/10 transition-colors"></div>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="w-12 h-12 rounded-[4px] bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg shadow-sm">
                                        {c.numero_inscription ? c.numero_inscription.slice(-4) : `${String(c.nom || '?')[0]}${String(c.prenom || '?')[0]}`}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-[4px] text-[9px] font-black uppercase tracking-widest border border-rose-100">Hors poste</span>
                                        <div className="flex items-center gap-1 font-black text-[9px] text-slate-400 tracking-widest uppercase">
                                            <Hash size={10} strokeWidth={3} />
                                            {c.numero_inscription}
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-6 relative z-10">
                                    <h3 className="text-lg font-black text-slate-800 mb-1 tracking-tight">{c.nom?.toUpperCase()} {c.prenom}</h3>
                                    <p className="text-xs text-slate-400 truncate mb-3">{c.email}</p>
                                    <div className="inline-flex items-center px-3 py-1.5 rounded-[4px] bg-slate-50 text-slate-600 border border-slate-200 text-[9px] font-black uppercase tracking-widest">
                                        {formatFormation(c.formation)}
                                    </div>
                                </div>
                                <div className="space-y-4 mb-6 relative z-10 flex-grow">
                                    <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-50">
                                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Localisation</span>
                                        <span className="text-slate-700 font-bold">{c.ville}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-50">
                                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Âge</span>
                                        <span className="text-slate-700 font-bold">{calculateAge(c.date_naissance) ? `${calculateAge(c.date_naissance)} ans` : "N/A"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Contact</span>
                                        <span className="text-slate-700 font-bold truncate max-w-[150px]">{c.telephone}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-8 p-3 bg-slate-50 border border-slate-100 rounded-[4px] relative z-10">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-auto">Documents:</span>
                                    <button 
                                        disabled={!c.has_cv}
                                        onClick={() => handleDownload(raw, c.cv_url, c.cv_name)}
                                        className={`w-9 h-9 rounded-[4px] transition-all flex items-center justify-center ${c.has_cv ? 'bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white shadow-sm' : 'bg-slate-100 text-slate-300 border border-slate-200'}`}
                                    >
                                        <FileUser size={16} strokeWidth={2.5} />
                                    </button>
                                    <button 
                                        disabled={!c.has_lettre_motivation}
                                        onClick={() => handleDownload(raw, c.lettre_motivation_url, c.lettre_motivation_name)}
                                        className={`w-9 h-9 rounded-[4px] transition-all flex items-center justify-center ${c.has_lettre_motivation ? 'bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-600 hover:text-white shadow-sm' : 'bg-slate-100 text-slate-300 border border-slate-200'}`}
                                    >
                                        <FileText size={16} strokeWidth={2.5} />
                                    </button>
                                </div>

                                <div className="flex gap-0.5 relative z-10">
                                    <Button variant="secondary" className="flex-1 font-black !rounded-none !py-4" onClick={() => handleViewDetails(c.id)} leftIcon={<Eye size={18} strokeWidth={3} />}> Détails </Button>
                                    <Button variant="danger" className="flex-1 font-black !bg-rose-500 hover:!bg-rose-600 shadow-lg shadow-rose-500/20 !rounded-none !py-4" onClick={() => onPlacer?.(raw)} leftIcon={<CheckCircle2 size={18} strokeWidth={3} />}> Placer </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default CommercialToPlace;
