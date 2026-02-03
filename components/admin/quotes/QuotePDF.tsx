import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#000000',
        backgroundColor: '#FFFFFF',
        padding: 0,
    },
    // Header Section with Gradient
    headerWrapper: {
        height: 140,
        width: '100%',
        marginBottom: 30,
        position: 'relative',
        backgroundColor: '#000000', // Solid black
    },
    headerContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: 60,  // Adjust size as needed
        height: 60, // Adjust size as needed
        marginBottom: 8,
        objectFit: 'contain',
    },
    brandName: {
        color: '#FFFFFF',
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },

    // Main Content
    contentContainer: {
        paddingHorizontal: 40,
        paddingBottom: 40,
    },

    // Info Block (Top)
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    companyInfo: {
        width: '50%',
    },
    quoteInfo: {
        width: '40%',
        alignItems: 'flex-end',
    },
    textBold: {
        fontWeight: 'bold',
        fontSize: 10,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    textRegular: {
        fontSize: 9,
        lineHeight: 1.4,
        color: '#333333',
    },
    textLabel: {
        fontSize: 8,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: '#666666',
        marginTop: 4,
    },
    infoValue: {
        fontSize: 11,
        marginTop: 2,
    },

    // Table
    tableContainer: {
        width: '100%',
        borderColor: '#000000',
        borderWidth: 1.5,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1.5,
        borderColor: '#000000',
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    tableHeaderCell: {
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // Table Columns
    colService: { width: '50%', paddingLeft: 15 },
    colMonth: { width: '15%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'center' },
    colTotal: { width: '20%', textAlign: 'right', paddingRight: 15 },

    // Table Content
    row: {
        flexDirection: 'row',
        paddingVertical: 12,
    },
    itemBlock: {
        backgroundColor: '#F3F4F6',
        padding: 10,
        marginHorizontal: 15,
        marginBottom: 10,
        marginTop: 10,
    },
    itemTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    itemDesc: {
        fontSize: 8,
        color: '#555555',
        lineHeight: 1.4,
    },
    cellText: {
        fontSize: 9,
        paddingTop: 10,
    },

    // Bottom Section
    bottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    billedTo: {
        width: '45%',
    },
    totals: {
        width: '40%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    totalLabel: {
        fontSize: 9,
        textTransform: 'uppercase',
        color: '#666666',
    },
    totalValue: {
        fontSize: 9,
        textAlign: 'right',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderColor: '#E5E7EB',
    },
    grandTotalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    grandTotalValue: {
        fontSize: 11,
        fontWeight: 'bold',
    },

    // Page 2
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 15,
        marginTop: 20,
    },
    textP: {
        fontSize: 9,
        lineHeight: 1.5,
        textAlign: 'justify',
        color: '#333333',
        marginBottom: 6,
    },
    bullet: {
        fontSize: 9,
        lineHeight: 1.5,
        marginLeft: 8,
        color: '#333333',
        marginBottom: 2,
    },
    signatureContainer: {
        marginTop: 40,
    },
    signatureTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 20,
    },
    signatureImage: {
        width: 100, // Adjust signature size
        height: 50,
        objectFit: 'contain',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        right: 40,
        fontSize: 9,
        color: '#999999',
    },
});

type QuotePDFProps = {
    quote: any;
};

