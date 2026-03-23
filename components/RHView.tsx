import React, { useState, useEffect } from 'react';
import { ViewId } from '../types';
import {
    FileText, Users, Eye, Trash2, Search, Plus, CheckCircle2,
    AlertCircle, Clock, Briefcase, Save, Download, Building,
    Loader2, Mail, Phone
} from 'lucide-react';
import { api } from '../services/api';
import Button from './ui/Button';
import { useAppStore } from '../store/useAppStore';
import CompanyDetailsModal from './dashboard/CompanyDetailsModal';
import { formatFormation, decimalToTime } from '../utils/formatters';

const HERO_STYLE = {
    background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const Hero = ({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) => (
    <div className="relative overflow-hidden rounded-2xl min-h-[148px] flex items-center px-10 py-8 mb-6" style={HERO_STYLE}>
        <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
        <div className="absolute top-[-40px] right-[-40px] w-56 h-56 rounded-full opacity-20 blur-3xl" style={{ background: '#a78bfa' }} />
        <div className="absolute bottom-[-30px] left-[30%] w-40 h-40 rounded-full opacity-15 blur-2xl" style={{ background: '#c4b5fd' }} />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
            <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-lg mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/80">Ressources Humaines</span>
                </div>
                <h1 className="text-[28px] font-extrabold text-white leading-tight tracking-tight mb-1">{title}</h1>
                <p className="text-white/65 text-[14px] font-medium">{subtitle}</p>
            </div>
            {action}
        </div>
    </div>
);

const StatCard = ({ icon: Icon, value, label, bg, color }: any) => (
    <div className="bg-white border border-[#e5e0f5] rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
            <Icon size={20} color={color} />
        </div>
        <div>
            <div className="text-2xl font-black text-[#1e1b2e]">{value}</div>
            <div className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-widest">{label}</div>
        </div>
    </div>
);

const FilterBar = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white border border-[#e5e0f5] rounded-2xl p-4 mb-5 flex flex-wrap items-center gap-3 shadow-sm">
        {children}
    </div>
);

const SearchInput = ({ value, onChange, placeholder }: any) => (
    <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={15} />
        <input
            type="text"
            placeholder={placeholder || 'Rechercher...'}
            value={value}
            onChange={onChange}
            className="w-full pl-10 pr-4 py-2.5 bg-[#fafafa] border border-[#e5e0f5] rounded-xl text-[13px] font-medium text-[#374151] placeholder:text-[#9ca3af] outline-none focus:border-[#6d28d9]/40 focus:bg-white transition-all"
        />
    </div>
);

const StyledSelect = ({ value, onChange, children }: any) => (
    <select
        value={value}
        onChange={onChange}
        className="px-4 py-2.5 bg-[#fafafa] border border-[#e5e0f5] rounded-xl text-[13px] font-medium text-[#374151] outline-none focus:border-[#6d28d9]/40 cursor-pointer transition-all"
    >
        {children}
    </select>
);

const TableWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white border border-[#e5e0f5] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">{children}</div>
    </div>
);

const Th = ({ children, ...props }: any) => (
    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] whitespace-nowrap border-b border-[#e5e0f5]" {...props}>
        {children}
    </th>
);

const Td = ({ children, className = '' }: any) => (
    <td className={`px-6 py-4 border-b border-[#f5f3ff] ${className}`}>{children}</td>
);

const Badge = ({ ok, okLabel = 'Reçue', koLabel = 'En attente' }: any) => ok ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-semibold uppercase border border-emerald-100">
        <CheckCircle2 size={10} /> {okLabel}
    </span>
) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f5f3ff] text-[#9ca3af] text-[10px] font-semibold uppercase border border-[#e5e0f5]">
        <Clock size={10} /> {koLabel}
    </span>
);

const ActionBtn = ({ onClick, icon: Icon, color = '#6d28d9', bg = '#f5f3ff', border = '#e5e0f5' }: any) => (
    <button onClick={onClick}
        className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
        style={{ background: bg, color, borderColor: border }}>
        <Icon size={14} />
    </button>
);

// ─────────────────────────────────────────────────────

