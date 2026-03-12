import React, { useState, useEffect } from 'react';
import {
    Download,
    CheckCircle2,
    AlertCircle,
    Building,
    Search,
    Users,
    FileCheck,
    FileText,
    ArrowRight,
    Loader2,
    Briefcase,
    ShieldCheck,
    Star,
    ChevronRight,
    ClipboardList,
    FileSignature,
    Trash2,
    RefreshCw,
    Copy,
    ExternalLink,
    UserX,
    Building2,
    MoreVertical,
    List,
    LayoutGrid,
    History as HistoryIcon,
    BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Button from './ui/Button';
import { useAppStore } from '../store/useAppStore';
import { AdmissionTab } from '../types';
import CandidateDetailsModal from './dashboard/CandidateDetailsModal';
import CompanyDetailsModal from './dashboard/CompanyDetailsModal';
import HistoryTimeline from './dashboard/HistoryTimeline';
import { useApi } from '../hooks/useApi';
import { useCandidates, getC, isPlaced } from '../hooks/useCandidates';
import { usePagination } from '../hooks/usePagination';
import Pagination from './ui/Pagination';

interface ClassNTCViewProps {
    onSelectStudent: (student: any, tab: AdmissionTab) => void;
}

const ClassNTCView = ({ onSelectStudent }: ClassNTCViewProps) => {
    const { candidates, loading: hookLoading, refresh: refreshCandidates } = useCandidates();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [currentTab, setCurrentTab] = useState<'students' | 'stats' | 'history'>('students');
    const [globalHistory, setGlobalHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [filter, setFilter] = useState<'all' | 'withFiche' | 'withCerfa' | 'complete'>('all');
    const [formationFilter, setFormationFilter] = useState<string>('all');

    // Available formations
    const availableFormations = [
        'BTS MCO A',
        'BTS MCO 2',
        'BTS NDRC 1',
        'BTS COM',
        'Titre Pro NTC',
        'Titre Pro NTC B (rentrée decalée)',
        'Bachelor RDC'
    ];

    // Modal State
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>(null);

    // Company Modal State
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [isCompanyEditing, setIsCompanyEditing] = useState(false);
    const [companyEditForm, setCompanyEditForm] = useState<any>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [isRegenerating, setIsRegenerating] = useState<string | null>(null);

    const { showToast } = useAppStore();
    const navigate = useNavigate();

    const { execute: fetchDetails, loading: detailsLoading } = useApi(api.getCandidateById, {
        onSuccess: (data) => {
            setSelectedCandidate(data);
            setEditForm(data.informations_personnelles || data.fields || data);
        },
        errorMessage: "Erreur lors de la récupération des détails de l'étudiant"
    });

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
                smic1: "smic",
                smic2: "smic",
                smic3: "smic",
                smic4: "smic",
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

    const { execute: fetchCompanyDetails, loading: companyLoading } = useApi(api.getCompanyById, {
        onSuccess: (data) => {
            setSelectedCompany(data);
            initializeCompanyForm(data);
        },
        errorMessage: "Erreur lors de la récupération des détails de l'entreprise"
    });

    const handleEnterCompanyEditMode = () => {
        setIsCompanyEditing(true);
    };

    const { execute: updateCandidate, loading: isSaving } = useApi(api.updateCandidate, {
        successMessage: "Candidat mis à jour avec succès",
        onSuccess: () => {
            fetchStudents();
            setIsModalOpen(false);
        }
    });


    const { execute: updateCompany, loading: isSavingCompany } = useApi(api.updateCompany, {
        successMessage: "Entreprise mise à jour avec succès",
        onSuccess: () => {
            fetchStudents();
            setIsCompanyModalOpen(false);
        }
    });

    const { execute: deleteCandidate, loading: isDeleting } = useApi(api.deleteCandidate, {
        successMessage: "Candidat supprimé avec succès",
        onSuccess: () => {
            fetchStudents();
            setIsModalOpen(false);
        }
    });

    const handleSaveCompanyEdit = async (id: string, data: any) => {
        // Use student ID instead of enterprise ID for update API
        const studentId = data.record_id_etudiant || id;
        await updateCompany(studentId, data, selectedCompany);
    };

    useEffect(() => {
        if (currentTab === 'students') {
            setStudents(candidates);
            setLoading(hookLoading);
        }
    }, [candidates, hookLoading, currentTab]);

    useEffect(() => {
        if (currentTab !== 'students') {
            fetchStudents();
        }
    }, [filter, currentTab]);

    const fetchStudents = async () => {
        if (currentTab === 'students') {
            setStudents(candidates);
            setLoading(hookLoading);
            return;
        }

        try {
            setLoading(true);
            // Step 1: Get the list of IDs
            const list = await api.getAllCandidates();

            if (list && list.length > 0) {
                // Step 2: Fetch FULL details for each student in parallel
                // We use Promise.all to fetch everything as fast as possible
                const fullDetails = await Promise.all(
                    list.map(async (s: any) => {
                        try {
                            const id = s.id || s.record_id || (s.fields && s.fields.id);
                            return await api.getCandidateById(id);
                        } catch (e) {
                            console.error(`Failed to fetch details for student`, e);
                            return null;
                        }
                    })
                );

                // Filter out any failed requests
                setStudents(fullDetails.filter(s => s !== null));
            } else {
                setStudents([]);
            }
        } catch (error) {
            showToast('Erreur lors du chargement des données', 'error');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    // --- STATS CALCULATION ---
    const calculateAge = (birthDate: string) => {
        if (!birthDate) return 0;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    const statsData = React.useMemo(() => {
        if (currentTab !== 'stats' || students.length === 0) return null;

        const sexDist = { male: 0, female: 0, other: 0 };
        const ageDist = { under18: 0, age18_20: 0, age21_25: 0, over25: 0 };
        let totalAge = 0;
        let studentsWithAge = 0;

        students.forEach(s => {
            const info = getC(s);

            // Sexe
            const sexe = (info.sexe || "").toLowerCase();
            if (sexe.includes('masculin') || sexe === 'homme') sexDist.male++;
            else if (sexe.includes('féminin') || sexe.includes('feminin') || sexe === 'femme') sexDist.female++;
            else sexDist.other++;

            // Age
            const age = calculateAge(info.date_naissance);
            if (age > 0) {
                totalAge += age;
                studentsWithAge++;
                if (age < 18) ageDist.under18++;
                else if (age <= 20) ageDist.age18_20++;
                else if (age <= 25) ageDist.age21_25++;
                else ageDist.over25++;
            }
        });

        // Calculate majority age group
        const ageGroups = [
            { label: '-18 ans', count: ageDist.under18 },
            { label: '18-20 ans', count: ageDist.age18_20 },
            { label: '21-25 ans', count: ageDist.age21_25 },
            { label: '26+ ans', count: ageDist.over25 }
        ];
        const majorityGroup = ageGroups.reduce((prev, current) => (prev.count > current.count) ? prev : current).label;

        return {
            sexDist,
            ageDist,
            total: students.length,
            averageAge: studentsWithAge > 0 ? (totalAge / studentsWithAge).toFixed(1) : "N/A",
            majorityGroup: studentsWithAge > 0 ? majorityGroup : "N/A"
        };
    }, [students, currentTab]);

    const handleViewDetails = async (id: string) => {
        setIsModalOpen(true);
        setIsEditing(false);
        const data = await fetchDetails(id);
        if (data) {
            setEditForm(data.informations_personnelles || data.fields || data);
        }
    };

    const handleEnterEditMode = () => {
        if (selectedCandidate) {
            setEditForm(selectedCandidate.informations_personnelles || selectedCandidate.fields || selectedCandidate);
            setIsEditing(true);
        }
    };

    const handleViewCompanyDetails = async (student: any) => {
        setIsCompanyEditing(false);
        const studentId = student.record_id || student.id;
        try {
            const data = await api.getCompanyByStudentId(studentId);
            setSelectedCompany(data);
            setIsCompanyModalOpen(true);
            initializeCompanyForm(data);
        } catch (error) {
            // Fallback to ID enterprise if student link fails
            const companyId = student.id_entreprise || student.record_id_entreprise;
            if (companyId) {
                setIsCompanyModalOpen(true);
                await fetchCompanyDetails(companyId);
            } else {
                showToast("Aucune entreprise liée à cet étudiant", "error");
            }
        }
    };

    const handleDeleteStudent = async (id: string, name: string) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'étudiant ${name} ? Cette action est irréversible.`)) {
            return;
        }

        try {
            // Automatically delete associated company if it exists
            const studentData = getC(students.find(s => (s.record_id || s.id) === id));
            if (studentData.id_entreprise) {
                console.log(`🗑️ Cascading delete: removing company for student ${name}`);
                await api.deleteCompany(id);
            }

            const success = await api.deleteCandidate(id);
            if (success) {
                showToast("Étudiant supprimé avec succès", "success");
                refreshCandidates();
            } else {
                showToast("Erreur lors de la suppression", "error");
            }
        } catch (error) {
            showToast("Erreur lors de la suppression", "error");
        }
    };

    const handleDeleteCompany = async (studentId: string, companyName: string) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'entreprise ${companyName} pour cet étudiant ?`)) {
            return;
        }

        try {
            const success = await api.deleteCompany(studentId);
            if (success) {
                showToast("Entreprise supprimée avec succès", "success");
                refreshCandidates();
            } else {
                showToast("Erreur lors de la suppression de l'entreprise", "error");
            }
        } catch (error) {
            showToast("Erreur lors de la suppression de l'entreprise", "error");
        }
    };

    const handleRegenerateDoc = async (studentId: string, type: string) => {
        setIsRegenerating(`${studentId}-${type}`);
        try {
            let result;
            switch (type) {
                case 'fiche': result = await api.generateFicheRenseignement(studentId); break;
                case 'cerfa': result = await api.generateCerfa(studentId); break;
                case 'atre': result = await api.generateAtre(studentId); break;
                case 'cr': result = await api.generateCompteRendu(studentId); break;
                case 'convention': result = await api.generateConventionApprentissage(studentId); break;
                case 'livret': result = await api.generateLivretApprentissage(studentId); break;
                case 'certificat': result = await api.generateCertificatScolarite(studentId); break;
            }
            showToast("Document régénéré avec succès", "success");
            refreshCandidates();
        } catch (error: any) {
            showToast(error.message || "Erreur lors de la régénération", "error");
        } finally {
            setIsRegenerating(null);
        }
    };

    const handleGenerateSigningLink = async (documentId: string) => {
        console.log(`🌀 Initializing signing link generation for document ID: ${documentId}`);
        try {
            const result = await api.generateSigningLink(documentId);

            if (result && result.signing_link) {
                console.log('✨ [SUCCESS] Signing link generated. Opening link in a new tab:', result.signing_link);
                window.open(result.signing_link, '_blank');
                showToast("Lien de signature généré", "success");
            } else {
                console.warn('⚠️ [WARNING] No signing link found in the API response:', result);
                showToast("Erreur lors de la génération du lien", "error");
            }
        } catch (error: any) {
            console.error('🛑 [CRITICAL] Exception caught during signing link generation:', error);
            showToast(error.message || "Erreur lors de la génération du lien", "error");
        }
    };

    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email);
        showToast("Email copié dans le presse-papier", "success");
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    const handleSaveEdit = async () => {
        if (!selectedCandidate || !editForm) return;
        await updateCandidate(selectedCandidate.record_id || selectedCandidate.id, editForm);
    };

    const handleDelete = async () => {
        const id = selectedCandidate?.record_id || selectedCandidate?.id;
        if (!id) return;
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
            await deleteCandidate(id);
        }
    };

    const handleDownload = async (url: string, filename: string) => {
        if (!url) return;
        try {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Téléchargement démarré', 'success');
        } catch (error) {
            showToast('Erreur lors du téléchargement', 'error');
        }
    };

    const handleFillForm = (student: any) => {
        const studentInfo = getC(student);
        if (isPlaced(student)) {
            showToast('Fiche entreprise déjà complétée', 'info');
            return;
        }

        if (studentInfo.alternance === 'Non') {
            showToast('Attention: Cet étudiant est marqué comme "Non" alternance.', 'info');
        }

        onSelectStudent(student, AdmissionTab.ENTREPRISE);
        navigate('/admission');
    };

    const ActionsMenu = ({ student }: { student: any }) => {
        const isOpen = activeMenuId === student.id;
        const studentInfo = getC(student);
        const fullName = `${studentInfo.nom} ${studentInfo.prenom}`;

        return (
            <div className="relative">
                <button
                    onClick={(e) => toggleMenu(e, student.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <MoreVertical size={18} />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-2xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                        <div className="p-1 px-2 border-b border-slate-50 bg-slate-50/50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 py-1 block">Actions pour {studentInfo.prenom}</span>
                        </div>

                        <div className="p-1">
                            <button
                                onClick={() => handleCopyEmail(studentInfo.email)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <Copy size={15} className="text-slate-400" />
                                <span>Copier l'email</span>
                            </button>

                            <button
                                onClick={() => handleViewDetails(student.id)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <FileText size={15} className="text-blue-400" />
                                <span>Voir les détails</span>
                            </button>

                            <button
                                onClick={() => {
                                    handleViewDetails(student.id);
                                    setTimeout(() => setIsEditing(true), 100);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <RefreshCw size={15} className="text-indigo-400" />
                                <span>Modifier l'étudiant</span>
                            </button>

                            <button
                                onClick={() => {
                                    onSelectStudent(student, AdmissionTab.ADMINISTRATIF);
                                    navigate('/admission');
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <HistoryIcon size={15} className="text-rose-400" />
                                <span>Voir l'historique</span>
                            </button>

                            <div className="h-px bg-slate-50 my-1 mx-2" />

                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter pl-3 py-1 block">Documents</span>

                            <button
                                onClick={() => handleRegenerateDoc(student.id, 'fiche')}
                                disabled={isRegenerating === `${student.id}-fiche`}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={15} className={`text-slate-400 ${isRegenerating === `${student.id}-fiche` ? 'animate-spin' : ''}`} />
                                <span>Régénérer Fiche Rens.</span>
                            </button>

                            <button
                                onClick={() => handleRegenerateDoc(student.id, 'cerfa')}
                                disabled={isRegenerating === `${student.id}-cerfa`}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={15} className={`text-blue-400 ${isRegenerating === `${student.id}-cerfa` ? 'animate-spin' : ''}`} />
                                <span>Régénérer CERFA</span>
                            </button>

                            <button
                                onClick={() => handleRegenerateDoc(student.id, 'convention')}
                                disabled={isRegenerating === `${student.id}-convention`}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={15} className={`text-emerald-400 ${isRegenerating === `${student.id}-convention` ? 'animate-spin' : ''}`} />
                                <span>Régénérer Convention</span>
                            </button>

                            <button
                                onClick={() => handleRegenerateDoc(student.id, 'atre')}
                                disabled={isRegenerating === `${student.id}-atre`}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={15} className={`text-orange-400 ${isRegenerating === `${student.id}-atre` ? 'animate-spin' : ''}`} />
                                <span>Régénérer ATRE</span>
                            </button>

                            <button
                                onClick={() => handleRegenerateDoc(student.id, 'cr')}
                                disabled={isRegenerating === `${student.id}-cr`}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={15} className={`text-pink-400 ${isRegenerating === `${student.id}-cr` ? 'animate-spin' : ''}`} />
                                <span>Régénérer Compte Rendu</span>
                            </button>

                            <button
                                onClick={() => handleRegenerateDoc(student.id, 'livret')}
                                disabled={isRegenerating === `${student.id}-livret`}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={15} className={`text-purple-400 ${isRegenerating === `${student.id}-livret` ? 'animate-spin' : ''}`} />
                                <span>Régénérer Livret Appr.</span>
                            </button>

                            <button
                                onClick={() => handleRegenerateDoc(student.id, 'certificat')}
                                disabled={isRegenerating === `${student.id}-certificat`}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={15} className={`text-cyan-400 ${isRegenerating === `${student.id}-certificat` ? 'animate-spin' : ''}`} />
                                <span>Régénérer Certificat Scolarité</span>
                            </button>

                            <div className="h-px bg-slate-50 my-1 mx-2" />

                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter pl-3 py-1 block">Signatures</span>

                            {studentInfo.cerfa?.id && (
                                <button
                                    onClick={() => handleGenerateSigningLink(studentInfo.cerfa.id)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                    <FileSignature size={15} className="text-indigo-400" />
                                    <span>Signer CERFA</span>
                                </button>
                            )}

                            {studentInfo.convention?.id && (
                                <button
                                    onClick={() => handleGenerateSigningLink(studentInfo.convention.id)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                    <FileSignature size={15} className="text-emerald-400" />
                                    <span>Signer Convention</span>
                                </button>
                            )}

                            <div className="h-px bg-slate-50 my-1 mx-2" />

                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter pl-3 py-1 block">Administration</span>

                            <button
                                onClick={() => handleDeleteCompany(student.id, student.entreprise_raison_sociale || 'Entreprise')}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                                <Building2 size={15} className="text-rose-400" />
                                <span>Supprimer entreprise</span>
                            </button>

                            <button
                                onClick={() => handleDeleteStudent(student.id, fullName)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                                <UserX size={15} className="text-rose-400" />
                                <span className="font-semibold">Supprimer l'étudiant</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };


    const filteredStudents = students.filter(student => {
        const studentInfo = getC(student);
        const searchLower = searchQuery.toLowerCase();
        const fullName = `${studentInfo.nom} ${studentInfo.prenom}`.toLowerCase();
        const email = (studentInfo.email || '').toLowerCase();
        const formation = (studentInfo.formation || '').toLowerCase();

        // Search match
        const matchesSearch = fullName.includes(searchLower) ||
            email.includes(searchLower) ||
            formation.includes(searchLower);

        if (!matchesSearch) return false;

        // Formation filter match
        if (formationFilter !== 'all' && studentInfo.formation !== formationFilter) {
            return false;
        }

        // Status filter match
        if (filter === 'all') return true;
        if (filter === 'withFiche') return studentInfo.has_fiche_renseignement;
        if (filter === 'withCerfa') return studentInfo.has_cerfa;
        if (filter === 'complete') return student.dossier_complet;

        return true;
    });

    const {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedItems
    } = usePagination(filteredStudents, 10);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filter, formationFilter, setCurrentPage]);

    const stats = {
        total: filteredStudents.length,
        complete: filteredStudents.filter(s => s.dossier_complet).length,
        withCerfa: filteredStudents.filter(s => {
            const si = getC(s);
            return si.has_cerfa;
        }).length,
        withFiche: filteredStudents.filter(s => {
            const si = getC(s);
            return si.has_fiche_renseignement;
        }).length
    };

    const calculateDocCompletion = (c: any) => {
        const docs = [
            c.has_cv,
            c.has_cni,
            c.has_lettre_motivation,
            c.has_vitale,
            c.has_diplome,
            c.has_fiche_renseignement,
            c.has_cerfa,
            c.has_convention,
            c.has_atre,
            c.has_compte_rendu,
            c.has_livret_apprentissage,
            c.has_certificat_scolarite
        ];
        const completed = docs.filter(Boolean).length;
        return Math.round((completed / docs.length) * 100);
    };

    const getCompletionColor = (percent: number) => {
        if (percent === 100) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
        if (percent >= 50) return 'text-amber-500 bg-amber-50 border-amber-100';
        return 'text-rose-500 bg-rose-50 border-rose-100';
    };

    const getCompletionGradient = (percent: number) => {
        if (percent === 100) return 'from-emerald-400 to-emerald-600';
        if (percent >= 50) return 'from-amber-400 to-amber-600';
        return 'from-rose-400 to-rose-600';
    };

    return (
        <div className="animate-fade-in space-y-8 pb-20">
            {/* Company Modal */}
            <CompanyDetailsModal
                isOpen={isCompanyModalOpen}
                onClose={() => setIsCompanyModalOpen(false)}
                company={selectedCompany}
                loading={companyLoading}
                isEditing={isCompanyEditing}
                setIsEditing={setIsCompanyEditing}
                onEdit={handleEnterCompanyEditMode}
                editForm={companyEditForm}
                setEditForm={setCompanyEditForm}
                onSave={handleSaveCompanyEdit}
                isSaving={isSavingCompany}
            />
            {/* Modal for Details */}
            <CandidateDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                candidate={selectedCandidate}
                loading={detailsLoading}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                onEdit={handleEnterEditMode}
                editForm={editForm}
                setEditForm={setEditForm}
                handleSaveEdit={handleSaveEdit}
                handleDelete={handleDelete}
                isSaving={isSaving}
                isDeleting={isDeleting}
                onRelaunch={(candidate) => {
                    onSelectStudent(candidate, AdmissionTab.DOCUMENTS);
                    navigate('/admission');
                }}
            />

            {/* Premium Header */}
            <div className="ntc-header shadow-xl shadow-blue-500/5">
                <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                            <div className="ntc-badge-live shadow-lg shadow-emerald-500/20">
                                <span className="live-dot"></span>
                                GESTION EN DIRECT
                            </div>
                            <div className="hidden md:block w-px h-6 bg-blue-500/20"></div>
                            <span className="text-blue-600 font-black text-xs uppercase tracking-widest">Promotion 2024-2025</span>
                        </div>

                        <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
                            Classe <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">TP NTC</span>
                        </h2>

                        <p className="text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">
                            Supervision complète du groupe Négociateur Technico-Commercial. Suivez l'avancement des dossiers et facilitez les démarches entreprises.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0">
                        <div className="bg-white p-7 rounded-[28px] border border-blue-100 shadow-premium flex flex-col items-center justify-center min-w-[140px] group hover:scale-105 transition-transform duration-300">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
                                <Users size={24} />
                            </div>
                            <div className="text-3xl font-black text-slate-900 mb-1">{stats.total}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Étudiants</div>
                        </div>
                        <div className="bg-white p-7 rounded-[28px] border border-emerald-100 shadow-premium flex flex-col items-center justify-center min-w-[140px] group hover:scale-105 transition-transform duration-300">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-inner">
                                <FileCheck size={24} />
                            </div>
                            <div className="text-3xl font-black text-slate-900 mb-1">{stats.complete}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complets</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-slate-200 mb-8">
                <button
                    onClick={() => setCurrentTab('students')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${currentTab === 'students' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Liste des étudiants
                    {currentTab === 'students' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setCurrentTab('stats')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${currentTab === 'stats' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Statistiques
                    {currentTab === 'stats' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setCurrentTab('history')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${currentTab === 'history' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Historique Global
                    {currentTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
                </button>
            </div>

            {currentTab === 'students' && (
                <>
                    {/* Toolbar */}
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                        <div className="relative w-full lg:w-[500px] group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={22} />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, email ou formation..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-16 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[24px] focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-700 shadow-sm placeholder:text-slate-300"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar max-w-full">
                            <div className="flex items-center gap-2">
                                <select
                                    value={formationFilter}
                                    onChange={(e) => setFormationFilter(e.target.value)}
                                    className="px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer min-w-[150px]"
                                >
                                    <option value="all">Toutes Formations</option>
                                    {availableFormations.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>
                            {[
                                { id: 'all', label: 'Tous' },
                                { id: 'withFiche', label: 'Avec Fiche' },
                                { id: 'complete', label: 'Complets' }
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id as any)}
                                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f.id
                                        ? 'bg-slate-900 text-white shadow-lg'
                                        : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                            <div className="w-px h-6 bg-slate-200 mx-2"></div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    <List size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    <LayoutGrid size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content View */}
                    {viewMode === 'table' ? (
                        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-premium">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-8 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Étudiant</th>
                                            <th className="px-8 py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Formulaire Étudiant</th>
                                            <th className="px-8 py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Formulaire Entreprise</th>
                                            <th className="px-8 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Formation</th>
                                            <th className="px-8 py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Complétion</th>
                                            <th className="px-8 py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Documents</th>
                                            <th className="px-8 py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Documents Perso</th>
                                            <th className="px-8 py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-32 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="relative w-16 h-16">
                                                            <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                                                            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                                                        </div>
                                                        <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Synchronisation...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : paginatedItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-32 text-center">
                                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                        <Search size={32} className="text-slate-200" />
                                                    </div>
                                                    <div className="text-slate-800 font-black text-xl mb-2">Aucun résultat</div>
                                                    <p className="text-slate-400 font-medium">Réessayez avec d'autres termes de recherche.</p>
                                                </td>
                                            </tr>
                                        ) : filteredStudents.map((rawStudent) => {
                                            const student = getC(rawStudent);
                                            return (
                                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-black group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm relative overflow-hidden">
                                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                                <span className="relative z-10 text-xl">{student.numero_inscription || `${student.prenom?.[0]}${student.nom?.[0]}`}</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors tracking-tight">{student.nom} {student.prenom}</div>
                                                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{student.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <button
                                                            onClick={() => handleViewDetails(student.id)}
                                                            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            Fiche Étudiant
                                                        </button>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <button
                                                            onClick={() => isPlaced(rawStudent) ? handleViewCompanyDetails(rawStudent) : handleFillForm(rawStudent)}
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm ${isPlaced(rawStudent)
                                                                ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white'
                                                                : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white'
                                                                }`}
                                                        >
                                                            {isPlaced(rawStudent)
                                                                ? 'Voir Entreprise'
                                                                : 'Lier Entreprise'}
                                                        </button>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 font-black text-[10px] uppercase tracking-widest shadow-sm">
                                                            <Briefcase size={12} />
                                                            {student.formation}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1.5 min-w-[120px]">
                                                            <div className="flex justify-between items-center px-0.5">
                                                                <span className={`text-[10px] font-black uppercase tracking-widest ${calculateDocCompletion(student) === 100 ? 'text-emerald-500' : calculateDocCompletion(student) >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                                    {calculateDocCompletion(student)}%
                                                                </span>
                                                                <div className="flex gap-0.5">
                                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                                        <div key={s} className={`w-1 h-1 rounded-full ${s <= Math.round(calculateDocCompletion(student) / 20) ? (calculateDocCompletion(student) === 100 ? 'bg-emerald-400' : calculateDocCompletion(student) >= 50 ? 'bg-amber-400' : 'bg-rose-400') : 'bg-slate-200'}`} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50 shadow-inner">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getCompletionGradient(calculateDocCompletion(student))}`}
                                                                    style={{ width: `${calculateDocCompletion(student)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Fiche</span>
                                                                {student.has_fiche_renseignement ? (
                                                                    <button
                                                                        onClick={() => handleDownload(rawStudent.fiche_entreprise?.url || rawStudent.fields?.["Fiche entreprise"]?.[0]?.url, rawStudent.fiche_entreprise?.filename || rawStudent.fields?.["Fiche entreprise"]?.[0]?.filename)}
                                                                        className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100/50"
                                                                        title="Télécharger Fiche Renseignement"
                                                                    >
                                                                        <CheckCircle2 size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100">
                                                                        <CheckCircle2 size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">CERFA</span>
                                                                {student.has_cerfa ? (
                                                                    <button
                                                                        onClick={() => handleDownload(rawStudent.cerfa?.url || rawStudent.fields?.["cerfa"]?.[0]?.url, rawStudent.cerfa?.filename || rawStudent.fields?.["cerfa"]?.[0]?.filename)}
                                                                        className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100/50"
                                                                        title="Télécharger CERFA"
                                                                    >
                                                                        <ShieldCheck size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100">
                                                                        <ShieldCheck size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">ATRE</span>
                                                                {student.has_atre ? (
                                                                    <button
                                                                        onClick={() => handleDownload(rawStudent.atre_url || rawStudent.fields?.["Atre"]?.[0]?.url, rawStudent.atre_name || rawStudent.fields?.["Atre"]?.[0]?.filename)}
                                                                        className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm border border-orange-100/50"
                                                                        title="Télécharger ATRE"
                                                                    >
                                                                        <FileText size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100">
                                                                        <FileText size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">CR</span>
                                                                {student.has_compte_rendu ? (
                                                                    <button
                                                                        onClick={() => handleDownload(rawStudent.compte_rendu_url || rawStudent.fields?.["compte rendu de visite"]?.[0]?.url, rawStudent.compte_rendu_name || rawStudent.fields?.["compte rendu de visite"]?.[0]?.filename)}
                                                                        className="w-9 h-9 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all shadow-sm border border-pink-100/50"
                                                                        title="Télécharger Compte Rendu"
                                                                    >
                                                                        <ClipboardList size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100">
                                                                        <ClipboardList size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Conv.</span>
                                                                {student.has_convention ? (
                                                                    <button
                                                                        onClick={() => handleDownload(student.convention_url || (rawStudent.fields || rawStudent)?.["Convention Apprentissage"]?.[0]?.url, student.convention_name || (rawStudent.fields || rawStudent)?.["Convention Apprentissage"]?.[0]?.filename)}
                                                                        className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100/50"
                                                                        title="Télécharger Convention"
                                                                    >
                                                                        <FileSignature size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100">
                                                                        <FileSignature size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Livret</span>
                                                                {student.has_livret_apprentissage ? (
                                                                    <button
                                                                        onClick={() => handleDownload(student.livret_apprentissage_url || (rawStudent.fields || rawStudent)?.["Livret Apprentissage"]?.[0]?.url, student.livret_apprentissage_name || (rawStudent.fields || rawStudent)?.["Livret Apprentissage"]?.[0]?.filename)}
                                                                        className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all shadow-sm border border-purple-100/50"
                                                                        title="Télécharger Livret d'Apprentissage"
                                                                    >
                                                                        <BookOpen size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100">
                                                                        <BookOpen size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Cert.</span>
                                                                {student.has_certificat_scolarite ? (
                                                                    <button
                                                                        onClick={() => handleDownload(student.certificat_scolarite_url, student.certificat_scolarite_name)}
                                                                        className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-all shadow-sm border border-cyan-100/50"
                                                                        title="Télécharger Certificat de Scolarité"
                                                                    >
                                                                        <FileCheck size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100">
                                                                        <FileCheck size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">CIN</span>
                                                                {student.has_cni ? (
                                                                    <button
                                                                        onClick={() => handleDownload(student.cni_url, student.cni_name)}
                                                                        className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100/50"
                                                                        title="Télécharger CIN"
                                                                    >
                                                                        <FileText size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100">
                                                                        <FileText size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">CV</span>
                                                                {student.has_cv ? (
                                                                    <button
                                                                        onClick={() => handleDownload(student.cv_url, student.cv_name)}
                                                                        className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-200"
                                                                        title="Télécharger CV"
                                                                    >
                                                                        <FileText size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100">
                                                                        <FileText size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Diplôme</span>
                                                                {student.has_diplome ? (
                                                                    <button
                                                                        onClick={() => handleDownload(student.diplome_url, student.diplome_name)}
                                                                        className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all shadow-sm border border-amber-100/50"
                                                                        title="Télécharger Diplôme"
                                                                    >
                                                                        <FileText size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100">
                                                                        <FileText size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Lettre</span>
                                                                {student.has_lettre_motivation ? (
                                                                    <button
                                                                        onClick={() => handleDownload(student.lettre_motivation_url, student.lettre_motivation_name)}
                                                                        className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all shadow-sm border border-teal-100/50"
                                                                        title="Télécharger Lettre de motivation"
                                                                    >
                                                                        <FileText size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100">
                                                                        <FileText size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <ActionsMenu student={rawStudent} />
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-8 border-t border-slate-100 bg-slate-50/30">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {loading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-100 animate-pulse h-64"></div>
                                    ))
                                ) : paginatedItems.map((rawStudent) => {
                                    const student = getC(rawStudent);
                                    return (
                                        <div key={rawStudent.record_id || rawStudent.id} className="bg-white border border-slate-200 rounded-[32px] p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                            <div className="flex justify-between items-start mb-8 relative z-10">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-black text-2xl group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner">
                                                    {student.numero_inscription || `${student.prenom?.[0]}${student.nom?.[0]}`}
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${rawStudent.dossier_complet ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                        {rawStudent.dossier_complet ? 'Dossier Complet' : 'Dossier Incomplet'}
                                                    </div>
                                                    <ActionsMenu student={rawStudent} />
                                                </div>
                                            </div>

                                            <div className="mb-8 relative z-10">
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{student.nom} {student.prenom}</h3>
                                                <p className="text-sm font-bold text-slate-400 truncate mt-1">{student.email}</p>
                                            </div>

                                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 font-black text-[9px] uppercase tracking-widest">
                                                    <Briefcase size={12} />
                                                    {student.formation}
                                                </div>
                                                {student.alternance === 'Oui' && student.entreprise && student.entreprise !== 'En recherche' && (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest">
                                                        <Building size={12} />
                                                        {student.entreprise}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-8 relative z-10">
                                                <div className="flex justify-between items-center mb-2 px-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dossier</span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${calculateDocCompletion(student) === 100 ? 'text-emerald-500' : calculateDocCompletion(student) >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                        {calculateDocCompletion(student)}%
                                                    </span>
                                                </div>
                                                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100 shadow-inner">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getCompletionGradient(calculateDocCompletion(student))}`}
                                                        style={{ width: `${calculateDocCompletion(student)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-100 relative z-10">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full text-[10px] font-black"
                                                    onClick={() => handleViewDetails(rawStudent.record_id || rawStudent.id)}
                                                >
                                                    Fiche Étudiant
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className={`w-full text-[10px] font-black ${!isPlaced(rawStudent) ? '!bg-amber-600 !border-amber-600' : ''}`}
                                                    onClick={() => isPlaced(rawStudent) ? handleViewCompanyDetails(rawStudent) : handleFillForm(rawStudent)}
                                                >
                                                    {isPlaced(rawStudent) ? 'Voir Entreprise' : 'Lier Entreprise'}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-12">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}

            {currentTab === 'stats' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader2 className="animate-spin text-blue-600" size={48} />
                            <p className="text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">Analyse des données en cours...</p>
                        </div>
                    ) : statsData ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Sex Distribution */}
                            <div className="bg-white border border-slate-200 rounded-[32px] p-10 shadow-premium">
                                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                    <Users className="text-blue-600" /> Répartition par Sexe
                                </h3>

                                <div className="space-y-8">
                                    {[
                                        { label: 'Masculin', count: statsData.sexDist.male, color: 'bg-blue-500', icon: 'M' },
                                        { label: 'Féminin', count: statsData.sexDist.female, color: 'bg-rose-500', icon: 'F' },
                                        { label: 'Autre / Non renseigné', count: statsData.sexDist.other, color: 'bg-slate-300', icon: '?' }
                                    ].map((item) => {
                                        const percent = statsData.total > 0 ? (item.count / statsData.total) * 100 : 0;
                                        return (
                                            <div key={item.label} className="group">
                                                <div className="flex justify-between items-end mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg ${item.color} text-white flex items-center justify-center font-black text-xs shadow-lg shadow-${item.color.split('-')[1]}-500/20`}>{item.icon}</div>
                                                        <span className="font-bold text-slate-700">{item.label}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-lg font-black text-slate-900">{item.count}</span>
                                                        <span className="text-xs font-bold text-slate-400 ml-2">({Math.round(percent)}%)</span>
                                                    </div>
                                                </div>
                                                <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${item.color}`}
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-around text-center">
                                    <div>
                                        <div className="text-2xl font-black text-slate-900">{Math.round((statsData.sexDist.female / statsData.total) * 100)}%</div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Taux de féminisation</div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200"></div>
                                    <div>
                                        <div className="text-2xl font-black text-slate-900">{statsData.total}</div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total échantillon</div>
                                    </div>
                                </div>
                            </div>

                            {/* Age Distribution */}
                            <div className="bg-white border border-slate-200 rounded-[32px] p-10 shadow-premium">
                                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                    <Star className="text-indigo-600" /> Pyramide des âges
                                </h3>

                                <div className="flex items-end justify-between h-64 gap-4 px-4">
                                    {[
                                        { label: '-18 ans', count: statsData.ageDist.under18, color: 'from-blue-400 to-blue-500' },
                                        { label: '18-20 ans', count: statsData.ageDist.age18_20, color: 'from-indigo-400 to-indigo-500' },
                                        { label: '21-25 ans', count: statsData.ageDist.age21_25, color: 'from-purple-400 to-purple-500' },
                                        { label: '26+ ans', count: statsData.ageDist.over25, color: 'from-slate-700 to-slate-800' }
                                    ].map((item) => {
                                        const maxAge = Math.max(...(Object.values(statsData.ageDist) as number[]));
                                        const height = maxAge > 0 ? (item.count / maxAge) * 100 : 0;
                                        return (
                                            <div key={item.label} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                                                <div className="relative w-full flex justify-center group-hover:-translate-y-1 transition-transform duration-300" style={{ height: `${height}%` }}>
                                                    <div className={`w-full max-w-[60px] rounded-t-2xl bg-gradient-to-b ${item.color} shadow-lg relative min-h-[4px]`}>
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                                                            {item.count} élève{item.count > 1 ? 's' : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{item.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-12 grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                                        <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Moyenne d'âge</div>
                                        <div className="text-2xl font-black text-indigo-600">{statsData.averageAge} ans</div>
                                    </div>
                                    <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                        <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Majorité</div>
                                        <div className="text-2xl font-black text-blue-600">{statsData.majorityGroup}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-32 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                            <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold">Impossible de générer les statistiques. Données insuffisantes.</p>
                        </div>
                    )}
                </div>
            )}

            {currentTab === 'history' && (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[500px]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                            <HistoryIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800">Historique des actions</h2>
                            <p className="text-slate-400 font-medium text-sm">Toutes les activités récentes de la classe</p>
                        </div>
                    </div>
                    <HistoryTimeline history={globalHistory} loading={loadingHistory} />
                </div>
            )}
        </div>
    );
};

export default ClassNTCView;
