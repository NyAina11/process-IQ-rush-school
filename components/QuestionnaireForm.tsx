import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Save, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { StudentFormData } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useApi } from '../hooks/useApi';
import Button from './ui/Button';

import Input from './ui/Input';
import Select from './ui/Select';
import { formatPhone, formatNIR } from '../utils/formatters';
import {
    NATIONALITY_OPTIONS,
    DEPARTMENT_OPTIONS,
    SITUATION_BEFORE_CONTRACT_OPTIONS,
    REGIME_SOCIAL_OPTIONS,
    DIPLOMA_PREPARED_OPTIONS,
    DETAILED_DIPLOMA_OPTIONS,
    LAST_CLASS_OPTIONS,
    HIGHEST_DIPLOMA_OPTIONS,
    FORMATION_SOUHAITEE_OPTIONS,
    KNOW_RUSH_SCHOOL_OPTIONS
} from '../constants/formOptions';
import Card from './ui/Card';


// Validation Schema with Zod
const studentSchema = z.object({
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    nom_naissance: z.string().min(2, "Le nom de naissance est requis"),
    nom_usage: z.string().optional().or(z.literal("")),
    sexe: z.string().min(1, "Veuillez sélectionner votre sexe"),
    date_naissance: z.string().min(1, "La date de naissance est requise").refine(val => {
        if (!val) return true;
        const birth = new Date(val);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age >= 8;
    }, { message: "Vous devez avoir au moins 8 ans pour vous inscrire" }),
    nationalite: z.string().min(1, "Veuillez sélectionner votre nationalité"),
    commune_naissance: z.string().min(1, "La commune de naissance est requise"),
    departement: z.string().min(1, "Le département est requis"),
    num_residence: z.string().optional().or(z.literal("")),
    rue_residence: z.string().min(2, "La rue est requise"),
    complement_residence: z.string().optional().or(z.literal("")),
    adresse_residence: z.string().optional().or(z.literal("")),
    code_postal: z.string().regex(/^[0-9]{5}$/, "Le code postal doit contenir 5 chiffres"),
    ville: z.string().min(1, "La ville est requise"),
    email: z.string().email("L'adresse e-mail est invalide"),
    telephone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Numéro de téléphone français invalide"),
    nir: z.string().optional().or(z.literal("")).refine(val => {
        if (!val) return true;
        const cleaned = val.replace(/\s/g, '');
        return /^[0-9]{15}$/.test(cleaned);
    }, { message: "Le NIR doit contenir 15 chiffres" }),
    situation: z.string().min(1, "Veuillez sélectionner votre situation"),
    regime_social: z.string().optional().or(z.literal("")),
    declare_inscription_sportif_haut_niveau: z.boolean(),
    declare_avoir_projet_creation_reprise_entreprise: z.boolean(),
    declare_travailleur_handicape: z.boolean(),
    alternance: z.boolean(),
    dernier_diplome_prepare: z.string().optional().or(z.literal("")),
    derniere_classe: z.string().min(1, "Veuillez sélectionner votre dernière classe"),
    intitulePrecisDernierDiplome: z.string().optional().or(z.literal("")),
    bac: z.string().min(1, "Veuillez sélectionner votre niveau d'études"),
    formation_souhaitee: z.string().min(1, "Veuillez sélectionner une formation"),
    date_de_visite: z.string().optional().or(z.literal("")),
    date_de_reglement: z.string().optional().or(z.literal("")),
    entreprise_d_accueil: z.string().optional().or(z.literal("")),
    connaissance_rush_how: z.string().optional().or(z.literal("")),
    motivation_projet_professionnel: z.string().optional().or(z.literal("")),
    agreement: z.boolean().refine(val => val === true, {
        message: "Vous devez attester sur l'honneur l'exactitude des informations"
    }),

    add_second_representative: z.boolean().optional(),
    representant_legal_1: z.object({
        nom: z.string().optional(),
        prenom: z.string().optional(),
        lien_parente: z.string().optional(),
        numero: z.string().optional(),
        voie: z.string().optional(),
        complement: z.string().optional(),
        code_postal: z.string().optional(),
        ville: z.string().optional(),
        email: z.string().optional(),
        telephone: z.string().optional(),
    }).optional(),
    representant_legal_2: z.object({
        nom: z.string().optional(),
        prenom: z.string().optional(),
        lien_parente: z.string().optional(),
        numero: z.string().optional(),
        voie: z.string().optional(),
        complement: z.string().optional(),
        code_postal: z.string().optional(),
        ville: z.string().optional(),
        email: z.string().optional(),
        telephone: z.string().optional(),
    }).optional()
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface QuestionnaireFormProps {
    onNext: (data: any) => void;
    onBack?: () => void;
    initialData?: Partial<StudentFormValues>;
}

const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({ onNext, initialData }) => {
    const { showToast, draftStudent, setDraftStudent, clearDraftStudent } = useAppStore();
    const [activeSection, setActiveSection] = useState<string | null>('personal');

    // Merge default values: initialData takes precedence over draftStudent (or draftStudent over initialData? Usually draft is fresher if user edited)
    // Here we assume if initialData is provided (from backend), we want to use it, unless draft is newer? 
    // Actually, usually when opening a student profile, we want to see the backend data.
    const formDefaults = initialData || draftStudent;

    const toggleSection = (section: string) => {
        setActiveSection(prev => prev === section ? null : section);
    };

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<StudentFormValues>({
        resolver: zodResolver(studentSchema),
        defaultValues: {
            prenom: formDefaults?.prenom || '',
            nom_naissance: formDefaults?.nom_naissance || '',
            nom_usage: formDefaults?.nom_usage || '',
            sexe: formDefaults?.sexe || '',
            date_naissance: formDefaults?.date_naissance || '',
            nationalite: formDefaults?.nationalite || '',
            commune_naissance: formDefaults?.commune_naissance || '',
            departement: formDefaults?.departement || '',
            num_residence: formDefaults?.num_residence || '',
            rue_residence: formDefaults?.rue_residence || '',
            complement_residence: formDefaults?.complement_residence || '',
            adresse_residence: formDefaults?.adresse_residence || '',
            code_postal: formDefaults?.code_postal || '',
            ville: formDefaults?.ville || '',
            email: formDefaults?.email || '',
            telephone: formDefaults?.telephone || '',
            nir: formDefaults?.nir || '',
            situation: formDefaults?.situation || '',
            regime_social: formDefaults?.regime_social || '',
            declare_inscription_sportif_haut_niveau: formDefaults?.declare_inscription_sportif_haut_niveau || false,
            declare_avoir_projet_creation_reprise_entreprise: formDefaults?.declare_avoir_projet_creation_reprise_entreprise || false,
            declare_travailleur_handicape: formDefaults?.declare_travailleur_handicape || false,
            alternance: formDefaults?.alternance || false,
            dernier_diplome_prepare: formDefaults?.dernier_diplome_prepare || '',
            derniere_classe: formDefaults?.derniere_classe || '',
            intitulePrecisDernierDiplome: formDefaults?.intitulePrecisDernierDiplome || '',
            bac: formDefaults?.bac || '',
            formation_souhaitee: formDefaults?.formation_souhaitee || '',
            date_de_visite: formDefaults?.date_de_visite || '',
            date_de_reglement: formDefaults?.date_de_reglement || '',
            entreprise_d_accueil: formDefaults?.entreprise_d_accueil || '',
            connaissance_rush_how: formDefaults?.connaissance_rush_how || '',
            motivation_projet_professionnel: formDefaults?.motivation_projet_professionnel || '',
            agreement: formDefaults?.agreement || false,
            add_second_representative: formDefaults?.add_second_representative || false,
            representant_legal_1: formDefaults?.representant_legal_1 || { nom: '', prenom: '', lien_parente: '', numero: '', voie: '', complement: '', code_postal: '', ville: '', email: '', telephone: '' },
            representant_legal_2: formDefaults?.representant_legal_2 || { nom: '', prenom: '', lien_parente: '', numero: '', voie: '', complement: '', code_postal: '', ville: '', email: '', telephone: '' }
        }
    });

    // Reset form when initialData is loaded
    React.useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    // Auto-save draft
    React.useEffect(() => {
        const subscription = watch((value) => setDraftStudent(value));
        return () => subscription.unsubscribe();
    }, [watch, setDraftStudent]);

    const { execute: generateCerfaApi } = useApi(api.generateCerfa, {
        silentLoading: true // Don't block UI with multiple loaders
    });

    const { execute: submitStudent, loading: isSubmitting } = useApi(api.submitStudent, {
        successMessage: "Inscription enregistrée avec succès !",
        onSuccess: async (response) => {
            const recordId = response?.record_id || response?.id;
            if (recordId) {
                localStorage.setItem('candidateRecordId', recordId);
                // Trigger pre-generations in background with a 5s delay for Airtable/Backend sync
                setTimeout(() => {
                    console.log('🕒 Triggering delayed document generation for:', recordId);
                    // Cerfa
                    api.generateCerfa(recordId).catch(err => console.error("CERFA pre-generation failed:", err));
                    // Certificat Scolarité
                    api.generateCertificatScolarite(recordId).catch(err => console.error("Certificat Scolarité pre-generation failed:", err));
                }, 5000);
            }
            clearDraftStudent();
            onNext(response);
        },
        errorMessage: "Erreur lors de l'enregistrement. Veuillez réessayer."
    });

    const onSubmit = async (data: StudentFormValues) => {
        await submitStudent(data as any);
    };

    const onError = (errors: any) => {
        const errorCount = Object.keys(errors).length;
        showToast(`Veuillez corriger les ${errorCount} erreur(s) avant de continuer.`, "error");

        // Auto-expand the first section with errors
        const sections = [
            { id: 'personal', fields: ['prenom', 'nom_naissance', 'nom_usage', 'sexe', 'date_naissance', 'nationalite', 'commune_naissance', 'departement'] },
            { id: 'contact', fields: ['num_residence', 'rue_residence', 'complement_residence', 'code_postal', 'ville', 'email', 'telephone', 'nir'] },
            { id: 'legal', fields: ['representant_legal_1', 'representant_legal_2'] },
            { id: 'situation', fields: ['situation', 'regime_social', 'declare_inscription_sportif_haut_niveau', 'declare_avoir_projet_creation_reprise_entreprise', 'declare_travailleur_handicape', 'alternance'] },
            { id: 'school', fields: ['dernier_diplome_prepare', 'derniere_classe', 'intitulePrecisDernierDiplome', 'bac'] },
            { id: 'desire', fields: ['formation_souhaitee', 'date_de_visite', 'date_de_reglement', 'entreprise_d_accueil'] },
            { id: 'extra', fields: ['connaissance_rush_how', 'motivation_projet_professionnel'] }
        ];

        for (const section of sections) {
            if (section.id === 'legal' && !isMinor) continue;

            const hasError = section.fields.some(field => errors[field]);
            if (hasError) {
                setActiveSection(section.id);
                break;
            }
        }
    };

    const selectedSexe = watch('sexe');
    const selectedEntreprise = watch('entreprise_d_accueil');
    const declarations = watch();
    const dateNaissance = watch('date_naissance');
    const addSecondRep = watch('add_second_representative');

    // Helper to check if any field in a section has an error
    const hasSectionError = (sectionFields: string[]) => {
        return sectionFields.some(field => {
            const fieldError = (errors as any)[field];
            return !!fieldError;
        });
    };

    const isMinor = React.useMemo(() => {
        if (!dateNaissance) return false;
        const birth = new Date(dateNaissance);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age < 18;
    }, [dateNaissance]);

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)} className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 relative overflow-hidden animate-slide-in">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-primary to-violet-500"></div>

            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand to-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand/20 shrink-0">
                        <User size={32} />
                    </div>
                    <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
                    <div className="flex items-center gap-3">
                        <img src="/images/logo-process-iq.png" alt="Process IQ" className="h-10 w-auto" />
                        <span className="text-xl font-bold text-slate-900 tracking-tight">ProcessIQ</span>
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Fiche d'inscription étudiant</h2>
                    <p className="text-slate-500">Complétez toutes les informations pour finaliser votre dossier</p>
                </div>
            </div>

            <div className="space-y-6">
                <Card
                    step={1}
                    title="Informations personnelles"
                    collapsible
                    isOpen={activeSection === 'personal'}
                    onToggle={() => toggleSection('personal')}
                    hasError={hasSectionError(['prenom', 'nom_naissance', 'nom_usage', 'sexe', 'date_naissance', 'nationalite', 'commune_naissance', 'departement'])}
                >
                    <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-12 md:col-span-6">
                            <Input label="Prénom" required placeholder="Votre prénom" error={errors.prenom?.message} {...register('prenom')} />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Input label="Nom de naissance" required placeholder="Votre nom de naissance" error={errors.nom_naissance?.message} {...register('nom_naissance')} />
                        </div>
                        <div className="col-span-12">
                            <Input label="Nom d'usage" placeholder="Si différent du nom de naissance" {...register('nom_usage')} />
                        </div>
                        <div className="col-span-12">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Sexe *</label>
                            <div className="flex gap-3 flex-wrap">
                                {['Féminin', 'Masculin'].map((val, idx) => (
                                    <label key={val} className="relative cursor-pointer group flex-1 min-w-[120px]">
                                        <input className="peer sr-only" type="radio" value={val} {...register('sexe')} />
                                        <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all ${selectedSexe === val ? 'bg-brand/10 border-brand shadow-brand/10' : 'bg-slate-50/50 border-transparent hover:border-slate-200'}`}>
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${selectedSexe === val ? 'bg-brand text-white' : 'bg-slate-200 text-slate-400'}`}>{String.fromCharCode(65 + idx)}</span>
                                            <span className="font-bold text-slate-700">{val}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.sexe && <p className="mt-1.5 text-rose-500 text-[11px] font-black uppercase tracking-wider">{errors.sexe.message}</p>}
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Input label="Date de naissance" required type="date" error={errors.date_naissance?.message} {...register('date_naissance')} />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Select
                                label="Nationalité"
                                required
                                error={errors.nationalite?.message}
                                {...register('nationalite')}
                                options={NATIONALITY_OPTIONS}
                                placeholder="Sélectionnez"

                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Input label="Commune de naissance" required placeholder="Ville de naissance" error={errors.commune_naissance?.message} {...register('commune_naissance')} />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Select
                                label="Département de naissance"
                                required
                                error={errors.departement?.message}
                                {...register('departement')}
                                options={DEPARTMENT_OPTIONS}
                                placeholder="Sélectionnez"
                            />
                        </div>
                    </div>
                </Card>

                <Card
                    step={2}
                    title="Coordonnées"
                    collapsible
                    isOpen={activeSection === 'contact'}
                    onToggle={() => toggleSection('contact')}
                    hasError={hasSectionError(['num_residence', 'rue_residence', 'complement_residence', 'code_postal', 'ville', 'email', 'telephone', 'nir'])}
                >
                    <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-12 md:col-span-3">
                            <Input label="Numéro" placeholder="N°" {...register('num_residence')} />
                        </div>
                        <div className="col-span-12 md:col-span-9">
                            <Input label="Rue" required placeholder="Nom de la rue, avenue..." error={errors.rue_residence?.message} {...register('rue_residence')} />
                        </div>
                        <div className="col-span-12">
                            <Input label="Complément d'adresse" placeholder="Bâtiment, escalier, appartement..." {...register('complement_residence')} />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <Input label="Code postal" required placeholder="Ex: 75001" error={errors.code_postal?.message} {...register('code_postal')} />
                        </div>
                        <div className="col-span-12 md:col-span-8">
                            <Input label="Ville" required placeholder="Ville de résidence" error={errors.ville?.message} {...register('ville')} />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Input label="E-mail" required type="email" placeholder="votre@email.com" error={errors.email?.message} {...register('email')} />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Input label="Téléphone" required type="tel" placeholder="06 12 34 56 78" error={errors.telephone?.message} {...register('telephone', {
                                onChange: (e) => {
                                    e.target.value = formatPhone(e.target.value);
                                }
                            })} />
                        </div>
                        <div className="col-span-12">
                            <Input label="NIR (Numéro de Sécurité Sociale)" placeholder="1 85 12 75 108 123 45" error={errors.nir?.message} {...register('nir', {
                                onChange: (e) => {
                                    e.target.value = formatNIR(e.target.value);
                                }
                            })} />
                        </div>
                    </div>
                </Card>

                {isMinor && (
                    <Card
                        step={3}
                        title="Représentants Légaux"
                        collapsible
                        isOpen={activeSection === 'legal'}
                        onToggle={() => toggleSection('legal')}
                        hasError={hasSectionError(['representant_legal_1', 'representant_legal_2'])}
                    >
                        <div className="space-y-8">
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Représentant légal 1</h3>
                                <div className="grid grid-cols-12 gap-5">
                                    <div className="col-span-12 md:col-span-6">
                                        <Input label="Nom" required={isMinor} {...register('representant_legal_1.nom')} />
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <Input label="Prénom" required={isMinor} {...register('representant_legal_1.prenom')} />
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <Input label="Lien de parenté" placeholder="Père, Mère, Tuteur..." required={isMinor} {...register('representant_legal_1.lien_parente')} />
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <Input label="Téléphone" required={isMinor} type="tel" {...register('representant_legal_1.telephone', {
                                            onChange: (e) => {
                                                e.target.value = formatPhone(e.target.value);
                                            }
                                        })} />
                                    </div>
                                    <div className="col-span-12 md:col-span-4">
                                        <Input label="Numéro" required={isMinor} {...register('representant_legal_1.numero')} />
                                    </div>
                                    <div className="col-span-12 md:col-span-8">
                                        <Input label="Voie" required={isMinor} {...register('representant_legal_1.voie')} />
                                    </div>
                                    <div className="col-span-12">
                                        <Input label="Complément d'adresse" {...register('representant_legal_1.complement')} />
                                    </div>
                                    <div className="col-span-12 md:col-span-4">
                                        <Input label="Code postal" required={isMinor} {...register('representant_legal_1.code_postal')} />
                                    </div>
                                    <div className="col-span-12 md:col-span-8">
                                        <Input label="Ville" required={isMinor} {...register('representant_legal_1.ville')} />
                                    </div>
                                    <div className="col-span-12">
                                        <Input label="Email" required={isMinor} type="email" {...register('representant_legal_1.email')} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-4">
                                <input
                                    type="checkbox"
                                    id="add_second_rep"
                                    className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary"
                                    {...register('add_second_representative')}
                                />
                                <label htmlFor="add_second_rep" className="text-slate-700 font-bold text-sm cursor-pointer select-none">
                                    Ajouter un second représentant légal
                                </label>
                            </div>

                            {addSecondRep && (
                                <div className="animate-fade-in bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Représentant légal 2</h3>
                                    <div className="grid grid-cols-12 gap-5">
                                        <div className="col-span-12 md:col-span-6">
                                            <Input label="Nom" {...register('representant_legal_2.nom')} />
                                        </div>
                                        <div className="col-span-12 md:col-span-6">
                                            <Input label="Prénom" {...register('representant_legal_2.prenom')} />
                                        </div>
                                        <div className="col-span-12 md:col-span-6">
                                            <Input label="Lien de parenté" placeholder="Père, Mère, Tuteur..." {...register('representant_legal_2.lien_parente')} />
                                        </div>
                                        <div className="col-span-12 md:col-span-6">
                                            <Input label="Téléphone" type="tel" {...register('representant_legal_2.telephone', {
                                                onChange: (e) => {
                                                    e.target.value = formatPhone(e.target.value);
                                                }
                                            })} />
                                        </div>
                                        <div className="col-span-12 md:col-span-4">
                                            <Input label="Numéro" {...register('representant_legal_2.numero')} />
                                        </div>
                                        <div className="col-span-12 md:col-span-8">
                                            <Input label="Voie" {...register('representant_legal_2.voie')} />
                                        </div>
                                        <div className="col-span-12">
                                            <Input label="Complément d'adresse" {...register('representant_legal_2.complement')} />
                                        </div>
                                        <div className="col-span-12 md:col-span-4">
                                            <Input label="Code postal" {...register('representant_legal_2.code_postal')} />
                                        </div>
                                        <div className="col-span-12 md:col-span-8">
                                            <Input label="Ville" {...register('representant_legal_2.ville')} />
                                        </div>
                                        <div className="col-span-12">
                                            <Input label="Email" type="email" {...register('representant_legal_2.email')} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                <Card
                    step={isMinor ? 4 : 3}
                    title="Situation & Déclarations"
                    collapsible
                    isOpen={activeSection === 'situation'}
                    onToggle={() => toggleSection('situation')}
                    hasError={hasSectionError(['situation', 'regime_social', 'declare_inscription_sportif_haut_niveau', 'declare_avoir_projet_creation_reprise_entreprise', 'declare_travailleur_handicape', 'alternance'])}
                >
                    <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-12">
                            <Select
                                label="Situation avant le contrat"
                                required
                                error={errors.situation?.message}
                                {...register('situation')}
                                options={SITUATION_BEFORE_CONTRACT_OPTIONS}
                                placeholder="Sélectionnez votre situation"

                            />
                        </div>
                        <div className="col-span-12">
                            <Select
                                label="Régime social"
                                {...register('regime_social')}
                                options={REGIME_SOCIAL_OPTIONS}
                                placeholder="Sélectionnez"

                            />
                        </div>
                        {[{ "label": "Déclare être inscrit(e) sur la liste des sportifs de haut niveau", "name": "declare_inscription_sportif_haut_niveau" },
                        { "label": "Déclare avoir un projet de création ou de reprise d'entreprise", "name": "declare_avoir_projet_creation_reprise_entreprise" },
                        { "label": "Déclare bénéficier de la reconnaissance travailleur handicapé (RQTH)", "name": "declare_travailleur_handicape" },
                        { "label": "Alternance", "name": "alternance" }
                        ].map((item) => (
                            <div key={item.name} className="col-span-12 space-y-4 pt-2">
                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                    <label className="block text-sm font-bold text-slate-800 mb-4">{item.label}</label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setValue(item.name as any, true)}
                                            className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${declarations[item.name as keyof StudentFormValues] === true ? 'bg-brand/10 border-brand shadow-brand/10' : 'bg-white border-transparent hover:border-slate-200'}`}
                                        >
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${declarations[item.name as keyof StudentFormValues] === true ? 'bg-brand text-white' : 'bg-slate-100 text-slate-400'}`}>A</span>
                                            <span className="font-bold text-slate-700">Oui</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setValue(item.name as any, false)}
                                            className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${declarations[item.name as keyof StudentFormValues] === false ? 'bg-brand/10 border-brand shadow-brand/10' : 'bg-white border-transparent hover:border-slate-200'}`}
                                        >
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${declarations[item.name as keyof StudentFormValues] === false ? 'bg-brand text-white' : 'bg-slate-100 text-slate-400'}`}>B</span>
                                            <span className="font-bold text-slate-700">Non</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card
                    step={isMinor ? 5 : 4}
                    title="Parcours scolaire"
                    collapsible
                    isOpen={activeSection === 'school'}
                    onToggle={() => toggleSection('school')}
                    hasError={hasSectionError(['dernier_diplome_prepare', 'derniere_classe', 'intitulePrecisDernierDiplome', 'bac'])}
                >
                    <div className="grid grid-cols-12 gap-5">

                        <div className="col-span-12">
                            <Select
                                label="Dernière année ou classe suivie"
                                required
                                error={errors.derniere_classe?.message}
                                {...register('derniere_classe')}
                                options={LAST_CLASS_OPTIONS}
                                placeholder="Sélectionnez"

                            />
                        </div>
                        <div className="col-span-12">
                            <Select
                                label="Intitulé précis du dernier diplôme ou titre préparé"
                                {...register('intitulePrecisDernierDiplome')}
                                options={DETAILED_DIPLOMA_OPTIONS}
                                placeholder="Sélectionnez"

                            />
                        </div>
                        <div className="col-span-12">
                            <Select
                                label="Diplôme ou titre le plus élevé obtenu"
                                required
                                error={errors.bac?.message}
                                {...register('bac')}
                                options={HIGHEST_DIPLOMA_OPTIONS}
                                placeholder="Sélectionnez votre diplôme"

                            />
                        </div>
                    </div>
                </Card>

                <Card
                    step={isMinor ? 6 : 5}
                    title="Formation souhaitée"
                    collapsible
                    isOpen={activeSection === 'desire'}
                    onToggle={() => toggleSection('desire')}
                    hasError={hasSectionError(['formation_souhaitee', 'date_de_visite', 'date_de_reglement', 'entreprise_d_accueil'])}
                >
                    <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-12">
                            <Select
                                label="Formation"
                                required
                                error={errors.formation_souhaitee?.message}
                                {...register('formation_souhaitee')}
                                options={FORMATION_SOUHAITEE_OPTIONS}
                                placeholder="Sélectionnez une formation"

                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Input label="Date de visite / JPO" type="date" {...register('date_de_visite')} />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Input label="Date d'envoi du règlement" type="date" {...register('date_de_reglement')} />
                        </div>
                        <div className="col-span-12">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Avez-vous déjà une entreprise d'accueil ?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {['Oui', 'En recherche', 'Non'].map((val, idx) => (
                                    <label key={val} className="relative cursor-pointer group">
                                        <input className="peer sr-only" type="radio" value={val} {...register('entreprise_d_accueil')} />
                                        <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all ${selectedEntreprise === val ? 'bg-brand/10 border-brand shadow-brand/10' : 'bg-slate-50/50 border-transparent hover:border-slate-200'}`}>
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${selectedEntreprise === val ? 'bg-brand text-white' : 'bg-slate-200 text-slate-400'}`}>{String.fromCharCode(65 + idx)}</span>
                                            <span className="font-bold text-slate-700">{val}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card
                    step={isMinor ? 7 : 6}
                    title="Informations complémentaires"
                    collapsible
                    isOpen={activeSection === 'extra'}
                    onToggle={() => toggleSection('extra')}
                    hasError={hasSectionError(['connaissance_rush_how', 'motivation_projet_professionnel'])}
                >
                    <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-12">
                            <Select
                                label="Comment avez-vous connu Rush School ?"
                                {...register('connaissance_rush_how')}
                                options={KNOW_RUSH_SCHOOL_OPTIONS}
                                placeholder="Sélectionnez"

                            />
                        </div>
                        <div className="col-span-12">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Motivations et projet professionnel </label>
                            <textarea placeholder="Décrivez brièvement vos motivations et votre projet professionnel..." rows={4} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-slate-700 placeholder:text-slate-300 transition-all duration-300 outline-none focus:bg-white focus:border-brand focus:shadow-brand/10 resize-none" {...register('motivation_projet_professionnel')}></textarea>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input className="w-5 h-5 accent-brand rounded cursor-pointer" type="checkbox" {...register('agreement')} />
                        <span className="font-medium text-slate-700">J'atteste sur l'honneur l'exactitude des informations fournies <span className="text-red-500">*</span></span>
                    </label>
                    {errors.agreement && <p className="mt-1.5 text-rose-500 text-xs font-bold animate-slide-in">{errors.agreement.message}</p>}
                </div>

                <Button
                    type="submit"
                    size="lg"
                    isLoading={isSubmitting}
                    rightIcon={<ArrowRight size={20} />}
                >
                    Enregistrer et continuer
                </Button>
            </div>
        </form>
    );
};

export default QuestionnaireForm;
