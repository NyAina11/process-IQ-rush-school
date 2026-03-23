import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building, Calculator, PenTool, CheckCircle2, Info, ArrowRight, Save, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { useApi } from '../hooks/useApi';
import Button from './ui/Button';

import Input from './ui/Input';
import Select from './ui/Select';
import { formatPhone, formatSIRET } from '../utils/formatters';
import {
    EMPLOYER_TYPE_OPTIONS,
    EMPLOYER_SPECIFIC_OPTIONS,
    MAITRE_DIPLOMA_OPTIONS,
    OPCO_OPTIONS,
    CONTRAT_TYPE_OPTIONS,
    DEROGATION_TYPE_OPTIONS,
    AGE_TRANCHE_OPTIONS,
    APPRENTISSAGE_YEAR_OPTIONS,
    YES_NO_OPTIONS,
    FORMATION_DETAILS
} from '../constants/formOptions';



const companySchema = z.object({
    identification: z.object({
        raison_sociale: z.string().min(2, "La raison sociale est requise"),
        siret: z.string().refine(val => {
            const cleaned = val.replace(/\s/g, '');
            return /^[0-9]{14}$/.test(cleaned);
        }, "Le SIRET doit contenir exactement 14 chiffres"),
        code_ape_naf: z.string().regex(/^[0-9]{4}[A-Z]$/, "Code APE invalide (ex: 4711D)"),
        type_employeur: z.string().min(1, "Veuillez sélectionner le type d'employeur"),
        employeur_specifique: z.string().min(1, "Veuillez sélectionner le type d'employeur spécifique"),
        effectif: z.string().min(1, "L'effectif est requis"),
        convention: z.string().optional().or(z.literal(""))
    }),
    adresse: z.object({
        num: z.string().optional().or(z.literal("")),
        voie: z.string().min(2, "La voie est requise"),
        complement: z.string().optional().or(z.literal("")),
        code_postal: z.string().regex(/^[0-9]{5}$/, "Le code postal doit contenir 5 chiffres"),
        ville: z.string().min(1, "La ville est requise"),
        telephone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Téléphone invalide"),
        email: z.string().email("L'adresse e-mail est invalide")
    }),
    maitre_apprentissage: z.object({
        nom: z.string().min(2, "Le nom est requis"),
        prenom: z.string().min(2, "Le prénom est requis"),
        date_naissance: z.string().min(1, "La date de naissance est requise"),
        fonction: z.string().optional().or(z.literal("")),
        diplome: z.string().min(1, "Veuillez sélectionner le diplôme"),
        experience: z.string().optional().or(z.literal("")),
        telephone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Téléphone invalide").optional().or(z.literal("")),
        email: z.string().email("L'adresse e-mail est invalide").optional().or(z.literal(""))
    }),
    opco: z.object({
        nom: z.string().min(1, "Veuillez sélectionner votre OPCO")
    }),
    formation: z.object({
        choisie: z.string().min(1, "Veuillez sélectionner la formation"),
        date_debut: z.string().min(1, "Date de début requise"),
        date_fin: z.string().min(1, "Date de fin requise"),
        code_rncp: z.string().optional().or(z.literal("")),
        code_diplome: z.string().optional().or(z.literal("")),
        nb_heures: z.string().optional().or(z.literal("")),
        jours_cours: z.string().optional().or(z.literal(""))
    }),
    cfa: z.object({
        rush_school: z.string(),
        entreprise: z.string(),
        denomination: z.string(),
        uai: z.string(),
        siret: z.string(),
        adresse: z.string(),
        complement: z.string().optional().or(z.literal("")),
        code_postal: z.string(),
        commune: z.string()
    }),
    contrat: z.object({
        type_contrat: z.string().min(1, "Type de contrat requis"),
        type_derogation: z.string().optional().or(z.literal("")),
        date_debut: z.string().optional().or(z.literal("")),
        date_fin: z.string().optional().or(z.literal("")),
        duree_hebdomadaire: z.string().min(1, "Durée requise").regex(/^\d+:[0-5]\d$/, "Format invalide (HH:mm)"),
        poste_occupe: z.string().optional().or(z.literal("")),
        lieu_execution: z.string().optional().or(z.literal("")),

        pourcentage_smic1: z.number().optional(),
        smic1: z.string().optional(),
        montant_salaire_brut1: z.number().optional(),

        pourcentage_smic2: z.number().optional(),
        smic2: z.string().optional(),
        montant_salaire_brut2: z.number().optional(),

        pourcentage_smic3: z.number().optional(),
        smic3: z.string().optional(),
        montant_salaire_brut3: z.number().optional(),

        pourcentage_smic4: z.number().optional(),
        smic4: z.string().optional(),
        montant_salaire_brut4: z.number().optional(),

        date_conclusion: z.string().optional().or(z.literal("")),
        date_debut_execution: z.string().optional().or(z.literal("")),
        numero_deca_ancien_contrat: z.string().optional().or(z.literal("")),
        machines_dangereuses: z.string(),
        caisse_retraite: z.string().optional().or(z.literal("")),
        date_avenant: z.string().optional().or(z.literal("")),
        nombre_mois: z.number().optional(),

        // MAPPINGS DES PÉRIODES DE SALAIRE
        date_debut_2periode_1er_annee: z.string().optional().or(z.literal("")),
        date_fin_2periode_1er_annee: z.string().optional().or(z.literal("")),

        date_debut_1periode_2eme_annee: z.string().optional().or(z.literal("")),
        date_fin_1periode_2eme_annee: z.string().optional().or(z.literal("")),
        date_debut_2periode_2eme_annee: z.string().optional().or(z.literal("")),
        date_fin_2periode_2eme_annee: z.string().optional().or(z.literal("")),

        date_debut_1periode_3eme_annee: z.string().optional().or(z.literal("")),
        date_fin_1periode_3eme_annee: z.string().optional().or(z.literal("")),
        date_debut_2periode_3eme_annee: z.string().optional().or(z.literal("")),
        date_fin_2periode_3eme_annee: z.string().optional().or(z.literal("")),

        date_debut_1periode_4eme_annee: z.string().optional().or(z.literal("")),
        date_fin_1periode_4eme_annee: z.string().optional().or(z.literal("")),
        date_debut_2periode_4eme_annee: z.string().optional().or(z.literal("")),
        date_fin_2periode_4eme_annee: z.string().optional().or(z.literal(""))
    }).superRefine((data, ctx) => {
        // Validation Dates de base
        if (data.date_conclusion && data.date_debut_execution) {
            if (new Date(data.date_conclusion) > new Date(data.date_debut_execution)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "La date de conclusion doit être avant ou égale à la date de début d'exécution",
                    path: ["date_debut_execution"]
                });
            }
        }

        const conclusion = data.date_conclusion ? new Date(data.date_conclusion) : null;

        // Vérification des périodes
        const checkPeriod = (startKey: string, endKey: string, label: string, checkConclusion: boolean = true) => {
            const startStr = (data as any)[startKey];
            const endStr = (data as any)[endKey];

            if (startStr && endStr) {
                const start = new Date(startStr);
                const end = new Date(endStr);

                if (start >= end) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `La date de début doit être avant la date de fin`,
                        path: [startKey]
                    });
                }

                if (checkConclusion && conclusion && start < conclusion) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `La date de début doit être après ou égale à la date de conclusion`,
                        path: [startKey]
                    });
                }
            }
        };

        // 1ère année - 2ème période
        checkPeriod('date_debut_2periode_1er_annee', 'date_fin_2periode_1er_annee', '2ème période 1ère année', false);

        // Autres années
        for (let year = 2; year <= 4; year++) {
            const suffix = `${year === 2 ? '2eme' : year === 3 ? '3eme' : '4eme'}_annee`;
            checkPeriod(`date_debut_1periode_${suffix}`, `date_fin_1periode_${suffix}`, `1ère période ${year}ème année`);
            checkPeriod(`date_debut_2periode_${suffix}`, `date_fin_2periode_${suffix}`, `2ème période ${year}ème année`);
        }
    }),
    salaire: z.object({
        age1: z.string().min(1, "L'âge est requis"),
        age2: z.string().optional(),
        age3: z.string().optional(),
        age4: z.string().optional()
    }),
    missions: z.object({
        formation_alternant: z.string().optional().or(z.literal("")),
        selectionnees: z.array(z.string()).min(3, "Veuillez sélectionner au moins 3 missions")
    }),
    record_id_etudiant: z.string()
});


