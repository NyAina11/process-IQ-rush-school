import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Clock,
  Eye,
  PlayCircle,
  TrendingUp
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';
import { api } from '../../services/api';

type QuestionnaireStatus = 'completed' | 'pending' | 'future';
type QuestionnaireCategory = 'academic' | 'skills' | 'satisfaction';

interface QuestionnaireItem {
  id: string;
  title: string;
  description: string;
  status: QuestionnaireStatus;
  backendStatus: 'pending' | 'in_progress' | 'completed' | 'expired';
  category: QuestionnaireCategory;
  completionDate?: string;
  deadline?: string;
  duration: string;
  questionCount: number;
  score?: number;
}

const formationLabel = (value?: string): string => {
  const labels: Record<string, string> = {
    bts_mco: 'BTS MCO',
    bts_ndrc: 'BTS NDRC',
    bachelor_rdc: 'Bachelor RDC',
    tp_ntc: 'TP NTC'
  };
  return labels[value || ''] || (value ? value.toUpperCase() : 'Formation');
};

const mapStatus = (value?: string): QuestionnaireStatus => {
  if (value === 'completed') return 'completed';
  if (value === 'expired') return 'future';
  return 'pending';
};

const statusBadge = (status: QuestionnaireStatus): JSX.Element => {
  if (status === 'completed') {
    return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Completed</span>;
  }
  if (status === 'future') {
    return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">Future</span>;
  }
  return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">Pending</span>;
};

