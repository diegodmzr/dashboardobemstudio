import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Open Sans',
    src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf'
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Open Sans'
    },
    header: {
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 6
    },
    subtitle: {
        fontSize: 10,
        color: '#666'
    },
    section: {
        marginTop: 20
    },
    fieldRow: {
        marginBottom: 15
    },
    label: {
        fontSize: 10,
        color: '#888',
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    value: {
        fontSize: 12,
        color: '#222',
        lineHeight: 1.4
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 10,
        textAlign: 'center',
        fontSize: 8,
        color: '#AAA'
    }
});

export const SubmissionPDF = ({ submission, formTitle }: { submission: any, formTitle: string }) => {
    let data = {};
    try {
        data = JSON.parse(submission.content);
    } catch (e) {
        data = { error: "Données invalides" };
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>{formTitle}</Text>
                    <Text style={styles.subtitle}>
                        Formulaire soumis le {new Date(submission.createdAt).toLocaleDateString()}
                        {submission.user ? ` par ${submission.user.name}` : ""}
                    </Text>
                    <Text style={styles.subtitle}>Référence: {submission.id}</Text>
                </View>

                <View style={styles.section}>
                    {Object.entries(data).map(([key, val]: [string, any]) => (
                        <View key={key} style={styles.fieldRow}>
                            <Text style={styles.label}>{key}</Text>
                            <Text style={styles.value}>{val ? String(val) : "-"}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text>Généré par Dashboard OBEM Studio</Text>
                </View>
            </Page>
        </Document>
    );
};
