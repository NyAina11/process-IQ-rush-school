import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  FileText,
  Upload,
  User,
  GraduationCap,
  Bell
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

const StudentDashboard: React.FC = () => {
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

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-[#3ddb93] rounded-[20px] p-6 text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-6 right-6 w-10 h-10 bg-[#59e3a6] rounded-full flex items-center justify-center">
            <CheckCircle2 size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-[40px] font-extrabold leading-none mb-1 tracking-tight">94%</div>
          <div className="text-[15px] font-bold opacity-100">Taux de présence</div>
          <div className="text-[12px] font-semibold opacity-80 mt-1">+2% ce mois</div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-[#7966f2] rounded-[20px] p-6 text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-6 right-6 w-10 h-10 bg-[#8f7ef4] rounded-full flex items-center justify-center">
            <FileText size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-[40px] font-extrabold leading-none mb-1 tracking-tight">14.2</div>
          <div className="text-[15px] font-bold opacity-100">Moyenne générale</div>
          <div className="text-[12px] font-semibold opacity-80 mt-1">+ 0.8 vs S1</div>
        </div>
        
        {/* Card 3 */}
        <div className="bg-[#fdbd58] rounded-[20px] p-6 text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-6 right-6 w-10 h-10 bg-[#fecb77] rounded-full flex items-center justify-center">
            <Clock size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-[40px] font-extrabold leading-none mb-1 tracking-tight">3</div>
          <div className="text-[15px] font-bold opacity-100">Absences ce mois</div>
          <div className="text-[12px] font-semibold opacity-80 mt-1">1 non justifiée</div>
        </div>
        
        {/* Card 4 */}
        <div className="bg-[#ff6981] rounded-[20px] p-6 text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-6 right-6 w-10 h-10 bg-[#ff8296] rounded-full flex items-center justify-center">
            <AlertTriangle size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-[40px] font-extrabold leading-none mb-1 tracking-tight">2</div>
          <div className="text-[15px] font-bold opacity-100">Actions urgentes</div>
          <div className="text-[12px] font-semibold opacity-80 mt-1">À traiter</div>
        </div>
      </div>

      {/* Progression */}
      <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#585bf1] rounded-xl flex items-center justify-center shadow-md shadow-[#585bf1]/30">
              <GraduationCap size={24} className="text-white" />
            </div>
            <h2 className="text-[18px] font-extrabold text-[#1f2937] uppercase tracking-wide">
              PROGRESSION VERS LE DIPLÔME BTS NDRC
            </h2>
          </div>
          <div className="bg-[#e8faee] text-[#2bc574] px-4 py-2 rounded-full text-[13px] font-bold flex items-center gap-2">
            En bonne voie <span className="text-base leading-none">🎯</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#f4f7ff] rounded-[16px] py-6 px-4 text-center">
            <div className="text-[26px] font-extrabold text-[#3b82f6] leading-none mb-2">420h</div>
            <div className="text-[10px] font-bold text-[#3b82f6]/70 uppercase tracking-widest">HEURES ÉCOLE</div>
          </div>
          <div className="bg-[#eefcf4] rounded-[16px] py-6 px-4 text-center">
            <div className="text-[26px] font-extrabold text-[#3ddb93] leading-none mb-2">680h</div>
            <div className="text-[10px] font-bold text-[#3ddb93]/70 uppercase tracking-widest">HEURES ENTREPRISE</div>
          </div>
          <div className="bg-[#fff8ee] rounded-[16px] py-6 px-4 text-center">
            <div className="text-[26px] font-extrabold text-[#fdbd58] leading-none mb-2">18</div>
            <div className="text-[10px] font-bold text-[#fdbd58]/70 uppercase tracking-widest">MOIS RESTANTS</div>
          </div>
          <div className="bg-[#f8f5ff] rounded-[16px] py-6 px-4 text-center">
            <div className="text-[26px] font-extrabold text-[#b25ff4] leading-none mb-2">12/16</div>
            <div className="text-[10px] font-bold text-[#b25ff4]/70 uppercase tracking-widest">COMPÉTENCES</div>
          </div>
          <div className="bg-[#fff1f4] rounded-[16px] py-6 px-4 text-center">
            <div className="text-[26px] font-extrabold text-[#ff6981] leading-none mb-2">3/5</div>
            <div className="text-[10px] font-bold text-[#ff6981]/70 uppercase tracking-widest">ÉPREUVES VALIDÉES</div>
          </div>
        </div>

        <div className="relative h-4 bg-[#f3f4f6] rounded-full overflow-hidden mb-4">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#7966f2] to-[#b25ff4] rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ width: '25%' }}>
            25%
          </div>
        </div>

        <div className="flex justify-between items-center text-[12px] font-bold text-[#9aa3af] px-1 mt-6">
          <div className="flex items-center gap-2">
            <CalendarIcon size={14} className="text-[#9aa3af]" />
            DÉBUT: 01/09/2025
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap size={14} className="text-[#9aa3af]" />
            FIN PRÉVUE: 30/06/2027
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Events */}
        <div className="lg:col-span-2 bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-8">
            <CalendarIcon size={20} className="text-[#3b82f6]" strokeWidth={2.5} />
            <h3 className="text-[18px] font-extrabold text-[#1f2937]">Prochains événements</h3>
          </div>
          
          <div className="space-y-4">
            {/* Event 1 */}
            <div className="bg-[#f4f7ff] rounded-[20px] p-5 flex items-center gap-6">
              <div className="flex flex-col items-center justify-center min-w-[50px] pr-2">
                <span className="text-[28px] font-extrabold text-[#111827] leading-none">27</span>
                <span className="text-[10px] font-extrabold text-[#9ca3af] uppercase mt-1 tracking-widest">JAN</span>
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-[#111827] text-[15px]">Négociation commerciale</div>
                <div className="text-[13px] font-semibold text-[#6b7280] mt-1">9h00 - 12h00 • Salle 201 • M. Martin</div>
              </div>
              <div className="bg-[#3b82f6] text-white px-5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                COURS
              </div>
            </div>

            {/* Event 2 */}
            <div className="bg-[#fffcf4] rounded-[20px] p-5 flex items-center gap-6">
              <div className="flex flex-col items-center justify-center min-w-[50px] pr-2">
                <span className="text-[28px] font-extrabold text-[#111827] leading-none">30</span>
                <span className="text-[10px] font-extrabold text-[#9ca3af] uppercase mt-1 tracking-widest">JAN</span>
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-[#111827] text-[15px]">Point pédagogique</div>
                <div className="text-[13px] font-semibold text-[#6b7280] mt-1">14h00 - 14h30 • Bureau 105 • Mme Dubois</div>
              </div>
              <div className="bg-[#fdbd58] text-white px-5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                RDV
              </div>
            </div>

            {/* Event 3 */}
            <div className="bg-[#fff4f6] rounded-[20px] p-5 flex items-center gap-6">
              <div className="flex flex-col items-center justify-center min-w-[50px] pr-2">
                <span className="text-[28px] font-extrabold text-[#111827] leading-none">05</span>
                <span className="text-[10px] font-extrabold text-[#9ca3af] uppercase mt-1 tracking-widest">FÉV</span>
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-[#111827] text-[15px]">Examen Marketing digital</div>
                <div className="text-[13px] font-semibold text-[#6b7280] mt-1">9h00 - 11h00 • Salle 301 • Coef. 3</div>
              </div>
              <div className="bg-[#ff6981] text-white px-5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                EXAMEN
              </div>
            </div>

            {/* Event 4 */}
            <div className="bg-[#f3fdf8] rounded-[20px] p-5 flex items-center gap-6">
              <div className="flex flex-col items-center justify-center min-w-[50px] pr-2">
                <span className="text-[28px] font-extrabold text-[#111827] leading-none">10</span>
                <span className="text-[10px] font-extrabold text-[#9ca3af] uppercase mt-1 tracking-widest">FÉV</span>
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-[#111827] text-[15px]">Visite tuteur entreprise</div>
                <div className="text-[13px] font-semibold text-[#6b7280] mt-1">10h00 • Carrefour Clichy • Mme Dubois</div>
              </div>
              <div className="bg-[#3ddb93] text-white px-5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                VISITE
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-[#eef2fa] p-2 rounded-xl flex items-center justify-center">
                <CalendarIcon size={20} className="text-[#585bf1]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[18px] font-extrabold text-[#111827]">Janvier 2026</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 mb-6">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <div key={i} className="text-center text-[11px] font-bold text-[#6b7280] uppercase tracking-widest">{d}</div>
            ))}
          </div>
          
          <div className="space-y-2">
            {[
              [ {d:29, out:true}, {d:30, out:true}, {d:31, out:true}, {d:1, out:false}, {d:2, out:false}, {d:3, out:false}, {d:4, out:false} ],
              [ {d:5, out:false, type:'cours'}, {d:6, out:false, type:'cours'}, {d:7, out:false}, {d:8, out:false}, {d:9, out:false}, {d:10, out:false}, {d:11, out:false} ],
              [ {d:12, out:false, type:'cours'}, {d:13, out:false, type:'cours'}, {d:14, out:false}, {d:15, out:false}, {d:16, out:false}, {d:17, out:false}, {d:18, out:false} ],
              [ {d:19, out:false, type:'cours'}, {d:20, out:false, type:'absent'}, {d:21, out:false}, {d:22, out:false}, {d:23, out:false}, {d:24, out:false}, {d:25, out:false} ],
              [ {d:26, out:false, active:true}, {d:27, out:false, type:'cours'}, {d:28, out:false, type:'cours'}, {d:29, out:false}, {d:30, out:false, type:'rdv'}, {d:31, out:false}, {d:1, out:true} ]
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-7 gap-1">
                  {row.map((item, j) => {
                    let bgClass = '';
                    let textClass = 'text-[#4b5563]';
                    if (item.active) {
                      bgClass = 'bg-[#585bf1] shadow-md shadow-[#585bf1]/40';
                      textClass = 'text-white';
                    } else if (item.out) {
                      textClass = 'text-[#d1d5db]';
                    } else if (item.type === 'cours') {
                      bgClass = 'bg-[#e6f0fd]';
                      textClass = 'text-[#3b82f6]';
                    } else if (item.type === 'absent') {
                      bgClass = 'bg-[#ffeceb]';
                      textClass = 'text-[#ef4444]';
                    } else if (item.type === 'rdv') {
                      bgClass = 'bg-[#fef3c7]';
                      textClass = 'text-[#d97706]';
                    }
                    
                    return (
                      <div key={j} className="flex justify-center">
                          <div className={`w-full h-10 flex items-center justify-center rounded-lg text-[14px] font-bold ${bgClass} ${textClass}`}>
                              {item.d}
                          </div>
                      </div>
                    )
                  })}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-[3px] bg-[#3b82f6]"></div>
              <span className="text-[12px] font-bold text-[#4b5563]">Cours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-[3px] bg-[#ef4444]"></div>
              <span className="text-[12px] font-bold text-[#4b5563]">Absent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-[3px] bg-[#f59e0b]"></div>
              <span className="text-[12px] font-bold text-[#4b5563]">RDV</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-[3px] bg-[#585bf1]"></div>
              <span className="text-[12px] font-bold text-[#4b5563]">Aujourd'hui</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Actions and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Actions Urgentes */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ffeceb] rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-[#ef4444]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[18px] font-extrabold text-[#111827]">Actions urgentes</h3>
            </div>
            <div className="bg-[#ef4444] text-white text-[12px] font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-md shadow-red-200">
              2
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Action 1 */}
            <div className="bg-[#fef3c7] border border-[#fde68a] rounded-[20px] p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-[#f59e0b] rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-extrabold text-[#92400e] text-[16px]">Justificatif d'absence manquant</div>
                  <div className="text-[#b45309] text-[13px] font-medium mt-0.5">Absence du 20/01/2026</div>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-1.5 text-[#ef4444]">
                  <Clock size={15} />
                  <span className="text-[13px] font-bold text-[#b45309]">Deadline: 27/01/2026</span>
                </div>
                <button className="bg-[#f59e0b] text-white px-5 py-2.5 rounded-xl font-bold text-[14px] flex items-center gap-2 hover:bg-[#d97706] transition-colors shadow-md shadow-amber-200">
                  <Upload size={16} strokeWidth={2.5} />
                  Envoyer
                </button>
              </div>
            </div>

            {/* Action 2 */}
            <div className="bg-[#dce9fd] border border-[#bfdbfe] rounded-[20px] p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-[#3b82f6] rounded-xl flex items-center justify-center shrink-0">
                  <CheckSquare size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-extrabold text-[#1e3a8a] text-[16px]">Questionnaire de satisfaction</div>
                  <div className="text-[#1e40af] text-[13px] font-medium mt-0.5">Évaluation du semestre 1</div>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-1.5 text-[#1e3a8a]">
                  <Clock size={15} />
                  <span className="text-[13px] font-bold">Durée estimée: 5 min</span>
                </div>
                <button className="bg-[#3b82f6] text-white px-6 py-2.5 rounded-xl font-bold text-[14px] hover:bg-[#2563eb] transition-colors shadow-md shadow-blue-200">
                  Répondre
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Récentes */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#eefcf4] rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-[#22c55e]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[18px] font-extrabold text-[#111827]">Notifications récentes</h3>
            </div>
            <div className="w-2.5 h-2.5 bg-[#22c55e] rounded-full shadow-sm shadow-green-200"></div>
          </div>
          
          <div className="space-y-4 relative">
            {/* Scrollbar fake line on the right */}
            <div className="absolute -right-2 top-0 bottom-0 w-[6px] bg-[#f3f4f6] rounded-full">
               <div className="w-full h-1/3 bg-[#d1d5db] rounded-full mt-4"></div>
            </div>

            {/* Notification 1 */}
            <div className="bg-white border border-[#f3f4f6] shadow-[0_4px_12px_rgba(0,0,0,0.02)] rounded-[16px] p-5 flex items-center gap-4 border-l-[4px] border-l-[#22c55e] mr-4">
              <div className="w-12 h-12 bg-[#eefcf4] rounded-xl flex items-center justify-center shrink-0">
                <FileText size={20} className="text-[#22c55e]" />
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-[#1f2937] text-[15px]">Nouveau document disponible</div>
                <div className="text-[#6b7280] text-[13px] mt-0.5 font-medium">Attestation de scolarité prête à télécharger</div>
                <div className="text-[#9ca3af] text-[11px] mt-1.5 font-bold">Il y a 2 heures</div>
              </div>
            </div>

            {/* Notification 2 */}
            <div className="bg-white border border-[#f3f4f6] shadow-[0_4px_12px_rgba(0,0,0,0.02)] rounded-[16px] p-5 flex items-center gap-4 border-l-[4px] border-l-[#3b82f6] mr-4">
              <div className="w-12 h-12 bg-[#e6f0fd] rounded-xl flex items-center justify-center shrink-0">
                <Edit size={20} className="text-[#3b82f6]" />
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-[#1f2937] text-[15px]">Note ajoutée</div>
                <div className="text-[#6b7280] text-[13px] mt-0.5 font-medium">Marketing digital : <span className="text-[#22c55e] font-extrabold">15/20</span></div>
                <div className="text-[#9ca3af] text-[11px] mt-1.5 font-bold">Hier à 16h30</div>
              </div>
            </div>

            {/* Notification 3 */}
            <div className="bg-white border border-[#f3f4f6] shadow-[0_4px_12px_rgba(0,0,0,0.02)] rounded-[16px] p-5 flex items-center gap-4 border-l-[4px] border-l-[#f59e0b] mr-4">
              <div className="w-12 h-12 bg-[#fff8ee] rounded-xl flex items-center justify-center shrink-0">
                <CalendarIcon size={20} className="text-[#f59e0b]" />
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-[#1f2937] text-[15px]">Rappel RDV</div>
                <div className="text-[#6b7280] text-[13px] mt-0.5 font-medium">Point pédagogique dans 4 jours</div>
                <div className="text-[#9ca3af] text-[11px] mt-1.5 font-bold">Il y a 2 jours</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
