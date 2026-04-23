import React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  User,
  GraduationCap
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

const StudentPlanning: React.FC = () => {
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

      {/* Planning Card */}
      <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        
        {/* Top Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-6">
            <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <div className="text-center">
              <h2 className="text-[20px] font-extrabold text-[#111827]">Semaine du 27 Janvier 2026</h2>
              <div className="text-[13px] font-medium text-gray-400 mt-0.5">Semaine 5 • Janvier 2026</div>
            </div>
            <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-[12px] text-[14px] font-extrabold text-[#111827] hover:bg-gray-50 transition-colors">
              <CalendarIcon size={18} />
              Mois
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#3b82f6] text-white rounded-[12px] text-[14px] font-extrabold shadow-md shadow-blue-200 hover:bg-blue-600 transition-colors">
              <Download size={18} strokeWidth={2.5} />
              Exporter iCal
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8">
          <button className="px-6 py-2 bg-[#3b82f6] text-white rounded-[10px] text-[13px] font-extrabold">Tout</button>
          <button className="px-5 py-2 border border-gray-200 text-gray-700 rounded-[10px] text-[13px] font-extrabold flex items-center gap-2.5 hover:bg-gray-50">
            <div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div> Cours
          </button>
          <button className="px-5 py-2 border border-gray-200 text-gray-700 rounded-[10px] text-[13px] font-extrabold flex items-center gap-2.5 hover:bg-gray-50">
            <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div> Entreprise
          </button>
          <button className="px-5 py-2 border border-gray-200 text-gray-700 rounded-[10px] text-[13px] font-extrabold flex items-center gap-2.5 hover:bg-gray-50">
            <div className="w-2 h-2 rounded-full bg-[#ec4899]"></div> Examens
          </button>
          <button className="px-5 py-2 border border-gray-200 text-gray-700 rounded-[10px] text-[13px] font-extrabold flex items-center gap-2.5 hover:bg-gray-50">
            <div className="w-2 h-2 rounded-full bg-[#6366f1]"></div> RDV
          </button>
        </div>

        {/* The Grid */}
        <div className="border border-gray-100 rounded-[20px] overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr_1fr] border-b border-gray-100 bg-white">
            <div className="p-4 flex flex-col items-center justify-center border-r border-gray-100">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">HORAIRE</span>
            </div>
            <div className="p-4 flex flex-col items-center justify-center border-r border-gray-100">
              <span className="text-[16px] font-extrabold text-[#1f2937]">Lun. 27</span>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">JANVIER</span>
            </div>
            <div className="p-4 flex flex-col items-center justify-center border-r border-gray-100">
              <span className="text-[16px] font-extrabold text-[#1f2937]">Mar. 28</span>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">JANVIER</span>
            </div>
            <div className="p-4 flex flex-col items-center justify-center border-r border-gray-100">
              <span className="text-[16px] font-extrabold text-[#1f2937]">Mer. 29</span>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">JANVIER</span>
            </div>
            <div className="p-4 flex flex-col items-center justify-center border-r border-gray-100">
              <span className="text-[16px] font-extrabold text-[#1f2937]">Jeu. 30</span>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">JANVIER</span>
            </div>
            <div className="p-4 flex flex-col items-center justify-center">
              <span className="text-[16px] font-extrabold text-[#1f2937]">Ven. 31</span>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">JANVIER</span>
            </div>
          </div>

          {/* Body */}
          <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr_1fr] grid-rows-[minmax(160px,auto)_minmax(160px,auto)] bg-white">
            
            {/* HORAIRE col */}
            <div className="col-start-1 row-start-1 flex flex-col items-center justify-center border-r border-b border-gray-100">
              <span className="text-[12px] font-extrabold text-gray-400">9h00 -</span>
              <span className="text-[12px] font-extrabold text-gray-400">12h00</span>
            </div>
            <div className="col-start-1 row-start-2 flex flex-col items-center justify-center border-r border-gray-100">
              <span className="text-[12px] font-extrabold text-gray-400">14h00 -</span>
              <span className="text-[12px] font-extrabold text-gray-400">17h00</span>
            </div>

            {/* Lundi */}
            <div className="col-start-2 row-start-1 p-3 border-r border-b border-gray-100">
              <div className="bg-[#3b82f6] h-full rounded-[14px] p-4 text-white flex flex-col justify-between shadow-sm hover:scale-[1.01] transition-transform cursor-pointer">
                <div className="font-extrabold text-[15px]">Négociation</div>
                <div>
                  <div className="text-[12px] font-extrabold opacity-90">9h00 - 12h00</div>
                  <div className="text-[12px] font-medium opacity-80 mt-0.5">Salle 201</div>
                </div>
              </div>
            </div>
            <div className="col-start-2 row-start-2 p-3 border-r border-gray-100">
              <div className="bg-[#ec4899] h-full rounded-[14px] p-4 text-white flex flex-col justify-between shadow-sm hover:scale-[1.01] transition-transform cursor-pointer">
                <div className="font-extrabold text-[15px]">Marketing</div>
                <div>
                  <div className="text-[12px] font-extrabold opacity-90">14h00 - 17h00</div>
                </div>
              </div>
            </div>

            {/* Mardi */}
            <div className="col-start-3 row-start-1 p-3 border-r border-b border-gray-100">
              <div className="bg-[#b15cf4] h-full rounded-[14px] p-4 text-white flex flex-col justify-between shadow-sm hover:scale-[1.01] transition-transform cursor-pointer">
                <div className="font-extrabold text-[15px]">Anglais</div>
                <div>
                  <div className="text-[12px] font-extrabold opacity-90">9h00 - 11h00</div>
                  <div className="text-[12px] font-medium opacity-80 mt-0.5">Salle 105</div>
                </div>
              </div>
            </div>
            <div className="col-start-3 row-start-2 p-3 border-r border-gray-100">
              <div className="bg-[#6366f1] h-full rounded-[14px] p-4 text-white flex flex-col justify-between shadow-sm hover:scale-[1.01] transition-transform cursor-pointer">
                <div className="font-extrabold text-[15px]">Culture gén.</div>
                <div>
                  <div className="text-[12px] font-extrabold opacity-90">14h00 - 16h00</div>
                </div>
              </div>
            </div>

            {/* Mercredi (ROW SPAN 2) */}
            <div className="col-start-4 row-start-1 row-span-2 p-3 border-r border-gray-100">
              <div className="bg-[#22c55e] h-full rounded-[14px] p-4 text-white flex flex-col justify-between relative overflow-hidden shadow-sm hover:scale-[1.01] transition-transform cursor-pointer">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,1) 10px, rgba(0,0,0,1) 20px)'}}></div>
                <div className="font-extrabold text-[15px] relative z-10">Entreprise</div>
                <div className="text-[12px] font-extrabold opacity-90 relative z-10">Journée complète</div>
              </div>
            </div>

            {/* Jeudi */}
            <div className="col-start-5 row-start-1 p-3 border-r border-b border-gray-100 flex flex-col justify-end pb-8">
              <div className="bg-[#22c55e] rounded-full px-5 py-2.5 text-white inline-flex max-w-max shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="font-extrabold text-[13px]">Entreprise</div>
              </div>
            </div>
            <div className="col-start-5 row-start-2 p-3 border-r border-gray-100 flex flex-col justify-start pt-8">
              <div className="bg-[#f97316] rounded-full px-5 py-2.5 text-white inline-flex max-w-max shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="font-extrabold text-[13px]">Point pédago.</div>
              </div>
            </div>

            {/* Vendredi */}
            <div className="col-start-6 row-start-1 p-3 border-b border-gray-100">
              <div className="bg-[#f97316] h-full rounded-[14px] p-4 text-white flex flex-col justify-between shadow-sm hover:scale-[1.01] transition-transform cursor-pointer">
                <div className="font-extrabold text-[15px]">GRC client</div>
                <div>
                  <div className="text-[12px] font-extrabold opacity-90">9h00 - 12h00</div>
                </div>
              </div>
            </div>
            <div className="col-start-6 row-start-2 p-3">
              <div className="bg-[#14b8a6] h-full rounded-[14px] p-4 text-white flex flex-col justify-between shadow-sm hover:scale-[1.01] transition-transform cursor-pointer">
                <div className="font-extrabold text-[15px]">Projet prof.</div>
                <div>
                  <div className="text-[12px] font-extrabold opacity-90">14h00 - 17h00</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPlanning;
