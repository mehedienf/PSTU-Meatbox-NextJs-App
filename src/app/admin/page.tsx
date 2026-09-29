"use client";

import { MessageCircle, Edit2, Trash2, Plus, Upload, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

interface OrderItem {
  meatId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status: string;
  ipAddress: string;
  createdAt: string;
}

interface Banner {
  _id: string;
  imageUrl: string;
  title?: string;
  isDefault?: boolean;
  createdAt?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "banners">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Banner Upload State
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState("");
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Form State for Products
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    weight: "1",
    unit: "kg",
    imageUrl: "",
    additionalImages: "",
    inStock: true,
    stockQuantity: "0",
  });

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchBanners();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (e) {
      console.error("Failed to fetch products", e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const json = await res.json();
      if (json.success) setOrders(json.data);
    } catch (e) {
      console.error("Failed to fetch orders", e);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners");
      const json = await res.json();
      if (json.success) setBanners(json.data);
    } catch (e) {
      console.error("Failed to fetch banners", e);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleAddNewProduct = () => {
    setEditingProductId(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      weight: "1",
      unit: "kg",
      imageUrl: "",
      additionalImages: "",
      inStock: true,
      stockQuantity: "0",
    });
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product._id);
    const extra = (product.images || [])
      .filter((img) => img !== product.imageUrl)
      .join("\n");

    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      weight: String(product.weight || 1),
      unit: product.unit || "kg",
      imageUrl: product.imageUrl || (product.images?.[0] || ""),
      additionalImages: extra,
      inStock: product.inStock ?? true,
      stockQuantity: String(product.stockQuantity || 0),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const coverUrl = formData.imageUrl.trim();
      const extraList = formData.additionalImages
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const allImages = Array.from(
        new Set([...(coverUrl ? [coverUrl] : []), ...extraList])
      );

      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        weight: Number(formData.weight),
        unit: formData.unit,
        imageUrl: coverUrl || (allImages[0] || ""),
        images: allImages,
        inStock: Boolean(formData.inStock),
        stockQuantity: Number(formData.stockQuantity),
      };

      let res;
      if (editingProductId) {
        res = await fetch(`/api/products/${editingProductId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setEditingProductId(null);
        toast.success(
          editingProductId
            ? "Product updated successfully!"
            : "Product saved successfully!"
        );
        fetchProducts();
      } else {
        toast.error(json.error || "Failed to save product");
      }
    } catch (err) {
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      toast.success("Product deleted");
      fetchProducts();
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    let msg = `Change order status to ${status}?`;
    if (status === "Confirmed") {
      msg = "Are you sure you want to confirm this order? Stock will be reduced.";
    }

    if (confirm(msg)) {
      try {
        const res = await fetch(`/api/orders/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        const json = await res.json();
        if (json.success) {
          toast.success(`Order marked as ${status}`);
          fetchOrders();
          if (status === "Confirmed") fetchProducts();
        } else {
          toast.error(json.error);
        }
      } catch (err) {
        toast.error("Failed to update status");
      }
    }
  };

  const openWhatsApp = (phone: string) => {
    let formattedPhone = phone;
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "88" + formattedPhone;
    }
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };

  // Banner Handlers
  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFile) {
      toast.error("Please select a banner image file first");
      return;
    }

    setUploadingBanner(true);
    try {
      // 1. Upload file to /api/upload
      const uploadFormData = new FormData();
      uploadFormData.append("file", bannerFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) {
        toast.error(uploadJson.error || "Failed to upload file");
        setUploadingBanner(false);
        return;
      }

      // 2. Save banner record to /api/banners
      const bannerRes = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadJson.url,
          title: bannerTitle.trim() || bannerFile.name,
        }),
      });

      const bannerJson = await bannerRes.json();
      if (bannerJson.success) {
        toast.success("Banner uploaded and added successfully!");
        setBannerFile(null);
        setBannerPreview(null);
        setBannerTitle("");
        fetchBanners();
      } else {
        toast.error(bannerJson.error || "Failed to save banner");
      }
    } catch (err) {
      toast.error("Error uploading banner");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleDeleteBanner = async (banner: Banner) => {
    if (banner.isDefault) {
      toast.error("Default initial banner cannot be deleted");
      return;
    }

    if (confirm("Are you sure you want to delete this banner?")) {
      try {
        const res = await fetch(`/api/banners/${banner._id}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (json.success) {
          toast.success("Banner deleted successfully");
          fetchBanners();
        } else {
          toast.error(json.error || "Failed to delete banner");
        }
      } catch (e) {
        toast.error("Failed to delete banner");
      }
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold text-sm transition"
        >
          Logout
        </button>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("products")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm sm:text-base ${
              activeTab === "products"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm sm:text-base ${
              activeTab === "orders"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("banners")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm sm:text-base ${
              activeTab === "banners"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Banners ({banners.length})
          </button>
        </nav>
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === "products" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Products List</h2>
            <button
              onClick={handleAddNewProduct}
              className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus size={18} />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Price / Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {product.imageUrl || (product.images && product.images[0]) ? (
                          <div className="relative">
                            <img
                              src={product.imageUrl || product.images?.[0]}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                            {product.images && product.images.length > 1 && (
                              <span className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                                +{product.images.length - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                            🥩
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                      ৳{product.price} / {product.weight} {product.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">
                      {product.stockQuantity || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                          product.inStock && product.stockQuantity > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inStock && product.stockQuantity > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No products found. Click &quot;Add New Product&quot; to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === "orders" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Orders List</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-900">
                        {order.customerName}
                      </h3>
                      <button
                        onClick={() => openWhatsApp(order.customerPhone)}
                        className="text-green-600 hover:text-green-700 bg-green-50 p-1.5 rounded-full transition"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle size={18} />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-gray-600 mt-0.5">
                      {order.customerPhone}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {order.customerAddress}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Ordered at: {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                        order.status === "Confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                    <p className="mt-2 font-black text-xl text-gray-900">
                      Total: ৳{order.totalAmount}
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-2 text-gray-500">
                    Ordered Items:
                  </h4>
                  <ul className="text-sm space-y-1.5">
                    {order.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between border-b border-gray-200/60 last:border-0 pb-1"
                      >
                        <span className="text-gray-800 font-medium">
                          {item.name}{" "}
                          <span className="font-bold text-red-600">
                            (x{item.quantity})
                          </span>
                        </span>
                        <span className="font-bold text-gray-700">৳{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 justify-end">
                  {order.status === "Pending" && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order._id, "Confirmed")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 font-bold transition shadow-sm"
                      >
                        Confirm Order
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order._id, "Cancelled")}
                        className="bg-red-600 text-white px-4 py-2 rounded-full text-sm hover:bg-red-700 font-bold transition shadow-sm"
                      >
                        Cancel Order
                      </button>
                    </>
                  )}
                  {order.status === "Confirmed" && (
                    <button
                      onClick={() => updateOrderStatus(order._id, "Delivered")}
                      className="bg-green-600 text-white px-4 py-2 rounded-full text-sm hover:bg-green-700 font-bold transition shadow-sm"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-center text-gray-500 py-8">No orders found.</p>
            )}
          </div>
        </div>
      )}

      {/* BANNERS TAB */}
      {activeTab === "banners" && (
        <div className="space-y-8">
          {/* Upload Banner Box */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Upload New Hero Banner</h2>
            <p className="text-sm text-gray-500 mb-6">
              Upload images directly to the server (saved in <code className="bg-gray-100 px-2 py-0.5 rounded text-red-600">public/uploads</code>). These will auto-slide on the homepage.
            </p>

            <form onSubmit={handleUploadBanner} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Banner Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Offer Banner"
                  className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-2 focus:ring-red-500"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Select Banner Image <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                />
              </div>

              {bannerPreview && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Preview:</p>
                  <div className="rounded-xl overflow-hidden border border-gray-200 max-h-48 bg-gray-50 flex items-center">
                    <img src={bannerPreview} alt="Selected preview" className="w-full h-auto object-cover" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploadingBanner || !bannerFile}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                <Upload size={18} />
                <span>{uploadingBanner ? "Uploading to /uploads..." : "Upload Banner"}</span>
              </button>
            </form>
          </div>

          {/* Active Banners Grid */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Sliding Banners ({banners.length})</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner, index) => (
                <div
                  key={banner._id}
                  className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition bg-gray-50 flex flex-col"
                >
                  <div className="relative aspect-[21/9] w-full bg-gray-100 overflow-hidden">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || `Banner ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                      Slide #{index + 1}
                    </div>
                  </div>

                  <div className="p-4 flex justify-between items-center bg-white flex-grow">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm truncate max-w-[200px] sm:max-w-xs">
                        {banner.title || "Hero Banner"}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px] sm:max-w-xs font-mono">
                        {banner.imageUrl}
                      </p>
                    </div>

                    {!banner.isDefault ? (
                      <button
                        onClick={() => handleDeleteBanner(banner)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg font-semibold flex items-center gap-1 transition text-xs"
                        title="Delete Banner"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {editingProductId ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Chicken Box / Beef Box"
                  className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Short description of the product"
                  className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Price (৳) <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="100"
                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Weight <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="any"
                    placeholder="1"
                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Unit</label>
                  <select
                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="kg">kg</option>
                    <option value="gm">gm</option>
                    <option value="piece">piece</option>
                    <option value="box">box</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="10"
                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Cover Image URL <span className="text-xs font-normal text-gray-500">(কার্ডে দেখাবে)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://... (Cover photo)"
                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Additional Images URLs <span className="text-xs font-normal text-gray-500">(প্রতি লাইনে ১টি করে লিংক দিন)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="https://example.com/photo2.jpg&#10;https://example.com/photo3.jpg"
                  className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  value={formData.additionalImages}
                  onChange={(e) => setFormData({ ...formData, additionalImages: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300"
                />
                <label htmlFor="inStock" className="text-sm font-bold text-gray-800">
                  Mark as Available In Stock
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-full font-bold text-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-md transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingProductId ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
