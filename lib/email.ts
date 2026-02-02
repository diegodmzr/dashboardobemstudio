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

export const getBrandedEmailHtml = (content: string) => {
    return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 30px; padding-top: 20px;">
                <img src="https://dashboard.obemstudio.com/iconlogo.png" alt="Logo" style="width: 64px; height: 64px;">
            </div>
            <div style="background-color: #ffffff; border: 1px solid #eeeeee; border-radius: 20px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                ${content}
            </div>
            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #a0a0a0; padding-bottom: 20px;">
                <p style="margin-bottom: 4px;">&copy; ${new Date().getFullYear()} Obem Studio. Tous droits réservés.</p>
                <p style="margin-top: 0;">Créativité • Expertise • Passion</p>
            </div>
        </div>
    `;
};

export const sendEmail = async (to: string, subject: string, html: string, attachments?: any[]) => {
    try {
        const resend = getResend();
        console.log(`Attempting to send email to: ${to} with subject: ${subject}`);

        // Wrap content in branding if not already wrapped
        const finalHtml = html.includes('Obem Studio') && html.includes('iconlogo.png') ? html : getBrandedEmailHtml(html);

        const { data, error } = await resend.emails.send({
            from: 'Obem Studio <noreply@obemstudio.com>',
            to: [to],
            subject: subject,
            html: finalHtml,
            attachments: attachments
        });

        if (error) {
            console.error("Resend Error Detail:", error);
            return { error };
        }

        console.log("Email sent successfully:", data);
        return { data };
    } catch (error) {
        console.error("Email sending exception:", error);
        return { error };
    }
};
