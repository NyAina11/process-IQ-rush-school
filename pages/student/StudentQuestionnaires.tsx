import React from 'react';
import {
  User,
  GraduationCap,
  ClipboardCheck,
  Play,
  CheckCircle2,
  Clock,
  Calendar,
  HelpCircle,
  Eye,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

const StudentQuestionnaires: React.FC = () => {
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

      {/* Section Title & KPIs */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-[24px] font-extrabold text-[#111827] mb-1">Questionnaires & Évaluations</h2>
          <p className="text-[14px] font-medium text-[#6b7280]">Complétez vos questionnaires pour améliorer votre formation</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#e8faee] px-6 py-4 rounded-2xl text-center min-w-[120px] shadow-sm">
            <div className="text-[24px] font-extrabold text-[#2bc574]">3</div>
            <div className="text-[12px] font-bold text-[#2bc574]">Complétés</div>
          </div>
          <div className="bg-[#fff7ed] px-6 py-4 rounded-2xl text-center min-w-[120px] shadow-sm">
            <div className="text-[24px] font-extrabold text-[#f59e0b]">1</div>
            <div className="text-[12px] font-bold text-[#f59e0b]">En attente</div>
          </div>
        </div>
      </div>

      {/* Urgent Banner */}
      <div className="bg-[#fefce8] border border-[#fef08a] rounded-[32px] p-8 mb-10 relative overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-[#f59e0b] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100">
              <ClipboardCheck size={32} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-[20px] font-extrabold text-[#92400e]">Évaluation satisfaction S1</h3>
                <span className="bg-[#ef4444] text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Urgent</span>
              </div>
              <p className="text-[15px] font-medium text-[#b45309] mb-4">Évaluez vos formateurs et la qualité de l'enseignement</p>
              <div className="flex flex-wrap gap-6 text-[13px] font-bold text-[#d97706]">
                <span className="flex items-center gap-2">
                  <Clock size={16} /> ~5 minutes
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} /> Deadline: 31 janvier 2026
                </span>
                <span className="flex items-center gap-2">
                  <HelpCircle size={16} /> 15 questions
                </span>
              </div>
            </div>
          </div>
          <button className="bg-[#f59e0b] text-white px-8 py-4 rounded-2xl text-[16px] font-extrabold flex items-center gap-3 hover:bg-[#d97706] transition-all shadow-xl shadow-orange-100">
            <Play size={20} fill="currentColor" /> Commencer
          </button>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Card 1: Questionnaire de rentrée */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-[#e8faee] rounded-xl flex items-center justify-center">
              <CheckCircle2 size={24} className="text-[#2bc574]" />
            </div>
            <span className="bg-[#e8faee] text-[#2bc574] text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 border border-[#bbf7d0]">
              Complété <CheckCircle2 size={12} strokeWidth={3} />
            </span>
          </div>
          <h4 className="text-[17px] font-extrabold text-[#111827] mb-1">Questionnaire de rentrée</h4>
          <p className="text-[14px] font-medium text-[#94a3b8] mb-8">Vos attentes et objectifs</p>
          
          <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
            <span className="text-[13px] font-bold text-[#cbd5e1]">Complété le 15/09/2025</span>
            <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-[13px] font-extrabold text-[#1e293b] hover:bg-gray-50 transition-all">
              Voir mes réponses
            </button>
          </div>
        </div>

        {/* Card 2: Auto-évaluation compétences */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-[#e8faee] rounded-xl flex items-center justify-center">
              <CheckCircle2 size={24} className="text-[#2bc574]" />
            </div>
            <span className="bg-[#e8faee] text-[#2bc574] text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 border border-[#bbf7d0]">
              Complété <CheckCircle2 size={12} strokeWidth={3} />
            </span>
          </div>
          <h4 className="text-[17px] font-extrabold text-[#111827] mb-1">Auto-évaluation compétences</h4>
          <p className="text-[14px] font-medium text-[#94a3b8] mb-6">Bilan mi-parcours</p>
          
          <div className="bg-[#f8fafc] rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] font-extrabold text-[#64748b]">Votre score global</span>
              <span className="text-[14px] font-extrabold text-[#2bc574]">72%</span>
            </div>
            <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
              <div className="bg-[#2bc574] h-full rounded-full" style={{ width: '72%' }}></div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
            <span className="text-[13px] font-bold text-[#cbd5e1]">Complété le 15/11/2025</span>
            <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-[13px] font-extrabold text-[#1e293b] hover:bg-gray-50 transition-all">
              Voir le détail
            </button>
          </div>
        </div>

        {/* Card 3: Évaluation tuteur entreprise */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-[#e8faee] rounded-xl flex items-center justify-center">
              <CheckCircle2 size={24} className="text-[#2bc574]" />
            </div>
            <span className="bg-[#e8faee] text-[#2bc574] text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 border border-[#bbf7d0]">
              Complété <CheckCircle2 size={12} strokeWidth={3} />
            </span>
          </div>
          <h4 className="text-[17px] font-extrabold text-[#111827] mb-1">Évaluation tuteur entreprise</h4>
          <p className="text-[14px] font-medium text-[#94a3b8] mb-8">Relation avec votre tuteur</p>
          
          <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
            <span className="text-[13px] font-bold text-[#cbd5e1]">Complété le 10/12/2025</span>
            <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-[13px] font-extrabold text-[#1e293b] hover:bg-gray-50 transition-all">
              Voir mes réponses
            </button>
          </div>
        </div>

        {/* Card 4: Bilan de fin d'année */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white flex flex-col h-full opacity-60">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-[#f1f5f9] rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-[#94a3b8]" />
            </div>
            <span className="bg-[#f1f5f9] text-[#94a3b8] text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
              À venir
            </span>
          </div>
          <h4 className="text-[17px] font-extrabold text-[#111827] mb-1">Bilan de fin d'année</h4>
          <p className="text-[14px] font-medium text-[#94a3b8] mb-8">Évaluation globale de l'année</p>
          
          <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
            <span className="text-[12px] font-bold text-[#94a3b8] flex items-center gap-2">
              <Calendar size={14} className="text-[#3b82f6]" /> Disponible le 15/06/2026
            </span>
            <button disabled className="bg-[#f1f5f9] px-6 py-2 rounded-xl text-[13px] font-extrabold text-[#cbd5e1] cursor-not-allowed">
              Indisponible
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuestionnaires;