const QuotePDF = ({ quote }: QuotePDFProps) => {
    // Determine items array and label
    const { items, quantityLabel } = React.useMemo(() => {
        if (!quote || !quote.items) return { items: [], quantityLabel: "MOIS" };
        try {
            const parsed = typeof quote.items === 'string' ? JSON.parse(quote.items) : quote.items;
            if (Array.isArray(parsed)) {
                return { items: parsed, quantityLabel: "MOIS" };
            }
            return {
                items: parsed.lines || [],
                quantityLabel: parsed.label || "MOIS"
            };
        } catch (e) {
            return { items: [], quantityLabel: "MOIS" };
        }
    }, [quote]);

    // Parse term sections
    const termSections = React.useMemo(() => {
        if (!quote || !quote.termsConfig) return [];
        // If it's the empty string "[]", return empty
        if (quote.termsConfig === "[]") return [];
        try {
            return JSON.parse(quote.termsConfig);
        } catch (e) {
            return [];
        }
    }, [quote]);

    // Safety function for text rendering
    const safeText = (val: any) => {
        if (val === null || val === undefined) return '';
        return String(val);
    };

    // Safely parse numbers to avoid NaN
    const safeNumber = (val: any) => {
        if (val === null || val === undefined) return 0;
        const num = Number(val);
        return isNaN(num) ? 0 : num;
    };

    const subtotal = safeNumber(quote?.subtotal);
    const taxAmount = safeNumber(quote?.taxAmount);
    const taxRate = safeNumber(quote?.taxRate);
    const total = safeNumber(quote?.total);

    const formatDate = (dateCheck: string | Date) => {
        if (!dateCheck) return '';
        try {
            return new Date(dateCheck).toLocaleDateString("fr-FR");
        } catch (e) {
            return '';
        }
    };

    const formatCurrency = (amount: number) => {
        try {
            return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
        } catch (e) {
            return '0,00 €';
        }
    };

    type ImagePaths = {
        logo?: string;
        logoNoir?: string;
        signature?: string;
    };

    const logoUrl = (quote as any).imagePaths?.logo || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/logoblanc.png` : '/logoblanc.png');
    const logoNoirUrl = (quote as any).imagePaths?.logoNoir || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/logonoir.png` : '/logonoir.png');
    const signatureUrl = (quote as any).imagePaths?.signature || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/signature.png` : '/signature.png');

    if (!quote) return <Document><Page size="A4"><Text>No Data</Text></Page></Document>;

    return (
        <Document>
            {/* PAGE 1 */}
            <Page size="A4" style={styles.page}>
                {/* Header with Solid Color */}
                <View style={[styles.headerWrapper, { backgroundColor: '#000000' }]}>
                    <View style={styles.headerContent}>
                        {/* Logo Image */}
                        <Image src={logoUrl} style={styles.logoImage} />
                        <Text style={styles.brandName}>OBEM STUDIO</Text>
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    {/* Info */}
                    <View style={styles.infoContainer}>
                        <View style={styles.companyInfo}>
                            <Text style={styles.textBold}>OBEM STUDIO</Text>
                            <Text style={styles.textRegular}>(Entreprise - Divin e-com)</Text>
                            <Text style={styles.textRegular}>947 788 915 00017</Text>
                            <Text style={styles.textRegular}>14 Carrere d'argut, 31160 Encausse les Thermes, France</Text>
                            <Text style={styles.textRegular}>contact@obemstudio.com</Text>
                            <Text style={styles.textRegular}>+33604166248</Text>
                        </View>
                        <View style={styles.quoteInfo}>
                            <Text style={styles.textRegular}>{formatDate(quote.issuedAt)}</Text>
                            <Text style={styles.textLabel}>NUMÉRO DE DEVIS</Text>
                            <Text style={styles.infoValue}>#{safeText(quote.reference).replace('D-', '')}</Text>
                        </View>
                    </View>

                    {/* Table */}
                    <View style={styles.tableContainer}>
                        {/* Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.colService, styles.tableHeaderCell]}>SERVICE</Text>
                            <Text style={[styles.colMonth, styles.tableHeaderCell]}>{safeText(quantityLabel).toUpperCase()}</Text>
                            <Text style={[styles.colPrice, styles.tableHeaderCell]}>PRIX</Text>
                            <Text style={[styles.colTotal, styles.tableHeaderCell]}>TOTAL</Text>
                        </View>

                        {/* Rows */}
                        {items.map((item: any, index: number) => (
                            <View key={index} style={styles.row}>
                                {/* Service Description Block */}
                                <View style={styles.colService}>
                                    <View style={{ backgroundColor: '#F9FAFB', padding: 10, borderRadius: 4 }}>
                                        <Text style={styles.itemTitle}>{safeText(item.title)}</Text>
                                        <Text style={styles.itemDesc}>
                                            {safeText(item.description)}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={[styles.colMonth, styles.cellText]}>{safeText(item.quantity)}</Text>
                                <Text style={[styles.colPrice, styles.cellText]}>{formatCurrency(safeNumber(item.unitPrice))}</Text>
                                <Text style={[styles.colTotal, styles.cellText]}>{formatCurrency(safeNumber(item.total))}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Bottom */}
                    <View style={styles.bottomSection}>
                        <View style={styles.billedTo}>
                            <Text style={[styles.textLabel, { marginBottom: 10 }]}>FACTURÉ À</Text>
                            <Text style={styles.textBold}>{safeText(quote.client?.name)}</Text>
                            {quote.client?.companyName && <Text style={styles.textRegular}>{safeText(quote.client.companyName)}</Text>}
                            {quote.client?.address && <Text style={styles.textRegular}>{safeText(quote.client.address)}</Text>}
                            <Text style={styles.textRegular}>{safeText(quote.client?.email)}</Text>
                            {quote.client?.phone && <Text style={styles.textRegular}>{safeText(quote.client.phone)}</Text>}
                            {quote.client?.siret && <Text style={styles.textRegular}>SIRET: {safeText(quote.client.siret)}</Text>}
                        </View>

                        <View style={styles.totals}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>TOTAL HT</Text>
                                <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
                            </View>

                            {/* DISCOUNT ROW */}
                            {safeNumber(quote.discount) > 0 && (
                                <View style={styles.totalRow}>
                                    <Text style={[styles.totalLabel, { color: '#059669' }]}>REDUCTION ({safeNumber(quote.discount)}%)</Text>
                                    <Text style={[styles.totalValue, { color: '#059669' }]}>
                                        - {formatCurrency(subtotal * (safeNumber(quote.discount) / 100))}
                                    </Text>
                                </View>
                            )}

                            {taxAmount > 0 && (
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>TVA ({taxRate}%)</Text>
                                    <Text style={styles.totalValue}>{formatCurrency(taxAmount)}</Text>
                                </View>
                            )}
                            <View style={styles.grandTotalRow}>
                                <Text style={styles.grandTotalLabel}>TOTAL</Text>
                                <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer Count */}
                <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
                    `${pageNumber}/${totalPages}`
                )} fixed />
            </Page>

            {/* PAGE 2: CONDITIONS (DYNAMIC) */}
            <Page size="A4" style={styles.page}>
                {/* Header Small */}
                <View style={{ height: 60, width: '100%', alignItems: 'flex-end', paddingRight: 40, paddingTop: 20 }}>
                    <Image src={logoNoirUrl} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                </View>

                <View style={[styles.contentContainer, { paddingTop: 0 }]}>
                    <Text style={styles.sectionTitle}>CONDITIONS GÉNÉRALES</Text>

                    {/* Dynamic Sections Iteration */}
                    {termSections.filter((s: any) => s.enabled).map((section: any, idx: number) => (
                        <View key={idx} style={{ marginBottom: 15 }} wrap={false}>
                            {/* Render Title if exists */}
                            {section.title ? <Text style={[styles.textBold, { fontSize: 9, marginBottom: 5 }]}>{section.title}</Text> : null}

                            {/* Render Content Lines */}
                            {section.content.split('\n').map((line: string, i: number) => {
                                const trimLine = line.trim();
                                const isBullet = trimLine.startsWith('•') || trimLine.startsWith('-') || trimLine.startsWith('◦');
                                return (
                                    <Text key={i} style={isBullet ? styles.bullet : styles.textP}>
                                        {line}
                                    </Text>
                                );
                            })}
                        </View>
                    ))}

                    {/* Extra Notes if any (Legacy field) */}
                    {quote.notes && (
                        <View style={{ marginBottom: 15 }}>
                            <Text style={[styles.textBold, { fontSize: 9, marginBottom: 5 }]}>Notes</Text>
                            <Text style={styles.textP}>{safeText(quote.notes)}</Text>
                        </View>
                    )}

                    {/* Signatures */}
                    <View style={styles.signatureContainer}>
                        <Text style={styles.signatureTitle}>SIGNATURE ET VALIDATION</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ width: '45%' }}>
                                <Text style={[styles.textLabel, { marginBottom: 10 }]}>SIGNATURE DU CLIENT :</Text>
                                <View style={{ height: 40, justifyContent: 'flex-end' }}>
                                    {quote.signature ? (
                                        <Image src={quote.signature} style={styles.signatureImage} />
                                    ) : (
                                        <Text style={{ fontSize: 8, color: '#ccc' }}>(En attente de signature)</Text>
                                    )}
                                </View>
                                <View style={{ borderBottomWidth: 1, borderColor: '#CCCCCC' }} />
                                {quote.signedAt && (
                                    <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>
                                        Signé le {new Date(quote.signedAt).toLocaleDateString()}
                                    </Text>
                                )}
                            </View>

                            <View style={{ width: '45%' }}>
                                <Text style={[styles.textLabel, { marginBottom: 10 }]}>SIGNATURE OBEM STUDIO :</Text>
                                <View style={{ height: 40 }}>
                                    {/* Signature Image */}
                                    <Image src={signatureUrl} style={styles.signatureImage} />
                                </View>
                                <View style={{ borderBottomWidth: 1, borderColor: '#CCCCCC' }} />
                                <Text style={{ fontSize: 8, color: '#999', marginTop: 2 }}>(Entreprise - Divin e-com)</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
                    `${pageNumber}/${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );
};

export default QuotePDF;
