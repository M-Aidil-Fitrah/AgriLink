"use client";

import { useState, useTransition, useRef } from "react";
import { submitSellerApplication } from "@/app/actions/sellerApplicationActions";
import { SellerApplication } from "@prisma/client";
import { User, Phone, MapPin, Building, FileText, CheckCircle, Clock, XCircle, Upload, type LucideIcon } from "lucide-react";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

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

function FileUploadField({
  label,
  hint,
  onChange,
}: {
  label: string;
  hint: string;
  onChange: (url: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <p className="text-xs text-gray-400 mb-2">{hint}</p>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded-lg object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <Upload className="w-8 h-8 text-gray-300" />
            <span className="text-sm font-medium text-gray-500">Klik untuk unggah foto</span>
            <span className="text-xs text-gray-400">JPG, PNG, maks. 5MB</span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

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
  const [selfiePhotoUrl, setSelfiePhotoUrl] = useState("");
  const [businessPhotoUrl, setBusinessPhotoUrl] = useState("");

  // If already submitted, show status
  if (existingApplication && existingApplication.status !== "REJECTED") {
    const cfg = STATUS_CONFIG[existingApplication.status];
    const Icon = cfg.icon;
    return (
      <div className="p-8 pb-20 max-w-2xl mx-auto">
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
      <div className="p-8 pb-20 max-w-2xl mx-auto">
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

    if (!ktpPhotoUrl) { setError("Foto KTP wajib diunggah"); return; }
    if (!selfiePhotoUrl) { setError("Foto selfie dengan KTP wajib diunggah"); return; }
    if (!businessPhotoUrl) { setError("Foto usaha/kebun wajib diunggah"); return; }

    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      fullName: fd.get("fullName") as string,
      nik: fd.get("nik") as string,
      ktpPhotoUrl,
      selfiePhotoUrl,
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
      if (res.error) setError(res.error);
      else setSuccess(true);
    });
  };

  return (
    <div className="p-8 pb-20 max-w-2xl mx-auto">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap sesuai KTP</label>
              <input name="fullName" required placeholder="Budi Santoso"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">NIK / Nomor KTP</label>
              <input name="nik" required placeholder="3271xxxxxxxxxxxx" maxLength={16} pattern="[0-9]{16}"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5"><Phone className="w-3.5 h-3.5 mt-0.5" /> Nomor HP Aktif</label>
              <input name="phone" required placeholder="+62 812 xxxx xxxx" type="tel"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Domisili</label>
              <textarea name="address" required rows={2} placeholder="Jl. Contoh No. 1, Kel. X, Kec. Y, Kota Z"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FileUploadField
              label="Foto KTP"
              hint="Pastikan tulisan KTP terbaca jelas"
              onChange={setKtpPhotoUrl}
            />
            <FileUploadField
              label="Foto Selfie dengan KTP"
              hint="Foto Anda sambil memegang KTP"
              onChange={setSelfiePhotoUrl}
            />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Usaha / Kebun</label>
              <input name="businessName" required placeholder="Kebun Organik Makmur"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenis Usaha</label>
              <select name="businessType" required
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">-- Pilih Jenis --</option>
                <option value="Petani">Petani</option>
                <option value="Peternak">Peternak</option>
                <option value="Hidroponik">Hidroponik</option>
                <option value="UMKM Pertanian">UMKM Pertanian</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Komoditas Utama</label>
              <input name="mainCommodity" required placeholder="Cabai, Tomat, Sayuran"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Usaha</label>
              <input name="businessAddress" required placeholder="Desa/Kelurahan, Kecamatan, Kota"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Usaha</label>
              <textarea name="description" required rows={3}
                placeholder="Ceritakan singkat tentang usaha Anda, produk unggulan, pengalaman bertani, dll."
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-3.5 h-3.5" /> Lokasi Kebun / Usaha
            </label>
            <p className="text-xs text-gray-400 mb-3">Klik pada peta untuk menentukan titik lokasi usaha Anda</p>
            <div className="h-56 rounded-2xl overflow-hidden border border-gray-200">
              <MapPicker
                initialLat={coords?.lat ?? 5.5483}
                initialLon={coords?.lon ?? 95.3238}
                onChange={(c) => setCoords(c)}
              />
            </div>
            {coords && (
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                Titik dipilih: {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}
              </p>
            )}
          </div>

          <FileUploadField
            label="Foto Usaha / Kebun"
            hint="Foto yang menunjukkan kebun atau tempat usaha Anda secara nyata"
            onChange={setBusinessPhotoUrl}
          />
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
