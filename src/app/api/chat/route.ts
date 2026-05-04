import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ProductCategory } from '@prisma/client';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const model = google('gemini-1.5-flash');

  const result = streamText({
    model,
    messages,
    system: `Anda adalah AgriConsult, asisten cerdas dan ramah dari platform AgriLink.
    Tugas Anda adalah membantu petani, pembeli, dan penjual dalam bertransaksi dan berkonsultasi mengenai pertanian berkelanjutan.
    Gunakan gaya bahasa yang profesional, inklusif, dan santun. 
    Selalu prioritaskan keamanan dan keberlanjutan lingkungan.
    Anda memiliki akses ke database produk dan toko melalui alat (tools) yang tersedia.`,
    tools: {
      searchProducts: {
        description: 'Mencari daftar produk berdasarkan nama atau kategori.',
        inputSchema: z.object({
          query: z.string().describe('Nama produk atau kata kunci pencarian'),
          category: z.nativeEnum(ProductCategory).optional().describe('Kategori produk'),
        }),
        execute: async ({ query, category }: { query: string; category?: ProductCategory }) => {
          const products = await prisma.product.findMany({
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
          return products;
        },
      },
      getProductDetail: {
        description: 'Mendapatkan informasi mendalam tentang satu produk spesifik.',
        inputSchema: z.object({
          productId: z.string().describe('ID unik produk'),
        }),
        execute: async ({ productId }: { productId: string }) => {
          const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
              farmer: {
                select: { name: true }
              }
            }
          });
          return product;
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
          const latDiff = radiusKm / 111;
          const lngDiff = radiusKm / (111 * Math.cos(lat * (Math.PI / 180)));

          const products = await prisma.product.findMany({
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
          return products;
        },
      },
    },
  });

  return result.toTextStreamResponse();
}
