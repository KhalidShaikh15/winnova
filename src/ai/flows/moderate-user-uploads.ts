// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Content moderation AI agent for user uploads.
 *
 * - moderateUserUpload - A function that moderates user uploads.
 * - ModerateUserUploadInput - The input type for the moderateUserUpload function.
 * - ModerateUserUploadOutput - The return type for the moderateUserUpload function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateUserUploadInputSchema = z.object({
  uploadDataUri: z
    .string()
    .describe(
      "A user uploaded file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ModerateUserUploadInput = z.infer<typeof ModerateUserUploadInputSchema>;

const ModerateUserUploadOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the upload is safe for the platform.'),
  reason: z.string().describe('The reason the upload was flagged, if applicable.'),
});
export type ModerateUserUploadOutput = z.infer<typeof ModerateUserUploadOutputSchema>;

export async function moderateUserUpload(input: ModerateUserUploadInput): Promise<ModerateUserUploadOutput> {
  return moderateUserUploadFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateUserUploadPrompt',
  input: {schema: ModerateUserUploadInputSchema},
  output: {schema: ModerateUserUploadOutputSchema},
  prompt: `You are an AI content moderator for a gaming platform.

You are responsible for determining whether user-uploaded content is appropriate for the platform.

Consider the following:
- Is the content sexually explicit or suggestive?
- Does the content promote violence, hatred, or discrimination?
- Does the content violate any laws or regulations?
- Does the content contain any personal information?

Based on these guidelines, analyze the following user upload and determine if it is safe for the platform.

Upload: {{media url=uploadDataUri}}

Respond with JSON. If it is not safe, explain why in the reason field.
`,
});

const moderateUserUploadFlow = ai.defineFlow(
  {
    name: 'moderateUserUploadFlow',
    inputSchema: ModerateUserUploadInputSchema,
    outputSchema: ModerateUserUploadOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
