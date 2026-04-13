"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { auth } from "@/auth";

export async function uploadImageAction(
  formData: FormData,
  bucket: string,
  folder: string
): Promise<{ success: true; path: string; url: string } | { success: false; error: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  if (!bucket || !folder) {
    return { success: false, error: "Konfigurasi storage tidak valid" };
  }

  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return { success: false, error: "File tidak ditemukan atau kosong" };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Hanya file gambar yang diizinkan (JPG, PNG, WebP, dll)" };
  }

  // Max 2MB (untuk performa)
  const MAX_SIZE = 2 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return { success: false, error: `Ukuran gambar (${sizeMB}MB) melebihi batas 2MB` };
  }

  // Extension handling
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = file.name.replace(/[^\w.-]+/g, "-").split(".")[0];
  const fileName = `${folder}/${Date.now()}-${safeName}.${ext}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const { error: storageError } = await supabaseServer.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (storageError) {
      console.error("SUPABASE_STORAGE_ERROR:", storageError.message);
      return { success: false, error: `Gagal menyimpan ke storage: ${storageError.message}` };
    }

    // Buat Signed URL di sisi server (Bypass RLS)
    const { data: signedData, error: signedError } = await supabaseServer.storage
      .from(bucket)
      .createSignedUrl(fileName, 3600); // Berlaku 1 jam untuk preview

    if (signedError) {
       console.error("SIGNED_URL_ERROR:", signedError.message);
       const { data: { publicUrl } } = supabaseServer.storage.from(bucket).getPublicUrl(fileName);
       return { success: true, path: fileName, url: publicUrl };
    }
      
    console.log("Upload & Signing berhasil. Path:", fileName);
    return { success: true, path: fileName, url: signedData.signedUrl };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("UPLOAD_ACTION_CRASH:", error.message);
    return { success: false, error: `Server error: ${error.message}` };
  }
}
