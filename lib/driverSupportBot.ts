import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

export type DriverContext = {
    driverId: string;
    name: string;
    totalDeliveries: number;
    averageRating: number;
    currentStatus: 'ONLINE' | 'OFFLINE' | 'ON_DELIVERY';
    weeklyEarnings: number;
    accountAge: number; // days
    hasOpenDisputes?: boolean;
};

export type SupportMessage = {
    id: string;
    sender: 'BOT' | 'USER';
    content: string;
    timestamp: Date;
    escalationNeeded?: boolean;
    escalationReason?: string;
};

/**
 * Driver Support Bot
 * Handles common driver questions about earnings, payments, technical issues, and complaints
 */
export async function getDriverSupport(
    question: string,
    context: DriverContext
): Promise<SupportMessage> {
    if (!anthropic) {
        return {
            id: Date.now().toString(),
            sender: 'BOT',
            content: "I'm the Driver Support Bot. I can help answer questions about earnings, payments, and technical issues. Please check back when the system is fully configured.",
            timestamp: new Date(),
        };
    }

    const contextSummary = buildDriverContextSummary(context);
    const shouldEscalate = detectEscalationNeeded(question, context);

    const systemPrompt = `You are a helpful Driver Support Assistant for TrueServe.
You help drivers with:
- Earnings and payment questions (payout schedules, tax info, fees)
- Technical issues (app crashes, GPS problems, order tracking)
- Account and ratings (how ratings work, improvement tips)
- General questions about TrueServe policies

Be friendly, empathetic, and solution-focused. For complex issues, suggest escalation to support team.
Keep responses concise (2-3 sentences).`;

    const prompt = `
${systemPrompt}

Driver Context:
${contextSummary}

Driver Question: ${question}

${shouldEscalate ? "Warning This question might need escalation to human support." : ""}

Provide a helpful response that:
1. Directly addresses their concern
2. Provides actionable guidance when possible
3. Suggests human support escalation if needed (especially for disputes/complaints)
4. Maintains an encouraging, professional tone
`;

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 500,
            temperature: 0.7,
            messages: [
                {
                    role: "user",
                    content: prompt,
                }
            ]
        });

        const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

        return {
            id: Date.now().toString(),
            sender: 'BOT',
            content: responseText.trim(),
            timestamp: new Date(),
            escalationNeeded: shouldEscalate,
            escalationReason: shouldEscalate ? determineEscalationReason(question) : undefined,
        };
    } catch (error) {
        console.error("[Driver Support Bot] Error:", error);
        return {
            id: Date.now().toString(),
            sender: 'BOT',
            content: "I'm having trouble responding right now. A support agent will be with you shortly.",
            timestamp: new Date(),
            escalationNeeded: true,
            escalationReason: "Bot error - requires human support",
        };
    }
}

/**
 * Build context summary from driver data
 */
function buildDriverContextSummary(context: DriverContext): string {
    let summary = `- Driver: ${context.name}\n`;
    summary += `- Account Age: ${context.accountAge} days\n`;
    summary += `- Total Deliveries: ${context.totalDeliveries}\n`;
    summary += `- Rating: ${context.averageRating.toFixed(1)}/5.0\n`;
    summary += `- This Week's Earnings: $${context.weeklyEarnings}\n`;
    summary += `- Current Status: ${context.currentStatus}\n`;

    if (context.hasOpenDisputes) {
        summary += `- Warning Has Open Disputes\n`;
    }

    return summary;
}

/**
 * Detect if a question needs escalation to human support
 */
function detectEscalationNeeded(question: string, context: DriverContext): boolean {
    const escalationKeywords = [
        'dispute', 'complaint', 'unfair', 'scam', 'fraud', 'stolen', 'accident',
        'injury', 'damage', 'cancel', 'refund', 'payment issue', 'missing money',
        'account suspended', 'deactivated', 'terminated', 'urgent', 'emergency'
    ];

    const lowerQuestion = question.toLowerCase();
    const needsEscalation = escalationKeywords.some(keyword => lowerQuestion.includes(keyword));

    // Always escalate if driver has open disputes and question might be related
    if (context.hasOpenDisputes && (lowerQuestion.includes('dispute') || lowerQuestion.includes('issue'))) {
        return true;
    }

    return needsEscalation;
}

/**
 * Determine the reason for escalation
 */
function determineEscalationReason(question: string): string {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('dispute') || lowerQuestion.includes('complaint')) {
        return 'Dispute/Complaint - Requires human review';
    }
    if (lowerQuestion.includes('payment') || lowerQuestion.includes('refund')) {
        return 'Payment Issue - Specialist needed';
    }
    if (lowerQuestion.includes('accident') || lowerQuestion.includes('injury')) {
        return 'Safety/Incident - Immediate attention needed';
    }
    if (lowerQuestion.includes('account') || lowerQuestion.includes('suspended')) {
        return 'Account Status - Admin review needed';
    }

    return 'Complex Issue - Escalating to support team';
}

/**
 * Generate quick help tip for drivers
 */
export function generateDriverTip(context: DriverContext): string {
    if (context.averageRating < 4.0) {
        return "Rating Tip: Your rating is below 4.0. Focus on being professional, communicating with customers, and delivering orders on time to improve your rating.";
    }
    if (context.totalDeliveries < 10) {
        return "Launch Tip: New drivers get bonus pay for their first 10 deliveries! Complete these to unlock better earnings and access to peak hours.";
    }
    if (context.currentStatus === 'OFFLINE') {
        return "Phone Tip: Go online to start receiving delivery offers. You can set your availability preferences to work on your schedule.";
    }
    return "Cost Tip: High ratings lead to better trip offers and higher earnings. Keep providing great service!";
}

/**
 * Get common questions and answers for driver
 */
export const COMMON_DRIVER_QUESTIONS = [
    {
        question: "How do I get paid?",
        answer: "You earn money per delivery based on distance, time, and demand. Payouts are processed weekly via Stripe Direct. You can view detailed earnings in the Settlements tab.",
    },
    {
        question: "When is my payment scheduled?",
        answer: "Payouts happen every Tuesday for deliveries completed the previous week. You can check your settlement schedule in the Settlements tab.",
    },
    {
        question: "Why is my rating low?",
        answer: "Your star rating is the average of your latest customer reviews, with up to the most recent 100 reviews counted. Completion rate and on-time rate are tracked separately on the Reputation page, so improving delivery timing and communication still helps the overall picture customers see.",
    },
    {
        question: "How do I go online?",
        answer: "Open the app, tap your status indicator, and select 'Online'. You'll start receiving delivery offers immediately in your area.",
    },
    {
        question: "What if my order was rejected by the restaurant?",
        answer: "If a restaurant rejects your order, you'll still be paid the base delivery fee. The restaurant may be out of stock or experiencing issues. Contact support if you have concerns.",
    },
];
