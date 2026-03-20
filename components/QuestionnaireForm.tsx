import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    User, Save, Loader2, ArrowRight, CheckCircle2, Info, Activity,
    MapPin, Phone, GraduationCap, Briefcase, ChevronDown, Users, BookOpen, Target
} from 'lucide-react';
import { api } from '../services/api';
import { StudentFormData } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useApi } from '../hooks/useApi';
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
    KNOW_RUSH_SCHOOL_OPTIONS,
    SEXE_OPTIONS,
    ENTREPRISE_ACCUEIL_OPTIONS
} from '../constants/formOptions';

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
        nom: z.string().optional(), prenom: z.string().optional(),
        lien_parente: z.string().optional(), numero: z.string().optional(),
        voie: z.string().optional(), complement: z.string().optional(),
        code_postal: z.string().optional(), ville: z.string().optional(),
        email: z.string().optional(), telephone: z.string().optional(),
    }).optional(),
    representant_legal_2: z.object({
        nom: z.string().optional(), prenom: z.string().optional(),
        lien_parente: z.string().optional(), numero: z.string().optional(),
        voie: z.string().optional(), complement: z.string().optional(),
        code_postal: z.string().optional(), ville: z.string().optional(),
        email: z.string().optional(), telephone: z.string().optional(),
    }).optional()
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface QuestionnaireFormProps {
    onNext: (data: any) => void;
    onBack?: () => void;
    initialData?: Partial<StudentFormValues>;
}

// ---- Accordion Section ----
const SectionAccordion = ({
    num, title, icon: Icon, isOpen, onToggle, isComplete, hasError, children
}: {
    num: number | string; title: string; icon: any;
    isOpen: boolean; onToggle: () => void;
    isComplete: boolean; hasError: boolean; children: React.ReactNode;
}) => (
    <div className={`border-2 rounded-[4px] transition-all duration-200 overflow-hidden ${hasError ? 'border-rose-300' : isComplete ? 'border-emerald-200' : isOpen ? 'border-[#6B3CD2]/35' : 'border-slate-200'
        }`}>
        <button
            type="button"
            onClick={onToggle}
            className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${isOpen ? 'bg-slate-50/60 border-b-2 border-slate-100' : 'bg-white hover:bg-slate-50/40'
                }`}
        >
            {/* Icon */}
            <div className={`w-9 h-9 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-all ${isComplete ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                    : hasError ? 'bg-rose-100 text-rose-500 border border-rose-200'
                        : isOpen ? 'bg-[#6B3CD2]/10 text-[#6B3CD2] border border-[#6B3CD2]/20'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                {isComplete
                    ? <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8l3.5 3.5 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <Icon size={15} />
                }
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Section {num}</span>
                <span className="text-[13px] font-black text-slate-900 tracking-tight">{title}</span>
            </div>

            {/* Badge */}
            {isComplete && (
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[3px] uppercase tracking-wide flex-shrink-0">
                    Complété
                </span>
            )}
            {hasError && !isComplete && (
                <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-[3px] uppercase tracking-wide flex-shrink-0">
                    À corriger
                </span>
            )}

            <ChevronDown size={15} className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
            <div className="px-5 pt-5 pb-6 bg-white">
                {children}
            </div>
        )}
    </div>
);

// ---- Field label ----
const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
        {children}{required && <span className="text-rose-400 ml-1">*</span>}
    </label>
);

// ---- Yes/No toggle ----
const YesNo = ({ value, onChange, label }: { value: boolean | null; onChange: (v: boolean) => void; label: string }) => (
    <div className={`flex items-center justify-between p-4 border rounded-[4px] transition-colors ${value === null ? 'bg-white border-slate-200' : 'bg-slate-50/60 border-slate-200'
        }`}>
        <div className="flex items-center gap-2.5">
            {value === null && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>}
            <span className="text-[12px] font-bold text-slate-700">{label}</span>
        </div>
        <div className="flex gap-2">
            {([true, false] as const).map(v => (
                <button
                    key={String(v)}
                    type="button"
                    onClick={() => onChange(v)}
                    className={`px-4 py-1.5 rounded-[4px] text-[10px] font-black uppercase tracking-wider border-2 transition-all ${value === v
                            ? 'bg-[#6B3CD2] border-[#6B3CD2] text-white shadow-sm shadow-[#6B3CD2]/20'
                            : 'bg-white border-slate-200 text-slate-400 hover:border-[#6B3CD2]/30 hover:text-[#6B3CD2]'
                        }`}
                >{v ? 'Oui' : 'Non'}</button>
            ))}
        </div>
    </div>
);

