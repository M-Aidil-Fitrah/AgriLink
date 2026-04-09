import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Mendapatkan URL Publik atau Signed URL untuk Storage
 */
export async function getImageUrl(path: string, bucket: string, isPrivate: boolean = false) {
  if (isPrivate) {
    // Generate signed URL valid for 1 hour
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600);
    
    if (error) return null;
    return data.signedUrl;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}

/**
 * Uploads a file to Supabase Storage
 */
export async function uploadImage(
  file: File | string,
  bucket: string,
  path: string
) {
  let fileBody: File | Blob;

  if (typeof file === "string" && file.startsWith("data:")) {
    const res = await fetch(file);
    fileBody = await res.blob();
  } else if (typeof file === "string") {
    throw new Error("Invalid file format");
  } else {
    fileBody = file;
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, fileBody, {
      upsert: true,
      contentType: "image/webp",
    });

  if (error) {
    console.error("Supabase storage upload error:", error);
    throw new Error("Gagal mengunggah gambar ke storage");
  }

  // Return the path instead of URL, so we can decide to use Signed or Public URL later
  return path;
}

