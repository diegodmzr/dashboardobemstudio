
const { Resend } = require('resend');

// Hardcoded for test only
const resend = new Resend("re_fxAQU3Wd_GpmmtisAHiUWpPuhREWjGBh3");

async function testEmail() {
    try {
        console.log("Attempting to send test email to an external address...");
        const { data, error } = await resend.emails.send({
            from: 'Obem Studio <noreply@obemstudio.com>',
            to: ['diegodmzr@gmail.com'], // External address
            subject: 'Test Email Resend External',
            html: '<p>Ceci est un test de Resend avec le domaine obemstudio.com envoyé à une adresse externe.</p>'
        });

        if (error) {
            console.error("Resend Error Detail:", JSON.stringify(error, null, 2));
        } else {
            console.log("Email sent successfully:", data);
        }
    } catch (err) {
        console.error("Unexpected Error:", err);
    }
}

testEmail();
