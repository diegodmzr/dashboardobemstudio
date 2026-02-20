import {
    Document, Page, Text, View, StyleSheet, Font
} from '@react-pdf/renderer';

Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff', fontWeight: 700 },
    ]
});

const C = {
    black: '#0a0a0a',
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray700: '#374151',
    gray900: '#111827',
};

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Inter',
        backgroundColor: '#F8F6FB',
        paddingTop: 0,
        paddingBottom: 70,
        paddingHorizontal: 0,
    },
    // ── Hero header ──────────────────────────────────────────────────────────
    hero: {
        backgroundColor: C.black,
        paddingVertical: 36,
        paddingHorizontal: 56,
        marginBottom: 0,
    },
    heroTag: {
        color: '#9CA3AF',
        fontSize: 8.5,
        fontWeight: 700,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 700,
        color: C.white,
        lineHeight: 1.25,
        marginBottom: 8,
    },
    heroDescription: {
        fontSize: 10,
        color: '#9CA3AF',
        lineHeight: 1.6,
        maxWidth: 420,
    },
    heroInstructions: {
        marginTop: 20,
        backgroundColor: '#FFFFFF12',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    heroBullet: {
        color: '#6B7280',
        fontSize: 10,
        marginTop: 1,
    },
    heroInstructionText: {
        fontSize: 8.5,
        color: '#9CA3AF',
        lineHeight: 1.7,
        flex: 1,
    },
    // ── Body ─────────────────────────────────────────────────────────────────
    body: {
        paddingHorizontal: 48,
        paddingTop: 28,
    },
    // ── Phase section ────────────────────────────────────────────────────────
    phaseWrapper: {
        marginBottom: 24,
    },
    phaseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 10,
    },
    phaseBadge: {
        width: 24,
        height: 24,
        backgroundColor: C.black,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    phaseBadgeText: {
        color: C.white,
        fontSize: 9,
        fontWeight: 700,
    },
    phaseTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: C.gray900,
        flex: 1,
    },
    phaseLine: {
        height: 1,
        backgroundColor: C.gray200,
        flex: 1,
        marginLeft: 8,
    },
    // ── Fields ───────────────────────────────────────────────────────────────
    fieldCard: {
        backgroundColor: C.white,
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: C.gray200,
    },
    fieldCardHalf: {
        flex: 1,
        backgroundColor: C.white,
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: C.gray200,
    },
    fieldRow: {
        flexDirection: 'row',
        gap: 10,
    },
    fieldLabel: {
        fontSize: 7.5,
        fontWeight: 700,
        color: C.gray400,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 10,
    },
    requiredStar: {
        color: '#EF4444',
    },
    // ── Input line (text, email, number, date) ────────────────────────────
    inputLine: {
        height: 36,
        borderBottomWidth: 1.5,
        borderBottomColor: C.gray300,
        borderBottomStyle: 'dashed',
        width: '100%',
    },
    // ── Textarea (multiple lines) ─────────────────────────────────────────
    textareaBox: {
        borderWidth: 1.5,
        borderColor: C.gray300,
        borderStyle: 'dashed',
        borderRadius: 8,
        height: 72,
        width: '100%',
    },
    // ── Radio / Checkbox ──────────────────────────────────────────────────
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderWidth: 1.5,
        borderColor: C.gray200,
        borderRadius: 10,
        minWidth: '45%',
    },
    optionBox: {
        width: 16,
        height: 16,
        borderWidth: 1.5,
        borderColor: C.gray400,
        borderRadius: 3,         // square for checkbox
    },
    optionCircle: {
        width: 16,
        height: 16,
        borderWidth: 1.5,
        borderColor: C.gray400,
        borderRadius: 8,         // round for radio
    },
    optionText: {
        fontSize: 9.5,
        color: C.gray700,
    },
    // ── Select dropdown (drawn as a fake box) ─────────────────────────────
    selectBox: {
        borderWidth: 1.5,
        borderColor: C.gray300,
        borderStyle: 'dashed',
        borderRadius: 8,
        height: 36,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    selectPlaceholder: {
        fontSize: 9.5,
        color: C.gray400,
        flex: 1,
    },
    selectArrow: {
        fontSize: 9,
        color: C.gray400,
    },
    // ── Footer ───────────────────────────────────────────────────────────────
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 14,
        paddingHorizontal: 48,
        borderTopWidth: 1,
        borderTopColor: C.gray200,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: C.white,
    },
    footerText: {
        fontSize: 8,
        color: C.gray400,
    },
    footerDotSep: {
        fontSize: 8,
        color: C.gray200,
        marginHorizontal: 6,
    },
    // ── Signature block ───────────────────────────────────────────────────
    signatureBlock: {
        marginTop: 28,
        borderTopWidth: 1,
        borderTopColor: C.gray200,
        paddingTop: 20,
        flexDirection: 'row',
        gap: 28,
    },
    signatureField: {
        flex: 1,
    },
    signatureLabel: {
        fontSize: 7.5,
        fontWeight: 700,
        color: C.gray400,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 24,
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: C.gray300,
    },
});

