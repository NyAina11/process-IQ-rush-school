import React from 'react';
import {
  Download,
  Calculator,
  User,
  GraduationCap,
  LineChart,
  BarChart,
  ChevronDown
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

const StudentNotes: React.FC = () => {
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

      {/* KPI Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-8">
          <div className="bg-[#5b52f1] rounded-[24px] px-8 py-6 flex flex-col items-center justify-center text-white shadow-lg w-36 h-36">
            <span className="text-[42px] font-extrabold leading-none tracking-tight">14.2</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest mt-2 opacity-90 text-center">Moyenne<br/>générale</span>
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-[24px] font-extrabold text-[#111827]">Mes résultats</h2>
            <div className="text-[13px] text-gray-400 font-extrabold uppercase tracking-widest mt-1 mb-4">SEMESTRE 1 - 2025/2026</div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#dcfce7] text-[#16a34a] rounded-lg text-[12px] font-extrabold shadow-sm">+0.8 VS S1</span>
              <span className="px-3 py-1 bg-[#f3f4f6] text-[#6b7280] rounded-lg text-[12px] font-extrabold shadow-sm">RANG: 5/28</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-[14px] text-[14px] font-extrabold text-[#111827] bg-white hover:bg-gray-50 transition-colors shadow-sm">
            <Calculator size={18} /> Simuler ma moyenne
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white rounded-[14px] text-[14px] font-extrabold shadow-md shadow-blue-200 hover:bg-blue-600 transition-colors">
            <Download size={18} /> Télécharger le bulletin
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-[24px] p-6 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-center items-center h-32 hover:scale-[1.02] transition-transform">
          <div className="text-[28px] font-extrabold text-[#22c55e] leading-none mb-2">16.5</div>
          <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Meilleure note</div>
          <div className="text-[10px] font-extrabold text-gray-300 uppercase tracking-widest mt-1">Marketing digital</div>
        </div>
        <div className="bg-white rounded-[24px] p-6 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-center items-center h-32 hover:scale-[1.02] transition-transform">
          <div className="text-[28px] font-extrabold text-[#f97316] leading-none mb-2">11.0</div>
          <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Note la plus basse</div>
          <div className="text-[10px] font-extrabold text-gray-300 uppercase tracking-widest mt-1">Anglais</div>
        </div>
        <div className="bg-white rounded-[24px] p-6 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-center items-center h-32 hover:scale-[1.02] transition-transform">
          <div className="text-[28px] font-extrabold text-[#3b82f6] leading-none mb-2">13.8</div>
          <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Moyenne classe</div>
          <div className="text-[10px] font-extrabold text-gray-300 uppercase tracking-widest mt-1">+0.4 vs vous</div>
        </div>
        <div className="bg-white rounded-[24px] p-6 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-center items-center h-32 hover:scale-[1.02] transition-transform">
          <div className="text-[28px] font-extrabold text-[#ec4899] leading-none mb-2">8</div>
          <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Évaluations</div>
          <div className="text-[10px] font-extrabold text-gray-300 uppercase tracking-widest mt-1">Ce semestre</div>
        </div>
      </div>

      {/* Middle Section: Chart & Skills */}
      <div className="grid grid-cols-[2fr_1fr] gap-6 mb-8">
        
        {/* Evolution Chart */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#eff6ff] text-[#3b82f6] p-2 rounded-lg">
              <LineChart size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-[18px] font-extrabold text-[#111827]">Évolution de vos résultats</h3>
          </div>
          
          <div className="flex-1 relative min-h-[160px] mb-8 mx-2">
            {/* SVG for the line only */}
            <svg className="w-full h-full absolute inset-0 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              {/* Horizontal dashed reference line */}
              <line x1="0" y1="75" x2="100" y2="75" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4,4" vectorEffect="non-scaling-stroke" />
              
              {/* The Blue Line */}
              <path 
                d="M 0 80 L 25 70 L 50 75 L 75 50 L 100 30" 
                stroke="#3b82f6" 
                strokeWidth="2.5" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke" 
              />
            </svg>

            {/* HTML/CSS for the dots (guaranteed to be circles) */}
            <div className="absolute inset-0">
              {[
                { left: '0%', top: '80%' },
                { left: '25%', top: '70%' },
                { left: '50%', top: '75%' },
                { left: '75%', top: '50%' },
                { left: '100%', top: '30%' }
              ].map((pt, i) => (
                <div 
                  key={i}
                  className="absolute w-3 h-3 bg-white border-[2.5px] border-[#3b82f6] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm z-10"
                  style={{ left: pt.left, top: pt.top }}
                />
              ))}
            </div>
            
            {/* Month Labels aligned to points */}
            <div className="absolute -bottom-8 left-0 right-0 h-6">
              {['SEPT', 'OCT', 'NOV', 'DÉC', 'JAN'].map((label, i) => (
                <div 
                  key={i} 
                  className="absolute -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${i * 25}%` }}
                >
                  <span className={`text-[11px] font-extrabold uppercase tracking-widest ${i === 4 ? 'text-[#3b82f6]' : 'text-gray-400'}`}>
                    {label}
                  </span>
                  {i === 4 && <div className="w-8 h-0.5 bg-[#3b82f6] mt-1 rounded-full"></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-12 pt-4">
            <span className="text-[13px] font-bold text-gray-500">Moyenne classe: 13.8</span>
            <span className="text-[13px] font-extrabold text-[#22c55e] flex items-center gap-1">
              TENDANCE: <span className="uppercase ml-1">Progression</span>
            </span>
          </div>
        </div>


        {/* Skills Bars */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#f3f4f6] text-[#4f46e5] p-2 rounded-lg flex items-center justify-center">
              {/* Colorful icon replacement */}
              <div className="w-5 h-5 flex items-end justify-center gap-0.5">
                <div className="w-1.5 h-2 bg-[#ec4899] rounded-sm"></div>
                <div className="w-1.5 h-3.5 bg-[#3b82f6] rounded-sm"></div>
                <div className="w-1.5 h-5 bg-[#22c55e] rounded-sm"></div>
              </div>
            </div>
            <h3 className="text-[18px] font-extrabold text-[#111827]">Compétences</h3>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#111827]">Négociation</span>
                <span className="text-[13px] font-extrabold text-[#22c55e]">15/20</span>
              </div>
              <div className="h-2 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                <div className="h-full bg-[#22c55e] rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#111827]">Marketing</span>
                <span className="text-[13px] font-extrabold text-[#22c55e]">16.5/20</span>
              </div>
              <div className="h-2 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                <div className="h-full bg-[#22c55e] rounded-full" style={{ width: '82.5%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#111827]">Relation client</span>
                <span className="text-[13px] font-extrabold text-[#3b82f6]">14/20</span>
              </div>
              <div className="h-2 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#111827]">Communication</span>
                <span className="text-[13px] font-extrabold text-[#3b82f6]">13.5/20</span>
              </div>
              <div className="h-2 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: '67.5%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#111827]">Anglais</span>
                <span className="text-[13px] font-extrabold text-[#f97316]">11/20</span>
              </div>
              <div className="h-2 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                <div className="h-full bg-[#f97316] rounded-full" style={{ width: '55%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table */}
      <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="text-[20px]">📝</div>
            <h3 className="text-[18px] font-extrabold text-[#111827]">Détail des évaluations</h3>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-[13px] font-extrabold text-[#111827] hover:bg-gray-50 transition-colors">
            Toutes les matières <ChevronDown size={14} />
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="pb-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 w-1/4">Matière</th>
              <th className="pb-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Type</th>
              <th className="pb-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Note</th>
              <th className="pb-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Coef.</th>
              <th className="pb-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Moy. Classe</th>
              <th className="pb-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Date</th>
              <th className="pb-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 w-1/3">Appréciation</th>
            </tr>
          </thead>
          <tbody>
            
            {/* Row 1 */}
            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
              <td className="py-5 text-[14px] font-extrabold text-[#111827]">Marketing digital</td>
              <td className="py-5">
                <span className="bg-[#fce7f3] text-[#ec4899] px-3 py-1 rounded-full text-[10px] font-extrabold">EXAMEN</span>
              </td>
              <td className="py-5 text-[16px] font-extrabold text-[#22c55e]">16.5</td>
              <td className="py-5 text-[14px] font-extrabold text-gray-500">3</td>
              <td className="py-5 text-[14px] font-bold text-gray-500">14.2</td>
              <td className="py-5 text-[13px] font-bold text-gray-500">15/01/2026</td>
              <td className="py-5 text-[13px] italic text-gray-500">Excellent travail, très bonne maîtrise</td>
            </tr>

            {/* Row 2 */}
            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
              <td className="py-5 text-[14px] font-extrabold text-[#111827]">Négociation commerciale</td>
              <td className="py-5">
                <span className="bg-[#eff6ff] text-[#3b82f6] px-3 py-1 rounded-full text-[10px] font-extrabold">ORAL</span>
              </td>
              <td className="py-5 text-[16px] font-extrabold text-[#22c55e]">15</td>
              <td className="py-5 text-[14px] font-extrabold text-gray-500">4</td>
              <td className="py-5 text-[14px] font-bold text-gray-500">13.5</td>
              <td className="py-5 text-[13px] font-bold text-gray-500">10/01/2026</td>
              <td className="py-5 text-[13px] italic text-gray-500">Bonne argumentation</td>
            </tr>

            {/* Row 3 */}
            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
              <td className="py-5 text-[14px] font-extrabold text-[#111827]">Relation client</td>
              <td className="py-5">
                <span className="bg-[#dcfce7] text-[#16a34a] px-3 py-1 rounded-full text-[10px] font-extrabold">CC</span>
              </td>
              <td className="py-5 text-[16px] font-extrabold text-[#111827]">14</td>
              <td className="py-5 text-[14px] font-extrabold text-gray-500">2</td>
              <td className="py-5 text-[14px] font-bold text-gray-500">14.8</td>
              <td className="py-5 text-[13px] font-bold text-gray-500">08/01/2026</td>
              <td className="py-5 text-[13px] italic text-gray-500">Bon niveau, continuez</td>
            </tr>

            {/* Row 4 */}
            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
              <td className="py-5 text-[14px] font-extrabold text-[#111827]">Culture générale</td>
              <td className="py-5">
                <span className="bg-[#fef9c3] text-[#ca8a04] px-3 py-1 rounded-full text-[10px] font-extrabold">ÉCRIT</span>
              </td>
              <td className="py-5 text-[16px] font-extrabold text-[#111827]">13.5</td>
              <td className="py-5 text-[14px] font-extrabold text-gray-500">2</td>
              <td className="py-5 text-[14px] font-bold text-gray-500">12.9</td>
              <td className="py-5 text-[13px] font-bold text-gray-500">18/12/2025</td>
              <td className="py-5 text-[13px] italic text-gray-500">Analyse pertinente</td>
            </tr>

            {/* Row 5 */}
            <tr className="hover:bg-gray-50/50 transition-colors group">
              <td className="py-5 text-[14px] font-extrabold text-[#111827]">Anglais professionnel</td>
              <td className="py-5">
                <span className="bg-[#fce7f3] text-[#ec4899] px-3 py-1 rounded-full text-[10px] font-extrabold">EXAMEN</span>
              </td>
              <td className="py-5 text-[16px] font-extrabold text-[#22c55e]">11</td>
              <td className="py-5 text-[14px] font-extrabold text-gray-500">2</td>
              <td className="py-5 text-[14px] font-bold text-gray-500">12.3</td>
              <td className="py-5 text-[13px] font-bold text-gray-500">12/12/2025</td>
              <td className="py-5 text-[13px] italic text-gray-500">À améliorer, travaillez l'oral</td>
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
};

export default StudentNotes;






