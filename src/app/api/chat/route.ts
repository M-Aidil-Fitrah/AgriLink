import { google } from '@ai-sdk/google';
import { type ModelMessage, streamText } from 'ai';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ProductCategory } from '@prisma/client';

export const maxDuration = 30;

// Define the incoming message structure from @ai-sdk/react v3
interface IncomingUIMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  parts: Array<{
    type: 'text';
    text: string;
  } | {
    type: 'tool-invocation' | 'tool-result';
    toolCallId: string;
    toolName: string;
    args?: unknown;
    result?: unknown;
  }>;
}

interface ChatRequest {
  messages: IncomingUIMessage[];
  location?: {
    lat: number;
    lng: number;
  };
}

export async function POST(req: Request) {
  try {
    const { messages, location }: ChatRequest = await req.json();

    const model = google('gemini-3-flash-preview');

    const systemPrompt = `Anda adalah AgriConsult, asisten cerdas dan ramah dari platform AgriLink.
      Tugas Anda adalah membantu petani, pembeli, dan penjual dalam bertransaksi dan berkonsultasi mengenai pertanian berkelanjutan.
      Gunakan gaya bahasa yang profesional, inklusif, dan santun. 
      Selalu prioritaskan keamanan dan keberlanjutan lingkungan.
      Anda memiliki akses ke database produk dan toko melalui alat (tools) yang tersedia.
      ${location ? `Lokasi pengguna saat ini: Latitude ${location.lat}, Longitude ${location.lng}.` : ''}`;

    // Convert UIMessages to ModelMessages (ai v6 naming convention)
    const modelMessages: ModelMessage[] = messages.map((m) => {
      const textContent = m.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('\n');

      return {
        role: m.role as 'user' | 'assistant' | 'system',
        content: textContent || ' ',
      } as ModelMessage;
    });

    const result = streamText({
      model,
      messages: modelMessages,
      system: systemPrompt,
      tools: {
        searchProducts: {
          description: 'Mencari daftar produk berdasarkan nama atau kategori.',
          inputSchema: z.object({
            query: z.string().describe('Nama produk atau kata kunci pencarian'),
            category: z.nativeEnum(ProductCategory).optional().describe('Kategori produk'),
          }),
          execute: async ({ query, category }: { query: string; category?: ProductCategory }) => {
            try {
              return await prisma.product.findMany({
                where: {
                  OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                  ],
                  ...(category && { productCategory: category }),
                  stock: { gt: 0 },
                },
                take: 5,
                select: {
                  id: true,
                  name: true,
                  price: true,
                  unit: true,
                  stock: true,
                  productCategory: true,
                }
              });
            } catch (err) {
              console.error("Database Tool Error (Search):", err instanceof Error ? err.message : String(err));
              return [];
            }
          },
        },
        getProductDetail: {
          description: 'Mendapatkan informasi mendalam tentang satu produk spesifik.',
          inputSchema: z.object({
            productId: z.string().describe('ID unik produk'),
          }),
          execute: async ({ productId }: { productId: string }) => {
            try {
              return await prisma.product.findUnique({
                where: { id: productId },
                include: {
                  farmer: { select: { name: true } }
                }
              });
            } catch (err) {
              console.error("Database Tool Error (Detail):", err instanceof Error ? err.message : String(err));
              return null;
            }
          },
        },
        findNearbyProducts: {
          description: 'Mencari produk berdasarkan lokasi latitude dan longitude.',
          inputSchema: z.object({
            lat: z.number().describe('Latitude user'),
            lng: z.number().describe('Longitude user'),
            radiusKm: z.number().default(10).describe('Radius pencarian dalam kilometer'),
          }),
          execute: async ({ lat, lng, radiusKm }: { lat: number; lng: number; radiusKm: number }) => {
            try {
              const latDiff = radiusKm / 111;
              const lngDiff = radiusKm / (111 * Math.cos(lat * (Math.PI / 180)));

              return await prisma.product.findMany({
                where: {
                  latitude: { gte: lat - latDiff, lte: lat + latDiff },
                  longitude: { gte: lng - lngDiff, lte: lng + lngDiff },
                  stock: { gt: 0 },
                },
                take: 5,
                include: {
                  farmer: { select: { name: true } }
                }
              });
            } catch (err) {
              console.error("Database Tool Error (Nearby):", err instanceof Error ? err.message : String(err));
              return [];
            }
          },
        },
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API Critical Error:", error instanceof Error ? error.message : String(error));
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
