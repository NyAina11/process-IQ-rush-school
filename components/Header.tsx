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

  return (
    <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 px-8 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="p-2.5 text-slate-500 hover:bg-slate-100/80 rounded-[4px] transition-all active:scale-95 md:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col">
          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500">
            {moduleTitle}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1 h-1 rounded-full bg-brand"></span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Rush School Portal</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">


        <div className="flex items-center gap-2">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(v => !v)}
              className="relative w-11 h-11 rounded-[4px] flex items-center justify-center text-slate-500 hover:bg-slate-100/80 hover:text-indigo-600 transition-all active:scale-95"
            >
              <Bell size={20} />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-14 w-72 bg-white border border-[#e2e8f0] rounded-[8px] shadow-xl z-50">
                <div className="px-4 py-3 border-b border-[#e2e8f0]">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Notifications</span>
                </div>
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
                  <BellOff size={28} strokeWidth={1.5} />
                  <span className="text-sm font-bold">Aucune notification</span>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <button className="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-slate-600 hover:bg-slate-100/80 transition-all active:scale-95 group">
            <div className="w-6 h-6 rounded-[4px] bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <Globe size={14} />
            </div>
            <span className="text-xs font-bold tracking-wider">FR</span>
          </button>

          <div className="flex items-center gap-3 pl-2 cursor-pointer group">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-black text-slate-800 leading-none group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter">
                {localStorage.getItem('userRole') || 'Guest'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Utilisateur</span>
            </div>
            <div className="w-11 h-11 rounded-[4px] bg-gradient-to-br from-indigo-500 to-violet-600 p-0.5 shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-all active:scale-95">
              <div className="w-full h-full rounded-[4px] bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;