import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
    Briefcase,
    ShieldCheck,
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
    BookOpen,
    CreditCard,
    FileUser,
    GraduationCap,
    HeartPulse,
    Award
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
import { formatFormation, decimalToTime } from '../utils/formatters';

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
    const [tabAnimKey, setTabAnimKey] = useState(0);
    const [tabSlideDir, setTabSlideDir] = useState<'right' | 'left'>('right');
    const tabOrder = { students: 0, stats: 1, history: 2 };
    const tableScrollRef = useRef<HTMLDivElement>(null);
    const scrollAnimRef = useRef<number | null>(null);

    const handleTabChange = (tab: 'students' | 'stats' | 'history') => {
        if (tab === currentTab) return;
        setTabSlideDir(tabOrder[tab] > tabOrder[currentTab] ? 'right' : 'left');
        setTabAnimKey((k: number) => k + 1);
        setCurrentTab(tab);
    };

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
                duree_hebdomadaire: decimalToTime(f["Durée hebdomadaire"] || "35"),
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
        await updateCompany(id, data, selectedCompany);
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
        const formationDist: Record<string, number> = {};
        let totalAge = 0;
        let studentsWithAge = 0;
        let placed = 0;
        let withFiche = 0;
        let withCerfa = 0;
        let withCV = 0;

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

            // Formation
            const formation = info.formation || 'Non renseigné';
            formationDist[formation] = (formationDist[formation] || 0) + 1;

            // Placement & docs
            if (isPlaced(s)) placed++;
            if (info.has_fiche_renseignement) withFiche++;
            if (info.has_cerfa) withCerfa++;
            if (info.has_cv) withCV++;
        });

        const ageGroups = [
            { label: '-18 ans', count: ageDist.under18 },
            { label: '18-20 ans', count: ageDist.age18_20 },
            { label: '21-25 ans', count: ageDist.age21_25 },
            { label: '26+ ans', count: ageDist.over25 }
        ];
        const majorityGroup = ageGroups.reduce((prev, current) => (prev.count > current.count) ? prev : current).label;

        const formationList = Object.entries(formationDist)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        return {
            sexDist,
            ageDist,
            total: students.length,
            averageAge: studentsWithAge > 0 ? (totalAge / studentsWithAge).toFixed(1) : "N/A",
            majorityGroup: studentsWithAge > 0 ? majorityGroup : "N/A",
            placed,
            withFiche,
            withCerfa,
            withCV,
            formationList
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

    const docFileName = (student: any, docType: string) => {
        const nom = (student.nom || '').toUpperCase().replace(/\s+/g, '-') || 'ETUDIANT';
        const prenom = (student.prenom || '').replace(/\s+/g, '-') || 'Inconnu';
        return `${nom}_${prenom}_${docType}`;
    };

    const handleDownload = async (url: string, baseName: string) => {
        if (!url) return;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('fetch failed');
            const blob = await response.blob();
            const extMap: Record<string, string> = {
                'application/pdf': 'pdf',
                'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
                'image/gif': 'gif', 'image/webp': 'webp',
                'application/msword': 'doc',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            };
            const ct = (response.headers.get('content-type') || '').split(';')[0].trim();
            const ext = extMap[ct] || 'pdf';
            const filename = `${baseName}.${ext}`;
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);
            showToast('Téléchargement démarré', 'success');
        } catch {
            window.open(url, '_blank');
            showToast('Fichier ouvert dans un nouvel onglet', 'success');
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
        const buttonRef = useRef<HTMLButtonElement>(null);
        const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, placement: 'bottom' as 'top' | 'bottom' });

        useEffect(() => {
            if (isOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const menuHeight = Math.min(viewportHeight * 0.7, 450); // Estimated max height based on items
                
                // If there's not enough space below (leaving some margin), open upwards
                const shouldOpenUp = rect.bottom + menuHeight > viewportHeight - 20;
                
                setMenuPosition({
                    top: shouldOpenUp ? rect.top - 8 : rect.bottom + 4,
                    left: rect.right - 224,
                    placement: shouldOpenUp ? 'top' : 'bottom'
                });
            }
        }, [isOpen]);

        // Re-calculate position on scroll to keep it pinned to the button
        useEffect(() => {
            if (!isOpen) return;

            const updatePosition = () => {
                if (buttonRef.current) {
                    const rect = buttonRef.current.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const menuHeight = Math.min(viewportHeight * 0.7, 450);
                    const shouldOpenUp = rect.bottom + menuHeight > viewportHeight - 20;

                    setMenuPosition({
                        top: shouldOpenUp ? rect.top - 8 : rect.bottom + 4,
                        left: rect.right - 224,
                        placement: shouldOpenUp ? 'top' : 'bottom'
                    });
                }
            };

            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }, [isOpen]);

        const menuContent = (
            <div 
                style={{ 
                    position: 'fixed',
                    top: `${menuPosition.top}px`,
                    left: `${menuPosition.left}px`,
                    transform: menuPosition.placement === 'top' ? 'translateY(-100%)' : 'none',
                    zIndex: 9999,
                    width: '14rem' // w-56
                }}
                className="bg-white shadow-xl border border-[#e2e8f0] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-3 py-2 border-b border-[#e2e8f0] bg-[#f4f6fb]">
                    <span className="text-[10px] font-bold text-[#8898aa] uppercase tracking-widest block">Actions pour {studentInfo.prenom}</span>
                </div>

                <div className="py-1 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <button
                        onClick={() => handleCopyEmail(studentInfo.email)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#475569] hover:bg-[#f4f6fb] transition-colors"
                    >
                        <Copy size={15} className="text-slate-400" />
                        <span>Copier l'email</span>
                    </button>

                    <button
                        onClick={() => handleViewDetails(student.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#475569] hover:bg-[#f4f6fb] transition-colors"
                    >
                        <FileText size={15} className="text-blue-400" />
                        <span>Voir les détails</span>
                    </button>

                    <button
                        onClick={() => {
                            handleViewDetails(student.id);
                            setTimeout(() => setIsEditing(true), 100);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#475569] hover:bg-[#f4f6fb] transition-colors"
                    >
                        <RefreshCw size={15} className="text-indigo-400" />
                        <span>Modifier l'étudiant</span>
                    </button>

                    <button
                        onClick={() => {
                            onSelectStudent(student, AdmissionTab.ADMINISTRATIF);
                            navigate('/admission');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#475569] hover:bg-[#f4f6fb] transition-colors"
                    >
                        <HistoryIcon size={15} className="text-rose-400" />
                        <span>Voir l'historique</span>
                    </button>

                    <div className="h-px bg-slate-50 my-1 mx-2" />

                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter pl-3 py-1 block">Documents</span>

                    <button
                        onClick={() => handleRegenerateDoc(student.id, 'fiche')}
                        disabled={isRegenerating === `${student.id}-fiche`}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#475569] hover:bg-[#f4f6fb] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={`text-slate-400 ${isRegenerating === `${student.id}-fiche` ? 'animate-spin' : ''}`} />
                        <span>Régénérer Fiche Rens.</span>
                    </button>

                    <button
                        onClick={() => handleRegenerateDoc(student.id, 'cerfa')}
                        disabled={isRegenerating === `${student.id}-cerfa`}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#475569] hover:bg-[#f4f6fb] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={`text-blue-400 ${isRegenerating === `${student.id}-cerfa` ? 'animate-spin' : ''}`} />
                        <span>Régénérer CERFA</span>
                    </button>

                    <button
                        onClick={() => handleRegenerateDoc(student.id, 'convention')}
                        disabled={isRegenerating === `${student.id}-convention`}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#475569] hover:bg-[#f4f6fb] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={`text-emerald-400 ${isRegenerating === `${student.id}-convention` ? 'animate-spin' : ''}`} />
                        <span>Régénérer Convention</span>
                    </button>

                    <button
                        onClick={() => handleRegenerateDoc(student.id, 'atre')}
                        disabled={isRegenerating === `${student.id}-atre`}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#475569] hover:bg-[#f4f6fb] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={`text-orange-400 ${isRegenerating === `${student.id}-atre` ? 'animate-spin' : ''}`} />
                        <span>Régénérer ATRE</span>
                    </button>

                    <button
                        onClick={() => handleRegenerateDoc(student.id, 'cr')}
                        disabled={isRegenerating === `${student.id}-cr`}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#475569] hover:bg-[#f4f6fb] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={`text-pink-400 ${isRegenerating === `${student.id}-cr` ? 'animate-spin' : ''}`} />
                        <span>Régénérer Compte Rendu</span>
                    </button>

                    <button
                        onClick={() => handleRegenerateDoc(student.id, 'livret')}
                        disabled={isRegenerating === `${student.id}-livret`}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#475569] hover:bg-[#f4f6fb] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={`text-purple-400 ${isRegenerating === `${student.id}-livret` ? 'animate-spin' : ''}`} />
                        <span>Régénérer Livret Appr.</span>
                    </button>

                    <button
                        onClick={() => handleRegenerateDoc(student.id, 'certificat')}
                        disabled={isRegenerating === `${student.id}-certificat`}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#475569] hover:bg-[#f4f6fb] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={`text-cyan-400 ${isRegenerating === `${student.id}-certificat` ? 'animate-spin' : ''}`} />
                        <span>Régénérer Certificat Scolarité</span>
                    </button>

                    <div className="h-px bg-slate-50 my-1 mx-2" />

                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter pl-3 py-1 block">Signatures</span>

                    {studentInfo.cerfa?.id && (
                        <button
                            onClick={() => handleGenerateSigningLink(studentInfo.cerfa.id)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#7c3aed] hover:bg-[#ede9fe] transition-colors"
                        >
                            <FileSignature size={15} className="text-indigo-400" />
                            <span>Signer CERFA</span>
                        </button>
                    )}

                    {studentInfo.convention?.id && (
                        <button
                            onClick={() => handleGenerateSigningLink(studentInfo.convention.id)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#065f46] hover:bg-[#d1fae5] transition-colors"
                        >
                            <FileSignature size={15} className="text-emerald-400" />
                            <span>Signer Convention</span>
                        </button>
                    )}

                    <div className="h-px bg-slate-50 my-1 mx-2" />

                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter pl-3 py-1 block">Administration</span>

                    <button
                        onClick={() => handleDeleteCompany(student.id, student.entreprise_raison_sociale || 'Entreprise')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#b91c1c] hover:bg-[#fee2e2] transition-colors"
                    >
                        <Building2 size={15} className="text-rose-400" />
                        <span>Supprimer entreprise</span>
                    </button>

                    <button
                        onClick={() => handleDeleteStudent(student.id, fullName)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#b91c1c] hover:bg-[#fee2e2] transition-colors"
                    >
                        <UserX size={15} className="text-rose-400" />
                        <span className="font-semibold">Supprimer l'étudiant</span>
                    </button>
                </div>
            </div>
        );

        return (
            <div className="relative">
                <button
                    ref={buttonRef}
                    onClick={(e) => toggleMenu(e, student.id)}
                    className={`p-1.5 rounded-[4px] transition-colors ${isOpen ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                >
                    <MoreVertical size={18} />
                </button>

                {isOpen && createPortal(menuContent, document.body)}
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
    }).sort((a, b) => {
        const numA = parseInt(getC(a).numero_inscription || '0', 10);
        const numB = parseInt(getC(b).numero_inscription || '0', 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return (getC(a).numero_inscription || '').localeCompare(getC(b).numero_inscription || '');
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

    const CircularProgress = ({ percent }: { percent: number }) => {
        const radius = 18;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percent / 100) * circumference;
        const color = percent === 100 ? '#10b981' : percent >= 50 ? '#f59e0b' : '#f43f5e';

        return (
            <div className="relative inline-flex items-center justify-center p-1">
                <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        stroke="#f1f5f9"
                        strokeWidth="4"
                        fill="transparent"
                        className="transition-all duration-500"
                    />
                    <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        stroke={color}
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <span className="absolute text-[10px] font-black" style={{ color }}>
                    {percent}%
                </span>
            </div>
        );
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

            {/* Header */}
            <div className="ntc-header rounded-[8px]">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                            <div className="ntc-badge-live">
                                <span className="live-dot"></span>
                                GESTION EN DIRECT
                            </div>
                            <div className="hidden md:block w-px h-6 bg-blue-500/20"></div>
                            <span className="text-[#3b7cf4] font-black text-xs uppercase tracking-widest">Promotion {new Date().getFullYear()}</span>
                        </div>

                        <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
                            Classe <span className="text-[#3b7cf4]">TP NTC</span>
                        </h2>

                        <p className="text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">
                            Supervision complète du groupe Négociateur Technico-Commercial. Suivez l'avancement des dossiers et facilitez les démarches entreprises.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0">
                        <div className="bg-white rounded-[4px] p-7 border border-[#ddd6fe] flex flex-col items-center justify-center min-w-[140px]">
                            <div className="w-12 h-12 rounded-[4px] bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center mb-4">
                                <Users size={24} />
                            </div>
                            <div className="text-3xl font-black text-slate-900 mb-1">{stats.total}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Étudiants</div>
                        </div>
                        <div className="bg-white rounded-[4px] p-7 border border-[#ddd6fe] flex flex-col items-center justify-center min-w-[140px]">
                            <div className="w-12 h-12 rounded-[4px] bg-[#d1fae5] text-[#10c98f] flex items-center justify-center mb-4">
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
                    onClick={() => handleTabChange('students')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${currentTab === 'students' ? 'text-[#3b7cf4]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Liste des étudiants
                    {currentTab === 'students' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3b7cf4]"></div>}
                </button>
                <button
                    onClick={() => handleTabChange('stats')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${currentTab === 'stats' ? 'text-[#3b7cf4]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Statistiques
                    {currentTab === 'stats' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3b7cf4]"></div>}
                </button>
                <button
                    onClick={() => handleTabChange('history')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${currentTab === 'history' ? 'text-[#3b7cf4]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Historique Global
                    {currentTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3b7cf4]"></div>}
                </button>
            </div>

            <div
                key={tabAnimKey}
                className={tabSlideDir === 'right' ? 'tab-slide-right' : 'tab-slide-left'}
            >
            {currentTab === 'students' && (
                <>
                    {/* Toolbar */}
                    <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                        <div className="relative w-full lg:w-[260px] flex-shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input
                                type="text"
                                placeholder="Nom, email ou formation..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-full pl-9 pr-3 py-2.5 bg-white border border-[#e2e8f0] rounded-[4px] focus:border-[#3b7cf4] outline-none transition-all font-medium text-slate-700 text-sm placeholder:text-slate-400"
                            />
                        </div>

                        <div className="flex items-stretch gap-0 bg-white border border-[#e2e8f0] overflow-x-auto no-scrollbar flex-1">
                            <select
                                value={formationFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormationFilter(e.target.value)}
                                className="px-3 py-2.5 text-xs font-black uppercase tracking-widest bg-[#f4f6fb] border-none border-r border-[#e2e8f0] outline-none cursor-pointer min-w-[150px] text-[#1e293b]"
                            >
                                <option value="all">Toutes Formations</option>
                                {availableFormations.map(f => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                            {[
                                { id: 'all', label: 'Tous' },
                                { id: 'withFiche', label: 'Avec Fiche' },
                                { id: 'complete', label: 'Complets' }
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id as any)}
                                    className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-r border-[#e2e8f0] ${filter === f.id
                                        ? 'bg-[#1a1f2e] text-white'
                                        : 'text-slate-500 hover:bg-[#f4f6fb]'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                            <div className="flex items-center ml-auto border-l border-[#e2e8f0]">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-2.5 transition-all ${viewMode === 'table' ? 'bg-[#e8f0fe] text-[#3b7cf4]' : 'text-slate-400 hover:bg-[#f4f6fb]'}`}
                                >
                                    <List size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-2.5 transition-all border-l border-[#e2e8f0] ${viewMode === 'grid' ? 'bg-[#e8f0fe] text-[#3b7cf4]' : 'text-slate-400 hover:bg-[#f4f6fb]'}`}
                                >
                                    <LayoutGrid size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content View */}
                    {viewMode === 'table' ? (
                        <div className="bg-white border border-[#e2e8f0] overflow-hidden relative">
                            {/* Left scroll zone */}
                            <div
                                className="absolute left-0 top-0 bottom-0 w-12 z-10 flex items-center justify-start pl-1 opacity-0 hover:opacity-100 transition-opacity cursor-w-resize"
                                style={{ background: 'linear-gradient(to right, rgba(59,124,244,0.15), transparent)' }}
                                onMouseEnter={() => startScroll('left')}
                                onMouseLeave={stopScroll}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b7cf4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                            </div>
                            {/* Right scroll zone */}
                            <div
                                className="absolute right-0 top-0 bottom-0 w-12 z-10 flex items-center justify-end pr-1 opacity-0 hover:opacity-100 transition-opacity cursor-e-resize"
                                style={{ background: 'linear-gradient(to left, rgba(59,124,244,0.15), transparent)' }}
                                onMouseEnter={() => startScroll('right')}
                                onMouseLeave={stopScroll}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b7cf4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                            </div>
                            <div className="overflow-x-auto" ref={tableScrollRef}>
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#f4f6fb] border-b border-[#e2e8f0]">
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-[#8898aa] uppercase tracking-[0.08em]">Étudiant</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-bold text-[#8898aa] uppercase tracking-[0.08em]">Formulaire Étudiant</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-bold text-[#8898aa] uppercase tracking-[0.08em]">Formulaire Entreprise</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-[#8898aa] uppercase tracking-[0.08em]">Formation</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-bold text-[#8898aa] uppercase tracking-[0.08em]">Complétion</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-bold text-[#8898aa] uppercase tracking-[0.08em]">Docs Admin</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-bold text-[#8898aa] uppercase tracking-[0.08em]">Docs Perso</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-bold text-[#8898aa] uppercase tracking-[0.08em]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <>
                                                {Array(8).fill(0).map((_, i) => (
                                                    <tr key={i} className="border-b border-[#e2e8f0] last:border-b-0">
                                                        {/* Étudiant */}
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4 animate-pulse">
                                                                <div className="w-10 h-10 bg-[#e2e8f0] flex-shrink-0"></div>
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="h-3 bg-[#e2e8f0] rounded-[4px] w-32"></div>
                                                                    <div className="h-2.5 bg-[#eef2f7] rounded-[4px] w-44"></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {/* Formulaire étudiant */}
                                                        <td className="px-6 py-4">
                                                            <div className="animate-pulse">
                                                                <div className="h-6 bg-[#e2e8f0] rounded-[4px] w-20"></div>
                                                            </div>
                                                        </td>
                                                        {/* Formulaire entreprise */}
                                                        <td className="px-6 py-4">
                                                            <div className="animate-pulse">
                                                                <div className="h-6 bg-[#e2e8f0] rounded-[4px] w-20"></div>
                                                            </div>
                                                        </td>
                                                        {/* Formation + complétion */}
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-2 animate-pulse">
                                                                <div className="h-5 bg-[#e2e8f0] rounded-[4px] w-28"></div>
                                                                <div className="h-1.5 bg-[#eef2f7] rounded-[4px] w-full">
                                                                    <div className="h-1.5 bg-[#e2e8f0] rounded-[4px]" style={{ width: `${30 + (i * 8) % 50}%` }}></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {/* Documents + actions */}
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2 animate-pulse">
                                                                <div className="w-8 h-8 rounded-[4px] bg-[#e2e8f0]"></div>
                                                                <div className="w-8 h-8 rounded-[4px] bg-[#eef2f7]"></div>
                                                                <div className="w-8 h-8 rounded-[4px] bg-[#e2e8f0]"></div>
                                                                <div className="w-6 h-6 bg-[#eef2f7] rounded-full ml-2"></div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </>
                                        ) : paginatedItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-8 py-32 text-center">
                                                    <div className="w-20 h-20 bg-[#f4f6fb] border border-[#e2e8f0] flex items-center justify-center mx-auto mb-6">
                                                        <Search size={32} className="text-slate-300" />
                                                    </div>
                                                    <div className="text-slate-800 font-black text-xl mb-2">Aucun résultat</div>
                                                    <p className="text-slate-400 font-medium">Réessayez avec d'autres termes de recherche.</p>
                                                </td>
                                            </tr>
                                        ) : paginatedItems.map((rawStudent) => {
                                            const student = getC(rawStudent);
                                            return (
                                                <tr key={student.id} className="hover:bg-[#f4f6fb] transition-colors border-b border-[#e2e8f0] last:border-b-0">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-[4px] bg-[#f4f6fb] border border-[#e2e8f0] flex items-center justify-center text-slate-500 font-black text-sm flex-shrink-0">
                                                                <span className="text-sm">{student.numero_inscription || `${student.prenom?.[0]}${student.nom?.[0]}`}</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-[#1e293b] text-sm">{student.nom?.toUpperCase()} {student.prenom}</div>
                                                                <div className="text-xs text-[#8898aa] mt-0.5">{student.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">

                                                        <button
                                                            onClick={() => handleViewDetails(student.id)}
                                                            className="px-3 py-1.5 rounded-[4px] bg-[#fee2e2] text-[#b91c1c] text-[10px] font-bold uppercase tracking-widest border border-[#fca5a5] hover:bg-[#b91c1c] hover:text-white transition-all"
                                                        >
                                                            Fiche Étudiant
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => isPlaced(rawStudent) ? handleViewCompanyDetails(rawStudent) : handleFillForm(rawStudent)}
                                                            className={`px-3 py-1.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest border transition-all ${isPlaced(rawStudent)
                                                                ? 'bg-[#d1fae5] text-[#065f46] border-[#6ee7b7] hover:bg-[#065f46] hover:text-white'
                                                                : 'bg-[#ffedd5] text-[#c2410c] border-[#fdba74] hover:bg-[#c2410c] hover:text-white'
                                                                }`}
                                                        >
                                                            {isPlaced(rawStudent) ? 'Voir Entreprise' : 'Lier Entreprise'}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-[#f4f6fb] text-[#475569] border border-[#e2e8f0] font-bold text-xs whitespace-nowrap">
                                                            <Briefcase size={11} />
                                                            {formatFormation(student.formation)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1.5 min-w-[120px]">
                                                            <div className="flex justify-between items-center">
                                                                <span className={`text-[10px] font-bold ${calculateDocCompletion(student) === 100 ? 'text-[#10c98f]' : calculateDocCompletion(student) >= 50 ? 'text-[#f97316]' : 'text-[#e84242]'}`}>
                                                                    {calculateDocCompletion(student)}%
                                                                </span>
                                                                <div className="flex gap-0.5">
                                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                                        <div key={s} className={`w-1 h-1 rounded-full ${s <= Math.round(calculateDocCompletion(student) / 20) ? (calculateDocCompletion(student) === 100 ? 'bg-[#10c98f]' : calculateDocCompletion(student) >= 50 ? 'bg-[#f97316]' : 'bg-[#e84242]') : 'bg-slate-200'}`} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="h-1.5 bg-[#e2e8f0] overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r ${getCompletionGradient(calculateDocCompletion(student))}`}
                                                                    style={{ width: `${calculateDocCompletion(student)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[9px] font-bold text-[#8898aa] uppercase tracking-tighter">Fiche</span>
                                                                {student.has_fiche_renseignement ? (
                                                                    <button
                                                                        onClick={() => { const u = rawStudent.fiche_entreprise?.url || rawStudent.fields?.["Fiche entreprise"]?.[0]?.url; handleDownload(u, docFileName(student, 'FICHE')); }}
                                                                        className="w-8 h-8 rounded-[4px] bg-[#d1fae5] text-[#10c98f] flex items-center justify-center hover:bg-[#10c98f] hover:text-white transition-all border border-[#6ee7b7]"
                                                                        title="Télécharger Fiche Renseignement"
                                                                    >
                                                                        <CheckCircle2 size={14} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-[4px] bg-[#f4f6fb] text-slate-300 flex items-center justify-center border border-[#e2e8f0]">
                                                                        <CheckCircle2 size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[9px] font-bold text-[#8898aa] uppercase tracking-tighter">CERFA</span>
                                                                {student.has_cerfa ? (
                                                                    <button
                                                                        onClick={() => { const u = rawStudent.cerfa?.url || rawStudent.fields?.["cerfa"]?.[0]?.url; handleDownload(u, docFileName(student, 'CERFA')); }}
                                                                        className="w-8 h-8 rounded-[4px] bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center hover:bg-[#7c3aed] hover:text-white transition-all border border-[#c4b5fd]"
                                                                        title="Télécharger CERFA"
                                                                    >
                                                                        <ShieldCheck size={14} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-[4px] bg-[#f4f6fb] text-slate-300 flex items-center justify-center border border-[#e2e8f0]">
                                                                        <ShieldCheck size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[9px] font-bold text-[#8898aa] uppercase tracking-tighter">ATRE</span>
                                                                {student.has_atre ? (
                                                                    <button
                                                                        onClick={() => { const u = rawStudent.atre_url || rawStudent.fields?.["Atre"]?.[0]?.url; handleDownload(u, docFileName(student, 'ATRE')); }}
                                                                        className="w-8 h-8 rounded-[4px] bg-[#ffedd5] text-[#c2410c] flex items-center justify-center hover:bg-[#c2410c] hover:text-white transition-all border border-[#fdba74]"
                                                                        title="Télécharger ATRE"
                                                                    >
                                                                        <FileText size={14} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-[4px] bg-[#f4f6fb] text-slate-300 flex items-center justify-center border border-[#e2e8f0]">
                                                                        <FileText size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[9px] font-bold text-[#8898aa] uppercase tracking-tighter">CR</span>
                                                                {student.has_compte_rendu ? (
                                                                    <button
                                                                        onClick={() => { const u = rawStudent.compte_rendu_url || rawStudent.fields?.["compte rendu de visite"]?.[0]?.url; handleDownload(u, docFileName(student, 'COMPTE-RENDU')); }}
                                                                        className="w-8 h-8 rounded-[4px] bg-[#fce7f3] text-[#be185d] flex items-center justify-center hover:bg-[#be185d] hover:text-white transition-all border border-[#f9a8d4]"
                                                                        title="Télécharger Compte Rendu"
                                                                    >
                                                                        <ClipboardList size={14} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-[4px] bg-[#f4f6fb] text-slate-300 flex items-center justify-center border border-[#e2e8f0]">
                                                                        <ClipboardList size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[9px] font-bold text-[#8898aa] uppercase tracking-tighter">Conv.</span>
                                                                {student.has_convention ? (
                                                                    <button
                                                                        onClick={() => { const u = student.convention_url || (rawStudent.fields || rawStudent)?.["Convention Apprentissage"]?.[0]?.url; handleDownload(u, docFileName(student, 'CONVENTION')); }}
                                                                        className="w-8 h-8 rounded-[4px] bg-[#d1fae5] text-[#065f46] flex items-center justify-center hover:bg-[#065f46] hover:text-white transition-all border border-[#6ee7b7]"
                                                                        title="Télécharger Convention"
                                                                    >
                                                                        <FileSignature size={14} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-[4px] bg-[#f4f6fb] text-slate-300 flex items-center justify-center border border-[#e2e8f0]">
                                                                        <FileSignature size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[9px] font-bold text-[#8898aa] uppercase tracking-tighter">Livret</span>
                                                                {student.has_livret_apprentissage ? (
                                                                    <button
                                                                        onClick={() => { const u = student.livret_apprentissage_url || (rawStudent.fields || rawStudent)?.["Livret Apprentissage"]?.[0]?.url; handleDownload(u, docFileName(student, 'LIVRET-APPRENTISSAGE')); }}
                                                                        className="w-8 h-8 rounded-[4px] bg-[#ede9fe] text-[#6d28d9] flex items-center justify-center hover:bg-[#6d28d9] hover:text-white transition-all border border-[#c4b5fd]"
                                                                        title="Télécharger Livret d'Apprentissage"
                                                                    >
                                                                        <BookOpen size={14} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-[4px] bg-[#f4f6fb] text-slate-300 flex items-center justify-center border border-[#e2e8f0]">
                                                                        <BookOpen size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[9px] font-bold text-[#8898aa] uppercase tracking-tighter">Cert.</span>
                                                                {student.has_certificat_scolarite ? (
                                                                    <button
                                                                        onClick={() => { const u = student.certificat_scolarite_url || rawStudent.fields?.["certificat de scolarité"]?.[0]?.url; handleDownload(u, docFileName(student, 'CERTIFICAT-SCOLARITE')); }}
                                                                        className="w-8 h-8 rounded-[4px] bg-[#fef3c7] text-[#b45309] flex items-center justify-center hover:bg-[#b45309] hover:text-white transition-all border border-[#fcd34d]"
                                                                        title="Télécharger Certificat de Scolarité"
                                                                    >
                                                                        <Award size={14} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-[4px] bg-[#f4f6fb] text-slate-300 flex items-center justify-center border border-[#e2e8f0]">
                                                                        <Award size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[9px] font-bold text-[#8898aa] uppercase tracking-tighter">CIN</span>
                                                                {student.has_cni ? (
                                                                    <button
                                                                        onClick={() => handleDownload(student.cni_url, docFileName(student, 'CIN'))}
                                                                        className="w-8 h-8 rounded-[4px] bg-[#dbeafe] text-[#1d4ed8] flex items-center justify-center hover:bg-[#1d4ed8] hover:text-white transition-all border border-[#93c5fd]"
                                                                        title="Télécharger CIN"
                                                                    >
                                                                        <CreditCard size={14} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-[4px] bg-[#f4f6fb] text-slate-300 flex items-center justify-center border border-[#e2e8f0]">
                                                                        <CreditCard size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[9px] font-bold text-[#8898aa] uppercase tracking-tighter">CV</span>
                                                                {student.has_cv ? (
                                                                    <button
                                                                        onClick={() => handleDownload(student.cv_url, docFileName(student, 'CV'))}
                                                                        className="w-8 h-8 rounded-[4px] bg-[#cffafe] text-[#0891b2] flex items-center justify-center hover:bg-[#0891b2] hover:text-white transition-all border border-[#67e8f9]"
                                                                        title="Télécharger CV"
                                                                    >
                                                                        <FileUser size={14} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-[4px] bg-[#f4f6fb] text-slate-300 flex items-center justify-center border border-[#e2e8f0]">
                                                                        <FileUser size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[9px] font-bold text-[#8898aa] uppercase tracking-tighter">Diplôme</span>
                                                                {student.has_diplome ? (
                                                                    <button
                                                                        onClick={() => handleDownload(student.diplome_url, docFileName(student, 'DIPLOME'))}
                                                                        className="w-8 h-8 rounded-[4px] bg-[#fef3c7] text-[#d97706] flex items-center justify-center hover:bg-[#d97706] hover:text-white transition-all border border-[#fcd34d]"
                                                                        title="Télécharger Diplôme"
                                                                    >
                                                                        <GraduationCap size={14} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-[4px] bg-[#f4f6fb] text-slate-300 flex items-center justify-center border border-[#e2e8f0]">
                                                                        <GraduationCap size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[9px] font-bold text-[#8898aa] uppercase tracking-tighter">Lettre</span>
                                                                {student.has_lettre_motivation ? (
                                                                    <button
                                                                        onClick={() => handleDownload(student.lettre_motivation_url, docFileName(student, 'LETTRE-MOTIVATION'))}
                                                                        className="w-8 h-8 rounded-[4px] bg-[#ccfbf1] text-[#0d9488] flex items-center justify-center hover:bg-[#0d9488] hover:text-white transition-all border border-[#5eead4]"
                                                                        title="Télécharger Lettre de motivation"
                                                                    >
                                                                        <FileText size={14} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-[4px] bg-[#f4f6fb] text-slate-300 flex items-center justify-center border border-[#e2e8f0]">
                                                                        <FileText size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[9px] font-bold text-[#8898aa] uppercase tracking-tighter">Vitale</span>
                                                                {student.has_vitale ? (
                                                                    <button
                                                                        onClick={() => handleDownload(student.vitale_url, docFileName(student, 'CARTE-VITALE'))}
                                                                        className="w-8 h-8 rounded-[4px] bg-[#d1fae5] text-[#065f46] flex items-center justify-center hover:bg-[#065f46] hover:text-white transition-all border border-[#6ee7b7]"
                                                                        title="Télécharger Carte Vitale"
                                                                    >
                                                                        <HeartPulse size={14} />
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-[4px] bg-[#f4f6fb] text-slate-300 flex items-center justify-center border border-[#e2e8f0]">
                                                                        <HeartPulse size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <ActionsMenu student={rawStudent} />
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 border-t border-[#e2e8f0] bg-[#f4f6fb]">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {loading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <div key={i} className="bg-white border border-[#e2e8f0] p-8 animate-pulse h-64"></div>
                                    ))
                                ) : paginatedItems.map((rawStudent) => {
                                    const student = getC(rawStudent);
                                    return (
                                        <div key={rawStudent.record_id || rawStudent.id} className="bg-white border border-[#e2e8f0] p-7 hover:shadow-lg transition-all duration-200">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-12 h-12 rounded-[4px] bg-[#f4f6fb] border border-[#e2e8f0] flex items-center justify-center text-slate-500 font-black text-lg">
                                                    {student.numero_inscription || `${student.prenom?.[0]}${student.nom?.[0]}`}
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <div className={`px-3 py-1.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest border ${rawStudent.dossier_complet ? 'bg-[#d1fae5] text-[#065f46] border-[#6ee7b7]' : 'bg-[#ffedd5] text-[#c2410c] border-[#fdba74]'}`}>
                                                        {rawStudent.dossier_complet ? 'Dossier Complet' : 'Dossier Incomplet'}
                                                    </div>
                                                    <ActionsMenu student={rawStudent} />
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <h3 className="text-lg font-bold text-[#1e293b]">{student.nom?.toUpperCase()} {student.prenom}</h3>
                                                <p className="text-sm text-[#8898aa] truncate mt-1">{student.email}</p>
                                            </div>

                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-[#dbeafe] text-[#1d4ed8] border border-[#93c5fd] font-bold text-[9px] uppercase tracking-widest whitespace-nowrap">
                                                    <Briefcase size={11} />
                                                    {formatFormation(student.formation)}
                                                </div>
                                                {student.alternance === 'Oui' && student.entreprise && student.entreprise !== 'En recherche' && (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-[#1a1f2e] text-white font-bold text-[9px] uppercase tracking-widest">
                                                        <Building size={11} />
                                                        {student.entreprise}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-6">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-[10px] font-bold text-[#8898aa] uppercase tracking-[0.08em]">Dossier</span>
                                                    <span className={`text-[10px] font-bold ${calculateDocCompletion(student) === 100 ? 'text-[#10c98f]' : calculateDocCompletion(student) >= 50 ? 'text-[#f97316]' : 'text-[#e84242]'}`}>
                                                        {calculateDocCompletion(student)}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-[#e2e8f0] overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r ${getCompletionGradient(calculateDocCompletion(student))}`}
                                                        style={{ width: `${calculateDocCompletion(student)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#e2e8f0]">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full text-[10px] font-bold !rounded-none"
                                                    onClick={() => handleViewDetails(rawStudent.record_id || rawStudent.id)}
                                                >
                                                    Fiche Étudiant
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className={`w-full text-[10px] font-bold !rounded-none ${!isPlaced(rawStudent) ? '!bg-[#c2410c] !border-[#c2410c]' : ''}`}
                                                    onClick={() => isPlaced(rawStudent) ? handleViewCompanyDetails(rawStudent) : handleFillForm(rawStudent)}
                                                >
                                                    {isPlaced(rawStudent) ? 'Voir Entreprise' : 'Lier Entreprise'}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-8">
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
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4">
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="bg-white border border-[#e2e8f0] rounded-[4px] p-4">
                                        <div className="h-2 bg-[#e2e8f0] rounded-[4px] w-20 mb-3"></div>
                                        <div className="h-6 bg-[#e2e8f0] rounded-[4px] w-12 mb-2"></div>
                                        <div className="h-2 bg-[#f4f6fb] rounded-[4px] w-16"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {[1,2].map(i => (
                                    <div key={i} className="bg-white border border-[#e2e8f0] rounded-[4px] p-5">
                                        <div className="h-2 bg-[#e2e8f0] rounded-[4px] w-32 mb-5"></div>
                                        <div className="space-y-3">
                                            {[80,55,20].map((w,j) => (
                                                <div key={j} className="flex items-center gap-3">
                                                    <div className="w-16 h-2 bg-[#e2e8f0] rounded-[4px]"></div>
                                                    <div className="flex-1 h-5 bg-[#f4f6fb] rounded-[4px]">
                                                        <div className="h-full bg-[#e2e8f0] rounded-[4px]" style={{width:`${w}%`}}></div>
                                                    </div>
                                                    <div className="w-12 h-2 bg-[#eef2f7] rounded-[4px]"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : statsData ? (
                        <>
                            {/* KPI Row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Effectif total', value: statsData.total, sub: 'étudiants inscrits', color: '#3b7cf4' },
                                    { label: 'En alternance', value: statsData.placed, sub: `${statsData.total > 0 ? Math.round((statsData.placed / statsData.total) * 100) : 0}% placés`, color: '#059669' },
                                    { label: 'Âge moyen', value: statsData.averageAge, sub: 'ans · ' + statsData.majorityGroup + ' majorité', color: '#7c3aed' },
                                    { label: 'CERFA générés', value: statsData.withCerfa, sub: `${statsData.total > 0 ? Math.round((statsData.withCerfa / statsData.total) * 100) : 0}% complétés`, color: '#d97706' },
                                ].map((kpi) => (
                                    <div key={kpi.label} className="bg-white border border-[#e2e8f0] rounded-[4px] p-4">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{kpi.label}</div>
                                        <div className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</div>
                                        <div className="text-[10px] text-slate-400 mt-1 truncate">{kpi.sub}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Genre + Âge */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Genre */}
                                <div className="bg-white border border-[#e2e8f0] rounded-[4px] p-5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Répartition par genre</div>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Masculin', count: statsData.sexDist.male, color: '#3b7cf4' },
                                            { label: 'Féminin', count: statsData.sexDist.female, color: '#e84242' },
                                            { label: 'Non renseigné', count: statsData.sexDist.other, color: '#94a3b8' },
                                        ].map(row => {
                                            const pct = statsData.total > 0 ? (row.count / statsData.total) * 100 : 0;
                                            return (
                                                <div key={row.label} className="flex items-center gap-3">
                                                    <div className="w-28 text-xs font-semibold text-slate-500 flex-shrink-0">{row.label}</div>
                                                    <div className="flex-1 h-5 bg-[#f4f6fb] rounded-[4px] overflow-hidden border border-[#e2e8f0]">
                                                        <div className="h-full rounded-[4px] transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: row.color }}></div>
                                                    </div>
                                                    <div className="w-20 text-right text-xs font-bold text-slate-700 flex-shrink-0">
                                                        {row.count} <span className="text-slate-400 font-normal">({Math.round(pct)}%)</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Âge */}
                                <div className="bg-white border border-[#e2e8f0] rounded-[4px] p-5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                                        Pyramide des âges
                                        <span className="text-slate-300 font-normal normal-case tracking-normal ml-2">· moy. {statsData.averageAge} ans</span>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { label: '-18 ans', count: statsData.ageDist.under18, color: '#3b7cf4' },
                                            { label: '18-20 ans', count: statsData.ageDist.age18_20, color: '#7c3aed' },
                                            { label: '21-25 ans', count: statsData.ageDist.age21_25, color: '#0bbfa8' },
                                            { label: '26+ ans', count: statsData.ageDist.over25, color: '#475569' },
                                        ].map(row => {
                                            const maxAge = Math.max(statsData.ageDist.under18, statsData.ageDist.age18_20, statsData.ageDist.age21_25, statsData.ageDist.over25, 1);
                                            const barPct = (row.count / maxAge) * 100;
                                            const absPct = statsData.total > 0 ? (row.count / statsData.total) * 100 : 0;
                                            return (
                                                <div key={row.label} className="flex items-center gap-3">
                                                    <div className="w-16 text-xs font-semibold text-slate-500 flex-shrink-0">{row.label}</div>
                                                    <div className="flex-1 h-5 bg-[#f4f6fb] rounded-[4px] overflow-hidden border border-[#e2e8f0]">
                                                        <div className="h-full rounded-[4px] transition-all duration-700" style={{ width: `${barPct}%`, backgroundColor: row.color }}></div>
                                                    </div>
                                                    <div className="w-20 text-right text-xs font-bold text-slate-700 flex-shrink-0">
                                                        {row.count} <span className="text-slate-400 font-normal">({Math.round(absPct)}%)</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Formations */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-white border border-[#e2e8f0] rounded-[4px] p-5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Répartition par formation</div>
                                    <div className="space-y-2.5">
                                        {statsData.formationList.length > 0 ? statsData.formationList.map(([label, count]) => {
                                            const displayLabel = formatFormation(label);
                                            const pct = statsData.total > 0 ? (count / statsData.total) * 100 : 0;
                                            return (
                                                <div key={label} className="flex items-center gap-3">
                                                    <div className="w-40 text-[11px] font-semibold text-slate-500 flex-shrink-0 truncate" title={label}>{displayLabel}</div>
                                                    <div className="flex-1 h-4 bg-[#f4f6fb] rounded-[4px] overflow-hidden border border-[#e2e8f0]">
                                                        <div className="h-full rounded-[4px] transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(to right, #7c3aed, #3b7cf4)' }}></div>
                                                    </div>
                                                    <div className="w-20 text-right text-[11px] font-bold text-slate-700 flex-shrink-0">
                                                        {count} <span className="text-slate-400 font-normal">({Math.round(pct)}%)</span>
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <p className="text-sm text-slate-400 py-4 text-center">Aucune formation renseignée</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-32 bg-[#f4f6fb] border border-dashed border-[#e2e8f0] rounded-[4px]">
                            <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold">Impossible de générer les statistiques. Données insuffisantes.</p>
                        </div>
                    )}
                </div>
            )}

            {currentTab === 'history' && (
                <div className="bg-white border border-[#e2e8f0] p-8 min-h-[500px]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-[4px] bg-[#fee2e2] border border-[#fca5a5] text-[#b91c1c] flex items-center justify-center">
                            <HistoryIcon size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#1e293b]">Historique des actions</h2>
                            <p className="text-[#8898aa] text-sm">Toutes les activités récentes de la classe</p>
                        </div>
                    </div>
                    <HistoryTimeline history={globalHistory} loading={loadingHistory} />
                </div>
            )}
            </div>
        </div>
    );
};

export default ClassNTCView;
