import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Download,
  Edit,
  FileText,
  TrendingUp,
  Upload
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';
import { api } from '../../services/api';

type EventType = 'course' | 'company' | 'exam' | 'meeting';

const formationLabel = (value?: string): string => {
  const map: Record<string, string> = {
    bts_mco: 'BTS MCO',
    bts_ndrc: 'BTS NDRC',
    bachelor_rdc: 'BACHELOR RDC',
    tp_ntc: 'TP NTC'
  };
  return map[value || ''] || '';
};

const hoursBetween = (start?: Date, end?: Date, allDay?: boolean): number => {
  if (allDay) return 7;
  if (!start || !end) return 0;
  return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
};

const StudentDashboard: React.FC = () => {
  const [student, setStudent] = useState<any | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const currentStudent = await api.getCurrentStudent();
        setStudent(currentStudent);

        const studentId = currentStudent?._id || currentStudent?.id;
        const [companiesData, a, ap, e, d, q] = await Promise.all([
          api.getAllCompanies(),
          api.getAttendances(studentId ? String(studentId) : undefined),
          api.getAppointments(studentId ? String(studentId) : undefined),
          api.getEvents(studentId ? String(studentId) : undefined),
          api.getDocuments(studentId ? String(studentId) : undefined),
          api.getQuestionnaires(studentId ? String(studentId) : undefined)
        ]);

        setCompanies(Array.isArray(companiesData) ? companiesData : []);
        setAttendances(Array.isArray(a) ? a : []);
        setAppointments(Array.isArray(ap) ? ap : []);
        setEvents(Array.isArray(e) ? e : []);
        setDocuments(Array.isArray(d) ? d : []);
        setQuestionnaires(Array.isArray(q) ? q : []);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    })();
  }, []);

  const fullName = useMemo(() => {
    if (!student) return 'No student loaded';
    const first = student.firstName || student.prenom || '';
    const last = student.lastName || student.nom || student.nom_usage || student.nom_naissance || '';
    const formation = formationLabel(student.formation);
    return `${`${first} ${last}`.trim()}${formation ? ` - ${formation}` : ''}`;
  }, [student]);

  const attendanceStats = useMemo(() => {
    const present = attendances.filter((x) => x.type === 'present').length;
    const absences = attendances.filter((x) => x.type === 'absence').length;
    const delays = attendances.filter((x) => x.type === 'delay').length;
    const pending = attendances.filter((x) => x.status === 'pending').length;
    const total = present + absences + delays;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const absencesThisMonth = attendances.filter((x) => {
      if (x.type !== 'absence' || !x.date) return false;
      const d = new Date(x.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    return { present, absences, delays, pending, rate, absencesThisMonth };
  }, [attendances]);

  const questionnaireStats = useMemo(() => {
    const completed = questionnaires.filter((q) => q.statut === 'completed').length;
    const pending = questionnaires.filter((q) => q.statut === 'pending' || q.statut === 'in_progress').length;
    const percentages = questionnaires
      .map((q) => (typeof q.percentage === 'number' ? q.percentage : null))
      .filter((n): n is number => n !== null);
    const avg = percentages.length > 0 ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length) : 0;
    return { completed, pending, avg };
  }, [questionnaires]);

  const progressData = useMemo(() => {
    const schoolHours = Math.round(
      events
        .filter((e) => e.type === 'course')
        .reduce((sum, e) => sum + hoursBetween(e.start ? new Date(e.start) : undefined, e.end ? new Date(e.end) : undefined, e.allDay), 0)
    );
    const companyHours = Math.round(
      events
        .filter((e) => e.type === 'company')
        .reduce((sum, e) => sum + hoursBetween(e.start ? new Date(e.start) : undefined, e.end ? new Date(e.end) : undefined, e.allDay), 0)
    );
    const now = new Date();
    const endDate = new Date('2027-06-30T00:00:00.000Z');
    const monthsRemaining = Math.max(0, Math.round((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const skillsDone = Array.isArray(student?.skills) ? student.skills.length : 0;
    return {
      schoolHours,
      companyHours,
      monthsRemaining,
      skillsDone,
      testsDone: questionnaireStats.completed,
      testsTotal: questionnaires.length
    };
  }, [events, questionnaires.length, questionnaireStats.completed, student?.skills]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const mappedEvents = events.map((e) => ({
      date: e.start ? new Date(e.start) : null,
      title: e.title || 'Event',
      details: `${e.location || ''}${e.teacher ? ` - ${e.teacher}` : ''}`.trim(),
      type: (e.type || 'meeting') as EventType
    }));
    const mappedAppointments = appointments
      .filter((a) => a.status === 'upcoming')
      .map((a) => ({
        date: a.dateStart ? new Date(a.dateStart) : null,
        title: a.reason || 'Appointment',
        details: a.notes || 'Student appointment',
        type: 'meeting' as EventType
      }));

    return [...mappedEvents, ...mappedAppointments]
      .filter((x) => x.date && x.date.getTime() >= now.getTime())
      .sort((a, b) => (a.date!.getTime() - b.date!.getTime()))
      .slice(0, 4);
  }, [appointments, events]);

  const urgentActions = useMemo(() => {
    const actions: Array<{ title: string; subtitle: string; hint: string; kind: 'upload' | 'answer' }> = [];
    const pendingAbsence = attendances.find((a) => a.type === 'absence' && a.status === 'pending');
    if (pendingAbsence) {
      actions.push({
        title: 'Missing proof of absence',
        subtitle: pendingAbsence.course || 'Absence',
        hint: pendingAbsence.date ? `Date: ${new Date(pendingAbsence.date).toLocaleDateString('fr-FR')}` : 'Pending',
        kind: 'upload'
      });
    }
    const pendingDoc = documents.find((d) => d.status === 'pending' || d.status === 'to_sign');
    if (pendingDoc) {
      actions.push({
        title: 'Document action required',
        subtitle: pendingDoc.title || 'Document',
        hint: `Status: ${pendingDoc.status}`,
        kind: 'upload'
      });
    }
    if (questionnaireStats.pending > 0) {
      actions.push({
        title: 'Questionnaire pending',
        subtitle: `${questionnaireStats.pending} questionnaire(s) to complete`,
        hint: 'Estimated duration: 5-20 min',
        kind: 'answer'
      });
    }
    return actions.slice(0, 3);
  }, [attendances, documents, questionnaireStats.pending]);

  const notifications = useMemo(() => {
    const items: Array<{ title: string; subtitle: string; time: string; icon: 'download' | 'edit' | 'calendar' | 'award' }> = [];
    const doc = documents[0];
    if (doc) {
      items.push({
        title: 'New document available',
        subtitle: doc.title || 'Document',
        time: doc.createdAt ? new Date(doc.createdAt).toLocaleString('fr-FR') : 'Recent',
        icon: 'download'
      });
    }
    const att = attendances[0];
    if (att) {
      items.push({
        title: 'Attendance updated',
        subtitle: `${att.type} - ${att.course || 'course'}`,
        time: att.updatedAt ? new Date(att.updatedAt).toLocaleString('fr-FR') : 'Recent',
        icon: 'edit'
      });
    }
    const appt = appointments.find((a) => a.status === 'upcoming');
    if (appt) {
      items.push({
        title: 'Appointment reminder',
        subtitle: appt.reason || 'Upcoming appointment',
        time: appt.dateStart ? new Date(appt.dateStart).toLocaleString('fr-FR') : 'Upcoming',
        icon: 'calendar'
      });
    }
    if (questionnaireStats.completed > 0) {
      items.push({
        title: 'Questionnaire completed',
        subtitle: `${questionnaireStats.completed} completed`,
        time: 'Recent',
        icon: 'award'
      });
    }
    return items.slice(0, 4);
  }, [appointments, attendances, documents, questionnaireStats.completed]);

  const kpis = [
    {
      value: `${attendanceStats.rate}%`,
      label: 'Attendance rate',
      trend: `${attendanceStats.present} present / ${attendances.length} records`,
      icon: <Check size={24} />,
      gradient: 'from-green-100 to-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-l-green-500'
    },
    {
      value: questionnaireStats.avg > 0 ? `${questionnaireStats.avg}%` : '-',
      label: 'Questionnaire average',
      trend: `${questionnaireStats.completed} completed`,
      icon: <TrendingUp size={24} />,
      gradient: 'from-blue-100 to-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-l-blue-500'
    },
    {
      value: `${attendanceStats.absencesThisMonth}`,
      label: 'Absences this month',
      trend: `${attendanceStats.pending} pending justifications`,
      icon: <AlertCircle size={24} />,
      gradient: 'from-yellow-100 to-yellow-50',
      textColor: 'text-yellow-600',
      borderColor: 'border-l-yellow-500'
    },
    {
      value: `${urgentActions.length}`,
      label: 'Urgent actions',
      trend: 'To be processed',
      icon: <Bell size={24} />,
      gradient: 'from-red-100 to-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-l-red-500'
    }
  ];

  const typeBadge = (type: EventType): { text: string; badgeColor: string; textColor: string; bg: string; border: string } => {
    if (type === 'company') return { text: 'Company', badgeColor: 'bg-green-500', textColor: 'text-green-600', bg: 'bg-green-50', border: 'border-l-green-500' };
    if (type === 'exam') return { text: 'Exam', badgeColor: 'bg-red-500', textColor: 'text-red-600', bg: 'bg-red-50', border: 'border-l-red-500' };
    if (type === 'meeting') return { text: 'Meeting', badgeColor: 'bg-yellow-500', textColor: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-l-yellow-500' };
    return { text: 'Course', badgeColor: 'bg-blue-500', textColor: 'text-blue-600', bg: 'bg-blue-50', border: 'border-l-blue-500' };
  };

  return (
    <div className="p-6 space-y-6">
      <StudentNavbar />

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">{fullName}</div>
        <div className="text-sm text-gray-400">-</div>
       
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className={`bg-white rounded-2xl border border-gray-200 p-5 bg-gradient-to-br ${kpi.gradient} ${kpi.borderColor} border-l-4`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${kpi.textColor} bg-opacity-20`}>{kpi.icon}</div>
              <div className="flex-1">
                <div className={`text-2xl font-bold ${kpi.textColor}`}>{kpi.value}</div>
                <div className="text-sm text-gray-600">{kpi.label}</div>
              </div>
            </div>
            <div className={`text-xs ${kpi.textColor} font-medium mt-2`}>{kpi.trend}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold">Progress overview</h3>
          </div>
          <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-full text-sm font-semibold">
            Live data
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{progressData.schoolHours}h</div>
            <div className="text-xs text-gray-600 mt-1">School hours</div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{progressData.companyHours}h</div>
            <div className="text-xs text-gray-600 mt-1">Company hours</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{progressData.monthsRemaining}</div>
            <div className="text-xs text-gray-600 mt-1">Months remaining</div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{progressData.skillsDone}</div>
            <div className="text-xs text-gray-600 mt-1">Skills listed</div>
          </div>
          <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">
              {progressData.testsDone}/{progressData.testsTotal}
            </div>
            <div className="text-xs text-gray-600 mt-1">Tests completed</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar size={18} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold">Upcoming events</h3>
          </div>

          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-sm text-gray-600">No upcoming events.</div>
            ) : (
              upcomingEvents.map((event, index) => {
                const badge = typeBadge(event.type);
                return (
                  <div key={index} className={`${badge.bg} ${badge.border} border-l-4 rounded-xl p-4 flex items-center gap-4`}>
                    <div className="min-w-[50px] text-center">
                      <div className={`text-xl font-bold ${badge.textColor}`}>{event.date ? String(event.date.getDate()).padStart(2, '0') : '--'}</div>
                      <div className={`text-xs ${badge.textColor} uppercase`}>{event.date ? event.date.toLocaleString('en', { month: 'short' }) : ''}</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{event.title}</div>
                      <div className="text-sm text-gray-600">{event.details || 'No detail'}</div>
                    </div>
                    <span className={`${badge.badgeColor} text-white px-3 py-1 rounded-full text-xs font-semibold`}>{badge.text}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertCircle size={18} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold">Urgent actions</h3>
            </div>
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">{urgentActions.length}</span>
          </div>

          <div className="space-y-4">
            {urgentActions.length === 0 ? (
              <div className="text-sm text-gray-600">No urgent actions.</div>
            ) : (
              urgentActions.map((action, index) => (
                <div key={index} className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-300 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 bg-yellow-500 rounded-xl flex items-center justify-center">
                      {action.kind === 'upload' ? <Upload size={18} className="text-white" /> : <CheckCircle size={18} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-yellow-700">{action.title}</div>
                      <div className="text-sm text-yellow-700">{action.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-yellow-700">{action.hint}</span>
                    <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
                      {action.kind === 'upload' ? 'Send' : 'Answer'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <Bell size={18} className="text-green-500" />
          </div>
          <h3 className="text-lg font-semibold">Recent notifications</h3>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-sm text-gray-600">No notifications yet.</div>
          ) : (
            notifications.map((notification, index) => (
              <div key={index} className="bg-gray-50 border-l-4 border-l-blue-500 rounded-xl p-3 flex items-start gap-3">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
                  {notification.icon === 'download' ? <Download size={16} /> : null}
                  {notification.icon === 'edit' ? <Edit size={16} /> : null}
                  {notification.icon === 'calendar' ? <Calendar size={16} /> : null}
                  {notification.icon === 'award' ? <Award size={16} /> : null}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{notification.title}</div>
                  <div className="text-xs text-gray-600">{notification.subtitle}</div>
                  <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-7 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-3">
              <Briefcase size={22} />
              Apprenticeship overview
            </h3>
            <p className="opacity-90 mb-6 text-lg">Dashboard synchronized with student pages data.</p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white bg-opacity-15 px-5 py-3 rounded-xl">
                <div className="text-sm opacity-80 mb-1">Attendance</div>
                <div className="text-lg font-bold">{attendanceStats.rate}%</div>
              </div>
              <div className="bg-white bg-opacity-15 px-5 py-3 rounded-xl">
                <div className="text-sm opacity-80 mb-1">Questionnaires</div>
                <div className="text-lg font-bold">{questionnaireStats.completed} completed</div>
              </div>
              <div className="bg-white bg-opacity-15 px-5 py-3 rounded-xl">
                <div className="text-sm opacity-80 mb-1">Appointments</div>
                <div className="text-lg font-bold">{appointments.filter((a) => a.status === 'upcoming').length} upcoming</div>
              </div>
            </div>
          </div>

          <div className="flex gap-5">
            <div className="bg-white bg-opacity-10 p-5 rounded-2xl text-center min-w-[120px]">
              <div className="text-4xl mb-2">{attendanceStats.rate >= 90 ? 'A+' : 'B'}</div>
              <div className="text-sm font-semibold">Attendance</div>
              <div className="text-xs opacity-80 mt-1">{attendanceStats.present} present</div>
            </div>
            <div className="bg-white bg-opacity-10 p-5 rounded-2xl text-center min-w-[120px]">
              <div className="text-4xl mb-2">{questionnaireStats.avg > 0 ? `${questionnaireStats.avg}%` : '-'}</div>
              <div className="text-sm font-semibold">Average</div>
              <div className="text-xs opacity-80 mt-1">Questionnaires</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
