import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import {
    X,
    UserCircle,
    Loader2,
    User,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    Clock,
    FileText,
    CheckCircle,
    AlertCircle,
    Download,
    Trash2,
    Save,
    ShieldCheck,
    Briefcase,
    FileCheck,
    RefreshCw,
    Building2,
    History
} from 'lucide-react';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import HistoryTimeline from './HistoryTimeline';
import { api } from '../../services/api';

import {
    NATIONALITY_OPTIONS,
    DEPARTMENT_OPTIONS,
    SITUATION_BEFORE_CONTRACT_OPTIONS,
    REGIME_SOCIAL_OPTIONS,
    DIPLOMA_PREPARED_OPTIONS,
    LAST_CLASS_OPTIONS,
    HIGHEST_DIPLOMA_OPTIONS,
    FORMATION_SOUHAITEE_OPTIONS,
    KNOW_RUSH_SCHOOL_OPTIONS,
    YES_NO_OPTIONS
} from '../../constants/formOptions';

interface CandidateDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: any;
    loading: boolean;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    onEdit?: () => void;
    editForm: any;
    setEditForm: (val: any) => void;
    handleSaveEdit: () => Promise<void>;
    handleDelete: () => Promise<void>;
    isSaving: boolean;
    isDeleting: boolean;
    onRelaunch?: (candidate: any) => void;
}

