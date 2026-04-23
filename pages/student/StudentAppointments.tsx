import React from 'react';
import {
  User,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Plus,
  Building,
  Target,
  MessageSquare,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

const StudentAppointments: React.FC = () => {
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-10 items-start">
        {/* Left Column: Mes RDV à venir & Historique */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar size={20} className="text-[#3b82f6]" />
                </div>
                <h3 className="text-[18px] font-extrabold text-[#111827]">Mes RDV à venir</h3>
              </div>
              <span className="bg-[#3b82f6] text-white text-[12px] font-extrabold px-2.5 py-0.5 rounded-full">2</span>
            </div>

            <div className="space-y-5">
              {/* Card 1: Point pédagogique */}
              <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-[24px] p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-[17px] font-extrabold text-[#111827]">Point pédagogique</h4>
                    <p className="text-[13px] font-bold text-[#3b82f6] opacity-70">Suivi de votre progression</p>
                  </div>
                  <span className="bg-[#3b82f6] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Dans 4 jours
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6">
                  <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#4b5563]">
                    <Calendar size={15} className="text-[#3b82f6]" />
                    <span>Jeudi 30 Janvier</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#4b5563]">
                    <Clock size={15} className="text-[#3b82f6]" />
                    <span>14h00 - 14h30</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#4b5563]">
                    <User size={15} className="text-[#3b82f6]" />
                    <span>Mme Dubois</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#4b5563]">
                    <MapPin size={15} className="text-[#3b82f6]" />
                    <span>Bureau 105</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-2.5 bg-white border border-[#dbeafe] text-[#3b82f6] rounded-xl text-[13px] font-extrabold hover:bg-gray-50 transition-colors">
                    Modifier
                  </button>
                  <button className="flex-1 py-2.5 bg-[#3b82f6] text-white rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-md shadow-blue-100">
                    <ArrowRight size={16} className="rotate-[-45deg]" /> Rejoindre
                  </button>
                </div>
              </div>

              {/* Card 2: Visite en entreprise */}
              <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-[24px] p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-[17px] font-extrabold text-[#111827]">Visite en entreprise</h4>
                    <p className="text-[13px] font-bold text-[#10b981] opacity-70">Rencontre avec votre tuteur</p>
                  </div>
                  <span className="bg-[#10b981] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Dans 15 jours
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-5">
                  <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#4b5563]">
                    <Calendar size={15} className="text-[#10b981]" />
                    <span>Lundi 10 Février</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#4b5563]">
                    <Clock size={15} className="text-[#10b981]" />
                    <span>10h00 - 11h00</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#4b5563]">
                    <User size={15} className="text-[#10b981]" />
                    <span>Mme Dubois + M. Dupont</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#4b5563]">
                    <MapPin size={15} className="text-[#10b981]" />
                    <span>Carrefour Clichy</span>
                  </div>
                </div>

                <div className="bg-[#dcfce7]/50 rounded-xl p-3 flex items-center gap-3 border border-[#bbf7d0]">
                  <span className="text-[16px]">📝</span>
                  <p className="text-[12px] font-extrabold text-[#15803d]">Pensez à préparer votre bilan des missions réalisées</p>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="pt-4">
            <h3 className="text-[15px] font-extrabold text-gray-400 uppercase tracking-widest mb-4">Historique</h3>
            <div className="space-y-3">
              <div className="bg-white border border-gray-50 rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
                <div>
                  <div className="text-[14px] font-extrabold text-[#111827]">Point pédagogique</div>
                  <div className="text-[12px] font-bold text-gray-400">15/12/2025 • Mme Dubois</div>
                </div>
                <button className="px-4 py-1.5 bg-[#f8fafc] text-[#64748b] rounded-lg text-[12px] font-extrabold border border-gray-100 hover:bg-gray-100 transition-colors">
                  Voir CR
                </button>
              </div>
              <div className="bg-white border border-gray-50 rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
                <div>
                  <div className="text-[14px] font-extrabold text-[#111827]">Entretien de rentrée</div>
                  <div className="text-[12px] font-bold text-gray-400">05/09/2025 • M. Lambert</div>
                </div>
                <button className="px-4 py-1.5 bg-[#f8fafc] text-[#64748b] rounded-lg text-[12px] font-extrabold border border-gray-100 hover:bg-gray-100 transition-colors">
                  Voir CR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prendre un nouveau RDV */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#ecfdf5] rounded-2xl flex items-center justify-center shadow-sm">
              <Plus size={24} className="text-[#10b981]" />
            </div>
            <h3 className="text-[20px] font-extrabold text-[#111827]">Prendre un nouveau RDV</h3>
          </div>

          <div className="space-y-8">
            {/* Type de RDV */}
            <div>
              <label className="block text-[14px] font-extrabold text-[#111827] mb-4">Type de rendez-vous</label>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-5 bg-[#eff6ff] border-2 border-[#3b82f6] rounded-2xl flex flex-col items-center gap-3 transition-all">
                  <div className="text-[20px] bg-white p-2.5 rounded-xl shadow-sm">📚</div>
                  <span className="text-[13px] font-extrabold text-[#111827]">Point pédagogique</span>
                </button>
                <button className="p-5 bg-white border border-gray-100 rounded-2xl flex flex-col items-center gap-3 hover:border-gray-200 transition-all">
                  <div className="text-[20px] bg-[#f8fafc] p-2.5 rounded-xl">🏢</div>
                  <span className="text-[13px] font-extrabold text-gray-500">Suivi alternance</span>
                </button>
                <button className="p-5 bg-white border border-gray-100 rounded-2xl flex flex-col items-center gap-3 hover:border-gray-200 transition-all">
                  <div className="text-[20px] bg-[#f8fafc] p-2.5 rounded-xl">🎯</div>
                  <span className="text-[13px] font-extrabold text-gray-500">Conseil orientation</span>
                </button>
                <button className="p-5 bg-white border border-gray-100 rounded-2xl flex flex-col items-center gap-3 hover:border-gray-200 transition-all">
                  <div className="text-[20px] bg-[#f8fafc] p-2.5 rounded-xl">💬</div>
                  <span className="text-[13px] font-extrabold text-gray-500">Autre demande</span>
                </button>
              </div>
            </div>

            {/* Avec qui? */}
            <div>
              <label className="block text-[14px] font-extrabold text-[#111827] mb-3">Avec qui ?</label>
              <div className="relative">
                <select className="w-full bg-[#f8fafc] border border-gray-100 rounded-2xl px-5 py-4 text-[14px] font-bold text-[#111827] appearance-none focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20">
                  <option>Mme Dubois - Référente pédagogique</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            {/* Motif */}
            <div>
              <label className="block text-[14px] font-extrabold text-[#111827] mb-3">Motif (optionnel)</label>
              <textarea 
                className="w-full bg-[#f8fafc] border border-gray-100 rounded-2xl px-5 py-4 text-[14px] font-medium text-[#111827] h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20"
                placeholder="Décrivez brièvement l'objet de votre demande..."
              />
            </div>

            {/* Créneaux */}
            <div>
              <label className="block text-[14px] font-extrabold text-[#111827] mb-4">Créneaux disponibles cette semaine</label>
              <div className="space-y-3">
                {[
                  { date: 'Mercredi 29 Janvier', time: '11h00 - 11h30' },
                  { date: 'Vendredi 31 Janvier', time: '14h00 - 14h30' },
                  { date: 'Lundi 3 Février', time: '16h00 - 16h30' }
                ].map((slot, i) => (
                  <div key={i} className="bg-[#f8fafc] border border-gray-50 rounded-2xl p-5 flex items-center justify-between hover:border-gray-100 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-200 bg-white"></div>
                      <div>
                        <div className="text-[14px] font-extrabold text-[#111827]">{slot.date}</div>
                        <div className="text-[12px] font-bold text-gray-400">{slot.time}</div>
                      </div>
                    </div>
                    <span className="bg-[#ecfdf5] text-[#10b981] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      Disponible
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button className="w-full py-5 bg-[#6366f1] text-white rounded-[20px] text-[15px] font-extrabold flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 hover:bg-[#4f46e5] transition-all">
              <CheckCircle2 size={20} strokeWidth={2.5} /> Confirmer le rendez-vous
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAppointments;
