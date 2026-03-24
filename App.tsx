import React, { Suspense, useState } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import AdmissionView from './components/AdmissionView';
import RHView from './components/RHView';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';
import ContactPage from './components/ContactPage';
import ClassNTCView from './components/ClassNTCView';
import Toast from './components/ui/Toast';
import { AdmissionTab } from './types';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/AdminDashboard';
import TestPage from './components/TestPage';
import StudentView from './components/StudentView';
import SupportView from './components/SupportView';
import { decodeJwtPayload, getAuthToken, isAuthenticated } from './services/session';

const getEffectiveRole = (): string | null => {
  const storedRole = localStorage.getItem('userRole');
  if (storedRole) return storedRole;

  const payload = decodeJwtPayload(getAuthToken());
  if (payload?.role === 'student') return 'eleve';
  return payload?.role ?? null;
};

const RequireAuth = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    const role = getEffectiveRole();
    if (!role) {
      return <Navigate to="/" replace />;
    }
    if (role !== 'super_admin' && !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

const RequireAdminAuth = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminAuthenticated = localStorage.getItem('adminAuthToken');

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<AdmissionTab | null>(null);
  const location = useLocation();

  const isStandalonePage = [
    '/',
    '/landing',
    '/login',
    '/register',
    '/contact',
    '/admin/login',
    '/test',
  ].includes(location.pathname) || location.pathname.startsWith('/admin');

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Toast />

      {!isStandalonePage && (
        <Suspense fallback={null}>
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </Suspense>
      )}

      <div className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${!isStandalonePage ? 'md:ml-[260px]' : ''}`}>
        {!isStandalonePage && <Header toggleSidebar={toggleSidebar} />}

        <main className={`${!isStandalonePage ? 'flex-1 overflow-y-auto p-8 md:p-10' : 'h-screen'}`}>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<Navigate to="/" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/contact" element={<ContactPage />} />

              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<RequireAdminAuth><AdminDashboard /></RequireAdminAuth>} />

              <Route element={<RequireAuth><Outlet /></RequireAuth>}>
                <Route
                  path="/home"
                  element={
                    (() => {
                      const role = getEffectiveRole();
                      if (role === 'commercial') return <Navigate to="/commercial/dashboard" replace />;
                      if (role === 'admission') return <Navigate to="/admission" replace />;
                      if (role === 'rh') return <Navigate to="/rh/dashboard" replace />;
                      if (role === 'eleve') return <Navigate to="/etudiant/dashboard" replace />;
                      if (role === 'super_admin') return <Navigate to="/admission" replace />;
                      return <Navigate to="/commercial/dashboard" replace />;
                    })()
                  }
                />

                <Route path="/commercial" element={<RequireAuth allowedRoles={['commercial']}><Outlet /></RequireAuth>}>
                  <Route path="dashboard" element={<DashboardView activeSubView="commercial-dashboard" />} />
                  <Route
                    path="placer"
                    element={
                      <DashboardView
                        activeSubView="commercial-placer"
                        onSelectStudent={(student, tab) => {
                          setSelectedStudent(student);
                          setSelectedTab(tab);
                        }}
                      />
                    }
                  />
                  <Route
                    path="alternance"
                    element={
                      <DashboardView
                        activeSubView="commercial-alternance"
                        onSelectStudent={(student, tab) => {
                          setSelectedStudent(student);
                          setSelectedTab(tab);
                        }}
                      />
                    }
                  />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                <Route
                  path="/admission"
                  element={
                    <RequireAuth allowedRoles={['admission', 'commercial']}>
                      <AdmissionView
                        selectedStudent={selectedStudent}
                        selectedTab={selectedTab}
                        onClearSelection={() => {
                          setSelectedStudent(null);
                          setSelectedTab(null);
                        }}
                      />
                    </RequireAuth>
                  }
                />

                <Route
                  path="/classe-ntc"
                  element={
                    <RequireAuth allowedRoles={['admission', 'commercial']}>
                      <ClassNTCView
                        onSelectStudent={(student, tab) => {
                          setSelectedStudent(student);
                          setSelectedTab(tab);
                        }}
                      />
                    </RequireAuth>
                  }
                />

                <Route
                  path="/test"
                  element={
                    <RequireAuth allowedRoles={['admission']}>
                      <TestPage />
                    </RequireAuth>
                  }
                />

                <Route path="/rh" element={<RequireAuth allowedRoles={['rh']}><Outlet /></RequireAuth>}>
                  <Route path="dashboard" element={<RHView activeSubView="rh-dashboard" />} />
                  <Route path="fiche" element={<RHView activeSubView="rh-fiche" />} />
                  <Route path="cerfa" element={<RHView activeSubView="rh-cerfa" />} />
                  <Route path="pec" element={<RHView activeSubView="rh-pec" />} />
                  <Route path="ruptures" element={<RHView activeSubView="rh-ruptures" />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                <Route path="/etudiant" element={<RequireAuth allowedRoles={['eleve']}><Outlet /></RequireAuth>}>
                  <Route path="dashboard" element={<StudentView />} />
                  <Route path="notes" element={<StudentView />} />
                  <Route path="documents" element={<StudentView />} />
                  <Route path="planning" element={<StudentView />} />
                  <Route path="rdv" element={<StudentView />} />
                  <Route path="presences" element={<StudentView />} />
                  <Route path="questionnaires" element={<StudentView />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                <Route
                  path="/support"
                  element={
                    <RequireAuth allowedRoles={['admission', 'rh']}>
                      <SupportView />
                    </RequireAuth>
                  }
                />

                <Route
                  path="/parametres"
                  element={
                    <div className="p-8">
                      <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="mb-4 text-xl font-bold">Parametres</h2>
                        <p className="text-slate-500">Configuration de l'application (Section en construction)</p>
                      </div>
                    </div>
                  }
                />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default App;
