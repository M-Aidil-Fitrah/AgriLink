import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Groq configuration using OpenAI provider (compatible)
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Primary model: Gemini 1.5 Flash (Fast, smart, generous free tier)
  // Fallback or alternative: Llama 3 on Groq
  const model = google('gemini-1.5-flash');

  const result = streamText({
    model,
    messages,
    system: `Anda adalah AgriConsult, asisten cerdas dan ramah dari platform AgriLink.
    Tugas Anda adalah membantu petani, pembeli, dan penjual dalam bertransaksi dan berkonsultasi mengenai pertanian berkelanjutan.
    Gunakan gaya bahasa yang profesional, inklusif, dan santun. 
    Jika pengguna bertanya hal teknis pertanian, berikan saran yang praktis dan aplikatif.
    Selalu prioritaskan keamanan dan keberlanjutan lingkungan.`,
  });

  return result.toTextStreamResponse();
}