// ---- Form grid ----
const FormGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);
const FullCol = ({ children }: { children: React.ReactNode }) => (
    <div className="md:col-span-2">{children}</div>
);


const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({ onNext, initialData }) => {
    const { showToast, draftStudent, setDraftStudent, clearDraftStudent } = useAppStore();
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['personal']));

    const formDefaults = initialData || draftStudent;

    const toggleSection = (id: string) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<StudentFormValues>({
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
            situation: initialData?.situation || '',
            regime_social: initialData?.regime_social || '',
            declare_inscription_sportif_haut_niveau: formDefaults?.declare_inscription_sportif_haut_niveau ?? false,
            declare_avoir_projet_creation_reprise_entreprise: formDefaults?.declare_avoir_projet_creation_reprise_entreprise ?? false,
            declare_travailleur_handicape: formDefaults?.declare_travailleur_handicape ?? false,
            alternance: formDefaults?.alternance ?? false,
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

    React.useEffect(() => { if (initialData) reset(initialData); }, [initialData, reset]);
    React.useEffect(() => {
        const subscription = watch((value) => setDraftStudent(value));
        return () => subscription.unsubscribe();
    }, [watch, setDraftStudent]);

    const { execute: submitStudent, loading: isSubmitting } = useApi(api.submitStudent, {
        successMessage: "Inscription enregistrée avec succès !",
        onSuccess: async (response) => {
            const recordId = response?.record_id || response?.id;
            if (recordId) {
                localStorage.setItem('candidateRecordId', recordId);
                setTimeout(() => {
                    api.generateCerfa(recordId).catch(err => console.error("CERFA pre-generation failed:", err));
                    api.generateCertificatScolarite(recordId).catch(err => console.error("Certificat Scolarité pre-generation failed:", err));
                }, 5000);
            }
            clearDraftStudent();
            onNext(response);
        },
        errorMessage: "Erreur lors de l'enregistrement. Veuillez réessayer."
    });

    const handleSaveDraft = () => {
        setDraftStudent(watch());
        showToast("Brouillon sauvegardé — vos données sont conservées.", "success");
    };

    const onSubmit = async (data: StudentFormValues) => { await submitStudent(data as any); };

    const onError = (errs: any) => {
        const errorCount = Object.keys(errs).length;
        showToast(`Veuillez corriger les ${errorCount} erreur(s) avant de continuer.`, "error");
        const sectionMap: Record<string, string[]> = {
            personal: ['prenom', 'nom_naissance', 'nom_usage', 'sexe', 'date_naissance', 'nationalite', 'commune_naissance', 'departement'],
            contact: ['num_residence', 'rue_residence', 'complement_residence', 'code_postal', 'ville', 'email', 'telephone', 'nir'],
            legal: ['representant_legal_1', 'representant_legal_2'],
            situation: ['situation', 'regime_social', 'declare_inscription_sportif_haut_niveau', 'declare_avoir_projet_creation_reprise_entreprise', 'declare_travailleur_handicape', 'alternance'],
            school: ['dernier_diplome_prepare', 'derniere_classe', 'intitulePrecisDernierDiplome', 'bac'],
            formation: ['formation_souhaitee', 'date_de_visite', 'date_de_reglement', 'entreprise_d_accueil', 'connaissance_rush_how', 'motivation_projet_professionnel'],
        };
        setOpenSections(prev => {
            const next = new Set(prev);
            for (const [id, fields] of Object.entries(sectionMap)) {
                if (fields.some(f => errs[f])) next.add(id);
            }
            return next;
        });
    };

    const formValues = watch();
    const selectedSexe = formValues.sexe;
    const selectedEntreprise = formValues.entreprise_d_accueil;
    const dateNaissance = formValues.date_naissance;
    const addSecondRep = formValues.add_second_representative;

    const isMinor = React.useMemo(() => {
        if (!dateNaissance) return false;
        const birth = new Date(dateNaissance);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age < 18;
    }, [dateNaissance]);

    const isSectionComplete = (fields: string[]) =>
        fields.every(f => {
            const v = (formValues as any)[f];
            if (typeof v === 'boolean') return true; // true ou false = explicitement sélectionné
            return v !== undefined && v !== '' && v !== null;
        });

    const hasSectionError = (fields: string[]) =>
        fields.some(f => !!(errors as any)[f]);

    const sectionDefs = [
        { id: 'personal', fields: ['prenom', 'nom_naissance', 'sexe', 'date_naissance', 'nationalite', 'commune_naissance', 'departement'] },
        { id: 'contact', fields: ['rue_residence', 'code_postal', 'ville', 'email', 'telephone'] },
        { id: 'situation', fields: ['situation', 'declare_inscription_sportif_haut_niveau', 'declare_avoir_projet_creation_reprise_entreprise', 'declare_travailleur_handicape', 'alternance'] },
        { id: 'school', fields: ['derniere_classe', 'bac'] },
        { id: 'formation', fields: ['formation_souhaitee'] },
    ];

    const completedCount = sectionDefs.filter(s => isSectionComplete(s.fields)).length;
    const progressPercent = Math.round((completedCount / sectionDefs.length) * 100);

    const inputClass = "w-full px-3 py-2.5 bg-white border border-slate-200 rounded-[4px] focus:border-[#6B3CD2] focus:ring-2 focus:ring-[#6B3CD2]/10 outline-none font-medium text-slate-800 text-[12px] placeholder-slate-300 resize-none transition-all";

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)} className="animate-fade-in">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-[4px] bg-[#6B3CD2]/10 flex items-center justify-center text-[#6B3CD2]">
                    <User size={22} />
                </div>
                <div>
                    <h2 className="text-[17px] font-black text-slate-900">Fiche d'inscription Étudiant</h2>
                    <p className="text-[12px] text-slate-400 font-medium mt-0.5">Informations personnelles et administratives pour votre dossier</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-4 mb-6 flex items-center gap-5">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progression</span>
                        <span className="text-[11px] font-black text-[#6B3CD2]">{completedCount} / {sectionDefs.length} sections</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#6B3CD2] rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
                <div className={`text-[13px] font-black transition-colors ${progressPercent === 100 ? 'text-emerald-600' : 'text-slate-300'}`}>
                    {progressPercent === 100 ? '✓ Complet' : `${progressPercent}%`}
                </div>
            </div>

            <div className="space-y-3">

                {/* ─── SECTION 1 – Informations personnelles ─── */}
                <SectionAccordion
                    num={1} title="Informations personnelles" icon={User}
                    isOpen={openSections.has('personal')} onToggle={() => toggleSection('personal')}
                    isComplete={isSectionComplete(sectionDefs[0].fields)}
                    hasError={hasSectionError(sectionDefs[0].fields)}
                >
                    <FormGrid>
                        <div><Input label="Prénom" required placeholder="Votre prénom" error={errors.prenom?.message} {...register('prenom')} /></div>
                        <div><Input label="Nom de naissance" required placeholder="Votre nom" error={errors.nom_naissance?.message} {...register('nom_naissance')} /></div>
                        <FullCol><Input label="Nom d'usage" placeholder="Si différent du nom de naissance" {...register('nom_usage')} /></FullCol>

                        <FullCol>
                            <FieldLabel required>Sexe</FieldLabel>
                            <div className="grid grid-cols-2 gap-3">
                                {SEXE_OPTIONS.map(opt => (
                                    <label key={opt.value} className={`flex items-center gap-3 p-3.5 rounded-[4px] border-2 cursor-pointer transition-all ${selectedSexe === opt.value ? 'border-[#6B3CD2] bg-[#6B3CD2]/5 text-[#6B3CD2]' : 'border-slate-200 text-slate-500 hover:border-[#6B3CD2]/30'
                                        }`}>
                                        <input type="radio" value={opt.value} className="hidden" {...register('sexe')} />
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedSexe === opt.value ? 'border-[#6B3CD2]' : 'border-slate-300'}`}>
                                            {selectedSexe === opt.value && <div className="w-2 h-2 rounded-full bg-[#6B3CD2]" />}
                                        </div>
                                        <span className="text-[12px] font-bold">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.sexe && <p className="mt-1.5 text-rose-500 text-[10px] font-bold">{errors.sexe.message}</p>}
                        </FullCol>

                        <div><Input label="Date de naissance" required type="date" error={errors.date_naissance?.message} {...register('date_naissance')} /></div>
                        <div><Select label="Nationalité" required error={errors.nationalite?.message} {...register('nationalite')} options={NATIONALITY_OPTIONS} /></div>
                        <div><Input label="Commune de naissance" required placeholder="Ville de naissance" error={errors.commune_naissance?.message} {...register('commune_naissance')} /></div>
                        <div><Select label="Département de naissance" required error={errors.departement?.message} {...register('departement')} options={DEPARTMENT_OPTIONS} /></div>
                    </FormGrid>
                </SectionAccordion>

                {/* ─── SECTION 2 – Coordonnées ─── */}
                <SectionAccordion
                    num={2} title="Coordonnées & Contact" icon={MapPin}
                    isOpen={openSections.has('contact')} onToggle={() => toggleSection('contact')}
                    isComplete={isSectionComplete(sectionDefs[1].fields)}
                    hasError={hasSectionError(sectionDefs[1].fields)}
                >
                    <FormGrid>
                        <FullCol><Input label="Adresse de résidence" required placeholder="Numéro et rue" error={errors.rue_residence?.message} {...register('rue_residence')} /></FullCol>
                        <FullCol><Input label="Complément d'adresse" placeholder="Bâtiment, appartement…" {...register('complement_residence')} /></FullCol>
                        <div><Input label="Code postal" required placeholder="75001" error={errors.code_postal?.message} {...register('code_postal')} /></div>
                        <div><Input label="Ville" required placeholder="Paris" error={errors.ville?.message} {...register('ville')} /></div>
                        <div><Input label="E-mail" required type="email" placeholder="votre@email.com" error={errors.email?.message} {...register('email')} /></div>
                        <div><Input label="Téléphone" required placeholder="06 00 00 00 00" error={errors.telephone?.message} {...register('telephone', { onChange: (e) => e.target.value = formatPhone(e.target.value) })} /></div>
                        <FullCol>
                            <Input
                                label="NIR (Numéro de Sécurité Sociale)"
                                placeholder="1 85 12 75 108 123 45"
                                error={errors.nir?.message}
                                {...register('nir', { onChange: (e) => e.target.value = formatNIR(e.target.value) })}
                            />
                            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-[#6B3CD2]">
                                <Info size={11} /><span>15 chiffres – Consultez votre carte Vitale</span>
                            </div>
                        </FullCol>
                    </FormGrid>
                </SectionAccordion>

                {/* ─── SECTION LÉGALE (mineur) ─── */}
                {isMinor && (
                    <SectionAccordion
                        num="2b" title="Représentants Légaux" icon={Users}
                        isOpen={openSections.has('legal')} onToggle={() => toggleSection('legal')}
                        isComplete={false} hasError={hasSectionError(['representant_legal_1'])}
                    >
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 mb-1 px-1 py-2 bg-amber-50 border border-amber-200 rounded-[4px]">
                                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" className="text-amber-500 flex-shrink-0"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                <span className="text-[11px] font-bold text-amber-700">Cette section apparaît car le candidat est mineur — renseignez au moins un représentant légal.</span>
                            </div>
                            <div className="bg-slate-50/60 border border-slate-200 rounded-[4px] p-4">
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Représentant légal 1</p>
                                <FormGrid>
                                    <div><Input label="Nom" {...register('representant_legal_1.nom')} /></div>
                                    <div><Input label="Prénom" {...register('representant_legal_1.prenom')} /></div>
                                    <FullCol><Input label="Lien de parenté" required placeholder="Père, Mère, Tuteur…" {...register('representant_legal_1.lien_parente')} /></FullCol>
                                    <FullCol><Input label="Adresse" required placeholder="Numéro et rue" {...register('representant_legal_1.voie')} /></FullCol>
                                    <div><Input label="Code postal" required {...register('representant_legal_1.code_postal')} /></div>
                                    <div><Input label="Ville" required {...register('representant_legal_1.ville')} /></div>
                                    <div><Input label="Email" required type="email" {...register('representant_legal_1.email')} /></div>
                                    <div><Input label="Téléphone" required type="tel" {...register('representant_legal_1.telephone')} /></div>
                                </FormGrid>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div
                                    onClick={() => setValue('add_second_representative', !addSecondRep)}
                                    className={`w-4 h-4 rounded-[3px] border-2 flex items-center justify-center flex-shrink-0 transition-all ${addSecondRep ? 'bg-[#6B3CD2] border-[#6B3CD2]' : 'border-slate-300 group-hover:border-[#6B3CD2]/40'}`}
                                >
                                    {addSecondRep && <svg viewBox="0 0 10 10" fill="none" width="8" height="8"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                </div>
                                <input type="checkbox" className="hidden" {...register('add_second_representative')} />
                                <span className="text-[11px] font-bold text-slate-500">Ajouter un second représentant légal</span>
                            </label>

                            {addSecondRep && (
                                <div className="bg-slate-50/60 border border-slate-200 rounded-[4px] p-4">
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Représentant légal 2</p>
                                    <FormGrid>
                                        <div><Input label="Nom" {...register('representant_legal_2.nom')} /></div>
                                        <div><Input label="Prénom" {...register('representant_legal_2.prenom')} /></div>
                                        <FullCol><Input label="Lien de parenté" {...register('representant_legal_2.lien_parente')} /></FullCol>
                                        <FullCol><Input label="Adresse" {...register('representant_legal_2.voie')} /></FullCol>
                                        <div><Input label="Code postal" {...register('representant_legal_2.code_postal')} /></div>
                                        <div><Input label="Ville" {...register('representant_legal_2.ville')} /></div>
                                        <div><Input label="Email" type="email" {...register('representant_legal_2.email')} /></div>
                                        <div><Input label="Téléphone" type="tel" {...register('representant_legal_2.telephone')} /></div>
                                    </FormGrid>
                                </div>
                            )}
                        </div>
                    </SectionAccordion>
                )}

                {/* ─── SECTION 3 – Situation & Déclarations ─── */}
                <SectionAccordion
                    num={3} title="Situation & Déclarations" icon={Briefcase}
                    isOpen={openSections.has('situation')} onToggle={() => toggleSection('situation')}
                    isComplete={isSectionComplete(sectionDefs[2].fields)}
                    hasError={hasSectionError(sectionDefs[2].fields)}
                >
                    <div className="space-y-4">
                        <Select label="Situation avant le contrat" required placeholder="— Sélectionner —" error={errors.situation?.message} {...register('situation')} options={SITUATION_BEFORE_CONTRACT_OPTIONS} />
                        <Select label="Régime social" placeholder="— Sélectionner —" {...register('regime_social')} options={REGIME_SOCIAL_OPTIONS} />

                        <div className="space-y-2 pt-1">
                            {[
                                { label: "Sportif de haut niveau", name: "declare_inscription_sportif_haut_niveau" as const },
                                { label: "Projet création / reprise d'entreprise", name: "declare_avoir_projet_creation_reprise_entreprise" as const },
                                { label: "Travailleur handicapé (RQTH)", name: "declare_travailleur_handicape" as const },
                                { label: "Déjà fait de l'alternance", name: "alternance" as const },
                            ].map(item => (
                                <div key={item.name}>
                                    <YesNo
                                        label={item.label}
                                        value={!!formValues[item.name]}
                                        onChange={v => setValue(item.name, v)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionAccordion>

                {/* ─── SECTION 4 – Parcours scolaire ─── */}
                <SectionAccordion
                    num={4} title="Parcours scolaire" icon={BookOpen}
                    isOpen={openSections.has('school')} onToggle={() => toggleSection('school')}
                    isComplete={isSectionComplete(sectionDefs[3].fields)}
                    hasError={hasSectionError(sectionDefs[3].fields)}
                >
                    <div className="space-y-4">
                        <Select label="Dernière année ou classe suivie" required error={errors.derniere_classe?.message} {...register('derniere_classe')} options={LAST_CLASS_OPTIONS} placeholder="Sélectionnez" />
                        <Select label="Intitulé précis du dernier diplôme ou titre préparé" {...register('intitulePrecisDernierDiplome')} options={DETAILED_DIPLOMA_OPTIONS} placeholder="Sélectionnez" />
                        <Select label="Diplôme ou titre le plus élevé obtenu" required error={errors.bac?.message} {...register('bac')} options={HIGHEST_DIPLOMA_OPTIONS} placeholder="Sélectionnez votre diplôme" />
                    </div>
                </SectionAccordion>

                {/* ─── SECTION 5 – Projet de formation ─── */}
                <SectionAccordion
                    num={5} title="Projet de formation" icon={Target}
                    isOpen={openSections.has('formation')} onToggle={() => toggleSection('formation')}
                    isComplete={isSectionComplete(sectionDefs[4].fields)}
                    hasError={hasSectionError(sectionDefs[4].fields)}
                >
                    <div className="space-y-4">
                        <div>
                            <FieldLabel>Formation souhaitée <span className="text-rose-400">*</span></FieldLabel>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                {FORMATION_SOUHAITEE_OPTIONS.map(opt => {
                                    const selected = formValues.formation_souhaitee === opt.value;
                                    return (
                                        <label key={opt.value} className={`flex items-center gap-2 px-3 py-2.5 rounded-[4px] border-2 cursor-pointer transition-all text-[12px] font-bold leading-tight ${selected ? 'border-[#6B3CD2] bg-[#6B3CD2]/5 text-[#6B3CD2]' : 'border-slate-200 text-slate-600 hover:border-[#6B3CD2]/30'
                                            }`}>
                                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${selected ? 'border-[#6B3CD2]' : 'border-slate-300'}`}>
                                                {selected && <div className="w-1.5 h-1.5 rounded-full bg-[#6B3CD2]" />}
                                            </div>
                                            <input type="radio" className="hidden" value={opt.value} {...register('formation_souhaitee')} />
                                            {opt.label}
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.formation_souhaitee && <p className="mt-1 text-rose-500 text-[10px] font-bold">{errors.formation_souhaitee.message}</p>}
                        </div>

                        <FormGrid>
                            <div><Input label="Date visite / JPO" type="date" {...register('date_de_visite')} /></div>
                            <div><Input label="Date règlement" type="date" {...register('date_de_reglement')} /></div>
                        </FormGrid>

                        <div>
                            <FieldLabel>Avez-vous déjà une entreprise d'accueil ?</FieldLabel>
                            <div className="grid grid-cols-3 gap-2.5">
                                {ENTREPRISE_ACCUEIL_OPTIONS.map(opt => (
                                    <label key={opt.value} className={`flex items-center gap-2.5 p-3 rounded-[4px] border-2 cursor-pointer transition-all ${selectedEntreprise === opt.value
                                            ? 'border-[#6B3CD2] bg-[#6B3CD2]/5 text-[#6B3CD2]'
                                            : 'border-slate-200 text-slate-500 hover:border-[#6B3CD2]/30'
                                        }`}>
                                        <input type="radio" value={opt.value} className="hidden" {...register('entreprise_d_accueil')} />
                                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedEntreprise === opt.value ? 'border-[#6B3CD2]' : 'border-slate-300'}`}>
                                            {selectedEntreprise === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-[#6B3CD2]" />}
                                        </div>
                                        <span className="text-[11px] font-bold">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <Select label="Comment nous avez-vous connu ?" {...register('connaissance_rush_how')} options={KNOW_RUSH_SCHOOL_OPTIONS} />

                        <div>
                            <FieldLabel>Motivations et projet professionnel</FieldLabel>
                            <textarea
                                placeholder="Décrivez brièvement vos motivations et votre projet professionnel…"
                                rows={4}
                                className={inputClass}
                                {...register('motivation_projet_professionnel')}
                            />
                        </div>
                    </div>
                </SectionAccordion>

                {/* ─── VALIDATION FOOTER ─── */}
                <div className="bg-white border-2 border-slate-200 rounded-[4px] p-6 mt-2">
                    <label className="flex items-start gap-3 cursor-pointer group mb-6">
                        <div
                            onClick={() => setValue('agreement', !formValues.agreement)}
                            className={`w-4 h-4 rounded-[3px] border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${formValues.agreement ? 'bg-[#6B3CD2] border-[#6B3CD2]' : 'border-slate-300 group-hover:border-[#6B3CD2]/40'
                                }`}
                        >
                            {formValues.agreement && <svg viewBox="0 0 10 10" fill="none" width="8" height="8"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <input type="checkbox" className="hidden" {...register('agreement')} />
                        <span className="text-[12px] font-medium text-slate-600 leading-relaxed">
                            J'atteste sur l'honneur l'exactitude des informations fournies ci-dessus. <span className="text-rose-400">*</span>
                        </span>
                    </label>
                    {errors.agreement && <p className="mb-4 text-rose-500 text-[10px] font-bold uppercase">{errors.agreement.message}</p>}

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-[4px] border-2 border-slate-200 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                            onClick={handleSaveDraft}
                        >
                            <Save size={13} />
                            Enregistrer
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !formValues.agreement}
                            className="flex items-center gap-2 px-7 py-2.5 rounded-[4px] bg-[#6B3CD2] text-white font-black text-[11px] uppercase tracking-widest hover:bg-[#5a2eb8] transition-all shadow-md shadow-[#6B3CD2]/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        >
                            {isSubmitting ? <><Loader2 size={13} className="animate-spin" /> Envoi…</> : <>Valider et continuer <ArrowRight size={13} /></>}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default QuestionnaireForm;
