import React, { lazy, Suspense, useState, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AppModule, ViewId } from './types';
import Toast from './components/ui/Toast';
import { AdmissionTab } from './types';

const Sidebar = lazy(() => import('./components/Sidebar'));
const Header = lazy(() => import('./components/Header'));
const DashboardView = lazy(() => import('./components/DashboardView'));
const AdmissionView = lazy(() => import('./components/AdmissionView'));
const RHView = lazy(() => import('./components/RHView'));
const StudentView = lazy(() => import('./components/StudentView'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const ClassNTCView = lazy(() => import('./components/ClassNTCView'));
const AdminLoginPage = lazy(() => import('./components/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const TestPage = lazy(() => import('./components/TestPage'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const RegisterPage = lazy(() => import('./components/RegisterPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen w-full bg-slate-50">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const RequireAuth = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const isAuthenticated = localStorage.getItem('token'); // Changed from authToken to token
  const userRole = localStorage.getItem('userRole');
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && userRole !== 'super_admin' && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RequireAdminAuth = ({ children }: { children: React.ReactNode }) => {
  const isAdminAuthenticated = localStorage.getItem('adminAuthToken');
  const location = useLocation();

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
    '/login',
    '/register',
    '/contact',
    '/landing',
    '/admin/login',
    '/test'
  ].includes(location.pathname) || location.pathname.startsWith('/admin');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Derive active module from current path
  const activeModule = useMemo((): AppModule => {
    const path = location.pathname;
    if (path.startsWith('/commercial')) return AppModule.COMMERCIAL;
    if (path.startsWith('/admission')) return AppModule.ADMISSION;
    if (path.startsWith('/rh')) return AppModule.RH;
    if (path.startsWith('/etudiant')) return AppModule.STUDENT;
    if (path.startsWith('/parametres')) return AppModule.PARAMETRES;
    return AppModule.COMMERCIAL;
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Toast />

      {!isStandalonePage && (
        <Suspense fallback={null}>
          {/* Sidebar Overlay for Mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </Suspense>
      )}

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isStandalonePage ? 'md:ml-[260px]' : ''}`}>
        {!isStandalonePage && (
          <Suspense fallback={null}>
            <Header
              toggleSidebar={toggleSidebar}
            />
          </Suspense>
        )}

        <main className={`${!isStandalonePage ? 'flex-1 p-8 md:p-10 overflow-y-auto' : 'h-screen'}`}>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<RequireAdminAuth><AdminDashboard /></RequireAdminAuth>} />

            <Route element={<RequireAuth><Outlet /></RequireAuth>}>
              {/* Role-based dashboard access now handled via LandingPage or specific /login post-auth logic */}

              {/* Commercial Routes */}
              <Route path="/commercial" element={<RequireAuth allowedRoles={['commercial']}><Outlet /></RequireAuth>}>
                <Route path="dashboard" element={<DashboardView activeSubView="commercial-dashboard" />} />
                <Route path="placer" element={
                  <DashboardView 
                    activeSubView="commercial-placer" 
                    onSelectStudent={(student, tab) => {
                      setSelectedStudent(student);
                      setSelectedTab(tab);
                    }}
                  />
                } />
                <Route path="alternance" element={
                  <DashboardView 
                    activeSubView="commercial-alternance" 
                    onSelectStudent={(student, tab) => {
                      setSelectedStudent(student);
                      setSelectedTab(tab);
                    }}
                  />
                } />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* Admission Routes */}
              <Route path="/admission" element={
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
              } />
              <Route path="/classe-ntc" element={
                <RequireAuth allowedRoles={['admission', 'commercial']}>
                  <ClassNTCView
                    onSelectStudent={(student, tab) => {
                      setSelectedStudent(student);
                      setSelectedTab(tab);
                    }}
                  />
                </RequireAuth>
              } />

              <Route path="/test" element={
                <RequireAuth allowedRoles={['admission']}>
                  <TestPage />
                </RequireAuth>
              } />

              {/* RH Routes */}
              <Route path="/rh" element={<RequireAuth allowedRoles={['rh']}><Outlet /></RequireAuth>}>
                <Route path="dashboard" element={<RHView activeSubView="rh-dashboard" />} />
                <Route path="fiche" element={<RHView activeSubView="rh-fiche" />} />
                <Route path="cerfa" element={<RHView activeSubView="rh-cerfa" />} />
                <Route path="pec" element={<RHView activeSubView="rh-pec" />} />
                <Route path="ruptures" element={<RHView activeSubView="rh-ruptures" />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* Other Routes */}
              <Route path="/etudiant" element={<RequireAuth allowedRoles={['eleve']}><StudentView /></RequireAuth>} />
              <Route path="/parametres" element={
                <div className="p-8">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4">Paramètres</h2>
                    <p className="text-slate-500">Configuration de l'application (Section en construction)</p>
                  </div>
                </div>
              } />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default App;