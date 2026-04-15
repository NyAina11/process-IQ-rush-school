import React, { useState, useEffect } from 'react';
import { ViewId } from '../types';
import {
    FileText, Users, Eye, Trash2, Search, Plus, CheckCircle2,
    AlertCircle, Clock, Briefcase, Save, Download, Building,
    Loader2, Mail, Phone, RefreshCcw, Calendar, DollarSign
} from 'lucide-react';
import OpcoDossierDetail from './OpcoDossierDetail';
import { api } from '../services/api';
import Button from './ui/Button';
import { useAppStore } from '../store/useAppStore';
import CompanyDetailsModal from './dashboard/CompanyDetailsModal';
import { formatFormation, decimalToTime } from '../utils/formatters';
import DocDownloadBtn from './ui/DocDownloadBtn';

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

const opcoStatusStyles: Record<string, string> = {
    BROUILLON: 'bg-slate-100 text-slate-600 border-slate-200',
    EN_PREPARATION: 'bg-slate-200 text-slate-700 border-slate-300',
    PRET_A_ENVOYER: 'bg-sky-50 text-sky-700 border-sky-200',
    ENVOYE: 'bg-amber-50 text-amber-700 border-amber-200',
    EN_ATTENTE_VALIDATION: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    COMPLEMENT_DEMANDE: 'bg-orange-50 text-orange-700 border-orange-200',
    ACCEPTE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REFUSE: 'bg-rose-50 text-rose-700 border-rose-200',
    REFUSE_DEFINITIF: 'bg-red-100 text-red-800 border-red-300',
    ANNULE: 'bg-slate-100 text-slate-500 border-slate-300 line-through',
    CLOTURE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

const formatOpcoDate = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('fr-FR');
};

const getDeadlineLabel = (value?: string | null) => {
    if (!value) return { text: '—', className: 'text-[#9ca3af]' };
    const target = new Date(value);
    if (Number.isNaN(target.getTime())) return { text: '—', className: 'text-[#9ca3af]' };

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const end = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    const diffDays = Math.round((end - start) / 86400000);

    if (diffDays < 0) return { text: `${Math.abs(diffDays)} j de retard`, className: 'text-rose-600 font-semibold' };
    if (diffDays === 0) return { text: 'Aujourd’hui', className: 'text-orange-600 font-semibold' };
    if (diffDays < 2) return { text: `${diffDays} j restant`, className: 'text-orange-600 font-semibold' };
    return { text: `${diffDays} j restants`, className: 'text-emerald-700' };
};

// ─────────────────────────────────────────────────────

const isMongoId = (value?: string | null) => /^[a-f\d]{24}$/i.test(String(value || '').trim());

const buildAttachment = (type: string, item: any, fallbackName?: string) => {
    if (!item || typeof item !== 'object') return null;
    const url = String(item.url || '').trim();
    const filename = String(item.filename || fallbackName || type).trim();
    if (!url) return null;
    return { type, url, filename };
};

const findAttachmentInFields = (fields: Record<string, any>, matcher: (key: string) => boolean) => {
    const match = Object.entries(fields || {}).find(([key, value]) => matcher(key) && Array.isArray(value) && value.length > 0);
    return Array.isArray(match?.[1]) ? match?.[1]?.[0] || null : null;
};

