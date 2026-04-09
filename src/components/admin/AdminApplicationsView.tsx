"use client";

import { useState, useTransition } from "react";
import { reviewSellerApplication } from "@/app/actions/sellerApplicationActions";
import { SellerApplication, User, SellerApplicationStatus } from "@prisma/client";
import { CheckCircle, XCircle, Clock, MapPin, Phone, Building, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { SecureImage } from "@/components/SecureImage";

type ApplicationWithUser = SellerApplication & {
  user: Pick<User, "id" | "name" | "email" | "role">;
};

const STATUS_BADGE: Record<SellerApplicationStatus, { label: string; color: string }> = {
  PENDING: { label: "Menunggu", color: "text-amber-600 bg-amber-50 border-amber-200" },
  APPROVED: { label: "Disetujui", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  REJECTED: { label: "Ditolak", color: "text-red-600 bg-red-50 border-red-200" },
};

function ReviewButtons({ applicationId }: { applicationId: string }) {
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");

  const handleReview = (status: SellerApplicationStatus) => {
    startTransition(async () => {
      await reviewSellerApplication(applicationId, status, note);
    });
  };

  return (
    <div className="space-y-3 pt-4 border-t border-gray-100">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Catatan untuk pemohon (opsional untuk disetujui, wajib untuk ditolak)"
        rows={2}
        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
      <div className="flex gap-3">
        <button
          onClick={() => handleReview("APPROVED")}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
        >
          <CheckCircle className="w-4 h-4" />
          Setujui
        </button>
        <button
          onClick={() => {
            if (!note.trim()) { alert("Harap isi catatan alasan penolakan"); return; }
            handleReview("REJECTED");
          }}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 border border-red-200 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors disabled:opacity-60"
        >
          <XCircle className="w-4 h-4" />
          Tolak
        </button>
      </div>
    </div>
  );
}

function ApplicationCard({ app }: { app: ApplicationWithUser }) {
  const [expanded, setExpanded] = useState(app.status === "PENDING");
  const badge = STATUS_BADGE[app.status];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-sm font-extrabold text-emerald-700">
              {(app.user.name ?? app.user.email ?? "?")[0].toUpperCase()}
            </span>
          </div>
          <div className="text-left">
            <p className="font-extrabold text-gray-900">{app.businessName}</p>
            <p className="text-sm text-gray-500 font-medium">{app.user.name} · {app.user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
            {badge.label}
          </span>
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-6 border-t border-gray-50">
          {/* Application meta */}
          <div className="flex flex-wrap gap-3 pt-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Building className="w-3.5 h-3.5" />{app.businessType}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Phone className="w-3.5 h-3.5" />{app.phone}
            </span>
            {app.latitude && app.longitude && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                <MapPin className="w-3.5 h-3.5" />{app.latitude.toFixed(4)}, {app.longitude.toFixed(4)}
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Identitas Pribadi */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Identitas Pribadi</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nama KTP</span>
                  <span className="font-bold text-gray-900">{app.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">NIK</span>
                  <span className="font-bold text-gray-900 font-mono tracking-wider">{app.nik}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Alamat</span>
                  <span className="font-bold text-gray-900 text-right max-w-[200px]">{app.address}</span>
                </div>
              </div>
              {/* KTP Photos */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-1">Foto KTP</p>
                  <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                    <SecureImage src={app.ktpPhotoUrl} bucket="verifikasi-seller" isPrivate={true} alt="KTP" fill className="object-cover" sizes="150px" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-1">Selfie + KTP</p>
                  <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                    <SecureImage src={app.selfiePhotoUrl} bucket="verifikasi-seller" isPrivate={true} alt="Selfie KTP" fill className="object-cover" sizes="150px" />
                  </div>
                </div>
              </div>
            </div>

            {/* Identitas Usaha */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Identitas Usaha</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Komoditas</span>
                  <span className="font-bold text-gray-900">{app.mainCommodity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Alamat Usaha</span>
                  <span className="font-bold text-gray-900 text-right max-w-[200px]">{app.businessAddress}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium mt-3 leading-relaxed">{app.description}</p>
              <div className="mt-4">
                <p className="text-xs text-gray-400 font-semibold mb-1">Foto Usaha</p>
                <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                  <Image src={app.businessPhotoUrl} alt="Foto usaha" fill className="object-cover" sizes="300px" />
                </div>
              </div>
            </div>
          </div>

          {/* Review Actions */}
          {app.status === "PENDING" && <ReviewButtons applicationId={app.id} />}

          {app.status !== "PENDING" && app.adminNote && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Catatan Admin</p>
              <p className="text-sm font-medium text-gray-700">{app.adminNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminApplicationsView({
  applications,
}: {
  applications: ApplicationWithUser[];
}) {
  const pending = applications.filter((a) => a.status === "PENDING");
  const reviewed = applications.filter((a) => a.status !== "PENDING");
  const [tab, setTab] = useState<"pending" | "reviewed">("pending");

  return (
    <div className="p-8 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Pengajuan Seller</h2>
        <p className="text-gray-500 font-medium mt-1">
          {pending.length} menunggu · {reviewed.length} sudah ditinjau
        </p>
      </div>

      {/* Tab */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(["pending", "reviewed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "pending" ? `Menunggu (${pending.length})` : `Sudah Ditinjau (${reviewed.length})`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {(tab === "pending" ? pending : reviewed).length === 0 ? (
          <div className="py-24 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold text-lg">Tidak ada pengajuan</p>
          </div>
        ) : (
          (tab === "pending" ? pending : reviewed).map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))
        )}
      </div>
    </div>
  );
}
