import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Add item to cart
      addItem: (product) => {
        const items = get().items;
        const existing = items.find((item) => item.id === product.id);
        
        if (existing) {
          // Check stock before increasing
          if (existing.quantity >= product.stock) return false;
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          if (product.stock <= 0) return false;
          set({
            items: [
              ...items,
              {
                id: product.id,
                name: product.name,
                name_ta: product.name_ta || '',
                name_hi: product.name_hi || '',
                name_te: product.name_te || '',
                name_kn: product.name_kn || '',
                name_ml: product.name_ml || '',
                price: product.price,
                image_url: product.image_url,
                weight: product.weight,
                stock: product.stock,
                quantity: 1,
              },
            ],
          });
        }
        return true;
      },

      // Remove item from cart
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },

      // Update quantity
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const item = get().items.find((i) => i.id === productId);
        if (item && quantity > item.stock) return; // Don't exceed stock
        
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      // Increase quantity by 1
      incrementQuantity: (productId) => {
        const item = get().items.find((i) => i.id === productId);
        if (item && item.quantity < item.stock) {
          get().updateQuantity(productId, item.quantity + 1);
        }
      },

      // Decrease quantity by 1
      decrementQuantity: (productId) => {
        const item = get().items.find((i) => i.id === productId);
        if (item) {
          get().updateQuantity(productId, item.quantity - 1);
        }
      },

      // Clear cart
      clearCart: () => set({ items: [] }),

      // Get total items count
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Get subtotal
      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      // Get item quantity in cart
      getItemQuantity: (productId) => {
        const item = get().items.find((i) => i.id === productId);
        return item ? item.quantity : 0;
      },

      // Check if item is in cart
      isInCart: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
    }),
    {
      name: 'amk-cart',
    }
  )
);

export default useCartStore;
