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
} from 'lucide-react';
import { useCandidates } from '../hooks/useCandidates';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const SectionLabel = ({ label }: { label: string }) => (
  <div className="px-5 pt-5 pb-1">
    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-400/80">
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
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
    if (onClose) onClose();
  };

  const parentCls = (active: boolean) =>
    `flex items-center gap-[14px] px-[18px] py-[13px] rounded-[4px] cursor-pointer transition-all duration-200 font-semibold text-[0.93rem] ${active ? 'bg-violet-600/20 text-white' : 'text-slate-400 hover:bg-white/8 hover:text-slate-200'
    }`;

  return (
    <aside className={`fixed top-0 left-0 h-full w-[260px] bg-sidebar text-slate-200 flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <img src="/images/logo-process-iq.png" alt="Process IQ" className="h-9 w-auto" />
        <span className="text-[1.15rem] font-bold tracking-tight text-white">
          PROCESSIQ
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hide py-2 space-y-0.5">

        {/* ── GESTION ── */}
        {(userRole === 'admission' || userRole === 'commercial' || userRole === 'super_admin' || !userRole) && (
          <SectionLabel label="Gestion" />
        )}

        {/* Admissions Group */}
        {(userRole === 'admission' || userRole === 'super_admin' || !userRole) && (
          <div className="px-3">
            <div
              onClick={() => setAdmissionOpen(!admissionOpen)}
              className={parentCls(isModuleActive('/admission') || isModuleActive('/classe-ntc'))}
            >
              <Users size={20} />
              <span>Admissions</span>
              <ChevronDown size={16} className={`ml-auto transition-transform duration-300 ${admissionOpen ? 'rotate-180' : ''}`} />
            </div>

            <div className={`overflow-hidden transition-all duration-300 ${admissionOpen ? 'max-h-[400px]' : 'max-h-0'}`}>
              <NavLink
                to="/admission"
                onClick={handleLinkClick}
                className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={15} />
                <span>Inscription des eleves</span>
              </NavLink>
              <NavLink
                to="/classe-ntc"
                onClick={handleLinkClick}
                className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
              >
                <Users size={15} />
                <span className="flex-1">Tableau de bord</span>
                {candidates.length > 0 && (
                  <span className="ml-auto bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
                    {candidates.length}
                  </span>
                )}
              </NavLink>

            </div>
          </div>
        )}

        {/* Commercial Group */}
        {(userRole === 'commercial' || userRole === 'super_admin' || !userRole) && (
          <div className="px-3">
            <div
              onClick={() => setCommercialOpen(!commercialOpen)}
              className={parentCls(isModuleActive('/commercial'))}
            >
              <Monitor size={20} />
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
                <span className="ml-auto bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-[4px] border border-emerald-500/30">
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
        {(userRole === 'rh' || userRole === 'super_admin' || !userRole) && (
          <SectionLabel label="Espace" />
        )}

        {/* RH Group */}
        {(userRole === 'rh' || userRole === 'super_admin' || !userRole) && (
          <div className="px-3">
            <div
              onClick={() => setRhOpen(!rhOpen)}
              className={parentCls(isModuleActive('/rh'))}
            >
              <Users size={20} />
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
        {(userRole === 'eleve' || userRole === 'super_admin' || !userRole) && (
          <div className="px-3">
            <NavLink
              to="/etudiant"
              onClick={handleLinkClick}
              className={({ isActive }) => `flex items-center gap-[14px] px-[18px] py-[13px] rounded-[4px] cursor-pointer transition-all duration-200 font-semibold text-[0.93rem] ${isActive ? 'bg-violet-600/20 text-white' : 'text-slate-400 hover:bg-white/8 hover:text-slate-200'}`}
            >
              {({ isActive }) => (
                <>
                  <BookOpen size={20} className={isActive ? 'text-white' : ''} />
                  <span>Étudiant</span>
                </>
              )}
            </NavLink>
          </div>
        )}

        {(userRole === 'admission' || userRole === 'rh' || userRole === 'super_admin') && (
          <div className="px-3">
            <NavLink
              to="/support"
              onClick={handleLinkClick}
              className={({ isActive }) => `flex items-center gap-[14px] px-[18px] py-[13px] rounded-[4px] cursor-pointer transition-all duration-200 font-semibold text-[0.93rem] ${isActive ? 'bg-violet-600/20 text-white' : 'text-slate-400 hover:bg-white/8 hover:text-slate-200'}`}
            >
              {({ isActive }) => (
                <>
                  <MessageSquare size={20} className={isActive ? 'text-white' : ''} />
                  <span>Support</span>
                </>
              )}
            </NavLink>
          </div>
        )}
        {/* Paramètres */}
        {(userRole === 'super_admin' || !userRole) && (
          <div className="px-3">
            <NavLink
              to="/parametres"
              onClick={handleLinkClick}
              className={({ isActive }) => `flex items-center gap-[14px] px-[18px] py-[13px] rounded-[4px] cursor-pointer transition-all duration-200 font-semibold text-[0.93rem] ${isActive ? 'bg-violet-600/20 text-white' : 'text-slate-400 hover:bg-white/8 hover:text-slate-200'}`}
            >
              {({ isActive }) => (
                <>
                  <Settings size={20} className={isActive ? 'text-white' : ''} />
                  <span>Paramètres</span>
                </>
              )}
            </NavLink>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-[14px] px-[18px] py-[13px] rounded-[4px] cursor-pointer transition-all duration-200 font-semibold text-[0.93rem] w-full text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

