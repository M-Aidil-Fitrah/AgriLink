"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath, unstable_noStore } from "next/cache";
import { ActionResult } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

/** A fully resolved cart item with product data joined */
export type CartItemData = {
  id: string;         // CartItem.id
  productId: string;
  name: string;
  price: number;      // price snapshot stored in CartItem
  quantity: number;
  images: string[];
  unit: string;
  farmerId: string;
  farmerName: string;
};

/** The shape returned by getCart */
export type CartData = {
  items: CartItemData[];
  totalPrice: number;
  totalItems: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the cart for the currently authenticated user.
 * Creates one on-demand if it doesn't exist yet.
 * Throws if the user is not authenticated.
 */
async function getOrCreateCart(userId: string): Promise<string> {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.cart.create({
    data: { userId },
    select: { id: true },
  });
  return created.id;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Load the current user's cart from the database.
 */
export async function getCartAction(): Promise<ActionResult<CartData>> {
  unstable_noStore();
  const session = await auth();
  if (!session?.user?.id) {
    // Guest user — return empty cart (no DB interaction)
    return {
      success: true,
      data: { items: [], totalPrice: 0, totalItems: 0 },
    };
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      select: {
        items: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            productId: true,
            quantity: true,
            price: true,
            product: {
              select: {
                name: true,
                images: true,
                unit: true,
                farmerId: true,
                farmer: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return { success: true, data: { items: [], totalPrice: 0, totalItems: 0 } };
    }

    const items: CartItemData[] = cart.items.map((ci) => ({
      id: ci.id,
      productId: ci.productId,
      name: ci.product.name,
      price: ci.price,
      quantity: ci.quantity,
      images: ci.product.images as string[],
      unit: ci.product.unit,
      farmerId: ci.product.farmerId,
      farmerName: ci.product.farmer.name ?? "Petani",
    }));

    const totalPrice = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

    return { success: true, data: { items, totalPrice, totalItems } };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: `Gagal memuat keranjang: ${error.message}` };
  }
}

/**
 * Add an item to the cart, or increment quantity if it already exists.
 */
export async function addToCartAction(
  productId: string,
  quantity: number,
  price: number,
): Promise<ActionResult<CartItemData>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Silakan login untuk menambah ke keranjang." };
  }

  try {
    const cartId = await getOrCreateCart(session.user.id);

    // Upsert: if the product is already in cart, add to quantity; otherwise create
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId } },
      select: { id: true, quantity: true },
    });

    let cartItem;
    if (existing) {
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        select: {
          id: true,
          productId: true,
          quantity: true,
          price: true,
          product: {
            select: {
              name: true,
              images: true,
              unit: true,
              farmerId: true,
              farmer: { select: { name: true } },
            },
          },
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: { cartId, productId, quantity, price },
        select: {
          id: true,
          productId: true,
          quantity: true,
          price: true,
          product: {
            select: {
              name: true,
              images: true,
              unit: true,
              farmerId: true,
              farmer: { select: { name: true } },
            },
          },
        },
      });
    }

    // Revalidate pages that show cart data
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/checkout");

    return {
      success: true,
      data: {
        id: cartItem.id,
        productId: cartItem.productId,
        name: cartItem.product.name,
        price: cartItem.price,
        quantity: cartItem.quantity,
        images: cartItem.product.images as string[],
        unit: cartItem.product.unit,
        farmerId: cartItem.product.farmerId,
        farmerName: cartItem.product.farmer.name ?? "Petani",
      },
    };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: `Gagal menambah ke keranjang: ${error.message}` };
  }
}

/**
 * Remove a specific cart item by its CartItem ID.
 */
export async function removeFromCartAction(
  cartItemId: string,
): Promise<ActionResult<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Verify ownership before deleting
    await prisma.cartItem.deleteMany({
      where: {
        id: cartItemId,
        cart: { userId: session.user.id },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/checkout");

    return { success: true, data: undefined };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: `Gagal menghapus item: ${error.message}` };
  }
}

/**
 * Update the quantity of a specific cart item.
 * Removes the item if quantity drops to 0.
 */
export async function updateCartQuantityAction(
  cartItemId: string,
  quantity: number,
): Promise<ActionResult<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (quantity < 1) {
    return removeFromCartAction(cartItemId);
  }

  try {
    await prisma.cartItem.updateMany({
      where: {
        id: cartItemId,
        cart: { userId: session.user.id },
      },
      data: { quantity },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/checkout");

    return { success: true, data: undefined };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: `Gagal memperbarui jumlah: ${error.message}` };
  }
}

/**
 * Clear all items from the user's cart.
 */
export async function clearCartAction(): Promise<ActionResult<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/checkout");

    return { success: true, data: undefined };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: `Gagal mengosongkan keranjang: ${error.message}` };
  }
}
