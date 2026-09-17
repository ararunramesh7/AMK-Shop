import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  quantity: number;
  image_url: string | null;
  weight: string | null;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: any) => boolean;
  removeItem: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product) => {
    const { items } = get();
    const existing = items.find((i) => i.id === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) return false;
      set({
        items: items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
      return true;
    }

    if (product.stock <= 0) return false;
    set({ items: [...items, { ...product, quantity: 1 }] });
    return true;
  },
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  incrementQuantity: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id && i.quantity < i.stock
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ),
    })),
  decrementQuantity: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id && i.quantity > 1
          ? { ...i, quantity: i.quantity - 1 }
          : i
      ),
    })),
  clearCart: () => set({ items: [] }),
  getSubtotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
  isInCart: (id) => {
    return get().items.some((i) => i.id === id);
  },
}));
