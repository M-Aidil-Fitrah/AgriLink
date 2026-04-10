"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImageAction } from "@/app/actions/uploadActions";
import { getImageUrl } from "@/lib/supabase";
import Image from "next/image";

interface ImageUploadProps {
  label: string;
  hint: string;
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  isPrivate?: boolean;
}

export function ImageUpload({
  label,
  hint,
  value,
  onChange,
  bucket = "agrilink-uploads",
  folder = "general",
  isPrivate = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to resolve preview if value (path/url) exists
  useEffect(() => {
    if (value) {
      if (value.startsWith("http")) {
        setPreview(value);
      } else {
        // Resolve path to URL
        getImageUrl(value, bucket, isPrivate).then(url => setPreview(url));
      }
    }
  }, [value, bucket, isPrivate]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const result = await uploadImageAction(formData, bucket, folder);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // If public, we can store full URL or just path. 
      if (isPrivate) {
        onChange(result.path || "");
      } else {
        onChange(result.url || result.path || "");
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Upload failed", err);
      alert(`Gagal mengunggah gambar: ${err.message || "Silakan coba lagi"}`);
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };


  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <p className="text-[10px] text-gray-400 font-medium">{hint}</p>
      
      <div 
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`relative aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden
          ${preview ? 'border-emerald-200 bg-emerald-50/10' : 'border-gray-200 bg-gray-50/50 hover:bg-emerald-50/30 hover:border-emerald-300'}
          ${isUploading ? 'opacity-70 cursor-wait' : ''}
        `}
      >
        {preview ? (
          <>
            <Image 
              src={preview} 
              alt="Preview" 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {!isUploading && (
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-500">Klik untuk Unggah</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-20">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            <span className="text-[10px] font-bold text-emerald-700 animate-pulse uppercase tracking-wider">Sedang Mengunggah...</span>
          </div>
        )}
      </div>

      <input 
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
