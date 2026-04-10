"use client";

import { useState, useTransition } from "react";
import { MapPin, Save, Loader2, Trash2, Plus, Star, Lock, User as UserIcon } from "lucide-react";
import { updateProfile, addLocation, deleteLocation } from "@/app/actions/profileActions";
import { updatePassword } from "@/app/actions/passwordActions";
import { Location } from "@prisma/client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

type MapPickerProps = {
  initialLat?: number | null;
  initialLon?: number | null;
  onChange: (coords: { lat: number; lon: number }) => void;
};

const MapPicker = dynamic<MapPickerProps>(
  () => import("./farmer/MapPicker").then((mod) => mod.MapPicker as ComponentType<MapPickerProps>),
  { ssr: false, loading: () => <div className="h-48 w-full bg-gray-100 animate-pulse rounded-2xl" /> }
);

import { User } from "@prisma/client";

export function ProfileView({ user, initialLocations }: { user: User; initialLocations: Location[] }) {
  const [activeTab, setActiveTab] = useState<"biodata" | "password" | "alamat">("biodata");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Address Form States
  const [showAddLoc, setShowAddLoc] = useState(false);
  const [newLoc, setNewLoc] = useState({ label: "", address: "", lat: 0, lon: 0, isPrimary: false });

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
    };

    startTransition(async () => {
      const res = await updateProfile(data);
      if (res.error) setMessage({ type: "error", text: res.error });
      else setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
    });
  };

  const handleUpdatePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      oldPass: fd.get("oldPass") as string,
      newPass: fd.get("newPass") as string,
      confirmPass: fd.get("confirmPass") as string,
    };

    startTransition(async () => {
      const res = await updatePassword(data);
      if (res.error) setMessage({ type: "error", text: res.error });
      else {
          setMessage({ type: "success", text: "Password berhasil diperbarui!" });
          (e.target as HTMLFormElement).reset();
      }
    });
  };

  const handleAddLocation = async () => {
    if (!newLoc.label || !newLoc.address || !newLoc.lat) return;
    
    startTransition(async () => {
      const res = await addLocation({
        label: newLoc.label,
        address: newLoc.address,
        latitude: newLoc.lat,
        longitude: newLoc.lon,
        isPrimary: newLoc.isPrimary
      });
      if (res.error) setMessage({ type: "error", text: res.error });
      else {
        setMessage({ type: "success", text: "Alamat berhasil ditambah!" });
        setShowAddLoc(false);
        setNewLoc({ label: "", address: "", lat: 0, lon: 0, isPrimary: false });
      }
    });
  };

  return (
    <div className="p-8 pb-20 max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Pengaturan Profil</h2>
        <p className="text-gray-500 font-medium">Kelola informasi pribadi, keamanan, dan alamat pengiriman Anda</p>
      </div>

      <div className="flex flex-wrap gap-1 bg-gray-100 p-1.5 rounded-2xl w-fit mb-8">
        <button
          onClick={() => { setActiveTab("biodata"); setMessage(null); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "biodata" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
        >
          <UserIcon className="w-4 h-4" />
          Biodata
        </button>
        <button
          onClick={() => { setActiveTab("password"); setMessage(null); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "password" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
        >
          <Lock className="w-4 h-4" />
          Ganti Password
        </button>
        <button
          onClick={() => { setActiveTab("alamat"); setMessage(null); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "alamat" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
        >
          <MapPin className="w-4 h-4" />
          Buku Alamat
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl text-sm font-bold border ${message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {activeTab === "biodata" && (
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <input name="name" defaultValue={user.name || ""} required className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 rounded-2xl text-sm font-bold text-gray-900 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email <span className="text-[10px] lowercase text-gray-400 font-medium">(Read Only)</span></label>
              <input name="email" defaultValue={user.email || ""} readOnly className="w-full px-5 py-3.5 bg-gray-100 border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed outline-none" />
            </div>
          </div>
          <button disabled={isPending} type="submit" className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white font-extrabold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </form>
      )}

      {activeTab === "password" && (
        <form onSubmit={handleUpdatePassword} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 gap-6 max-w-md">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password Lama</label>
              <input name="oldPass" type="password" required className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 rounded-2xl text-sm font-bold text-gray-900 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password Baru</label>
              <input name="newPass" type="password" required className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 rounded-2xl text-sm font-bold text-gray-900 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Ulangi Password Baru</label>
              <input name="confirmPass" type="password" required className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 rounded-2xl text-sm font-bold text-gray-900 outline-none transition-all" />
            </div>
          </div>
          <button disabled={isPending} type="submit" className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white font-extrabold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Perbarui Password
          </button>
        </form>
      )}

      {activeTab === "alamat" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button 
            onClick={() => setShowAddLoc(true)}
            className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center gap-2 text-gray-500 font-bold hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 transition-all group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Tambah Alamat Baru
          </button>

          {showAddLoc && (
            <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-xl overflow-hidden animate-in slide-in-from-top duration-300">
               <div className="p-6 bg-emerald-50/50 border-b border-emerald-100 flex justify-between items-center">
                  <h4 className="font-extrabold text-emerald-900">Tambah Alamat</h4>
                  <button onClick={() => setShowAddLoc(false)} className="text-emerald-600 hover:text-emerald-800"><Star className="w-5 h-5 fill-current" /></button>
               </div>
               <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Label Alamat</label>
                        <input value={newLoc.label} onChange={(e) => setNewLoc({...newLoc, label: e.target.value})} placeholder="Contoh: Rumah, Kantor, Kost" className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-200" />
                     </div>
                     <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="checkbox" checked={newLoc.isPrimary} onChange={(e) => setNewLoc({...newLoc, isPrimary: e.target.checked})} className="w-4 h-4 rounded text-emerald-600" />
                           <span className="text-sm font-bold text-gray-700">Jadikan Alamat Utama</span>
                        </label>
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Alamat Lengkap</label>
                     <textarea value={newLoc.address} onChange={(e) => setNewLoc({...newLoc, address: e.target.value})} rows={2} placeholder="Sebutkan jalan, nomor rumah, RT/RW, dan patokan..." className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-200 resize-none" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pin Lokasi Peta</label>
                     <div className="h-48 rounded-2xl overflow-hidden border">
                        <MapPicker onChange={(c) => setNewLoc({...newLoc, lat: c.lat, lon: c.lon})} />
                     </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                     <button onClick={handleAddLocation} disabled={isPending} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700">Simpan Alamat</button>
                     <button onClick={() => setShowAddLoc(false)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl">Batal</button>
                  </div>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialLocations.map(loc => (
              <div key={loc.id} className={`bg-white rounded-3xl border-2 p-6 relative group transition-all ${loc.isPrimary ? 'border-emerald-200 shadow-md' : 'border-gray-50'}`}>
                {loc.isPrimary && (
                  <span className="absolute top-4 right-4 px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase rounded-lg">Utama</span>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-gray-900">{loc.label}</h4>
                </div>
                <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-6">{loc.address}</p>
                <div className="flex items-center justify-between mt-auto">
                    <p className="text-[10px] font-bold text-gray-400">KOORD: {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</p>
                    <button 
                      onClick={() => {
                        if (confirm("Hapus alamat ini?")) {
                          startTransition(async () => {
                            await deleteLocation(loc.id);
                          });
                        }
                      }}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
