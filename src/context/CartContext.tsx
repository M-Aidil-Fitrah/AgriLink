"use client";
// HMR Trigger for context resolution fix

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useTransition,
} from "react";
import {
  addToCartAction,
  removeFromCartAction,
  updateCartQuantityAction,
  clearCartAction,
} from "@/app/actions/cartActions";
import type { CartItemData } from "@/app/actions/cartActions";

// Re-export CartItem shape for consumers that import it from this module
export type CartItem = CartItemData;

type CartContextType = {
  items: CartItem[];
  /** True while any cart action is in-flight */
  isLoading: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  /** Remove multiple cart items at once (e.g. after a selective checkout) */
  removeItems: (cartItemIds: string[]) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isAuthenticated: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ userId, initialItems = [], children }: { userId: string | null, initialItems?: CartItem[], children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Sync state if initialItems changes from server (e.g. after a navigation/login)
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // ── Initial load from DB + Reset on user change ───────────────────────────
  // REMOVED: Client-side fetching on mount using getCartAction in useEffect.
  // This prevents the "infinite loop" / stuck spinner bug when navigating or switching users,
  // because Server Actions inside useEffect on mount can get blocked by Next.js App Router hydration.
  // Instead, layout.tsx fetches the cart directly and passes `initialItems`.

  // ── Mutations ────────────────────────────────────────────────────────────

  const addItem = useCallback((item: CartItem) => {
    // Optimistic update
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
    setIsCartOpen(true);

    startTransition(async () => {
      const result = await addToCartAction(item.productId, item.quantity, item.price);
      if (result.success) {
        // Replace optimistic item with real DB row (gets a proper CartItem.id)
        setItems((prev) =>
          prev.map((i) =>
            i.productId === result.data.productId ? result.data : i
          )
        );
      } else {
        // Rollback on failure
        setItems((prev) =>
          prev.filter((i) => i.productId !== item.productId)
        );
      }
    });
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    // Optimistic remove
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));

    startTransition(async () => {
      await removeFromCartAction(cartItemId);
    });
  }, []);

  /** Remove multiple items at once (e.g. after a successful selective checkout) */
  const removeItems = useCallback((cartItemIds: string[]) => {
    const idSet = new Set(cartItemIds);
    setItems((prev) => prev.filter((i) => !idSet.has(i.id)));

    startTransition(async () => {
      await Promise.all(cartItemIds.map((id) => removeFromCartAction(id)));
    });
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(cartItemId);
      return;
    }
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
    );

    startTransition(async () => {
      await updateCartQuantityAction(cartItemId, quantity);
    });
  }, [removeItem]);

  const clearCart = useCallback(() => {
    // Optimistic clear
    setItems([]);

    startTransition(async () => {
      await clearCartAction();
    });
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const totalPrice = useMemo(
    () => items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [items]
  );
  const totalItems = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading: isPending,
        addItem,
        removeItem,
        removeItems,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
        isCartOpen,
        openCart,
        closeCart,
        isAuthenticated: !!userId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
