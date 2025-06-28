'use server';

import { moderateUserUpload } from '@/ai/flows/moderate-user-uploads';
import type { ModerateUserUploadOutput } from '@/ai/flows/moderate-user-uploads';

export async function moderateImage(
  uploadDataUri: string
): Promise<ModerateUserUploadOutput> {
  if (!uploadDataUri || !uploadDataUri.startsWith('data:image')) {
    return {
        isSafe: false,
        reason: 'Invalid image format provided.'
    };
  }

  try {
    const result = await moderateUserUpload({ uploadDataUri });
    return result;
  } catch (error) {
    console.error('Error moderating image:', error);
    // This could be a more specific error, but for the user, a generic one is fine.
    return {
      isSafe: false,
      reason: 'An unexpected error occurred during the moderation process.',
    };
  }
}