const RHView: React.FC<{ activeSubView: ViewId }> = ({ activeSubView }) => {
    const { showToast } = useAppStore();
    const [fichesData, setFichesData] = useState<any>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [rhStats, setRhStats] = useState<any>(null);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterFormation, setFilterFormation] = useState('Toutes formations');
    const [filterReferent, setFilterReferent] = useState('Tous référents');
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCompanyEditing, setIsCompanyEditing] = useState(false);
    const [companyEditForm, setCompanyEditForm] = useState<any>(null);
    const [isSavingCompany, setIsSavingCompany] = useState(false);

    useEffect(() => {
        if (activeSubView === 'rh-cerfa') fetchFichesData();
        else if (activeSubView === 'rh-dashboard') fetchRHStats();
        else if (activeSubView === 'rh-fiche') fetchCompanies();
    }, [activeSubView]);

    const initializeCompanyForm = (data: any) => {
        if (!data || !data.fields) return;
        const f = data.fields;
        setCompanyEditForm({
            identification: { raison_sociale: f["Raison sociale"] || "", siret: f["Numéro SIRET"] || "", code_ape_naf: f["Code APE/NAF"] || "", type_employeur: f["Type demployeur"] || "", effectif: f["Effectif salarié de l'entreprise"] || "", convention: f["Convention collective"] || "" },
            adresse: { num: f["Numéro entreprise"] || "", voie: f["Voie entreprise"] || "", complement: f["Complément dadresse entreprise"] || "", code_postal: f["Code postal entreprise"] || "", ville: f["Ville entreprise"] || "", telephone: f["Téléphone entreprise"] || "", email: f["Email entreprise"] || "" },
            maitre_apprentissage: { nom: f["Nom Maître apprentissage"] || "", prenom: f["Prénom Maître apprentissage"] || "", date_naissance: f["Date de naissance Maître apprentissage"] || "", fonction: f["Fonction Maître apprentissage"] || "", diplome: f["Diplôme Maître apprentissage"] || "", experience: f["Année experience pro Maître apprentissage"] || "", telephone: f["Téléphone Maître apprentissage"] || "", email: f["Email Maître apprentissage"] || "" },
            opco: { nom: f["Nom OPCO"] || "" },
            contrat: { type_contrat: f["Type de contrat"] || "", type_derogation: f["Type de dérogation"] || "", date_conclusion: f["Date de conclusion"] || "", date_debut_execution: f["Date de début exécution"] || "", duree_hebdomadaire: decimalToTime(f["Durée hebdomadaire"] || "35"), poste_occupe: f["Poste occupé"] || "", lieu_execution: f["Lieu dexécution du contrat (si différent du siège)"] || "", machines_dangereuses: f["Travail sur machines dangereuses ou exposition à des risques particuliers"] || "", caisse_retraite: f["Caisse de retraite"] || "", numero_deca_ancien_contrat: f["Numéro DECA de ancien contrat"] || "", date_avenant: f["date Si avenant"] || "", montant_salaire_brut1: f["Salaire brut mensuel 1"] || 0, montant_salaire_brut2: f["Salaire brut mensuel 2"] || 0, montant_salaire_brut3: f["Salaire brut mensuel 3"] || 0, montant_salaire_brut4: f["Salaire brut mensuel 4"] || 0 },
            formation: { choisie: f["Formation"] || "", code_rncp: f["Code Rncp"] || "", code_diplome: f["Code  diplome"] || "", nb_heures: f["nombre heure formation"] || "", jours_cours: f["jour de cours"] || "", date_debut: f["Date de début exécution"] || "", date_fin: f["Fin du contrat apprentissage"] || "" },
            cfa: { rush_school: "oui", entreprise: "non", denomination: "RUSH SCHOOL", uai: "0932731W", siret: "91901416300018", adresse: "11-13 AVENUE DE LA DIVISION LECLERC", complement: "", code_postal: "93000", commune: "BOBIGNY" },
            missions: { formation_alternant: f["Formation de lalternant(e) (pour les missions)"] || "", selectionnees: [] },
            record_id_etudiant: f["recordIdetudiant"] || ""
        });
    };

    const handleViewCompany = async (companyId: string) => {
        setLoading(true);
        try {
            const data = await api.getCompanyById(companyId);
            setSelectedCompany(data); initializeCompanyForm(data); setIsViewModalOpen(true); setIsCompanyEditing(false);
        } catch {
            const fallback = companies.find(c => c.id === companyId);
            if (fallback) { setSelectedCompany(fallback); initializeCompanyForm(fallback); setIsViewModalOpen(true); setIsCompanyEditing(false); }
            else showToast("Erreur lors de la récupération des détails.", "error");
        } finally { setLoading(false); }
    };

    const handleDownload = async (url: string, filename: string) => {
        if (!url) { showToast("Document non disponible.", "info"); return; }
        const link = document.createElement('a'); link.href = url; link.download = filename || 'document'; link.target = '_blank'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
        showToast('Téléchargement démarré', 'success');
    };

    const handleSaveCompanyEdit = async (id: string, data: any) => {
        setIsSavingCompany(true);
        try {
            const studentId = data.record_id_etudiant || selectedCompany?.fields?.recordIdetudiant;
            if (!studentId) { showToast("Impossible d'identifier l'étudiant lié.", "error"); return; }
            await api.updateCompany(studentId, data, selectedCompany);
            showToast("Entreprise mise à jour avec succès", "success"); fetchCompanies(); setIsViewModalOpen(false);
        } catch { showToast("Erreur lors de la mise à jour.", "error"); }
        finally { setIsSavingCompany(false); }
    };

    const fetchFichesData = async () => { setLoading(true); try { const data = await api.getStudentsList({ avecFicheUniquement: false, avecCerfaUniquement: false, dossierCompletUniquement: false }); setFichesData(data); setCandidates(data.etudiants || []); } catch { } finally { setLoading(false); } };
    const fetchRHStats = async () => { setLoading(true); try { const data = await api.getRHStats(); setRhStats(data); } catch { } finally { setLoading(false); } };
    const fetchCompanies = async () => { setLoading(true); try { const data = await api.getAllCompanies(); setCompanies(data); } catch { } finally { setLoading(false); } };

    // ── CERFA ──
    if (activeSubView === 'rh-cerfa') {
        const filtered = candidates.filter(c => {
            const name = `${c.prenom || ''} ${c.nom || ''} ${c.email || ''} ${c.entreprise_raison_sociale || ''}`.toLowerCase();
            const matchSearch = name.includes(searchQuery.toLowerCase());
            const matchFormation = filterFormation === 'Toutes formations' || c.formation === filterFormation;
            const matchRef = filterReferent === 'Tous référents' || c.referent === filterReferent;
            return matchSearch && matchFormation && matchRef;
        });

        const cerfaStats = [
            { label: 'Total Étudiants', value: fichesData?.total || 0, icon: Users, bg: '#f5f3ff', color: '#6d28d9' },
            { label: 'Avec Fiche', value: fichesData?.etudiants_avec_fiche || 0, icon: CheckCircle2, bg: '#f0fdf4', color: '#22c55e' },
            { label: 'Avec CERFA', value: fichesData?.etudiants_avec_cerfa || 0, icon: FileText, bg: '#eff6ff', color: '#3b82f6' },
            { label: 'Dossier Complet', value: fichesData?.etudiants_dossier_complet || 0, icon: CheckCircle2, bg: '#f0fdf4', color: '#22c55e' },
            { label: 'Sans Documents', value: fichesData?.etudiants_sans_documents || 0, icon: AlertCircle, bg: '#fff1f2', color: '#f43f5e' },
        ];

        return (
            <div className="animate-fade-in pb-20" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Hero title="Gestion des CERFA" subtitle="Suivi complet des contrats d'apprentissage"
                    action={
                        <div className="flex gap-2 shrink-0">
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/15 border border-white/30 rounded-xl text-white text-[12px] font-semibold hover:bg-white/25 transition-all">
                                <Clock size={14} /> Historique
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/15 border border-white/30 rounded-xl text-white text-[12px] font-semibold hover:bg-white/25 transition-all">
                                <CheckCircle2 size={14} /> Exporter
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#6d28d9] rounded-xl text-[12px] font-semibold hover:bg-white/90 transition-all shadow-sm">
                                <Plus size={14} strokeWidth={2.5} /> Nouveau CERFA
                            </button>
                        </div>
                    }
                />

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
                    {cerfaStats.map((s, i) => <StatCard key={i} {...s} />)}
                </div>

                <FilterBar>
                    <SearchInput value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} placeholder="Rechercher..." />
                    <StyledSelect value={filterFormation} onChange={(e: any) => setFilterFormation(e.target.value)}>
                        <option>Toutes formations</option>
                        <option>BTS NDRC</option><option>BTS MCO</option><option>Bachelor RDC</option><option>TP NTC</option>
                    </StyledSelect>
                    <StyledSelect value={filterReferent} onChange={(e: any) => setFilterReferent(e.target.value)}>
                        <option>Tous référents</option>
                        <option>Alex</option><option>Bilal</option><option>Maxime</option><option>Arsène</option>
                    </StyledSelect>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 ml-auto">
                        <CheckCircle2 size={13} /> Sauvegardé
                    </div>
                </FilterBar>

                <TableWrapper>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                {["Formation", "Apprenti", "Entreprise", "Fiche Renseign.", "Statut CERFA", "CERFA PDF", "Convention", "Dossier", "Actions"].map(h => <Th key={h}>{h}</Th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="py-16 text-center text-[#9ca3af]"><Loader2 className="animate-spin mx-auto mb-3 text-[#6d28d9]" size={28} /><div className="text-[13px]">Chargement...</div></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={9} className="py-16 text-center text-[#9ca3af] text-[13px]">Aucun dossier trouvé</td></tr>
                            ) : filtered.map((c: any, idx: number) => (
                                <tr key={c.record_id || idx} className="hover:bg-[#fafafa] transition-colors group">
                                    <Td>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#f5f3ff] text-[#6d28d9] border border-[#e5e0f5] text-[10px] font-semibold whitespace-nowrap">
                                            {formatFormation(c.formation) || "N/A"}
                                        </span>
                                    </Td>
                                    <Td>
                                        <div className="text-[13px] font-semibold text-[#1e1b2e]">{c.nom?.toUpperCase()} {c.prenom}</div>
                                        <div className="text-[11px] text-[#9ca3af]">{c.email}</div>
                                    </Td>
                                    <Td>
                                        <div className="text-[13px] font-medium text-[#374151]">{c.entreprise_raison_sociale || 'Non renseignée'}</div>
                                        {c.alternance && <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">En alternance</div>}
                                    </Td>
                                    <Td><Badge ok={c.has_fiche_renseignement} /></Td>
                                    <Td><Badge ok={c.has_cerfa} okLabel="Généré" koLabel="À faire" /></Td>
                                    <Td>
                                        {c.cerfa ? (
                                            <a href={c.cerfa.url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f5f3ff] text-[#6d28d9] border border-[#e5e0f5] rounded-lg text-[10px] font-semibold hover:bg-[#6d28d9] hover:text-white transition-all">
                                                <Download size={12} /> <span className="truncate max-w-[80px]">{c.cerfa.filename}</span>
                                            </a>
                                        ) : <span className="text-[11px] text-[#d1d5db]">Indisponible</span>}
                                    </Td>
                                    <Td>
                                        {c.convention ? (
                                            <a href={c.convention.url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f5f3ff] text-[#6d28d9] border border-[#e5e0f5] rounded-lg text-[10px] font-semibold hover:bg-[#6d28d9] hover:text-white transition-all">
                                                <Download size={12} /> <span className="truncate max-w-[80px]">{c.convention.filename}</span>
                                            </a>
                                        ) : <span className="text-[11px] text-[#d1d5db]">Indisponible</span>}
                                    </Td>
                                    <Td className="text-center">
                                        {c.dossier_complet
                                            ? <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto"><CheckCircle2 size={14} strokeWidth={2.5} /></div>
                                            : <div className="w-7 h-7 rounded-lg bg-[#f5f3ff] text-[#d1d5db] border border-[#e5e0f5] flex items-center justify-center mx-auto"><Clock size={14} /></div>
                                        }
                                    </Td>
                                    <Td>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ActionBtn icon={Eye} />
                                            <ActionBtn icon={Trash2} color="#f43f5e" bg="#fff1f2" border="#fecdd3" />
                                        </div>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TableWrapper>

                <div className="fixed bottom-6 right-6 bg-white border border-[#e5e0f5] shadow-xl rounded-xl px-4 py-3 flex items-center gap-3 z-50">
                    <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600"><Save size={14} /></div>
                    <div>
                        <div className="text-[12px] font-semibold text-[#1e1b2e]">Modifications enregistrées</div>
                        <div className="text-[10px] text-[#9ca3af]">Dernière sauvegarde : à l'instant</div>
                    </div>
                </div>
            </div>
        );
    }

    // ── FICHE ENTREPRISE ──
    if (activeSubView === 'rh-fiche') {
        const filtered = (companies || []).filter(c => {
            if (!c?.fields) return false;
            const f = c.fields;
            const q = searchQuery.toLowerCase();
            return `${f['Raison sociale'] || ''} ${f['Numéro SIRET'] || ''} ${f['Ville entreprise'] || ''}`.toLowerCase().includes(q);
        });

        const ficheStats = [
            { label: 'Total Entreprises', value: companies.length, icon: Building, bg: '#f5f3ff', color: '#6d28d9' },
            { label: 'Avec Alternants', value: companies.filter(c => c.fields?.recordIdetudiant).length, icon: Users, bg: '#f0fdf4', color: '#22c55e' },
            { label: 'BC en attente', value: companies.filter(c => !c.fields?.['N de bon de commande']).length, icon: Clock, bg: '#fff7ed', color: '#f97316' },
        ];

        return (
            <div className="animate-fade-in pb-20" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Hero title="Gestion des Entreprises" subtitle="Suivi des partenaires et des fiches de renseignement entreprise"
                    action={
                        <button className="flex items-center gap-2 px-5 py-3 bg-white text-[#6d28d9] rounded-xl text-[13px] font-semibold hover:bg-white/90 transition-all shadow-sm shrink-0">
                            <Plus size={15} strokeWidth={2.5} /> Nouvelle Entreprise
                        </button>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    {ficheStats.map((s, i) => <StatCard key={i} {...s} />)}
                </div>

                <FilterBar>
                    <SearchInput value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} placeholder="Rechercher par nom ou SIRET..." />
                </FilterBar>

                <TableWrapper>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                {["Entreprise", "Localisation", "Contact", "Maître d'Apprentissage", "Contrat", "OPCO", "Actions"].map(h => <Th key={h}>{h}</Th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="py-16 text-center text-[#9ca3af]"><Loader2 className="animate-spin mx-auto mb-3 text-[#6d28d9]" size={28} /><div className="text-[13px]">Chargement...</div></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="py-16 text-center text-[#9ca3af] text-[13px]">Aucune entreprise trouvée</td></tr>
                            ) : filtered.map((c: any, idx: number) => {
                                const f = c.fields || {};
                                return (
                                    <tr key={c.id || idx} className="hover:bg-[#fafafa] transition-colors group">
                                        <Td>
                                            <div className="text-[13px] font-semibold text-[#1e1b2e]">{f['Raison sociale'] || 'N/A'}</div>
                                            <div className="text-[10px] text-[#9ca3af] font-mono">SIRET: {f['Numéro SIRET'] || 'N/A'}</div>
                                        </Td>
                                        <Td>
                                            <div className="text-[13px] font-medium text-[#374151]">{f['Ville entreprise'] || 'N/A'}</div>
                                            <div className="text-[11px] text-[#9ca3af]">{f['Code postal entreprise'] || ''}</div>
                                        </Td>
                                        <Td>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-[11px] text-[#374151]"><Mail size={11} color="#9ca3af" /> {f['Email entreprise'] || 'N/A'}</div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-[#374151]"><Phone size={11} color="#9ca3af" /> {f['Téléphone entreprise'] || 'N/A'}</div>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div className="text-[13px] font-medium text-[#1e1b2e]">{f['Prénom Maître apprentissage']} {f['Nom Maître apprentissage']}</div>
                                            <div className="text-[11px] text-[#9ca3af] italic">{f['Fonction Maître apprentissage'] || 'Tuteur'}</div>
                                        </Td>
                                        <Td>
                                            <div className="text-[13px] font-medium text-[#6d28d9]">{f['Poste occupé'] || 'N/A'}</div>
                                            <div className="text-[11px] text-[#9ca3af]">{f['Formation']}</div>
                                        </Td>
                                        <Td>
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#f5f3ff] text-[#6d28d9] border border-[#e5e0f5] text-[10px] font-semibold">
                                                {f['Nom OPCO'] || 'N/A'}
                                            </span>
                                        </Td>
                                        <Td>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ActionBtn icon={Eye} onClick={() => handleViewCompany(c.id)} />
                                                <ActionBtn icon={FileText} onClick={() => handleDownload(f['Fiche entreprise']?.[0]?.url, f['Fiche entreprise']?.[0]?.filename)} />
                                            </div>
                                        </Td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </TableWrapper>

                <CompanyDetailsModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} company={selectedCompany} loading={loading} isEditing={isCompanyEditing} setIsEditing={setIsCompanyEditing} onEdit={() => setIsCompanyEditing(true)} editForm={companyEditForm} setEditForm={setCompanyEditForm} onSave={handleSaveCompanyEdit} isSaving={isSavingCompany} />
            </div>
        );
    }

    // ── DASHBOARD RH ──
    if (activeSubView === 'rh-dashboard') {
        const dashStats = [
            { label: 'Total Étudiants', value: rhStats?.total_etudiants || 0, icon: Users, bg: '#f5f3ff', color: '#6d28d9' },
            { label: 'Fiches Entreprise', value: rhStats?.total_fiches_entreprise || 0, icon: Briefcase, bg: '#f0fdf4', color: '#22c55e' },
            { label: 'CERFA Signés', value: rhStats?.etudiants_avec_cerfa || 0, icon: FileText, bg: '#eff6ff', color: '#3b82f6' },
            { label: 'Sans Documents', value: rhStats?.etudiants_sans_documents || 0, icon: AlertCircle, bg: '#fff1f2', color: '#f43f5e' },
        ];

        const rates = [
            { label: 'Taux CERFA', value: rhStats?.taux_cerfa || 0, color: '#6d28d9' },
            { label: 'Taux Dossier Complet', value: rhStats?.taux_dossier_complet || 0, color: '#22c55e' },
            { label: 'Taux Fiche Renseignement', value: rhStats?.taux_fiche_renseignement || 0, color: '#3b82f6' },
        ];

        return (
            <div className="animate-fade-in pb-20 space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Hero title="Tableau de Bord RH" subtitle="Vue d'ensemble du recrutement et de l'alternance"
                    action={
                        <button className="flex items-center gap-2 px-5 py-3 bg-white/15 border border-white/30 rounded-xl text-white text-[13px] font-semibold hover:bg-white/25 transition-all shrink-0">
                            <Download size={15} /> Rapport Complet
                        </button>
                    }
                />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {dashStats.map((s, i) => <StatCard key={i} {...s} />)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Taux de complétion */}
                    <div className="bg-white border border-[#e5e0f5] rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <CheckCircle2 size={16} color="#6d28d9" />
                            <span className="text-[13px] font-bold text-[#1e1b2e] uppercase tracking-wider">Taux de Complétion</span>
                        </div>
                        <div className="space-y-6">
                            {rates.map((r, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[13px] font-medium text-[#374151]">{r.label}</span>
                                        <span className="text-[15px] font-black text-[#1e1b2e]">{r.value}%</span>
                                    </div>
                                    <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${r.value}%`, background: r.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Attention requise */}
                    <div className="bg-white border border-[#e5e0f5] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 bg-[#fff1f2] border border-[#fecdd3] rounded-2xl flex items-center justify-center mb-4">
                            <AlertCircle size={26} color="#f43f5e" />
                        </div>
                        <h3 className="text-[18px] font-bold text-[#1e1b2e] mb-2">Attention Requise</h3>
                        <p className="text-[13px] text-[#9ca3af] mb-6 max-w-xs leading-relaxed">
                            <span className="font-semibold text-[#1e1b2e]">{rhStats?.etudiants_sans_documents || 0} étudiants</span> n'ont pas encore transmis leurs documents obligatoires.
                        </p>
                        <button className="flex items-center gap-2 px-6 py-3 bg-[#f43f5e] text-white rounded-xl text-[13px] font-semibold hover:bg-[#e11d48] transition-all shadow-sm shadow-[#f43f5e]/20">
                            Relancer les étudiants
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="bg-white border border-[#e5e0f5] rounded-2xl p-12 text-center shadow-sm">
                <div className="w-14 h-14 bg-[#f5f3ff] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users size={26} color="#6d28d9" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#1e1b2e] mb-1">Sélectionnez une section</h3>
                <p className="text-[13px] text-[#9ca3af]">Utilisez le menu de gauche pour naviguer dans le module RH</p>
            </div>
        </div>
    );
};

export default RHView;
