import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  BookOpen,
  MessageSquare,
  UserPlus,
  CheckCircle,
  FileText,
  XCircle,
  Box,
  CheckCircle2,
  Monitor,
  CalendarCheck2,
} from 'lucide-react';
import { useCandidates } from '../hooks/useCandidates';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const SectionLabel = ({ label }: { label: string }) => (
  <div className="px-5 pt-6 pb-1">
    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8b92a9' }}>
      {label}
    </span>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const { candidates } = useCandidates();

  const [admissionOpen, setAdmissionOpen] = useState(false);
  const [commercialOpen, setCommercialOpen] = useState(false);
  const [rhOpen, setRhOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/admission') || path.startsWith('/classe-ntc')) setAdmissionOpen(true);
    if (path.startsWith('/commercial')) setCommercialOpen(true);
    if (path.startsWith('/rh')) setRhOpen(true);
  }, [location.pathname]);

  const isModuleActive = (modulePrefix: string) => location.pathname.startsWith(modulePrefix);

  const handleLinkClick = () => {
    if (window.innerWidth < 768 && onClose) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
    if (onClose) onClose();
  };

  const isAdmissionDashboardActive = location.pathname === '/admission' && !new URLSearchParams(location.search).get('tab');
  const isAdmissionInterviewsActive = location.pathname === '/admission' && new URLSearchParams(location.search).get('tab') === 'interviews';

  const parentCls = (active: boolean) =>
    `flex items-center gap-[14px] px-[18px] py-[13px] rounded-[4px] cursor-pointer transition-all duration-150 font-medium text-[13px] ${active ? 'text-white' : 'hover:text-white'
    }`;

  const parentStyle = (active: boolean): React.CSSProperties => ({
    background: active ? '#2d3154' : 'transparent',
    borderLeft: active ? '3px solid #6c63ff' : '3px solid transparent',
    color: active ? '#ffffff' : '#8b92a9',
  });

  return (
    <aside className={`fixed top-0 left-0 h-full flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      style={{ width: 240, background: '#1a1d2e', color: '#ffffff' }}>

      {/* Logo */}
      <div className="flex items-center gap-3" style={{ padding: 20 }}>
        <img src="/images/logo-process-iq.png" alt="Process IQ" className="h-9 w-auto" />
        <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
          PROCESSIQ
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hide py-2 space-y-0.5">

        {/* ── GESTION ── */}
        {(userRole === 'admission' || userRole === 'commercial' || userRole === 'super_admin' || userRole === 'admin' || !userRole) && (
          <SectionLabel label="Gestion" />
        )}

        {/* Admissions Group */}
        {(userRole === 'admission' || userRole === 'super_admin' || userRole === 'admin' || !userRole) && (
          <div className="px-3">
            <div
              onClick={() => setAdmissionOpen(!admissionOpen)}
              className={parentCls(isModuleActive('/admission') || isModuleActive('/classe-ntc'))}
              style={parentStyle(isModuleActive('/admission') || isModuleActive('/classe-ntc'))}
            >
              <Users size={16} />
              <span>Admissions</span>
              <ChevronDown size={16} className={`ml-auto transition-transform duration-300 ${admissionOpen ? 'rotate-180' : ''}`} />
            </div>

            <div className={`overflow-hidden transition-all duration-300 ${admissionOpen ? 'max-h-[400px]' : 'max-h-0'}`}>
              <NavLink
                to="/classe-ntc"
                onClick={handleLinkClick}
                className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={15} />
                <span>Tableau de bord</span>
              </NavLink>
              
              <NavLink
                to="/admission"
                onClick={handleLinkClick}
                className={() => `nav-subitem ${isAdmissionDashboardActive ? 'active' : ''}`}
              >
                <Users size={15} />
                <span className="flex-1">Classe NTC</span>
                {candidates.length > 0 && (
                  <span className="ml-auto bg-[#6c63ff] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {candidates.length}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/admission?tab=interviews"
                onClick={handleLinkClick}
                className={() => `nav-subitem ${isAdmissionInterviewsActive ? 'active' : ''}`}
              >
                <FileText size={15} />
                <span>Suivi des entretiens</span>
              </NavLink>
            </div>
          </div>
        )}

        {/* Commercial Group */}
        {(userRole === 'commercial' || userRole === 'super_admin' || userRole === 'admin' || !userRole) && (
          <div className="px-3">
            <div
              onClick={() => setCommercialOpen(!commercialOpen)}
              className={parentCls(isModuleActive('/commercial'))}
              style={parentStyle(isModuleActive('/commercial'))}
            >
              <Monitor size={16} />
              <span>Commercial</span>
              <ChevronDown size={16} className={`ml-auto transition-transform duration-300 ${commercialOpen ? 'rotate-180' : ''}`} />
            </div>

            <div className={`overflow-hidden transition-all duration-300 ${commercialOpen ? 'max-h-[300px]' : 'max-h-0'}`}>
              <NavLink
                to="/commercial/dashboard"
                onClick={handleLinkClick}
                className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={15} />
                <span>Tableau de bord</span>
              </NavLink>
              <NavLink
                to="/commercial/placer"
                onClick={handleLinkClick}
                className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
              >
                <UserPlus size={15} />
                <span className="flex-1">Élèves à placer</span>
                <span className="ml-auto" style={{ background: '#22c55e', color: '#ffffff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                  Actif
                </span>
              </NavLink>
              <NavLink
                to="/commercial/alternance"
                onClick={handleLinkClick}
                className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
              >
                <CheckCircle size={15} />
                <span>Élèves en alternance</span>
              </NavLink>
            </div>
          </div>
        )}

        {/* ── ESPACE ── */}
        {(userRole === 'rh' || userRole === 'super_admin' || userRole === 'admin' || !userRole) && (
          <SectionLabel label="Espace" />
        )}

        {/* RH Group */}
        {(userRole === 'rh' || userRole === 'super_admin' || userRole === 'admin' || !userRole) && (
          <div className="px-3">
            <div
              onClick={() => setRhOpen(!rhOpen)}
              className={parentCls(isModuleActive('/rh'))}
              style={parentStyle(isModuleActive('/rh'))}
            >
              <Users size={16} />
              <span>RH</span>
              <ChevronDown size={16} className={`ml-auto transition-transform duration-300 ${rhOpen ? 'rotate-180' : ''}`} />
            </div>

            <div className={`overflow-hidden transition-all duration-300 ${rhOpen ? 'max-h-[400px]' : 'max-h-0'}`}>
              <NavLink
                to="/rh/dashboard"
                onClick={handleLinkClick}
                className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={15} />
                <span>Vue d'ensemble</span>
              </NavLink>
              <NavLink
                to="/rh/fiche"
                onClick={handleLinkClick}
                className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
              >
                <Box size={15} />
                <span>Fiche Entreprise</span>
              </NavLink>
              <NavLink
                to="/rh/cerfa"
                onClick={handleLinkClick}
                className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
              >
                <FileText size={15} />
                <span>CERFA</span>
              </NavLink>
              <NavLink
                to="/rh/pec"
                onClick={handleLinkClick}
                className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
              >
                <CheckCircle2 size={15} />
                <span>Prises en charge</span>
              </NavLink>
              <NavLink
                to="/rh/ruptures"
                onClick={handleLinkClick}
                className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
              >
                <XCircle size={15} />
                <span>Ruptures</span>
              </NavLink>
            </div>
          </div>
        )}

        {/* Étudiant */}
        {(userRole === 'eleve' || userRole === 'super_admin' || userRole === 'admin' || !userRole) && (
          <div className="px-3">
            <NavLink
              to="/etudiant"
              onClick={handleLinkClick}
              className={({ isActive }) => `flex items-center gap-[14px] px-[18px] py-[13px] rounded-[4px] cursor-pointer transition-all duration-150 font-medium text-[13px] ${isActive ? 'text-white' : 'hover:text-white'}`}
              style={({ isActive }: { isActive: boolean }) => ({ background: isActive ? '#2d3154' : 'transparent', borderLeft: isActive ? '3px solid #6c63ff' : '3px solid transparent', color: isActive ? '#ffffff' : '#8b92a9' }) as React.CSSProperties}
            >
              {({ isActive }) => (
                <>
                  <BookOpen size={16} className={isActive ? 'text-white' : ''} />
                  <span>Étudiant</span>
                </>
              )}
            </NavLink>
          </div>
        )}

        {(userRole === 'admission' || userRole === 'rh' || userRole === 'super_admin' || userRole === 'admin') && (
          <div className="px-3">
            <NavLink
              to="/support"
              onClick={handleLinkClick}
              className={({ isActive }) => `flex items-center gap-[14px] px-[18px] py-[13px] rounded-[4px] cursor-pointer transition-all duration-150 font-medium text-[13px] ${isActive ? 'text-white' : 'hover:text-white'}`}
              style={({ isActive }: { isActive: boolean }) => ({ background: isActive ? '#2d3154' : 'transparent', borderLeft: isActive ? '3px solid #6c63ff' : '3px solid transparent', color: isActive ? '#ffffff' : '#8b92a9' }) as React.CSSProperties}
            >
              {({ isActive }) => (
                <>
                  <MessageSquare size={16} className={isActive ? 'text-white' : ''} />
                  <span>Support</span>
                </>
              )}
            </NavLink>
          </div>
        )}

        {/* Formateur */}
        <div className="px-3">
          <NavLink
            to="/formateur"
            onClick={handleLinkClick}
            className={({ isActive }) => `flex items-center gap-[14px] px-[18px] py-[13px] rounded-[4px] cursor-pointer transition-all duration-150 font-medium text-[13px] ${isActive ? 'text-white' : 'hover:text-white'}`}
            style={({ isActive }: { isActive: boolean }) => ({ background: isActive ? '#2d3154' : 'transparent', borderLeft: isActive ? '3px solid #6c63ff' : '3px solid transparent', color: isActive ? '#ffffff' : '#8b92a9' }) as React.CSSProperties}
          >
            {({ isActive }) => (
              <>
                <BookOpen size={16} className={isActive ? 'text-white' : ''} />
                <span>Formateur</span>
              </>
            )}
          </NavLink>
        </div>
        {/* Paramètres */}
        {(userRole === 'super_admin' || userRole === 'admin' || !userRole) && (
          <div className="px-3">
            <NavLink
              to="/parametres"
              onClick={handleLinkClick}
              className={({ isActive }) => `flex items-center gap-[14px] px-[18px] py-[13px] rounded-[4px] cursor-pointer transition-all duration-150 font-medium text-[13px] ${isActive ? 'text-white' : 'hover:text-white'}`}
              style={({ isActive }: { isActive: boolean }) => ({ background: isActive ? '#2d3154' : 'transparent', borderLeft: isActive ? '3px solid #6c63ff' : '3px solid transparent', color: isActive ? '#ffffff' : '#8b92a9' }) as React.CSSProperties}
            >
              {({ isActive }) => (
                <>
                  <Settings size={16} className={isActive ? 'text-white' : ''} />
                  <span>Paramètres</span>
                </>
              )}
            </NavLink>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-[14px] px-[18px] py-[13px] rounded-[4px] cursor-pointer transition-all duration-150 font-medium text-[13px] w-full"
          style={{ color: '#8b92a9', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#252847'; e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8b92a9'; }}
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
