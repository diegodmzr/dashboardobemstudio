import { Resend } from 'resend';
let resendInstance: Resend | null = null;

const getResend = () => {
    if (!resendInstance) {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not defined");
        }
        resendInstance = new Resend(process.env.RESEND_API_KEY);
    }
    return resendInstance;
};

export const sendEmail = async (to: string, subject: string, html: string, attachments?: any[]) => {
    try {
        const resend = getResend();
        console.log(`Attempting to send email to: ${to} with subject: ${subject}`);
        const { data, error } = await resend.emails.send({
            from: 'Obem Studio <noreply@obemstudio.com>',
            to: [to],
            subject: subject,
            html: html,
            attachments: attachments
        });

        if (error) {
            console.error("Resend Error Detail:", error);
            return null;
        }

        console.log("Email sent successfully:", data);
        return data;
    } catch (error) {
        console.error("Email sending exception:", error);
        return null;
    }
};
