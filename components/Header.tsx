import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Globe, BellOff } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
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
    return 'Tableau de bord';
  }, [location.pathname]);

  const userRole = localStorage.getItem('userRole') || 'Guest';
  const initials = userRole.slice(0, 2).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-[#e5e0f5] sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-[#6d28d9] hover:bg-[#f5f3ff] rounded-md transition-all active:scale-95 md:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-[#1e1b2e] leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {moduleTitle}
          </h1>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9333ea] mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Rush School
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[#6d28d9] hover:bg-[#f5f3ff] transition-all active:scale-95"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#9333ea]"></span>
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 w-72 bg-white border border-[#e5e0f5] rounded-xl shadow-xl z-50">
              <div className="px-4 py-3 border-b border-[#e5e0f5]">
                <span className="text-xs font-semibold text-[#1e1b2e] uppercase tracking-widest">Notifications</span>
              </div>
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-[#9ca3af]">
                <BellOff size={28} strokeWidth={1.5} />
                <span className="text-sm font-medium">Aucune notification</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-[#e5e0f5] mx-1"></div>

        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#4b5563] hover:bg-[#f5f3ff] hover:text-[#6d28d9] transition-all active:scale-95">
          <Globe size={14} />
          <span className="text-xs font-semibold tracking-wider">FR</span>
        </button>

        <div className="h-5 w-px bg-[#e5e0f5] mx-1"></div>

        <div className="flex items-center gap-2.5 pl-1 cursor-pointer group">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-[#1e1b2e] leading-none group-hover:text-[#6d28d9] transition-colors">
              {userRole}
            </span>
            <span className="text-[10px] text-[#9ca3af] font-medium uppercase tracking-wider mt-0.5">Utilisateur</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#6d28d9] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#6d28d9]/20 group-hover:shadow-[#6d28d9]/40 transition-all active:scale-95">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;