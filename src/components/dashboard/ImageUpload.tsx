"use client";

import { useState, useRef, useEffect } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { uploadImageAction } from "@/app/actions/uploadActions";
import { getImageUrl } from "@/lib/supabase";
import Image from "next/image";

interface ImageUploadProps {
  label: string;
  hint: string;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  bucket?: string;
  folder?: string;
  isPrivate?: boolean;
  maxImages?: number;
}

export function ImageUpload({
  label,
  hint,
  value,
  onChange,
  bucket = "agrilink-uploads",
  folder = "general",
  isPrivate = false,
  maxImages = 1,
}: ImageUploadProps) {
  const isMultiple = maxImages > 1;
  const values = Array.isArray(value) ? value : value ? [value] : [];
  
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync previews with values
  useEffect(() => {
    const resolveImages = async () => {
      const urls = await Promise.all(
        values.map(async (val) => {
          if (val.startsWith("http")) return val;
          return await getImageUrl(val, bucket, isPrivate);
        })
      );
      setPreviews(urls.filter((url): url is string => url !== null));
    };
    resolveImages();
  }, [value, bucket, isPrivate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Client-side validation (2MB)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert(`Ukuran file (${(file.size / (1024 * 1024)).toFixed(2)}MB) melebihi batas 2MB.`);
      return;
    }

    if (values.length >= maxImages) {
      alert(`Maksimal ${maxImages} foto.`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const result = await uploadImageAction(formData, bucket, folder);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const newUrl = isPrivate ? (result.path || "") : (result.url || result.path || "");
      
      if (isMultiple) {
        onChange([...values, newUrl]);
      } else {
        onChange(newUrl);
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Upload failed", err);
      alert(`Gagal mengunggah gambar: ${err.message || "Silakan coba lagi"}`);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    if (isMultiple) {
      onChange(newValues);
    } else {
      onChange("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-900">{label}</label>
        <p className="text-xs text-gray-400 font-medium mt-0.5">{hint}</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {previews.map((src, idx) => (
          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group">
            <Image 
              src={src} 
              alt={`Preview ${idx + 1}`} 
              fill 
              className="object-cover transition-transform group-hover:scale-105"
            />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {values.length < maxImages && (
          <button
            type="button"
            onClick={() => !isUploading && inputRef.current?.click()}
            disabled={isUploading}
            className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all
              ${isUploading ? 'bg-gray-50 border-gray-200 cursor-wait' : 'border-gray-200 bg-gray-50/50 hover:bg-emerald-50 hover:border-emerald-300 group'}
            `}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            ) : (
              <>
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tambah</span>
              </>
            )}
          </button>
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
