import React from 'react';
import { LucideIcon, FileText } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface DocDownloadBtnProps {
    url?: string;
    has?: boolean;
    label: string;
    filename?: string;
    icon?: LucideIcon;
    color?: string;
    bg?: string;
    border?: string;
    size?: number;
    showLabel?: boolean;
    className?: string;
}

const DocDownloadBtn: React.FC<DocDownloadBtnProps> = ({
    url,
    has,
    label,
    filename,
    icon: Icon = FileText,
    color = '#6d28d9',
    bg,
    border,
    size = 14,
    showLabel = true,
    className = ""
}) => {
    const { showToast } = useAppStore();

    // Default styles if not provided
    const defaultBg = bg || `${color}10`;
    const defaultBorder = border || `${color}20`;

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!url) {
            showToast("Document non disponible.", "info");
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || label || 'document';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Téléchargement démarré', 'success');
        } catch (error) {
            window.open(url, '_blank');
            showToast('Document ouvert dans un nouvel onglet', 'info');
        }
    };

    if (!has) {
        return (
            <div className={`flex flex-col items-center gap-1 opacity-30 ${className}`}>
                {showLabel && <span className="text-[9px] font-bold text-[#8898aa] uppercase tracking-tighter">{label}</span>}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed">
                    <Icon size={size} />
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center gap-1 ${className}`}>
            {showLabel && <span className="text-[9px] font-bold text-[#8898aa] uppercase tracking-tighter">{label}</span>}
            <button
                onClick={handleDownload}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 shadow-sm border active:scale-95 group"
                style={{ background: defaultBg, color: color, borderColor: defaultBorder }}
                title={`Télécharger ${label}`}
            >
                <Icon size={size} className="group-hover:scale-110 transition-transform" />
            </button>
        </div>
    );
};

export default DocDownloadBtn;
