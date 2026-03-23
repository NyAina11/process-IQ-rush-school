import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import {
    X,
    Building2,
    MapPin,
    User,
    FileText,
    Briefcase,
    ShieldCheck,
    Calculator,
    GraduationCap,
    Clock,
    Mail,
    Phone,
    Loader2,
    Save,
    RefreshCw,
    Info
} from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import {
    EMPLOYER_TYPE_OPTIONS,
    MAITRE_DIPLOMA_OPTIONS,
    OPCO_OPTIONS,
    CONTRAT_TYPE_OPTIONS,
    DEROGATION_TYPE_OPTIONS,
    YES_NO_OPTIONS,
    FORMATION_DETAILS
} from '../../constants/formOptions';

interface CompanyDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: any;
    loading: boolean;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    onEdit?: () => void;
    editForm: any;
    setEditForm: (val: any) => void;
    onSave?: (id: string, data: any) => Promise<void>;
    isSaving?: boolean;
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({
    isOpen,
    onClose,
    company,
    loading,
    isEditing,
    setIsEditing,
    onEdit,
    editForm,
    setEditForm,
    onSave,
    isSaving
}) => {
    const [activeTab, setActiveTab] = useState<'id' | 'address' | 'maitre' | 'contract' | 'formation'>('id');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; document.documentElement.style.overflow = ''; };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const fields = company?.fields || {};

    const tabs = [
        { id: 'id', label: 'Identification', icon: Building2 },
        { id: 'address', label: 'Coordonnées', icon: MapPin },
        { id: 'maitre', label: 'Maître Appr.', icon: User },
        { id: 'contract', label: 'Contrat & Salaire', icon: Calculator },
        { id: 'formation', label: 'Formation', icon: GraduationCap },
    ];

    const renderInfoRow = (label: string, value: any, icon?: any) => (
        <div className="flex flex-col gap-1.5 p-4 bg-[#f8fafc] rounded-[4px] border border-[#e2e8f0] hover:border-[#93c5fd] transition-colors group">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm">
                {icon && <div className="text-slate-300 group-hover:text-blue-500 transition-colors">{React.createElement(icon, { size: 14 })}</div>}
                {value || 'N/A'}
            </div>
        </div>
    );

    const handleSave = async () => {
        if (onSave && company.id) {
            await onSave(company.id, editForm);
            setIsEditing(false);
        }
    };

    const updateNestedField = (path: string, value: any) => {
        const keys = path.split('.');
        setEditForm((prev: any) => {
            const next = { ...prev };
            let current = next;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return next;
        });
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-lg animate-in fade-in duration-300">
            <div className="bg-white relative z-[10000] rounded-[8px] w-full max-w-4xl h-[88vh] overflow-hidden shadow-2xl border border-[#e2e8f0] flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-[#e2e8f0] flex justify-between items-center bg-white">
                                        <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-[4px] bg-[#dbeafe] text-[#1d4ed8] flex items-center justify-center">
                            <Building2 size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                {isEditing ? 'Modifier Entreprise' : 'Formulaire Entreprise'}
                            </h2>
                            <p className="text-slate-400 font-bold text-sm">{fields["Raison sociale"] || "Détails de l'entreprise"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 w-12 h-12 rounded-[4px] bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-500 hover:rotate-90 transition-all duration-300 flex items-center justify-center">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-100 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-[4px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-blue-600" size={48} />
                            <p className="text-slate-400 font-bold">Chargement des données...</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {isEditing ? (
                                <div className="space-y-6">
                                    {activeTab === 'id' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="Raison sociale" value={editForm?.identification?.raison_sociale} onChange={e => updateNestedField('identification.raison_sociale', e.target.value)} />
                                            <Input label="Numéro SIRET" value={editForm?.identification?.siret} onChange={e => updateNestedField('identification.siret', e.target.value)} />
                                            <Input label="Code APE/NAF" value={editForm?.identification?.code_ape_naf} onChange={e => updateNestedField('identification.code_ape_naf', e.target.value)} />
                                            <Select label="Type d'employeur" options={EMPLOYER_TYPE_OPTIONS} value={editForm?.identification?.type_employeur} onChange={e => updateNestedField('identification.type_employeur', e.target.value)} />
                                            <Input label="Effectif salarié" value={editForm?.identification?.effectif} onChange={e => updateNestedField('identification.effectif', e.target.value)} />
                                            <Input label="Convention collective" value={editForm?.identification?.convention} onChange={e => updateNestedField('identification.convention', e.target.value)} />
                                        </div>
                                    )}
                                    {activeTab === 'address' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="Numéro" value={editForm?.adresse?.num} onChange={e => updateNestedField('adresse.num', e.target.value)} />
                                            <Input label="Voie" value={editForm?.adresse?.voie} onChange={e => updateNestedField('adresse.voie', e.target.value)} />
                                            <Input label="Complément" value={editForm?.adresse?.complement} onChange={e => updateNestedField('adresse.complement', e.target.value)} />
                                            <Input label="Code postal" value={editForm?.adresse?.code_postal} onChange={e => updateNestedField('adresse.code_postal', e.target.value)} />
                                            <Input label="Ville" value={editForm?.adresse?.ville} onChange={e => updateNestedField('adresse.ville', e.target.value)} />
                                            <Input label="Téléphone" value={editForm?.adresse?.telephone} onChange={e => updateNestedField('adresse.telephone', e.target.value)} />
                                            <Input label="Email" type="email" value={editForm?.adresse?.email} onChange={e => updateNestedField('adresse.email', e.target.value)} />
                                        </div>
                                    )}
                                    {activeTab === 'maitre' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="Nom" value={editForm?.maitre_apprentissage?.nom} onChange={e => updateNestedField('maitre_apprentissage.nom', e.target.value)} />
                                            <Input label="Prénom" value={editForm?.maitre_apprentissage?.prenom} onChange={e => updateNestedField('maitre_apprentissage.prenom', e.target.value)} />
                                            <Input label="Date de naissance" type="date" value={editForm?.maitre_apprentissage?.date_naissance} onChange={e => updateNestedField('maitre_apprentissage.date_naissance', e.target.value)} />
                                            <Input label="Fonction" value={editForm?.maitre_apprentissage?.fonction} onChange={e => updateNestedField('maitre_apprentissage.fonction', e.target.value)} />
                                            <Select label="Diplôme" options={MAITRE_DIPLOMA_OPTIONS} value={editForm?.maitre_apprentissage?.diplome} onChange={e => updateNestedField('maitre_apprentissage.diplome', e.target.value)} />
                                            <Input label="Expérience" value={editForm?.maitre_apprentissage?.experience} onChange={e => updateNestedField('maitre_apprentissage.experience', e.target.value)} />
                                            <Input label="Téléphone" value={editForm?.maitre_apprentissage?.telephone} onChange={e => updateNestedField('maitre_apprentissage.telephone', e.target.value)} />
                                            <Input label="Email" type="email" value={editForm?.maitre_apprentissage?.email} onChange={e => updateNestedField('maitre_apprentissage.email', e.target.value)} />
                                        </div>
                                    )}
                                    {activeTab === 'contract' && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Select label="Type de contrat" options={CONTRAT_TYPE_OPTIONS} value={editForm?.contrat?.type_contrat} onChange={e => updateNestedField('contrat.type_contrat', e.target.value)} />
                                                <Select label="Type de dérogation" options={DEROGATION_TYPE_OPTIONS} value={editForm?.contrat?.type_derogation} onChange={e => updateNestedField('contrat.type_derogation', e.target.value)} />
                                                <Input label="Poste occupé" value={editForm?.contrat?.poste_occupe} onChange={e => updateNestedField('contrat.poste_occupe', e.target.value)} />
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-semibold text-slate-700 ml-1">
                                                        Durée hebdomadaire <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1">
                                                            <Input
                                                                type="number"
                                                                placeholder="HH"
                                                                min="0"
                                                                value={editForm?.contrat?.duree_hebdomadaire?.split(':')[0] || ''}
                                                                onChange={(e) => {
                                                                    const h = e.target.value || '0';
                                                                    const m = editForm?.contrat?.duree_hebdomadaire?.split(':')[1] || '00';
                                                                    updateNestedField('contrat.duree_hebdomadaire', `${h}:${m}`);
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
                                                                value={editForm?.contrat?.duree_hebdomadaire?.split(':')[1] || ''}
                                                                onChange={(e) => {
                                                                    let m = e.target.value || '0';
                                                                    if (parseInt(m) > 59) m = '59';
                                                                    const h = editForm?.contrat?.duree_hebdomadaire?.split(':')[0] || '35';
                                                                    updateNestedField('contrat.duree_hebdomadaire', `${h}:${m.padStart(2, '0')}`);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <Input label="Date conclusion" type="date" value={editForm?.contrat?.date_conclusion} onChange={e => updateNestedField('contrat.date_conclusion', e.target.value)} />
                                                <Input label="Début exécution" type="date" value={editForm?.contrat?.date_debut_execution} onChange={e => updateNestedField('contrat.date_debut_execution', e.target.value)} />
                                                <Select label="OPCO" options={OPCO_OPTIONS} value={editForm?.opco?.nom} onChange={e => updateNestedField('opco.nom', e.target.value)} />
                                                <Select label="Machines dangereuses" options={YES_NO_OPTIONS} value={editForm?.contrat?.machines_dangereuses} onChange={e => updateNestedField('contrat.machines_dangereuses', e.target.value)} />
                                                <Input label="Caisse de retraite" value={editForm?.contrat?.caisse_retraite} onChange={e => updateNestedField('contrat.caisse_retraite', e.target.value)} />
                                                <Input label="N° DECA" value={editForm?.contrat?.numero_deca_ancien_contrat} onChange={e => updateNestedField('contrat.numero_deca_ancien_contrat', e.target.value)} />
                                            </div>
                                            <div className="bg-slate-50 p-6 rounded-[4px] border border-slate-100">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Rémunération (Salaire Brut)</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <Input label="Année 1 (€)" type="number" value={editForm?.contrat?.montant_salaire_brut1} onChange={e => updateNestedField('contrat.montant_salaire_brut1', e.target.value)} />
                                                    <Input label="Année 2 (€)" type="number" value={editForm?.contrat?.montant_salaire_brut2} onChange={e => updateNestedField('contrat.montant_salaire_brut2', e.target.value)} />
                                                    <Input label="Année 3 (€)" type="number" value={editForm?.contrat?.montant_salaire_brut3} onChange={e => updateNestedField('contrat.montant_salaire_brut3', e.target.value)} />
                                                    <Input label="Année 4 (€)" type="number" value={editForm?.contrat?.montant_salaire_brut4} onChange={e => updateNestedField('contrat.montant_salaire_brut4', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'formation' && (
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Select label="Formation" options={Object.keys(FORMATION_DETAILS).map(k => ({ value: k, label: k }))} value={editForm?.formation?.choisie} onChange={e => updateNestedField('formation.choisie', e.target.value)} />
                                                <Input label="Date début" type="date" value={editForm?.formation?.date_debut} onChange={e => updateNestedField('formation.date_debut', e.target.value)} />
                                                <Input label="Date fin" type="date" value={editForm?.formation?.date_fin} onChange={e => updateNestedField('formation.date_fin', e.target.value)} />
                                                <Input label="Heures" value={editForm?.formation?.nb_heures} onChange={e => updateNestedField('formation.nb_heures', e.target.value)} />
                                                <Input label="Lieu exécution" value={editForm?.contrat?.lieu_execution} onChange={e => updateNestedField('contrat.lieu_execution', e.target.value)} />
                                            </div>
                                            <div className="h-px bg-slate-100" />
                                            <div className="space-y-4">
                                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">CFA</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input label="Dénomination CFA" value={editForm?.cfa?.denomination} onChange={e => updateNestedField('cfa.denomination', e.target.value)} />
                                                    <Input label="SIRET CFA" value={editForm?.cfa?.siret} onChange={e => updateNestedField('cfa.siret', e.target.value)} />
                                                    <Input label="UAI CFA" value={editForm?.cfa?.uai} onChange={e => updateNestedField('cfa.uai', e.target.value)} />
                                                    <Input label="Ville CFA" value={editForm?.cfa?.commune} onChange={e => updateNestedField('cfa.commune', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="h-px bg-slate-100" />
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Missions</label>
                                                <textarea
                                                    value={editForm?.missions?.formation_alternant}
                                                    onChange={e => updateNestedField('missions.formation_alternant', e.target.value)}
                                                    rows={4}
                                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-[4px] text-[15px] font-bold text-slate-700 placeholder:text-slate-300 transition-all duration-300 outline-none focus:bg-white focus:border-blue-500 focus:shadow-blue-500/10 resize-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {activeTab === 'id' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {renderInfoRow("Raison sociale", fields["Raison sociale"], Building2)}
                                            {renderInfoRow("Numéro SIRET", fields["Numéro SIRET"], FileText)}
                                            {renderInfoRow("Code APE/NAF", fields["Code APE/NAF"], ShieldCheck)}
                                            {renderInfoRow("Type d'employeur", fields["Type demployeur"], User)}
                                            {renderInfoRow("Effectif salarié", fields["Effectif salarié de l'entreprise"], Briefcase)}
                                            {renderInfoRow("Convention collective", fields["Convention collective"], FileText)}
                                            {renderInfoRow("Numéro entreprise", fields["Numéro entreprise"], Clock)}
                                        </div>
                                    )}

                                    {activeTab === 'address' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                {renderInfoRow("Adresse", `${fields["Voie entreprise"] || ''} ${fields["Complément dadresse entreprise"] || ''}`, MapPin)}
                                            </div>
                                            {renderInfoRow("Code postal", fields["Code postal entreprise"], MapPin)}
                                            {renderInfoRow("Ville", fields["Ville entreprise"], MapPin)}
                                            {renderInfoRow("Téléphone", fields["Téléphone entreprise"], Phone)}
                                            {renderInfoRow("Email", fields["Email entreprise"], Mail)}
                                        </div>
                                    )}

                                    {activeTab === 'maitre' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {renderInfoRow("Nom", fields["Nom Maître apprentissage"], User)}
                                            {renderInfoRow("Prénom", fields["Prénom Maître apprentissage"], User)}
                                            {renderInfoRow("Date de naissance", fields["Date de naissance Maître apprentissage"], Clock)}
                                            {renderInfoRow("Fonction", fields["Fonction Maître apprentissage"], Briefcase)}
                                            {renderInfoRow("Diplôme", fields["Diplôme Maître apprentissage"], GraduationCap)}
                                            {renderInfoRow("Expérience (années)", fields["Année experience pro Maître apprentissage"], Clock)}
                                            {renderInfoRow("Téléphone", fields["Téléphone Maître apprentissage"], Phone)}
                                            {renderInfoRow("Email", fields["Email Maître apprentissage"], Mail)}
                                        </div>
                                    )}

                                    {activeTab === 'contract' && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {renderInfoRow("Type de contrat", fields["Type de contrat"], FileText)}
                                                {renderInfoRow("Type de dérogation", fields["Type de dérogation"], ShieldCheck)}
                                                {renderInfoRow("Date de conclusion", fields["Date de conclusion"], Clock)}
                                                {renderInfoRow("Début exécution", fields["Date de début exécution"], Clock)}
                                                {renderInfoRow("Fin contrat", fields["Fin du contrat apprentissage"], Clock)}
                                                {renderInfoRow("Poste occupé", fields["Poste occupé"], Briefcase)}
                                                {renderInfoRow("Durée hebdomadaire", company.contrat?.duree_hebdomadaire || "35:00", Clock)}
                                                {renderInfoRow("Machines dangereuses", fields["Travail sur machines dangereuses ou exposition à des risques particuliers"], ShieldCheck)}
                                            </div>

                                            <div className="bg-slate-50 p-6 rounded-[4px] border border-slate-100">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Rémunération</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    {[1, 2, 3, 4].map(num => (
                                                        <div key={num} className="bg-white p-4 rounded-[4px] border border-slate-100 shadow-sm">
                                                            <span className="text-[10px] font-black text-blue-500 uppercase mb-2 block">Année {num}</span>
                                                            <div className="text-lg font-black text-slate-800">{fields[`Salaire brut mensuel ${num}`] ? `${fields[`Salaire brut mensuel ${num}`]} €` : 'N/A'}</div>
                                                            <div className="text-[10px] font-bold text-slate-400">{fields[`Pourcentage du SMIC ${num}`] || fields[`Pourcentage smic ${num}`] || 0}% du SMIC</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'formation' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {renderInfoRow("Formation", fields["Formation"], GraduationCap)}
                                            {renderInfoRow("Code RNCP", fields["Code Rncp"], FileText)}
                                            {renderInfoRow("Code Diplôme", fields["Code  diplome"], FileText)}
                                            {renderInfoRow("Heures formation", fields["nombre heure formation"], Clock)}
                                            {renderInfoRow("Jours de cours", fields["jour de cours"], Clock)}
                                            <div className="md:col-span-2">
                                                {renderInfoRow("Missions", fields["Formation de lalternant(e) (pour les missions)"], Briefcase)}
                                            </div>
                                            {renderInfoRow("Lieu d'exécution", fields["Lieu dexécution du contrat (si différent du siège)"], MapPin)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-[#e2e8f0] bg-white flex justify-between items-center">
                    <div>
                        {!isEditing && (
                            <button
                                onClick={() => onEdit ? onEdit() : setIsEditing(true)}
                                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-[4px] font-black text-[10px] uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={14} /> Modifier
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => isEditing ? setIsEditing(false) : onClose()}>
                            {isEditing ? 'Annuler' : 'Fermer'}
                        </Button>
                        {isEditing && (
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                isLoading={isSaving}
                                leftIcon={<Save size={18} />}
                            >
                                Enregistrer
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    , document.body);
};

export default CompanyDetailsModal;