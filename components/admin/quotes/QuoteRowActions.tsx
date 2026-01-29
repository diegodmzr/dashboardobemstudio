import React, { useState } from 'react';
import { Eye, Download, Pencil } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import QuotePDF from './QuotePDF';

interface QuoteRowActionsProps {
    quote: any;
    onEdit: (quote: any) => void;
    onSend: (quote: any) => void;
}

const QuoteRowActions = ({ quote, onEdit, onSend }: QuoteRowActionsProps) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isViewing, setIsViewing] = useState(false);

    const handleView = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isViewing) return;
        setIsViewing(true);
        try {
            const blob = await pdf(<QuotePDF quote={quote} />).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error viewing PDF:', error);
        } finally {
            setIsViewing(false);
        }
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const blob = await pdf(<QuotePDF quote={quote} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `DEVIS-${quote.reference}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={(e) => { e.stopPropagation(); onSend(quote); }}
                className="cursor-pointer p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition dark:hover:bg-[#333] dark:text-gray-500 dark:hover:text-blue-400"
                title="Envoyer le devis"
            >
                <div className="flex items-center gap-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </div>
            </button>
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`cursor-pointer p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition ${isDownloading ? 'opacity-50' : ''} dark:hover:bg-[#333] dark:text-gray-500 dark:hover:text-white`}
                title="Télécharger le PDF"
            >
                <Download size={18} />
            </button>

            <button
                onClick={handleView}
                disabled={isViewing}
                className={`cursor-pointer p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition ${isViewing ? 'opacity-50' : ''} dark:hover:bg-[#333] dark:text-gray-500 dark:hover:text-white`}
                title="Voir le PDF"
            >
                <Eye size={18} />
            </button>

            <button
                onClick={(e) => { e.stopPropagation(); onEdit(quote); }}
                className="cursor-pointer p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition dark:hover:bg-[#333] dark:text-gray-500 dark:hover:text-white"
                title="Modifier"
            >
                <Pencil size={18} />
            </button>
        </div>
    );
};

export default QuoteRowActions;
