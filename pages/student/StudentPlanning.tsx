import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Download, Building, BookOpen, Plus } from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/api';
import { getAuthUserId } from '../../services/session';

type PlanningType = 'course' | 'company' | 'exam' | 'meeting';

interface PlanningEvent {
  id: string;
  title: string;
  location: string;
  teacher: string;
  type: PlanningType;
  color: string;
  start: Date | null;
  end: Date | null;
  allDay: boolean;
}

interface Day {
  date: Date;
  key: string;
  dayName: string;
  dayNumber: string;
  month: string;
}

const TYPE_GRADIENT: Record<PlanningType, string> = {
  course: 'from-blue-500 to-blue-600',
  company: 'from-green-500 to-green-600',
  exam: 'from-red-500 to-red-600',
  meeting: 'from-yellow-500 to-yellow-600'
};

const TYPE_LABEL: Record<PlanningType, string> = {
  course: 'Course',
  company: 'Company',
  exam: 'Exam',
  meeting: 'Meeting'
};

const asPlanningType = (value: string): PlanningType => {
  if (value === 'course' || value === 'company' || value === 'exam' || value === 'meeting') return value;
  return 'meeting';
};

const startOfWeekMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatTimeRange = (start: Date | null, end: Date | null, allDay: boolean): string => {
  if (!start || !end) return '';
  if (allDay) return 'Full day';
  return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const StudentPlanning: React.FC = () => {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeekMonday(new Date()));
  const [activeFilter, setActiveFilter] = useState<'all' | PlanningType>('all');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [remoteEvents, setRemoteEvents] = useState<PlanningEvent[]>([]);
  const [studentResolved, setStudentResolved] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [meetingTitle, setMeetingTitle] = useState<string>('Student follow-up meeting');
  const [meetingDate, setMeetingDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [meetingTime, setMeetingTime] = useState<string>('14:00');
  const [meetingDuration, setMeetingDuration] = useState<number>(30);
  const [meetingLocation, setMeetingLocation] = useState<string>('Office 105');
  const { execute: fetchEvents, loading } = useApi(api.getEvents, { silentLoading: true });

  const loadEvents = useCallback(async () => {
    try {
      const studentId = await api.getCurrentStudentId();
      setStudentResolved(Boolean(studentId));
      if (!studentId) {
        setRemoteEvents([]);
        return;
      }
      const raw = await fetchEvents(studentId);
      const mapped: PlanningEvent[] = (Array.isArray(raw) ? raw : []).map((e: any, idx: number) => ({
        id: e._id || e.id || `event-${idx}`,
        title: e.title || 'Event',
        location: e.location || '',
        teacher: e.teacher || '',
        type: asPlanningType(String(e.type || 'meeting')),
        color: e.color || '#3B82F6',
        start: e.start ? new Date(e.start) : null,
        end: e.end ? new Date(e.end) : null,
        allDay: Boolean(e.allDay)
      }));
      setRemoteEvents(mapped);
    } catch (err) {
      console.error('Failed to fetch events', err);
      setRemoteEvents([]);
    }
  }, [fetchEvents]);

  useEffect(() => {
    (async () => {
      await loadEvents();
    })();
  }, [loadEvents]);

  const weekDays: Day[] = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return {
        date: d,
        key: d.toISOString(),
        dayName: d.toLocaleDateString('en', { weekday: 'short' }),
        dayNumber: d.toLocaleDateString('en', { day: '2-digit' }),
        month: d.toLocaleDateString('en', { month: 'short' })
      };
    });
  }, [weekStart]);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + 5);
    return d;
  }, [weekStart]);

  const eventsInWeek = useMemo(() => {
    return remoteEvents.filter((e) => {
      if (!e.start) return false;
      return e.start >= weekStart && e.start < weekEnd;
    });
  }, [remoteEvents, weekStart, weekEnd]);

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') return eventsInWeek;
    return eventsInWeek.filter((e) => e.type === activeFilter);
  }, [eventsInWeek, activeFilter]);

  const morningColumns: PlanningEvent[][] = useMemo(() => {
    const cols: PlanningEvent[][] = Array.from({ length: 5 }, () => []);
    filteredEvents.forEach((e) => {
      if (!e.start) return;
      const jsDay = e.start.getDay();
      const idx = jsDay === 0 ? -1 : jsDay - 1;
      if (idx < 0 || idx > 4) return;
      if (e.allDay || e.start.getHours() < 12) cols[idx].push(e);
    });
    cols.forEach((col) => col.sort((a, b) => (a.start?.getTime() || 0) - (b.start?.getTime() || 0)));
    return cols;
  }, [filteredEvents]);

  const afternoonColumns: PlanningEvent[][] = useMemo(() => {
    const cols: PlanningEvent[][] = Array.from({ length: 5 }, () => []);
    filteredEvents.forEach((e) => {
      if (!e.start) return;
      const jsDay = e.start.getDay();
      const idx = jsDay === 0 ? -1 : jsDay - 1;
      if (idx < 0 || idx > 4) return;
      if (!e.allDay && e.start.getHours() >= 12) cols[idx].push(e);
    });
    cols.forEach((col) => col.sort((a, b) => (a.start?.getTime() || 0) - (b.start?.getTime() || 0)));
    return cols;
  }, [filteredEvents]);

  const allVisibleEvents = useMemo(
    () => [...morningColumns.flat(), ...afternoonColumns.flat()],
    [morningColumns, afternoonColumns]
  );

  const selectedEvent = allVisibleEvents.find((e) => e.id === selectedEventId) || null;

  const navigateWeek = (direction: -1 | 1): void => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + direction * 7);
      return next;
    });
  };

  const filters: Array<{ id: 'all' | PlanningType; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'course', label: 'Course' },
    { id: 'company', label: 'Company' },
    { id: 'exam', label: 'Exam' },
    { id: 'meeting', label: 'Meeting' }
  ];

  const formatIcsDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  };

  const exportIcal = (): void => {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ProcessIQ//StudentPlanning//EN'
    ];
    filteredEvents.forEach((event) => {
      if (!event.start || !event.end) return;
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${event.id}@processiq.local`);
      lines.push(`DTSTAMP:${formatIcsDate(new Date())}`);
      lines.push(`DTSTART:${formatIcsDate(event.start)}`);
      lines.push(`DTEND:${formatIcsDate(event.end)}`);
      lines.push(`SUMMARY:${event.title}`);
      lines.push(`LOCATION:${event.location || ''}`);
      lines.push(`DESCRIPTION:${event.teacher || ''}`);
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planning-${weekStart.toISOString().slice(0, 10)}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const createMeeting = async (): Promise<void> => {
    try {
      const studentId = await api.getCurrentStudentId();
      const ownerId = getAuthUserId();
      if (!studentId) {
        alert('No student linked to this session.');
        return;
      }
      if (!ownerId) {
        alert('No authenticated user found. Please sign in again.');
        return;
      }

      const start = new Date(`${meetingDate}T${meetingTime}:00`);
      const end = new Date(start.getTime() + meetingDuration * 60 * 1000);
      await api.createEvent({
        title: meetingTitle,
        start: start.toISOString(),
        end: end.toISOString(),
        allDay: false,
        location: meetingLocation,
        teacher: 'Pedagogy team',
        type: 'meeting',
        color: '#F59E0B',
        description: 'Meeting created from student interface',
        attendees: [{ studentId, status: 'confirmed' }],
        ownerId,
        ownerType: 'student',
        source: 'student'
      });
      setShowCreateModal(false);
      await loadEvents();
    } catch (error: any) {
      alert(error.message || 'Unable to create meeting');
    }
  };

  return (
    <div className="space-y-6">
      <StudentNavbar />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateWeek(-1)}
            className="w-10 h-10 border border-gray-300 bg-white rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>

          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
              Week of {weekDays[0].month} {weekDays[0].dayNumber}, {weekDays[0].date.getFullYear()}
            </h2>
            <div className="flex items-center gap-3 justify-center">
              <span className="text-sm text-gray-600">
                {weekStart.toLocaleDateString('en', { month: 'short', day: '2-digit' })} -{' '}
                {weekDays[4].date.toLocaleDateString('en', { month: 'short', day: '2-digit', year: 'numeric' })}
              </span>
              <span className="text-sm text-gray-400">-</span>
              <span className="text-sm text-gray-600">{loading ? 'Loading...' : `${filteredEvents.length} events`}</span>
            </div>
          </div>

          <button
            onClick={() => navigateWeek(1)}
            className="w-10 h-10 border border-gray-300 bg-white rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setWeekStart(startOfWeekMonday(new Date()))}
            className="px-4 py-2 border border-gray-300 bg-white rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Calendar size={16} />
            Month
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 border border-blue-300 bg-white text-blue-600 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-50 transition-colors"
          >
            <Plus size={16} />
            New meeting
          </button>
          <button onClick={exportIcal} className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors">
            <Download size={16} />
            Export iCal
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeFilter === filter.id ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {!studentResolved && (
        <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          Aucun etudiant associe a cette session. Reconnecte-toi avec un compte etudiant lie.
        </div>
      )}
      {studentResolved && filteredEvents.length === 0 && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          Aucun evenement pour cet etudiant sur cette periode.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
          <div className="p-4 font-semibold text-gray-500 text-center border-r border-gray-200">Hourly</div>
          {weekDays.map((day) => (
            <div key={day.key} className="p-4 text-center border-r border-gray-200 last:border-r-0">
              <div className="font-bold text-gray-900">
                {day.dayName} {day.dayNumber}
              </div>
              <div className="text-sm text-gray-500">{day.month}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-6 min-h-[170px] border-b border-gray-200">
          <div className="p-4 font-semibold text-gray-500 text-center border-r border-gray-200 flex flex-col justify-center">
            <div>09:00</div>
            <div className="text-sm">12:00</div>
          </div>
          {morningColumns.map((dayEvents, dayIndex) => (
            <div key={`m-${dayIndex}`} className="p-2 border-r border-gray-200 last:border-r-0 space-y-2">
              {dayEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`w-full text-left bg-gradient-to-br ${TYPE_GRADIENT[event.type]} text-white p-3 rounded-xl transition-transform hover:scale-[1.01]`}
                >
                  <div className="font-semibold text-sm">{event.title}</div>
                  <div className="text-xs opacity-90">{formatTimeRange(event.start, event.end, event.allDay)}</div>
                  {event.location ? <div className="text-xs opacity-80 mt-1">{event.location}</div> : null}
                  {event.teacher ? <div className="text-xs opacity-80">{event.teacher}</div> : null}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-6 min-h-[170px]">
          <div className="p-4 font-semibold text-gray-500 text-center border-r border-gray-200 flex flex-col justify-center">
            <div>14:00</div>
            <div className="text-sm">17:00</div>
          </div>
          {afternoonColumns.map((dayEvents, dayIndex) => (
            <div key={`a-${dayIndex}`} className="p-2 border-r border-gray-200 last:border-r-0 space-y-2">
              {dayEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`w-full text-left bg-gradient-to-br ${TYPE_GRADIENT[event.type]} text-white p-3 rounded-xl transition-transform hover:scale-[1.01]`}
                >
                  <div className="font-semibold text-sm">{event.title}</div>
                  <div className="text-xs opacity-90">{formatTimeRange(event.start, event.end, event.allDay)}</div>
                  {event.location ? <div className="text-xs opacity-80 mt-1">{event.location}</div> : null}
                  {event.teacher ? <div className="text-xs opacity-80">{event.teacher}</div> : null}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-6 mt-6">
        {(['course', 'company', 'exam', 'meeting'] as PlanningType[]).map((type) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded bg-gradient-to-r ${TYPE_GRADIENT[type]}`}></div>
            <span className="text-sm text-gray-600">{TYPE_LABEL[type]}</span>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
              <button onClick={() => setSelectedEventId(null)} className="text-gray-400 hover:text-gray-600">
                X
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Type:</strong> {TYPE_LABEL[selectedEvent.type]}
              </p>
              <p>
                <strong>Time:</strong> {formatTimeRange(selectedEvent.start, selectedEvent.end, selectedEvent.allDay)}
              </p>
              <p>
                <strong>Location:</strong> {selectedEvent.location || '-'}
              </p>
              <p>
                <strong>Teacher:</strong> {selectedEvent.teacher || '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create meeting</h3>
            <div className="space-y-3">
              <input value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Meeting title" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                <input type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <input type="number" min={15} step={15} value={meetingDuration} onChange={(e) => setMeetingDuration(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Duration (min)" />
              <input value={meetingLocation} onChange={(e) => setMeetingLocation(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Location" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={createMeeting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Create</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={18} className="text-blue-600" />
            <h4 className="font-semibold text-blue-800">Course Summary</h4>
          </div>
          <p className="text-sm text-blue-700">
            This week: <strong>{eventsInWeek.filter((e) => e.type === 'course').length}</strong> classes,{' '}
            <strong>{eventsInWeek.filter((e) => e.type === 'company').length}</strong> company slots
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building size={18} className="text-green-600" />
            <h4 className="font-semibold text-green-800">Company Information</h4>
          </div>
          <p className="text-sm text-green-700">
            Company events this week: <strong>{eventsInWeek.filter((e) => e.type === 'company').length}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentPlanning;
