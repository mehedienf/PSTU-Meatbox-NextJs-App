import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "PSTU Meatbox",
  description: "Fresh meat delivery for PSTU",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <CartProvider>
          <Navbar />
          <main className="flex-grow min-h-[70vh] bg-gray-50">{children}</main>
          <footer className="bg-gray-800 text-white py-6 text-center mt-auto">
            <p>
              &copy; {new Date().getFullYear()} PSTU Meatbox. All Rights
              Reserved.
            </p>
          </footer>
          <Toaster position="bottom-right" />
        </CartProvider>
      </body>
    </html>
  );
}
