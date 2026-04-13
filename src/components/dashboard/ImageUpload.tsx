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

  // Sync previews with values (Hanya untuk foto yang SUDAH ada di DB/lama)
  useEffect(() => {
    const resolveImages = async () => {
      // Jika jumlah preview dan values sudah sama, dan tidak mengandung http, abaikan
      // Ini agar tidak menimpa Blob URL yang sedang aktif
      if (previews.length === values.length && previews.every(p => p.startsWith('blob:'))) {
         return;
      }

      const urls = await Promise.all(
        values.map(async (val) => {
          if (val.startsWith("http") || val.startsWith("blob:")) return val;
          return await getImageUrl(val, bucket, isPrivate);
        })
      );
      setPreviews(urls.filter((url): url is string => url !== null));
    };
    
    // Jangan overwrite jika kita baru saja mulai upload
    if (!isUploading) {
      resolveImages();
    }
  }, [value, bucket, isPrivate]); // eslint-disable-line react-hooks/exhaustive-deps

  const compressToWebP = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Gagal mengambil context canvas"));

          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height / width) * maxDim;
              width = maxDim;
            } else {
              width = (width / height) * maxDim;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Gagal konversi ke WebP"));
          }, "image/webp", 0.8);
        };
        img.onerror = () => reject(new Error("Gagal memuat file gambar"));
      };
      reader.onerror = () => reject(new Error("Gagal membaca file"));
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE && !file.type.startsWith("image/")) {
      alert(`Format file tidak didukung atau ukuran melebihi batas.`);
      return;
    }

    if (values.length >= maxImages) {
      alert(`Maksimal ${maxImages} foto.`);
      return;
    }

    setIsUploading(true);
    
    // Tampilkan Blob URL segera untuk respon instan
    const instantPreview = URL.createObjectURL(file);
    setPreviews(prev => isMultiple ? [...prev, instantPreview] : [instantPreview]);

    try {
      const compressedBlob = await compressToWebP(file);
      const webpFile = new File([compressedBlob], `upload-${Date.now()}.webp`, { type: "image/webp" });

      const formData = new FormData();
      formData.append("file", webpFile);

      const result = await uploadImageAction(formData, bucket, folder);

      if (!result.success) {
        throw new Error(result.error);
      }

      const newPath = result.path || "";
      
      // Update parent state dengan PATH asli (untuk DB)
      if (isMultiple) {
        onChange([...values, newPath]);
      } else {
        onChange(newPath);
      }
      
      console.log("Upload sukses ke path:", newPath);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Upload failed detail:", err);
      // Hapus preview instan jika gagal
      setPreviews(prev => prev.filter(p => p !== instantPreview));
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
    setPreviews(prev => prev.filter((_, i) => i !== index));
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
            {/* Pakai tag img biasa saja jika Blob agar terhindar dari error filter Next.js Image */}
            <img
              src={src}
              alt={`Preview ${idx + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
            >
              <X className="w-3 h-3" />
            </button>
            {isUploading && idx === previews.length - 1 && (
               <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
               </div>
            )}
          </div>
        ))}

        {values.length < maxImages && !isUploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-emerald-50 hover:border-emerald-300 group flex flex-col items-center justify-center gap-2 transition-all"
          >
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tambah</span>
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
