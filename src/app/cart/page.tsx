"use client";

import { useCart } from "@/context/CartContext";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } =
    useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("আপনার কার্ট খালি!");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        items: cart.map((item) => ({
          meatId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: cartTotal,
        paymentMethod: "COD",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.status === 429) {
        toast.error(data.error || "অর্ডার লিমিট শেষ!");
      } else if (res.status === 403) {
        toast.error(data.error || "আপনার আইপি ব্লক করা হয়েছে!");
      } else if (!data.success) {
        toast.error(data.error || "অর্ডার করতে সমস্যা হয়েছে।");
      } else {
        toast.success("অর্ডার সফলভাবে সম্পন্ন হয়েছে!");
        clearCart();
        router.push("/");
      }
    } catch (err) {
      toast.error("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-red-50 p-6 rounded-full mb-4">
          <ShoppingBag size={64} className="text-red-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          আপনার কার্ট খালি!
        </h2>
        <p className="text-gray-500 mb-6">
          মনে হচ্ছে আপনি এখনো কোনো প্রোডাক্ট কার্টে যোগ করেননি।
        </p>
        <Link
          href="/"
          className="bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition"
        >
          কেনাকাটা শুরু করুন
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">আপনার কার্ট</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {cart.map((item) => (
                <li
                  key={item._id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 hover:bg-gray-50 transition"
                >
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        ছবি নেই
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-800">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      ৳{item.price} / {item.weight} {item.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-100 rounded-full p-1">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:text-red-600 transition"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:text-green-600 transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2 w-full sm:w-auto">
                    <p className="font-bold text-lg text-gray-800">
                      ৳{item.price * item.quantity}
                    </p>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-400 hover:text-red-600 text-sm flex items-center gap-1 transition"
                    >
                      <Trash2 size={16} />{" "}
                      <span className="sm:hidden">রিমুভ করুন</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold border-b pb-4 mb-4 text-gray-800">
              অর্ডার সামারি
            </h2>
            <div className="flex justify-between mb-2 text-gray-600">
              <span>সাবটোটাল</span>
              <span className="font-semibold">৳{cartTotal}</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600 border-b pb-4">
              <span>ডেলিভারি চার্জ</span>
              <span className="font-semibold">Cash on Delivery</span>
            </div>
            <div className="flex justify-between mb-6 text-xl font-black text-red-600">
              <span>মোট</span>
              <span>৳{cartTotal}</span>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  আপনার নাম <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="যেমন: রহিম ইসলাম"
                  className="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-red-500 focus:border-red-500"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  ফোন নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  placeholder="যেমন: 017XXXXXXXX"
                  className="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-red-500 focus:border-red-500"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  ডেলিভারি ঠিকানা <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="PSTU ক্যাম্পাস, হল বা বাসার ঠিকানা বিস্তারিত লিখুন"
                  className="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-red-500 focus:border-red-500"
                  value={formData.customerAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerAddress: e.target.value,
                    })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-full font-bold text-lg text-white shadow-md transition-all active:scale-95 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading ? "অর্ডার হচ্ছে..." : "অর্ডার কনফার্ম করুন (COD)"}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                * অর্ডারের পর ডেলিভারি ম্যান আপনার সাথে যোগাযোগ করবে।
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
