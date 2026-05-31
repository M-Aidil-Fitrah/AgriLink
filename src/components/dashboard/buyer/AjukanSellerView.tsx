"use client";

import { useState, useTransition } from "react";
import { submitSellerApplication } from "@/app/actions/sellerApplicationActions";
import { SellerApplication } from "@prisma/client";
import { User, Phone, MapPin, Building, FileText, CheckCircle, Clock, XCircle, type LucideIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import type { ComponentType } from "react";
import { toast } from "react-hot-toast";

type MapPickerProps = {
  initialLat?: number | null;
  initialLon?: number | null;
  onChange: (coords: { lat: number; lon: number }) => void;
};

const MapPicker = dynamic<MapPickerProps>(
  () =>
    import("@/components/dashboard/farmer/MapPicker").then(
      (mod) => mod.MapPicker as ComponentType<MapPickerProps>
    ),
  { ssr: false }
);

type Coords = { lat: number; lon: number };

const STATUS_CONFIG: Record<string, { label: string; desc: string; icon: LucideIcon; color: string; }> = {
  PENDING: {
    label: "Sedang Diproses",
    desc: "Pengajuan Anda sedang ditinjau oleh tim admin. Proses ini memakan waktu 1-3 hari kerja.",
    icon: Clock,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  APPROVED: {
    label: "Disetujui",
    desc: "Selamat! Akun Anda telah ditingkatkan menjadi Seller. Silakan masuk kembali untuk mengakses fitur seller.",
    icon: CheckCircle,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  REJECTED: {
    label: "Ditolak",
    desc: "Pengajuan Anda tidak disetujui. Anda dapat mengajukan kembali dengan data yang diperbaiki.",
    icon: XCircle,
    color: "text-red-600 bg-red-50 border-red-200",
  },
};



export function AjukanSellerView({
  existingApplication,
}: {
  existingApplication: SellerApplication | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);

  // File states
  const [ktpPhotoUrl, setKtpPhotoUrl] = useState("");
  const [businessPhotoUrl, setBusinessPhotoUrl] = useState("");

  // Real-time validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    fullName: "",
    nik: "",
    phone: "",
    address: "",
    businessName: "",
    businessType: "",
    mainCommodity: "",
    businessAddress: "",
    description: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const getFieldError = (name: string): string | null => {
    if (!touched[name]) return null;
    
    const value = formData[name as keyof typeof formData];
    if (!value) return "Wajib diisi";
    
    if (name === "nik" && !/^[0-9]{16}$/.test(value)) {
      return "NIK harus 16 digit angka";
    }
    if (name === "phone" && value.length < 10) {
      return "Nomor HP tidak valid";
    }
    return null;
  };

  const isFormValid = () => {
    const hasTextErrors = Object.keys(formData).some(key => getFieldError(key) !== null);
    const hasEmptyFields = Object.values(formData).some(val => !val);
    const hasPhotos = ktpPhotoUrl && businessPhotoUrl;
    const hasCoords = coords !== null;
    return !hasTextErrors && !hasEmptyFields && hasPhotos && hasCoords;
  };

  // If already submitted, show status
  if (existingApplication && existingApplication.status !== "REJECTED") {
    const cfg = STATUS_CONFIG[existingApplication.status];
    const Icon = cfg.icon;
    return (
      <div className="p-4 md:p-8 pb-20 max-w-2xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Ajukan Menjadi Seller</h2>
        <div className={`border rounded-3xl p-8 flex flex-col items-center text-center gap-4 ${cfg.color}`}>
          <Icon className="w-16 h-16" />
          <h3 className="text-2xl font-extrabold">{cfg.label}</h3>
          <p className="font-medium max-w-md">{cfg.desc}</p>
          {existingApplication.adminNote && (
            <div className="mt-4 bg-white/60 rounded-2xl p-4 text-left w-full">
              <p className="text-xs font-bold uppercase tracking-wider mb-1">Catatan Admin</p>
              <p className="text-sm font-medium">{existingApplication.adminNote}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-4 md:p-8 pb-20 max-w-2xl mx-auto">
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-12 flex flex-col items-center text-center gap-4">
          <CheckCircle className="w-16 h-16 text-emerald-600" />
          <h3 className="text-2xl font-extrabold text-gray-900">Pengajuan Terkirim</h3>
          <p className="text-gray-600 font-medium max-w-md">
            Pengajuan Anda telah diterima dan sedang dalam proses peninjauan oleh tim admin. Kami akan menghubungi Anda dalam 1-3 hari kerja.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!ktpPhotoUrl || !businessPhotoUrl || !coords) {
      const msg = "Semua data wajib diisi, termasuk foto dan lokasi peta";
      setError(msg);
      toast.error(msg);
      // Touch all fields to show errors
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach(k => allTouched[k] = true);
      allTouched.ktp = true;
      allTouched.business = true;
      allTouched.coords = true;
      setTouched(allTouched);
      return;
    }

    if (!isFormValid()) {
      const msg = "Silakan perbaiki data yang tidak sesuai";
      setError(msg);
      toast.error(msg);
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      fullName: fd.get("fullName") as string,
      nik: fd.get("nik") as string,
      ktpPhotoUrl,
      phone: fd.get("phone") as string,
      address: fd.get("address") as string,
      businessName: fd.get("businessName") as string,
      businessType: fd.get("businessType") as string,
      businessAddress: fd.get("businessAddress") as string,
      latitude: coords?.lat ?? null,
      longitude: coords?.lon ?? null,
      businessPhotoUrl,
      description: fd.get("description") as string,
      mainCommodity: fd.get("mainCommodity") as string,
    };

    startTransition(async () => {
      const res = await submitSellerApplication(payload);
      if (res.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        setSuccess(true);
        toast.success("Pengajuan seller berhasil dikirim!");
      }
    });
  };

  return (
    <div className="p-4 md:p-8 pb-20 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Ajukan Menjadi Seller</h2>
        <p className="text-gray-500 font-medium mt-1">
          Lengkapi data berikut untuk memulai berjualan di Agrilink
        </p>
        {existingApplication?.status === "REJECTED" && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-red-700">Pengajuan sebelumnya ditolak</p>
            {existingApplication.adminNote && (
              <p className="text-sm text-red-600 mt-1">Alasan: {existingApplication.adminNote}</p>
            )}
            <p className="text-xs text-red-500 mt-2">Anda dapat mengajukan kembali dengan data yang diperbaiki.</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Identitas Pribadi */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900">Identitas Pribadi</h3>
              <p className="text-xs text-gray-500">Pastikan data sesuai dengan KTP Anda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap sesuai KTP</label>
              <input 
                name="fullName" 
                required 
                placeholder="Budi Santoso"
                value={formData.fullName}
                onChange={handleInputChange}
                onBlur={() => handleBlur("fullName")}
                className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${getFieldError("fullName") ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-200'} text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`}
              />
              {getFieldError("fullName") && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{getFieldError("fullName")}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">NIK / Nomor KTP</label>
              <input 
                name="nik" 
                required 
                placeholder="3271xxxxxxxxxxxx" 
                maxLength={16}
                value={formData.nik}
                onChange={handleInputChange}
                onBlur={() => handleBlur("nik")}
                className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${getFieldError("nik") ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-200'} text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`}
              />
              {getFieldError("nik") && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{getFieldError("nik")}</p>}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5"><Phone className="w-3.5 h-3.5 mt-0.5" /> Nomor HP Aktif</label>
              <input 
                name="phone" 
                required 
                placeholder="0812 3456 7890" 
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={() => handleBlur("phone")}
                className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${getFieldError("phone") ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-200'} text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`}
              />
              {getFieldError("phone") && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{getFieldError("phone")}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Domisili</label>
              <textarea 
                name="address" 
                required 
                rows={2} 
                placeholder="Jl. Contoh No. 1, Kel. X, Kec. Y, Kota Z"
                value={formData.address}
                onChange={handleInputChange}
                onBlur={() => handleBlur("address")}
                className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${getFieldError("address") ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-200'} text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none`}
              />
              {getFieldError("address") && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{getFieldError("address")}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="space-y-4">
              <ImageUpload
                label="Foto KTP"
                hint="Pastikan tulisan KTP terbaca jelas (JPG/PNG)"
                value={ktpPhotoUrl}
                onChange={(val) => {
                  const url = typeof val === 'string' ? val : val[0];
                  setKtpPhotoUrl(url);
                  setTouched(prev => ({ ...prev, ktp: true }));
                }}
                bucket="verifikasi-seller"
                folder="ktp"
                isPrivate={true}
              />
              {touched.ktp && !ktpPhotoUrl && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Foto KTP wajib diunggah</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Identitas Usaha */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900">Identitas Usaha / Kebun</h3>
              <p className="text-xs text-gray-500">Informasi tentang usaha pertanian Anda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Usaha / Kebun</label>
              <input 
                name="businessName" 
                required 
                placeholder="Kebun Organik Makmur"
                value={formData.businessName}
                onChange={handleInputChange}
                onBlur={() => handleBlur("businessName")}
                className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${getFieldError("businessName") ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-200'} text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`}
              />
              {getFieldError("businessName") && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{getFieldError("businessName")}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenis Usaha</label>
              <select 
                name="businessType" 
                required
                value={formData.businessType}
                onChange={handleInputChange}
                onBlur={() => handleBlur("businessType")}
                className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${getFieldError("businessType") ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-200'} text-sm font-medium text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`}
              >
                <option value="">-- Pilih Jenis --</option>
                <option value="Petani">Petani</option>
                <option value="Peternak">Peternak</option>
                <option value="Hidroponik">Hidroponik</option>
                <option value="UMKM Pertanian">UMKM Pertanian</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              {getFieldError("businessType") && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{getFieldError("businessType")}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Komoditas Utama</label>
              <input 
                name="mainCommodity" 
                required 
                placeholder="Cabai, Tomat, Sayuran"
                value={formData.mainCommodity}
                onChange={handleInputChange}
                onBlur={() => handleBlur("mainCommodity")}
                className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${getFieldError("mainCommodity") ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-200'} text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`}
              />
              {getFieldError("mainCommodity") && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{getFieldError("mainCommodity")}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Usaha</label>
              <input 
                name="businessAddress" 
                required 
                placeholder="Desa/Kelurahan, Kecamatan, Kota"
                value={formData.businessAddress}
                onChange={handleInputChange}
                onBlur={() => handleBlur("businessAddress")}
                className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${getFieldError("businessAddress") ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-200'} text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`}
              />
              {getFieldError("businessAddress") && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{getFieldError("businessAddress")}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Usaha</label>
              <textarea 
                name="description" 
                required 
                rows={3}
                placeholder="Ceritakan singkat tentang usaha Anda, produk unggulan, pengalaman bertani, dll."
                value={formData.description}
                onChange={handleInputChange}
                onBlur={() => handleBlur("description")}
                className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${getFieldError("description") ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-200'} text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none`}
              />
              {getFieldError("description") && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{getFieldError("description")}</p>}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-3.5 h-3.5" /> Lokasi Kebun / Usaha
            </label>
            <p className="text-xs text-gray-400 mb-3">Klik pada peta untuk menentukan titik lokasi usaha Anda</p>
            <div className={`h-56 rounded-2xl overflow-hidden border ${touched.coords && !coords ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-200'}`}>
              <MapPicker
                initialLat={coords?.lat ?? 5.5483}
                initialLon={coords?.lon ?? 95.3238}
                onChange={(c) => {
                  setCoords(c);
                  setTouched(prev => ({ ...prev, coords: true }));
                }}
              />
            </div>
            {touched.coords && !coords && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">Silakan pilih lokasi di peta</p>}
            {coords && (
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                Titik dipilih: {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <ImageUpload
              label="Foto Usaha / Kebun"
              hint="Foto nyata dari kebun atau tempat usaha Anda"
              value={businessPhotoUrl}
              onChange={(val) => {
                const url = typeof val === 'string' ? val : val[0];
                setBusinessPhotoUrl(url);
                setTouched(prev => ({ ...prev, business: true }));
              }}
              bucket="agrilink-uploads"
              folder="verification/business"
            />
            {touched.business && !businessPhotoUrl && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Foto usaha wajib diunggah</p>}
          </div>
        </div>

        {/* Section 3: Persetujuan */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-extrabold text-gray-900">Pernyataan dan Persetujuan</h3>
          </div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" required className="mt-0.5 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              Saya menyatakan bahwa seluruh data yang saya berikan adalah benar dan dapat dipertanggungjawabkan
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" required className="mt-0.5 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              Saya bersedia menjalani proses verifikasi oleh tim admin Agrilink
            </span>
          </label>
        </div>

        {error && (
          <div className="px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-semibold">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 bg-emerald-600 text-white font-extrabold rounded-2xl hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-base shadow-sm"
        >
          {isPending ? "Mengirim Pengajuan..." : "Kirim Pengajuan Seller"}
        </button>
      </form>
    </div>
  );
}
