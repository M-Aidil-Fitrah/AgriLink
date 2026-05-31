import { Product, Order, OrderItem, Role, Favorite, ProductCategory, CultivationMethod } from "@prisma/client";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ReviewWithUser = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

export type ProductWithFarmer = Product & {
  images: string[];
  farmer: {
    id: string;
    name: string | null;
    sellerApplication: {
      businessName: string;
      businessAddress: string;
      latitude: number | null;
      longitude: number | null;
    } | null;
  };
  reviews: ReviewWithUser[];
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
  paymentExpiry: Date | null;
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
  cultivationMethod: CultivationMethod;
  productCategory: ProductCategory;
  // Seller location (from SellerApplication)
  sellerLat: number | null;
  sellerLon: number | null;
}

export type FoodMilesCategory = {
  label: string;
  color: string;
};

export type FreshnessImpactReason = {
  type: "positive" | "neutral" | "warning" | "negative";
  text: string;
};

export type FreshnessResult = {
  score: number;
  label: string;
  color: string;
  reasons: FreshnessImpactReason[];
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
