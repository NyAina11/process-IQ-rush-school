import React, { useState, useEffect } from 'react';
import { ViewId } from '../types';
import {
    FileText,
    Users,
    Eye,
    Copy,
    Trash2,
    Search,
    Plus,
    CheckCircle2,
    AlertCircle,
    Clock,
    Briefcase,
    Save,
    Download,
    Building,
    Loader2,
    Mail,
    Phone
} from 'lucide-react';
import { api } from '../services/api';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import { useAppStore } from '../store/useAppStore';
import Card from './ui/Card';
import CompanyDetailsModal from './dashboard/CompanyDetailsModal';
import { formatFormation } from '../utils/formatters';


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
        if (activeSubView === 'rh-cerfa') {
            fetchFichesData();
        } else if (activeSubView === 'rh-dashboard') {
            fetchRHStats();
        } else if (activeSubView === 'rh-fiche') {
            fetchCompanies();
        }
    }, [activeSubView]);

    const initializeCompanyForm = (data: any) => {
        if (!data || !data.fields) return;
        const f = data.fields;
        setCompanyEditForm({
            identification: {
                raison_sociale: f["Raison sociale"] || "",
                siret: f["Numéro SIRET"] || "",
                code_ape_naf: f["Code APE/NAF"] || "",
                type_employeur: f["Type demployeur"] || "",
                effectif: f["Effectif salarié de l'entreprise"] || "",
                convention: f["Convention collective"] || ""
            },
            adresse: {
                num: f["Numéro entreprise"] || "",
                voie: f["Voie entreprise"] || "",
                complement: f["Complément dadresse entreprise"] || "",
                code_postal: f["Code postal entreprise"] || "",
                ville: f["Ville entreprise"] || "",
                telephone: f["Téléphone entreprise"] || "",
                email: f["Email entreprise"] || ""
            },
            maitre_apprentissage: {
                nom: f["Nom Maître apprentissage"] || "",
                prenom: f["Prénom Maître apprentissage"] || "",
                date_naissance: f["Date de naissance Maître apprentissage"] || "",
                fonction: f["Fonction Maître apprentissage"] || "",
                diplome: f["Diplôme Maître apprentissage"] || "",
                experience: f["Année experience pro Maître apprentissage"] || "",
                telephone: f["Téléphone Maître apprentissage"] || "",
                email: f["Email Maître apprentissage"] || ""
            },
            opco: { nom: f["Nom OPCO"] || "" },
            contrat: {
                type_contrat: f["Type de contrat"] || "",
                type_derogation: f["Type de dérogation"] || "",
                date_conclusion: f["Date de conclusion"] || "",
                date_debut_execution: f["Date de début exécution"] || "",
                duree_hebdomadaire: f["Durée hebdomadaire"] || "",
                poste_occupe: f["Poste occupé"] || "",
                lieu_execution: f["Lieu dexécution du contrat (si différent du siège)"] || "",
                machines_dangereuses: f["Travail sur machines dangereuses ou exposition à des risques particuliers"] || "",
                caisse_retraite: f["Caisse de retraite"] || "",
                numero_deca_ancien_contrat: f["Numéro DECA de ancien contrat"] || "",
                date_avenant: f["date Si avenant"] || "",
                montant_salaire_brut1: f["Salaire brut mensuel 1"] || 0,
                montant_salaire_brut2: f["Salaire brut mensuel 2"] || 0,
                montant_salaire_brut3: f["Salaire brut mensuel 3"] || 0,
                montant_salaire_brut4: f["Salaire brut mensuel 4"] || 0
            },
            formation: {
                choisie: f["Formation"] || "",
                code_rncp: f["Code Rncp"] || "",
                code_diplome: f["Code  diplome"] || "",
                nb_heures: f["nombre heure formation"] || "",
                jours_cours: f["jour de cours"] || "",
                date_debut: f["Date de début exécution"] || "",
                date_fin: f["Fin du contrat apprentissage"] || ""
            },
            cfa: {
                rush_school: "oui",
                entreprise: "non",
                denomination: "RUSH SCHOOL",
                uai: "0932731W",
                siret: "91901416300018",
                adresse: "11-13 AVENUE DE LA DIVISION LECLERC",
                complement: "",
                code_postal: "93000",
                commune: "BOBIGNY"
            },
            missions: {
                formation_alternant: f["Formation de lalternant(e) (pour les missions)"] || "",
                selectionnees: []
            },
            record_id_etudiant: f["recordIdetudiant"] || ""
        });
    };

    const handleViewCompany = async (companyId: string) => {
        setLoading(true);
        try {
            // Find in current list first to avoid extra API call if possible, 
            // but we fetch to be sure we have latest fields
            const data = await api.getCompanyById(companyId);
            setSelectedCompany(data);
            initializeCompanyForm(data);
            setIsViewModalOpen(true);
            setIsCompanyEditing(false);
        } catch (error) {
            console.error("Failed to fetch company details", error);
            // Fallback: use what we have in state if API fails
            const fallback = companies.find(c => c.id === companyId);
            if (fallback) {
                setSelectedCompany(fallback);
                initializeCompanyForm(fallback);
                setIsViewModalOpen(true);
                setIsCompanyEditing(false);
            } else {
                showToast("Erreur lors de la récupération des détails de l'entreprise.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (url: string, filename: string) => {
        if (!url) {
            showToast("Document non disponible pour cette entreprise.", "info");
            return;
        }
        try {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'fiche-entreprise.pdf';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Téléchargement démarré', 'success');
        } catch (error) {
            showToast('Erreur lors du téléchargement', 'error');
        }
    };

    const handleEnterCompanyEditMode = () => {
        setIsCompanyEditing(true);
    };

    const handleSaveCompanyEdit = async (id: string, data: any) => {
        setIsSavingCompany(true);
        try {
            // studentId is required for updateCompany API
            const studentId = data.record_id_etudiant || selectedCompany?.fields?.recordIdetudiant;
            if (!studentId) {
                showToast("Impossible d'identifier l'étudiant lié pour la mise à jour", "error");
                return;
            }
            await api.updateCompany(studentId, data, selectedCompany);
            showToast("Entreprise mise à jour avec succès", "success");
            fetchCompanies();
            setIsViewModalOpen(false);
        } catch (error) {
            console.error("Failed to update company", error);
            showToast("Erreur lors de la mise à jour de l'entreprise", "error");
        } finally {
            setIsSavingCompany(false);
        }
    };

    const fetchFichesData = async () => {
        setLoading(true);
        try {
            const data = await api.getStudentsList({ avecFicheUniquement: false, avecCerfaUniquement: false, dossierCompletUniquement: false });
            setFichesData(data);
            setCandidates(data.etudiants || []);
        } catch (error) {
            console.error("Failed to fetch fiches data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRHStats = async () => {
        setLoading(true);
        try {
            const data = await api.getRHStats();
            setRhStats(data);
        } catch (error) {
            console.error("Failed to fetch RH stats", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const data = await api.getAllCompanies();
            setCompanies(data);
        } catch (error) {
            console.error("Failed to fetch companies", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    // Specific CERFA View
    if (activeSubView === 'rh-cerfa') {
        const filteredCandidates = candidates.filter(c => {
            const fullName = `${c.prenom || ''} ${c.nom || ''}`.toLowerCase();
            const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.entreprise_raison_sociale || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFormation = filterFormation === 'Toutes formations' || c.formation === filterFormation;
            // Note: referent filter is mock logic as field might not exist in candidate object
            const matchesReferent = filterReferent === 'Tous référents' || c.referent === filterReferent;

            return matchesSearch && matchesFormation && matchesReferent;
        });

        return (
            <div className="animate-slide-in pb-20 font-sans">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-brand via-indigo-400 to-brand rounded-2xl p-7 mb-6 text-white relative overflow-hidden shadow-lg border border-white/10">
                    <div className="relative z-10 flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/10">
                                <FileText size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold mb-1 tracking-tight">Gestion des CERFA</h1>
                                <p className="opacity-90 text-sm font-medium">Suivi complet des contrats d'apprentissage • Version 2.0</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20" leftIcon={<Clock size={16} />}>
                                Historique
                            </Button>
                            <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20" leftIcon={<CheckCircle2 size={16} />}>
                                Exporter
                            </Button>
                            <Button variant="secondary" className="bg-white text-brand hover:shadow-xl" leftIcon={<Plus size={18} strokeWidth={3} />}>
                                Nouveau CERFA
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-indigo-400 flex items-center justify-center text-white shadow-md">
                            <FileText size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{fichesData?.total || 0}</div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Étudiants</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-md">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{fichesData?.etudiants_avec_fiche || 0}</div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Avec Fiche</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-md">
                            <FileText size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{fichesData?.etudiants_avec_cerfa || 0}</div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Avec CERFA</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-md">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{fichesData?.etudiants_dossier_complet || 0}</div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Dossier Complet</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center text-white shadow-md">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{fichesData?.etudiants_sans_documents || 0}</div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Sans Documents</div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 mb-6 flex justify-between items-center flex-wrap gap-4 shadow-sm">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-transparent rounded-xl w-64 focus-within:bg-white focus-within:border-brand/50 transition-all">
                            <Search size={16} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm w-full"
                            />
                        </div>

                        <select
                            value={filterFormation}
                            onChange={(e) => setFilterFormation(e.target.value)}
                            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none hover:bg-slate-50 cursor-pointer"
                        >
                            <option>Toutes formations</option>
                            <option>BTS NDRC</option>
                            <option>BTS MCO</option>
                            <option>Bachelor RDC</option>
                            <option>TP NTC</option>
                        </select>

                        <select
                            value={filterReferent}
                            onChange={(e) => setFilterReferent(e.target.value)}
                            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none hover:bg-slate-50 cursor-pointer"
                        >
                            <option>Tous référents</option>
                            <option>Alex</option>
                            <option>Bilal</option>
                            <option>Maxime</option>
                            <option>Arsène</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                        <CheckCircle2 size={14} /> Sauvegardé
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto max-h-[70vh]">
                        <table className="w-full border-collapse">
                            <thead className="bg-gradient-to-r from-brand to-indigo-600 text-white sticky top-0 z-10">
                                <tr>
                                    {["Formation", "Apprenti", "Entreprise", "Fiche Renseign.", "Statut CERFA", "CERFA PDF", "Convention", "Dossier", "Actions"].map((header) => (
                                        <th key={header} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={8} className="p-12 text-center text-slate-500"><Loader2 className="animate-spin mx-auto mb-4 text-brand" size={32} />Chargement des données...</td></tr>
                                ) : filteredCandidates.length === 0 ? (
                                    <tr><td colSpan={8} className="p-12 text-center text-slate-500">Aucun dossier trouvé</td></tr>
                                ) : (
                                    filteredCandidates.map((c: any, idx: number) => (
                                        <tr key={c.record_id || idx} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                    {formatFormation(c.formation) || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 text-sm">{c.nom?.toUpperCase()} {c.prenom}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{c.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">{c.entreprise_raison_sociale || 'Non renseignée'}</span>
                                                    {c.alternance && <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">En alternance</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {c.has_fiche_renseignement ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase border border-emerald-100">
                                                        <CheckCircle2 size={10} /> Reçue
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-600 text-[10px] font-black uppercase border border-amber-100">
                                                        <Clock size={10} /> En attente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {c.has_cerfa ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase border border-blue-100">
                                                        <CheckCircle2 size={10} /> Généré
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-400 text-[10px] font-black uppercase border border-slate-200">
                                                        À faire
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {c.cerfa ? (
                                                    <a
                                                        href={c.cerfa.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-white text-blue-600 rounded-xl border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm group/btn"
                                                    >
                                                        <Download size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                        <span className="text-[10px] font-black truncate max-w-[100px]">{c.cerfa.filename}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] text-slate-300 font-bold italic">Indisponible</span>
                                                )}
                                            </td>
                                             <td className="px-6 py-4">
                                                 {c.convention ? (
                                                     <a
                                                         href={c.convention.url}
                                                         target="_blank"
                                                         rel="noopener noreferrer"
                                                         className="flex items-center gap-2 px-3 py-1.5 bg-white text-indigo-600 rounded-xl border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm group/btn"
                                                     >
                                                         <Download size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                         <span className="text-[10px] font-black truncate max-w-[100px] text-left">{c.convention.filename}</span>
                                                     </a>
                                                 ) : (
                                                     <div className="flex justify-center">
                                                         <span className="text-[10px] text-slate-300 font-bold italic">Indisponible</span>
                                                     </div>
                                                 )}
                                             </td>
                                            <td className="px-6 py-4 text-center">
                                                {c.dossier_complet ? (
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                                                        <CheckCircle2 size={16} strokeWidth={3} />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mx-auto">
                                                        <Clock size={16} strokeWidth={3} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:text-blue-500 text-slate-400 flex items-center justify-center transition-all shadow-sm hover:shadow-md"><Eye size={16} /></button>
                                                    <button className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:border-red-500 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all shadow-sm hover:shadow-md"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="fixed bottom-6 right-6 bg-white border border-emerald-100 shadow-xl rounded-xl px-4 py-3 flex items-center gap-3 animate-slide-up z-50">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <Save size={16} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-800">Modifications enregistrées</div>
                        <div className="text-[10px] text-slate-500">Dernière sauvegarde: À l'instant</div>
                    </div>
                </div>
            </div>
        );
    }

    // RH Fiches Entreprise View
    if (activeSubView === 'rh-fiche') {
        const filteredCompanies = (companies || []).filter(c => {
            if (!c || !c.fields) return false;
            const f = c.fields;
            const searchLower = (searchQuery || '').toLowerCase();

            const raisonSociale = String(f['Raison sociale'] || '').toLowerCase();
            const siret = String(f['Numéro SIRET'] || '').toLowerCase();
            const ville = String(f['Ville entreprise'] || '').toLowerCase();

            return raisonSociale.includes(searchLower) ||
                siret.includes(searchLower) ||
                ville.includes(searchLower);
        });

        return (
            <div className="animate-slide-in pb-20 font-sans">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-primary via-blue-400 to-primary rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-xl border border-white/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 flex justify-between items-center flex-wrap gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/10">
                                <Building size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black mb-1 tracking-tight">Gestion des Entreprises</h1>
                                <p className="opacity-90 text-sm font-medium">Suivi des partenaires et des fiches de renseignement entreprise</p>
                            </div>
                        </div>
                        <Button variant="secondary" className="bg-white text-primary" leftIcon={<Plus size={18} />}>
                            Nouvelle Entreprise
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card icon={<Building size={28} />} title={companies.length.toString()} subtitle="Total Entreprises" className="!p-6" />
                    <Card icon={<Users size={28} />} title={companies.filter(c => c.fields?.recordIdetudiant).length.toString()} subtitle="Avec Alternants" className="!p-6" />
                    <Card icon={<Clock size={28} />} title={companies.filter(c => !c.fields?.['N de bon de commande']).length.toString()} subtitle="BC en attente" className="!p-6" />
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 mb-6 flex justify-between items-center flex-wrap gap-4 shadow-sm">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-transparent rounded-xl w-80 focus-within:bg-white focus-within:border-primary/50 transition-all">
                            <Search size={18} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom ou SIRET..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto max-h-[70vh]">
                        <table className="w-full border-collapse">
                            <thead className="bg-gradient-to-r from-primary to-blue-600 text-white sticky top-0 z-10">
                                <tr>
                                    {[
                                        "Entreprise", "Localisation", "Contact", "Maître d'Apprentissage", "Contrat", "OPCO", "Actions"
                                    ].map((header) => (
                                        <th key={header} className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={7} className="p-12 text-center text-slate-500"><Loader2 className="animate-spin mx-auto mb-4 text-teal-500" size={32} />Chargement des entreprises...</td></tr>
                                ) : filteredCompanies.length === 0 ? (
                                    <tr><td colSpan={7} className="p-12 text-center text-slate-500">Aucune entreprise trouvée</td></tr>
                                ) : (
                                    filteredCompanies.map((c: any, idx: number) => {
                                        const f = c.fields || {};
                                        return (
                                            <tr key={c.id || idx} className="hover:bg-teal-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800 text-sm">{f['Raison sociale'] || 'N/A'}</span>
                                                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">SIRET: {f['Numéro SIRET'] || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-semibold text-slate-600">{f['Ville entreprise'] || 'N/A'}</span>
                                                        <span className="text-[10px] text-slate-400">{f['Code postal entreprise'] || ''}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                                                            <Mail size={12} className="text-slate-300" /> {f['Email entreprise'] || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                                                            <Phone size={12} className="text-slate-300" /> {f['Téléphone entreprise'] || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-700">{f['Prénom Maître apprentissage']} {f['Nom Maître apprentissage']}</span>
                                                        <span className="text-[10px] text-slate-400 italic">{f['Fonction Maître apprentissage'] || 'Tuteur'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-teal-600">{f['Poste occupé'] || 'N/A'}</span>
                                                        <span className="text-[10px] text-slate-400">{f['Formation']}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-wider border border-slate-200">
                                                        {f['Nom OPCO'] || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleViewCompany(c.id)}
                                                            title="Voir les détails"
                                                            className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:border-teal-500 text-teal-500 flex items-center justify-center transition-all shadow-sm"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDownload(f['Fiche entreprise']?.[0]?.url, f['Fiche entreprise']?.[0]?.filename)}
                                                            title="Télécharger la fiche"
                                                            className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:border-teal-500 text-teal-500 flex items-center justify-center transition-all shadow-sm"
                                                        >
                                                            <FileText size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <CompanyDetailsModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    company={selectedCompany}
                    loading={loading}
                    isEditing={isCompanyEditing}
                    setIsEditing={setIsCompanyEditing}
                    onEdit={handleEnterCompanyEditMode}
                    editForm={companyEditForm}
                    setEditForm={setCompanyEditForm}
                    onSave={handleSaveCompanyEdit}
                    isSaving={isSavingCompany}
                />
            </div>
        );
    }

    // Default RH View (Dashboard)
    if (activeSubView === 'rh-dashboard') {
        return (
            <div className="animate-slide-in pb-20 font-sans">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-brand via-indigo-400 to-brand rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-xl border border-white/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 flex justify-between items-center flex-wrap gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/10">
                                <Users size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black mb-1 tracking-tight">Tableau de Bord RH</h1>
                                <p className="opacity-90 text-sm font-medium">Vue d'ensemble du recrutement et de l'alternance</p>
                            </div>
                        </div>
                        <Button variant="secondary" className="bg-white text-brand" leftIcon={<Download size={18} />}>
                            Rapport Complet
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Étudiants', value: rhStats?.total_etudiants || 0, icon: Users, color: 'indigo' },
                        { label: 'Fiches Entreprise', value: rhStats?.total_fiches_entreprise || 0, icon: Briefcase, color: 'emerald' },
                        { label: 'CERFA Signés', value: rhStats?.etudiants_avec_cerfa || 0, icon: FileText, color: 'blue' },
                        { label: 'Sans Documents', value: rhStats?.etudiants_sans_documents || 0, icon: AlertCircle, color: 'rose' },
                    ].map((stat, i) => (
                        <Card key={i} icon={<stat.icon size={24} />} title={stat.value.toString()} subtitle={stat.label} className="!p-6" />
                    ))}
                </div>

                {/* Rates & Progress */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <Card title="Taux de Complétion" icon={<CheckCircle2 className="text-emerald-500" />}>
                        <div className="space-y-8 mt-4">
                            {[
                                { label: 'Taux CERFA', value: rhStats?.taux_cerfa || 0, color: 'blue' },
                                { label: 'Taux Dossier Complet', value: rhStats?.taux_dossier_complet || 0, color: 'emerald' },
                                { label: 'Taux Fiche Renseignement', value: rhStats?.taux_fiche_renseignement || 0, color: 'indigo' },
                            ].map((rate, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-sm font-bold text-slate-600">{rate.label}</span>
                                        <span className="text-lg font-black">{rate.value}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${rate.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="flex flex-col justify-center items-center text-center">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
                            <AlertCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Attention Requise</h3>
                        <p className="text-slate-500 mb-6 max-w-xs">
                            <strong>{rhStats?.etudiants_sans_documents || 0} étudiants</strong> n'ont pas encore transmis leurs documents obligatoires.
                        </p>
                        <Button variant="danger" size="lg">
                            Relancer les étudiants
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-slide-in">
            <h1 className="text-2xl font-bold mb-4 text-slate-800">Ressources Humaines</h1>
            <Card className="p-12 text-center border-2 border-dashed">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Users size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Sélectionnez une section</h3>
                <p className="text-slate-500">Utilisez le menu de gauche pour naviguer dans le module RH</p>
            </Card>
        </div>
    );
};

export default RHView;