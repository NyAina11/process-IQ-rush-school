import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Plus,
  Search,
  Users,
  XCircle
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';
import { api } from '../../services/api';
import { getAuthUserId } from '../../services/session';

type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';
type AppointmentType = 'orientation' | 'suivi' | 'discipline' | 'family' | 'career' | 'administratif' | 'technique';

interface AppointmentItem {
  id: string;
  advisorId: string;
  title: string;
  description: string;
  type: AppointmentType;
  dateStart: Date;
  dateEnd: Date;
  duration: number;
  person: string;
  location: string;
  status: AppointmentStatus;
  notes?: string;
}

const typeLabel = (type: AppointmentType): string => {
  const labels: Record<AppointmentType, string> = {
    orientation: 'Orientation',
    suivi: 'Pedagogical follow-up',
    discipline: 'Discipline',
    family: 'Family meeting',
    career: 'Career support',
    administratif: 'Administrative',
    technique: 'Technical support'
  };
  return labels[type];
};

const statusStyle = (status: AppointmentStatus): { color: string; bgColor: string; gradient: string } => {
  if (status === 'completed') return { color: 'text-gray-600', bgColor: 'bg-gray-100', gradient: 'from-gray-50 to-gray-100' };
  if (status === 'cancelled') return { color: 'text-red-600', bgColor: 'bg-red-100', gradient: 'from-red-50 to-red-100' };
  return { color: 'text-blue-600', bgColor: 'bg-blue-100', gradient: 'from-blue-50 to-blue-100' };
};

const daysUntilLabel = (start: Date, status: AppointmentStatus): string => {
  if (status === 'completed') return 'Completed';
  if (status === 'cancelled') return 'Cancelled';
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `In ${diffDays} days`;
};

