"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { auth } from "@/auth";
import sharp from "sharp";

export async function uploadImageAction(
  formData: FormData,
  bucket: string,
  folder: string
) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  // 1. Validasi Input Dasar
  if (!bucket || !folder) {
    return { success: false, error: "Konfigurasi storage (bucket/folder) tidak valid" };
  }

  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return { success: false, error: "File tidak ditemukan atau kosong" };
  }

  // 2. Validasi Tipe File (Hanya Gambar)
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Hanya file gambar yang diizinkan (JPG, PNG, WebP, dll)" };
  }

  // 3. Validasi Ukuran (Maksimal 2MB)
  const MAX_SIZE = 2 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return { success: false, error: `Ukuran gambar (${sizeInMB}MB) melebihi batas maksimal 2MB` };
  }

  // Generate nama file dengan ekstensi .webp
  const baseName = file.name.replace(/[^\w.-]+/g, "-").split('.')[0];
  const fileName = `${folder}/${Date.now()}-${baseName}.webp`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // 4. Optimasi Gambar dengan Sharp
    let processedBuffer: Buffer;
    try {
      processedBuffer = await sharp(inputBuffer)
        .resize(1200, 1200, {
          fit: "inside",
          withoutEnlargement: true
        })
        .webp({ quality: 85 })
        .toBuffer();
    } catch (sharpError) {
      console.error("SHARP_PROCESSING_ERROR:", sharpError);
      return { success: false, error: "Gagal memproses gambar. File gambar mungkin rusak atau tidak didukung." };
    }

    const { error: storageError } = await supabaseServer.storage
      .from(bucket)
      .upload(fileName, processedBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (storageError) {
      console.error("SUPABASE_STORAGE_ERROR:", storageError);
      return { success: false, error: `Gagal menyimpan ke storage: ${storageError.message}` };
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseServer.storage
       .from(bucket)
       .getPublicUrl(fileName);

    return { success: true, path: fileName, url: publicUrl };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("UPLOAD_ACTION_CRASH:", error);
    return { success: false, error: `Terjadi kesalahan internal server: ${error.message || "Unknown error"}` };
  }
}
