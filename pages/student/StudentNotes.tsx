import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Download, Calculator, BarChart3, 
  Trophy, Activity, Eye, Filter
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';
import { api } from '../../services/api';

interface Grade {
  subject: string;
  type: string;
  grade: number;
  coefficient: number;
  classAverage: number;
  date: string;
  appreciation: string;
  color: string;
}

interface Skill {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  color: string;
}

const StudentNotes: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showEvolution, setShowEvolution] = useState<boolean>(true);
  const [remoteGrades, setRemoteGrades] = useState<Grade[]>([]);
  const [studentResolved, setStudentResolved] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const studentId = await api.getCurrentStudentId();
        setStudentResolved(Boolean(studentId));
        if (!studentId) {
          setRemoteGrades([]);
          return;
        }
        const grades = await api.getGrades(studentId);
        const mapped: Grade[] = (Array.isArray(grades) ? grades : []).map((g: any) => ({
          subject: g.subject || 'N/A',
          type: g.type || 'exam',
          grade: Number(g.grade ?? 0),
          coefficient: Number(g.coefficient ?? 1),
          classAverage: Number(g.classAverage ?? 0),
          date: g.date ? new Date(g.date).toLocaleDateString('fr-FR') : '',
          appreciation: g.appreciation || '',
          color: Number(g.grade ?? 0) >= 15 ? 'text-green-600' : Number(g.grade ?? 0) >= 12 ? 'text-blue-600' : 'text-yellow-600'
        }));
        setRemoteGrades(mapped);
      } catch (err) {
        console.error('StudentNotes - error fetching grades:', err);
        setRemoteGrades([]);
      }
    })();
  }, []);

  const subjectOptions = useMemo(() => {
    const unique = Array.from(new Set(remoteGrades.map((g) => g.subject).filter(Boolean)));
    return ['all', ...unique];
  }, [remoteGrades]);

  const displayedGrades = useMemo(() => {
    if (selectedSubject === 'all') return remoteGrades;
    return remoteGrades.filter((grade) => grade.subject === selectedSubject);
  }, [remoteGrades, selectedSubject]);
  const weightedTotal = displayedGrades.reduce((acc, g) => acc + (g.grade * g.coefficient), 0);
  const totalCoef = displayedGrades.reduce((acc, g) => acc + g.coefficient, 0);
  const overallAverage = totalCoef > 0 ? weightedTotal / totalCoef : 0;
  const overallAverageLabel = displayedGrades.length > 0 ? overallAverage.toFixed(2) : '-';
  const bestGrade = displayedGrades.length > 0 ? Math.max(...displayedGrades.map((g) => g.grade)) : null;
  const lowestGrade = displayedGrades.length > 0 ? Math.min(...displayedGrades.map((g) => g.grade)) : null;
  const classAverage = displayedGrades.length > 0
    ? displayedGrades.reduce((acc, g) => acc + (Number.isFinite(g.classAverage) ? g.classAverage : 0), 0) / displayedGrades.length
    : 0;

  const quickStats = [
    { value: bestGrade !== null ? bestGrade.toFixed(1) : '-', label: 'Best rating', subLabel: 'From your evaluations', color: 'text-green-600' },
    { value: lowestGrade !== null ? lowestGrade.toFixed(1) : '-', label: 'Lowest rating', subLabel: 'From your evaluations', color: 'text-yellow-600' },
    { value: displayedGrades.length > 0 ? classAverage.toFixed(1) : '-', label: 'Middle class', subLabel: 'Average class', color: 'text-blue-600' },
    { value: `${displayedGrades.length}`, label: 'Evaluations', subLabel: 'Loaded from API', color: 'text-purple-600' }
  ];

  const bySubject: Record<string, { total: number; count: number }> = {};
  displayedGrades.forEach((g) => {
    const key = g.subject || 'N/A';
    if (!bySubject[key]) bySubject[key] = { total: 0, count: 0 };
    bySubject[key].total += g.grade;
    bySubject[key].count += 1;
  });

  const skills: Skill[] = Object.entries(bySubject)
    .map(([name, data]) => {
      const avg = data.count > 0 ? data.total / data.count : 0;
      return {
        name,
        score: Number(avg.toFixed(1)),
        maxScore: 20,
        percentage: Math.max(0, Math.min(100, (avg / 20) * 100)),
        color: avg >= 15 ? 'bg-green-500' : avg >= 12 ? 'bg-blue-500' : 'bg-yellow-500'
      };
    })
    .slice(0, 5);

  // Données de l'évolution des notes
  const monthlyEvolution = (() => {
    const map = new Map<string, { sum: number; count: number; date: Date }>();
    displayedGrades.forEach((g) => {
      const parsed = new Date(g.date.split('/').reverse().join('-'));
      if (Number.isNaN(parsed.getTime())) return;
      const key = "" + parsed.getFullYear() + '-' + String(parsed.getMonth() + 1).padStart(2, '0');
      const current = map.get(key) || { sum: 0, count: 0, date: parsed };
      current.sum += g.grade;
      current.count += 1;
      map.set(key, current);
    });
    const sorted = Array.from(map.values()).sort((a, b) => a.date.getTime() - b.date.getTime()).slice(-5);
    return sorted.map((item, index) => {
      const avg = item.count > 0 ? item.sum / item.count : 0;
      return {
        month: item.date.toLocaleString('en', { month: 'short' }),
        value: Math.round((avg / 20) * 100),
        label: item.date.toLocaleString('en', { month: 'short' }),
        isCurrent: index === sorted.length - 1
      };
    });
  })();

  // Fonction pour simuler la moyenne
  const simulateAverage = () => {
    const weighted = displayedGrades.reduce((acc, g) => acc + (g.grade * g.coefficient), 0);
    const totalCoef = displayedGrades.reduce((acc, g) => acc + g.coefficient, 0);
    const avg = totalCoef > 0 ? (weighted / totalCoef).toFixed(2) : '0.00';
    alert(`Current weighted average: ${avg}/20`);
  };

  // Fonction pour télécharger le bulletin
  const downloadReport = () => {
    const header = 'Subject,Type,Grade,Coefficient,ClassAverage,Date,Appreciation';
    const rows = displayedGrades.map((g) =>
      [
        g.subject,
        g.type,
        g.grade,
        g.coefficient,
        g.classAverage,
        g.date,
        `"${String(g.appreciation || '').replace(/"/g, '""')}"`
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student-newsletter.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <StudentNavbar />
      
      {/* Header avec moyenne et actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-start gap-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-2xl text-center text-white">
            <div className="text-4xl font-bold mb-1">{overallAverageLabel}</div>
            <div className="text-sm opacity-90">Overall average</div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">My results</h2>
            <p className="text-gray-600 mb-4">Semester 1 - 2025/2026</p>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                {displayedGrades.length > 0 ? 'Data loaded' : 'No grades yet'}
              </span>
              <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {displayedGrades.length} evaluation(s)
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={simulateAverage}
            className="px-5 py-3 border border-gray-300 bg-white rounded-xl font-medium flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <Calculator size={18} />
            Simulate my average
          </button>
          <button
            onClick={downloadReport}
            className="px-5 py-3 bg-blue-500 text-white rounded-xl font-medium flex items-center gap-3 hover:bg-blue-600 transition-colors"
          >
            <Download size={18} />
            Download the newsletter
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <div className={`text-3xl font-bold ${stat.color} mb-2`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
            <div className={`text-xs ${stat.color.replace('text-', 'text-').replace('-600', '-500')} font-medium`}>
              {stat.subLabel}
            </div>
          </div>
        ))}
      </div>

      {/* Graphique d'évolution + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Évolution des notes */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BarChart3 size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Evolution of your results</h3>
            </div>
            <button
              onClick={() => setShowEvolution(!showEvolution)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showEvolution ? 'Hide details' : 'Show details'}
            </button>
          </div>

          {showEvolution && (
            <>
              <div className="relative h-48 flex items-end gap-3 pb-8">
                {/* Lignes de référence */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gray-200"></div>
                <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-200"></div>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-green-300 border-dashed"></div>
                <div className="absolute top-3/4 left-0 right-0 h-px bg-gray-200"></div>
                
                {/* Étiquettes des valeurs */}
                <div className="absolute left-0 top-0 text-xs text-gray-500">20</div>
                <div className="absolute left-0 top-1/4 text-xs text-gray-500">15</div>
                <div className="absolute left-0 top-1/2 text-xs text-green-600 font-medium">10</div>
                <div className="absolute left-0 top-3/4 text-xs text-gray-500">5</div>
                <div className="absolute left-0 bottom-8 text-xs text-gray-500">0</div>
                
                {/* Barres */}
                {monthlyEvolution.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className={`w-3/4 max-w-12 rounded-t-lg transition-all duration-500 ${
                        item.isCurrent 
                          ? 'bg-gradient-to-t from-green-500 to-green-400 shadow-lg shadow-green-200' 
                          : 'bg-gradient-to-t from-blue-500 to-blue-400'
                      }`}
                      style={{ height: `${item.value}%` }}
                    ></div>
                    <span className={`text-sm ${item.isCurrent ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 text-sm text-gray-600">
                <span>Average class: {displayedGrades.length > 0 ? classAverage.toFixed(1) : '-'}</span>
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <TrendingUp size={16} />
                  Trend: {displayedGrades.length > 0 ? 'Data-based' : 'No data'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Radar des compétences */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity size={20} className="text-purple-600" />
            📊 Skills
          </h3>
          
          <div className="space-y-5">
            {skills.map((skill, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <span className={`text-sm font-semibold ${
                    skill.score >= 15 ? 'text-green-600' : 
                    skill.score >= 12 ? 'text-blue-600' : 'text-yellow-600'
                  }`}>
                    {skill.score}/{skill.maxScore}
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${skill.color}`}
                    style={{ width: `${skill.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Excellent (≥15)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Good (12-14)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>To improve (12)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau détaillé des notes */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy size={20} className="text-blue-600" />
            📝 Detailed ratings
          </h3>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter size={16} />
              <span>Filter:</span>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All subjects' : subject}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Matter</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Kind</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Note</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Coef.</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Average class</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Appreciation</th>
              </tr>
            </thead>
            <tbody>
              {displayedGrades.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={7}>
                    {studentResolved
                      ? 'Aucune note disponible pour cet etudiant.'
                      : 'Aucun etudiant associe a la session. Reconnecte-toi avec un compte etudiant lie.'}
                  </td>
                </tr>
              )}
              {displayedGrades.map((grade, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4">
                    <span className="font-medium">{grade.subject}</span>
                  </td>
                  <td className="p-4">
                    {(() => {
                      const type = String(grade.type || '').toLowerCase();
                      const badgeClass =
                        type === 'exam' ? 'bg-red-100 text-red-800' :
                        type === 'oral' ? 'bg-blue-100 text-blue-800' :
                        type === 'quiz' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800';
                      return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>{type || 'exam'}</span>;
                    })()}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-xl font-bold ${grade.color}`}>
                      {grade.grade}
                    </span>
                  </td>
                  <td className="p-4 text-center font-semibold">
                    {grade.coefficient}
                  </td>
                  <td className="p-4 text-center text-gray-600">
                    {grade.classAverage}
                  </td>
                  <td className="p-4 text-gray-600">
                    {grade.date}
                  </td>
                  <td className="p-4">
                    <span className={`${
                      grade.grade >= 15 ? 'text-green-600' : 
                      grade.grade >= 12 ? 'text-blue-600' : 'text-yellow-600'
                    }`}>
                      {grade.appreciation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Résumé du tableau */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
            <div className="text-gray-600">
              Showing <span className="font-semibold">{displayedGrades.length}</span> of {displayedGrades.length} evaluations
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-gray-600">Excellent (≥15)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-gray-600">Good (12-14)</span>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
              <Eye size={16} />
              View all details
            </button>
          </div>
        </div>
      </div>

      {/* Section conseils */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <h4 className="font-semibold text-blue-800 mb-3">🎯 Areas for improvement</h4>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>English: Focus on oral comprehension</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>General knowledge: Regular reading</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Keep your strengths in marketing</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <h4 className="font-semibold text-green-800 mb-3">📈 Next objectives</h4>
          <ul className="space-y-2 text-green-700">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Reach 15.0 average in S2</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Improve English by 2 points</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Validate 3 more skills</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentNotes;






