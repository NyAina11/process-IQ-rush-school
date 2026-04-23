import React from 'react';
import {
  User,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  FileText,
  Upload,
  ChevronDown,
  Download,
  Check
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

const StudentAttendance: React.FC = () => {
  return (
    <div className="p-8 space-y-6 bg-[#f4f7f9] min-h-screen font-sans">
      <StudentNavbar />

      {/* Header */}
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

      {/* KPI Top Section */}
      <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-6 mb-8">
        {/* Main Presence Chart */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle 
                cx="50" cy="50" r="42" 
                fill="none" 
                stroke="#f3f4f6" 
                strokeWidth="8" 
              />
              {/* Progress circle */}
              <circle 
                cx="50" cy="50" r="42" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="8" 
                strokeDasharray="263.8" 
                strokeDashoffset={263.8 * (1 - 0.94)}
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[42px] font-extrabold text-[#111827] leading-none">94%</span>
              <span className="text-[13px] font-bold text-gray-400 mt-1">Présence</span>
            </div>
          </div>
          <div className="bg-[#ecfdf5] text-[#10b981] px-5 py-2 rounded-full text-[13px] font-extrabold shadow-sm border border-[#d1fae5]">
            Objectif: 90% ✓
          </div>
        </div>

        {/* Smaller Metrics Grid (Right side) */}
        <div className="grid grid-rows-2 gap-6 col-span-2">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start gap-5">
              <div className="bg-[#f0fdf4] text-[#10b981] p-4 rounded-2xl">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <div className="text-[32px] font-extrabold text-[#111827] leading-none mb-1">47</div>
                <div className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Présences</div>
                <div className="text-[12px] font-bold text-[#10b981] mt-2">Sur 50 cours programmés</div>
              </div>
            </div>
            <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start gap-5">
              <div className="bg-[#fef2f2] text-[#ef4444] p-4 rounded-2xl">
                <XCircle size={28} />
              </div>
              <div>
                <div className="text-[32px] font-extrabold text-[#111827] leading-none mb-1">3</div>
                <div className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Absences</div>
                <div className="text-[12px] font-bold text-[#ef4444] mt-2">1 non justifiée</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start gap-5">
              <div className="bg-[#fffbeb] text-[#f59e0b] p-4 rounded-2xl">
                <Clock size={28} />
              </div>
              <div>
                <div className="text-[32px] font-extrabold text-[#111827] leading-none mb-1">2</div>
                <div className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Retards</div>
                <div className="text-[12px] font-bold text-[#f59e0b] mt-2">35 min cumulées</div>
              </div>
            </div>
            <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start gap-5">
              <div className="bg-[#eff6ff] text-[#3b82f6] p-4 rounded-2xl">
                <Calendar size={28} />
              </div>
              <div>
                <div className="text-[32px] font-extrabold text-[#111827] leading-none mb-1">420h</div>
                <div className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Heures effectuées</div>
                <div className="text-[12px] font-bold text-[#3b82f6] mt-2">Sur 1680h prévues</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yellow Alert Banner */}
      <div className="bg-gradient-to-r from-[#fff9c4] to-[#fffde7] rounded-[24px] p-6 shadow-sm flex items-center justify-between border border-[#fef08a]">
        <div className="flex items-center gap-5">
          <div className="bg-[#f59e0b] text-white p-3.5 rounded-2xl shadow-md">
            <FileText size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[16px] font-extrabold text-[#854d0e]">1 justificatif en attente</div>
            <div className="text-[13px] font-bold text-[#a16207] opacity-80 mt-0.5">Absence du 20/01/2026 • Deadline: 27/01</div>
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#f59e0b] text-white rounded-[14px] text-[14px] font-extrabold shadow-md hover:bg-[#d97706] transition-colors">
          <Upload size={18} /> Envoyer un justificatif
        </button>
      </div>

      {/* History Table Section */}
      <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="text-[20px]">📋</div>
            <h3 className="text-[18px] font-extrabold text-[#111827]">Historique des absences et retards</h3>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-100 rounded-xl text-[13px] font-extrabold text-[#111827] bg-[#f8fafc] hover:bg-gray-100 transition-colors">
              Ce mois <ChevronDown size={14} />
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-[#3b82f6] text-white rounded-xl text-[13px] font-extrabold shadow-md shadow-blue-100 hover:bg-blue-600 transition-colors">
              <Download size={16} /> Attestation de présence
            </button>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="pb-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Date</th>
              <th className="pb-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Type</th>
              <th className="pb-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Cours concerné</th>
              <th className="pb-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Durée</th>
              <th className="pb-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Motif</th>
              <th className="pb-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Statut</th>
              <th className="pb-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Row 1 - Pending */}
            <tr className="bg-[#fffcf0] border-b border-[#fef9c3] hover:bg-[#fff9e0] transition-colors">
              <td className="py-5 px-4 text-[14px] font-extrabold text-[#111827]">20/01/2026</td>
              <td className="py-5 px-4">
                <span className="bg-[#fee2e2] text-[#ef4444] px-3 py-1 rounded-full text-[10px] font-extrabold">Absence</span>
              </td>
              <td className="py-5 px-4 text-[14px] font-extrabold text-[#111827]">Marketing digital</td>
              <td className="py-5 px-4 text-[14px] font-bold text-gray-500">3h00</td>
              <td className="py-5 px-4 text-[14px] font-bold text-gray-300">-</td>
              <td className="py-5 px-4">
                <span className="flex items-center gap-1.5 text-[#f59e0b] text-[13px] font-extrabold">
                  <Clock size={14} /> En attente
                </span>
              </td>
              <td className="py-5 px-4">
                <button className="bg-[#f59e0b] text-white px-5 py-2 rounded-xl text-[12px] font-extrabold shadow-sm hover:bg-[#d97706] transition-colors">
                  Justifier
                </button>
              </td>
            </tr>

            {/* Row 2 - Justified */}
            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="py-5 px-4 text-[14px] font-extrabold text-[#111827]">15/01/2026</td>
              <td className="py-5 px-4">
                <span className="bg-[#fef3c7] text-[#f59e0b] px-3 py-1 rounded-full text-[10px] font-extrabold">Retard</span>
              </td>
              <td className="py-5 px-4 text-[14px] font-extrabold text-[#111827]">Négociation commerciale</td>
              <td className="py-5 px-4 text-[14px] font-bold text-gray-500">20 min</td>
              <td className="py-5 px-4 text-[14px] font-bold text-gray-400">Transport</td>
              <td className="py-5 px-4">
                <span className="flex items-center gap-1.5 text-[#22c55e] text-[13px] font-extrabold">
                  <Check size={14} strokeWidth={3} /> Justifié
                </span>
              </td>
              <td className="py-5 px-4 text-[14px] font-bold text-gray-300">-</td>
            </tr>

            {/* Row 3 - Justified */}
            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="py-5 px-4 text-[14px] font-extrabold text-[#111827]">08/01/2026</td>
              <td className="py-5 px-4">
                <span className="bg-[#fee2e2] text-[#ef4444] px-3 py-1 rounded-full text-[10px] font-extrabold">Absence</span>
              </td>
              <td className="py-5 px-4 text-[14px] font-extrabold text-[#111827]">Anglais professionnel</td>
              <td className="py-5 px-4 text-[14px] font-bold text-gray-500">2h00</td>
              <td className="py-5 px-4 text-[14px] font-bold text-gray-400">Maladie</td>
              <td className="py-5 px-4">
                <span className="flex items-center gap-1.5 text-[#22c55e] text-[13px] font-extrabold">
                  <Check size={14} strokeWidth={3} /> Justifié
                </span>
              </td>
              <td className="py-5 px-4 text-[14px] font-bold text-gray-300">-</td>
            </tr>

            {/* Row 4 - Justified */}
            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="py-5 px-4 text-[14px] font-extrabold text-[#111827]">18/12/2025</td>
              <td className="py-5 px-4">
                <span className="bg-[#fef3c7] text-[#f59e0b] px-3 py-1 rounded-full text-[10px] font-extrabold">Retard</span>
              </td>
              <td className="py-5 px-4 text-[14px] font-extrabold text-[#111827]">Culture générale</td>
              <td className="py-5 px-4 text-[14px] font-bold text-gray-500">15 min</td>
              <td className="py-5 px-4 text-[14px] font-bold text-gray-400">Personnel</td>
              <td className="py-5 px-4">
                <span className="flex items-center gap-1.5 text-[#22c55e] text-[13px] font-extrabold">
                  <Check size={14} strokeWidth={3} /> Justifié
                </span>
              </td>
              <td className="py-5 px-4 text-[14px] font-bold text-gray-300">-</td>
            </tr>

            {/* Row 5 - Justified */}
            <tr className="hover:bg-gray-50/50 transition-colors">
              <td className="py-5 px-4 text-[14px] font-extrabold text-[#111827]">02/12/2025</td>
              <td className="py-5 px-4">
                <span className="bg-[#fee2e2] text-[#ef4444] px-3 py-1 rounded-full text-[10px] font-extrabold">Absence</span>
              </td>
              <td className="py-5 px-4 text-[14px] font-extrabold text-[#111827]">GRC - Relation client</td>
              <td className="py-5 px-4 text-[14px] font-bold text-gray-500">3h00</td>
              <td className="py-5 px-4 text-[14px] font-bold text-gray-400">RDV médical</td>
              <td className="py-5 px-4">
                <span className="flex items-center gap-1.5 text-[#22c55e] text-[13px] font-extrabold">
                  <Check size={14} strokeWidth={3} /> Justifié
                </span>
              </td>
              <td className="py-5 px-4 text-[14px] font-bold text-gray-300">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAttendance;
