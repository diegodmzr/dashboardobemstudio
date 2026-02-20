import {
    Document, Page, Text, View, StyleSheet, Font, Image
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
    accent: '#1a1a1a',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
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
        paddingBottom: 60,
        paddingHorizontal: 0,
    },
    // ── Hero header ──────────────────────────────────────────────────────────
    hero: {
        backgroundColor: C.black,
        paddingVertical: 40,
        paddingHorizontal: 56,
        marginBottom: 0,
    },
    heroLogo: {
        color: C.white,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 3,
        marginBottom: 24,
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: 700,
        color: C.white,
        lineHeight: 1.25,
        marginBottom: 10,
    },
    heroMeta: {
        fontSize: 9.5,
        color: '#9CA3AF',
        lineHeight: 1.6,
    },
    heroBadge: {
        marginTop: 16,
        backgroundColor: '#FFFFFF18',
        borderRadius: 6,
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignSelf: 'flex-start',
    },
    heroBadgeText: {
        fontSize: 8,
        color: C.white,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    // ── Body ─────────────────────────────────────────────────────────────────
    body: {
        paddingHorizontal: 48,
        paddingTop: 32,
    },
    // ── Phase section ────────────────────────────────────────────────────────
    phaseWrapper: {
        marginBottom: 28,
    },
    phaseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 10,
    },
    phaseBadge: {
        width: 22,
        height: 22,
        backgroundColor: C.black,
        borderRadius: 5,
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
        marginLeft: 10,
    },
    // ── Field rows ───────────────────────────────────────────────────────────
    card: {
        backgroundColor: C.white,
        borderRadius: 14,
        padding: 18,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: C.gray200,
    },
    fieldLabel: {
        fontSize: 7.5,
        fontWeight: 700,
        color: C.gray400,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 6,
    },
    fieldValue: {
        fontSize: 11.5,
        color: C.gray900,
        lineHeight: 1.5,
    },
    fieldValueEmpty: {
        fontSize: 11,
        color: C.gray400,
        fontStyle: 'italic',
    },
    // ── Two-column layout ────────────────────────────────────────────────────
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    halfCard: {
        flex: 1,
        backgroundColor: C.white,
        borderRadius: 14,
        padding: 18,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: C.gray200,
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
});

type Submission = {
    id: string;
    content: string;
    createdAt: string;
    form?: { title: string; fields?: string };
    user?: { name: string; email?: string };
};

// Try to parse phases structure from form fields
function parsePhasesFromForm(fieldsStr?: string) {
    if (!fieldsStr) return null;
    try {
        const parsed = JSON.parse(fieldsStr);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].fields) {
            return parsed as { id: string; title: string; fields: { id: string; label: string; type: string }[] }[];
        }
    } catch { }
    return null;
}

export const SubmissionPDF = ({
    submission,
    formTitle,
}: {
    submission: Submission;
    formTitle: string;
}) => {
    let data: Record<string, any> = {};
    try { data = JSON.parse(submission.content); } catch { data = {}; }

    const phases = parsePhasesFromForm(submission.form?.fields);

    // Helper: render a single key/value card
    const renderCard = (label: string, val: any, half = false) => {
        const displayVal = val === null || val === undefined || val === ''
            ? null
            : Array.isArray(val) ? val.join(', ') : String(val);

        const CardStyle = half ? styles.halfCard : styles.card;
        return (
            <View key={label} style={CardStyle}>
                <Text style={styles.fieldLabel}>{label}</Text>
                {displayVal
                    ? <Text style={styles.fieldValue}>{displayVal}</Text>
                    : <Text style={styles.fieldValueEmpty}>— Non renseigné —</Text>
                }
            </View>
        );
    };

    // Render fields grouped by phase
    const renderPhases = () => {
        if (phases) {
            return phases.map((phase, idx) => {
                const phaseFields = phase.fields.filter(f => data[f.label] !== undefined);
                if (phaseFields.length === 0) return null;

                // Pair short fields (text, email, number, date) into 2 columns
                const rendered: React.ReactNode[] = [];
                let i = 0;
                while (i < phaseFields.length) {
                    const field = phaseFields[i];
                    const isShort = ['text', 'email', 'number', 'date'].includes(field.type);
                    const nextField = phaseFields[i + 1];
                    const nextIsShort = nextField && ['text', 'email', 'number', 'date'].includes(nextField.type);

                    if (isShort && nextIsShort) {
                        rendered.push(
                            <View key={`row-${i}`} style={styles.row}>
                                {renderCard(field.label, data[field.label], true)}
                                {renderCard(nextField.label, data[nextField.label], true)}
                            </View>
                        );
                        i += 2;
                    } else {
                        rendered.push(renderCard(field.label, data[field.label]));
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
            });
        }

        // Fallback: flat list without phases
        const entries = Object.entries(data);
        const rendered: React.ReactNode[] = [];
        let i = 0;
        while (i < entries.length) {
            const [k, v] = entries[i];
            const nxt = entries[i + 1];
            const isShort = (val: any) => typeof val === 'string' && val.length < 60;

            if (isShort(v) && nxt && isShort(nxt[1])) {
                rendered.push(
                    <View key={`row-${i}`} style={styles.row}>
                        {renderCard(k, v, true)}
                        {renderCard(nxt[0], nxt[1], true)}
                    </View>
                );
                i += 2;
            } else {
                rendered.push(renderCard(k, v));
                i += 1;
            }
        }
        return rendered;
    };

    const dateStr = new Date(submission.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
    });
    const timeStr = new Date(submission.createdAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit',
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* ── HERO HEADER ── */}
                <View style={styles.hero}>
                    <Text style={styles.heroLogo}>Obem Studio</Text>
                    <Text style={styles.heroTitle}>{formTitle}</Text>
                    <Text style={styles.heroMeta}>
                        Soumis le {dateStr} à {timeStr}
                        {submission.user ? `  ·  ${submission.user.name}` : ''}
                        {submission.user?.email ? `  ·  ${submission.user.email}` : ''}
                    </Text>
                    <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeText}>Réponse #{submission.id.slice(0, 8).toUpperCase()}</Text>
                    </View>
                </View>

                {/* ── BODY ── */}
                <View style={styles.body}>
                    {renderPhases()}
                </View>

                {/* ── FOOTER ── */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>Obem Studio — Document confidentiel</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.footerText}>Réf. {submission.id.slice(0, 8).toUpperCase()}</Text>
                        <Text style={styles.footerDotSep}>•</Text>
                        <Text style={styles.footerText}>{dateStr}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
