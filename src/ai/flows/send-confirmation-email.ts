'use server';

/**
 * @fileOverview A flow to generate and send a tournament confirmation email.
 * - sendConfirmationEmail - A function that handles the email sending process.
 * - SendConfirmationEmailInput - The input type for the function.
 * - SendConfirmationEmailOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendEmail } from '@/lib/email';

const SendConfirmationEmailInputSchema = z.object({
  username: z.string().describe('The name of the user to email.'),
  email: z.string().email().describe('The email address of the user.'),
  tournamentTitle: z.string().describe('The title of the tournament.'),
  tournamentDate: z.string().describe('The date of the tournament.'),
  tournamentTime: z.string().describe('The time of the tournament.'),
  entryFee: z.number().describe('The entry fee paid by the user.'),
  prizePool: z.number().describe('The total prize pool of the tournament.'),
});
export type SendConfirmationEmailInput = z.infer<typeof SendConfirmationEmailInputSchema>;

const SendConfirmationEmailOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendConfirmationEmailOutput = z.infer<typeof SendConfirmationEmailOutputSchema>;

export async function sendConfirmationEmail(input: SendConfirmationEmailInput): Promise<SendConfirmationEmailOutput> {
  return sendConfirmationEmailFlow(input);
}

const prompt = ai.definePrompt({
    name: 'confirmationEmailPrompt',
    input: { schema: SendConfirmationEmailInputSchema },
    output: { format: 'text' }, // We want HTML text back
    prompt: `
        You are an email generation assistant for a gaming platform called Arena Clash.
        Generate a friendly and exciting confirmation email in valid, professional HTML format.
        Do not use external stylesheets or images. Use inline CSS for styling.
        
        Use the following information to populate the email content:
        - Username: {{{username}}}
        - Tournament Title: {{{tournamentTitle}}}
        - Tournament Date: {{{tournamentDate}}}
        - Tournament Time: {{{tournamentTime}}}
        - Entry Fee Paid: ₹{{{entryFee}}}
        - Total Prize Pool: ₹{{{prizePool}}}
        
        Here is the text content for the email:

        Hi {{username}},

        Congratulations! Your registration for the "{{tournamentTitle}}" tournament is confirmed.

        **Match Details:**
        - **Date:** {{tournamentDate}}
        - **Time:** {{tournamentTime}}
        - **Entry Fee Paid:** ₹{{entryFee}}

        We're excited to see you in the arena! The total prize pool is ₹{{prizePool}}.

        Good luck!

        The BattleBucks Team

        Respond with ONLY the full HTML document, including <html>, <head>, and <body> tags.
        Style it professionally. Use a main container with a light grey background (#f4f4f4). Center the content. Use a clean, sans-serif font like Arial or Helvetica.
    `,
});

const sendConfirmationEmailFlow = ai.defineFlow(
  {
    name: 'sendConfirmationEmailFlow',
    inputSchema: SendConfirmationEmailInputSchema,
    outputSchema: SendConfirmationEmailOutputSchema,
  },
  async (input) => {
    const { output: htmlBody } = await prompt(input);

    if (!htmlBody) {
        return { success: false, message: 'Failed to generate email content.' };
    }

    const emailResult = await sendEmail({
        to: input.email,
        subject: `Your Registration for "${input.tournamentTitle}" is Confirmed!`,
        html: htmlBody,
    });

    return emailResult;
  }
);
