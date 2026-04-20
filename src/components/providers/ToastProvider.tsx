"use client";

import { Toaster, resolveValue, toast } from "react-hot-toast";
import { CheckCircle, AlertCircle, Info, X, Smile } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ToastProvider() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const hasShown = useRef(false);

  useEffect(() => {
    const loginStatus = searchParams.get('login');
    const logoutStatus = searchParams.get('logout');

    if (loginStatus === 'success' && !hasShown.current) {
      hasShown.current = true;
      toast.success("Selamat Datang Kembali!", { 
        icon: <Smile className="w-5 h-5 text-emerald-500" />,
        duration: 4000 
      });
      // Clean up URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('login');
      router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
    }

    if (logoutStatus === 'success' && !hasShown.current) {
      hasShown.current = true;
      toast.success("Berhasil Keluar. Sampai jumpa!", { 
        icon: <Smile className="w-5 h-5 text-emerald-500" />,
        duration: 4000 
      });
      // Clean up URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('logout');
      router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
    }

    // Reset ref if params are gone
    if (!loginStatus && !logoutStatus) {
      hasShown.current = false;
    }
  }, [searchParams, pathname, router]);

  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
      }}
    >
      {(t) => {
        const type = t.type as 'success' | 'error' | 'loading' | 'blank';
        const isError = type === 'error';
        const isSuccess = type === 'success';
        
        const icon = isError ? <AlertCircle size={20} /> : isSuccess ? <CheckCircle size={20} /> : <Info size={20} />;
        const borderColor = isError ? "border-red-500" : isSuccess ? "border-emerald-500" : "border-blue-500";
        const bgColor = isError ? "bg-red-50" : isSuccess ? "bg-emerald-50" : "bg-blue-50";
        const textColor = isError ? "text-red-700" : isSuccess ? "text-emerald-700" : "text-blue-700";
        const title = isError ? "Error" : isSuccess ? "Berhasil" : "Informasi";

        return (
          <AnimatePresence>
            {t.visible && (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                transition={{ type: "spring", damping: 22, stiffness: 260 }}
                className={`max-w-sm w-full bg-white shadow-xl rounded-xl pointer-events-auto flex flex-col border-t-4 ${borderColor} ${bgColor} overflow-hidden`}
              >
                <div className="flex p-4 items-start gap-4">
                  <div className={`mt-0.5 shrink-0 ${textColor}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-extrabold uppercase tracking-tight ${textColor}`}>
                      {title}
                    </p>
                    <div className="mt-1 text-xs font-semibold text-gray-600 leading-relaxed">
                      {resolveValue(t.message, t)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.dismiss(t.id)}
                    className={`shrink-0 p-1 rounded-md transition-colors text-gray-400 hover:text-gray-700 hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-400`}
                    aria-label="Tutup notifikasi"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      }}
    </Toaster>
  );
}
