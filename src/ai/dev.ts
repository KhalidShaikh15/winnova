import { config } from 'dotenv';
config();

import '@/ai/flows/moderate-user-uploads.ts';
import '@/ai/flows/send-confirmation-email.ts';
