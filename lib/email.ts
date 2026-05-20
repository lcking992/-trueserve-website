

import nodemailer from 'nodemailer';
import * as Sentry from '@sentry/nextjs';
import { logger } from './logger';

async function sendViaResend(to: string, subject: string, htmlBody: string, attachments?: any[]) {
    if (!process.env.RESEND_API_KEY) {
        return { error: true, message: "RESEND_API_KEY is not configured." };
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SES_FROM_EMAIL || 'TrueServe <onboarding@trueserve.delivery>';
    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: fromEmail,
            to,
            subject,
            html: htmlBody,
            attachments: attachments?.map((att) => ({
                filename: att.filename,
                content: Buffer.isBuffer(att.content)
                    ? att.content.toString("base64")
                    : Buffer.from(att.content).toString("base64"),
            })),
        }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        return { error: true, message: data?.message || `Resend HTTP ${response.status}` };
    }

    return { success: true, data };
}

function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SES_SMTP_HOST || 'email-smtp.us-east-1.amazonaws.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SES_SMTP_USER,
            pass: process.env.SES_SMTP_PASS,
        },
    });
}

export async function sendEmail(to: string, subject: string, htmlBody: string, attachments?: any[]) {
    // Fallback if no SMTP credentials are set
    if (!process.env.SES_SMTP_USER || !process.env.SES_SMTP_PASS) {
        const resendResult = await sendViaResend(to, subject, htmlBody, attachments);
        if ((resendResult as any).success) return resendResult;

        logger.warn("Warning [MOCK EMAIL] AWS SES SMTP and Resend credentials missing or failed.");
        logger.info({ to, subject, attachments: attachments ? attachments.length : 0, resendResult }, '[MOCK EMAIL] details');
        return { success: true, mocked: true, resendResult };
    }

    try {
        const { isStaffEmail } = await import('./admin-config');
        const isProd = process.env.NODE_ENV === 'production' && (process.env.NEXT_PUBLIC_APP_URL?.includes('trueserve.delivery') || process.env.NEXT_PUBLIC_APP_URL?.includes('trueservedelivery.com'));
        const isWhitelisted = isStaffEmail(to);
        const isOnboarding = subject.includes("Driver") || subject.includes("Merchant") || subject.includes("Welcome") || subject.includes("Application");
        
        // In Production, for whitelisted staff, or for onboarding flows, send to the actual recipient. 
        // Otherwise, redirect to dev inbox for testing to avoid spamming real users.
        const actualTo = (isProd || isWhitelisted || isOnboarding) ? to : 'lcking992@gmail.com';
        const actualSubject = isProd ? subject : `[DEV] ${subject}`;

        const fromEmail = process.env.SES_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'TrueServe <onboarding@trueserve.delivery>';
        const transporter = createTransporter();
        
        const mailOptions = {
            from: fromEmail,
            to: actualTo,
            subject: actualSubject,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .container { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0A; border-radius: 12px; overflow: hidden; color: #FFFFFF; }
                    .header { background-color: #000000; padding: 40px 20px; text-align: center; border-bottom: 1px solid #1A1A1A; }
                    .content { padding: 40px 30px; line-height: 1.6; color: #E5E5E5; font-size: 16px; }
                    .footer { text-align: center; padding: 30px; font-size: 12px; color: #666; background-color: #050505; border-top: 1px solid #1A1A1A; }
                    .button { display: inline-block; padding: 14px 28px; background-color: #10B981; color: #000000; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
                    .accent { color: #10B981; font-weight: bold; }
                    h1 { font-size: 24px; color: #FFFFFF; margin-bottom: 24px; font-weight: 700; letter-spacing: -0.02em; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="https://raw.githubusercontent.com/lcking992/-trueserve-website/main/public/logo.png" alt="TrueServe Logo" style="height: 48px;" />
                    </div>
                    <div class="content">
                        ${htmlBody.replace(/\n/g, '<br>')}
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} TrueServe | Premium Carrier Logisitics</p>
                        <p style="margin-top: 10px; font-size: 10px;">North Carolina & East Coast Operations | Powered by TrueServe Tech</p>
                    </div>
                </div>
            </body>
            </html>
            `,
            attachments: attachments?.map(att => ({
                filename: att.filename,
                content: att.content,
                contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }))
        };

        const info = await transporter.sendMail(mailOptions);

        return { success: true, data: info };
    } catch (e: any) {
        logger.error({ err: e, to, subject }, "AWS SES SMTP Service Full Error");
        Sentry.captureException(e, {
            tags: { service: 'AWS SES SMTP' },
            extra: { to, subject }
        });

        const resendResult = await sendViaResend(to, subject, htmlBody, attachments);
        if ((resendResult as any).success) return resendResult;

        return { error: true, message: e.message };
    }
}
