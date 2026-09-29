"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingCart, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, useSyncExternalStore } from "react";

export default function Navbar() {
  const { cart } = useCart();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [isBumping, setIsBumping] = useState(false);
  const prevCountRef = useRef(0);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    if (cartCount > prevCountRef.current && mounted) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 600);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = cartCount;
  }, [cartCount, mounted]);

  return (
    <header className="bg-white/75 backdrop-blur-md border-b border-gray-200/60 text-gray-900 shadow-xs sticky top-0 z-50 transition-colors">
      <div className="w-full px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="PSTU Meatbox Logo"
              width={140}
              height={56}
              priority
              className="h-14 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="px-4 py-2 hover:bg-gray-100/80 rounded-full transition font-bold text-sm sm:text-base text-gray-800"
          >
            হোম
          </Link>
          <Link
            href="/cart"
            className={`relative px-4 py-2 hover:bg-gray-100/80 rounded-full transition-all duration-300 flex items-center gap-1.5 font-bold text-sm sm:text-base text-gray-800 transform ${
              isBumping ? "scale-115 bg-red-50 text-red-600 ring-2 ring-red-600 shadow-xs" : "scale-100"
            }`}
          >
            <ShoppingCart
              size={20}
              className={`transition-transform duration-300 ${
                isBumping ? "scale-125 -rotate-12 text-red-600" : "text-gray-700"
              }`}
            />
            <span>কার্ট</span>
            {mounted && cartCount > 0 && (
              <>
                {isBumping && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-transparent text-xs w-5 h-5 rounded-full animate-ping pointer-events-none"></span>
                )}
                <span
                  className={`absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm transition-transform duration-300 ${
                    isBumping ? "scale-130" : "scale-100"
                  }`}
                >
                  {cartCount}
                </span>
              </>
            )}
          </Link>
        </nav>

        {/* Right: Phone Number */}
        <div className="flex-1 flex justify-end items-center">
          <a
            href="tel:01770936824"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition text-sm sm:text-base font-bold shadow-sm active:scale-95"
          >
            <Phone size={17} className="text-yellow-300" />
            <span className="hidden sm:inline">অর্ডার:</span>
            <span>01770-936824</span>
          </a>
        </div>
      </div>
    </header>
  );
}
