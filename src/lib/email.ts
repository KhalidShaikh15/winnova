import { Resend } from 'resend';

interface EmailParams {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export async function sendEmail({
    to,
    subject,
    html,
    from = 'Arena Clash <onboarding@resend.dev>' // Default 'from' address
}: EmailParams): Promise<{ success: boolean; message: string }> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn('RESEND_API_KEY is not set. Email sending is disabled.');
        // In a dev environment, we can log the email content instead of sending.
        console.log('--- Email Content (Not Sent) ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('------------------------------------');
        // Succeed without sending, so the UI flow isn't blocked.
        return { success: true, message: 'Email sending is skipped. RESEND_API_KEY not found.' };
    }

    try {
        const resend = new Resend(apiKey);
        const { data, error } = await resend.emails.send({
            from,
            to: [to],
            subject,
            html,
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, message: error.message };
        }

        return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: (error as Error).message };
    }
}
