import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import PhoneInput from './ui/PhoneInput';
import { formatPhone, formatSIRET } from '../utils/formatters';
import {
    EMPLOYER_TYPE_OPTIONS,
    EMPLOYER_SPECIFIC_OPTIONS,
    MAITRE_DIPLOMA_OPTIONS,
    OPCO_OPTIONS,
    CONTRAT_TYPE_OPTIONS,
    DEROGATION_TYPE_OPTIONS,
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
        telephone: z.string().min(1, "Téléphone requis"),
        email: z.string().email("L'adresse e-mail est invalide")
    }),
    maitre_apprentissage: z.object({
        nom: z.string().min(2, "Le nom est requis"),
        prenom: z.string().min(2, "Le prénom est requis"),
        date_naissance: z.string().min(1, "La date de naissance est requise"),
        fonction: z.string().optional().or(z.literal("")),
        diplome_plus_eélevée: z.string().optional().or(z.literal("")),
        diplome: z.string().min(1, "Veuillez sélectionner le diplôme"),
        experience: z.string().optional().or(z.literal("")),
        telephone: z.string().optional().or(z.literal("")),
        email: z.string().email("L'adresse e-mail est invalide").optional().or(z.literal(""))
    }),
    opco: z.object({
        nom: z.string().min(1, "Veuillez sélectionner votre OPCO")
    }),
    formation: z.object({
        choisie: z.string().min(1, "Veuillez sélectionner la formation"),
        date_debut: z.string().optional().or(z.literal("")),
        date_fin: z.string().optional().or(z.literal("")),
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
        date_fin: z.string().min(1, "Date de fin requise"),
        duree_hebdomadaire: z.string().min(1, "Durée requise").regex(/^\d+:[0-5]\d$/, "Format invalide (HH:mm)"),
        poste_occupe: z.string().optional().or(z.literal("")),
        lieu_execution: z.string().optional().or(z.literal("")),

        pourcentage_smic1: z.number().optional(),
        pourcentage_smic1_2: z.number().nullable().optional(),
        montant_salaire_brut1: z.number().optional(),

        pourcentage_smic2: z.number().nullable().optional(),
        pourcentage_smic2_2: z.number().nullable().optional(),
        montant_salaire_brut2: z.number().nullable().optional(),

        pourcentage_smic3: z.number().nullable().optional(),
        pourcentage_smic3_2: z.number().nullable().optional(),
        montant_salaire_brut3: z.number().nullable().optional(),

        pourcentage_smic4: z.number().nullable().optional(),
        pourcentage_smic4_2: z.number().nullable().optional(),
        montant_salaire_brut4: z.number().nullable().optional(),

        date_conclusion: z.string().optional().or(z.literal("")),
        date_debut_execution: z.string().optional().or(z.literal("")),
        numero_deca_ancien_contrat: z.string().optional().or(z.literal("")),
        machines_dangereuses: z.string(),
        caisse_retraite: z.string().optional().or(z.literal("")),
        date_avenant: z.string().optional().or(z.literal("")),
        nombre_mois: z.number().optional(),

        // MAPPINGS DES PÉRIODES DE SALAIRE
        date_debut_1periode_1er_annee: z.string().optional().or(z.literal("")),
        date_fin_1periode_1er_annee: z.string().optional().or(z.literal("")),
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
        if (data.date_debut_execution && data.date_fin) {
            if (new Date(data.date_debut_execution) >= new Date(data.date_fin)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "La date de début d'exécution doit être avant la date de fin",
                    path: ["date_debut_execution"]
                });
            }
        }

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

        // 1ère année
        checkPeriod('date_debut_1periode_1er_annee', 'date_fin_1periode_1er_annee', '1ère période 1ère année', false);
        checkPeriod('date_debut_2periode_1er_annee', 'date_fin_2periode_1er_annee', '2ème période 1ère année', false);

        // Autres années
        for (let year = 2; year <= 4; year++) {
            const suffix = `${year === 2 ? '2eme' : year === 3 ? '3eme' : '4eme'}_annee`;
            checkPeriod(`date_debut_1periode_${suffix}`, `date_fin_1periode_${suffix}`, `1ère période ${year}ème année`);
            checkPeriod(`date_debut_2periode_${suffix}`, `date_fin_2periode_${suffix}`, `2ème période ${year}ème année`);
        }
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
    studentDateNaissance?: string;
}

