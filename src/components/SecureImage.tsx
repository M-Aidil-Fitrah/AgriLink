"use client";

import { useEffect, useState } from "react";
import { getImageUrl } from "@/lib/supabase";
import Image, { ImageProps } from "next/image";
import { Loader2 } from "lucide-react";

interface SecureImageProps extends Omit<ImageProps, "src"> {
  src: string;
  bucket: string;
  isPrivate?: boolean;
}

export function SecureImage({ src, bucket, isPrivate = false, alt, ...props }: SecureImageProps) {
  const [url, setUrl] = useState<string | null>(src.startsWith("http") ? src : null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src || src.startsWith("http")) return;
    
    getImageUrl(src, bucket, isPrivate)
      .then((resolvedUrl) => {
        if (resolvedUrl) setUrl(resolvedUrl);
        else setError(true);
      })
      .catch(() => setError(true));
  }, [src, bucket, isPrivate]);

  if (error) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-red-400 uppercase tracking-widest text-center p-4">
        Gagal Memuat Gambar
      </div>
    );
  }

  if (!url) {
    return (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-gray-200 animate-spin" />
      </div>
    );
  }

  return <Image {...props} src={url} alt={alt} />;
}
