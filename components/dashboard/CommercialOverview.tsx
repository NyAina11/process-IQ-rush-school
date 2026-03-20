import React from 'react';
import { Users, ArrowUpRight, CheckCircle2, Plus, FileText, Download, Calendar, Clock, TrendingUp } from 'lucide-react';
import { formatFormation } from '../../utils/formatters';

interface CommercialOverviewProps {
    candidates: any[];
    studentsToPlace: any[];
    studentsPlaced: any[];
    getC: (raw: any) => any;
}

const CommercialOverview: React.FC<CommercialOverviewProps> = ({ candidates, studentsToPlace, studentsPlaced, getC }) => {
    const placedPct = candidates.length ? Math.round((studentsPlaced.length / candidates.length) * 100) : 0;
    const toPlacePct = candidates.length ? Math.round((studentsToPlace.length / candidates.length) * 100) : 0;

    return (
        <div className="animate-fade-in space-y-8 pb-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* ── HERO ── */}
            <div className="relative overflow-hidden rounded-2xl min-h-[160px] flex items-center px-10 py-8"
                style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)' }}>
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
                <div className="absolute top-[-40px] right-[-40px] w-56 h-56 rounded-full opacity-20 blur-3xl" style={{ background: '#a78bfa' }} />
                <div className="absolute bottom-[-30px] left-[30%] w-40 h-40 rounded-full opacity-15 blur-2xl" style={{ background: '#c4b5fd' }} />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-lg mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/80">Système Live • Commercial</span>
                        </div>
                        <h1 className="text-[28px] font-extrabold text-white leading-tight tracking-tight mb-2">
                            Vue d'ensemble <span className="text-white/60">Commerciale</span>
                        </h1>
                        <p className="text-white/65 text-[14px] font-medium leading-relaxed max-w-md">
                            Suivi en temps réel de vos {candidates.length} étudiants et de l'état d'avancement des placements en alternance.
                        </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <div className="bg-white/10 border border-white/20 backdrop-blur-sm px-6 py-4 rounded-xl text-center min-w-[110px]">
                            <div className="text-3xl font-black text-white mb-0.5">{studentsToPlace.length}</div>
                            <div className="text-[10px] font-semibold uppercase tracking-widest text-white/60">À Placer</div>
                        </div>
                        <div className="bg-white/10 border border-white/20 backdrop-blur-sm px-6 py-4 rounded-xl text-center min-w-[110px]">
                            <div className="text-3xl font-black text-white mb-0.5">{studentsPlaced.length}</div>
                            <div className="text-[10px] font-semibold uppercase tracking-widest text-white/60">Placés</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white border border-[#e5e0f5] rounded-2xl p-6 flex items-center gap-5 shadow-sm">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f5f3ff' }}>
                        <Users size={22} color="#6d28d9" />
                    </div>
                    <div className="flex-1">
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1">Total Étudiants</div>
                        <div className="text-3xl font-black text-[#1e1b2e]">{candidates.length}</div>
                        <div className="flex items-center gap-1 mt-1 text-emerald-600">
                            <ArrowUpRight size={13} />
                            <span className="text-[11px] font-semibold">+12% depuis le mois dernier</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-[#e5e0f5] rounded-2xl p-6 flex items-center gap-5 shadow-sm">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#fff1f2' }}>
                        <TrendingUp size={22} color="#f43f5e" />
                    </div>
                    <div className="flex-1">
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1">En Recherche</div>
                        <div className="text-3xl font-black text-[#1e1b2e]">{studentsToPlace.length}</div>
                        <div className="mt-2 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-rose-500 transition-all duration-700" style={{ width: `${toPlacePct}%` }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-[#e5e0f5] rounded-2xl p-6 flex items-center gap-5 shadow-sm">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f0fdf4' }}>
                        <CheckCircle2 size={22} color="#22c55e" />
                    </div>
                    <div className="flex-1">
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1">Placés</div>
                        <div className="text-3xl font-black text-[#1e1b2e]">{studentsPlaced.length}</div>
                        <div className="mt-2 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${placedPct}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BOTTOM GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white border border-[#e5e0f5] rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <Plus size={16} color="#6d28d9" />
                        <span className="text-[13px] font-bold text-[#1e1b2e] uppercase tracking-wider">Actions Rapides</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: Users, label: 'Nouvel Étudiant', bg: '#f5f3ff', color: '#6d28d9' },
                            { icon: Download, label: 'Exporter Data', bg: '#f0fdf4', color: '#22c55e' },
                            { icon: FileText, label: 'Rapport Hebdo', bg: '#fff1f2', color: '#f43f5e' },
                            { icon: Calendar, label: 'Planning', bg: '#eff6ff', color: '#3b82f6' },
                        ].map(({ icon: Icon, label, bg, color }) => (
                            <button key={label} className="flex flex-col items-center justify-center p-5 bg-[#fafafa] rounded-xl border border-[#e5e0f5] hover:border-[#6d28d9]/30 hover:bg-[#f5f3ff] transition-all group">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ background: bg }}>
                                    <Icon size={20} color={color} />
                                </div>
                                <span className="text-[12px] font-semibold text-[#374151]">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-[#e5e0f5] rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <Clock size={16} color="#6d28d9" />
                        <span className="text-[13px] font-bold text-[#1e1b2e] uppercase tracking-wider">Activité Récente</span>
                    </div>
                    <div className="space-y-4">
                        {candidates.slice(0, 4).map((raw, i) => {
                            const c = getC(raw);
                            const times = ["À l'instant", "Il y a 2h", "Il y a 5h", "Hier"];
                            return (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#f5f3ff] flex items-center justify-center text-[#6d28d9] font-bold text-[12px] group-hover:bg-[#6d28d9] group-hover:text-white transition-all">
                                            {c.nom?.[0]}{c.prenom?.[0]}
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-semibold text-[#1e1b2e]">{c.nom?.toUpperCase()} {c.prenom}</div>
                                            <div className="text-[10px] font-medium text-[#9ca3af] uppercase tracking-wider">{formatFormation(c.formation)}</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-widest">{times[i] || 'Hier'}</span>
                                </div>
                            );
                        })}
                    </div>
                    <button className="w-full mt-6 py-2.5 rounded-xl border border-[#e5e0f5] text-[11px] font-semibold uppercase tracking-widest text-[#6d28d9] hover:bg-[#f5f3ff] transition-all">
                        Voir tout l'historique
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommercialOverview;
