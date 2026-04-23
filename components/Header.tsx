import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, Bell, Globe, BellOff, Check, X, Clock, CheckCircle2, XCircle, Briefcase, Users, Monitor, GraduationCap, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useValidationStore, ValidationRequest } from '../store/useValidationStore';
import { useAppStore } from '../store/useAppStore';

interface HeaderProps {
  toggleSidebar: () => void;
  onExecuteApproved?: (request: ValidationRequest) => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, onExecuteApproved }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { showToast } = useAppStore();

  const userRole = localStorage.getItem('userRole') || 'Guest';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userName = localStorage.getItem('userName') || '';
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin';

  const {
    requests,
    approveRequest,
    rejectRequest,
    markSeenByUser,
    markSeenByAdmin,
    markAllSeenByAdmin,
    markAllSeenByUser,
    getUnseenCountForAdmin,
    getUnseenCountForUser,
  } = useValidationStore();

  // Poll for changes (since localStorage is shared between tabs)
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const moduleTitle = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/admission')) return 'Admissions';
    if (path.startsWith('/commercial')) return 'Commercial';
    if (path.startsWith('/rh')) return 'Ressources Humaines';
    if (path.startsWith('/etudiant')) return 'Espace Étudiant';
    if (path.startsWith('/parametres')) return 'Paramètres';
    if (path.startsWith('/support')) return 'Support Technique';
    return 'Tableau de bord';
  }, [location.pathname]);

  const modules = useMemo(() => {
    const allModules = [
      { id: 'admission', label: 'Admissions', path: '/admission', icon: Briefcase, roles: ['admission', 'commercial', 'super_admin', 'admin'] },
      { id: 'commercial', label: 'Commercial', path: '/commercial', icon: Monitor, roles: ['commercial', 'super_admin', 'admin'] },
      { id: 'rh', label: 'RH', path: '/rh', icon: Users, roles: ['rh', 'super_admin', 'admin'] },
      { id: 'etudiant', label: 'Étudiant', path: '/etudiant', icon: GraduationCap, roles: ['eleve', 'super_admin', 'admin'] },
    ];

    return allModules.filter(m => isSuperAdmin || m.roles.includes(userRole));
  }, [isSuperAdmin, userRole]);

  const activeModule = useMemo(() => {
    return modules.find(m => location.pathname.startsWith(m.path))?.id || null;
  }, [modules, location.pathname]);

  const initials = userRole.slice(0, 2).toUpperCase();

  // Notifications for current user
  const notifications = useMemo(() => {
    if (isSuperAdmin) {
      // Admin sees pending requests
      return requests
        .filter((r) => r.status === 'pending')
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    } else {
      // Regular user sees responses to their requests
      return requests
        .filter((r) => r.requestedBy === userEmail && r.status !== 'pending')
        .sort((a, b) => new Date(b.reviewedAt || b.requestedAt).getTime() - new Date(a.reviewedAt || a.requestedAt).getTime());
    }
  }, [requests, isSuperAdmin, userEmail]);

  // Also show pending requests for regular users
  const pendingForUser = useMemo(() => {
    if (isSuperAdmin) return [];
    return requests
      .filter((r) => r.requestedBy === userEmail && r.status === 'pending')
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }, [requests, isSuperAdmin, userEmail]);

  const unseenCount = isSuperAdmin
    ? getUnseenCountForAdmin()
    : getUnseenCountForUser(userEmail);

  const handleOpenNotif = () => {
    setNotifOpen((v) => !v);
  };

  const handleApprove = (req: ValidationRequest) => {
    approveRequest(req.id, userName || 'Super Admin');
    showToast(`Demande approuvée : ${req.action}`, 'success');
  };

  const handleReject = (req: ValidationRequest) => {
    rejectRequest(req.id, userName || 'Super Admin');
    showToast(`Demande refusée : ${req.action}`, 'info');
  };

  const handleClickNotif = (req: ValidationRequest) => {
    if (isSuperAdmin) {
      markSeenByAdmin(req.id);
    } else {
      markSeenByUser(req.id);
      if (req.status === 'approved' && onExecuteApproved) {
        onExecuteApproved(req);
      }
    }
  };

  const handleMarkAllSeen = () => {
    if (isSuperAdmin) {
      markAllSeenByAdmin();
    } else {
      markAllSeenByUser(userEmail);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  const allNotifs = isSuperAdmin ? notifications : [...notifications, ...pendingForUser];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/landing');
    showToast('Déconnexion réussie', 'success');
  };

  return (
    <header className="sticky top-0 z-30 px-6 flex items-center justify-between" style={{ height: 68, background: '#ffffff', borderBottom: '1px solid #e8eaf0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* <div className="flex items-center gap-8">
        <Link to="/home" className="flex items-center gap-3 group">
          <div className="flex flex-col">
            <h1 className="leading-none tracking-tight" style={{ fontSize: 18, fontWeight: 900, color: '#1a1d2e' }}>
              PROCESS<span className="text-[#6c63ff]">IQ</span>
            </h1>
          </div>
        </Link>
      </div> */}

      {/* Module Switcher (Center) - Bento Style */}
      <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/40 p-1.5 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
        {modules.map((m) => {
          const isActive = activeModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => navigate(m.path)}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 active:scale-95 ${isActive
                  ? 'bg-[#6c63ff] text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20'
                  : 'text-slate-500 hover:text-[#6c63ff] hover:bg-white/80'
                }`}
            >
              <m.icon size={15} strokeWidth={isActive ? 2.5 : 2} />
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleOpenNotif}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-95"
            style={{ color: '#6c63ff' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#ede9ff')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Bell size={18} />
            {unseenCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm">
                {unseenCount > 9 ? '9+' : unseenCount}
              </span>
            )}
            {unseenCount === 0 && allNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#6c63ff' }}></span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-xl z-50 overflow-hidden" style={{ border: '1px solid #e8eaf0' }}>
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #e8eaf0' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1d2e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isSuperAdmin ? 'Demandes de validation' : 'Notifications'}
                </span>
                {unseenCount > 0 && (
                  <button
                    onClick={handleMarkAllSeen}
                    className="hover:underline"
                    style={{ fontSize: 10, fontWeight: 600, color: '#6c63ff' }}
                  >
                    Tout marquer lu
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[400px] overflow-y-auto">
                {allNotifs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-[#9ca3af]">
                    <BellOff size={28} strokeWidth={1.5} />
                    <span className="text-sm font-medium">Aucune notification</span>
                  </div>
                ) : (
                  allNotifs.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => handleClickNotif(req)}
                      className="px-4 py-3 hover:bg-[#f9fafb] transition-colors cursor-pointer"
                      style={{
                        borderBottom: '1px solid #f0f2f8',
                        background: (isSuperAdmin && !req.seenByAdmin) || (!isSuperAdmin && !req.seen && req.status !== 'pending') ? '#ede9ff' : undefined,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${req.status === 'pending'
                            ? 'bg-amber-50 text-amber-500'
                            : req.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-500'
                              : 'bg-rose-50 text-rose-500'
                          }`}>
                          {req.status === 'pending' && <Clock size={14} />}
                          {req.status === 'approved' && <CheckCircle2 size={14} />}
                          {req.status === 'rejected' && <XCircle size={14} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold text-[#1e1b2e] truncate">{req.action}</span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${req.status === 'pending'
                                ? 'bg-amber-50 text-amber-600'
                                : req.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-rose-50 text-rose-600'
                              }`}>
                              {req.status === 'pending' ? 'En attente' : req.status === 'approved' ? 'Approuvé' : 'Refusé'}
                            </span>
                          </div>

                          {req.studentName && (
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{req.studentName}</p>
                          )}
                          {req.details && (
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{req.details}</p>
                          )}

                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-slate-400">
                              {isSuperAdmin ? `Par ${req.requestedByName}` : req.reviewedBy ? `Par ${req.reviewedBy}` : ''}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatTimeAgo(req.status === 'pending' ? req.requestedAt : req.reviewedAt || req.requestedAt)}
                            </span>
                          </div>

                          {/* Admin action buttons */}
                          {isSuperAdmin && req.status === 'pending' && (
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleApprove(req); }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-bold hover:bg-emerald-600 transition-colors"
                              >
                                <Check size={12} /> Valider
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReject(req); }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-[11px] font-bold hover:bg-rose-100 border border-rose-200 transition-colors"
                              >
                                <X size={12} /> Refuser
                              </button>
                            </div>
                          )}

                          {/* User: click to execute approved action */}
                          {!isSuperAdmin && req.status === 'approved' && !req.seen && (
                            <p className="text-[10px] text-emerald-600 font-semibold mt-1.5">
                              Cliquez pour exécuter l'action
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mx-1" style={{ width: 1, height: 20, background: '#e8eaf0' }}></div>

        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all active:scale-95" style={{ color: '#6b7280' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#ede9ff'; e.currentTarget.style.color = '#6c63ff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}>
          <Globe size={14} />
          <span className="text-xs font-semibold tracking-wider">FR</span>
        </button>

        <div className="mx-1" style={{ width: 1, height: 20, background: '#e8eaf0' }}></div>

        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="leading-none group-hover:text-[#6c63ff] transition-colors" style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e' }}>
                {userName || userRole}
              </span>
              <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>
                {isSuperAdmin ? 'Validateur' : 'Utilisateur'}
              </span>
            </div>
            <div className="relative">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6c63ff] to-[#8b5cf6] text-white shadow-md group-hover:shadow-indigo-500/30 transition-all duration-300 overflow-hidden">
                <span className="text-[13px] font-black">{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-white flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-emerald-500" />
              </div>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
          </div>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl z-50 overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-[12px] font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{userEmail}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => { setProfileOpen(false); navigate('/profil'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#6c63ff] transition-all text-[12px] font-semibold"
                >
                  <User size={16} /> Mon profil
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/parametres'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#6c63ff] transition-all text-[12px] font-semibold"
                >
                  <Settings size={16} /> Paramètres
                </button>
                <div className="my-1 border-t border-slate-100"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-all text-[12px] font-bold"
                >
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
