"use client";

import { useCart } from "@/context/CartContext";
import {
  ArrowLeft,
  Clock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  weight: number;
  unit: string;
  imageUrl?: string;
  images?: string[];
  inStock: boolean;
  stockQuantity: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    async function fetchProduct() {
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        if (json.success) {
          const found = json.data.find((p: Product) => p._id === id);
          if (found) {
            setProduct(found);
            // Default to cover image or first gallery image
            const initialImg =
              found.imageUrl || (found.images && found.images[0]) || "";
            setActiveImage(initialImg);
          }
        }
      } catch (e) {
        console.error("Failed to fetch product details", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="text-6xl mb-4">🥩</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          প্রোডাক্টটি পাওয়া যায়নি!
        </h2>
        <p className="text-gray-500 mb-6">
          হয়তো প্রোডাক্টটি রিমুভ করা হয়েছে অথবা লিংকটি ভুল।
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold shadow-md transition"
        >
          <ArrowLeft size={18} />
          হোমপেজে ফিরে যান
        </Link>
      </div>
    );
  }

  // Combined list of images (cover photo + any gallery photos)
  const allImages = Array.from(
    new Set([
      ...(product.imageUrl ? [product.imageUrl] : []),
      ...(product.images || []),
    ]),
  );

  return (
    <div className="bg-gray-50/60 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 font-semibold text-sm transition"
          >
            <ArrowLeft size={18} />
            <span>সকল প্রোডাক্ট দেখুন</span>
          </Link>
        </div>

        {/* Product Details Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: Square Active Image & Gallery Thumbnails */}
            <div className="w-full flex flex-col gap-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-xs">
                {activeImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <span className="text-7xl mb-2">🥩</span>
                    <span className="font-semibold text-sm">ছবি নেই</span>
                  </div>
                )}
                {/* Stock Badge on image */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`text-xs px-3.5 py-1.5 rounded-full font-bold shadow-md backdrop-blur-xs ${
                      product.inStock && product.stockQuantity > 0
                        ? "bg-green-600/90 text-white"
                        : "bg-red-600/90 text-white"
                    }`}
                  >
                    {product.inStock && product.stockQuantity > 0
                      ? `স্টকে আছে: ${product.stockQuantity} টি`
                      : "স্টক আউট"}
                  </span>
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`relative aspect-square w-16 sm:w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        activeImage === img
                          ? "border-red-600 ring-2 ring-red-400 scale-105 shadow-sm"
                          : "border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col">
              <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full uppercase tracking-wider w-fit mb-3">
                ১০০% হালাল ও ফ্রেশ
              </span>

              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Price Tag Box */}
              <div className="flex items-baseline gap-2 mb-6 bg-red-50/70 p-4 rounded-2xl border border-red-100 w-fit">
                <span className="text-3xl sm:text-4xl font-black text-red-600">
                  ৳{product.price}
                </span>
                <span className="text-base font-bold text-gray-600">
                  / {product.weight} {product.unit}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                  বিস্তারিত বিবরণ
                </h3>
                <p className="text-gray-600 text-base leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 whitespace-pre-line">
                  {product.description ||
                    "এই প্যাকেজের বিশেষ কোনো বিবরণ পাওয়া যায়নি। এটি ১০০% হালাল ও স্বাস্থ্যসম্মত পরিবেশে প্রস্তুত।"}
                </p>
              </div>

              {/* Quantity Selector & Add to Cart */}
              <div className="border-t border-gray-100 pt-6 mb-6">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-3 bg-gray-100 rounded-full p-1 border border-gray-200">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-xs hover:text-red-600 font-bold transition"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-8 text-center font-bold text-lg text-gray-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => {
                        if (quantity < (product.stockQuantity || 1)) {
                          setQuantity(quantity + 1);
                        }
                      }}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-xs hover:text-green-600 font-bold transition"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <button
                    disabled={!product.inStock || product.stockQuantity <= 0}
                    onClick={handleAddToCart}
                    className={`flex-1 min-w-[200px] py-3.5 px-6 rounded-full font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                      product.inStock && product.stockQuantity > 0
                        ? "bg-red-600 text-white hover:bg-red-700 active:scale-98 shadow-red-600/30"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart size={20} />
                    <span>কার্টে যোগ করুন</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <Clock size={16} className="text-red-500" />
                  <span>ডেলিভারি টাইম: সকাল ৮টা থেকে সন্ধ্যা ৭টা পর্যন্ত</span>
                </div>
              </div>

              {/* Delivery info bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 text-gray-700 text-sm">
                  <Truck size={20} className="text-red-600 shrink-0" />
                  <span>
                    ক্যাম্পাসে <b>ফ্রি হোম ডেলিভারি</b>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 text-gray-700 text-sm">
                  <ShieldCheck size={20} className="text-green-600 shrink-0" />
                  <span>ক্যাশ অন ডেলিভারি (COD)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
