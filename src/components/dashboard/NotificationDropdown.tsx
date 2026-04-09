"use client";

import { Bell, Check, Clock, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { getMyNotifications, markAsRead } from "@/app/actions/notificationActions";
import { Notification } from "@prisma/client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifs = async () => {
      const data = await getMyNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.read).length);
    };
    fetchNotifs();
    // In a real app, you'd use Pusher or Supabase Realtime here.
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl border border-gray-100 shadow-2xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
               <h4 className="font-extrabold text-gray-900 text-sm">Notifikasi</h4>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{unreadCount} Baru</span>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
               {notifications.length === 0 ? (
                 <div className="p-10 text-center space-y-2">
                    <Clock className="w-8 h-8 text-gray-200 mx-auto" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Belum ada notifikasi</p>
                 </div>
               ) : (
                 <div className="divide-y divide-gray-50">
                    {notifications.map((n: Notification) => (
                      <div 
                        key={n.id} 
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group relative ${!n.read ? 'bg-emerald-50/30' : ''}`}
                        onClick={() => handleRead(n.id)}
                      >
                         {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}
                         <div className="flex justify-between items-start mb-1">
                            <h5 className={`text-xs font-bold ${!n.read ? 'text-emerald-900' : 'text-gray-900'}`}>{n.title}</h5>
                            <span className="text-[9px] font-medium text-gray-400 whitespace-nowrap ml-2">
                               {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: id })}
                            </span>
                         </div>
                         <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-2">{n.message}</p>
                         
                         {n.link && (
                           <Link 
                             href={n.link} 
                             className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 hover:underline"
                             onClick={() => setIsOpen(false)}
                           >
                              Lihat Detail <ExternalLink className="w-2.5 h-2.5" />
                           </Link>
                         )}
                         
                         {!n.read && (
                           <button className="absolute bottom-4 right-4 p-1 bg-emerald-100 text-emerald-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <Check className="w-3 h-3" />
                           </button>
                         )}
                      </div>
                    ))}
                 </div>
               )}
            </div>
            
            <div className="p-3 bg-gray-50/50 text-center">
               <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Lihat Semua</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
