'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Package } from 'lucide-react';


interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  productCategory: string;
}

interface ProductCardChatProps {
  products: Product[];
}

export function ProductCardChat({ products }: ProductCardChatProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 my-4 w-full">
      <div className="flex items-center gap-2 mb-1">
        <Package className="w-3 h-3 text-brand-leaf" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-leaf">
          Produk Rekomendasi
        </span>
      </div>
      
      <div className="flex flex-col gap-2">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex items-center justify-between p-3 bg-white border border-black/5 rounded-2xl hover:border-brand-leaf/30 hover:shadow-sm transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-offwhite rounded-xl flex items-center justify-center text-brand-deep/30 group-hover:text-brand-leaf group-hover:bg-brand-leaf/5 transition-colors">
                <Package className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-xs font-bold text-brand-deep leading-tight group-hover:text-brand-leaf transition-colors">
                  {product.name}
                </h4>
                <p className="text-[10px] font-medium text-brand-deep/40 uppercase tracking-tighter">
                  Rp {product.price.toLocaleString()} / {product.unit}
                </p>
              </div>
            </div>
            
            <button className="p-2 bg-brand-offwhite rounded-lg text-brand-deep/30 group-hover:bg-brand-leaf group-hover:text-white transition-all duration-300">
              <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>
      
      {products.length > 3 && (
        <p className="text-[9px] text-center text-brand-deep/20 font-bold uppercase tracking-widest">
          +{products.length - 3} Produk Lainnya
        </p>
      )}
    </div>
  );
}
