import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Briefcase,
    CheckCircle2,
    FileText,
    Printer,
    Upload,
    Calendar,
    Search,
    Download,
    ExternalLink,
    Loader2,
    ArrowRight,
    Users,
    FileCheck,
    Save,
    X,
    GraduationCap,
    Building,
    UserCheck,
    ChevronLeft,
    AlertCircle,
    RotateCcw,
    PenTool,
    Info,
    Activity,
    ChevronDown,
    ChevronUp,
    Target
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import { AdmissionTab } from '../types';
import QuestionnaireForm from './QuestionnaireForm';
import EntrepriseForm from './EntrepriseForm';
import { api } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import { useAppStore } from '../store/useAppStore';
import { useApi } from '../hooks/useApi';
import { useCandidates, getC } from '../hooks/useCandidates';
import { formatFormation } from '../utils/formatters';

// --- CONSTANTS ---

const FORMATION_FORMS: Record<string, string> = {
    mco: "https://docs.google.com/forms/d/e/1FAIpQLSc_Y9Y9_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y/viewform?embedded=true",
    ndrc: "https://docs.google.com/forms/d/e/1FAIpQLSeDDzl2VDR__aY776N_7auk4uAZc04uC6mQNUsRNOr9D3eCmw/viewform?embedded=true",
    bachelor: "https://docs.google.com/forms/d/e/1FAIpQLSdzOg66p81XV9Ghb4dS6xP2r-BCw4qiGECU4F01Vs7VlrJNCQ/viewform?embedded=true",
    tpntc: "https://docs.google.com/forms/d/e/1FAIpQLSfW-Gi40ZBpU9zymrYBZ05P8s2TSSL88OYwkp5lzPSNDXTnhA/viewform?embedded=true",
};

const REQUIRED_DOCUMENTS = [
    { id: 'cv', title: "CV", desc: "Curriculum Vitae à jour" },
    { id: 'cni', title: "Carte d'Identité", desc: "Recto-verso de la CNI" },
    { id: 'lettre', title: "Lettre de motivation", desc: "Exposez vos motivations" },
    { id: 'vitale', title: "Carte Vitale", desc: "Attestation de droits" },
    { id: 'diplome', title: "Dernier Diplôme", desc: "Copie du dernier diplôme" },
];

