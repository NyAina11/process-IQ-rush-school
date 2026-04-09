import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Target,
  TrendingUp,
  Upload,
  XCircle
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';
import { api } from '../../services/api';

type AttendanceType = 'absence' | 'delay' | 'present';
type AttendanceStatus = 'pending' | 'justified' | 'unjustified';
type PeriodFilter = 'this-month' | 'this-semester' | 'this-year';

interface AttendanceRecord {
  id: string;
  date: Date;
  type: AttendanceType;
  course: string;
  duration: number;
  reason: string;
  status: AttendanceStatus;
}

const formatDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '-';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
};

const isInPeriod = (date: Date, period: PeriodFilter): boolean => {
  const now = new Date();
  if (period === 'this-month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (period === 'this-year') {
    return date.getFullYear() === now.getFullYear();
  }
  // this-semester: Jan-Jun or Jul-Dec
  const currentSemester = now.getMonth() < 6 ? 1 : 2;
  const dateSemester = date.getMonth() < 6 ? 1 : 2;
  return date.getFullYear() === now.getFullYear() && currentSemester === dateSemester;
};

const StudentAttendance: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('this-semester');
  const [showJustificationModal, setShowJustificationModal] = useState<boolean>(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string>('');
  const [justificationReason, setJustificationReason] = useState<string>('Medical appointment');
  const [justificationFile, setJustificationFile] = useState<File | null>(null);

  const loadAttendances = async (): Promise<void> => {
    try {
      const studentId = await api.getCurrentStudentId();
      const attendances = await api.getAttendances(studentId ? String(studentId) : undefined);

      const mapped: AttendanceRecord[] = (Array.isArray(attendances) ? attendances : [])
        .map((a: any, idx: number) => ({
          id: String(a._id || a.id || `att-${idx}`),
          date: a.date ? new Date(a.date) : new Date(),
          type: (a.type || 'present') as AttendanceType,
          course: a.course || 'Course',
          duration: Number(a.duration || 0),
          reason: a.reason || '-',
          status: (a.status || 'pending') as AttendanceStatus
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      setRecords(mapped);
    } catch (err) {
      console.error('Failed to fetch attendance records', err);
    }
  };

  useEffect(() => {
    loadAttendances();
  }, []);

  const filteredRecords = useMemo(
    () => records.filter((r) => isInPeriod(r.date, selectedPeriod)),
    [records, selectedPeriod]
  );

  const stats = useMemo(() => {
    const present = filteredRecords.filter((r) => r.type === 'present').length;
    const absences = filteredRecords.filter((r) => r.type === 'absence').length;
    const delays = filteredRecords.filter((r) => r.type === 'delay').length;
    const totalTracked = present + absences + delays;
    const presenceRate = totalTracked > 0 ? Math.round((present / totalTracked) * 100) : 0;
    const totalHours = Math.round(filteredRecords.reduce((sum, r) => sum + r.duration, 0) / 60);
    const pendingItems = filteredRecords.filter((r) => r.status === 'pending' && r.type !== 'present');
    const unjustified = filteredRecords.filter((r) => r.status === 'unjustified').length;
    return { present, absences, delays, totalHours, presenceRate, totalTracked, pendingItems, unjustified };
  }, [filteredRecords]);

  const allRecordsCount = records.length;
  const pendingRecords = useMemo(
    () => records.filter((r) => r.status === 'pending' && r.type !== 'present'),
    [records]
  );

  const submitJustification = async (): Promise<void> => {
    try {
      if (!selectedAttendanceId) {
        alert('Select an attendance record first.');
        return;
      }

      await api.updateAttendance(selectedAttendanceId, {
        status: 'justified',
        reason: justificationReason
      });

      if (justificationFile) {
        const studentId = await api.getCurrentStudentId();
        if (studentId) {
          await api.uploadStudentDocument({
            studentId,
            file: justificationFile,
            title: `Justification-${new Date().toISOString().slice(0, 10)}-${justificationFile.name}`,
            description: `Supporting document for attendance record ${selectedAttendanceId}`,
            category: 'medical',
            status: 'valid'
          });
        }
      }

      setShowJustificationModal(false);
      setSelectedAttendanceId('');
      setJustificationFile(null);
      await loadAttendances();
    } catch (error: any) {
      alert(error.message || 'Unable to submit supporting document');
    }
  };

  const periods: Array<{ id: PeriodFilter; label: string }> = [
    { id: 'this-month', label: 'This month' },
    { id: 'this-semester', label: 'This semester' },
    { id: 'this-year', label: 'This year' }
  ];

  const getStatusBadge = (status: AttendanceStatus): JSX.Element => {
    if (status === 'pending') return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
    if (status === 'justified') return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Justified</span>;
    return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Unjustified</span>;
  };

  const getTypeBadge = (type: AttendanceType): JSX.Element => {
    if (type === 'absence') return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Absence</span>;
    if (type === 'delay') return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Delay</span>;
    return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Present</span>;
  };

  return (
    <div className="p-6 space-y-6">
      <StudentNavbar />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <div className="relative w-64 h-64 mx-auto mb-6">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#attendanceGradient)"
                strokeWidth="3"
                strokeDasharray={`${stats.presenceRate}, 100`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="attendanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-green-600">{stats.presenceRate}%</div>
              <div className="text-gray-600 mt-2">Presence rate</div>
            </div>
          </div>
          <div className="flex justify-center gap-3 flex-wrap">
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-2">
              <Target size={16} />
              Target: 90%
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold flex items-center gap-2">
              <TrendingUp size={16} />
              {stats.presenceRate >= 90 ? 'On target' : 'Below target'}
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-xl text-green-600"><CheckCircle size={24} /></div>
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.present}</div>
                <div className="text-sm text-gray-600">Presences</div>
              </div>
            </div>
            <div className="text-sm text-green-600 font-medium">Out of {stats.totalTracked} tracked records</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-xl text-red-600"><XCircle size={24} /></div>
              <div>
                <div className="text-3xl font-bold text-red-600">{stats.absences}</div>
                <div className="text-sm text-gray-600">Absences</div>
              </div>
            </div>
            <div className="text-sm text-red-600 font-medium">{stats.unjustified} unjustified</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600"><Clock size={24} /></div>
              <div>
                <div className="text-3xl font-bold text-yellow-600">{stats.delays}</div>
                <div className="text-sm text-gray-600">Delays</div>
              </div>
            </div>
            <div className="text-sm text-yellow-700 font-medium">Pending: {stats.pendingItems.length}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><Calendar size={24} /></div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{stats.totalHours}h</div>
                <div className="text-sm text-gray-600">Tracked hours</div>
              </div>
            </div>
            <div className="text-sm text-blue-700 font-medium">From filtered records</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-yellow-900 text-lg mb-1">{stats.pendingItems.length} supporting document(s) pending</h3>
              <p className="text-yellow-700 text-sm">
                {stats.pendingItems.length > 0
                  ? `Latest pending date: ${stats.pendingItems[0].date.toLocaleDateString('fr-FR')}`
                  : 'No pending justification.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedAttendanceId(stats.pendingItems[0]?.id || '');
              setShowJustificationModal(true);
            }}
            className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold flex items-center gap-3 hover:bg-yellow-600 transition-colors"
          >
            <Upload size={20} />
            Send supporting document
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">History of attendance</h3>
              <p className="text-sm text-gray-600">Fetched from MongoDB attendance records</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as PeriodFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>{period.label}</option>
              ))}
            </select>

            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors">
              <Download size={16} />
              Attendance certificate
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Type</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Course</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Duration</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Reason</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={6}>
                    {allRecordsCount > 0
                      ? 'Aucune donnee pour ce filtre. Change la periode pour voir les autres presences.'
                      : 'Aucune donnee de presence trouvee pour cet etudiant.'}
                  </td>
                </tr>
              )}
              {filteredRecords.map((record) => (
                <tr key={record.id} className={`border-b border-gray-200 hover:bg-gray-50 ${record.status === 'pending' ? 'bg-yellow-50' : ''}`}>
                  <td className="p-4 font-medium">{record.date.toLocaleDateString('fr-FR')}</td>
                  <td className="p-4">{getTypeBadge(record.type)}</td>
                  <td className="p-4 font-medium">{record.course}</td>
                  <td className="p-4">{formatDuration(record.duration)}</td>
                  <td className="p-4 text-gray-600">{record.reason || '-'}</td>
                  <td className="p-4 text-center">{getStatusBadge(record.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="text-gray-600">
              Showing <span className="font-semibold">{filteredRecords.length}</span> records
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Justified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Unjustified</span>
              </div>
            </div>
            <div className="text-blue-600 font-medium flex items-center gap-2">
              <AlertTriangle size={16} />
              Pending justifications: {stats.pendingItems.length}
            </div>
          </div>
        </div>
      </div>

      {showJustificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Justify an absence</h3>
              <button onClick={() => setShowJustificationModal(false)} className="text-gray-400 hover:text-gray-600">X</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attendance record</label>
                <select
                  value={selectedAttendanceId}
                  onChange={(e) => setSelectedAttendanceId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a pending item</option>
                  {pendingRecords.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.date.toLocaleDateString('fr-FR')} - {record.course}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <select
                  value={justificationReason}
                  onChange={(e) => setJustificationReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Medical appointment">Medical appointment</option>
                  <option value="Transportation issue">Transportation issue</option>
                  <option value="Family emergency">Family emergency</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supporting document</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-sm text-gray-600 mb-2">Upload your file</p>
                  <input type="file" onChange={(e) => setJustificationFile(e.target.files?.[0] || null)} className="mx-auto text-sm" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowJustificationModal(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={submitJustification} className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
