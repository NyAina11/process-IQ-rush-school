import React from 'react';
import { CheckCircle2, Download, Search, List, LayoutGrid, Eye, Edit, Users, FileCheck, Building, GraduationCap, MapPin, ArrowUpRight } from 'lucide-react';
import Button from '../ui/Button';
import Pagination from '../ui/Pagination';

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

const CommercialAlternance: React.FC<CommercialAlternanceProps> = ({
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
    handleEdit,
    getC,
    isPlaced,
    statsPlaced
}) => {
    const availableFormations = [
        'BTS MCO A',
        'BTS MCO 2',
        'BTS NDRC 1',
        'BTS COM',
        'Titre Pro NTC',
        'Titre Pro NTC B (rentrée decalée)',
        'Bachelor RDC'
    ];

    const filteredStudents = (candidates || []).filter(c => isPlaced(c)).filter(raw => {
        if (!raw) return false;
        const c = getC(raw);
        if (!c) return false;

        const searchLower = (searchQuery || '').toLowerCase();
        const fullName = String(c.nom || '') + ' ' + String(c.prenom || '');
        const matchesSearch = fullName.toLowerCase().includes(searchLower) ||
            String(c.email || '').toLowerCase().includes(searchLower) ||
            String(c.telephone || '').includes(searchQuery);
        const formation = String(c.formation || '').toLowerCase();
        const matchesFormation = filterFormation === 'all' || !filterFormation || formation === filterFormation.toLowerCase() || formation.includes(filterFormation.toLowerCase());
        return matchesSearch && matchesFormation;
    });

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-[2.5rem] p-10 mb-10 text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-white/20 transition-all duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                            <CheckCircle2 size={40} className="text-white drop-shadow-md" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter mb-2 drop-shadow-sm">Élèves en alternance</h1>
                            <p className="text-indigo-50 font-semibold text-lg opacity-90 max-w-xl leading-relaxed">
                                Félicitations à nos alternants. Suivez leur progression et gérez les documents de placement.
                            </p>
                        </div>
                    </div>
                    <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-slate-50" leftIcon={<Download size={24} />}> Exporter la liste </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Total Alternants', value: statsPlaced.total, icon: Users, color: 'indigo', trend: 'Actif', trendIcon: CheckCircle2 },
                    { label: 'Contrats signés', value: statsPlaced.contratsSignes, icon: FileCheck, color: 'emerald', trend: `${statsPlaced.total > 0 ? Math.round((statsPlaced.contratsSignes / statsPlaced.total) * 100) : 0}%`, trendIcon: ArrowUpRight },
                    { label: 'Entreprises partenaires', value: statsPlaced.entreprisesPartenaires, icon: Building, color: 'blue', trend: 'Diversifié', trendIcon: MapPin },
                    { label: 'Missions validées', value: statsPlaced.missionsValidees, icon: GraduationCap, color: 'purple', trend: `${statsPlaced.total > 0 ? Math.round((statsPlaced.missionsValidees / statsPlaced.total) * 100) : 0}%`, trendIcon: CheckCircle2 },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:bg-${stat.color}-500/10 transition-colors duration-500`}></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 text-${stat.color}-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner`}>
                                <stat.icon size={28} />
                            </div>
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                    stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                }`}>
                                {stat.trendIcon && <stat.trendIcon size={14} strokeWidth={3} />}
                                {stat.trend}
                            </span>
                        </div>
                        <div className="text-5xl font-black text-slate-800 mb-2 tracking-tighter relative z-10">{stat.value}</div>
                        <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 mb-10 border border-white/20 shadow-xl flex flex-wrap justify-between items-center gap-6">
                <div className="flex flex-wrap items-center gap-6 flex-1 min-w-[300px]">
                    <div className="relative flex-1 min-w-[240px] max-w-md group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" size={22} />
                        <input
                            type="text"
                            placeholder="Rechercher un alternant..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/10 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <select
                            className="px-6 py-4 bg-slate-50/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-500 outline-none transition-all duration-300 font-black text-sm text-slate-600 cursor-pointer hover:bg-slate-100"
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
                    <button onClick={() => setViewMode('table')} className={`flex items-center gap-2 px-4 py-2.5 rounded-[1.2rem] font-black text-xs md:text-sm transition-all duration-300 ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-500/10' : 'text-slate-500 hover:text-slate-700'}`}>
                        <List size={18} strokeWidth={3} /> Liste
                    </button>
                    <button onClick={() => setViewMode('cards')} className={`flex items-center gap-2 px-4 py-2.5 rounded-[1.2rem] font-black text-xs md:text-sm transition-all duration-300 ${viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-500/10' : 'text-slate-500 hover:text-slate-700'}`}>
                        <LayoutGrid size={18} strokeWidth={3} /> Cartes
                    </button>
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Formation</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Étudiant</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Entreprise</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ville</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedStudents.map((raw) => {
                                    const c = getC(raw);
                                    return (
                                        <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${c.formation.includes('MCO') ? 'bg-blue-50 text-blue-600' :
                                                    c.formation.includes('NDRC') ? 'bg-emerald-50 text-emerald-600' :
                                                        c.formation.includes('RDC') ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                                                    }`}>
                                                    {c.formation}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs"> {c.nom[0]}{c.prenom[0]} </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-800">{c.nom} {c.prenom}</div>
                                                        <div className="text-[10px] font-bold text-slate-400">{c.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6"> <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{c.entreprise}</span> </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-600">{c.ville}</td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleViewDetails(c.id)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"> <Eye size={18} /> </button>
                                                    <button onClick={() => handleEdit(c.id)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all"> <Edit size={18} /> </button>
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
                            <div key={c.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/20">
                                        {c.nom[0]}{c.prenom[0]}
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">Contrat Actif</span>
                                </div>
                                <div className="mb-6 relative z-10">
                                    <h3 className="text-xl font-black text-slate-800 mb-1">{c.nom} {c.prenom}</h3>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${c.formation.includes('MCO') ? 'bg-blue-50 text-blue-600' :
                                        c.formation.includes('NDRC') ? 'bg-emerald-50 text-emerald-600' :
                                            c.formation.includes('RDC') ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                                        }`}>
                                        {c.formation}
                                    </span>
                                </div>
                                <div className="space-y-4 mb-8 relative z-10">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Entreprise</span>
                                        <span className="text-slate-700 font-bold">{c.entreprise}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Localisation</span>
                                        <span className="text-slate-700 font-bold">{c.ville}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3 relative z-10">
                                    <Button variant="secondary" className="flex-1" onClick={() => handleViewDetails(c.id)} leftIcon={<Eye size={18} />}> Détails </Button>
                                    <Button variant="primary" className="flex-1" onClick={() => handleEdit(c.id)} leftIcon={<Edit size={18} />}> Modifier </Button>
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

export default CommercialAlternance;