const StudentAppointments: React.FC = () => {
  const defaultAdvisorId = getAuthUserId() || '';
  const [selectedType, setSelectedType] = useState<AppointmentType>('suivi');
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>(defaultAdvisorId);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [reason, setReason] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [selectedNoteAppointment, setSelectedNoteAppointment] = useState<AppointmentItem | null>(null);

  const loadAppointments = async (): Promise<void> => {
    try {
      const studentId = await api.getCurrentStudentId();
      const items = await api.getAppointments(studentId ? String(studentId) : undefined);

      const mapped: AppointmentItem[] = (Array.isArray(items) ? items : [])
        .map((a: any, idx: number) => ({
          id: String(a._id || a.id || `appt-${idx}`),
          advisorId: String(a.advisorId || ''),
          title: typeLabel((a.type || 'suivi') as AppointmentType),
          description: a.reason || 'No reason',
          type: (a.type || 'suivi') as AppointmentType,
          dateStart: a.dateStart ? new Date(a.dateStart) : new Date(),
          dateEnd: a.dateEnd ? new Date(a.dateEnd) : new Date(),
          duration: Number(a.duration || 30),
          person: a.advisorName || 'Advisor',
          location: a.location || 'Campus',
          status: (a.status || 'upcoming') as AppointmentStatus,
          notes: a.notes || undefined
        }))
        .sort((a, b) => a.dateStart.getTime() - b.dateStart.getTime());

      setAppointments(mapped);
      if (!selectedAdvisor && mapped[0]?.advisorId) {
        setSelectedAdvisor(mapped[0].advisorId);
      }
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'upcoming'),
    [appointments]
  );
  const pastAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled').sort((a, b) => b.dateStart.getTime() - a.dateStart.getTime()),
    [appointments]
  );

  const stats = useMemo(() => {
    const avgDuration = appointments.length > 0 ? Math.round(appointments.reduce((sum, a) => sum + a.duration, 0) / appointments.length) : 0;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
    return { avgDuration, completed, cancelled };
  }, [appointments]);

  const appointmentTypes: Array<{ id: AppointmentType; label: string; icon: string; description: string }> = [
    { id: 'suivi', label: 'Pedagogical point', icon: 'BOOK', description: 'Educational follow-up' },
    { id: 'career', label: 'Career support', icon: 'GOAL', description: 'Internship / mission support' },
    { id: 'orientation', label: 'Orientation', icon: 'PATH', description: 'Training orientation' },
    { id: 'administratif', label: 'Administrative', icon: 'FILE', description: 'Documents and admin tasks' }
  ];

  const advisors = useMemo(() => {
    const map = new Map<string, string>();
    if (defaultAdvisorId) map.set(defaultAdvisorId, 'Current advisor');
    appointments.forEach((appointment) => {
      if (appointment.advisorId) {
        map.set(appointment.advisorId, appointment.person || 'Advisor');
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [appointments, defaultAdvisorId]);

  const timeSlots: Array<{ id: number; date: string; time: string; available: boolean }> = [
    { id: 1, date: 'Monday', time: '10:00 - 10:30', available: true },
    { id: 2, date: 'Tuesday', time: '14:00 - 14:30', available: true },
    { id: 3, date: 'Friday', time: '11:00 - 11:30', available: true }
  ];

  const slotStartFromId = (slotId: number): Date => {
    const base = new Date();
    const d = new Date(base);
    d.setDate(base.getDate() + slotId);
    const hour = slotId === 2 ? 14 : slotId === 3 ? 11 : 10;
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const createAppointment = async (customRequest = false): Promise<void> => {
    try {
      const studentId = await api.getCurrentStudentId();
      if (!studentId) {
        alert('No student linked to current session.');
        return;
      }
      const start = selectedSlot ? slotStartFromId(selectedSlot) : slotStartFromId(1);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      const advisorId = selectedAdvisor || getAuthUserId();
      if (!advisorId) {
        alert('No advisor available for this account.');
        return;
      }
      const reasonText = customRequest
        ? `[Custom slot request] ${reason || 'Custom slot requested by student'}`
        : (reason || 'Student appointment request');

      await api.createAppointment({
        studentId,
        advisorId,
        type: selectedType,
        dateStart: start.toISOString(),
        dateEnd: end.toISOString(),
        duration: 30,
        reason: reasonText,
        status: 'upcoming',
        notes: customRequest ? 'Custom slot requested from student interface' : 'Created from student interface'
      });

      alert(customRequest ? 'Custom slot request sent.' : 'Appointment created.');
      setReason('');
      setSelectedSlot(null);
      await loadAppointments();
    } catch (error: any) {
      alert(error.message || 'Unable to create appointment');
    }
  };

  const openAppointmentMeeting = (appointment: AppointmentItem): void => {
    const urlMatch = String(appointment.notes || '').match(/https?:\/\/\S+/i);
    const url = urlMatch?.[0] || `https://meet.jit.si/processiq-${appointment.id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const rescheduleAppointment = async (appointment: AppointmentItem): Promise<void> => {
    try {
      const nextStart = new Date(appointment.dateStart.getTime() + 24 * 60 * 60 * 1000);
      const nextEnd = new Date(appointment.dateEnd.getTime() + 24 * 60 * 60 * 1000);
      await api.updateAppointment(appointment.id, {
        dateStart: nextStart.toISOString(),
        dateEnd: nextEnd.toISOString(),
        status: 'upcoming'
      });
      await loadAppointments();
    } catch (error: any) {
      alert(error.message || 'Unable to reschedule appointment');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <StudentNavbar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">My upcoming appointments</h3>
                <p className="text-sm text-gray-600">Fetched from MongoDB</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold">
              {upcomingAppointments.length}
            </span>
          </div>

          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="p-4 rounded-xl bg-gray-50 text-gray-600 text-sm">
                No upcoming appointments.
              </div>
            ) : (
              upcomingAppointments.map((appointment) => {
                const style = statusStyle(appointment.status);
                return (
                  <div key={appointment.id} className={`bg-gradient-to-br ${style.gradient} rounded-xl p-5 border-l-4 ${style.color.replace('text-', 'border-')}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg mb-1">{appointment.title}</h4>
                        <p className="text-sm text-gray-600">{appointment.description}</p>
                      </div>
                      <span className="px-3 py-1 bg-white bg-opacity-90 text-sm font-semibold rounded-full">
                        {daysUntilLabel(appointment.dateStart, appointment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className={style.color} />
                        <span>{appointment.dateStart.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className={style.color} />
                        <span>
                          {appointment.dateStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {appointment.dateEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={16} className={style.color} />
                        <span>{appointment.person}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className={style.color} />
                        <span>{appointment.location}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => rescheduleAppointment(appointment)}
                        className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        <Clock size={16} className="inline mr-2" />
                        Reschedule
                      </button>
                      <button
                        onClick={() => openAppointmentMeeting(appointment)}
                        className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={16} />
                        Join
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-600">History</h4>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                {showHistory ? 'Hide' : 'Show'} history
                <ChevronRight size={16} className={`transition-transform ${showHistory ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {showHistory && (
              <div className="space-y-3">
                {pastAppointments.length === 0 ? (
                  <div className="p-4 rounded-xl bg-gray-50 text-gray-600 text-sm">No past appointments.</div>
                ) : (
                  pastAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{appointment.title}</h5>
                          <p className="text-sm text-gray-600">
                            {appointment.dateStart.toLocaleDateString('fr-FR')} - {appointment.status}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedNoteAppointment(appointment)}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        >
                          Notes
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Plus size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Schedule a new appointment</h3>
              <p className="text-sm text-gray-600">Booking form</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-medium mb-3 text-gray-700">Type of appointment</label>
            <div className="grid grid-cols-2 gap-3">
              {appointmentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${
                    selectedType === type.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="font-medium text-sm mb-1">{type.label}</div>
                  <div className="text-xs text-gray-500">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-medium mb-3 text-gray-700">With whom?</label>
            <select
              value={selectedAdvisor}
              onChange={(e) => setSelectedAdvisor(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {advisors.length === 0 ? <option value="">No advisor found</option> : null}
              {advisors.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>{advisor.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block font-medium mb-3 text-gray-700">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your request..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
            />
          </div>

          <div className="mb-6">
            <label className="block font-medium mb-3 text-gray-700">Available slots</label>
            <div className="space-y-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-200 flex items-center justify-between ${
                    selectedSlot === slot.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedSlot === slot.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Calendar size={18} className={selectedSlot === slot.id ? 'text-blue-600' : 'text-gray-500'} />
                    </div>
                    <div>
                      <div className="font-medium">{slot.date}</div>
                      <div className="text-sm text-gray-600">{slot.time}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium">
                    Available
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => createAppointment(false)}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <CheckCircle size={20} />
            Confirm appointment
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Search size={16} />
              <span className="font-medium">Need another slot?</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Send a custom request to your advisor.</p>
            <button
              onClick={() => createAppointment(true)}
              className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
            >
              + Request custom slot
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-blue-700" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-800">{stats.avgDuration} min</div>
              <div className="text-sm text-blue-700">Average duration</div>
            </div>
          </div>
          <p className="text-sm text-blue-600">Computed from real appointments</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-green-700" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-800">{stats.completed}</div>
              <div className="text-sm text-green-700">Completed meetings</div>
            </div>
          </div>
          <p className="text-sm text-green-600">History from MongoDB</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-200 rounded-xl flex items-center justify-center">
              <XCircle size={20} className="text-red-700" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-800">{stats.cancelled}</div>
              <div className="text-sm text-red-700">Cancelled meetings</div>
            </div>
          </div>
          <p className="text-sm text-red-600">Track no-shows and cancellations</p>
        </div>
      </div>

      {selectedNoteAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-3">Appointment notes</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedNoteAppointment.title}</p>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 min-h-[120px]">
              {selectedNoteAppointment.notes || 'No notes available for this appointment.'}
            </div>
            <button
              onClick={() => setSelectedNoteAppointment(null)}
              className="w-full mt-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAppointments;