type FormField = {
    id: string;
    label: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
};

type FormPhase = {
    id: string;
    title: string;
    fields: FormField[];
};

type BlankFormPDFProps = {
    title: string;
    description?: string;
    phases: FormPhase[];
    today?: string;
};

const renderFieldInput = (field: FormField) => {
    switch (field.type) {
        case 'textarea':
            return <View style={styles.textareaBox} />;

        case 'select':
            return (
                <View style={styles.selectBox}>
                    <Text style={styles.selectPlaceholder}>Sélectionnez une option</Text>
                    <Text style={styles.selectArrow}>▼</Text>
                </View>
            );

        case 'radio':
            return (
                <View style={styles.optionsGrid}>
                    {(field.options || []).map(opt => (
                        <View key={opt} style={styles.optionItem}>
                            <View style={styles.optionCircle} />
                            <Text style={styles.optionText}>{opt}</Text>
                        </View>
                    ))}
                </View>
            );

        case 'checkbox':
            return (
                <View style={styles.optionsGrid}>
                    {(field.options || []).map(opt => (
                        <View key={opt} style={styles.optionItem}>
                            <View style={styles.optionBox} />
                            <Text style={styles.optionText}>{opt}</Text>
                        </View>
                    ))}
                </View>
            );

        default:
            // text, email, number, date → single underline
            return <View style={styles.inputLine} />;
    }
};

const isShortFieldType = (type: string) =>
    ['text', 'email', 'number', 'date'].includes(type);

export const BlankFormPDF = ({ title, description, phases, today }: BlankFormPDFProps) => {
    const dateStr = today || new Date().toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* ── HERO ── */}
                <View style={styles.hero}>
                    <Text style={styles.heroTag}>Obem Studio · Formulaire à remplir</Text>
                    <Text style={styles.heroTitle}>{title}</Text>
                    {description ? (
                        <Text style={styles.heroDescription}>{description}</Text>
                    ) : null}
                    <View style={styles.heroInstructions}>
                        <Text style={styles.heroBullet}>→</Text>
                        <Text style={styles.heroInstructionText}>
                            Remplissez chaque champ avec soin. Les champs marqués d'un * sont obligatoires.
                            Une fois complété, remettez ce formulaire à votre interlocuteur Obem Studio.
                        </Text>
                    </View>
                </View>

                {/* ── BODY ── */}
                <View style={styles.body}>
                    {phases.map((phase, idx) => {
                        const rendered: React.ReactNode[] = [];
                        let i = 0;
                        while (i < phase.fields.length) {
                            const field = phase.fields[i];
                            const next = phase.fields[i + 1];
                            const isSh = isShortFieldType(field.type);
                            const nextSh = next && isShortFieldType(next.type);

                            if (isSh && nextSh) {
                                // pair → 2 columns
                                rendered.push(
                                    <View key={`row-${i}`} style={styles.fieldRow}>
                                        <View style={styles.fieldCardHalf}>
                                            <Text style={styles.fieldLabel}>
                                                {field.label}
                                                {field.required ? <Text style={styles.requiredStar}> *</Text> : null}
                                            </Text>
                                            {renderFieldInput(field)}
                                        </View>
                                        <View style={styles.fieldCardHalf}>
                                            <Text style={styles.fieldLabel}>
                                                {next.label}
                                                {next.required ? <Text style={styles.requiredStar}> *</Text> : null}
                                            </Text>
                                            {renderFieldInput(next)}
                                        </View>
                                    </View>
                                );
                                i += 2;
                            } else {
                                rendered.push(
                                    <View key={field.id} style={styles.fieldCard}>
                                        <Text style={styles.fieldLabel}>
                                            {field.label}
                                            {field.required ? <Text style={styles.requiredStar}> *</Text> : null}
                                        </Text>
                                        {renderFieldInput(field)}
                                    </View>
                                );
                                i += 1;
                            }
                        }

                        return (
                            <View key={phase.id} style={styles.phaseWrapper}>
                                <View style={styles.phaseHeader}>
                                    <View style={styles.phaseBadge}>
                                        <Text style={styles.phaseBadgeText}>{idx + 1}</Text>
                                    </View>
                                    <Text style={styles.phaseTitle}>{phase.title}</Text>
                                    <View style={styles.phaseLine} />
                                </View>
                                {rendered}
                            </View>
                        );
                    })}

                    {/* Signature block */}
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureField}>
                            <Text style={styles.signatureLabel}>Date</Text>
                            <View style={styles.signatureLine} />
                        </View>
                        <View style={styles.signatureField}>
                            <Text style={styles.signatureLabel}>Signature</Text>
                            <View style={styles.signatureLine} />
                        </View>
                        <View style={styles.signatureField}>
                            <Text style={styles.signatureLabel}>Lu et approuvé</Text>
                            <View style={styles.signatureLine} />
                        </View>
                    </View>
                </View>

                {/* ── FOOTER ── */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>Obem Studio — {title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.footerText}>Formulaire vierge</Text>
                        <Text style={styles.footerDotSep}>•</Text>
                        <Text style={styles.footerText}>{dateStr}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
