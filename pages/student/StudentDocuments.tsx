import React from 'react';
import {
  User,
  GraduationCap,
  Plus,
  Folder,
  FileText,
  BookOpen,
  Building2,
  Award,
  Download,
  Eye,
  Clock,
  Calendar,
  CheckSquare,
  FileCheck,
  Upload,
  Check,
  Hourglass
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

const StudentDocuments: React.FC = () => {
  return (
    <div className="p-8 space-y-6 bg-[#f4f7f9] min-h-screen font-sans">
      <StudentNavbar />

      {/* Header Profile */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-[28px] font-extrabold text-[#111827]">Mon Espace Étudiant</h1>
        <div className="flex items-center gap-6 text-[13px] text-[#6b7280] font-medium mt-1">
          <div className="flex items-center gap-2">
            <User size={16} className="text-[#8898aa]" />
            <span>Marie LAMBERT</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-[#8898aa]" />
            <span>BTS NDRC - 1ère année</span>
          </div>
        </div>
      </div>

      {/* Section Title & Request Button */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[24px] font-extrabold text-[#111827] mb-1">Mes documents</h2>
          <p className="text-[14px] font-medium text-[#6b7280]">Téléchargez vos documents administratifs et pédagogiques</p>
        </div>
        <button className="bg-[#3b82f6] text-white px-6 py-3 rounded-xl text-[14px] font-extrabold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all">
          <Plus size={18} strokeWidth={3} /> Demander un document
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        <button className="bg-[#3b82f6] text-white px-6 py-2.5 rounded-xl text-[14px] font-extrabold flex items-center gap-3 shadow-md shadow-blue-100">
          <Folder size={18} fill="currentColor" className="opacity-40" /> Tous
        </button>
        <button className="bg-white border border-gray-100 text-[#64748b] px-6 py-2.5 rounded-xl text-[14px] font-extrabold flex items-center gap-3 hover:bg-gray-50 transition-all">
          <FileText size={18} className="text-[#ef4444]" /> Administratifs
        </button>
        <button className="bg-white border border-gray-100 text-[#64748b] px-6 py-2.5 rounded-xl text-[14px] font-extrabold flex items-center gap-3 hover:bg-gray-50 transition-all">
          <BookOpen size={18} className="text-[#22c55e]" /> Pédagogiques
        </button>
        <button className="bg-white border border-gray-100 text-[#64748b] px-6 py-2.5 rounded-xl text-[14px] font-extrabold flex items-center gap-3 hover:bg-gray-50 transition-all">
          <Building2 size={18} className="text-[#3b82f6]" /> Entreprise
        </button>
        <button className="bg-white border border-gray-100 text-[#64748b] px-6 py-2.5 rounded-xl text-[14px] font-extrabold flex items-center gap-3 hover:bg-gray-50 transition-all">
          <Award size={18} className="text-[#a855f7]" /> Certificats
        </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Card 1: Attestation de scolarité */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#dcfce7] rounded-xl flex items-center justify-center">
                <GraduationCap size={24} className="text-[#22c55e]" />
              </div>
              <div>
                <h4 className="text-[16px] font-extrabold text-[#111827]">Attestation de scolarité</h4>
                <p className="text-[13px] font-bold text-[#94a3b8]">Année 2025-2026</p>
              </div>
            </div>
            <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-extrabold px-3 py-1 rounded-full">Disponible</span>
          </div>
          <div className="flex gap-3 mt-auto">
            <button className="flex-1 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl text-[13px] font-extrabold text-[#1e293b] flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
              <Eye size={16} /> Aperçu
            </button>
            <button className="flex-1 py-3 bg-[#10b981] text-white rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-2 hover:bg-[#059669] transition-all shadow-md shadow-green-100">
              <Download size={16} /> Télécharger
            </button>
          </div>
        </div>

        {/* Card 2: Contrat d'apprentissage */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#dbeafe] rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-[#3b82f6]" />
              </div>
              <div>
                <h4 className="text-[16px] font-extrabold text-[#111827]">Contrat d'apprentissage</h4>
                <p className="text-[13px] font-bold text-[#94a3b8]">Signé le 01/09/2025</p>
              </div>
            </div>
            <span className="bg-[#eff6ff] text-[#3b82f6] text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
              Signé <Check size={12} strokeWidth={3} />
            </span>
          </div>
          <div className="flex gap-3 mt-auto">
            <button className="flex-1 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl text-[13px] font-extrabold text-[#1e293b] flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
              <Eye size={16} /> Aperçu
            </button>
            <button className="flex-1 py-3 bg-[#3b82f6] text-white rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-md shadow-blue-100">
              <Download size={16} /> Télécharger
            </button>
          </div>
        </div>

        {/* Card 3: Convention de formation */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f3e8ff] rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-[#a855f7]" />
              </div>
              <div>
                <h4 className="text-[16px] font-extrabold text-[#111827]">Convention de formation</h4>
                <p className="text-[13px] font-bold text-[#94a3b8]">Tripartite Rush School</p>
              </div>
            </div>
            <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-extrabold px-3 py-1 rounded-full">Disponible</span>
          </div>
          <div className="flex gap-3 mt-auto">
            <button className="flex-1 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl text-[13px] font-extrabold text-[#1e293b] flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
              <Eye size={16} /> Aperçu
            </button>
            <button className="flex-1 py-3 bg-[#8b5cf6] text-white rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-2 hover:bg-[#7c3aed] transition-all shadow-md shadow-purple-100">
              <Download size={16} /> Télécharger
            </button>
          </div>
        </div>

        {/* Card 4: Bulletin de notes S1 */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border-[#fef08a] flex flex-col justify-between h-full border">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#fee2e2] rounded-xl flex items-center justify-center">
                  <Award size={24} className="text-[#ef4444]" />
                </div>
                <div>
                  <h4 className="text-[16px] font-extrabold text-[#111827]">Bulletin de notes S1</h4>
                  <p className="text-[13px] font-bold text-[#94a3b8]">Semestre 1 - 2025/2026</p>
                </div>
              </div>
              <span className="bg-[#fef9c3] text-[#a16207] text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                En cours <Hourglass size={12} strokeWidth={3} />
              </span>
            </div>
            
            <div className="bg-[#fefce8] border border-[#fef08a] rounded-xl p-3 flex items-center gap-3 mb-6">
              <Calendar size={16} className="text-[#a16207]" />
              <p className="text-[12px] font-extrabold text-[#a16207]">Disponible à partir du 15/02/2026</p>
            </div>
          </div>

          <div className="flex gap-3 mt-auto">
            <button className="flex-1 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl text-[13px] font-extrabold text-[#1e293b] flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
              <Eye size={16} /> Aperçu
            </button>
            <div className="flex-1"></div>
          </div>
        </div>

        {/* Card 5: Relevé d'heures */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#fef9c3] rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-[#ca8a04]" />
              </div>
              <div>
                <h4 className="text-[16px] font-extrabold text-[#111827]">Relevé d'heures</h4>
                <p className="text-[13px] font-bold text-[#94a3b8]">Janvier 2026</p>
              </div>
            </div>
            <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-extrabold px-3 py-1 rounded-full">Disponible</span>
          </div>
          <div className="flex gap-3 mt-auto">
            <button className="flex-1 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl text-[13px] font-extrabold text-[#1e293b] flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
              <Eye size={16} /> Aperçu
            </button>
            <button className="flex-1 py-3 bg-[#f59e0b] text-white rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-2 hover:bg-[#d97706] transition-all shadow-md shadow-orange-100">
              <Download size={16} /> Télécharger
            </button>
          </div>
        </div>

        {/* Card 6: Planning annuel */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#dbeafe] rounded-xl flex items-center justify-center">
                <Calendar size={24} className="text-[#3b82f6]" />
              </div>
              <div>
                <h4 className="text-[16px] font-extrabold text-[#111827]">Planning annuel</h4>
                <p className="text-[13px] font-bold text-[#94a3b8]">Calendrier alternance</p>
              </div>
            </div>
            <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-extrabold px-3 py-1 rounded-full">Disponible</span>
          </div>
          <div className="flex gap-3 mt-auto">
            <button className="flex-1 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl text-[13px] font-extrabold text-[#1e293b] flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
              <Eye size={16} /> Aperçu
            </button>
            <button className="flex-1 py-3 bg-[#3b82f6] text-white rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-md shadow-blue-100">
              <Download size={16} /> Télécharger
            </button>
          </div>
        </div>

        {/* Card 7: Grille d'évaluation */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f3e8ff] rounded-xl flex items-center justify-center">
                <CheckSquare size={24} className="text-[#a855f7]" />
              </div>
              <div>
                <h4 className="text-[16px] font-extrabold text-[#111827]">Grille d'évaluation</h4>
                <p className="text-[13px] font-bold text-[#94a3b8]">Évaluation entretien d'admission</p>
              </div>
            </div>
            <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-extrabold px-3 py-1 rounded-full">Disponible</span>
          </div>
          <div className="flex gap-3 mt-auto">
            <button className="flex-1 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl text-[13px] font-extrabold text-[#1e293b] flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
              <Eye size={16} /> Aperçu
            </button>
            <button className="flex-1 py-3 bg-[#8b5cf6] text-white rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-2 hover:bg-[#7c3aed] transition-all shadow-md shadow-purple-100">
              <Download size={16} /> Télécharger
            </button>
          </div>
        </div>

        {/* Card 8: Résultats du test */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f3e8ff] rounded-xl flex items-center justify-center">
                <FileCheck size={24} className="text-[#a855f7]" />
              </div>
              <div>
                <h4 className="text-[16px] font-extrabold text-[#111827]">Résultats du test</h4>
                <p className="text-[13px] font-bold text-[#94a3b8]">Test de positionnement admission</p>
              </div>
            </div>
            <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-extrabold px-3 py-1 rounded-full">Disponible</span>
          </div>
          <div className="flex gap-3 mt-auto">
            <button className="flex-1 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl text-[13px] font-extrabold text-[#1e293b] flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
              <Eye size={16} /> Aperçu
            </button>
            <button className="flex-1 py-3 bg-[#8b5cf6] text-white rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-2 hover:bg-[#7c3aed] transition-all shadow-md shadow-purple-100">
              <Download size={16} /> Télécharger
            </button>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-[32px] p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-[#eff6ff] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Upload size={32} className="text-[#3b82f6]" />
        </div>
        <h4 className="text-[18px] font-extrabold text-[#111827] mb-2">Déposez vos documents ici</h4>
        <p className="text-[14px] font-medium text-[#94a3b8] mb-8">ou cliquez pour parcourir vos fichiers</p>
        <button className="bg-[#3b82f6] text-white px-8 py-3 rounded-xl text-[14px] font-extrabold hover:bg-blue-600 transition-all shadow-md shadow-blue-100 mb-4">
          Sélectionner un fichier
        </button>
        <p className="text-[12px] font-bold text-[#94a3b8]">PDF, JPG, PNG • Max 10 Mo</p>
      </div>
    </div>
  );
};

export default StudentDocuments;