const EntrepriseForm: React.FC<EntrepriseFormProps> = ({ onNext, studentRecordId, studentDateNaissance }) => {
    const { showToast, draftCompany, setDraftCompany, clearDraftCompany } = useAppStore();
    const { refresh: refreshCandidates } = useCandidates();
    const [activeSection, setActiveSection] = useState<string | null>('id');

    const toggleSection = (section: string) => {
        setActiveSection(prev => prev === section ? null : section);
    };

    // Only use draft if it belongs to the current student
    const validDraft = draftCompany?.record_id_etudiant === studentRecordId ? draftCompany : null;

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors }
    } = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            identification: validDraft?.identification || { raison_sociale: "", siret: "", code_ape_naf: "", type_employeur: "", employeur_specifique: "Aucun de ces cas", effectif: "", convention: "" },
            adresse: validDraft?.adresse || { num: "", voie: "", complement: "", code_postal: "", ville: "", telephone: "", email: "" },
            maitre_apprentissage: validDraft?.maitre_apprentissage || { nom: "", prenom: "", date_naissance: "", fonction: "", diplome_plus_eélevée: "", diplome: "", experience: "", telephone: "", email: "" },
            opco: validDraft?.opco || { nom: "" },
            formation: validDraft?.formation || { choisie: "", date_debut: "", date_fin: "", code_rncp: "", code_diplome: "", nb_heures: "", jours_cours: "" },
            cfa: validDraft?.cfa || {
                rush_school: "oui", entreprise: "non", denomination: "RUSH SCHOOL", uai: "0923033X",
                siret: "918 707 704 00014", adresse: "6 rue des Bateliers", complement: "", code_postal: "92110", commune: "CLICHY"
            },
            contrat: validDraft?.contrat || {
                type_contrat: "", type_derogation: "", date_debut: "", date_fin: "", duree_hebdomadaire: "35:00", poste_occupe: "",
                lieu_execution: "",
                pourcentage_smic1: null, pourcentage_smic1_2: null, montant_salaire_brut1: null,
                pourcentage_smic2: null, pourcentage_smic2_2: null, montant_salaire_brut2: null,
                pourcentage_smic3: null, pourcentage_smic3_2: null, montant_salaire_brut3: null,
                pourcentage_smic4: null, pourcentage_smic4_2: null, montant_salaire_brut4: null,
                date_conclusion: "", date_debut_execution: "",
                numero_deca_ancien_contrat: "", machines_dangereuses: "Non", caisse_retraite: "", date_avenant: "", nombre_mois: 12,
                date_debut_1periode_1er_annee: "", date_fin_1periode_1er_annee: "",
                date_debut_2periode_1er_annee: "", date_fin_2periode_1er_annee: "",
                date_debut_1periode_2eme_annee: "", date_fin_1periode_2eme_annee: "",
                date_debut_2periode_2eme_annee: "", date_fin_2periode_2eme_annee: "",
                date_debut_1periode_3eme_annee: "", date_fin_1periode_3eme_annee: "",
                date_debut_2periode_3eme_annee: "", date_fin_2periode_3eme_annee: "",
                date_debut_1periode_4eme_annee: "", date_fin_1periode_4eme_annee: "",
                date_debut_2periode_4eme_annee: "", date_fin_2periode_4eme_annee: ""
            },
            missions: validDraft?.missions || { formation_alternant: "", selectionnees: [] as string[] },
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

    const parseSharedDate = (dStr: string) => {
        if (!dStr) return new Date("");
        if (dStr.includes('/')) {
            const parts = dStr.split('/');
            if (parts.length === 3) {
                // assume DD/MM/YYYY
                return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }
        }
        return new Date(dStr);
    };

    // Auto-calculate SMIC % from student birth date at a given period start date
    const getSmicPercentage = (birthDate: string | undefined, periodStartDate: string, yearNumber: number): number => {
        if (!birthDate || !periodStartDate) return 0;
        const birth = parseSharedDate(birthDate);
        const periodStart = parseSharedDate(periodStartDate);
        if (isNaN(birth.getTime()) || isNaN(periodStart.getTime())) return 0;

        let age = periodStart.getFullYear() - birth.getFullYear();
        const m = periodStart.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && periodStart.getDate() < birth.getDate())) age--;

        if (age >= 26) return 100;
        if (age >= 21) return yearNumber === 1 ? 53 : yearNumber === 2 ? 61 : 78;
        if (age >= 18) return yearNumber === 1 ? 43 : yearNumber === 2 ? 51 : 67;
        return yearNumber === 1 ? 27 : yearNumber === 2 ? 39 : 55; // 16-17
    };

    const smicBase = 1823.03;

    // Helper to get age bracket from a date
    const getAgeBracket = (birthDate: string | undefined, refDate: string | undefined): '16-17' | '18-20' | '21-25' | '26+' | null => {
        if (!birthDate || !refDate) return null;
        const birth = parseSharedDate(birthDate);
        const ref = parseSharedDate(refDate);
        if (isNaN(birth.getTime()) || isNaN(ref.getTime())) return null;

        let age = ref.getFullYear() - birth.getFullYear();
        const m = ref.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--;

        if (age >= 26) return '26+';
        if (age >= 21) return '21-25';
        if (age >= 18) return '18-20';
        return '16-17';
    };

    // Helper to get raw age from dates
    const getRawAge = (birthDate: string | undefined, refDate: string | undefined): number | null => {
        if (!birthDate || !refDate) return null;
        const birth = parseSharedDate(birthDate);
        const ref = parseSharedDate(refDate);
        if (isNaN(birth.getTime()) || isNaN(ref.getTime())) return null;
        let age = ref.getFullYear() - birth.getFullYear();
        const m = ref.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--;
        return age;
    };

    const dateDebutGlobal = watch('contrat.date_debut_execution');
    const dateFinGlobal = watch('contrat.date_fin');

    const parseIsoDate = (value: string): Date | null => {
        if (!value) return null;
        const d = new Date(`${value}T00:00:00`);
        return Number.isNaN(d.getTime()) ? null : d;
    };

    const formatIsoDate = (d: Date): string => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const addDays = (d: Date, days: number): Date => {
        const next = new Date(d);
        next.setDate(next.getDate() + days);
        return next;
    };

    const addYears = (d: Date, years: number): Date => {
        const next = new Date(d);
        next.setFullYear(next.getFullYear() + years);
        return next;
    };

    const minDate = (a: Date, b: Date): Date => (a <= b ? a : b);

    const applyQuickFill = useCallback((startDate: string, durationStr: string, contractEndDate: string, birthDate?: string) => {
        if (!startDate || !durationStr) return;
        const durationYears = parseInt(durationStr, 10);
        const start = parseIsoDate(startDate);
        if (!start || Number.isNaN(durationYears) || durationYears < 1) return;

        const inferredEnd = addDays(addYears(start, durationYears), -1);
        const explicitEnd = parseIsoDate(contractEndDate);
        const effectiveEnd = explicitEnd && explicitEnd >= start ? explicitEnd : inferredEnd;

        const years = ['1er', '2eme', '3eme', '4eme'] as const;
        let currentStart = new Date(start);

        for (let i = 0; i < 4; i++) {
            const suffix = years[i];

            if (i >= durationYears || currentStart > effectiveEnd) {
                setValue(`contrat.date_debut_1periode_${suffix}_annee` as any, "");
                setValue(`contrat.date_fin_1periode_${suffix}_annee` as any, "");
                setValue(`contrat.date_debut_2periode_${suffix}_annee` as any, "");
                setValue(`contrat.date_fin_2periode_${suffix}_annee` as any, "");
                continue;
            }

            const yearStart = new Date(currentStart);
            const nominalYearEnd = addDays(addYears(yearStart, 1), -1);
            const yearEnd = minDate(nominalYearEnd, effectiveEnd);
            const yearNumber = i + 1;

            const rateAtStart = getRateFromBracket(getAgeBracket(birthDate, formatIsoDate(yearStart)), yearNumber);
            let splitStart: Date | null = null;

            if (birthDate) {
                const birth = parseIsoDate(birthDate);
                if (birth) {
                    const month = birth.getMonth();
                    const day = birth.getDate();

                    let candidate = new Date(yearStart.getFullYear(), month, day);
                    if (candidate < yearStart) {
                        candidate = new Date(yearStart.getFullYear() + 1, month, day);
                    }

                    if (candidate >= yearStart && candidate <= yearEnd) {
                        const rateAfterBirthday = getRateFromBracket(getAgeBracket(birthDate, formatIsoDate(candidate)), yearNumber);
                        if (rateAfterBirthday !== rateAtStart) {
                            splitStart = candidate;
                        }
                    }
                }
            }

            if (splitStart) {
                const p1End = addDays(splitStart, -1);
                setValue(`contrat.date_debut_1periode_${suffix}_annee` as any, formatIsoDate(yearStart));
                setValue(`contrat.date_fin_1periode_${suffix}_annee` as any, formatIsoDate(p1End));
                setValue(`contrat.date_debut_2periode_${suffix}_annee` as any, formatIsoDate(splitStart));
                setValue(`contrat.date_fin_2periode_${suffix}_annee` as any, formatIsoDate(yearEnd));
            } else {
                setValue(`contrat.date_debut_1periode_${suffix}_annee` as any, formatIsoDate(yearStart));
                setValue(`contrat.date_fin_1periode_${suffix}_annee` as any, formatIsoDate(yearEnd));
                setValue(`contrat.date_debut_2periode_${suffix}_annee` as any, "");
                setValue(`contrat.date_fin_2periode_${suffix}_annee` as any, "");
            }

            currentStart = addDays(yearEnd, 1);
        }
    }, [setValue]);

    useEffect(() => {
        if (!dateDebutGlobal || !dateFinGlobal) return;
        const start = parseIsoDate(dateDebutGlobal);
        const end = parseIsoDate(dateFinGlobal);
        if (!start || !end || end < start) return;
        const durationYears = Math.max(1, Math.ceil((end.getTime() - start.getTime() + 1) / (365.25 * 24 * 60 * 60 * 1000)));
        applyQuickFill(dateDebutGlobal, String(durationYears), dateFinGlobal, studentDateNaissance);
    }, [dateDebutGlobal, dateFinGlobal, studentDateNaissance, applyQuickFill]);

    // Helper to get percentage from bracket and year
    const getRateFromBracket = (bracket: string | null, year: number): number => {
        if (!bracket) return 0;
        if (bracket === '26+') return 100;
        if (bracket === '21-25') return year === 1 ? 53 : year === 2 ? 61 : 78;
        if (bracket === '18-20') return year === 1 ? 43 : year === 2 ? 51 : 67;
        return year === 1 ? 27 : year === 2 ? 39 : 55;
    };

    // Stringify dates to force useMemo update even if object reference is cached by react-hook-form
    const stringifiedContratDates = JSON.stringify([
        formData.contrat?.date_debut_1periode_1er_annee, formData.contrat?.date_debut_2periode_1er_annee,
        formData.contrat?.date_debut_1periode_2eme_annee, formData.contrat?.date_debut_2periode_2eme_annee,
        formData.contrat?.date_debut_1periode_3eme_annee, formData.contrat?.date_debut_2periode_3eme_annee,
        formData.contrat?.date_debut_1periode_4eme_annee, formData.contrat?.date_debut_2periode_4eme_annee
    ]);

    // Compute SMIC % for each period from watcher
    const computedPeriods = React.useMemo(() => {
        const c = formData.contrat;
        const bd = studentDateNaissance;

        const getRate = (d: string | undefined, year: number) => {
            if (!d || d === "" || !bd) return 0;
            const bracket = getAgeBracket(bd, d);
            return getRateFromBracket(bracket, year);
        };

        return {
            y1p1: getRate(c?.date_debut_1periode_1er_annee || c?.date_debut_execution, 1),
            y1p2: getRate(c?.date_debut_2periode_1er_annee, 1),

            y2p1: getRate(c?.date_debut_1periode_2eme_annee, 2),
            y2p2: getRate(c?.date_debut_2periode_2eme_annee, 2),

            y3p1: getRate(c?.date_debut_1periode_3eme_annee, 3),
            y3p2: getRate(c?.date_debut_2periode_3eme_annee, 3),

            y4p1: getRate(c?.date_debut_1periode_4eme_annee, 4),
            y4p2: getRate(c?.date_debut_2periode_4eme_annee, 4),
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentDateNaissance, stringifiedContratDates]);

    // Push computed SMIC values into form state whenever they change
    useEffect(() => {
        // Année 1
        setValue('contrat.pourcentage_smic1', computedPeriods.y1p1 || null, { shouldValidate: false });
        setValue('contrat.pourcentage_smic1_2', computedPeriods.y1p2 || null, { shouldValidate: false });
        setValue('contrat.montant_salaire_brut1', computedPeriods.y1p1 ? parseFloat(((smicBase * computedPeriods.y1p1) / 100).toFixed(2)) : null, { shouldValidate: false });

        // Années 2-4 -> utilisent P1 pour le salaire brut (le 2ème pourcentage est informatif)
        setValue('contrat.pourcentage_smic2', computedPeriods.y2p1 || null, { shouldValidate: false });
        setValue('contrat.pourcentage_smic2_2', computedPeriods.y2p2 || null, { shouldValidate: false });
        setValue('contrat.montant_salaire_brut2', computedPeriods.y2p1 ? parseFloat(((smicBase * computedPeriods.y2p1) / 100).toFixed(2)) : null, { shouldValidate: false });

        setValue('contrat.pourcentage_smic3', computedPeriods.y3p1 || null, { shouldValidate: false });
        setValue('contrat.pourcentage_smic3_2', computedPeriods.y3p2 || null, { shouldValidate: false });
        setValue('contrat.montant_salaire_brut3', computedPeriods.y3p1 ? parseFloat(((smicBase * computedPeriods.y3p1) / 100).toFixed(2)) : null, { shouldValidate: false });

        setValue('contrat.pourcentage_smic4', computedPeriods.y4p1 || null, { shouldValidate: false });
        setValue('contrat.pourcentage_smic4_2', computedPeriods.y4p2 || null, { shouldValidate: false });
        setValue('contrat.montant_salaire_brut4', computedPeriods.y4p1 ? parseFloat(((smicBase * computedPeriods.y4p1) / 100).toFixed(2)) : null, { shouldValidate: false });
    }, [computedPeriods, setValue]);

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

            // Trigger document generation automatically after completion
            if (studentRecordId) {
                showToast("Génération automatique des documents (CERFA, Convention, Fiche)...", "info");

                Promise.allSettled([
                    api.generateFicheRenseignement(studentRecordId),
                    api.generateCerfa(studentRecordId),
                    api.generateConventionApprentissage(studentRecordId)
                ]).then((results) => {
                    const rejectedCount = results.filter(r => r.status === 'rejected').length;
                    if (rejectedCount > 0) {
                        showToast(`${rejectedCount} document(s) n'ont pas pu être générés. Vous pouvez les générer manuellement depuis le dashboard.`, "info");
                    } else {
                        showToast("Documents générés avec succès !", "success");
                    }
                }).catch(err => {
                    console.error('Error during automated document generation:', err);
                });
            }

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
        const userRole = localStorage.getItem('userRole') || 'admission';
        await submitCompany(finalData as any, userRole);
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
                                <Input label="Voie" required placeholder="Rue, avenue, bouélevéard..." error={errors.adresse?.voie?.message} {...register('adresse.voie')} />
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
                                <PhoneInput
                                    label="Téléphone"
                                    required
                                    error={errors.adresse?.telephone?.message}
                                    value={watch('adresse.telephone')}
                                    onChange={(val) => setValue('adresse.telephone', val, { shouldValidate: true })}
                                    onBlur={() => trigger('adresse.telephone')}
                                />
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
                                <Input label="Nom" required placeholder="Nom" error={errors.maitre_apprentissage?.nom?.message} {...register('maitre_apprentissage.nom', { onChange: (e) => { e.target.value = e.target.value.toUpperCase(); } })} />
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
                                <Input
