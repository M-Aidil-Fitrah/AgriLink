import { Product, Order, OrderItem, Role, Favorite } from "@prisma/client";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ProductWithFarmer = Product & {
  images: string[];
  farmer: {
    id: string;
    name: string | null;
    sellerApplication: {
      businessName: string;
      businessAddress: string;
    } | null;
  };
};

export type FavoriteWithProduct = Favorite & {
  product: ProductWithFarmer;
};

export type OrderWithItems = Order & {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: Role;
  };
  items: (OrderItem & {
    product: {
      id: string;
      name: string;
      images: string[];
      price: number;
      unit: string;
    };
  })[];
};

export interface ProductRow {
  id: string;
  name: string;
  images: string[];
  price: number;
  stock: number;
  unit: string;
  harvestDate: string | null;
  farmerName: string | null;
  farmerId: string;
  origin: string | null;
  // Seller location (from SellerApplication)
  sellerLat: number | null;
  sellerLon: number | null;
}

export type FoodMilesCategory = {
  label: string;
  color: string;
};

export type FreshnessResult = {
  score: number;
  label: string;
  color: string;
};

export interface NearbyProductRow extends ProductRow {
  distance: number;
}

/** Represents a seller's business location (from SellerApplication) */
export interface SellerLocation {
  userId: string;
  businessName: string;
  businessAddress: string;
  businessType: string;
  mainCommodity: string;
  latitude: number;
  longitude: number;
  businessPhotoUrl: string;
  productCount: number;
}

/** Seller info with product counts for the Toko page */
export interface SellerWithProducts {
  userId: string;
  businessName: string;
  businessAddress: string;
  businessType: string;
  mainCommodity: string;
  description: string;
  businessPhotoUrl: string;
  latitude: number | null;
  longitude: number | null;
  productCount: number;
}
