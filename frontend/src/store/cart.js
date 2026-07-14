import { create } from "zustand";

export const useCart = create((set) => ({
  items: [],
  total: 0,
  setCart: (items, total) => set({ items, total }),
  wishlist: [],
  setWishlist: (w) => set({ wishlist: w }),
}));