const CandidateDetailsModal: React.FC<CandidateDetailsModalProps> = ({
    isOpen,
    onClose,
    candidate,
    loading,
    isEditing,
    setIsEditing,
    onEdit,
    editForm,
    setEditForm,
    handleSaveEdit,
    handleDelete,
    isSaving,
    isDeleting,
    onRelaunch
}) => {
    const [activeTab, setActiveTab] = useState<'personal' | 'school' | 'documents' | 'history'>('personal');
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; document.documentElement.style.overflow = ''; };
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && activeTab === 'history' && candidate) {
            const fetchHistory = async () => {
                setLoadingHistory(true);
                try {
                    const id = candidate.id || candidate.record_id;
                    const data = await api.getHistory(id);
                    setHistory(data);
                } catch (error) {
                    console.error("Failed to fetch history", error);
                } finally {
                    setLoadingHistory(false);
                }
            };
            fetchHistory();
        }
    }, [isOpen, activeTab, candidate]);

    if (!isOpen) return null;

    const info = candidate?.informations_personnelles || candidate || {};

    const tabs = [
        { id: 'personal', label: 'Infos Perso', icon: User },
        { id: 'school', label: 'Scolarité', icon: GraduationCap },
        { id: 'documents', label: 'Documents', icon: FileCheck },
        { id: 'history', label: 'Historique', icon: History },
    ];

    const renderInfoRow = (label: string, value: any, icon?: any) => (
        <div className="flex flex-col gap-1.5 p-4 bg-[#f8fafc] rounded-[4px] border border-[#e2e8f0] hover:border-[#fca5a5] transition-colors group">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm">
                {icon && <div className="text-slate-300 group-hover:text-rose-500 transition-colors">{React.createElement(icon, { size: 14 })}</div>}
                {value || 'N/A'}
            </div>
        </div>
    );

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-lg animate-in fade-in duration-300">
            <div className="bg-white relative z-[10000] rounded-[8px] w-full max-w-4xl h-[88vh] overflow-hidden shadow-2xl border border-[#e2e8f0] flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-[#e2e8f0] flex justify-between items-center bg-white">
                                        <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-[4px] bg-[#fee2e2] text-[#b91c1c] flex items-center justify-center">
                            <UserCircle size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Formulaire Étudiant</h2>
                            <p className="text-slate-400 font-bold text-sm">
                                {info.prenom} {info.nom_naissance}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 w-12 h-12 rounded-[4px] bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:rotate-90 transition-all duration-300 flex items-center justify-center">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-100 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-[4px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-rose-600 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-rose-500" size={48} />
                            <p className="text-slate-400 font-bold">Chargement des données...</p>
                        </div>
                    ) : isEditing ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'personal' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Prénom" value={editForm?.prenom || ""} onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })} />
                                        <Input label="Nom de naissance" value={editForm?.nom_naissance || ""} onChange={(e) => setEditForm({ ...editForm, nom_naissance: e.target.value })} />
                                        <Input label="Nom d'usage" value={editForm?.nom_usage || ""} onChange={(e) => setEditForm({ ...editForm, nom_usage: e.target.value })} />
                                        <Select
                                            label="Sexe"
                                            value={editForm?.sexe || ""}
                                            onChange={(e) => setEditForm({ ...editForm, sexe: e.target.value })}
                                            options={[
                                                { value: "Féminin", label: "Féminin" },
                                                { value: "Masculin", label: "Masculin" }
                                            ]}
                                        />
                                        <Input label="Date de naissance" type="date" value={editForm?.date_naissance || ""} onChange={(e) => setEditForm({ ...editForm, date_naissance: e.target.value })} />
                                        <Select
                                            label="Nationalité"
                                            value={editForm?.nationalite || ""}
                                            onChange={(e) => setEditForm({ ...editForm, nationalite: e.target.value })}
                                            options={NATIONALITY_OPTIONS}
                                        />
                                        <Input label="Commune de naissance" value={editForm?.commune_naissance || ""} onChange={(e) => setEditForm({ ...editForm, commune_naissance: e.target.value })} />
                                        <Select
                                            label="Département de naissance"
                                            value={editForm?.departement || ""}
                                            onChange={(e) => setEditForm({ ...editForm, departement: e.target.value })}
                                            options={DEPARTMENT_OPTIONS}
                                        />
                                    </div>
                                    <div className="h-px bg-slate-100" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Adresse (Rue)" value={editForm?.rue_residence || editForm?.adresse_residence || ""} onChange={(e) => setEditForm({ ...editForm, rue_residence: e.target.value, adresse_residence: e.target.value })} />
                                        <Input label="Code postal" value={editForm?.code_postal || ""} onChange={(e) => setEditForm({ ...editForm, code_postal: e.target.value })} />
                                        <Input label="Ville" value={editForm?.ville || ""} onChange={(e) => setEditForm({ ...editForm, ville: e.target.value })} />
                                        <Input label="Email" type="email" value={editForm?.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                                        <Input label="Téléphone" value={editForm?.telephone || ""} onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })} />
                                        <Input label="NIR" value={editForm?.nir || ""} onChange={(e) => setEditForm({ ...editForm, nir: e.target.value })} />
                                    </div>
                                    <div className="h-px bg-slate-100" />
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Représentant légal 1</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="Nom (Rep 1)" value={editForm?.nom_representant_legal || ""} onChange={(e) => setEditForm({ ...editForm, nom_representant_legal: e.target.value })} />
                                            <Input label="Prénom (Rep 1)" value={editForm?.prenom_representant_legal || ""} onChange={(e) => setEditForm({ ...editForm, prenom_representant_legal: e.target.value })} />
                                            <Input label="Lien (Rep 1)" value={editForm?.lien_parente_legal || ""} onChange={(e) => setEditForm({ ...editForm, lien_parente_legal: e.target.value })} />
                                            <Input label="Téléphone (Rep 1)" value={editForm?.numero_legal || ""} onChange={(e) => setEditForm({ ...editForm, numero_legal: e.target.value })} />
                                            <Input label="Email (Rep 1)" value={editForm?.courriel_legal || ""} onChange={(e) => setEditForm({ ...editForm, courriel_legal: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="h-px bg-slate-100" />
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Représentant légal 2</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="Nom (Rep 2)" value={editForm?.nom_representant_legal2 || ""} onChange={(e) => setEditForm({ ...editForm, nom_representant_legal2: e.target.value })} />
                                            <Input label="Prénom (Rep 2)" value={editForm?.prenom_representant_legal2 || ""} onChange={(e) => setEditForm({ ...editForm, prenom_representant_legal2: e.target.value })} />
                                            <Input label="Lien (Rep 2)" value={editForm?.lien_parente_legal2 || ""} onChange={(e) => setEditForm({ ...editForm, lien_parente_legal2: e.target.value })} />
                                            <Input label="Téléphone (Rep 2)" value={editForm?.numero_legal2 || ""} onChange={(e) => setEditForm({ ...editForm, numero_legal2: e.target.value })} />
                                            <Input label="Email (Rep 2)" value={editForm?.courriel_legal2 || ""} onChange={(e) => setEditForm({ ...editForm, courriel_legal2: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="h-px bg-slate-100" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            label="Situation avant le contrat"
                                            value={editForm?.situation || ""}
                                            onChange={(e) => setEditForm({ ...editForm, situation: e.target.value })}
                                            options={SITUATION_BEFORE_CONTRACT_OPTIONS}
                                        />
                                        <Select
                                            label="Régime social"
                                            value={editForm?.regime_social || ""}
                                            onChange={(e) => setEditForm({ ...editForm, regime_social: e.target.value })}
                                            options={REGIME_SOCIAL_OPTIONS}
                                        />
                                        <Select
                                            label="Sportif de haut niveau"
                                            value={editForm?.declare_inscription_sportif_haut_niveau ? "Oui" : "Non"}
                                            onChange={(e) => setEditForm({ ...editForm, declare_inscription_sportif_haut_niveau: e.target.value === "Oui" })}
                                            options={YES_NO_OPTIONS}
                                        />
                                        <Select
                                            label="Projet création entreprise"
                                            value={editForm?.declare_avoir_projet_creation_reprise_entreprise ? "Oui" : "Non"}
                                            onChange={(e) => setEditForm({ ...editForm, declare_avoir_projet_creation_reprise_entreprise: e.target.value === "Oui" })}
                                            options={YES_NO_OPTIONS}
                                        />
                                        <Select
                                            label="Travailleur handicapé (RQTH)"
                                            value={editForm?.declare_travailleur_handicape ? "Oui" : "Non"}
                                            onChange={(e) => setEditForm({ ...editForm, declare_travailleur_handicape: e.target.value === "Oui" })}
                                            options={YES_NO_OPTIONS}
                                        />
                                        <Select
                                            label="Alternance"
                                            value={editForm?.alternance ? "Oui" : "Non"}
                                            onChange={(e) => setEditForm({ ...editForm, alternance: e.target.value === "Oui" })}
                                            options={YES_NO_OPTIONS}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'school' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            label="Formation souhaitée"
                                            value={editForm?.formation_souhaitee || ""}
                                            onChange={(e) => setEditForm({ ...editForm, formation_souhaitee: e.target.value })}
                                            options={FORMATION_SOUHAITEE_OPTIONS}
                                        />
                                        <Select
                                            label="Dernier diplôme préparé"
                                            value={editForm?.dernier_diplome_prepare || ""}
                                            onChange={(e) => setEditForm({ ...editForm, dernier_diplome_prepare: e.target.value })}
                                            options={DIPLOMA_PREPARED_OPTIONS}
                                        />
                                        <Select
                                            label="Dernière classe suivie"
                                            value={editForm?.derniere_classe || ""}
                                            onChange={(e) => setEditForm({ ...editForm, derniere_classe: e.target.value })}
                                            options={LAST_CLASS_OPTIONS}
                                        />
                                        <Select
                                            label="Diplôme le plus élevé obtenu"
                                            value={editForm?.bac || ""}
                                            onChange={(e) => setEditForm({ ...editForm, bac: e.target.value })}
                                            options={HIGHEST_DIPLOMA_OPTIONS}
                                        />
                                        <Input label="Intitulé précis diplôme" value={editForm?.intitulePrecisDernierDiplome || ""} onChange={(e) => setEditForm({ ...editForm, intitulePrecisDernierDiplome: e.target.value })} />
                                        <Select
                                            label="Entreprise d'accueil ?"
                                            value={editForm?.entreprise_d_accueil || "Non"}
                                            onChange={(e) => setEditForm({ ...editForm, entreprise_d_accueil: e.target.value })}
                                            options={[{ value: "Oui", label: "Oui" }, { value: "En recherche", label: "En recherche" }, { value: "Non", label: "Non" }]}
                                        />
                                        <Select
                                            label="Connu Rush School via"
                                            value={editForm?.connaissance_rush_how || ""}
                                            onChange={(e) => setEditForm({ ...editForm, connaissance_rush_how: e.target.value })}
                                            options={KNOW_RUSH_SCHOOL_OPTIONS}
                                        />
                                    </div>
                                    <div className="h-px bg-slate-100" />
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivations et projet professionnel</label>
                                            <textarea
                                                value={editForm?.motivation_projet_professionnel || ""}
                                                onChange={(e) => setEditForm({ ...editForm, motivation_projet_professionnel: e.target.value })}
                                                rows={4}
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-[4px] text-[15px] font-bold text-slate-700 placeholder:text-slate-300 transition-all duration-300 outline-none focus:bg-white focus:border-rose-500 focus:shadow-rose-500/10 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'documents' && (
                                <div className="text-center py-10 bg-slate-50 rounded-[4px] border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold">Les documents se gèrent via le téléchargement direct dans la vue consultation.</p>
                                </div>
                            )}
                            {activeTab === 'history' && (
                                <div className="text-center py-10 bg-slate-50 rounded-[4px] border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold mb-4">L'historique est lié à l'étudiant mais n'est pas éditable dans ce formulaire.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'personal' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderInfoRow("Prénom", info.prenom, User)}
                                    {renderInfoRow("Nom", info.nom_naissance, User)}
                                    {renderInfoRow("Email", info.email, Mail)}
                                    {renderInfoRow("Téléphone", info.telephone, Phone)}
                                    {renderInfoRow("Sexe", info.sexe, User)}
                                    {renderInfoRow("Numéro Inscription", info.numero_inscription, Clock)}
                                    {renderInfoRow("Date de naissance", info.date_naissance, Clock)}
                                    {renderInfoRow("Nationalité", info.nationalite, ShieldCheck)}
                                    {renderInfoRow("Commune de naissance", info.commune_naissance, MapPin)}
                                    <div className="md:col-span-2">
                                        {renderInfoRow("Adresse de résidence", info.adresse_residence, MapPin)}
                                    </div>
                                    {renderInfoRow("Situation", info.situation, Briefcase)}
                                    {renderInfoRow("Régime social", info.regime_social, ShieldCheck)}
                                </div>
                            )}

                            {activeTab === 'school' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderInfoRow("Formation souhaitée", info.formation_souhaitee, GraduationCap)}
                                    {renderInfoRow("Dernier diplôme préparé", info.dernier_diplome_prepare, GraduationCap)}
                                    {renderInfoRow("Dernière classe", info.derniere_classe, GraduationCap)}
                                    {renderInfoRow("BAC", info.bac, GraduationCap)}
                                    {renderInfoRow("Intitulé précis diplôme", info.intitulePrecisDernierDiplome, FileText)}
                                    {renderInfoRow("Entreprise d'accueil", info.entreprise_d_accueil, Building2)}
                                    {renderInfoRow("Connaissance Rush How", info.connaissance_rush_how, FileText)}
                                    <div className="md:col-span-2">
                                        {renderInfoRow("Motivation", info.motivation_projet_professionnel, FileText)}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="space-y-4">
                                    {candidate.documents && Object.entries(candidate.documents).filter(([key]) => key !== 'record_id').map(([key, doc]: [string, any]) => (
                                        <div key={key} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[4px] hover:border-rose-200 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-[4px] flex items-center justify-center ${doc.uploaded ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
                                                    {doc.uploaded ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-slate-700 uppercase tracking-tight">{doc.document_type || key.replace(/_/g, ' ')}</div>
                                                    <div className={`text-[9px] font-bold uppercase tracking-widest ${doc.uploaded ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                        {doc.uploaded ? 'Validé' : 'Manquant'}
                                                    </div>
                                                </div>
                                            </div>
                                            {doc.uploaded && (
                                                <button className="p-2 rounded-[4px] bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                                    <Download size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <HistoryTimeline history={history} loading={loadingHistory} />
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-[#e2e8f0] bg-white flex justify-between items-center">
                    <div className="flex gap-3">
                        {!isEditing && (
                            <button
                                onClick={() => onEdit ? onEdit() : setIsEditing(true)}
                                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-[4px] font-black text-[10px] uppercase tracking-widest hover:border-rose-500 hover:text-rose-500 transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={14} /> Modifier
                            </button>
                        )}
                        {isEditing && (
                            <Button
                                variant="outline"
                                onClick={handleDelete}
                                isLoading={isDeleting}
                                className="!border-rose-200 !text-rose-500 hover:!bg-rose-50"
                                leftIcon={<Trash2 size={18} />}
                            >
                                Supprimer
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose}>Fermer</Button>
                        {isEditing ? (
                            <Button variant="danger" onClick={handleSaveEdit} isLoading={isSaving} leftIcon={<Save size={18} />}>Enregistrer</Button>
                        ) : (
                            <Button
                                variant="danger"
                                leftIcon={<Mail size={18} />}
                                onClick={() => onRelaunch && onRelaunch(candidate)}
                            >
                                Relancer
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    , document.body);
};

export default CandidateDetailsModal;