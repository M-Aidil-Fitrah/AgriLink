import { Product, Order, OrderItem, Role, Favorite } from "@prisma/client";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ProductWithFarmer = Product & {
  images: string[];
  farmer: {
    id: string;
    name: string | null;
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
      latitude: number | null;
      longitude: number | null;
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
  latitude: number | null;
  longitude: number | null;
  harvestDate: string | null;
  farmerName: string | null;
  origin: string | null;
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
