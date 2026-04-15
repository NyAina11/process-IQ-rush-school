import React, { useState } from 'react';
import { X, Download, Upload, Clock, CheckCircle2, AlertCircle, XCircle, Calendar, User, Building2, FileText } from 'lucide-react';

interface OpcoDossierDetailProps {
    dossier: any;
    isOpen: boolean;
    onClose: () => void;
    onSync?: (id: string) => Promise<void>;
    onResubmit?: (id: string) => Promise<void>;
}

const OpcoDossierDetail: React.FC<OpcoDossierDetailProps> = ({
    dossier,
    isOpen,
    onClose,
    onSync,
    onResubmit,
}) => {
    const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'history'>('info');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !dossier) return null;

    // Calcul du statut de délai
    const calculateDelayStatus = () => {
        if (!dossier.dateLimiteEnvoi) return null;
        
        const today = new Date();
        const deadline = new Date(dossier.dateLimiteEnvoi);
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
            daysLeft: diffDays,
            isOverdue: diffDays < 0,
            isCritical: diffDays >= 0 && diffDays <= 2,
        };
    };

    const delayStatus = calculateDelayStatus();

    // Couleurs statut
    const getStatusColor = (status: string) => {
        const colors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
            'BROUILLON': { bg: 'bg-slate-100', text: 'text-slate-700', icon: <FileText size={14} /> },
            'EN_PREPARATION': { bg: 'bg-slate-200', text: 'text-slate-700', icon: <Clock size={14} /> },
            'PRET_A_ENVOYER': { bg: 'bg-sky-50', text: 'text-sky-700', icon: <Clock size={14} /> },
            'ENVOYE': { bg: 'bg-amber-50', text: 'text-amber-700', icon: <CheckCircle2 size={14} /> },
            'EN_ATTENTE_VALIDATION': { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <Clock size={14} /> },
            'COMPLEMENT_DEMANDE': { bg: 'bg-orange-50', text: 'text-orange-700', icon: <AlertCircle size={14} /> },
            'ACCEPTE': { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 size={14} /> },
            'REFUSE': { bg: 'bg-rose-50', text: 'text-rose-700', icon: <XCircle size={14} /> },
            'REFUSE_DEFINITIF': { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle size={14} /> },
            'ANNULE': { bg: 'bg-slate-100', text: 'text-slate-700 line-through', icon: <XCircle size={14} /> },
            'CLOTURE': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle2 size={14} /> },
        };
        return colors[status] || colors['BROUILLON'];
    };

    const statusColor = getStatusColor(dossier.status || 'BROUILLON');

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                
                {/* Header */}
                <div className="bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] px-6 py-6 border-b border-[#e5e0f5] flex items-center justify-between">
                    <div className="flex-1">
                        <h2 className="text-[18px] font-bold text-white mb-1">Dossier OPCO</h2>
                        <p className="text-[12px] text-white/80">{dossier.opcoName || 'OPCO'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Onglets */}
                <div className="flex border-b border-[#e5e0f5] bg-[#f9f7ff] px-6">
                    {(['info', 'documents', 'history'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-[12px] font-semibold transition-all border-b-2 ${
                                activeTab === tab
                                    ? 'text-[#6d28d9] border-[#6d28d9]'
                                    : 'text-[#9ca3af] border-transparent hover:text-[#374151]'
                            }`}
                        >
                            {tab === 'info' && '📋 Informations'}
                            {tab === 'documents' && '📄 Documents'}
                            {tab === 'history' && '⏱️ Historique'}
                        </button>
                    ))}
                </div>

                {/* Contenu */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    
                    {/* Onglet Informations */}
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            {/* Statut Principal */}
                            <div className="bg-gradient-to-br from-[#f5f3ff] to-[#faf8ff] border border-[#e5e0f5] rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[12px] font-semibold text-[#6d28d9]">STATUT ACTUEL</span>
                                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold ${statusColor.bg} ${statusColor.text}`}>
                                        {statusColor.icon}
                                        {dossier.status || 'BROUILLON'}
                                    </span>
                                </div>
                                {delayStatus && (
                                    <div className={`text-[12px] font-medium ${delayStatus.isOverdue ? 'text-red-600' : delayStatus.isCritical ? 'text-orange-600' : 'text-emerald-600'}`}>
                                        {delayStatus.isOverdue 
                                            ? `Retard de ${Math.abs(delayStatus.daysLeft)} jour(s)` 
                                            : `${delayStatus.daysLeft} jour(s) avant deadline`}
                                    </div>
                                )}
                            </div>

                            {/* Grille d'informations */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Section Apprenti */}
                                <div className="bg-[#f9f7ff] border border-[#e5e0f5] rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <User size={16} className="text-[#6d28d9]" />
                                        <span className="text-[11px] font-bold text-[#6d28d9] uppercase">Apprenti</span>
                                    </div>
                                    <div className="text-[13px] font-semibold text-[#1e1b2e] mb-1">{dossier.apprentiNom || 'N/A'}</div>
                                    <div className="text-[11px] text-[#9ca3af]">Formation: {dossier.formationLabel || 'N/A'}</div>
                                </div>

                                {/* Section Employeur */}
                                <div className="bg-[#f9f7ff] border border-[#e5e0f5] rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Building2 size={16} className="text-[#6d28d9]" />
                                        <span className="text-[11px] font-bold text-[#6d28d9] uppercase">Employeur</span>
                                    </div>
                                    <div className="text-[13px] font-semibold text-[#1e1b2e] mb-1">{dossier.employerName || 'N/A'}</div>
                                    <div className="text-[11px] text-[#9ca3af]">SIRET: {dossier.employerSiret || 'N/A'}</div>
                                </div>

                                {/* Montant Annuel */}
                                <div className="bg-[#f9f7ff] border border-[#e5e0f5] rounded-xl p-4">
                                    <span className="text-[11px] font-bold text-[#6d28d9] uppercase block mb-2">Montant Annuel</span>
                                    <div className="text-[18px] font-bold text-[#1e1b2e]">
                                        {dossier.montantAnnuel ? `€${(dossier.montantAnnuel).toLocaleString('fr-FR')}` : 'Non renseigné'}
                                    </div>
                                </div>

                                {/* Montant Mensuel */}
                                <div className="bg-[#f9f7ff] border border-[#e5e0f5] rounded-xl p-4">
                                    <span className="text-[11px] font-bold text-[#6d28d9] uppercase block mb-2">Montant Mensuel</span>
                                    <div className="text-[18px] font-bold text-[#1e1b2e]">
                                        {dossier.montantMensuel ? `€${(dossier.montantMensuel).toLocaleString('fr-FR')}` : 'Non renseigné'}
                                    </div>
                                </div>

                                {/* Montant Accordé */}
                                {dossier.montantAccorde && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                        <span className="text-[11px] font-bold text-emerald-700 uppercase block mb-2">Montant Accordé</span>
                                        <div className="text-[18px] font-bold text-emerald-700">
                                            €{(dossier.montantAccorde).toLocaleString('fr-FR')}
                                        </div>
                                    </div>
                                )}

                                {/* OPCO */}
                                <div className="bg-[#f9f7ff] border border-[#e5e0f5] rounded-xl p-4">
                                    <span className="text-[11px] font-bold text-[#6d28d9] uppercase block mb-2">OPCO</span>
                                    <div className="text-[13px] font-semibold text-[#1e1b2e]">{dossier.opcoName || 'N/A'}</div>
                                    {dossier.opcoCode && <div className="text-[11px] text-[#9ca3af]">Code: {dossier.opcoCode}</div>}
                                </div>
                            </div>

                            {/* Section Dates */}
                            <div className="space-y-3">
                                <h3 className="text-[12px] font-bold text-[#1e1b2e] uppercase">CALENDRIER</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#f9f7ff] border border-[#e5e0f5] rounded-lg p-3 flex items-center gap-3">
                                        <Calendar size={16} className="text-[#6d28d9] flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="text-[10px] text-[#9ca3af] font-semibold">Date limite d'envoi</div>
                                            <div className="text-[12px] font-semibold text-[#1e1b2e]">
                                                {dossier.dateLimiteEnvoi ? new Date(dossier.dateLimiteEnvoi).toLocaleDateString('fr-FR') : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#f9f7ff] border border-[#e5e0f5] rounded-lg p-3 flex items-center gap-3">
                                        <Calendar size={16} className="text-[#6d28d9] flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="text-[10px] text-[#9ca3af] font-semibold">Date d'envoi OPCO</div>
                                            <div className="text-[12px] font-semibold text-[#1e1b2e]">
                                                {dossier.dateEnvoiOpco ? new Date(dossier.dateEnvoiOpco).toLocaleDateString('fr-FR') : 'Non envoyé'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#f9f7ff] border border-[#e5e0f5] rounded-lg p-3 flex items-center gap-3">
                                        <Calendar size={16} className="text-[#6d28d9] flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="text-[10px] text-[#9ca3af] font-semibold">Date réponse OPCO</div>
                                            <div className="text-[12px] font-semibold text-[#1e1b2e]">
                                                {dossier.dateReponseOpco ? new Date(dossier.dateReponseOpco).toLocaleDateString('fr-FR') : 'En attente'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#f9f7ff] border border-[#e5e0f5] rounded-lg p-3 flex items-center gap-3">
                                        <Clock size={16} className="text-[#6d28d9] flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="text-[10px] text-[#9ca3af] font-semibold">Dernière synchro</div>
                                            <div className="text-[12px] font-semibold text-[#1e1b2e]">
                                                {dossier.lastSyncedAt ? new Date(dossier.lastSyncedAt).toLocaleDateString('fr-FR') : 'Jamais'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Motif refus si applicable */}
                            {dossier.motifRefus && (
                                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                                    <div className="text-[12px] font-bold text-rose-700 uppercase mb-2">Motif du refus</div>
                                    <p className="text-[13px] text-rose-700 leading-relaxed">{dossier.motifRefus}</p>
                                </div>
                            )}

                            {/* Numéro dossier OPCO */}
                            {dossier.numeroDossierOpco && (
                                <div className="bg-[#f9f7ff] border border-[#e5e0f5] rounded-xl p-4">
                                    <div className="text-[12px] font-bold text-[#6d28d9] uppercase mb-2">Numéro Dossier OPCO</div>
                                    <div className="text-[14px] font-mono font-semibold text-[#1e1b2e]">{dossier.numeroDossierOpco}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Onglet Documents */}
                    {activeTab === 'documents' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[13px] font-bold text-[#1e1b2e]">Documents joints</h3>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#6d28d9] text-white rounded-lg text-[11px] font-semibold hover:bg-[#5831ad] transition-all">
                                    <Upload size={12} /> Ajouter
                                </button>
                            </div>
                            
                            {dossier.documents && dossier.documents.length > 0 ? (
                                <div className="space-y-2">
                                    {dossier.documents.map((doc: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between bg-[#f9f7ff] border border-[#e5e0f5] rounded-lg p-3">
                                            <div className="flex items-center gap-3 flex-1">
                                                <FileText size={16} className="text-[#6d28d9]" />
                                                <div className="flex-1">
                                                    <div className="text-[12px] font-semibold text-[#1e1b2e]">{doc.filename || doc.type}</div>
                                                    <div className="text-[10px] text-[#9ca3af]">{doc.type}</div>
                                                </div>
                                            </div>
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-[#f0ebff] rounded-lg transition-all">
                                                <Download size={14} className="text-[#6d28d9]" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-[#f9f7ff] border border-dashed border-[#e5e0f5] rounded-lg">
                                    <FileText size={28} className="mx-auto text-[#d1d5db] mb-2" />
                                    <p className="text-[12px] text-[#9ca3af]">Aucun document pour le moment</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Onglet Historique */}
                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <h3 className="text-[13px] font-bold text-[#1e1b2e]">Historique des tentatives</h3>
                            
                            {dossier.syncAttempts && dossier.syncAttempts.length > 0 ? (
                                <div className="space-y-3">
                                    {dossier.syncAttempts.map((attempt: any, idx: number) => (
                                        <div key={idx} className="flex gap-4">
                                            {/* Timeline dot */}
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    attempt.success ? 'bg-emerald-100' : 'bg-rose-100'
                                                }`}>
                                                    {attempt.success ? (
                                                        <CheckCircle2 size={16} className="text-emerald-600" />
                                                    ) : (
                                                        <XCircle size={16} className="text-rose-600" />
                                                    )}
                                                </div>
                                                {idx < dossier.syncAttempts.length - 1 && (
                                                    <div className="w-0.5 h-12 bg-[#e5e0f5] my-1" />
                                                )}
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="flex-1 pt-1 pb-2">
                                                <div className="bg-[#f9f7ff] border border-[#e5e0f5] rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-[12px] font-bold text-[#1e1b2e] capitalize">
                                                            {attempt.action.replace('_', ' ')}
                                                        </div>
                                                        <div className="text-[10px] text-[#9ca3af]">
                                                            {new Date(attempt.attemptedAt).toLocaleString('fr-FR')}
                                                        </div>
                                                    </div>
                                                    {attempt.remoteStatus && (
                                                        <div className="mb-1">
                                                            <span className="text-[10px] text-[#6d28d9] font-semibold">Statut distant: </span>
                                                            <span className="text-[11px] text-[#374151]">{attempt.remoteStatus}</span>
                                                        </div>
                                                    )}
                                                    {attempt.message && (
                                                        <p className="text-[11px] text-[#374151]">{attempt.message}</p>
                                                    )}
                                                    <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded text-[10px] font-semibold ${
                                                        attempt.success 
                                                            ? 'bg-emerald-50 text-emerald-700' 
                                                            : 'bg-rose-50 text-rose-700'
                                                    }`}>
                                                        {attempt.success ? '✓ Succès' : '✗ Erreur'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-[#f9f7ff] border border-dashed border-[#e5e0f5] rounded-lg">
                                    <Clock size={28} className="mx-auto text-[#d1d5db] mb-2" />
                                    <p className="text-[12px] text-[#9ca3af]">Aucun historique disponible</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="bg-[#f9f7ff] border-t border-[#e5e0f5] px-6 py-4 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 bg-[#f3f0ff] text-[#6d28d9] border border-[#e5e0f5] rounded-lg text-[12px] font-semibold hover:bg-[#ede9fe] transition-all"
                    >
                        Fermer
                    </button>
                    {onSync && (
                        <button
                            onClick={async () => {
                                setIsLoading(true);
                                try {
                                    await onSync(dossier._id || dossier.id);
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                            disabled={isLoading}
                            className="px-4 py-2.5 bg-[#6d28d9] text-white border border-[#6d28d9] rounded-lg text-[12px] font-semibold hover:bg-[#5831ad] transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Synchro...' : 'Synchroniser'}
                        </button>
                    )}
                    {onResubmit && (
                        <button
                            onClick={async () => {
                                setIsLoading(true);
                                try {
                                    await onResubmit(dossier._id || dossier.id);
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                            disabled={isLoading}
                            className="px-4 py-2.5 bg-emerald-600 text-white border border-emerald-600 rounded-lg text-[12px] font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Envoi...' : 'Renvoyer'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OpcoDossierDetail;
