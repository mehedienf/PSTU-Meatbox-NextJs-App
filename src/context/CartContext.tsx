"use client";

import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  weight: number;
  unit: string;
  quantity: number;
  imageUrl?: string;
  stockQuantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("meatbox_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("meatbox_cart", JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        toast.error("স্টকে এর চেয়ে বেশি নেই!");
        return;
      }
      toast.success("কার্টে পরিমাণ বাড়ানো হয়েছে");
      setCart((prev) =>
        prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      toast.success("কার্টে যোগ করা হয়েছে");
      setCart((prev) => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
    toast.success("কার্ট থেকে রিমুভ করা হয়েছে");
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    const item = cart.find((i) => i._id === id);
    if (item && qty > item.stockQuantity) {
      toast.error("স্টকে এর চেয়ে বেশি নেই!");
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item._id === id) {
          return { ...item, quantity: qty };
        }
        return item;
      }),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
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