const StudentQuestionnaires: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | QuestionnaireStatus>('all');
  const [showQuestionnaire, setShowQuestionnaire] = useState<string | null>(null);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireItem[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const studentId = await api.getCurrentStudentId();
        const items = await api.getQuestionnaires(studentId);
        const mapped: QuestionnaireItem[] = (Array.isArray(items) ? items : []).map((q: any, idx: number) => {
          const status = mapStatus(String(q.statut || 'pending'));
          const completionDate = q.completedAt ? new Date(q.completedAt).toLocaleDateString('fr-FR') : undefined;
          const deadline = q.statut === 'expired' ? 'Expired' : undefined;
          return {
            id: String(q._id || q.id || `q-${idx}`),
            title: `Questionnaire ${formationLabel(q.formation)}`,
            description: 'Questionnaire de suivi et d evaluation',
            status,
            backendStatus: (q.statut || 'pending') as 'pending' | 'in_progress' | 'completed' | 'expired',
            category: q.formation === 'tp_ntc' ? 'skills' : 'academic',
            completionDate,
            deadline,
            duration: `~${Number(q.duration || 10)} minutes`,
            questionCount: Array.isArray(q.responses) ? q.responses.length : 0,
            score: q.percentage ? Math.round(Number(q.percentage)) : undefined
          };
        });
        setQuestionnaires(mapped);
      } catch (error) {
        console.error('Failed to fetch questionnaires', error);
      }
    })();
  }, []);

  const updateLocalQuestionnaire = (id: string, patch: Partial<QuestionnaireItem>) => {
    setQuestionnaires((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const startQuestionnaire = async (id: string): Promise<void> => {
    try {
      setSavingId(id);
      await api.updateQuestionnaireStatus(id, 'in_progress');
      updateLocalQuestionnaire(id, { status: 'pending', backendStatus: 'in_progress' });
      setShowQuestionnaire(id);
    } catch (error: any) {
      alert(error.message || 'Unable to start questionnaire');
    } finally {
      setSavingId(null);
    }
  };

  const completeQuestionnaire = async (id: string): Promise<void> => {
    const current = questionnaires.find((q) => q.id === id);
    if (!current) return;

    try {
      setSavingId(id);
      const score = current.score ?? 80;
      await api.updateQuestionnaire(id, {
        statut: 'completed',
        completedAt: new Date().toISOString(),
        score: Math.round(score / 5),
        percentage: score,
        responses: [
          { questionId: 'auto-q1', answer: 'Completed from student portal', isCorrect: true }
        ]
      });
      updateLocalQuestionnaire(id, {
        status: 'completed',
        backendStatus: 'completed',
        completionDate: new Date().toLocaleDateString('fr-FR'),
        score
      });
      setShowQuestionnaire(id);
    } catch (error: any) {
      alert(error.message || 'Unable to complete questionnaire');
    } finally {
      setSavingId(null);
    }
  };

  const stats = useMemo(() => {
    const completed = questionnaires.filter((q) => q.status === 'completed').length;
    const pending = questionnaires.filter((q) => q.status === 'pending').length;
    const future = questionnaires.filter((q) => q.status === 'future').length;
    const avgScoreItems = questionnaires.filter((q) => typeof q.score === 'number') as Array<QuestionnaireItem & { score: number }>;
    const avgScore = avgScoreItems.length
      ? Math.round(avgScoreItems.reduce((sum, q) => sum + q.score, 0) / avgScoreItems.length)
      : 0;
    return { completed, pending, future, avgScore };
  }, [questionnaires]);

  const urgentItem = useMemo(
    () => questionnaires.find((q) => q.status === 'pending') || null,
    [questionnaires]
  );

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return questionnaires;
    return questionnaires.filter((q) => q.status === activeFilter);
  }, [questionnaires, activeFilter]);

  const filters: Array<{ id: 'all' | QuestionnaireStatus; label: string; count: number }> = [
    { id: 'all', label: 'All', count: questionnaires.length },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'completed', label: 'Completed', count: stats.completed },
    { id: 'future', label: 'Future', count: stats.future }
  ];

  return (
    <div className="p-6 space-y-6">
      <StudentNavbar />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Questionnaires & Assessments</h2>
          <p className="text-gray-600">Data loaded from MongoDB questionnaires</p>
        </div>

        <div className="flex gap-4">
          <div className="px-5 py-4 bg-green-50 rounded-xl text-center min-w-[120px]">
            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
            <div className="text-sm text-green-600 font-medium">Completed</div>
          </div>
          <div className="px-5 py-4 bg-yellow-50 rounded-xl text-center min-w-[120px]">
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-sm text-yellow-600 font-medium">Pending</div>
          </div>
        </div>
      </div>

      {urgentItem && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center">
                <ClipboardCheck size={28} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-yellow-900 text-lg">{urgentItem.title}</h3>
                  <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold">Urgent</span>
                </div>
                <p className="text-yellow-800 mb-3">{urgentItem.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-yellow-700">
                  <span className="flex items-center gap-2">
                    <Clock size={14} />
                    {urgentItem.duration}
                  </span>
                  <span className="flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {urgentItem.questionCount} responses
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => startQuestionnaire(urgentItem.id)}
              className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold flex items-center gap-3 hover:bg-yellow-600 transition-colors whitespace-nowrap"
            >
              <PlayCircle size={20} />
              {savingId === urgentItem.id ? 'Starting...' : 'Start'}
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
              activeFilter === filter.id
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
            <span className="ml-2 px-2 py-1 bg-white rounded-full text-xs">{filter.count}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-gray-600">No questionnaires found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((questionnaire) => (
            <div key={questionnaire.id} className={`bg-white border rounded-2xl p-6 hover:shadow-md transition-all duration-200 ${questionnaire.status === 'future' ? 'opacity-70' : ''}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  {questionnaire.status === 'completed' ? (
                    <CheckCircle size={24} className="text-green-600" />
                  ) : questionnaire.status === 'future' ? (
                    <Calendar size={24} className="text-gray-600" />
                  ) : (
                    <Clock size={24} className="text-yellow-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className="font-semibold text-lg truncate">{questionnaire.title}</h4>
                    {statusBadge(questionnaire.status)}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{questionnaire.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {questionnaire.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardCheck size={12} />
                      {questionnaire.questionCount} responses
                    </span>
                    {questionnaire.deadline ? (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {questionnaire.deadline}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {typeof questionnaire.score === 'number' && (
                <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Score</span>
                    <span className="font-bold text-green-600">{questionnaire.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full" style={{ width: `${questionnaire.score}%` }} />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {questionnaire.status === 'completed' ? `Completed on ${questionnaire.completionDate}` : questionnaire.status === 'future' ? 'Not available yet' : 'Ready to complete'}
                </div>

                {questionnaire.status === 'completed' ? (
                  <button
                    onClick={() => setShowQuestionnaire(questionnaire.id)}
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Eye size={16} />
                    View
                  </button>
                ) : questionnaire.status === 'future' ? (
                  <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
                    Locked
                  </button>
                ) : (
                  <button
                    onClick={() => startQuestionnaire(questionnaire.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <PlayCircle size={16} />
                    {savingId === questionnaire.id ? 'Starting...' : 'Start'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <TrendingUp size={20} />
            Completion rate
          </h4>
          <p className="text-blue-700 text-sm">
            {questionnaires.length > 0 ? Math.round((stats.completed / questionnaires.length) * 100) : 0}% complete
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <Award size={20} />
            Average score
          </h4>
          <p className="text-green-700 text-sm">{stats.avgScore}% on completed questionnaires</p>
        </div>
      </div>

      {showQuestionnaire && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{questionnaires.find((q) => q.id === showQuestionnaire)?.title}</h3>
              <button onClick={() => setShowQuestionnaire(null)} className="text-gray-400 hover:text-gray-600">
                X
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              {questionnaires.find((q) => q.id === showQuestionnaire)?.description}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowQuestionnaire(null)} className="w-full py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Close
              </button>
              {(() => {
                const current = questionnaires.find((q) => q.id === showQuestionnaire);
                if (!current || current.backendStatus === 'completed' || current.backendStatus === 'expired') return null;
                return (
                  <button
                    onClick={() => completeQuestionnaire(current.id)}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    {savingId === current.id ? 'Saving...' : 'Mark completed'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuestionnaires;
