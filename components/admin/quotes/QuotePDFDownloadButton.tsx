"use client";

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotePDF from './QuotePDF';
import { Download } from 'lucide-react';

const QuotePDFDownloadButton = ({ quote }: { quote: any }) => {
    return (
        <PDFDownloadLink
            document={<QuotePDF quote={quote} />}
            fileName={`DEVIS-${quote.reference}.pdf`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
            {({ blob, url, loading, error }) =>
                loading ? (
                    <>
                        Chargement...
                    </>
                ) : (
                    <>
                        <Download size={16} />
                        Télécharger PDF
                    </>
                )
            }
        </PDFDownloadLink>
    );
};

export default QuotePDFDownloadButton;