const ADMIN_DOCS = [
    { id: 'atre', title: "Fiche ATRE", subtitle: "Autorisation de Travail et Renseignements", desc: "Information entreprise et tuteur", color: 'orange', btnText: 'Générer', gradient: 'from-orange-400 to-orange-600', shadow: 'shadow-orange-500/20' },
    { id: 'renseignements', title: "Fiche de renseignements", subtitle: "Informations personnelles", desc: "Coordonnées et état civil", color: 'blue', btnText: 'Générer', gradient: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/20' },
    { id: 'cerfa', title: "Fiche CERFA", subtitle: "Contrat d'apprentissage", desc: "Génération du contrat officiel FA13", color: 'emerald', btnText: 'Générer', gradient: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20' },
    { id: 'compte-rendu', title: "Compte Rendu", subtitle: "Visite Entretien", desc: "Génération du Compte Rendu de Visite", color: 'pink', btnText: 'Générer', gradient: 'from-pink-400 to-pink-600', shadow: 'shadow-pink-500/20' },
    { id: 'convention-apprentissage', title: "Convention", subtitle: "Formation Apprentissage", desc: "Convention de formation apprentissage complète", color: 'indigo', btnText: 'Générer', gradient: 'from-indigo-400 to-indigo-600', shadow: 'shadow-indigo-500/20' },
    { id: 'reglement', title: "Règlement intérieur", subtitle: "Engagement étudiant", desc: "Document à lire et signer", color: 'green', btnText: 'Signer', gradient: 'from-green-400 to-green-600', shadow: 'shadow-green-500/20' },
    { id: 'connaissance', title: "Prise de connaissance", subtitle: "Attestation documents", desc: "Charte informatique, Livret d'accueil...", color: 'purple', btnText: 'Signer', gradient: 'from-purple-400 to-purple-600', shadow: 'shadow-purple-500/20' },
    { id: 'livret', title: "Livret d'apprentissage", subtitle: "Suivi pédagogique", desc: "Document de liaison CFA/Entreprise", color: 'cyan', btnText: 'Générer', gradient: 'from-cyan-400 to-cyan-600', shadow: 'shadow-cyan-500/20' },
];

const FORMATION_CARDS = [
    { id: 'mco', title: 'BTS MCO', subtitle: 'Management Commercial Opérationnel', color: 'blue', gradient: 'from-blue-500 to-blue-600' },
    { id: 'ndrc', title: 'BTS NDRC', subtitle: 'Négociation et Digitalisation de la Relation Client', color: 'green', gradient: 'from-emerald-500 to-emerald-600' },
    { id: 'bachelor', title: 'BACHELOR RDC', subtitle: 'Responsable Développement Commercial', color: 'purple', gradient: 'from-purple-500 to-purple-600' },
    { id: 'tpntc', title: 'TP NTC', subtitle: 'Titre Pro Négociateur Technico-Commercial', color: 'orange', gradient: 'from-orange-500 to-orange-600' }
];

interface AdmissionViewProps {
    selectedStudent?: any;
    selectedTab?: AdmissionTab | null;
    onClearSelection?: () => void;
}

// --- COMPONENTS ---

const SuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[4px] p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100 animate-slide-up text-center border border-[#e2e8f0]">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[4px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={40} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Félicitations !</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    Le document a été généré et envoyé avec succès.
                </p>
                <Button variant="success" size="lg" className="w-full" onClick={onClose}>
                    Continuer
                </Button>
            </div>
        </div>
    );
};

const NirAccordion = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white border border-[#6B3CD2]/10 rounded-[4px] mb-8 overflow-hidden transition-all shadow-sm">
            <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-all"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="w-9 h-9 bg-brand/5 text-brand rounded-[4px] border border-brand/10 flex items-center justify-center shrink-0">
                    <Info size={18} />
                </div>
                <div className="flex-1">
                    <h4 className="text-[14px] font-bold text-[#18162A]">Comment récupérer son NIR (Numéro de Sécurité Sociale) ?</h4>
                    <p className="text-[12px] text-slate-400 font-medium">Cliquez pour voir les étapes à suivre</p>
                </div>
                <div className={`text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} />
                </div>
            </div>
            {isOpen && (
                <div className="p-5 pt-0 border-t border-slate-50 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                        <div className="bg-slate-50 p-4 rounded-[4px] border border-slate-100">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand/10 text-brand text-[12px] font-bold mb-3">1</span>
                            <h5 className="text-[13px] font-bold text-slate-800 mb-1">Carte Vitale</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed">Le NIR est inscrit au dos de votre carte Vitale (15 chiffres).</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-[4px] border border-slate-100">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand/10 text-brand text-[12px] font-bold mb-3">2</span>
                            <h5 className="text-[13px] font-bold text-slate-800 mb-1">Attestation Ameli</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed">Connectez-vous sur <a href="https://ameli.fr" target="_blank" rel="noreferrer" className="text-brand hover:underline font-bold">ameli.fr</a> pour la télécharger.</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-[4px] border border-slate-100">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand/10 text-brand text-[12px] font-bold mb-3">3</span>
                            <h5 className="text-[13px] font-bold text-slate-800 mb-1">Bulletins de paye</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed">Votre NIR apparaît sur vos bulletins si vous avez déjà travaillé.</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-[4px] border border-slate-100">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand/10 text-brand text-[12px] font-bold mb-3">4</span>
                            <h5 className="text-[13px] font-bold text-slate-800 mb-1">CPAM</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed">Contactez votre CPAM avec une pièce d'identité en dernier recours.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-brand/5 p-3 rounded-[4px] border border-brand/10 text-[11px] text-brand font-medium">
                        <Info size={14} className="shrink-0" />
                        <p>Le NIR est composé de 13 chiffres + une clé de 2 chiffres (ex: 1 85 12 75 108 123 45)</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const StepItem = ({ step, label, isActive, isCompleted }: { step: number, label: string, isActive: boolean, isCompleted: boolean }) => (
    <div className="flex flex-col items-center gap-2 relative z-10">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] transition-all duration-300 ${isCompleted
            ? 'bg-[#6d28d9] border-2 border-[#6d28d9] text-white shadow-md shadow-[#6d28d9]/30'
            : isActive
                ? 'bg-[#6d28d9] border-2 border-[#6d28d9] text-white shadow-lg shadow-[#6d28d9]/30 ring-4 ring-[#6d28d9]/15'
                : 'bg-white border-2 border-[#e5e0f5] text-[#9ca3af]'
            }`}>
            {isCompleted ? (
                <svg viewBox="0 0 20 20" fill="none" width="13" height="13">
                    <path d="M4 10l4.5 4.5 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : step}
        </div>
        <span style={{ fontFamily: "'DM Sans', sans-serif" }} className={`text-[9px] font-bold uppercase tracking-[0.1em] transition-colors duration-300 ${isActive ? 'text-[#6d28d9]' : isCompleted ? 'text-[#6d28d9]' : 'text-[#9ca3af]'}`}>{label}</span>
    </div>
);

const StepLine = ({ isCompleted }: { isCompleted: boolean }) => (
    <div className="relative flex-1 h-[2px] mx-2 mb-[34px] rounded-full overflow-hidden bg-[#e5e0f5]">
        <div className={`absolute inset-y-0 left-0 rounded-full bg-[#6d28d9] transition-all duration-500 ${isCompleted ? 'w-full' : 'w-0'}`} />
    </div>
);

const EvaluationGrid = ({ studentData, onNext }: { studentData: any, onNext?: () => void }) => {
    const { showToast } = useAppStore();
    const [evalData, setEvalData] = useState({
        candidatNom: '',
        email: '',
        heureEntretien: '',
        chargeAdmission: '',
        dateEntretien: '',
        formation: '',
        critere1: 0,
        critere2: 0,
        critere3: 0,
        critere4: 0,
        commentaires: ''
    });

    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [pdfUploadStatus, setPdfUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);

    const validateForm = () => {
        const newErrors: Record<string, boolean> = {};
        if (!evalData.candidatNom) newErrors.candidatNom = true;
        if (!evalData.email) newErrors.email = true;
        if (!evalData.dateEntretien) newErrors.dateEntretien = true;
        if (!evalData.heureEntretien) newErrors.heureEntretien = true;
        if (!evalData.chargeAdmission) newErrors.chargeAdmission = true;
        if (!evalData.formation) newErrors.formation = true;

        // Criterias (must be > 0)
        if (evalData.critere1 === 0) newErrors.critere1 = true;
        if (evalData.critere2 === 0) newErrors.critere2 = true;
        if (evalData.critere3 === 0) newErrors.critere3 = true;
        if (evalData.critere4 === 0) newErrors.critere4 = true;

        setErrors(newErrors);

        const hasErrors = Object.keys(newErrors).length > 0;
        if (hasErrors) {
            showToast("Veuillez remplir tous les champs obligatoires (marqués en rouge).", "error");
        }
        return !hasErrors;
    };

    useEffect(() => {
        if (studentData) {
            const data = studentData.data || studentData;
            setEvalData(prev => ({
                ...prev,
                candidatNom: `${data.prenom || ''} ${data.nom_naissance || ''}`.trim(),
                email: data.email || data.fields?.email || data.fields?.['E-mail'] || data.informations_personnelles?.email || '',
                formation: data.formation_souhaitee || '',
                dateEntretien: new Date().toISOString().split('T')[0]
            }));
        }
    }, [studentData]);

    const totalScore = (Number(evalData.critere1) || 0) +
        (Number(evalData.critere2) || 0) +
        (Number(evalData.critere3) || 0) +
        (Number(evalData.critere4) || 0);

    const getAppreciation = (score: number) => {
        if (score === 0) return '-';
        if (score <= 8) return 'Insuffisant';
        if (score <= 12) return 'Passable';
        if (score <= 16) return 'Satisfaisant';
        return 'Excellent';
    };

    const resetEvaluation = () => {
        if (window.confirm("Voulez-vous vraiment réinitialiser la grille ?")) {
            setEvalData({
                candidatNom: '',
                email: '',
                heureEntretien: '',
                chargeAdmission: '',
                dateEntretien: '',
                formation: '',
                critere1: 0,
                critere2: 0,
                critere3: 0,
                critere4: 0,
                commentaires: ''
            });
        }
    };

    const [isSaving, setIsSaving] = useState(false);

    const generateEvaluationPDFBlob = () => {
        const doc = new jsPDF();
        const date = new Date().toLocaleDateString('fr-FR');
        const year = new Date().getFullYear();

        const addHeader = (pageNum: number) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('RUSH SCHOOL - COMPTE RENDU D\'ENTRETIEN', 20, 15);

            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.line(20, 18, 190, 18);

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(`CFA Process IQ • Admissions ${year}`, 20, 23);
            doc.text(`Page ${pageNum}`, 190, 23, { align: 'right' });
        };

        addHeader(1);

        // Candidate Info
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(20, 35, 170, 55, 3, 3, 'F');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text('CANDIDAT', 25, 45);
        doc.setTextColor(30, 41, 59);
        doc.text(evalData.candidatNom || 'Non renseigné', 25, 52);

        doc.setTextColor(100, 116, 139);
        doc.text('E-MAIL', 110, 45);
        doc.setTextColor(30, 41, 59);
        doc.text(evalData.email || 'Non renseigné', 110, 52);

        doc.setTextColor(100, 116, 139);
        doc.text('FORMATION VISÉE', 25, 65);
        doc.setTextColor(30, 41, 59);
        doc.text(formatFormation(evalData.formation) || 'Non renseignée', 25, 72);

        doc.setTextColor(100, 116, 139);
        doc.text('CHARGÉ D\'ADMISSION', 110, 65);
        doc.setTextColor(30, 41, 59);
        doc.text(evalData.chargeAdmission || 'Non renseigné', 110, 72);

        doc.setTextColor(100, 116, 139);
        doc.text('DATE DE L\'ENTRETIEN', 25, 82);
        doc.setTextColor(30, 41, 59);
        doc.text(`${evalData.dateEntretien} à ${evalData.heureEntretien || '--:--'}`, 25, 88);

        // Evaluation Criterias
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('ÉVALUATION DES COMPÉTENCES', 20, 95);
        doc.line(20, 97, 85, 97);

        let y = 105;
        const criterias = [
            { id: 'critere1', title: 'Savoir-être et présentation', desc: 'Points forts, progression, curiosité, maturité.' },
            { id: 'critere2', title: 'Cohérence du projet', desc: 'Logique du parcours, motivation pour le programme.' },
            { id: 'critere3', title: 'Expériences et engagements', desc: 'Richesse des expériences, activités extra-scolaires.' },
            { id: 'critere4', title: 'Expression en Anglais', desc: 'Spontanéité et fluidité des réponses en anglais.' }
        ];

        criterias.forEach(c => {
            const score = Number(evalData[c.id as keyof typeof evalData]) || 0;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(c.title, 25, y);

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(c.desc, 25, y + 5);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(`${score} / 5`, 170, y + 3, { align: 'right' });

            y += 18;
        });

        // Observations
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('OBSERVATIONS & COMMENTAIRES', 20, y + 5);
        doc.line(20, y + 7, 95, y + 7);

        y += 15;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const comments = evalData.commentaires || "Aucune observation particulière n'a été signalée pour ce candidat.";
        const splitComments = doc.splitTextToSize(comments, 170);
        doc.text(splitComments, 20, y);

        // Footer & Final Result
        const finalY = 240;
        doc.setDrawColor(241, 245, 249);
        doc.line(20, finalY - 10, 190, finalY - 10);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('RÉSULTAT FINAL', 130, finalY);

        doc.setFontSize(24);
        doc.setTextColor(16, 185, 129); // Emerald-500
        doc.text(`${totalScore}`, 140, finalY + 15, { align: 'right' });
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text('/ 20', 142, finalY + 15);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text(getAppreciation(totalScore).toUpperCase(), 130, finalY + 25);

        // Signature Box
        doc.setDrawColor(226, 232, 240);
        doc.setLineDashPattern([2, 2], 0);
        doc.roundedRect(20, finalY, 80, 30, 2, 2, 'D');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Signature du chargé d\'admission', 60, finalY + 18, { align: 'center' });

        return doc.output('blob');
    };

    const saveEvaluation = async () => {
        if (!validateForm()) return;

        try {
            setIsSaving(true);
            setPdfUploadStatus('uploading');
            setPdfUploadError(null);

            // Automatic PDF generation and upload
            const pdfBlob = generateEvaluationPDFBlob();
            const studentEmail = evalData.email;

            try {
                const response = await api.submitInterviewResult(studentEmail, pdfBlob);
                console.log("✅ Interview PDF sent to backend");
                setPdfUploadStatus('success');
                showToast("Évaluation et compte-rendu envoyés avec succès !", "success");
            } catch (pdfError) {
                console.error("❌ PDF upload failed:", pdfError);
                setPdfUploadStatus('error');
                setPdfUploadError("Erreur lors de l'envoi du PDF au serveur.");
                showToast("Erreur lors de l'envoi du PDF.", "error");
            }

        } catch (error) {
            console.error('Error in saveEvaluation:', error);
            setPdfUploadStatus('error');
            setPdfUploadError("Erreur lors du traitement de l'évaluation.");
            showToast("Erreur lors du traitement de l'évaluation.", "error");
        } finally {
            setIsSaving(false);
        }
    };


    const handleScoreChange = (critere: string, value: number) => {
        setEvalData(prev => ({ ...prev, [critere]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white border border-[#e2e8f0] overflow-hidden">
                <div className="flex justify-between items-center px-8 py-6 border-b border-black/10">
                    <div>
                        <h2 className="text-xl font-bold text-black">CR d'entretien / Grille d'évaluation</h2>
                    </div>
                    <div className="text-right leading-none">
                        <div className="font-bold text-sm tracking-widest text-[#1a113e]">RUSH</div>
                        <div className="text-[10px] font-bold tracking-widest text-black/50">SCHOOL</div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Input label="Nom et Prénom du candidat" required placeholder="Entrez le nom complet" value={evalData.candidatNom} error={errors.candidatNom ? "Le nom est requis" : ""} onChange={(e) => setEvalData({ ...evalData, candidatNom: e.target.value })} />
                            <Input label="Email du candidat" required placeholder="email@exemple.com" type="email" value={evalData.email} error={errors.email ? "L'email est requis" : ""} onChange={(e) => setEvalData({ ...evalData, email: e.target.value })} />
                            <Input label="Heure d'entretien" required type="time" value={evalData.heureEntretien} error={errors.heureEntretien ? "L'heure est requise" : ""} onChange={(e) => setEvalData({ ...evalData, heureEntretien: e.target.value })} />
                        </div>
                        <div className="space-y-4">
                            <Input label="Nom et Prénom chargé(e) d'admission" required placeholder="Votre nom" value={evalData.chargeAdmission} error={errors.chargeAdmission ? "Le chargé d'admission est requis" : ""} onChange={(e) => setEvalData({ ...evalData, chargeAdmission: e.target.value })} />
                            <Input label="Date d'entretien" required type="date" value={evalData.dateEntretien} error={errors.dateEntretien ? "La date est requise" : ""} onChange={(e) => setEvalData({ ...evalData, dateEntretien: e.target.value })} />
                        </div>
                    </div>

                    <div className="bg-white">
                        <label className="block text-[13px] font-semibold text-black mb-2.5">Formation : <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-2">
                            {['TP NTC', 'BTS CI', 'BTS COM', 'BTS MCO', 'BTS NDRC', 'BACHELOR RDC'].map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setEvalData({ ...evalData, formation: f })}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] border transition-all text-[13px]
                                        ${evalData.formation === f
                                            ? 'bg-[#6B3CD2] border-[#6B3CD2] text-white font-semibold'
                                            : 'bg-white border-black/15 text-black hover:border-[#6B3CD2]/40 hover:bg-[#6B3CD2]/5 hover:text-[#6B3CD2]'}
                                        ${errors.formation && evalData.formation !== f ? 'border-red-300' : ''}`}
                                >
                                    <div className={`w-2 h-2 rounded-full border-2 ${evalData.formation === f ? 'bg-[#6B3CD2] border-[#6B3CD2]' : 'border-black/20'}`}></div>
                                    {f}
                                </button>
                            ))}
                        </div>
                        {errors.formation && <p className="mt-2 text-red-500 text-[10px] font-bold uppercase tracking-wider">Veuillez sélectionner une formation</p>}
                    </div>

                    <div className="bg-white border border-black/10 rounded-[4px] overflow-hidden mb-5">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-[#6B3CD2] text-white p-3 md:px-4 md:py-3 text-[13px] font-bold text-left border-x border-[#6B3CD2]/10">Critères</th>
                                    <th className="bg-[#6B3CD2] text-white p-3 md:px-4 md:py-3 text-[12px] font-semibold text-center whitespace-nowrap border-x border-[#6B3CD2]/10 leading-tight">
                                        Insuffisant<span className="block text-[10.5px] font-normal opacity-70 mt-0.5">(1pt)</span>
                                    </th>
                                    <th className="bg-[#6B3CD2] text-white p-3 md:px-4 md:py-3 text-[12px] font-semibold text-center whitespace-nowrap border-x border-[#6B3CD2]/10 leading-tight">
                                        Passable<span className="block text-[10.5px] font-normal opacity-70 mt-0.5">(2pts)</span>
                                    </th>
                                    <th className="bg-[#6B3CD2] text-white p-3 md:px-4 md:py-3 text-[12px] font-semibold text-center whitespace-nowrap border-x border-[#6B3CD2]/10 leading-tight">
                                        Satisfaisant<span className="block text-[10.5px] font-normal opacity-70 mt-0.5">(3pts)</span>
                                    </th>
                                    <th className="bg-[#6B3CD2] text-white p-3 md:px-4 md:py-3 text-[12px] font-semibold text-center whitespace-nowrap border-x border-[#6B3CD2]/10 leading-tight">
                                        T. Satisfaisant<span className="block text-[10.5px] font-normal opacity-70 mt-0.5">(4pts)</span>
                                    </th>
                                    <th className="bg-[#6B3CD2] text-white p-3 md:px-4 md:py-3 text-[12px] font-semibold text-center whitespace-nowrap border-x border-[#6B3CD2]/10 leading-tight">
                                        Excellent<span className="block text-[10.5px] font-normal opacity-70 mt-0.5">(5pts)</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { id: 'critere1', title: 'Savoir-être et présentation :', desc: 'Capacité à bien se connaître : ses points forts, ses points de progression et la manière de s\'améliorer, exposer une ou plusieurs réussites personnelles de son choix lors d\'une activité (difficultés surmontées...) montrer comment il travaille sur sa culture générale, sa curiosité, son ouverture aux autres.' },
                                    { id: 'critere2', title: 'Cohérence du projet académique et professionnel :', desc: 'Capacité à expliquer la logique de construction de son projet d\'orientation en fonction de ses appétences/compétences, capacité à exposer son projet professionnel, motivation à rejoindre le programme à travers des éléments concrets.' },
                                    { id: 'critere3', title: 'Engagements et expérience péri ou extra-scolaires :', desc: 'Capacité à mettre en avant ses activités/engagements extra scolaires, richesse, profondeur et variété des expériences, capacité à valoriser les compétences développées au cours de ses activités et bénéfices pour son projet professionnel, envie de participer à la vie associative de l\'école et de quelle manière.' },
                                    { id: 'critere4', title: 'Expression en Anglais :', desc: 'Savoir répondre spontanément à quelques questions en anglais.' }
                                ].map((c) => (
                                    <tr key={c.id} className="hover:bg-[#6B3CD2]/[0.03]">
                                        <td className="p-4 border-b border-black/10 align-top max-w-[400px]">
                                            <div className="text-[14px] font-semibold text-black mb-1.5 flex items-center gap-1">
                                                {c.title}
                                                {errors[c.id] && <AlertCircle size={14} className="text-red-500" />}
                                            </div>
                                            <div className="text-[12.5px] text-black/60 leading-relaxed">{c.desc}</div>
                                        </td>
                                        {[1, 2, 3, 4, 5].map((score) => (
                                            <td key={score} className="p-4 border-b border-black/10 align-middle text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleScoreChange(c.id, score)}
                                                    className={`w-9 h-9 rounded-[4px] inline-flex items-center justify-center text-[13.5px] font-semibold transition-all border
                                                        ${evalData[c.id as keyof typeof evalData] === score
                                                            ? 'bg-[#6B3CD2] border-[#6B3CD2] text-white'
                                                            : 'bg-white border-black/15 text-black hover:border-[#6B3CD2]/40 hover:text-[#6B3CD2]'}
                                                    `}
                                                >
                                                    {score}
                                                </button>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col md:flex-row gap-5 mb-5">
                        <div className="flex-1 bg-white border border-[#6B3CD2]/10 rounded-[4px] p-6">
                            <div className="text-[14px] font-bold text-black/60 mb-3">Commentaires :</div>
                            <textarea
                                className="w-full bg-white border border-[#6B3CD2]/15 rounded-[4px] p-3.5 text-[13.5px] text-[#18162A] focus:border-[#6B3CD2] outline-none transition-all resize-y min-h-[80px]"
                                value={evalData.commentaires}
                                onChange={(e) => setEvalData({ ...evalData, commentaires: e.target.value })}
                                placeholder="Vos observations sur le candidat..."
                            />
                        </div>
                        <div className="bg-[#6B3CD2]/5 border border-[#6B3CD2]/10 rounded-[4px] py-5 px-7 text-center min-w-[170px] flex flex-col justify-center shrink-0">
                            <div className="text-[12.5px] font-medium text-black/50 mb-1.5">Note globale</div>
                            <div className="text-4xl font-bold text-[#6B3CD2] leading-none mb-1">
                                {totalScore}<span className="text-base font-medium text-black/40">/20</span>
                            </div>
                            <div className={`text-[13px] font-semibold mt-1 ${totalScore >= 12 ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
                                {getAppreciation(totalScore)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        {pdfUploadStatus === 'uploading' && (
                            <div className="w-full py-4 bg-blue-50 text-blue-600 font-bold rounded-[4px] flex items-center justify-center gap-3 border border-blue-100 animate-pulse">
                                <Loader2 size={20} className="animate-spin" />
                                <span className="text-xs uppercase tracking-widest">Envoi du compte-rendu PDF...</span>
                            </div>
                        )}

                        {pdfUploadStatus === 'error' && (
                            <div className="w-full py-4 bg-rose-50 text-rose-500 border border-rose-100 rounded-[4px] flex items-center justify-center gap-3">
                                <AlertCircle size={20} />
                                <span className="text-xs font-bold uppercase tracking-widest">{pdfUploadError}</span>
                            </div>
                        )}

                        {pdfUploadStatus === 'success' && (
                            <div className="w-full py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[4px] flex items-center justify-center gap-3">
                                <CheckCircle2 size={20} />
                                <span className="text-xs font-bold uppercase tracking-widest">Compte-rendu envoyé avec succès</span>
                            </div>
                        )}

                        <div className="flex justify-end gap-2.5">
                            <button onClick={resetEvaluation} className="flex items-center gap-2 px-5 py-2.5 rounded-[4px] text-[13.5px] font-medium transition-all bg-white border border-black/15 text-black/60 hover:border-black/30">
                                <RotateCcw size={16} />
                                Réinitialiser
                            </button>
                            <button
                                onClick={saveEvaluation}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-[4px] text-[13.5px] font-medium transition-all bg-[#059669] text-white hover:bg-[#047857]"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Enregistrer
                            </button>
                            {onNext && (
                                <button onClick={onNext} className="flex items-center gap-2 px-5 py-2.5 rounded-[4px] text-[13.5px] font-medium transition-all bg-[#6B3CD2] text-white hover:bg-[#5831b0]">
                                    <ArrowRight size={16} />
                                    Continuer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- INTERVIEWS TRACKING COMPONENT ---

const InterviewsTrackingView = ({ onLaunchInterview }: { onLaunchInterview: (candidate: any) => void }) => {
    const { candidates, loading: isLoading } = useCandidates();
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = (candidates || []).map((raw, _index) => {
        const c = getC(raw);
        const hasTracking = c.has_interview_tracking || !!(raw.has_interview_tracking);

        return {
            raw,
            c,
            interviewStatus: hasTracking ? 'Completed' : 'Pending',
            interviewPdfUrl: c.interview_pdf_url || raw.interview_pdf_url || "",
            interviewPdfName: c.interview_pdf_name || raw.interview_pdf_name || "",
            allInterviewPdfs: c.all_interview_pdfs || raw.all_interview_pdfs || [],
            hasTestResults: c.has_test_results || !!(raw.has_test_results),
            testResultsUrl: c.test_results_url || raw.test_results_url || "",
            testResultsName: c.test_results_name || raw.test_results_name || "",
            allTestResultsPdfs: c.all_test_results_pdfs || raw.all_test_results_pdfs || [],
            interviewDate: hasTracking ? '—' : 'À définir'
        };
    }).filter(item => {
        const searchLower = (searchQuery || '').toLowerCase();
        const fullName = `${item.c.nom} ${item.c.prenom}`.toLowerCase();
        const formation = (item.c.formation).toLowerCase();
        const email = (item.c.email).toLowerCase();

        return fullName.includes(searchLower) ||
            formation.includes(searchLower) ||
            email.includes(searchLower);
    });

    const stats = {
        total: candidates.length,
        completed: filtered.filter(item => item.interviewStatus === 'Completed').length,
        pending: filtered.filter(item => item.interviewStatus === 'Pending').length
    };

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            {/* Header / Hero */}
            <div className="bg-white border border-[#e2e8f0] rounded-[4px] p-10 overflow-hidden relative" style={{ background: 'linear-gradient(120deg, #f5f3ff 0%, #ede9fe 50%, #f3f0ff 100%)' }}>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 border-l border-slate-100 hidden md:block"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-white/80 text-[#3b7cf4] rounded-[4px] text-[10px] font-black uppercase tracking-widest border border-[#ddd6fe]">Management</span>
                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-[4px]"></div>
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Temps réel</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Suivi des Entretiens</h2>
                        <p className="text-slate-500 text-lg leading-relaxed max-w-xl font-medium">
                            Gérez le flux d'admission des candidats, consultez les scores des évaluations et lancez les entretiens en attente.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0">
                        <div className="bg-white/80 border border-[#ddd6fe] p-6 rounded-[4px] text-center">
                            <div className="text-3xl font-black text-[#3b7cf4] mb-1">{stats.completed}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validés</div>
                        </div>
                        <div className="bg-white/80 border border-[#ddd6fe] p-6 rounded-[4px] text-center">
                            <div className="text-3xl font-black text-[#1e293b] mb-1">{stats.pending}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En attente</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-[450px] group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un candidat ou une formation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-[#e2e8f0] rounded-[4px] focus:border-[#3b7cf4] outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                    />                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none h-[56px] px-6" leftIcon={<Download size={18} />}>Exporter</Button>
                    <Button variant="primary" className="flex-1 md:flex-none h-[56px] px-8" leftIcon={<Calendar size={18} />}>Planifier</Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#e2e8f0] rounded-[4px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Candidat</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Formation</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Test</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Date Session</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                                <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Évaluation</th>
                                <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold animate-pulse">Chargement des données...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold">Aucun candidat ne correspond à votre recherche.</td></tr>
                            ) : filtered.map((item) => (
                                <tr key={item.c.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-[4px] bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm group-hover:bg-[#3b7cf4] group-hover:text-white transition-all">
                                                {item.c.prenom?.[0]}{item.c.nom?.[0]}
                                            </div>
                                            <div className="font-black text-slate-800 text-base">{item.c.nom?.toUpperCase()} {item.c.prenom}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-[#ede9fe] text-[#3b7cf4] border border-[#ddd6fe]">
                                            <Briefcase size={14} />
                                            <span className="text-[11px] font-bold uppercase tracking-tight">{formatFormation(item.c.formation) || 'Non spécifiée'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {item.hasTestResults ? (
                                            <a
                                                href={item.testResultsUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all"
                                                title={item.testResultsName || 'Voir les résultats du test'}
                                            >
                                                <Target size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Résultats</span>
                                            </a>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-slate-50 text-slate-400 border border-slate-100">
                                                <Target size={14} className="opacity-40" />
                                                <span className="text-[10px] font-bold uppercase tracking-tight opacity-60">Non effectué</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{item.interviewDate}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">Session admission</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {item.interviewStatus === 'Completed' ? (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                <div className="w-1.5 h-1.5 bg-emerald-500"></div>
                                                <span className="text-[10px] font-black uppercase tracking-wider">Terminé</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-amber-50 text-amber-600 border border-amber-100">
                                                <div className="w-1.5 h-1.5 bg-amber-500 animate-pulse"></div>
                                                <span className="text-[10px] font-black uppercase tracking-wider">En attente</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col items-center">
                                            {item.interviewStatus === 'Completed' ? (
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    <CheckCircle2 size={13} />
                                                    <span className="text-[10px] font-black uppercase tracking-wide">Évalué</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 font-bold">—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {item.interviewStatus === 'Completed' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                {item.interviewPdfUrl && (
                                                    <a
                                                        href={item.interviewPdfUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#ede9fe] text-[#3b7cf4] hover:bg-[#3b7cf4] hover:text-white transition-all text-[10px] font-bold uppercase tracking-wide border border-[#ddd6fe] hover:border-[#3b7cf4]"
                                                        title={item.interviewPdfName || 'Voir le compte rendu'}
                                                    >
                                                        <Download size={13} /> CR
                                                    </a>
                                                )}
                                                {item.allInterviewPdfs.length > 1 && (
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">{item.allInterviewPdfs.length} docs</span>
                                                )}
                                            </div>
                                        ) : (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="rounded-[4px] shadow-none"
                                                onClick={() => onLaunchInterview(item.raw)}
                                            >
                                                Lancer
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- PROJET PROFESSIONNEL QUESTIONNAIRE ---

const _PaletteIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
);
const _BriefcaseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);
const _TargetIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
);
const _RocketIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
);
const _LightbulbIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" /><path d="M10 22h4" />
    </svg>
);

const _FaceSad = () => (
    <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="11" cy="13" r="1.5" fill="currentColor" /><circle cx="21" cy="13" r="1.5" fill="currentColor" />
        <path d="M11 22c1.5-2.5 8.5-2.5 10 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const _FaceNeutral = () => (
    <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="11" cy="13" r="1.5" fill="currentColor" /><circle cx="21" cy="13" r="1.5" fill="currentColor" />
        <path d="M11 21h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const _FaceSmile = () => (
    <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="11" cy="13" r="1.5" fill="currentColor" /><circle cx="21" cy="13" r="1.5" fill="currentColor" />
        <path d="M11 19.5c1 1.5 9 1.5 10 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const _FaceHappy = () => (
    <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="11" cy="12" r="1.5" fill="currentColor" /><circle cx="21" cy="12" r="1.5" fill="currentColor" />
        <path d="M10 18c1.5 3.5 10.5 3.5 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const _FaceExcellent = () => (
    <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9.5 11.5l2 2m9-2l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 11c.7-1.2 2.2-1.5 3-1l-1 1M23 11c-.7-1.2-2.2-1.5-3-1l1 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M9.5 18c1.5 4.5 11.5 4.5 13 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

// --- PROJET PROFESSIONNEL HELPER COMPONENTS ---

const SectionHeader = ({ icon, num, title }: { icon: React.ReactNode; num: number; title: string }) => (
    <div className="flex items-center gap-3 mb-7 pb-5 border-b-2 border-[#6B3CD2]/10">
        <div className="w-10 h-10 rounded-[4px] bg-[#6B3CD2]/10 text-[#6B3CD2] flex items-center justify-center flex-shrink-0">{icon}</div>
        <div>
            <span className="text-[10px] font-black text-[#6B3CD2] uppercase tracking-widest">Partie {num}</span>
            <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight mt-0.5">{title}</h3>
        </div>
    </div>
);

const CheckItem = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
    <label className="flex items-start gap-2.5 cursor-pointer group select-none">
        <div
            onClick={(e) => {
                e.preventDefault();
                onChange();
            }}
            className={`w-4 h-4 rounded-[3px] border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${checked ? 'bg-[#6B3CD2] border-[#6B3CD2]' : 'border-slate-300 group-hover:border-[#6B3CD2]/50'
                }`}
        >
            {checked && (
                <svg viewBox="0 0 10 10" fill="none" width="8" height="8">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </div>
        <span className="text-[12px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors leading-relaxed">{label}</span>
    </label>
);

const RatingRow = ({ label, id, currentRating, onRate }: { label: string; id: string; currentRating: number; onRate: (id: string, val: number) => void }) => (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
        <td className="py-3 pr-4 text-[12px] font-medium text-slate-700">{label}</td>
        {[1, 2, 3, 4, 5].map(v => (
            <td key={v} className="text-center py-3 px-1.5">
                <button
                    onClick={() => onRate(id, v)}
                    className={`w-7 h-7 rounded-full border-2 text-[11px] font-black mx-auto flex items-center justify-center transition-all ${currentRating === v
                        ? 'bg-[#6B3CD2] border-[#6B3CD2] text-white shadow-md shadow-[#6B3CD2]/20'
                        : 'border-slate-200 text-slate-400 hover:border-[#6B3CD2]/40 hover:text-[#6B3CD2]'
                        }`}
                >{v}</button>
            </td>
        ))}
    </tr>
);

const RatingTable = ({ title, items, ratings, onRate }: { title: string; items: { label: string; id: string }[]; ratings: Record<string, number>; onRate: (id: string, val: number) => void }) => (
    <div className="mb-6">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">{title}</p>
        <div className="border border-slate-200 rounded-[4px] overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="bg-[#6B3CD2]/10 border-b border-[#6B3CD2]/20">
                        <th className="text-left py-2.5 px-3 text-[10px] font-black text-[#6B3CD2] uppercase tracking-widest"></th>
                        {[1, 2, 3, 4, 5].map(v => (
                            <th key={v} className="text-center py-2.5 px-1.5 text-[11px] font-black text-[#6B3CD2] w-12">{v}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {items.map(item => <RatingRow key={item.id} label={item.label} id={item.id} currentRating={ratings[item.id] || 0} onRate={onRate} />)}
                </tbody>
            </table>
        </div>
    </div>
);

const TextareaField = ({ id, value, onChange, placeholder, rows = 3 }: { id: string; value: string; onChange: (id: string, val: string) => void; placeholder?: string; rows?: number }) => (
    <textarea
        value={value}
        onChange={e => onChange(id, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full border border-slate-200 rounded-[4px] px-3 py-2.5 text-[12px] font-medium text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#6B3CD2]/50 focus:ring-2 focus:ring-[#6B3CD2]/10 resize-none transition-all"
    />
);

const ProjetProfessionnel = ({ studentData, onNext }: { studentData?: any; onNext?: () => void }) => {
    const { showToast } = useAppStore();
    const [qualites, setQualites] = useState<Set<string>>(new Set());
    const [axes, setAxes] = useState<Set<string>>(new Set());
    const [structures, setStructures] = useState<Set<string>>(new Set());
    const [timeline, setTimeline] = useState('');
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [motivation, setMotivation] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [texts, setTexts] = useState<Record<string, string>>({
        nom: '', email: '', formation: '', entreprise: '', date: '', annee: '',
        autresQualites: '', metier: '', pourquoi: '', specsAlternance: '',
        obj1: '', obj2: '', obj3: '', obstacles: '', actions: '',
        apport: '', succes: '', envie: '',
    });

    useEffect(() => {
        if (studentData) {
            const d = studentData.data || studentData;
            const nom = `${(d.nom_naissance || d.nom || '').toUpperCase()} ${d.prenom || ''}`.trim();
            const email = d.email || d.fields?.email || d.fields?.['E-mail'] || d.informations_personnelles?.email || '';
            setTexts(prev => ({
                ...prev,
                nom,
                email,
                formation: d.formation_souhaitee || d.formation || '',
                date: new Date().toLocaleDateString('fr-FR'),
            }));
        }
    }, [studentData]);

    const toggleSet = (set: Set<string>, setFn: React.Dispatch<React.SetStateAction<Set<string>>>, val: string) => {
        const n = new Set(set);
        n.has(val) ? n.delete(val) : n.add(val);
        setFn(n);
    };
    const setRating = (id: string, val: number) => setRatings(prev => ({ ...prev, [id]: val }));
    const setText = (id: string, val: string) => setTexts(prev => ({ ...prev, [id]: val }));

    const qualitesList: [string, string][] = [
        ['Rigoureux(se)', 'Leader naturel(le)'],
        ['Créatif(ve)', 'Adaptable'],
        ['Organisé(e)', 'Fiable'],
        ['Empathique', 'Analytique'],
        ['Autonome', 'Enthousiaste'],
        ['Persévérant(e)', 'Patient(e)'],
        ['Communicant(e)', 'Force de proposition'],
        ['Curieux(se)', 'À l\'écoute'],
    ];
    const axesList: [string, string][] = [
        ['Manque de confiance', 'Manque d\'organisation'],
        ['Procrastination', 'Éparpillement'],
        ['Impatience', 'Difficulté à dire non'],
        ['Perfectionnisme excessif', 'Stress sous pression'],
        ['Difficultés à déléguer', 'Manque d\'initiative'],
        ['Timidité à l\'oral', 'Trop réservé(e)'],
    ];
    const structuresList: [string, string][] = [
        ['Grande entreprise (CAC 40)', 'Auto-entrepreneur / indépendant'],
        ['PME / ETI (10-250 salariés)', 'Secteur public / associatif'],
        ['Start-up / Scale-up', 'Restauration / Hôtellerie'],
        ['Commerce de proximité / franchise', 'International'],
    ];
    const timelineList = ['Dès la fin de ma formation', 'Dans 1 à 2 ans', 'Dans 3 à 5 ans', 'À plus long terme (+ de 5 ans)'];

    const motivationLevels = [
        { label: 'Faible', face: <_FaceSad /> },
        { label: 'Passable', face: <_FaceNeutral /> },
        { label: 'Correct', face: <_FaceSmile /> },
        { label: 'Bien', face: <_FaceHappy /> },
        { label: 'Excellent', face: <_FaceExcellent /> },
    ];

    const motivationColors = ['text-rose-400', 'text-orange-400', 'text-amber-400', 'text-lime-500', 'text-emerald-500'];
    const motivationActive = ['bg-rose-50 border-rose-300 text-rose-500', 'bg-orange-50 border-orange-300 text-orange-500', 'bg-amber-50 border-amber-300 text-amber-500', 'bg-lime-50 border-lime-300 text-lime-600', 'bg-emerald-50 border-emerald-300 text-emerald-600'];

    const handleReset = () => {
        if (window.confirm('Réinitialiser le questionnaire ? Toutes les données saisies seront perdues.')) {
            setQualites(new Set());
            setAxes(new Set());
            setStructures(new Set());
            setTimeline('');
            setRatings({});
            setMotivation(null);
            setTexts({ nom: '', email: '', formation: '', entreprise: '', date: '', annee: '', autresQualites: '', metier: '', pourquoi: '', specsAlternance: '', obj1: '', obj2: '', obj3: '', obstacles: '', actions: '', apport: '', succes: '', envie: '' });
        }
    };

    const generatePDF = (returnBlob = false): any => {
        const doc = new jsPDF();

        // ── Palette CV minimaliste ─────────────────────────
        const INK: [number, number, number] = [26, 32, 44];
        const ACCENT: [number, number, number] = [107, 60, 210];
        const SUB: [number, number, number] = [80, 96, 124];
        const MUTED: [number, number, number] = [156, 163, 175];
        const RULE: [number, number, number] = [210, 214, 220];
        const BG: [number, number, number] = [248, 249, 251];

        // ── Layout ─────────────────────────────────────────
        const W = 210, H = 297, ML = 20, MR = 20;
        const CW = W - ML - MR;
        const HEADER_H = 42;
        const CONTENT_Y = HEADER_H + 9;
        let y = CONTENT_Y, pageNum = 1;

        // ── CHROME ─────────────────────────────────────────
        const drawChrome = () => {
            doc.setFillColor(ACCENT[0], ACCENT[1], ACCENT[2]);
            doc.rect(0, 0, W, 1.5, 'F');
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 1.5, W, HEADER_H - 1.5, 'F');
            // École — gauche
            doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
            doc.setTextColor(INK[0], INK[1], INK[2]);
            doc.text('RUSH SCHOOL', ML, 18);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
            doc.setTextColor(SUB[0], SUB[1], SUB[2]);
            doc.text('CFA Île-de-France  ·  École supérieure de commerce', ML, 25);
            // Titre — droite
            doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
            doc.setTextColor(ACCENT[0], ACCENT[1], ACCENT[2]);
            doc.text('Bilan de Compétences & Projet Professionnel', W - MR, 18, { align: 'right' });
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
            doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
            doc.text(new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }), W - MR, 25, { align: 'right' });
            // Filet sous header
            doc.setDrawColor(RULE[0], RULE[1], RULE[2]); doc.setLineWidth(0.4);
            doc.line(ML, HEADER_H, W - MR, HEADER_H);
            // Footer
            doc.setDrawColor(RULE[0], RULE[1], RULE[2]); doc.setLineWidth(0.3);
            doc.line(ML, H - 13, W - MR, H - 13);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
            doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
            doc.text('Rush School  —  Document confidentiel', ML, H - 8);
            doc.text(`Page ${pageNum}`, W - MR, H - 8, { align: 'right' });
        };

        const newPage = () => { doc.addPage(); pageNum++; drawChrome(); y = CONTENT_Y; };
        const pb = (n: number) => { if (y + n > H - 18) newPage(); };

        // ── SECTION HEADER ──────────────────────────────────
        const section = (title: string) => {
            pb(18); y += 4;
            doc.setFillColor(ACCENT[0], ACCENT[1], ACCENT[2]);
            doc.rect(ML, y - 1, 2.5, 9, 'F');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
            doc.setTextColor(INK[0], INK[1], INK[2]);
            doc.text(title.toUpperCase(), ML + 6, y + 6);
            doc.setDrawColor(RULE[0], RULE[1], RULE[2]); doc.setLineWidth(0.3);
            doc.line(ML + 6 + doc.getTextWidth(title.toUpperCase()) + 3, y + 3.5, W - MR, y + 3.5);
            y += 14;
        };

        const sublabel = (text: string) => {
            pb(8);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
            doc.setTextColor(SUB[0], SUB[1], SUB[2]);
            doc.text(text.toUpperCase(), ML, y);
            y += 5;
        };

        const para = (val: string) => {
            const text = val?.trim() || '—';
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
            doc.setTextColor(INK[0], INK[1], INK[2]);
            const lines = doc.splitTextToSize(text, CW);
            pb(lines.length * 4.8 + 6);
            doc.text(lines, ML, y);
            y += lines.length * 4.8 + 6;
        };

        const tags = (items: string[]) => {
            if (items.length === 0) { para('—'); return; }
            pb(12);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
            const line = items.length > 0 ? items.join('  ·  ') : '—';
            const lines = doc.splitTextToSize(line, CW - 4);
            const bh = lines.length * 5 + 7;
            doc.setFillColor(BG[0], BG[1], BG[2]);
            doc.roundedRect(ML, y - 3, CW, bh, 1, 1, 'F');
            doc.setTextColor(INK[0], INK[1], INK[2]);
            doc.text(lines, ML + 3, y + 1.5);
            y += bh + 5;
        };

        // Chaque colonne = LBAR + gap(3) + BAR + score(~8) doit tenir dans CW/2 = 85
        // LBAR(42) + 3 + BAR(24) + 8 = 77 < 85 ✓
        const LBAR = 42, BAR = 24;
        const ratingBar = (label: string, val: number, xL: number, yPos: number) => {
            const barX = xL + LBAR + 3;
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
            doc.setTextColor(INK[0], INK[1], INK[2]);
            let lbl = label;
            while (doc.getTextWidth(lbl) > LBAR && lbl.length > 5) lbl = lbl.slice(0, -4) + '…';
            doc.text(lbl, xL, yPos);
            doc.setFillColor(RULE[0], RULE[1], RULE[2]);
            doc.roundedRect(barX, yPos - 2.5, BAR, 2.5, 0.5, 0.5, 'F');
            if (val > 0) {
                doc.setFillColor(ACCENT[0], ACCENT[1], ACCENT[2]);
                doc.roundedRect(barX, yPos - 2.5, (BAR * val) / 5, 2.5, 0.5, 0.5, 'F');
            }
            doc.setFontSize(6.5); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
            doc.text(`${val}/5`, barX + BAR + 2, yPos - 0.3);
        };

        const ratingGroup = (title: string, items: { label: string; id: string }[]) => {
            const rows = Math.ceil(items.length / 2);
            pb(10 + rows * 10);
            sublabel(title);
            const colX: [number, number] = [ML, ML + CW / 2 + 3];
            for (let i = 0; i < items.length; i += 2) {
                pb(10);
                ratingBar(items[i].label, ratings[items[i].id] || 0, colX[0], y);
                if (i + 1 < items.length)
                    ratingBar(items[i + 1].label, ratings[items[i + 1].id] || 0, colX[1], y);
                y += 10;
            }
            y += 4;
        };

        // ══════════════════════════════════════════════
        // CONTENU
        // ══════════════════════════════════════════════
        drawChrome();

        // ── BLOC IDENTITÉ (grille 2 colonnes) ───────────────
        pb(30);
        const colW = CW / 2;
        const idFields = [
            { lbl: 'Nom & Prénom', val: texts.nom || '—' },
            { lbl: 'E-mail', val: texts.email || '—' },
            { lbl: 'Formation', val: formatFormation(texts.formation) || '—' },
            { lbl: 'Entreprise', val: texts.entreprise || '—' },
            { lbl: 'Année scolaire', val: texts.annee || '—' },
            { lbl: 'Date', val: texts.date || '—' },
        ];
        idFields.forEach((f, i) => {
            const col = i % 2, row = Math.floor(i / 2);
            const fx = ML + col * colW, fy = y + row * 12;
            doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5);
            doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
            doc.text(f.lbl.toUpperCase(), fx, fy);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
            doc.setTextColor(INK[0], INK[1], INK[2]);
            let val = f.val;
            while (doc.getTextWidth(val) > colW - 6 && val.length > 5) val = val.slice(0, -4) + '…';
            doc.text(val, fx, fy + 5.5);
        });
        y += Math.ceil(idFields.length / 2) * 12 + 6;
        doc.setDrawColor(RULE[0], RULE[1], RULE[2]); doc.setLineWidth(0.3);
        doc.line(ML, y, W - MR, y);
        y += 8;

        // ── I. PORTRAIT ────────────────────────────────────
        section('I. Portrait & Personnalité');
        sublabel('Qualités et forces');
        tags(Array.from(qualites));
        if (texts.autresQualites?.trim()) { sublabel('Autres qualités'); para(texts.autresQualites); }
        sublabel('Axes d\'amélioration');
        tags(Array.from(axes));
        y += 2;

        // ── II. COMPÉTENCES ─────────────────────────────────
        section('II. Bilan des Compétences');
        ratingGroup('Commerce & Relationnel', [
            { label: 'Accueil client', id: 'c1' }, { label: 'Argumentation / Vente', id: 'c2' },
            { label: 'Négociation', id: 'c3' }, { label: 'Gestion réclamations', id: 'c4' },
            { label: 'Animation d\'équipe', id: 'c5' }, { label: 'Communication orale', id: 'c6' },
        ]);
        ratingGroup('Digital & Marketing', [
            { label: 'Réseaux sociaux', id: 'd1' }, { label: 'Création de contenu', id: 'd2' },
            { label: 'Bureautique', id: 'd3' }, { label: 'CRM', id: 'd4' },
            { label: 'Prospection', id: 'd5' },
        ]);
        ratingGroup('Gestion & Organisation', [
            { label: 'Gestion du temps', id: 'g1' }, { label: 'Tableaux de bord', id: 'g2' },
            { label: 'Prise d\'initiative', id: 'g3' }, { label: 'Gestion de projets', id: 'g4' },
            { label: 'Adaptabilité', id: 'g5' },
        ]);
        if (texts.specsAlternance?.trim()) { sublabel('Compétences spécifiques'); para(texts.specsAlternance); }

        // ── III. PROJET PRO ─────────────────────────────────
        section('III. Projet Professionnel & Objectifs');
        sublabel('Métier / Secteur visé');
        para(texts.metier);
        sublabel('Motivations');
        para(texts.pourquoi);
        if (structures.size > 0) { sublabel('Type de structure'); tags(Array.from(structures)); }
        if (timeline) {
            sublabel('Horizon d\'atteinte de l\'objectif');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
            doc.setTextColor(ACCENT[0], ACCENT[1], ACCENT[2]);
            doc.text(timeline, ML, y); y += 10;
        }

        const objectives = [
            { lbl: 'Objectif court terme  (6 mois)', val: texts.obj1 },
            { lbl: 'Objectif moyen terme (1-2 ans)', val: texts.obj2 },
            { lbl: 'Objectif long terme  (3-5 ans)', val: texts.obj3 },
        ];
        objectives.forEach((obj, idx) => {
            const lines = doc.splitTextToSize(obj.val?.trim() || '—', CW - 8);
            const bh = lines.length * 5 + 14;
            pb(bh + 5);
            doc.setFillColor(ACCENT[0], ACCENT[1], ACCENT[2]);
            doc.circle(ML + 2.5, y + 4, 2.5, 'F');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(255, 255, 255);
            doc.text(`${idx + 1}`, ML + 1.1, y + 5.3);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(SUB[0], SUB[1], SUB[2]);
            doc.text(obj.lbl.toUpperCase(), ML + 7, y + 5);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(INK[0], INK[1], INK[2]);
            doc.text(lines, ML + 7, y + 12);
            y += bh;
        });
        y += 4;

        // ── IV. BILAN & MOTIVATION ──────────────────────────
        section('IV. Bilan & Motivation');
        sublabel('Ce que la formation m\'a apporté');
        para(texts.apport);
        sublabel('Plus grand succès');
        para(texts.succes);
        if (texts.envie?.trim()) { sublabel('Ce qui donne envie de travailler'); para(texts.envie); }

        // Indicateur sobre
        pb(22);
        const mLabel = motivation !== null ? motivationLevels[motivation].label : '—';
        const mColMap: [number, number, number][] = [
            [220, 38, 38], [234, 88, 12], [202, 138, 4], [101, 163, 13], [16, 185, 129],
        ];
        const mCol = motivation !== null ? mColMap[motivation] : MUTED;
        doc.setDrawColor(RULE[0], RULE[1], RULE[2]); doc.setLineWidth(0.3);
        doc.roundedRect(ML, y, CW, 16, 1, 1, 'D');
        doc.setFillColor(mCol[0], mCol[1], mCol[2]);
        doc.roundedRect(ML, y, 2.5, 16, 0.5, 0.5, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.text('MOTIVATION GLOBALE', ML + 7, y + 10);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(mCol[0], mCol[1], mCol[2]);
        doc.text(mLabel.toUpperCase(), W - MR - 4, y + 10, { align: 'right' });

        if (returnBlob) return doc.output('blob');
        doc.save(`PROJET_PRO_${(texts.nom || 'CANDIDAT').replace(/\s+/g, '_')}.pdf`);
    };



    return (
        <div className="mt-12 pt-10 border-t-2 border-slate-200">
            {/* Document header */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-8 mb-8">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mon Projet Professionnel</h2>
                        <p className="text-[12px] font-semibold text-slate-500 mt-1">Questionnaire de bilan &amp; d'orientation</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] font-black text-[#6B3CD2] uppercase tracking-widest">Rush School – CFA Île-de-France</p>
                        <div className="flex items-center gap-2 mt-2 justify-end">
                            <span className="text-[11px] font-semibold text-slate-500">Année scolaire</span>
                            <input
                                value={texts.annee}
                                onChange={e => setText('annee', e.target.value)}
                                placeholder="20__ / 20__"
                                className="w-28 border-b-2 border-slate-200 focus:border-[#6B3CD2] px-1 py-0.5 text-[12px] font-bold text-slate-700 text-center bg-transparent focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-x-10 gap-y-4 border-t border-slate-100 pt-5">
                    {[
                        { label: 'Nom & Prénom', id: 'nom', placeholder: '............................................' },
                        { label: 'E-mail', id: 'email', placeholder: '............................................' },
                        { label: 'Formation', id: 'formation', placeholder: '............................................' },
                        { label: 'Entreprise', id: 'entreprise', placeholder: '............................................' },
                        { label: 'Date', id: 'date', placeholder: '............................................' },
                    ].map(f => (
                        <div key={f.id} className="flex items-center gap-3">
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide whitespace-nowrap">{f.label}</span>
                            <input
                                value={texts[f.id] || ''}
                                onChange={e => setText(f.id, e.target.value)}
                                placeholder={f.placeholder}
                                className="flex-1 border-b-2 border-slate-200 focus:border-[#6B3CD2] px-1 py-0.5 text-[12px] font-medium text-slate-800 bg-transparent focus:outline-none transition-colors placeholder-slate-200"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* PARTIE 1 – MON PORTRAIT */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-8 mb-5">
                <SectionHeader icon={<_PaletteIcon />} num={1} title="Mon Portrait" />
                <p className="text-[11px] text-slate-400 font-medium italic mb-6">Prends le temps de réfléchir sincèrement – il n'y a pas de bonne ou mauvaise réponse</p>

                <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-4">Mes qualités – Coche celles qui te correspondent (3 minimum)</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-7">
                    {qualitesList.map(([a, b]) => (
                        <React.Fragment key={a}>
                            <CheckItem label={a} checked={qualites.has(a)} onChange={() => toggleSet(qualites, setQualites, a)} />
                            <CheckItem label={b} checked={qualites.has(b)} onChange={() => toggleSet(qualites, setQualites, b)} />
                        </React.Fragment>
                    ))}
                </div>
                <div className="mb-8">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Autres qualités que tu t'attribues</p>
                    <TextareaField id="autresQualites" value={texts.autresQualites} onChange={setText} rows={2} />
                </div>

                <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-4">Mes axes d'amélioration – Coche ceux sur lesquels tu travailles</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6">
                    {axesList.map(([a, b]) => (
                        <React.Fragment key={a}>
                            <CheckItem label={a} checked={axes.has(a)} onChange={() => toggleSet(axes, setAxes, a)} />
                            <CheckItem label={b} checked={axes.has(b)} onChange={() => toggleSet(axes, setAxes, b)} />
                        </React.Fragment>
                    ))}
                </div>
                <div className="flex items-start gap-3 bg-[#6B3CD2]/5 border border-[#6B3CD2]/15 rounded-[4px] p-4">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" className="text-[#6B3CD2] mt-0.5 flex-shrink-0">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-[11px] font-semibold text-[#6B3CD2] leading-relaxed">Reconnaître ses axes d'amélioration est une force : cela montre ta maturité et ta capacité à progresser.</p>
                </div>
            </div>

            {/* PARTIE 2 – MES COMPÉTENCES */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-8 mb-5">
                <SectionHeader icon={<_BriefcaseIcon />} num={2} title="Mes Compétences" />
                <p className="text-[11px] text-slate-400 font-medium italic mb-6">Note-toi honnêtement de 1 (débutant) à 5 (expert)</p>

                <RatingTable
                    title="Compétences commerciales & relationnelles"
                    ratings={ratings}
                    onRate={setRating}
                    items={[
                        { label: 'Accueil et relation client', id: 'c1' },
                        { label: 'Argumentation et vente', id: 'c2' },
                        { label: 'Négociation', id: 'c3' },
                        { label: 'Gestion des réclamations', id: 'c4' },
                        { label: 'Animation d\'équipe', id: 'c5' },
                        { label: 'Communication orale', id: 'c6' },
                    ]}
                />
                <RatingTable
                    title="Compétences digitales & marketing"
                    ratings={ratings}
                    onRate={setRating}
                    items={[
                        { label: 'Réseaux sociaux (Instagram, LinkedIn…)', id: 'd1' },
                        { label: 'Création de contenu (visuels, vidéos)', id: 'd2' },
                        { label: 'Outils bureautiques (Word, Excel, PPT)', id: 'd3' },
                        { label: 'Utilisation d\'un CRM', id: 'd4' },
                        { label: 'E-mailing & prospection digitale', id: 'd5' },
                    ]}
                />
                <RatingTable
                    title="Compétences en gestion & organisation"
                    ratings={ratings}
                    onRate={setRating}
                    items={[
                        { label: 'Gestion du temps et des priorités', id: 'g1' },
                        { label: 'Suivi d\'indicateurs et tableaux de bord', id: 'g2' },
                        { label: 'Prise d\'initiative', id: 'g3' },
                        { label: 'Gestion de projets', id: 'g4' },
                        { label: 'Adaptabilité aux imprévus', id: 'g5' },
                    ]}
                />
                <div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Compétences spécifiques acquises en alternance</p>
                    <TextareaField id="specsAlternance" value={texts.specsAlternance} onChange={setText} placeholder="Décris en 2-3 lignes les compétences spécifiques acquises…" rows={3} />
                </div>
            </div>

            {/* PARTIE 3 – MON PROJET PROFESSIONNEL */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-8 mb-5">
                <SectionHeader icon={<_TargetIcon />} num={3} title="Mon Projet Professionnel" />
                <p className="text-[11px] text-slate-400 font-medium italic mb-6">Où veux-tu aller ? Sois précis(e) et ambitieux(se) !</p>

                <div className="mb-6">
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Quel métier ou secteur t'attire après ta formation ?</p>
                    <TextareaField id="metier" value={texts.metier} onChange={setText} rows={2} />
                </div>
                <div className="mb-7">
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Pourquoi ce choix ? Qu'est-ce qui te motive dans ce domaine ?</p>
                    <TextareaField id="pourquoi" value={texts.pourquoi} onChange={setText} rows={3} />
                </div>

                <div className="mb-7">
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-4">Dans quel type de structure souhaites-tu travailler ?</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {structuresList.map(([a, b]) => (
                            <React.Fragment key={a}>
                                <CheckItem label={a} checked={structures.has(a)} onChange={() => toggleSet(structures, setStructures, a)} />
                                <CheckItem label={b} checked={structures.has(b)} onChange={() => toggleSet(structures, setStructures, b)} />
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-4">Dans combien de temps souhaites-tu atteindre ton objectif ?</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {timelineList.map(t => (
                            <CheckItem key={t} label={t} checked={timeline === t} onChange={() => setTimeline(timeline === t ? '' : t)} />
                        ))}
                    </div>
                </div>
            </div>

            {/* PARTIE 4 – MES OBJECTIFS */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-8 mb-5">
                <SectionHeader icon={<_RocketIcon />} num={4} title="Mes Objectifs" />
                <p className="text-[11px] text-slate-400 font-medium italic mb-6">Des objectifs SMART : Spécifiques, Mesurables, Atteignables, Réalistes, Temporels</p>

                <div className="grid grid-cols-1 gap-4 mb-7">
                    {[
                        { id: 'obj1', num: 1, horizon: 'Court terme (6 mois)', color: 'bg-blue-50 border-blue-200', badge: 'text-blue-700' },
                        { id: 'obj2', num: 2, horizon: 'Moyen terme (1 à 2 ans)', color: 'bg-violet-50 border-violet-200', badge: 'text-violet-700' },
                        { id: 'obj3', num: 3, horizon: 'Long terme (3 à 5 ans)', color: 'bg-emerald-50 border-emerald-200', badge: 'text-emerald-700' },
                    ].map(obj => (
                        <div key={obj.id} className={`border rounded-[4px] p-4 ${obj.color}`}>
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-6 h-6 rounded-full bg-white border-2 border-current flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" className={obj.badge}>
                                        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                                    </svg>
                                </div>
                                <span className={`text-[11px] font-black uppercase tracking-widest ${obj.badge}`}>Objectif n° {obj.num} — {obj.horizon}</span>
                            </div>
                            <textarea
                                value={texts[obj.id] || ''}
                                onChange={e => setText(obj.id, e.target.value)}
                                rows={2}
                                className="w-full bg-white/70 border border-white/80 rounded-[4px] px-3 py-2 text-[12px] font-medium text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#6B3CD2]/40 focus:ring-2 focus:ring-[#6B3CD2]/10 resize-none transition-all"
                                placeholder="Décris ton objectif avec précision…"
                            />
                        </div>
                    ))}
                </div>

                <div className="mb-6">
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Quels obstacles peux-tu anticiper ? Comment les surmonter ?</p>
                    <TextareaField id="obstacles" value={texts.obstacles} onChange={setText} rows={3} />
                </div>
                <div>
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Quelles actions concrètes vas-tu mettre en place dès maintenant ?</p>
                    <TextareaField id="actions" value={texts.actions} onChange={setText} rows={3} />
                </div>
            </div>

            {/* PARTIE 5 – MON BILAN & MA MOTIVATION */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-8">
                <SectionHeader icon={<_LightbulbIcon />} num={5} title="Mon Bilan & Ma Motivation" />
                <p className="text-[11px] text-slate-400 font-medium italic mb-6">Une dernière réflexion pour conclure</p>

                <div className="mb-6">
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Qu'est-ce que cette formation t'a apporté jusqu'ici ?</p>
                    <TextareaField id="apport" value={texts.apport} onChange={setText} rows={3} />
                </div>
                <div className="mb-6">
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Quel est ton plus grand succès depuis le début de ton alternance ?</p>
                    <TextareaField id="succes" value={texts.succes} onChange={setText} rows={2} />
                </div>
                <div className="mb-8">
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Qu'est-ce qui te donne envie de te lever le matin pour aller travailler ?</p>
                    <TextareaField id="envie" value={texts.envie} onChange={setText} rows={2} />
                </div>
                <div className="border border-slate-200 rounded-[4px] p-6">
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-5 text-center">Mon niveau de motivation global aujourd'hui</p>
                    <div className="flex items-end justify-center gap-4">
                        {motivationLevels.map((m, i) => (
                            <button
                                key={i}
                                onClick={() => setMotivation(motivation === i ? null : i)}
                                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-[4px] border-2 transition-all ${motivation === i
                                    ? motivationActive[i]
                                    : 'border-slate-100 text-slate-300 hover:border-slate-200 hover:text-slate-400'
                                    }`}
                            >
                                <span className={motivation === i ? motivationColors[i] : ''}>{m.face}</span>
                                <span className="text-[10px] font-black uppercase tracking-wide whitespace-nowrap">{m.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer actions */}
            <div className="mt-8 flex items-center justify-end gap-3">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-[4px] border-2 border-slate-200 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                >
                    <RotateCcw size={14} />
                    Réinitialiser
                </button>
                <button
                    onClick={generatePDF}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-[4px] bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-200"
                >
                    <Save size={14} />
                    Enregistrer
                </button>
                <button
                    disabled={isSubmitting}
                    onClick={async () => {
                        if (!texts.email) {
                            showToast("L'email est requis pour envoyer le projet pro.", "error");
                            return;
                        }
                        setIsSubmitting(true);
                        try {
                            const pdfBlob = generatePDF(true);
                            await api.submitProjetPro(texts.email, pdfBlob);
                            showToast("Projet professionnel envoyé avec succès !", "success");
                            onNext?.();
                        } catch (error) {
                            console.error("Erreur lors de l'envoi du Projet Pro:", error);
                            showToast("Erreur lors de l'envoi du dossier.", "error");
                        } finally {
                            setIsSubmitting(false);
                        }
                    }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-[4px] font-black text-[11px] uppercase tracking-widest transition-all shadow-md ${isSubmitting
                            ? 'bg-[#6B3CD2]/60 text-white/70 cursor-not-allowed shadow-none'
                            : 'bg-[#6B3CD2] text-white hover:bg-[#5a2eb8] active:scale-95 shadow-[#6B3CD2]/20'
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Envoi en cours…
                        </>
                    ) : (
                        <>
                            Continuer
                            <ArrowRight size={14} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};


// --- MAIN ADMISSION VIEW ---

const AdmissionView = ({ selectedStudent, selectedTab, onClearSelection }: AdmissionViewProps = {}) => {
    const { showToast } = useAppStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [mainTab, setMainTab] = useState<'dashboard' | 'interviews'>(
        searchParams.get('tab') === 'interviews' ? 'interviews' : 'dashboard'
    );
    const [mainTabAnimKey, setMainTabAnimKey] = useState(0);
    const pageTopRef = React.useRef<HTMLDivElement>(null);

    const handleMainTabChange = (tab: 'dashboard' | 'interviews') => {
        if (tab === mainTab) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            setMainTab(tab);
            setMainTabAnimKey(k => k + 1);
        }, 180);
    };

    const [activeTab, setActiveTab] = useState<AdmissionTab>(selectedTab || AdmissionTab.TESTS);
    const [prefilledStudent, setPrefilledStudent] = useState<any>(null);
    const userRole = localStorage.getItem('userRole');
    const isCommercial = userRole === 'commercial';

    // Force Entreprise tab for commercials
    useEffect(() => {
        if (isCommercial) {
            setActiveTab(AdmissionTab.ENTREPRISE);
            setMainTab('dashboard');
        }
    }, [isCommercial]);

    // Handle pre-selected student from ClassNTC
    useEffect(() => {
        if (selectedStudent) {
            setPrefilledStudent(selectedStudent);
            setStudentData(selectedStudent);
            if (selectedTab) {
                setActiveTab(selectedTab);
            }
            // Clear selection after handling
            if (onClearSelection) {
                onClearSelection();
            }
        }
    }, [selectedStudent, selectedTab, onClearSelection]);
    const [selectedFormation, setSelectedFormation] = useState<string | null>(null);

    const [testCompleted, setTestCompleted] = useState(false);
    const [studentData, setStudentData] = useState<any>(null);

    const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>({});
    const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

    // Sync uploaded documents status when student data changes
    useEffect(() => {
        if (studentData) {
            const data = getC(studentData);
            setUploadedFiles({
                cv: data.has_cv || !!data.cv_url,
                cni: data.has_cni || !!data.cni_url,
                lettre: data.has_lettre_motivation || !!data.lettre_motivation_url,
                vitale: data.has_vitale || !!data.vitale_url,
                diplome: data.has_diplome || !!data.diplome_url,
            });
            setTestCompleted(data.has_test_results || false);
        } else {
            setUploadedFiles({});
            setTestCompleted(false);
        }
    }, [studentData]);

    const [entrepriseCompleted, setEntrepriseCompleted] = useState(false);
    const [adminCompleted, setAdminCompleted] = useState(false);
    const [interviewCompleted, setInterviewCompleted] = useState(false);
    const [projetProCompleted, setProjetProCompleted] = useState(false);

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // API Hooks
    const { execute: uploadApi, loading: isUploading } = useApi(api.uploadDocument, {
        errorMessage: "Erreur lors du téléversement du document. Veuillez réessayer."
    });

    const { execute: generateFicheApi, loading: isGeneratingFiche } = useApi(api.generateFicheRenseignement, {
        onSuccess: () => setShowSuccessModal(true),
        errorMessage: "Erreur lors de la génération de la fiche."
    });

    const { execute: generateCerfaApi, loading: isGeneratingCerfa } = useApi(api.generateCerfa, {
        onSuccess: () => setShowSuccessModal(true),
        errorMessage: "Erreur lors de la génération du CERFA."
    });

    const { execute: generateAtreApi, loading: isGeneratingAtre } = useApi(api.generateAtre, {
        onSuccess: () => setShowSuccessModal(true),
        errorMessage: "Erreur lors de la génération de la fiche ATRE."
    });

    const { execute: generateCompteRenduApi, loading: isGeneratingCompteRendu } = useApi(api.generateCompteRendu, {
        onSuccess: () => setShowSuccessModal(true),
        errorMessage: "Erreur lors de la génération du compte rendu."
    });

    const { execute: generateConventionApprentissageApi, loading: isGeneratingConventionApprentissage } = useApi(api.generateConventionApprentissage, {
        onSuccess: () => setShowSuccessModal(true),
        errorMessage: "Erreur lors de la génération de la convention."
    });

    const { execute: generateLivretApi, loading: isGeneratingLivret } = useApi(api.generateLivretApprentissage, {
        onSuccess: () => setShowSuccessModal(true),
        errorMessage: "Erreur lors de la génération du livret d'apprentissage."
    });

    const handleFinishTest = () => {
        setTestCompleted(true);
        setActiveTab(AdmissionTab.ENTRETIEN);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, docId: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const recordId = studentData?.record_id || localStorage.getItem('candidateRecordId');

        if (!recordId) {
            showToast("Erreur : Aucun dossier étudiant trouvé. Veuillez remplir la fiche étudiant avant de déposer des documents.", "error");
            return;
        }

        setUploadingFiles(prev => ({ ...prev, [docId]: true }));
        try {
            await uploadApi(recordId, docId, file);
            setUploadedFiles(prev => ({ ...prev, [docId]: true }));
        } catch (error) {
            // Error is handled by useApi toast
        } finally {
            setUploadingFiles(prev => ({ ...prev, [docId]: false }));
        }
    };

    const handleDocAction = async (doc: any) => {
        const recordId = studentData?.record_id || studentData?.id || localStorage.getItem('candidateRecordId');

        if (!recordId && (['renseignements', 'cerfa', 'atre'].includes(doc.id))) {
            showToast("Veuillez d'abord compléter la Fiche Étudiant.", "info");
            return;
        }

        if (doc.id === 'renseignements') {
            await generateFicheApi(recordId);
        } else if (doc.id === 'cerfa') {
            await generateCerfaApi(recordId);
        } else if (doc.id === 'atre') {
            await generateAtreApi(recordId);
        } else if (doc.id === 'compte-rendu') {
            await generateCompteRenduApi(recordId);
        } else if (doc.id === 'convention-apprentissage') {
            await generateConventionApprentissageApi(recordId);
        } else if (doc.id === 'livret') {
            await generateLivretApi(recordId);
        } else {
            console.log("Action pour le document:", doc.title);
        }
    };

    const uploadedCount = Object.keys(uploadedFiles).length;
    const progressPercent = (uploadedCount / REQUIRED_DOCUMENTS.length) * 100;

    return (
        <div className="animate-fade-in max-w-6xl mx-auto pb-20 relative" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />

            {mainTab === 'dashboard' && !isCommercial && (
                <>
                    {/* ── HERO BANNER ── */}
                    <div className="rounded-2xl mb-6 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)', minHeight: 148 }}>
                        {/* noise grain overlay */}
                        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}></div>
                        {/* mesh blobs */}
                        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }}></div>
                        <div className="absolute right-40 -bottom-8 w-36 h-36 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #c4b5fd, transparent 70%)' }}></div>
                        <div className="absolute left-1/2 bottom-0 w-80 h-20 opacity-10" style={{ background: 'radial-gradient(ellipse, #8b5cf6, transparent 80%)' }}></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-10 py-9">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-lg mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                    <Briefcase size={11} className="text-white/70" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/80">Processus d'admission</span>
                                </div>
                                <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="text-[28px] font-extrabold mb-2 tracking-tight text-white leading-tight">Admission Rush School</h1>
                                <p style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-white/65 text-[14px] leading-relaxed font-medium">Complétez votre dossier d'admission : tests, documents et formalités administratives.</p>
                            </div>
                            <div className="shrink-0">
                                <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white" style={{ boxShadow: '0 0 24px rgba(167,139,250,0.25)' }}>
                                    <CheckCircle2 size={28} strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── STEPPER ── */}
                    <div className="bg-white border border-[#e5e0f5] rounded-2xl px-8 py-5 mb-6 shadow-sm">
                        <div className="flex items-center w-full">
                            {[
                                { step: 1, label: 'Tests', tab: AdmissionTab.TESTS, completed: testCompleted },
                                { step: 2, label: 'Entretien', tab: AdmissionTab.ENTRETIEN, completed: interviewCompleted },
                                { step: 3, label: 'Projet Pro', tab: AdmissionTab.PROJET_PROFESSIONNEL, completed: projetProCompleted },
                                { step: 4, label: 'Étudiant', tab: AdmissionTab.QUESTIONNAIRE, completed: !!studentData },
                                { step: 5, label: 'Documents', tab: AdmissionTab.DOCUMENTS, completed: uploadedCount >= REQUIRED_DOCUMENTS.length },
                                { step: 6, label: 'Entreprise', tab: AdmissionTab.ENTREPRISE, completed: entrepriseCompleted },
                                { step: 7, label: 'Admin', tab: AdmissionTab.ADMINISTRATIF, completed: adminCompleted },
                            ].map((s, i, arr) => (
                                <React.Fragment key={s.step}>
                                    <button
                                        onClick={() => (s.completed || activeTab === s.tab) ? setActiveTab(s.tab) : undefined}
                                        style={{ cursor: s.completed || activeTab === s.tab ? 'pointer' : 'default' }}
                                        className="transition-transform duration-200 hover:scale-105"
                                        title={s.label}
                                    >
                                        <StepItem step={s.step} label={s.label} isActive={activeTab === s.tab} isCompleted={s.completed} />
                                    </button>
                                    {i < arr.length - 1 && <StepLine isCompleted={s.completed} />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ── MAIN TABS ── */}
            <div ref={pageTopRef} className="flex gap-0 mb-6 border-b border-[#e5e0f5] w-fit">
                {[
                    { id: 'dashboard', label: 'Tableau de bord' },
                    { id: 'interviews', label: 'Suivi Entretiens' },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => handleMainTabChange(t.id as any)}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                        className={`relative px-5 py-3 text-[13px] font-semibold transition-all duration-200 ${mainTab === t.id ? 'text-[#6d28d9]' : 'text-[#9ca3af] hover:text-[#6d28d9]'}`}
                    >
                        {t.label}
                        {mainTab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6d28d9] rounded-t-full"></span>}
                    </button>
                ))}
            </div>

            <div key={mainTabAnimKey} className="admission-rise">
                {mainTab === 'interviews' ? (
                    <InterviewsTrackingView
                        onLaunchInterview={(c) => {
                            setStudentData(c);
                            handleMainTabChange('dashboard');
                            setActiveTab(AdmissionTab.ENTRETIEN);
                        }}
                    />
                ) : (
                    <>
                        {/* ── TABS NAV ── */}
                        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
                            {[
                                { id: AdmissionTab.TESTS, label: 'Tests', icon: PenTool },
                                { id: AdmissionTab.ENTRETIEN, label: 'Entretien', icon: UserCheck },
                                { id: AdmissionTab.PROJET_PROFESSIONNEL, label: 'Projet Pro', icon: Target },
                                { id: AdmissionTab.QUESTIONNAIRE, label: 'Étudiant', icon: Info },
                                { id: AdmissionTab.DOCUMENTS, label: 'Documents', icon: Upload },
                                { id: AdmissionTab.ENTREPRISE, label: 'Entreprise', icon: Building },
                                { id: AdmissionTab.ADMINISTRATIF, label: 'Administratif', icon: Printer }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as AdmissionTab)}
                                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap' }}
                                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 border ${activeTab === tab.id
                                        ? 'bg-white text-[#6d28d9] border-[#e5e0f5] shadow-md shadow-[#6d28d9]/10'
                                        : 'bg-transparent text-[#6b7280] border-transparent hover:bg-white hover:text-[#6d28d9] hover:border-[#e5e0f5] hover:shadow-sm'
                                        }`}
                                >
                                    <tab.icon size={15} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {activeTab === AdmissionTab.TESTS && (
                            <div className="space-y-6 animate-slide-in">
                                {studentData && getC(studentData).has_test_results && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-[4px] p-8">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-[4px] flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
                                                    <Target size={32} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-800 mb-1">Tes résultats sont disponibles !</h3>
                                                    <p className="text-emerald-700/70 text-sm font-medium leading-relaxed">Félicitations, tu as terminé ton test d'admission. Tu peux consulter ton compte-rendu ci-dessous.</p>
                                                </div>
                                            </div>
                                            <a
                                                href={getC(studentData).test_results_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-[4px] font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                            >
                                                <Download size={18} />
                                                Voir mes résultats
                                            </a>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white border border-[#e5e0f5] rounded-2xl p-8">
                                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="text-[18px] font-bold text-[#1e1b2e] mb-1 flex items-center gap-3">
                                        <GraduationCap className="text-[#6d28d9]" /> Sélectionnez votre formation
                                    </h3>
                                    <p className="text-[13px] text-[#6b7280] mb-7 ml-9">Choisissez la formation pour accéder au test.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { id: 'mco', title: 'BTS MCO', subtitle: 'Management Commercial Opérationnel', duration: '~20 min', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', shadow: 'rgba(37,99,235,0.25)' },
                                            { id: 'ndrc', title: 'BTS NDRC', subtitle: 'Négociation et Digitalisation de la Relation Client', duration: '~20 min', gradient: 'linear-gradient(135deg, #10b981, #059669)', shadow: 'rgba(5,150,105,0.25)' },
                                            { id: 'bachelor', title: 'BACHELOR RDC', subtitle: 'Responsable Développement Commercial', duration: '~25 min', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', shadow: 'rgba(109,40,217,0.25)' },
                                            { id: 'tpntc', title: 'TP NTC', subtitle: 'Titre Pro Négociateur Technico-Commercial', duration: '~20 min', gradient: 'linear-gradient(135deg, #f97316, #ea580c)', shadow: 'rgba(234,88,12,0.25)' },
                                        ].map((f, idx) => (
                                            <div
                                                key={f.id}
                                                onClick={() => navigate(`/test?formation=${f.id}`)}
                                                style={{ animationDelay: `${idx * 60}ms`, fontFamily: "'DM Sans', sans-serif" }}
                                                className="bg-white border border-[#e5e0f5] rounded-2xl p-6 text-center cursor-pointer hover:-translate-y-1 transition-all duration-200 group admission-rise overflow-hidden relative"
                                                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 32px ${f.shadow}, 0 0 0 2px rgba(0,0,0,0.04)`; e.currentTarget.style.borderColor = 'transparent'; }}
                                                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}
                                            >
                                                {/* top color bar */}
                                                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: f.gradient }} />
                                                <div className="w-14 h-14 rounded-2xl mx-auto mt-3 mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: f.gradient, boxShadow: `0 8px 20px ${f.shadow}` }}>
                                                    <GraduationCap size={24} color="white" strokeWidth={2} />
                                                </div>
                                                <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="font-extrabold text-[#1e1b2e] text-[15px] mb-1 tracking-tight">{f.title}</h4>
                                                <p className="text-[11px] text-[#6b7280] mb-5 leading-relaxed">{f.subtitle}</p>
                                                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6b7280] border border-[#e5e0f5] bg-[#f8f7ff] group-hover:bg-white transition-colors">{f.duration}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === AdmissionTab.QUESTIONNAIRE && (
                            <div className="animate-slide-in">
                                <QuestionnaireForm
                                    initialData={studentData}
                                    onNext={(data) => {
                                        setStudentData(data);
                                        setActiveTab(AdmissionTab.DOCUMENTS);
                                    }} />
                            </div>
                        )}

                        {activeTab === AdmissionTab.DOCUMENTS && (
                            <div className="animate-fade-in pb-12">
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-[4px] bg-[#6B3CD2]/10 flex items-center justify-center text-[#6B3CD2]">
                                        <Upload size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-[17px] font-black text-slate-900">Documents à téléverser</h2>
                                        <p className="text-[12px] text-slate-400 font-medium mt-0.5">Téléversez les documents suivants pour compléter votre dossier d'admission</p>
                                    </div>
                                </div>

                                {!studentData && (
                                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-[4px] flex items-center gap-3">
                                        <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
                                        <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Veuillez compléter la Fiche Étudiant avant de transmettre vos documents.</p>
                                    </div>
                                )}

                                <div className="mb-7">
                                    <NirAccordion />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                                    {REQUIRED_DOCUMENTS.map((doc) => {
                                        const isUploaded = uploadedFiles[doc.id];
                                        const isUploadingDoc = uploadingFiles[doc.id];
                                        const Icon = { cv: FileText, cni: Building, lettre: FileText, vitale: Activity, diplome: GraduationCap }[doc.id] || FileText;

                                        return (
                                            <div
                                                key={doc.id}
                                                className={`relative flex flex-col bg-white border rounded-[4px] p-5 transition-all duration-200 ${isUploaded
                                                    ? 'border-emerald-200 shadow-sm'
                                                    : 'border-slate-200 hover:border-[#6B3CD2]/30 hover:shadow-md'
                                                    }`}
                                            >
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
                                                    disabled={isUploadingDoc || !studentData}
                                                    onChange={(e) => handleFileChange(e, doc.id)}
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                />

                                                {/* Icon */}
                                                <div className={`w-10 h-10 rounded-[4px] flex items-center justify-center mb-4 border-2 transition-all ${isUploaded
                                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-600'
                                                    : 'bg-slate-100 border-slate-200 text-slate-500'
                                                    }`}>
                                                    <Icon size={18} />
                                                </div>

                                                {/* Title + desc */}
                                                <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-tight mb-1">{doc.title}</h4>
                                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-4 flex-1">{doc.desc}</p>

                                                {/* Status badge */}
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wide mb-3 self-start ${isUploaded
                                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                                    : 'bg-rose-50 border border-rose-200 text-rose-600'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isUploaded ? 'bg-emerald-500' : 'bg-rose-400'}`}></span>
                                                    {isUploaded ? 'Téléversé' : 'À fournir'}
                                                </span>

                                                {/* Upload button */}
                                                <button className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-[4px] font-black text-[11px] uppercase tracking-widest transition-all ${isUploadingDoc
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : isUploaded
                                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                                                        : 'bg-[#6B3CD2]/10 text-[#6B3CD2] hover:bg-[#6B3CD2] hover:text-white'
                                                    }`}>
                                                    {isUploadingDoc
                                                        ? <><Loader2 size={13} className="animate-spin" /> Envoi…</>
                                                        : <><Upload size={13} />{isUploaded ? 'Remplacer' : 'Téléverser'}</>
                                                    }
                                                </button>

                                                {/* External link */}
                                                {isUploaded && (studentData as any)?.[`${doc.id}_url`] && (
                                                    <a
                                                        href={(studentData as any)[`${doc.id}_url`]}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-[#6B3CD2] transition-colors z-30"
                                                    >
                                                        <ExternalLink size={11} /> Voir le document
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer */}
                                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black text-slate-900">{uploadedCount}</span>
                                            <span className="text-[12px] font-medium text-slate-400">/ {REQUIRED_DOCUMENTS.length} documents téléversés</span>
                                        </div>
                                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#6B3CD2] rounded-full transition-all duration-500"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            disabled={!studentData}
                                            onClick={() => setActiveTab(AdmissionTab.ENTREPRISE)}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-[4px] bg-[#6B3CD2] text-white font-black text-[11px] uppercase tracking-widest hover:bg-[#5a2eb8] transition-all shadow-md shadow-[#6B3CD2]/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                        >
                                            Continuer
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === AdmissionTab.ENTREPRISE && (
                            <div className="animate-slide-in">
                                <EntrepriseForm
                                    onNext={(response?: any) => {
                                        if (response?.entreprise_info) {
                                            setStudentData((prev: any) => ({
                                                ...prev,
                                                id_entreprise: response.entreprise_info.id,
                                                entreprise_raison_sociale: response.entreprise_info.raison_sociale
                                            }));
                                        }
                                        setEntrepriseCompleted(true);
                                        setActiveTab(AdmissionTab.ADMINISTRATIF);
                                    }}
                                    studentRecordId={studentData?.record_id || studentData?.id || localStorage.getItem('candidateRecordId')}
                                />
                            </div>
                        )}

                        {activeTab === AdmissionTab.ADMINISTRATIF && (
                            <div className="animate-fade-in bg-white rounded-[4px] border border-slate-100 shadow-sm relative overflow-hidden">
                                <div className="formation-section" style={{ padding: '0 28px 28px' }}>
                                    {/* Header Administratif */}
                                    <div style={{ paddingTop: '24px' }}></div>
                                    <div className="fiche-header">
                                        <div className="fiche-header-icon !bg-brand/5 !text-brand">
                                            <Printer size={24} />
                                        </div>
                                        <div className="fiche-header-text">
                                            <h2 className="text-[18.4px] font-black text-[#18162A]">Dossier Administratif</h2>
                                            <p>Générez et complétez les documents contractuels officiels</p>
                                        </div>
                                    </div>
                                    <div className="fiche-divider"></div>

                                    <div className="space-y-4">
                                        {/* Section 1: Documents à générer */}
                                        <div className="fiche-section">
                                            <div className="fiche-section-title">
                                                <span className="fiche-section-num">1</span>
                                                <span className="fiche-section-label">Documents à Générer</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {ADMIN_DOCS.filter(d => d.btnText === 'Générer').map(doc => {
                                                    const isGenerating = (doc.id === 'renseignements' && isGeneratingFiche) ||
                                                        (doc.id === 'cerfa' && isGeneratingCerfa) ||
                                                        (doc.id === 'atre' && isGeneratingAtre) ||
                                                        (doc.id === 'compte-rendu' && isGeneratingCompteRendu) ||
                                                        (doc.id === 'convention-apprentissage' && isGeneratingConventionApprentissage) ||
                                                        (doc.id === 'livret' && isGeneratingLivret);

                                                    const iconCls: Record<string, string> = {
                                                        orange: 'bg-orange-100 border-orange-200 text-orange-600',
                                                        blue: 'bg-blue-100 border-blue-200 text-blue-600',
                                                        emerald: 'bg-emerald-100 border-emerald-200 text-emerald-600',
                                                        pink: 'bg-pink-100 border-pink-200 text-pink-600',
                                                        indigo: 'bg-indigo-100 border-indigo-200 text-indigo-600',
                                                        cyan: 'bg-cyan-100 border-cyan-200 text-cyan-600',
                                                    };

                                                    return (
                                                        <div key={doc.id} className="relative flex flex-col bg-white border border-slate-200 rounded-[4px] p-5 hover:border-[#6B3CD2]/40 hover:shadow-md transition-all duration-200">
                                                            <div className={`w-11 h-11 rounded-[4px] flex items-center justify-center mb-4 border-2 ${iconCls[doc.color] || 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                                                                <FileText size={20} />
                                                            </div>
                                                            <h4 className="font-black text-slate-800 text-[12px] mb-0.5 uppercase tracking-tight truncate">{doc.title}</h4>
                                                            <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">{doc.subtitle}</p>
                                                            <p className="text-[11px] text-slate-600 font-medium leading-tight mb-4 line-clamp-2 h-8">{doc.desc}</p>

                                                            <div className="mt-auto">
                                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wide mb-3">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></span>
                                                                    Prêt à générer
                                                                </span>
                                                                <button
                                                                    disabled={isGenerating}
                                                                    onClick={() => handleDocAction(doc)}
                                                                    className={`w-full py-2.5 rounded-[4px] font-bold text-[11px] uppercase tracking-widest border-2 border-[#6B3CD2]/30 text-[#6B3CD2] bg-white hover:bg-[#6B3CD2] hover:text-white hover:border-[#6B3CD2] transition-all flex items-center justify-center gap-2 ${isGenerating ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                                >
                                                                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <PenTool size={14} />}
                                                                    {isGenerating ? 'Génération...' : doc.btnText}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Section 2: Documents à signer */}
                                        <div className="fiche-section">
                                            <div className="fiche-section-title">
                                                <span className="fiche-section-num">2</span>
                                                <span className="fiche-section-label">Documents à Signer</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {ADMIN_DOCS.filter(d => d.btnText === 'Signer').map(doc => (
                                                    <div key={doc.id} className="relative flex items-start gap-5 bg-white border border-slate-200 rounded-[4px] p-5 hover:border-[#6B3CD2]/40 hover:shadow-md transition-all duration-200">
                                                        <div className={`w-11 h-11 rounded-[4px] flex items-center justify-center border-2 flex-shrink-0 ${doc.color === 'green' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-purple-100 border-purple-200 text-purple-700'
                                                            }`}>
                                                            <FileCheck size={20} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-slate-900 text-[12px] mb-0.5 uppercase tracking-tight">{doc.title}</h4>
                                                            <p className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wide">{doc.subtitle}</p>
                                                            <p className="text-[11px] text-slate-500 font-medium leading-tight mb-3">{doc.desc}</p>
                                                            <div className="flex items-center gap-3">
                                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold uppercase tracking-wide">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse flex-shrink-0"></span>
                                                                    Signature requise
                                                                </span>
                                                                <button
                                                                    onClick={() => handleDocAction(doc)}
                                                                    className="ml-auto px-5 py-2 rounded-[4px] font-bold text-[11px] uppercase tracking-widest border-2 border-[#6B3CD2]/30 text-[#6B3CD2] bg-white hover:bg-[#6B3CD2] hover:text-white hover:border-[#6B3CD2] transition-all flex items-center gap-2"
                                                                >
                                                                    <PenTool size={14} />
                                                                    {doc.btnText}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center">
                                        <button
                                            onClick={() => navigate('/admission')}
                                            className="px-16 py-3.5 bg-[#18162A] text-white rounded-[4px] font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                                        >
                                            <CheckCircle2 size={18} className="text-emerald-400" />
                                            Finaliser le dossier complet
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === AdmissionTab.ENTRETIEN && (
                            <div className="animate-slide-in">
                                <EvaluationGrid
                                    studentData={studentData}
                                    onNext={() => {
                                        setInterviewCompleted(true);
                                        setActiveTab(AdmissionTab.PROJET_PROFESSIONNEL);
                                    }}
                                />
                            </div>
                        )}

                        {activeTab === AdmissionTab.PROJET_PROFESSIONNEL && (
                            <div className="animate-slide-in">
                                <ProjetProfessionnel
                                    studentData={studentData}
                                    onNext={() => {
                                        setProjetProCompleted(true);
                                        setActiveTab(AdmissionTab.QUESTIONNAIRE);
                                    }}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdmissionView;