type CompanyFormValues = z.infer<typeof companySchema>;

import { useCandidates } from '../hooks/useCandidates';

interface EntrepriseFormProps {
    onNext: (response?: any) => void;
    studentRecordId: string | null;
}

const EntrepriseForm: React.FC<EntrepriseFormProps> = ({ onNext, studentRecordId }) => {
    const { showToast, draftCompany, setDraftCompany, clearDraftCompany } = useAppStore();
    const { refresh: refreshCandidates } = useCandidates();
    const [activeSection, setActiveSection] = useState<string | null>('id');

    const toggleSection = (section: string) => {
        setActiveSection(prev => prev === section ? null : section);
    };


    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            identification: draftCompany?.identification || { raison_sociale: "", siret: "", code_ape_naf: "", type_employeur: "", employeur_specifique: "Aucun de ces cas", effectif: "", convention: "" },
            adresse: draftCompany?.adresse || { num: "", voie: "", complement: "", code_postal: "", ville: "", telephone: "", email: "" },
            maitre_apprentissage: draftCompany?.maitre_apprentissage || { nom: "", prenom: "", date_naissance: "", fonction: "", diplome: "", experience: "", telephone: "", email: "" },
            opco: draftCompany?.opco || { nom: "" },
            formation: draftCompany?.formation || { choisie: "", date_debut: "", date_fin: "", code_rncp: "", code_diplome: "", nb_heures: "", jours_cours: "" },
            cfa: draftCompany?.cfa || {
                rush_school: "oui", entreprise: "non", denomination: "RUSH SCHOOL", uai: "0923033X",
                siret: "918 707 704 00014", adresse: "6 rue des Bateliers", complement: "", code_postal: "92110", commune: "CLICHY"
            },
            contrat: draftCompany?.contrat || {
                type_contrat: "", type_derogation: "", date_debut: "", date_fin: "", duree_hebdomadaire: "35:00", poste_occupe: "",
                lieu_execution: "",
                pourcentage_smic1: 0, smic1: "smic", montant_salaire_brut1: 0,
                pourcentage_smic2: 0, smic2: "smic", montant_salaire_brut2: 0,
                pourcentage_smic3: 0, smic3: "smic", montant_salaire_brut3: 0,
                pourcentage_smic4: 0, smic4: "smic", montant_salaire_brut4: 0,
                date_conclusion: "", date_debut_execution: "",
                numero_deca_ancien_contrat: "", machines_dangereuses: "Non", caisse_retraite: "", date_avenant: "", nombre_mois: 12,
                // Initialisation des dates de périodes de salaire
                date_debut_2periode_1er_annee: "", date_fin_2periode_1er_annee: "",
                date_debut_1periode_2eme_annee: "", date_fin_1periode_2eme_annee: "",
                date_debut_2periode_2eme_annee: "", date_fin_2periode_2eme_annee: "",
                date_debut_1periode_3eme_annee: "", date_fin_1periode_3eme_annee: "",
                date_debut_2periode_3eme_annee: "", date_fin_2periode_3eme_annee: "",
                date_debut_1periode_4eme_annee: "", date_fin_1periode_4eme_annee: "",
                date_debut_2periode_4eme_annee: "", date_fin_2periode_4eme_annee: ""
            },
            salaire: draftCompany?.salaire || {
                age1: "", age2: "", age3: "", age4: ""
            },
            missions: draftCompany?.missions || { formation_alternant: "", selectionnees: [] as string[] },
            record_id_etudiant: studentRecordId || ""
        }
    });

    // Force sync studentRecordId prop to form state (avoids stale draft ID)
    useEffect(() => {
        if (studentRecordId) {
            setValue('record_id_etudiant', studentRecordId);
        }
    }, [studentRecordId, setValue]);

    const formData = watch();

    // Auto-save draft
    useEffect(() => {
        const subscription = watch((value) => setDraftCompany(value));
        return () => subscription.unsubscribe();
    }, [watch, setDraftCompany]);



    const handleFormationChange = (val: string) => {
        const details = FORMATION_DETAILS[val] || { debut: "", fin: "", rncp: "", diplome: "", heures: "", jours: "" };

        let nbMois = 12;
        if (details.debut && details.fin) {
            const d1 = new Date(details.debut);
            const d2 = new Date(details.fin);
            nbMois = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
            if (nbMois < 1) nbMois = 1;
        }

        setValue('formation.choisie', val);
        setValue('formation.date_debut', details.debut);
        setValue('formation.date_fin', details.fin);
        setValue('formation.code_rncp', details.rncp);
        setValue('formation.code_diplome', details.diplome);
        setValue('formation.nb_heures', details.heures);
        setValue('formation.jours_cours', details.jours);
        setValue('contrat.nombre_mois', nbMois);
    };

    const calculateSalary = (age: string, annee: string) => {
        const smicBrut = 1823.03;
        let pct = 0;

        if (age === "16-17") {
            pct = annee === "1" ? 27 : annee === "2" ? 39 : 55;
        } else if (age === "18-20") {
            pct = annee === "1" ? 43 : annee === "2" ? 51 : 67;
        } else if (age === "21-25") {
            pct = annee === "1" ? 53 : annee === "2" ? 61 : 78;
        } else if (age === "26+") {
            pct = 100;
        }

        // Use 3rd year rates for 4th year by default if not specified
        if (annee === "4" && age !== "26+") {
            if (age === "16-17") pct = 55;
            else if (age === "18-20") pct = 67;
            else if (age === "21-25") pct = 78;
        }

        const montant = parseFloat(((smicBrut * pct) / 100).toFixed(2));
        return { pct, montant };
    };

    const updateSalary = (yearIndex: string, age: string) => {
        const { pct, montant } = calculateSalary(age, yearIndex);

        // Update the specific year in contrat object for API
        setValue(`contrat.pourcentage_smic${yearIndex}` as any, pct, { shouldValidate: true });
        setValue(`contrat.montant_salaire_brut${yearIndex}` as any, montant, { shouldValidate: true });
        setValue(`contrat.smic${yearIndex}` as any, "smic", { shouldValidate: true });

        // Update the age for this specific year
        setValue(`salaire.age${yearIndex}` as any, age, { shouldValidate: true });
    };

    const toggleMission = (mission: string) => {
        const current = watch('missions.selectionnees') || [];
        if (current.includes(mission)) {
            setValue('missions.selectionnees', current.filter(m => m !== mission), { shouldValidate: true });
        } else {
            setValue('missions.selectionnees', [...current, mission], { shouldValidate: true });
        }
    };

    // Helper to check if any field in a section has an error
    const hasSectionError = (sectionFields: string[]) => {
        return sectionFields.some(field => {
            const parts = field.split('.');
            let current = errors as any;
            for (const part of parts) {
                if (!current || !current[part]) {
                    current = null;
                    break;
                }
                current = current[part];
            }
            return !!current;
        });
    };

    const { execute: submitCompany, loading: isSubmitting } = useApi(api.submitCompany, {
        successMessage: "Informations entreprise enregistrées avec succès !",
        onSuccess: (response) => {
            clearDraftCompany();
            refreshCandidates();
            onNext(response);
        },
        errorMessage: "Une erreur est survenue lors de l'enregistrement. Vérifiez les données et réessayez."
    });

    const handleSaveDraft = () => {
        setDraftCompany(watch());
        showToast("Brouillon sauvegardé — vos données sont conservées.", "success");
    };

    const onSubmit = async (data: CompanyFormValues) => {
        console.log('📝 Submitting Company for Student ID (Prop):', studentRecordId);
        if (!studentRecordId) {
            showToast("Erreur: ID étudiant manquant. Veuillez revenir à l'étape précédente.", "error");
            return;
        }
        // Force the correct ID from props into the payload to avoid stale draft data
        const finalData = { ...data, record_id_etudiant: studentRecordId };
        console.log('📦 Final Payload sent to API:', finalData);
        await submitCompany(finalData as any);
    };

    const onError = (errors: any) => {
        const errorCount = Object.keys(errors).length;
        showToast(`Veuillez corriger les erreurs dans les ${errorCount} section(s) concernée(s).`, "error");

        const sections = [
            { id: 'id', fields: ['identification'] },
            { id: 'address', fields: ['adresse'] },
            { id: 'maitre', fields: ['maitre_apprentissage'] },
            { id: 'opco', fields: ['opco'] },
            { id: 'training', fields: ['formation', 'cfa'] },
            { id: 'contract', fields: ['contrat', 'salaire', 'missions'] }
        ];

        for (const section of sections) {
            const hasError = section.fields.some(field => errors[field]);
            if (hasError) {
                setActiveSection(section.id);
                break;
            }
        }
    };

    const FICHE_STEPS = ['Entreprise', 'Contact', 'Formation', 'Contrat', 'Validation'];

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)} className="animate-fade-in bg-white rounded-[4px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="formation-section" style={{ padding: '0 28px 28px' }}>
                {/* Mini Stepper */}
                <div className="fiche-stepper">
                    {FICHE_STEPS.map((step, i) => {
                        const activeIdx = ['id', 'address', 'maitre', 'opco', 'training', 'contract'].indexOf(activeSection);
                        // Approximate mapping for the stepper
                        const isCurrent = (i === 0 && activeSection === 'id') ||
                            (i === 1 && activeSection === 'address') ||
                            (i === 2 && activeSection === 'maitre') ||
                            (i === 3 && activeSection === 'opco') ||
                            (i === 4 && (activeSection === 'training' || activeSection === 'contract'));

                        return (
                            <React.Fragment key={step}>
                                <div
                                    className={`fiche-stepper-step ${isCurrent ? 'active' : ''}`}
                                    onClick={() => {
                                        const sectionMap = ['id', 'address', 'maitre', 'opco', 'training'];
                                        if (sectionMap[i]) setActiveSection(sectionMap[i]);
                                    }}
                                >
                                    <span className="fiche-stepper-dot"></span>
                                    {step}
                                </div>
                                {i < FICHE_STEPS.length - 1 && (
                                    <div className="fiche-stepper-line"></div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Header */}
                <div className="fiche-header">
                    <div className="fiche-header-icon !bg-brand/5 !text-brand">
                        <Building size={24} />
                    </div>
                    <div className="fiche-header-text">
                        <h2 className="text-[18.4px] font-bold text-[#18162A]">Fiche de renseignement Entreprise</h2>
                        <p>Informations sur l'entreprise d'accueil pour le contrat d'apprentissage</p>
                    </div>
                </div>
                <div className="fiche-divider"></div>

                <div className="space-y-4">
                    {/* SECTION 1 */}
                    <div className="fiche-section">
                        <div className="fiche-section-title">
                            <span className="fiche-section-num">1</span>
                            <span className="fiche-section-label">Identification de l'entreprise</span>
                        </div>
                        <div className="fiche-form-grid">
                            <div className="full-width">
                                <Input label="Raison sociale" required placeholder="Nom de l'entreprise" error={errors.identification?.raison_sociale?.message} {...register('identification.raison_sociale')} />
                            </div>
                            <div className="fiche-field">
                                <Input label="Numéro SIRET" required placeholder="14 chiffres" error={errors.identification?.siret?.message} {...register('identification.siret', {
                                    onChange: (e) => {
                                        e.target.value = formatSIRET(e.target.value);
                                    }
                                })} />
                            </div>
                            <div className="fiche-field">
                                <Input label="Code APE/NAF" required placeholder="Ex: 4711D" error={errors.identification?.code_ape_naf?.message} {...register('identification.code_ape_naf')} />
                            </div>
                            <div className="full-width">
                                <Select
                                    label="Type d'employeur"
                                    required
                                    error={errors.identification?.type_employeur?.message}
                                    {...register('identification.type_employeur')}
                                    placeholder="Sélectionnez"
                                    options={EMPLOYER_TYPE_OPTIONS}
                                />
                            </div>
                            <div className="full-width">
                                <Select
                                    label="Employeur spécifique"
                                    required
                                    error={errors.identification?.employeur_specifique?.message}
                                    {...register('identification.employeur_specifique')}
                                    placeholder="Sélectionnez"
                                    options={EMPLOYER_SPECIFIC_OPTIONS}
                                />
                            </div>
                            <div className="fiche-field">
                                <Input label="Effectif salarié" required type="number" placeholder="Nombre" error={errors.identification?.effectif?.message} {...register('identification.effectif')} />
                            </div>
                            <div className="fiche-field">
                                <Input label="IDCC" placeholder="Intitulé" {...register('identification.convention')} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2 */}
                    <div className="fiche-section">
                        <div className="fiche-section-title">
                            <span className="fiche-section-num">2</span>
                            <span className="fiche-section-label">Adresse de l'entreprise</span>
                        </div>
                        <div className="fiche-form-grid">
                            <div className="fiche-field">
                                <Input label="Numéro" placeholder="N°" {...register('adresse.num')} />
                            </div>
                            <div className="fiche-field">
                                <Input label="Voie" required placeholder="Rue, avenue, boulevard..." error={errors.adresse?.voie?.message} {...register('adresse.voie')} />
                            </div>
                            <div className="full-width">
                                <Input label="Complément d'adresse" placeholder="Bâtiment, étage, etc." {...register('adresse.complement')} />
                            </div>
                            <div className="fiche-field">
                                <Input label="Code postal" required placeholder="Ex: 75001" error={errors.adresse?.code_postal?.message} {...register('adresse.code_postal')} />
                            </div>
                            <div className="fiche-field">
                                <Input label="Ville" required placeholder="Ville" error={errors.adresse?.ville?.message} {...register('adresse.ville')} />
                            </div>
                            <div className="fiche-field">
                                <Input label="Téléphone" required type="tel" placeholder="Téléphone entreprise" error={errors.adresse?.telephone?.message} {...register('adresse.telephone', {
                                    onChange: (e) => {
                                        e.target.value = formatPhone(e.target.value);
                                    }
                                })} />
                            </div>
                            <div className="fiche-field">
                                <Input label="Email" required type="email" placeholder="Email de contact" error={errors.adresse?.email?.message} {...register('adresse.email')} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3 */}
                    <div className="fiche-section">
                        <div className="fiche-section-title">
                            <span className="fiche-section-num">3</span>
                            <span className="fiche-section-label">Maître d'apprentissage</span>
                        </div>
                        <div className="fiche-form-grid">
                            <div className="fiche-field">
                                <Input label="Nom" required placeholder="Nom" error={errors.maitre_apprentissage?.nom?.message} {...register('maitre_apprentissage.nom')} />
                            </div>
                            <div className="fiche-field">
                                <Input label="Prénom" required placeholder="Prénom" error={errors.maitre_apprentissage?.prenom?.message} {...register('maitre_apprentissage.prenom')} />
                            </div>
                            <div className="fiche-field">
                                <Input label="Date de naissance" required type="date" error={errors.maitre_apprentissage?.date_naissance?.message} {...register('maitre_apprentissage.date_naissance')} />
                            </div>
                            <div className="fiche-field">
                                <Input label="Fonction" placeholder="Poste occupé" error={errors.maitre_apprentissage?.fonction?.message} {...register('maitre_apprentissage.fonction')} />
                            </div>
                            <div className="fiche-field">
                                <Select
                                    label="Diplôme le plus élevé"
                                    error={errors.maitre_apprentissage?.diplome?.message}
                                    {...register('maitre_apprentissage.diplome')}
                                    options={MAITRE_DIPLOMA_OPTIONS}
                                    placeholder="Sélectionnez"
                                />
                            </div>
                            <div className="fiche-field">
                                <Input label="Années d'expérience" type="number" placeholder="Années" {...register('maitre_apprentissage.experience')} />
                            </div>
                            <div className="fiche-field">
                                <Input label="Téléphone" type="tel" placeholder="Téléphone" error={errors.maitre_apprentissage?.telephone?.message} {...register('maitre_apprentissage.telephone', {
                                    onChange: (e) => {
                                        e.target.value = formatPhone(e.target.value);
                                    }
                                })} />
                            </div>
                            <div className="fiche-field">
                                <Input label="Email" type="email" placeholder="Email" error={errors.maitre_apprentissage?.email?.message} {...register('maitre_apprentissage.email')} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4 */}
                    <div className="fiche-section">
                        <div className="fiche-section-title">
                            <span className="fiche-section-num">4</span>
                            <span className="fiche-section-label">OPCO (Opérateur de Compétences)</span>
                        </div>
                        <div className="fiche-form-grid">
                            <div className="full-width">
                                <Select
                                    label="Sélectionnez votre OPCO"
                                    required
                                    error={errors.opco?.nom?.message}
                                    {...register('opco.nom')}
                                    placeholder="Choisir un OPCO"
                                    options={OPCO_OPTIONS}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5 */}
                    <div className="fiche-section">
                        <div className="fiche-section-title">
                            <span className="fiche-section-num">5</span>
                            <span className="fiche-section-label">Formation & CFA</span>
                        </div>
                        <div className="fiche-form-grid">
                            <div className="full-width">
                                <label className="fiche-field-label">Formation suivie <span className="req">*</span></label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-2">
                                    {['BTS MCO A', 'BTS MCO 2', 'BTS NDRC 1', 'BTS COM', 'Titre Pro NTC', 'Titre Pro NTC B', 'Bachelor RDC'].map((f, idx) => (
                                        <label key={idx} className="relative cursor-pointer group">
                                            <input className="peer sr-only" type="radio" value={f} checked={formData.formation.choisie === f} onChange={() => handleFormationChange(f)} />
                                            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${formData.formation.choisie === f ? 'bg-brand/5 border-brand' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}>
                                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${formData.formation.choisie === f ? 'bg-brand text-white' : 'bg-slate-200 text-slate-400'}`}>{idx + 1}</span>
                                                <span className="font-bold text-slate-700 text-[11px] truncate leading-tight">{f}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {errors.formation?.choisie && <p className="mt-1 text-rose-500 text-[10px] font-bold">{errors.formation.choisie.message}</p>}
                            </div>
                            <div className="fiche-field">
                                <Input label="Date de début" required type="date" error={errors.formation?.date_debut?.message} {...register('formation.date_debut')} />
                            </div>
                            <div className="fiche-field">
                                <Input label="Date de fin" required type="date" error={errors.formation?.date_fin?.message} {...register('formation.date_fin')} />
                            </div>

                            <div className="full-width mt-2">
                                <div className="flex flex-wrap items-center gap-6 mb-4">
                                    <div className="flex items-center gap-2">
                                        <label className="fiche-field-label mb-0">CFA Rush School <span className="req">*</span></label>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => { setValue('cfa.rush_school', 'oui'); setValue('cfa.entreprise', 'non'); }} className={`px-4 py-1.5 rounded-[4px] text-[11px] font-bold transition-all ${formData.cfa.rush_school === 'oui' ? 'bg-brand text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>Oui</button>
                                            <button type="button" onClick={() => setValue('cfa.rush_school', 'non')} className={`px-4 py-1.5 rounded-[4px] text-[11px] font-bold transition-all ${formData.cfa.rush_school === 'non' ? 'bg-brand text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>Non</button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="fiche-field-label mb-0">CFA d'entreprise <span className="req">*</span></label>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setValue('cfa.entreprise', 'oui')} className={`px-4 py-1.5 rounded-[4px] text-[11px] font-bold transition-all ${formData.cfa.entreprise === 'oui' ? 'bg-brand text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>Oui</button>
                                            <button type="button" onClick={() => setValue('cfa.entreprise', 'non')} className={`px-4 py-1.5 rounded-[4px] text-[11px] font-bold transition-all ${formData.cfa.entreprise === 'non' ? 'bg-brand text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>Non</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="fiche-form-grid">
                                    <div className="full-width">
                                        <Input label="Dénomination du CFA responsable" required error={errors.cfa?.denomination?.message} {...register('cfa.denomination')} />
                                    </div>
                                    <div className="fiche-field">
                                        <Input label="Numéro SIRET" required placeholder="14 chiffres" error={errors.cfa?.siret?.message} {...register('cfa.siret', {
                                            onChange: (e) => {
                                                e.target.value = formatSIRET(e.target.value);
                                            }
                                        })} />
                                    </div>
                                    <div className="fiche-field">
                                        <Input label="Numéro UAI" required placeholder="Ex: 0923033X" error={errors.cfa?.uai?.message} {...register('cfa.uai')} />
                                    </div>
                                    <div className="full-width">
                                        <Input label="Adresse du CFA" required error={errors.cfa?.adresse?.message} {...register('cfa.adresse')} />
                                    </div>
                                    <div className="fiche-field">
                                        <Input label="Code postal" required error={errors.cfa?.code_postal?.message} {...register('cfa.code_postal')} />
                                    </div>
                                    <div className="fiche-field">
                                        <Input label="Commune" required error={errors.cfa?.commune?.message} {...register('cfa.commune')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 6 */}
                    <div className="fiche-section">
                        <div className="fiche-section-title">
                            <span className="fiche-section-num">6</span>
                            <span className="fiche-section-label">Contrat & Salaire</span>
                        </div>
                        <div className="grid grid-cols-12 gap-5">
                            <div className="col-span-12 md:col-span-6">
                                <Select label="Type de contrat" required error={errors.contrat?.type_contrat?.message} {...register('contrat.type_contrat')} options={CONTRAT_TYPE_OPTIONS} />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <Select label="Type de dérogation" {...register('contrat.type_derogation')} placeholder="Sélectionnez si applicable" options={DEROGATION_TYPE_OPTIONS} />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="text-sm font-semibold text-slate-700 ml-1 block mb-2">
                                    Durée hebdomadaire <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <Input
                                            type="number"
                                            placeholder="HH"
                                            min="0"
                                            value={watch('contrat.duree_hebdomadaire')?.split(':')[0] || ''}
                                            onChange={(e) => {
                                                const h = e.target.value || '0';
                                                const m = watch('contrat.duree_hebdomadaire')?.split(':')[1] || '00';
                                                setValue('contrat.duree_hebdomadaire', `${h}:${m}`, { shouldValidate: true });
                                            }}
                                        />
                                    </div>
                                    <span className="font-bold text-slate-400">:</span>
                                    <div className="flex-1">
                                        <Input
                                            type="number"
                                            placeholder="mm"
                                            min="0"
                                            max="59"
                                            value={watch('contrat.duree_hebdomadaire')?.split(':')[1] || ''}
                                            onChange={(e) => {
                                                let m = e.target.value || '0';
                                                if (parseInt(m) > 59) m = '59';
                                                const h = watch('contrat.duree_hebdomadaire')?.split(':')[0] || '35';
                                                setValue('contrat.duree_hebdomadaire', `${h}:${m.padStart(2, '0')}`, { shouldValidate: true });
                                            }}
                                        />
                                    </div>
                                </div>
                                {errors.contrat?.duree_hebdomadaire && (
                                    <p className="mt-1 text-rose-500 text-xs font-bold">{errors.contrat.duree_hebdomadaire.message}</p>
                                )}
                            </div>
                            <div className="col-span-12">
                                <Input label="Poste occupé" placeholder="Intitulé exact du poste" error={errors.contrat?.poste_occupe?.message} {...register('contrat.poste_occupe')} />
                            </div>
                            <div className="col-span-12">
                                <Input label="Lieu d'exécution" placeholder="Adresse si différente" {...register('contrat.lieu_execution')} />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <Input label="N° DECA ancien contrat" placeholder="Si applicable" {...register('contrat.numero_deca_ancien_contrat')} />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <Input label="Date de conclusion" type="date" error={errors.contrat?.date_conclusion?.message} {...register('contrat.date_conclusion')} />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <Input label="Date début exécution" type="date" error={errors.contrat?.date_debut_execution?.message} {...register('contrat.date_debut_execution')} />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <Input label="Date avenant" type="date" {...register('contrat.date_avenant')} />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <Input label="Caisse de retraite" placeholder="Nom de la caisse" {...register('contrat.caisse_retraite')} />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <Select label="Travail sur machines dangereuses" required {...register('contrat.machines_dangereuses')} options={YES_NO_OPTIONS} />
                            </div>

                            {/* Simulateur de salaire multi-années indépendant */}
                            <div className="col-span-12 mt-8">
                                {/* Header bar */}
                                <div className="rounded-t-2xl bg-[#1a1630] px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                            <Calculator size={16} className="text-white" />
                                        </div>
                                        <div>
                                            <div className="text-white font-black text-[14px] tracking-tight">Simulateur de salaire apprenti</div>
                                            <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">SMIC 2024 · 1 823,03 € brut/mois</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {["1", "2", "3", "4"].map(y => {
                                            const a = (formData.salaire as any)[`age${y}`];
                                            return (
                                                <div key={y} className={`w-2 h-2 rounded-full transition-colors ${a ? 'bg-emerald-400' : 'bg-white/20'}`} />
                                            );
                                        })}
                                        <span className="text-white/40 text-[10px] font-bold ml-2">
                                            {["1", "2", "3", "4"].filter(y => (formData.salaire as any)[`age${y}`]).length}/4 configurées
                                        </span>
                                    </div>
                                </div>

                                {/* Cards grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-t-0 border-slate-200 rounded-b-2xl overflow-hidden">
                                    {["1", "2", "3", "4"].map((year, idx) => {
                                        const yearAge = (formData.salaire as any)[`age${year}`];
                                        const { pct, montant } = calculateSalary(yearAge, year);
                                        const isRight = idx % 2 === 1;
                                        const isBottom = idx >= 2;

                                        return (
                                            <div
                                                key={year}
                                                className={`relative bg-white flex flex-col transition-colors hover:bg-slate-50/60 ${isRight ? 'border-l border-slate-200' : ''} ${isBottom ? 'border-t border-slate-200' : ''}`}
                                            >
                                                {/* Year strip */}
                                                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-lg bg-[#1a1630] flex items-center justify-center shrink-0">
                                                            <span className="text-white text-[11px] font-black">{year}</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-0.5">Étape du contrat</div>
                                                            <div className="text-[13px] font-black text-slate-800 leading-none">{year}{year === "1" ? "ère" : "ème"} année</div>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${yearAge ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        <CheckCircle2 size={11} />
                                                        {yearAge ? 'Configuré' : 'En attente'}
                                                    </div>
                                                </div>

                                                <div className="p-5 space-y-4 flex-grow">
                                                    {/* Sélecteur d'âge */}
                                                    <Select
                                                        label={`Tranche d'âge`}
                                                        required={year === "1"}
                                                        value={yearAge}
                                                        onChange={(e) => updateSalary(year, e.target.value)}
                                                        options={AGE_TRANCHE_OPTIONS}
                                                        placeholder="Choisir l'âge..."
                                                        error={(errors.salaire as any)?.[`age${year}`]?.message}
                                                    />

                                                    {/* Périodes de dates */}
                                                    <div className="space-y-2.5">
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Périodes de rémunération</div>

                                                        {year === "1" ? (
                                                            <div className="rounded-lg border border-[#6B3CD2]/15 bg-[#6B3CD2]/3 p-3 space-y-3">
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6B3CD2]/50"></div>
                                                                    <span className="text-[10px] font-black text-[#6B3CD2] uppercase tracking-wider">2ème Période</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <Input
                                                                        type="date"
                                                                        label="Début"
                                                                        required
                                                                        error={errors.contrat?.date_debut_2periode_1er_annee?.message}
                                                                        {...register(`contrat.date_debut_2periode_1er_annee` as any)}
                                                                    />
                                                                    <Input
                                                                        type="date"
                                                                        label="Fin"
                                                                        required
                                                                        error={errors.contrat?.date_fin_2periode_1er_annee?.message}
                                                                        {...register(`contrat.date_fin_2periode_1er_annee` as any)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2.5">
                                                                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-3">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">1ère Période</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <Input
                                                                            type="date"
                                                                            label="Début"
                                                                            error={(errors.contrat as any)?.[`date_debut_1periode_${year === "2" ? "2eme" : year === "3" ? "3eme" : "4eme"}_annee`]?.message}
                                                                            {...register(`contrat.date_debut_1periode_${year === "2" ? "2eme" : year === "3" ? "3eme" : "4eme"}_annee` as any)}
                                                                        />
                                                                        <Input
                                                                            type="date"
                                                                            label="Fin"
                                                                            error={(errors.contrat as any)?.[`date_fin_1periode_${year === "2" ? "2eme" : year === "3" ? "3eme" : "4eme"}_annee`]?.message}
                                                                            {...register(`contrat.date_fin_1periode_${year === "2" ? "2eme" : year === "3" ? "3eme" : "4eme"}_annee` as any)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="rounded-lg border border-[#6B3CD2]/15 bg-[#6B3CD2]/3 p-3 space-y-3">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#6B3CD2]/50"></div>
                                                                        <span className="text-[10px] font-black text-[#6B3CD2] uppercase tracking-wider">2ème Période</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <Input
                                                                            type="date"
                                                                            label="Début"
                                                                            error={(errors.contrat as any)?.[`date_debut_2periode_${year === "2" ? "2eme" : year === "3" ? "3eme" : "4eme"}_annee`]?.message}
                                                                            {...register(`contrat.date_debut_2periode_${year === "2" ? "2eme" : year === "3" ? "3eme" : "4eme"}_annee` as any)}
                                                                        />
                                                                        <Input
                                                                            type="date"
                                                                            label="Fin"
                                                                            error={(errors.contrat as any)?.[`date_fin_2periode_${year === "2" ? "2eme" : year === "3" ? "3eme" : "4eme"}_annee`]?.message}
                                                                            {...register(`contrat.date_fin_2periode_${year === "2" ? "2eme" : year === "3" ? "3eme" : "4eme"}_annee` as any)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Footer stats */}
                                                <div className="mx-5 mb-5 rounded-xl bg-[#1a1630] overflow-hidden">
                                                    {/* SMIC bar */}
                                                    <div className="h-1 bg-white/10">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-[#6B3CD2] to-emerald-400 transition-all duration-700"
                                                            style={{ width: yearAge ? `${Math.min(pct, 100)}%` : '0%' }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between px-4 py-3">
                                                        <div>
                                                            <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-0.5">Taux SMIC</div>
                                                            <div className="text-white text-[18px] font-black leading-none">
                                                                {yearAge ? `${pct}%` : <span className="text-white/30">--%</span>}
                                                            </div>
                                                        </div>
                                                        <div className="w-px h-8 bg-white/10" />
                                                        <div className="text-right">
                                                            <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-0.5">Salaire Brut</div>
                                                            <div className="text-[18px] font-black leading-none" style={{ color: yearAge ? '#a78bfa' : 'rgba(255,255,255,0.2)' }}>
                                                                {yearAge ? montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }) : '-- €'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 italic">
                                    <Info size={12} className="shrink-0" />
                                    Note : La tranche d'âge peut évoluer au cours du contrat. Configurez l'âge attendu pour chaque période. Calcul basé sur le SMIC 2024 de 1 823,03 € brut mensuel.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 7 */}
                    <div className="fiche-section">
                        <div className="fiche-section-title">
                            <span className="fiche-section-num">7</span>
                            <span className="fiche-section-label">Missions en entreprise</span>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                                <label className="fiche-field-label mb-4">Sélection des missions principales (3 minimum)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        "Prospection et développement commercial",
                                        "Gestion et suivi de la relation client",
                                        "Vente en face à face ou à distance",
                                        "Animation et gestion d un espace de vente",
                                        "Mise en place d opérations promotionnelles",
                                        "Analyse des performances commerciales",
                                        "Veille concurrentielle et étude de marché",
                                        "Gestion des stocks et approvisionnements",
                                        "Management d une petite équipe",
                                        "Reporting et tableaux de bord"
                                    ].map((mission) => (
                                        <label key={mission} className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${formData.missions.selectionnees.includes(mission) ? 'bg-white border-brand shadow-sm' : 'bg-transparent border-transparent hover:border-slate-200'}`}>
                                            <input type="checkbox" className="w-4 h-4 accent-brand" checked={formData.missions.selectionnees.includes(mission)} onChange={() => toggleMission(mission)} />
                                            <span className={`text-[11px] font-bold ${formData.missions.selectionnees.includes(mission) ? 'text-slate-900' : 'text-slate-500'}`}>{mission}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.missions?.selectionnees && <p className="mt-2 text-rose-500 text-[10px] font-bold">{errors.missions.selectionnees.message}</p>}
                            </div>

                            <div className="fiche-field full-width">
                                <label className="fiche-field-label">Détails complémentaires sur les missions</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:border-brand focus:bg-white outline-none transition-all font-bold text-slate-700 text-[12px] placeholder:text-slate-300 resize-none h-24"
                                    placeholder="Précisez les spécificités du poste..."
                                    {...register('missions.formation_alternant')}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center">
                    <div className="flex items-center gap-4 mb-8 group bg-slate-50/50 px-6 py-3 rounded-full border border-slate-100 cursor-pointer hover:border-brand/20 transition-all">
                        <input type="checkbox" className="w-5 h-5 accent-brand rounded cursor-pointer" required id="attestation-ent" />
                        <label htmlFor="attestation-ent" className="text-[12px] font-bold text-slate-500 cursor-pointer group-hover:text-slate-700">
                            J'atteste sur l'honneur l'exactitude des informations fournies supra <span className="req">*</span>
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            className="flex items-center gap-2 px-10 py-3 bg-white border border-slate-200 text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-[4px] hover:border-brand/40 hover:text-brand transition-all shadow-sm"
                            onClick={handleSaveDraft}
                        >
                            <Save size={16} />
                            Enregistrer
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-3 px-16 py-3 bg-brand text-white text-[11px] font-black uppercase tracking-widest rounded-[4px] hover:bg-[#5831ad] transition-all shadow-xl shadow-brand/20 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            {isSubmitting ? "ENVOI EN COURS..." : "VALIDER ET CONTINUER"}
                            {!isSubmitting && <ArrowRight size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default EntrepriseForm;