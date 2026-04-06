import {
  Product,
  User,
  Order,
  OrderItem,
  Favorite,
  CultivationMethod,
} from "@prisma/client";

// ─── Shared Utility Types ─────────────────────────────────────────────────────

export type SelectUser = Pick<User, "id" | "name" | "email" | "role">;

export type ProductWithFarmer = Product & {
  farmer: SelectUser;
};

export type OrderItemWithProduct = OrderItem & {
  product: Pick<Product, "id" | "name" | "image" | "price" | "unit" | "latitude" | "longitude">;
};

export type OrderWithItems = Order & {
  items: OrderItemWithProduct[];
  user: SelectUser;
};

export type FavoriteWithProduct = Favorite & {
  product: ProductWithFarmer;
};

// ─── Food Miles ───────────────────────────────────────────────────────────────

export type FoodMilesCategory = {
  label: string;
  color: string;
};

export type FreshnessResult = {
  score: number;
  label: string;
  color: string;
};

// ─── PostGIS Raw Query Results ────────────────────────────────────────────────

export type NearbyProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  unit: string;
  latitude: number | null;
  longitude: number | null;
  harvestDate: Date | null;
  cultivationMethod: CultivationMethod;
  origin: string | null;
  farmerId: string;
  createdAt: Date;
  updatedAt: Date;
  distance_km: number;
};

// ─── Action Return Types ──────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
