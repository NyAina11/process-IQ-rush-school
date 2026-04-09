import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Calendar, FileText, CheckCircle, 
  Users, FolderOpen, ClipboardCheck, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface StudentNavbarProps {
  activeTab?: string;
}

const StudentNavbar: React.FC<StudentNavbarProps> = ({ 
  activeTab = 'dashboard' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState<string>(activeTab);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mise à jour de l'onglet actif basé sur l'URL
  useEffect(() => {
    const path = location.pathname;
    const tab = tabs.find(t => path.includes(t.id)) || tabs[0];
    setCurrentTab(tab.id);
  }, [location.pathname]);

  const tabs: Tab[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      path: '/etudiant/dashboard'
    },
    {
      id: 'planning',
      label: 'Planning',
      icon: <Calendar size={18} />,
      path: '/etudiant/planning'
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: <FileText size={18} />,
      path: '/etudiant/notes'
    },
    {
      id: 'presences',
      label: 'Presences',
      icon: <CheckCircle size={18} />,
      path: '/etudiant/presences'
    },
    {
      id: 'rdv',
      label: 'Pedagogy Meeting',
      icon: <Users size={18} />,
      path: '/etudiant/rdv'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FolderOpen size={18} />,
      path: '/etudiant/documents'
    },
    {
      id: 'questionnaires',
      label: 'Questionnaires',
      icon: <ClipboardCheck size={18} />,
      path: '/etudiant/questionnaires'
    }
  ];

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleTabClick = (tabId: string, path: string) => {
    setCurrentTab(tabId);
    navigate(path);
  };

  const handleScroll = () => {
    checkScrollButtons();
  };

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 p-2 shadow-sm mb-6">
      {/* Boutons de navigation flottants */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-300 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
      )}
      
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-300 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      )}

      {/* Indicateur de section actuelle */}
      <div className="absolute -top-8 left-0 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        <span className="text-sm text-gray-600">
          Current section: <span className="font-semibold text-gray-900">
            {tabs.find(t => t.id === currentTab)?.label}
          </span>
        </span>
      </div>

      {/* Navigation principale */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto scrollbar-hide gap-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id, tab.path)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 flex-shrink-0
              ${currentTab === tab.id 
                ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border border-blue-200 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
              font-medium text-sm whitespace-nowrap
            `}
          >
            <span className={`${currentTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Style pour masquer la scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default StudentNavbar;