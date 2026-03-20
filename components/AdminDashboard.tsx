import React, { useState } from 'react';
import { Database, Plus, Trash2, CheckCircle2, AlertCircle, ExternalLink, Settings2, ShieldCheck, LogOut, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ApiConfig {
    id: string;
    name: string;
    endpoint: string;
    apiKey: string;
    status: 'active' | 'inactive' | 'error';
    lastTest?: string;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isTesting, setIsTesting] = useState<string | null>(null);
    const [configs, setConfigs] = useState<ApiConfig[]>([
        { id: '1', name: 'OPCO Atlas API', endpoint: 'https://api.atlas.opco.fr/v1', apiKey: '••••••••••••••••', status: 'active', lastTest: '2026-02-10 14:00' },
        { id: '2', name: 'OPCO Mobilité', endpoint: 'https://mob.opco.com/rest', apiKey: '••••••••••••••••', status: 'error', lastTest: '2026-02-09 10:20' },
    ]);

    const [newConfig, setNewConfig] = useState({ name: '', endpoint: '', apiKey: '' });

    const handleLogout = () => {
        localStorage.removeItem('adminAuthToken');
        navigate('/admin/login');
    };

    const handleAddApi = (e: React.FormEvent) => {
        e.preventDefault();
        const config: ApiConfig = {
            id: Date.now().toString(),
            name: newConfig.name,
            endpoint: newConfig.endpoint,
            apiKey: '••••••••••••••••',
            status: 'inactive'
        };
        setConfigs([...configs, config]);
        setNewConfig({ name: '', endpoint: '', apiKey: '' });
    };

    const testConnection = (id: string) => {
        setIsTesting(id);
        setTimeout(() => {
            setConfigs(configs.map(c =>
                c.id === id ? { ...c, status: 'active', lastTest: new Date().toLocaleString() } : c
            ));
            setIsTesting(null);
        }, 2000);
    };

    const deleteConfig = (id: string) => {
        setConfigs(configs.filter(c => c.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            {/* Admin Sidebar */}
            <aside className="w-72 bg-[#0f172a] text-white p-8 flex flex-col shadow-2xl">
                <div className="flex items-center gap-3 mb-12">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <ShieldCheck size={20} />
                    </div>
                    <span className="font-black tracking-tighter text-xl">ADMIN PANEL</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 text-white shadow-lg shadow-black/20">
                        <Database size={18} className="text-blue-400" />
                        <span className="text-sm font-bold">API Integrations</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 text-slate-400 hover:bg-white/5 rounded-xl transition-all cursor-not-allowed group">
                        <Settings2 size={18} className="group-hover:text-white transition-colors" />
                        <span className="text-sm font-bold">Système</span>
                    </div>
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center gap-3 p-4 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all font-bold text-sm"
                >
                    <LogOut size={18} />
                    <span>Quitter l'Admin</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-12 overflow-y-auto scrollbar-hide">
                <div className="max-w-5xl mx-auto">
                    <header className="mb-12 flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Middleware & APIs</h2>
                            <p className="text-slate-500 font-medium mt-1">Configurez les services externes et les connecteurs OPCO.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                                Réseau Sécurisé
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* API Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm sticky top-12">
                                <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                                    <Plus size={20} className="text-blue-600" />
                                    Nouveau Connecteur
                                </h3>
                                <form onSubmit={handleAddApi} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom du service</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="ex: OPCO Atlas"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                                            value={newConfig.name}
                                            onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endpoint URL</label>
                                        <input
                                            type="url"
                                            required
                                            placeholder="https://api.exante.com/..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                                            value={newConfig.endpoint}
                                            onChange={(e) => setNewConfig({ ...newConfig, endpoint: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clé API (Token)</label>
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                                            value={newConfig.apiKey}
                                            onChange={(e) => setNewConfig({ ...newConfig, apiKey: e.target.value })}
                                        />
                                    </div>
                                    <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors shadow-lg shadow-black/10 mt-2 flex items-center justify-center gap-2 group">
                                        <Save size={16} className="group-hover:scale-110 transition-transform" />
                                        Enregistrer
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* API List */}
                        <div className="lg:col-span-2 space-y-4">
                            {configs.map(config => (
                                <div key={config.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${config.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                                                    config.status === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                <ExternalLink size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 leading-none">{config.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-mono mt-1.5 truncate max-w-[200px] md:max-w-sm">{config.endpoint}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${config.status === 'active' ? 'bg-emerald-100/50 text-emerald-700' :
                                                    config.status === 'error' ? 'bg-rose-100/50 text-rose-700' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {config.status === 'active' && <CheckCircle2 size={10} />}
                                                {config.status === 'error' && <AlertCircle size={10} />}
                                                {config.status === 'active' ? 'Opérationnel' : config.status === 'error' ? 'Erreur Sync' : 'Inactif'}
                                            </div>
                                            <button
                                                onClick={() => deleteConfig(config.id)}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
                                            Dernier test : {config.lastTest || 'Jamais'}
                                        </div>
                                        <button
                                            onClick={() => testConnection(config.id)}
                                            disabled={isTesting === config.id}
                                            className="flex items-center gap-2 text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {isTesting === config.id ? (
                                                <>
                                                    <Loader2 size={12} className="animate-spin" />
                                                    Test en cours...
                                                </>
                                            ) : (
                                                'Tester la connexion'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
