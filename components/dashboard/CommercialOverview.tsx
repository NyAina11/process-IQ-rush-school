import React from 'react';
import { Users, ArrowUpRight, CheckCircle2, Plus, FileText, Download, Calendar, Clock } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatCard from './StatCard';
import { formatFormation } from '../../utils/formatters';

interface CommercialOverviewProps {
    candidates: any[];
    studentsToPlace: any[];
    studentsPlaced: any[];
    getC: (raw: any) => any;
}

const CommercialOverview: React.FC<CommercialOverviewProps> = ({ candidates, studentsToPlace, studentsPlaced, getC }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-[2.5rem] p-10 mb-10 text-white shadow-2xl shadow-indigo-500/20 group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/15 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Système Live • Commercial
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-tight"> Vue d'ensemble <br /> <span className="text-indigo-200">Commerciale</span> </h2>
                        <p className="text-indigo-100 text-lg font-medium max-w-md leading-relaxed opacity-90"> Suivi en temps réel de vos {candidates.length} étudiants et de l'état d'avancement des placements en alternance. </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-center min-w-[140px] hover:bg-white/15 transition-colors">
                            <div className="text-3xl font-black mb-1">{studentsToPlace.length}</div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-indigo-200">À Placer</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-center min-w-[140px] hover:bg-white/15 transition-colors">
                            <div className="text-3xl font-black mb-1">{studentsPlaced.length}</div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-indigo-200">Placés</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <StatCard
                    label="Total Étudiants"
                    value={candidates.length}
                    icon={Users}
                    color="indigo"
                    trend="+12%"
                    trendIcon={ArrowUpRight}
                    trendLabel="depuis le mois dernier"
                />
                <StatCard
                    label="En recherche"
                    value={studentsToPlace.length}
                    icon={Users}
                    color="rose"
                    progress={(studentsToPlace.length / candidates.length) * 100}
                />
                <StatCard
                    label="Placés"
                    value={studentsPlaced.length}
                    icon={CheckCircle2}
                    color="emerald"
                    progress={(studentsPlaced.length / candidates.length) * 100}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Actions Rapides" icon={<Plus size={16} strokeWidth={3} />}>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"> <Users size={24} /> </div>
                            <span className="text-sm font-black text-slate-700">Nouvel Étudiant</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"> <Download size={24} /> </div>
                            <span className="text-sm font-black text-slate-700">Exporter Data</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"> <FileText size={24} /> </div>
                            <span className="text-sm font-black text-slate-700">Rapport Hebdo</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"> <Calendar size={24} /> </div>
                            <span className="text-sm font-black text-slate-700">Planning</span>
                        </button>
                    </div>
                </Card>
                <Card title="Activité Récente" icon={<Clock size={16} strokeWidth={3} />}>
                    <div className="space-y-6">
                        {candidates.slice(0, 4).map((raw, i) => {
                            const c = getC(raw);
                            return (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors"> {c.nom[0]}{c.prenom[0]} </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-800">{c.nom?.toUpperCase()} {c.prenom}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatFormation(c.formation)}</div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest"> {i === 0 ? "À l'instant" : i === 1 ? "Il y a 2h" : "Hier"} </div>
                                </div>
                            );
                        })}
                    </div>
                    <Button variant="ghost" className="w-full mt-10 text-xs uppercase tracking-widest"> Voir tout l'historique </Button>
                </Card>
            </div>
        </div>
    );
};

export default CommercialOverview;
