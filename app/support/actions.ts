"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Anthropic from '@anthropic-ai/sdk';
import { createJiraIssue } from "@/lib/jira";
import { revalidatePath } from "next/cache";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

const SYSTEM_PROMPT = `
You are TrueServe Help, a calm support guide for a local food delivery platform.
You are talking to a user who may be a Customer, Driver, or Merchant.
Be helpful, concise, plain-spoken, and never salesy. Do not mention that you are AI unless the user asks directly.
If the user speaks a language other than English, reply natively in their language.

### KNOWLEDGE BASE & OPERATIONAL PROTOCOLS:
1. **Customer Ordering**:
   - Customers can start ordering from the homepage or restaurant pages.
   - Order help includes ETA questions, missing items, delivery notes, rewards, gift orders, and address/dropoff issues.
   - If a customer needs account-specific help, ask them to sign in or provide their order number to a human support agent.
1. **Merchant Onboarding**:
   - Signup: trueservedelivery.com/merchant-signup
   - POS: Toast/Clover/Square integration via Dashboard -> Settings.
   - Payouts: Requires Stripe Express onboarding (Bank info + Tax ID).
2. **Driver Enrollment**:
   - Apply at /drive.
   - Requires valid license (18+), vehicle/bike insurance, and background check.
   - Payouts via Stripe Connect.
3. **Platform Monitoring**:
   - Admin Analytics tracks Acceptance Rate (target >85%) and CSAT.
   - Every action is logged for forensic review in the 'Audit Registry'.
4. **Emergency Protocols**:
   - Use 'Emergency Banner' for delays.
   - System failure: Transfer to human agent immediately.

CRITICAL RULE:
If the user asks to speak to a human, an agent, a representative, or seems extremely frustrated or mentions a severe app issue/crash, you must output exactly this JSON object instead of a normal message:
{"handoff_required": true, "summary": "A brief 2-sentence summary of their problem in English"}

If you are just answering normally, reply with normal text (no JSON).
Keep normal answers under 90 words unless the user asks for detail.
`;

export async function sendMessageToSupport(chatId: string | null, messageContent: string, role: string = 'DRIVER') {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("You must be logged in to access support.");
        }

        let activeChatId = chatId;

        // 1. Ensure a chat exists
        if (!activeChatId) {
            const { data: newChat, error: chatError } = await supabaseAdmin
                .from('SupportChat')
                .insert({
                    userId: user.id,
                    userRole: role,
                    status: 'BOT_ACTIVE'
                })
                .select('id')
                .single();

            if (chatError || !newChat) {
                console.error("SupportChat creation error:", chatError);
                throw new Error("Failed to start support session. Database tables might not exist.");
            }
            activeChatId = newChat.id;
        }

        // 2. Fetch the chat to ensure it's still alive
        const { data: chatData } = await supabaseAdmin
            .from('SupportChat')
            .select('status')
            .eq('id', activeChatId)
            .single();

        if (!chatData) throw new Error("Chat not found.");

        // Prevent AI replies if human has taken over or it's resolved
        if (chatData.status !== 'BOT_ACTIVE') {
            // Just save the user message, don't trigger AI
            await supabaseAdmin.from('SupportMessage').insert({
                chatId: activeChatId,
                sender: 'USER',
                content: messageContent
            });
            revalidatePath('/support'); // Or wherever it is
            return { success: true, chatId: activeChatId, status: chatData.status };
        }

        // 3. Save User Message
        await supabaseAdmin.from('SupportMessage').insert({
            chatId: activeChatId,
            sender: 'USER',
            content: messageContent
        });

        // 4. Trigger Claude Brain
        if (!anthropic) {
            const fallbackMsg = "AI Support is down. Sending to a human agent immediately...";
            await createJiraIssue(`Support Handoff (API down)`, `User said: ${messageContent}`);
            await supabaseAdmin.from('SupportChat').update({ status: 'HUMAN_REQUIRED' }).eq('id', activeChatId);
            await supabaseAdmin.from('SupportMessage').insert({
                chatId: activeChatId,
                sender: 'BOT',
                content: fallbackMsg
            });
            return { success: true, chatId: activeChatId, reply: fallbackMsg, status: 'HUMAN_REQUIRED' };
        }

        // Fetch recent messages for context
        const { data: messageHistory } = await supabaseAdmin
            .from('SupportMessage')
            .select('sender, content')
            .eq('chatId', activeChatId)
            .order('createdAt', { ascending: true })
            .limit(10);

        const messagesForClaude: any[] = (messageHistory || []).map(msg => ({
            role: (msg.sender === 'USER' || msg.sender === 'HUMAN_AGENT') ? 'user' : 'assistant',
            content: msg.content
        }));

        // Send to Claude
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: messagesForClaude
        });

        const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

        // Check if Claude initiated a handoff
        let isHandoff = false;
        let botReply = responseText;
        let jiraSummary = "User requested human agent. Please review chat context.";

        try {
            // Claude sometimes wraps valid JSON with markdown, e.g. ```json ... ```
            const cleanMaybeJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            if (cleanMaybeJson.startsWith('{') && cleanMaybeJson.includes('"handoff_required"')) {
                const parsed = JSON.parse(cleanMaybeJson);
                if (parsed.handoff_required) {
                    isHandoff = true;
                    // Provide a nice localized (in English for now) response that we are escalating
                    botReply = "I understand. I am transferring this chat to the TrueServe Support Team right now. An agent will be with you shortly.";
                    jiraSummary = parsed.summary || jiraSummary;
                }
            }
        } catch (e) {
            // Ignore, it's just a normal text response
        }

        if (isHandoff) {
            // Update chat to HUMAN_REQUIRED
            // Create Jira Ticket
            const jiraDesc = `**AI Escalation Summary:**\n${jiraSummary}\n\n**Chat Link:** https://trueserve.com/admin/support?chatId=${activeChatId}`;
            const ticketKey = await createJiraIssue(`Urgent URGENT: Copilot Escalation - Support Chat`, jiraDesc);

            await supabaseAdmin
                .from('SupportChat')
                .update({ 
                    status: 'HUMAN_REQUIRED',
                    jiraTicketId: ticketKey || null
                })
                .eq('id', activeChatId);
        }

        // Save Bot Reply
        await supabaseAdmin.from('SupportMessage').insert({
            chatId: activeChatId,
            sender: 'BOT',
            content: botReply
        });

        // If it's a driver or merchant viewing this, revalidate. 
        // We'll rely on client-side polling or revalidation
        return { 
            success: true, 
            chatId: activeChatId, 
            reply: botReply, 
            status: isHandoff ? 'HUMAN_REQUIRED' : 'BOT_ACTIVE' 
        };

    } catch (error: any) {
        console.error("SendMessageToSupport Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getActiveSupportChat() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: "Not logged in" };

        const { data: chatData, error: chatError } = await supabaseAdmin
            .from('SupportChat')
            .select('*')
            .eq('userId', user.id)
            .neq('status', 'RESOLVED')
            .order('createdAt', { ascending: false })
            .limit(1)
            .single();

        if (chatError || !chatData) {
            return { success: true, chat: null, messages: [] };
        }

        const { data: messages } = await supabaseAdmin
            .from('SupportMessage')
            .select('*')
            .eq('chatId', chatData.id)
            .order('createdAt', { ascending: true });

        return { success: true, chat: chatData, messages: messages || [] };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
