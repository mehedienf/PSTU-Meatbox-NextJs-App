import { db } from "@/lib/firebase";
import { sendTelegramNotification } from "@/lib/telegram";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const snapshot = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();
    const orders = snapshot.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      (req as unknown as { ip?: string }).ip ||
      "127.0.0.1";

    // 1. Check if IP is blocked
    const blockedSnapshot = await db
      .collection("blockedIPs")
      .where("ipAddress", "==", ipAddress)
      .get();
    if (!blockedSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Your IP is blocked from placing orders" },
        { status: 403 },
      );
    }

    // 2. Check if IP exceeded daily limit (3 orders)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Query by IP address (no composite index required)
    const ordersSnapshot = await db
      .collection("orders")
      .where("ipAddress", "==", ipAddress)
      .get();

    // Filter today's orders in JavaScript to avoid Firestore index requirement
    const todayOrdersCount = ordersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt;
      return (
        createdAt &&
        createdAt >= today.toISOString() &&
        createdAt < tomorrow.toISOString()
      );
    }).length;

    if (todayOrdersCount >= 3) {
      return NextResponse.json(
        {
          success: false,
          error: "You have reached the maximum daily limit of 3 orders.",
        },
        { status: 429 },
      );
    }

    // 3. Create Order
    const body = await req.json();
    const newOrder = {
      ...body,
      ipAddress,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("orders").add(newOrder);

    // 4. Send Telegram Notification
    try {
      await sendTelegramNotification({
        _id: docRef.id,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        customerAddress: newOrder.customerAddress,
        items: newOrder.items || [],
        totalAmount: newOrder.totalAmount,
        paymentMethod: newOrder.paymentMethod,
      });
    } catch (telegramErr) {
      console.error("Telegram notification error:", telegramErr);
    }

    return NextResponse.json(
      { success: true, data: { _id: docRef.id, ...newOrder } },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
