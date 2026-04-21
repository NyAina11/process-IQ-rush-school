import React, { useState } from 'react';
import { LucideIcon, FileText, Loader2 } from 'lucide-react';
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
    const [isDownloading, setIsDownloading] = useState(false);

    // Default styles if not provided
    const defaultBg = bg || `${color}10`;
    const defaultBorder = border || `${color}20`;

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!url) {
            showToast("Document non disponible.", "info");
            return;
        }

        if (isDownloading) return;

        try {
            setIsDownloading(true);
            const response = await fetch(url);
            if (!response.ok) throw new Error('Fetch failed');

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = filename || label || 'document';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);

            showToast('Téléchargement démarré', 'success');
        } catch (error) {
            console.error('Download error:', error);
            // Fallback to window.open if fetch fails (e.g. CORS)
            window.open(url, '_blank');
            showToast('Document ouvert dans un nouvel onglet', 'info');
        } finally {
            setIsDownloading(false);
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
                disabled={isDownloading}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 shadow-sm border active:scale-95 group ${isDownloading ? 'cursor-wait opacity-80' : ''}`}
                style={{ background: defaultBg, color: color, borderColor: defaultBorder }}
                title={isDownloading ? 'Téléchargement en cours...' : `Télécharger ${label}`}
            >
                {isDownloading ? (
                    <Loader2 size={size} className="animate-spin" />
                ) : (
                    <Icon size={size} className="group-hover:scale-110 transition-transform" />
                )}
            </button>
        </div>
    );
};

export default DocDownloadBtn;
