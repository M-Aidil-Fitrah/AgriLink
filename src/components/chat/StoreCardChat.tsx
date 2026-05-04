'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation, Star } from 'lucide-react';


interface Store {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  rating?: number;
}

interface StoreCardChatProps {
  stores: Store[];
}

export function StoreCardChat({ stores }: StoreCardChatProps) {
  if (!stores || stores.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 my-4 w-full">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="w-3 h-3 text-brand-leaf" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-leaf">
          Toko Terdekat
        </span>
      </div>
      
      <div className="flex flex-col gap-2">
        {stores.map((store, index) => (
          <motion.div
            key={store.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex items-center justify-between p-3 bg-white border border-black/5 rounded-2xl hover:border-brand-leaf/30 hover:shadow-sm transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-offwhite rounded-xl flex items-center justify-center text-brand-deep/30 group-hover:text-brand-leaf group-hover:bg-brand-leaf/5 transition-colors">
                <Navigation className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-xs font-bold text-brand-deep leading-tight group-hover:text-brand-leaf transition-colors">
                  {store.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-bold text-brand-deep/60">4.8</span>
                  </div>
                  <span className="text-brand-deep/10 text-[10px]">•</span>
                  <p className="text-[10px] font-medium text-brand-deep/40 truncate max-w-[120px]">
                    {store.address || 'Alamat tidak tersedia'}
                  </p>
                </div>
              </div>
            </div>
            
            <button className="px-3 py-1.5 bg-brand-leaf/10 text-brand-leaf rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-leaf hover:text-white transition-all duration-300">
              Peta
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
