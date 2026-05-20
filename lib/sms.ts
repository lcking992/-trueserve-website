import dotenv from 'dotenv';
import * as Sentry from '@sentry/nextjs';
import { logger } from './logger';
import { normalizePhoneNumber } from './phoneUtils';

dotenv.config({ path: '.env.local' });

const vonageApiKey = process.env.VONAGE_API_KEY || process.env.NEXMO_API_KEY;
const vonageApiSecret = process.env.VONAGE_API_SECRET || process.env.NEXMO_API_SECRET;
const vonageFrom = process.env.VONAGE_FROM || process.env.VONAGE_FROM_NUMBER;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

function hasTwilioConfig() {
    return !!(twilioAccountSid && twilioAuthToken && twilioFrom);
}

function hasVonageConfig() {
    return !!(vonageApiKey && vonageApiSecret && vonageFrom);
}

function isVonageAuthError(message: string) {
    return /bad credentials|authentication failed|unauthorized/i.test(message);
}

export async function sendSMS(to: string, body: string) {
    const normalizedTo = normalizePhoneNumber(to);
    const normalizedVonageTo = normalizedTo.replace(/^\+/, '');

    const sendViaTwilio = async () => {
        if (!hasTwilioConfig()) {
            return { success: false, error: 'Twilio not configured' };
        }

        try {
            logger.info({ to: normalizedTo }, '[SMS] Sending via Twilio fallback');

            const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
            const params = new URLSearchParams({
                From: twilioFrom!,
                To: normalizedTo,
                Body: body
            });

            const res = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString(),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || `Twilio HTTP ${res.status}`);
            }

            return { success: true, sid: data?.sid || data?.message_sid };
        } catch (error: any) {
            logger.error({ err: error, to: normalizedTo }, '[SMS] Error sending via Twilio fallback');
            Sentry.captureException(error, {
                tags: { service: 'Twilio' },
                extra: { to: normalizedTo }
            });
            return { success: false, error: error.message };
        }
    };

    if (!hasVonageConfig()) {
        logger.warn({ to: normalizedTo }, '[SMS] Vonage not configured. Falling back to Twilio if available.');
        return sendViaTwilio();
    }

    try {
        logger.info({ to: normalizedVonageTo }, '[SMS] Sending via Vonage Messages API');

        const auth = Buffer.from(`${vonageApiKey}:${vonageApiSecret}`).toString('base64');
        const res = await fetch('https://api.nexmo.com/v1/messages', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                to: normalizedVonageTo,
                from: vonageFrom!.replace(/^\+/, ''),
                channel: 'sms',
                message_type: 'text',
                text: body,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            const errText = data?.detail || data?.title || data?.message || `Vonage HTTP ${res.status}`;
            throw new Error(errText);
        }

        return { success: true, sid: data?.message_uuid || data?.messageId };
    } catch (error: any) {
        logger.error({ err: error, to: normalizedVonageTo }, '[SMS] Error sending via Vonage');
        Sentry.captureException(error, {
            tags: { service: 'Vonage' },
            extra: { to: normalizedVonageTo }
        });

        if (isVonageAuthError(error?.message || '')) {
            logger.warn({ to: normalizedTo }, '[SMS] Vonage auth failed; falling back to Twilio');
            return sendViaTwilio();
        }

        if (hasTwilioConfig()) {
            logger.warn({ to: normalizedTo }, '[SMS] Vonage failed; falling back to Twilio');
            return sendViaTwilio();
        }

        return { success: false, error: error.message };
    }
}
