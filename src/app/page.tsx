'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, ShieldCheck, Clock, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  weight: number;
  unit: string;
  imageUrl?: string;
  inStock: boolean;
  stockQuantity: number;
}

interface Banner {
  _id: string;
  imageUrl: string;
  title?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, bannerRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/banners'),
        ]);

        const prodJson = await prodRes.json();
        if (prodJson.success) setProducts(prodJson.data);

        const bannerJson = await bannerRes.json();
        if (bannerJson.success && bannerJson.data.length > 0) {
          setBanners(bannerJson.data);
        } else {
          setBanners([{ _id: 'default', imageUrl: '/heroBanner01.jpg', title: 'Special Offer' }]);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Automatic slide change every 6 seconds (slower & comfortable) with pause-on-hover
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="pb-12 bg-white min-h-screen">
      {/* Featured Banner Slider + Side Features Section */}
      <div className="container mx-auto px-4 max-w-7xl pt-4 sm:pt-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
          {/* Left: Featured Banner Slider with Smooth Sliding Animation (3 cols on desktop) */}
          <div
            className="lg:col-span-3 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-gray-100 bg-white relative group min-h-[160px] sm:min-h-[220px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {banners.length > 0 ? (
              <div className="relative w-full h-full overflow-hidden">
                {/* Sliding Track */}
                <div
                  className="flex transition-transform duration-700 ease-in-out h-full"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {banners.map((banner, idx) => (
                    <div
                      key={banner._id || idx}
                      className="w-full shrink-0 h-full relative aspect-[21/9] sm:aspect-auto"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={banner.imageUrl}
                        alt={banner.title || `PSTU Meatbox Banner ${idx + 1}`}
                        className="w-full h-full object-cover block"
                      />
                    </div>
                  ))}
                </div>

                {/* Arrow Controls (Visible if multiple banners) */}
                {banners.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/75 text-white p-2.5 rounded-full backdrop-blur-xs transition opacity-90 sm:opacity-0 group-hover:opacity-100 shadow-lg active:scale-95"
                      title="Previous Banner"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/75 text-white p-2.5 rounded-full backdrop-blur-xs transition opacity-90 sm:opacity-0 group-hover:opacity-100 shadow-lg active:scale-95"
                      title="Next Banner"
                    >
                      <ChevronRight size={20} />
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/35 backdrop-blur-xs px-3 py-1.5 rounded-full shadow-sm">
                      {banners.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            currentSlide === idx
                              ? 'w-6 bg-yellow-400 shadow-xs'
                              : 'w-2 bg-white/70 hover:bg-white'
                          }`}
                          title={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full aspect-[21/9] bg-gray-100 flex items-center justify-center text-gray-400">
                ব্যানার লোড হচ্ছে...
              </div>
            )}
          </div>

          {/* Right: 3 Feature Cards (1 col on desktop, stacked vertically) */}
          <div className="lg:col-span-1 flex flex-col justify-between gap-3 sm:gap-4">
            <div className="bg-red-50/80 border border-red-100 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-xs flex-1">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug">
                  ১০০% হালাল ও তাজা
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">স্বাস্থ্যসম্মত পরিবেশে প্রস্তুত</p>
              </div>
            </div>

            <div className="bg-yellow-50/80 border border-yellow-200 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-xs flex-1">
              <div className="w-12 h-12 rounded-full bg-yellow-500 text-red-900 flex items-center justify-center shrink-0 shadow-sm">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug">
                  ক্যাম্পাসে হোম ডেলিভারি
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">হল ও মেসের ঠিকানায় পৌঁছে দেওয়া হয়</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-xs flex-1">
              <div className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug">
                  সময়মতো ডেলিভারি
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">সকাল ৮টা থেকে সন্ধ্যা ৭টা</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section (Main Focus) */}
      <div id="products" className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-l-4 border-red-600 pl-3">
            আমাদের প্যাকেজ সমূহ
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            দুঃখিত, বর্তমানে কোনো প্রোডাক্ট এভেইলেবল নেই।
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-red-200 transition-all duration-200 flex flex-col overflow-hidden group"
              >
                <Link
                  href={`/products/${product._id}`}
                  className="relative overflow-hidden aspect-square bg-gray-50 block cursor-pointer"
                >
                  {product.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <span className="text-4xl mb-1">🥩</span>
                      <span className="text-xs font-medium">ছবি নেই</span>
                    </div>
                  )}
                  {/* Stock Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-sm ${
                        product.inStock && product.stockQuantity > 0
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {product.inStock && product.stockQuantity > 0
                        ? `স্টক: ${product.stockQuantity}`
                        : 'স্টক আউট'}
                    </span>
                  </div>
                </Link>

                <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between">
                  <Link href={`/products/${product._id}`}>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1 mb-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-lg sm:text-2xl font-black text-red-600">
                        ৳{product.price}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        / {product.weight} {product.unit}
                      </span>
                    </div>
                  </Link>

                  <button
                    disabled={!product.inStock || product.stockQuantity <= 0}
                    onClick={() => addToCart(product)}
                    className={`w-full py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                      product.inStock && product.stockQuantity > 0
                        ? 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart size={15} />
                    কার্টে যোগ করুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