const collectOpcoDocuments = (candidate: any, company: any) => {
    const candidateFields = candidate?.fields || {};
    const companyFields = company?.fields || {};
    const documents = [
        buildAttachment('cerfa', candidate?.cerfa, 'CERFA.pdf'),
        buildAttachment('convention_apprentissage', candidate?.convention, 'Convention apprentissage.pdf'),
        buildAttachment('fiche_entreprise', candidate?.fiche_entreprise, 'Fiche entreprise.pdf'),
        candidate?.livret_apprentissage_url ? { type: 'livret_apprentissage', url: candidate.livret_apprentissage_url, filename: candidate.livret_apprentissage_name || 'Livret apprentissage.pdf' } : null,
        candidate?.certificat_scolarite_url ? { type: 'certificat_scolarite', url: candidate.certificat_scolarite_url, filename: candidate.certificat_scolarite_name || 'Certificat de scolarite.pdf' } : null,
        candidate?.cv_url ? { type: 'cv', url: candidate.cv_url, filename: candidate.cv_name || 'CV.pdf' } : null,
        candidate?.cni_url ? { type: 'cni', url: candidate.cni_url, filename: candidate.cni_name || 'CNI.pdf' } : null,
        candidate?.diplome_url ? { type: 'diplome', url: candidate.diplome_url, filename: candidate.diplome_name || 'Diplome.pdf' } : null,
        candidate?.lettre_motivation_url ? { type: 'lettre_motivation', url: candidate.lettre_motivation_url, filename: candidate.lettre_motivation_name || 'Lettre de motivation.pdf' } : null,
        candidate?.vitale_url ? { type: 'vitale', url: candidate.vitale_url, filename: candidate.vitale_name || 'Carte vitale.pdf' } : null,
        buildAttachment(
            'facture',
            findAttachmentInFields(candidateFields, (key) => /facture|invoice|billing/i.test(key)) ||
                findAttachmentInFields(companyFields, (key) => /facture|invoice|billing/i.test(key)),
            'Facture.pdf'
        ),
    ].filter(Boolean) as Array<{ type: string; url: string; filename: string }>;

    const seen = new Set<string>();
    return documents.filter((document) => {
        const key = `${document.type}|${document.url}|${document.filename}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const buildOpcoPayload = (company: any, candidate: any) => {
    const companyFields = company?.fields || {};
    const candidateFields = candidate?.fields || {};
    const apprenticeLastName = candidate?.nom_usage || candidate?.nom_naissance || '';
    const apprenticeFullName = `${candidate?.prenom || ''} ${apprenticeLastName}`.trim();
    const employerName = company?.identification?.raison_sociale || companyFields['Raison sociale'] || '';
    const employerSiret = company?.identification?.siret || companyFields['Numéro SIRET'] || '';
    const codeNaf = company?.identification?.code_ape_naf || companyFields['Code APE/NAF'] || '';
    const formationLabel = company?.formation?.choisie || candidate?.formation_souhaitee || companyFields['Formation'] || '';
    const rncp = company?.formation?.code_rncp || companyFields['Code Rncp'] || '';

    return {
        source: 'rh-pec-ui',
        companyId: company?.id || '',
        employeur_id: company?.id || '',
        record_id_etudiant: companyFields?.recordIdetudiant || candidate?.id || '',
        candidateName: apprenticeFullName,
        apprentiNom: apprenticeFullName,
        identification: {
            ...company?.identification,
            raison_sociale: employerName,
            siret: employerSiret,
            code_ape_naf: codeNaf,
            num: company?.adresse?.num || companyFields['Numéro entreprise'] || '',
            voie: company?.adresse?.voie || companyFields['Voie entreprise'] || '',
            complement: company?.adresse?.complement || companyFields['Complément dadresse entreprise'] || '',
            code_postal: company?.adresse?.code_postal || companyFields['Code postal entreprise'] || '',
            ville: company?.adresse?.ville || companyFields['Ville entreprise'] || '',
            telephone: company?.adresse?.telephone || companyFields['Téléphone entreprise'] || '',
            email: company?.adresse?.email || companyFields['Email entreprise'] || '',
        },
        employeur: {
            raison_sociale: employerName,
            siret: employerSiret,
            code_naf: codeNaf,
            telephone: company?.adresse?.telephone || companyFields['Téléphone entreprise'] || '',
            email: company?.adresse?.email || companyFields['Email entreprise'] || '',
        },
        apprenti: {
            prenom: candidate?.prenom || '',
            nom: apprenticeLastName,
            nom_complet: apprenticeFullName,
            email: candidate?.email || '',
            telephone: candidate?.telephone || '',
            date_naissance: candidate?.date_naissance || '',
        },
        contrat: {
            ...company?.contrat,
            type_contrat: company?.contrat?.type_contrat || companyFields['Type de contrat'] || '',
            date_conclusion: company?.contrat?.date_conclusion || companyFields['Date de conclusion'] || '',
            date_debut_execution: company?.contrat?.date_debut_execution || company?.contrat?.date_debut || companyFields['Date de début exécution'] || '',
            date_fin: company?.contrat?.date_fin || company?.formation?.date_fin || companyFields['Fin du contrat apprentissage'] || '',
            intitule_diplome: formationLabel,
            code_rncp: rncp,
            statut: companyFields['Statut contrat'] || candidateFields['Statut contrat'] || '',
        },
        formation: {
            ...company?.formation,
            choisie: formationLabel,
            code_rncp: rncp,
        },
        opco: {
            nom_opco: companyFields['Nom OPCO'] || company?.opco?.nom || '',
        },
        cfa: company?.cfa || {},
        metadata_source: {
            companyRecordId: company?.id || '',
            candidateRecordId: candidate?.id || '',
        },
    };
};

const RHView: React.FC<{ activeSubView: ViewId }> = ({ activeSubView }) => {
    const { showToast } = useAppStore();
    const [fichesData, setFichesData] = useState<any>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [rhStats, setRhStats] = useState<any>(null);
    const [companies, setCompanies] = useState<any[]>([]);
    const [opcoConfig, setOpcoConfig] = useState<any>(null);
    const [opcoDossiers, setOpcoDossiers] = useState<any[]>([]);
    const [opcoLoading, setOpcoLoading] = useState(false);
    const [opcoError, setOpcoError] = useState<string | null>(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [isCreatingOpco, setIsCreatingOpco] = useState(false);
    const [opcoFilterStatus, setOpcoFilterStatus] = useState<string>('all');
    const [loading, setLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterFormation, setFilterFormation] = useState('Toutes formations');
    const [filterReferent, setFilterReferent] = useState('Tous référents');
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCompanyEditing, setIsCompanyEditing] = useState(false);
    const [companyEditForm, setCompanyEditForm] = useState<any>(null);
    const [isSavingCompany, setIsSavingCompany] = useState(false);
    const [selectedOpcoDossier, setSelectedOpcoDossier] = useState<any>(null);
    const [isOpcoDossierModalOpen, setIsOpcoDossierModalOpen] = useState(false);

    useEffect(() => {
        if (activeSubView === 'rh-cerfa') fetchFichesData();
        else if (activeSubView === 'rh-dashboard') fetchRHStats();
        else if (activeSubView === 'rh-fiche') fetchCompanies();
        else if (activeSubView === 'rh-pec') fetchOpcoData();
    }, [activeSubView]);

    const initializeCompanyForm = (data: any) => {
        if (!data || !data.fields) return;
        const f = data.fields;
        setCompanyEditForm({
            identification: { raison_sociale: f["Raison sociale"] || "", siret: f["Numéro SIRET"] || "", code_ape_naf: f["Code APE/NAF"] || "", type_employeur: f["Type demployeur"] || "", effectif: f["Effectif salarié de l'entreprise"] || "", convention: f["Convention collective"] || "" },
            adresse: { num: f["Numéro entreprise"] || "", voie: f["Voie entreprise"] || "", complement: f["Complément dadresse entreprise"] || "", code_postal: f["Code postal entreprise"] || "", ville: f["Ville entreprise"] || "", telephone: f["Téléphone entreprise"] || "", email: f["Email entreprise"] || "" },
            maitre_apprentissage: { nom: f["Nom Maître apprentissage"] || "", prenom: f["Prénom Maître apprentissage"] || "", date_naissance: f["Date de naissance Maître apprentissage"] || "", fonction: f["Fonction Maître apprentissage"] || "", diplome_plus_eleve: f["Diplôme Maître apprentissage intitulé"] || f["Diplôme Maître apprentissage"] || "", diplome: f["Diplôme Maître apprentissage"] || "", experience: f["Année experience pro Maître apprentissage"] || "", telephone: f["Téléphone Maître apprentissage"] || "", email: f["Email Maître apprentissage"] || "" },
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
        if (isDownloading) return;

        try {
            setIsDownloading(true);
            const response = await fetch(url);
            if (!response.ok) throw new Error('Fetch failed');
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = filename || 'document';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);
            showToast('Téléchargement démarré', 'success');
        } catch (error) {
            window.open(url, '_blank');
            showToast('Document ouvert dans un nouvel onglet', 'info');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSaveCompanyEdit = async (id: string, data: any) => {
        setIsSavingCompany(true);
        try {
            const studentId = data.record_id_etudiant || selectedCompany?.fields?.recordIdetudiant;
            if (!studentId) { showToast("Impossible d'identifier l'étudiant lié.", "error"); return; }
            const userRole = localStorage.getItem('userRole') || 'admission';
            await api.updateCompany(studentId, data, selectedCompany, userRole);
            showToast("Entreprise mise à jour", "success");
            
            // Automate document regeneration after modification
            console.log('🔄 Triggering document regeneration (RH Company update) for:', studentId);
            api.generateCerfa(studentId).catch(err => console.error("CERFA regeneration failed:", err));
            api.generateFicheRenseignement(studentId).catch(err => console.error("Fiche regeneration failed:", err));
            api.generateConventionApprentissage(studentId).catch(err => console.error("Convention regeneration failed:", err));

            fetchCompanies(); setIsViewModalOpen(false);
        } catch { showToast("Erreur lors de la mise à jour.", "error"); }
        finally { setIsSavingCompany(false); }
    };

    const fetchFichesData = async () => { setLoading(true); try { const data = await api.getStudentsList({ avecFicheUniquement: false, avecCerfaUniquement: false, dossierCompletUniquement: false }); setFichesData(data); setCandidates(data.etudiants || []); } catch { } finally { setLoading(false); } };
    const fetchRHStats = async () => { setLoading(true); try { const data = await api.getRHStats(); setRhStats(data); } catch { } finally { setLoading(false); } };
    const fetchCompanies = async () => { setLoading(true); try { const data = await api.getAllCompanies(); setCompanies(data); } catch { } finally { setLoading(false); } };

    const fetchOpcoData = async () => {
        setOpcoLoading(true);
        setOpcoError(null);
        try {
            const [config, dossiers, companyList] = await Promise.all([
                api.getOpcoConfig(),
                api.getOpcoDossiers(),
                api.getAllCompanies(),
            ]);
            setOpcoConfig(config);
            setOpcoDossiers(Array.isArray(dossiers) ? dossiers : []);
            setCompanies(Array.isArray(companyList) ? companyList : []);
        } catch (error: any) {
            setOpcoError(error?.message || "Impossible de charger les dossiers OPCO");
        } finally {
            setOpcoLoading(false);
        }
    };

    const handleCreateOpcoDossier = async () => {
        if (!selectedCompanyId) {
            showToast("Veuillez sélectionner une entreprise", "info");
            return;
        }
        const company = companies.find(c => c.id === selectedCompanyId);
        if (!company || !company.fields) {
            showToast("Entreprise introuvable", "error");
            return;
        }
        const candidateId = company.fields?.recordIdetudiant || null;
        if (!candidateId) {
            showToast("Cette entreprise n'est pas liée à un candidat", "error");
            return;
        }

        const payload = {
            candidateId,
            companyId: company.id,
            opcoName: company.fields?.['Nom OPCO'] || '',
            company: company.fields,
        };

        setIsCreatingOpco(true);
        try {
            await api.createOpcoDossier({
                opcoName: payload.opcoName,
                candidateId,
                companyId: company.id,
                payload,
                metadata: { source: 'rh-pec-ui' },
                documents: [],
            });
            showToast("Dossier OPCO créé", "success");
            setSelectedCompanyId('');
            fetchOpcoData();
        } catch (error: any) {
            showToast(error?.message || "Erreur création dossier OPCO", "error");
        } finally {
            setIsCreatingOpco(false);
        }
    };

    const handleCreateFullOpcoDossier = async () => {
        if (!selectedCompanyId) {
            showToast("Veuillez sélectionner une entreprise", "info");
            return;
        }
        const company = companies.find(c => c.id === selectedCompanyId);
        if (!company || !company.fields) {
            showToast("Entreprise introuvable", "error");
            return;
        }
        const candidateId = company.fields?.recordIdetudiant || null;
        if (!candidateId) {
            showToast("Cette entreprise n'est pas liée à un candidat", "error");
            return;
        }

        setIsCreatingOpco(true);
        try {
            let candidate = await api.getCandidateById(candidateId);
            const generatedDocuments: string[] = [];

            if (!candidate?.has_cerfa) {
                try {
                    await api.generateCerfa(candidateId);
                    generatedDocuments.push('CERFA');
                } catch (error) {
                    console.error('CERFA generation failed before OPCO submission:', error);
                }
            }

            if (!candidate?.has_convention) {
                try {
                    await api.generateConventionApprentissage(candidateId);
                    generatedDocuments.push('convention');
                } catch (error) {
                    console.error('Convention generation failed before OPCO submission:', error);
                }
            }

            if (generatedDocuments.length > 0) {
                candidate = await api.getCandidateById(candidateId);
            }

            const payload = buildOpcoPayload(company, candidate);
            const documents = collectOpcoDocuments(candidate, company);
            const codeNaf = payload.identification?.code_ape_naf || payload.employeur?.code_naf || '';

            await api.createOpcoDossier({
                opcoName: company.fields?.['Nom OPCO'] || '',
                candidateId: isMongoId(candidateId) ? candidateId : undefined,
                companyId: isMongoId(company.id) ? company.id : undefined,
                codeNaf,
                payload,
                metadata: {
                    source: 'rh-pec-ui',
                    generatedDocuments,
                    sourceIds: {
                        candidateRecordId: candidateId,
                        companyRecordId: company.id,
                    },
                    attachedDocumentTypes: documents.map((document) => document.type),
                },
                documents,
            });
            showToast(generatedDocuments.length > 0 ? "Dossier OPCO créé avec génération automatique des pièces" : "Dossier OPCO créé", "success");
            setSelectedCompanyId('');
            fetchOpcoData();
        } catch (error: any) {
            showToast(error?.message || "Erreur création dossier OPCO", "error");
        } finally {
            setIsCreatingOpco(false);
        }
    };

    const handleResubmit = async (id: string) => {
        try {
            await api.resubmitOpcoDossier(id);
            showToast("Renvoi OPCO effectué", "success");
            fetchOpcoData();
        } catch (error: any) {
            showToast(error?.message || "Erreur lors du renvoi OPCO", "error");
        }
    };

    const handleSync = async (id: string) => {
        try {
            await api.syncOpcoDossier(id);
            showToast("Synchronisation OPCO effectuée", "success");
            fetchOpcoData();
        } catch (error: any) {
            showToast(error?.message || "Erreur lors de la synchronisation OPCO", "error");
        }
    };

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
                                            <button 
                                                onClick={() => handleDownload(c.cerfa.url, c.cerfa.filename)}
                                                disabled={isDownloading}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f5f3ff] text-[#6d28d9] border border-[#e5e0f5] rounded-lg text-[10px] font-semibold hover:bg-[#6d28d9] hover:text-white transition-all disabled:opacity-50 disabled:cursor-wait">
                                                {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                                                <span className="truncate max-w-[80px]">{c.cerfa.filename}</span>
                                            </button>
                                        ) : <span className="text-[11px] text-[#d1d5db]">Indisponible</span>}
                                    </Td>
                                    <Td>
                                        {c.convention ? (
                                            <button 
                                                onClick={() => handleDownload(c.convention.url, c.convention.filename)}
                                                disabled={isDownloading}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f5f3ff] text-[#6d28d9] border border-[#e5e0f5] rounded-lg text-[10px] font-semibold hover:bg-[#6d28d9] hover:text-white transition-all disabled:opacity-50 disabled:cursor-wait">
                                                {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                                                <span className="truncate max-w-[80px]">{c.convention.filename}</span>
                                            </button>
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
                                                <DocDownloadBtn
                                                    label=""
                                                    url={f['Fiche entreprise']?.[0]?.url}
                                                    filename={f['Fiche entreprise']?.[0]?.filename}
                                                    has={!!f['Fiche entreprise']?.[0]?.url}
                                                    showLabel={false}
                                                    icon={FileText}
                                                />
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
            <div className="animate-fade-in pb-20">
                <Hero title="Dashboard RH" subtitle="Indicateurs clés et performance administrative" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {dashStats.map((s, i) => <StatCard key={i} {...s} />)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {rates.map((r, i) => (
                        <div key={i} className="bg-white border border-[#e5e0f5] rounded-3xl p-8 shadow-sm">
                            <div className="flex justify-between items-end mb-4">
                                <div className="text-[13px] font-bold text-[#9ca3af] uppercase tracking-widest">{r.label}</div>
                                <div className="text-3xl font-black" style={{ color: r.color }}>{r.value}%</div>
                            </div>
                            <div className="h-2 w-full bg-[#f5f3ff] rounded-full overflow-hidden">
                                <div className="h-full transition-all duration-1000" style={{ width: `${r.value}%`, background: r.color }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── PRISES EN CHARGE (OPCO) ──
    if (activeSubView === 'rh-pec') {
        const filteredDossiers = opcoDossiers.filter(d => {
            const q = searchQuery.toLowerCase();
            const hay = `${d.opcoName || ''} ${d.opcoCode || ''} ${d._id || d.id || ''} ${d.status || ''} ${d.candidateId || ''} ${d.apprentiNom || ''} ${d.employerName || ''} ${d.employerSiret || ''}`.toLowerCase();
            if (q && !hay.includes(q)) return false;
            if (opcoFilterStatus === 'all') return true;
            return d.status === opcoFilterStatus;
        });

        return (
            <div className="animate-fade-in pb-20">
                <Hero title="Prises en Charge (PEC)" subtitle="Suivi des dossiers de financement OPCO"
                    action={
                        <div className="flex gap-2">
                            <button onClick={() => fetchOpcoData()} className="p-2.5 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all">
                                <RefreshCcw size={16} className={opcoLoading ? 'animate-spin' : ''} />
                            </button>
                            <StyledSelect value={selectedCompanyId} onChange={(e: any) => setSelectedCompanyId(e.target.value)}>
                                <option value="">Sélectionner une entreprise...</option>
                                {companies.map(c => <option key={c.id} value={c.id}>{c.fields?.['Raison sociale']} ({c.fields?.['Nom OPCO']})</option>)}
                            </StyledSelect>
                            <button
                                onClick={handleCreateFullOpcoDossier}
                                disabled={isCreatingOpco || !selectedCompanyId}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#6d28d9] rounded-xl text-[13px] font-bold hover:bg-white/90 disabled:opacity-50 transition-all shadow-sm"
                            >
                                {isCreatingOpco ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} strokeWidth={2.5} />}
                                Créer Dossier
                            </button>
                        </div>
                    }
                />

                <FilterBar>
                    <SearchInput value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} placeholder="Rechercher par apprenti, employeur, SIRET ou OPCO..." />
                    <StyledSelect value={opcoFilterStatus} onChange={(e: any) => setOpcoFilterStatus(e.target.value)}>
                        <option value="all">Tous les statuts</option>
                        <option value="BROUILLON">Brouillon</option>
                        <option value="EN_PREPARATION">En préparation</option>
                        <option value="PRET_A_ENVOYER">Prêt à envoyer</option>
                        <option value="ENVOYE">Envoyé</option>
                        <option value="EN_ATTENTE_VALIDATION">En attente validation</option>
                        <option value="COMPLEMENT_DEMANDE">Complément demandé</option>
                        <option value="ACCEPTE">Accepté</option>
                        <option value="REFUSE">Refusé</option>
                        <option value="REFUSE_DEFINITIF">Refus définitif</option>
                        <option value="ANNULE">Annulé</option>
                        <option value="CLOTURE">Clôturé</option>
                        <option value="draft">Brouillon (alias)</option>
                        <option value="pending_submission">En attente (alias)</option>
                        <option value="submitted">Envoyé (alias)</option>
                        <option value="in_review">En revue (alias)</option>
                        <option value="accepted">Accepté (alias)</option>
                        <option value="rejected">Refusé (alias)</option>
                        <option value="error">Erreur</option>
                    </StyledSelect>
                </FilterBar>

                {opcoError && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm font-medium">
                        <AlertCircle size={18} /> {opcoError}
                    </div>
                )}

                <TableWrapper>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                {["OPCO", "Apprenti", "Employeur", "Montant", "Date envoi", "Délai", "Statut", "Actions"].map(h => <Th key={h}>{h}</Th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {opcoLoading && opcoDossiers.length === 0 ? (
                                <tr><td colSpan={8} className="py-16 text-center text-[#9ca3af]"><Loader2 className="animate-spin mx-auto mb-3 text-[#6d28d9]" size={28} /><div className="text-[13px]">Chargement des dossiers...</div></td></tr>
                            ) : filteredDossiers.length === 0 ? (
                                <tr><td colSpan={8} className="py-16 text-center text-[#9ca3af] text-[13px]">Aucun dossier trouvé</td></tr>
                            ) : filteredDossiers.map((d: any) => {
                                const company = companies.find(c => c.id === d.companyId);
                                const companyName = d.employerName || company?.fields?.['Raison sociale'] || 'N/A';
                                const delayStatus = getDeadlineLabel(d.dateLimiteEnvoi);
                                const statusColor = opcoStatusStyles[d.status] || 'bg-slate-50 border-slate-200 text-slate-600';

                                return (
                                    <tr 
                                        key={d._id || d.id} 
                                        className="hover:bg-[#fafafa] transition-colors group cursor-pointer"
                                        onClick={() => {
                                            setSelectedOpcoDossier(d);
                                            setIsOpcoDossierModalOpen(true);
                                        }}
                                    >
                                        <Td>
                                            <div className="text-[13px] font-bold text-[#1e1b2e]">{d.opcoName || 'OPCO'}</div>
                                            {d.opcoCode && <div className="text-[10px] text-[#9ca3af]">Code: {d.opcoCode}</div>}
                                        </Td>
                                        <Td>
                                            <div className="text-[13px] font-bold text-[#1e1b2e]">{d.apprentiNom || d.candidateName || 'N/A'}</div>
                                            {d.formationLabel && <div className="text-[10px] text-[#9ca3af]">{d.formationLabel}</div>}
                                        </Td>
                                        <Td>
                                            <div className="text-[13px] font-medium text-[#374151]">{companyName}</div>
                                            {d.employerSiret && <div className="text-[10px] text-[#9ca3af]">SIRET: {d.employerSiret}</div>}
                                        </Td>
                                        <Td>
                                            <div className="text-[13px] font-bold text-[#1e1b2e]">
                                                {d.montantAnnuel ? `${(d.montantAnnuel).toLocaleString('fr-FR')} €` : 'N/A'}
                                            </div>
                                            {d.montantMensuel && <div className="text-[10px] text-[#9ca3af]">{`${(d.montantMensuel).toLocaleString('fr-FR')} €/mois`}</div>}
                                        </Td>
                                        <Td>
                                            <div className="text-[12px] font-semibold text-[#1e1b2e]">
                                                {formatOpcoDate(d.dateEnvoiOpco) || 'Non envoyé'}
                                            </div>
                                            {d.dateLimiteEnvoi && <div className="text-[10px] text-[#9ca3af]">Limite: {formatOpcoDate(d.dateLimiteEnvoi)}</div>}
                                        </Td>
                                        <Td>
                                            <div className={`text-[12px] font-semibold ${delayStatus.className}`}>
                                                {delayStatus.text}
                                            </div>
                                        </Td>
                                        <Td>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${statusColor}`}>
                                                {(d.status || 'INCONNU').replace(/_/g, ' ')}
                                            </span>
                                        </Td>
                                        <Td onClick={(e) => e.stopPropagation()}>
                                            <div className="flex gap-2">
                                                <ActionBtn icon={Eye} onClick={() => { setSelectedOpcoDossier(d); setIsOpcoDossierModalOpen(true); }} />
                                                <ActionBtn icon={RefreshCcw} onClick={() => handleSync(d._id || d.id)} color="#3b82f6" bg="#eff6ff" border="#dbeafe" />
                                                <ActionBtn icon={CheckCircle2} onClick={() => handleResubmit(d._id || d.id)} color="#22c55e" bg="#f0fdf4" border="#d1fae5" />
                                            </div>
                                        </Td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </TableWrapper>

                {isOpcoDossierModalOpen && selectedOpcoDossier && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Détails Dossier OPCO</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedOpcoDossier.apprentiNom || selectedOpcoDossier.candidateName} • {selectedOpcoDossier.employerName}</p>
                                </div>
                                <button onClick={() => setIsOpcoDossierModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                                    <Clock size={20} className="rotate-45" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8">
                                <OpcoDossierDetail 
                                    dossier={selectedOpcoDossier} 
                                    isOpen={true}
                                    onClose={() => setIsOpcoDossierModalOpen(false)}
                                    onSync={handleSync}
                                    onResubmit={handleResubmit}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default RHView;
