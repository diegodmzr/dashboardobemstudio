import { Resend } from 'resend';

const resend = new Resend('re_123456789'); // Placeholder API Key

export const sendEmail = async (to: string, subject: string, html: string, attachments?: any[]) => {
    try {
        const data = await resend.emails.send({
            from: 'Obem Studio <onboarding@resend.dev>', // Update this with your verified domain
            to: [to],
            subject: subject,
            html: html,
            attachments: attachments
        });

        console.log("Email sent:", data);
        return data;
    } catch (error) {
        console.error("Email sending failed:", error);
        return null;
    }
};
