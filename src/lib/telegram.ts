function escapeHtml(text: string | number = ""): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface TelegramOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface TelegramOrderPayload {
  _id?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: TelegramOrderItem[];
  totalAmount: number;
  paymentMethod?: string;
}

export async function sendTelegramNotification(order: TelegramOrderPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "Telegram bot credentials not configured in environment variables.",
    );
    return;
  }

  const itemsList =
    order.items && order.items.length > 0
      ? order.items
          .map(
            (item) =>
              `• <b>${escapeHtml(item.name)}</b> x ${item.quantity} = ৳${
                item.price * item.quantity
              }`,
          )
          .join("\n")
      : "কোনো আইটেম নেই";

  const dateStr = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const message = `🚨 <b>নতুন অর্ডার এসেছে! (PSTU Meatbox)</b>

👤 <b>গ্রাহকের নাম:</b> ${escapeHtml(order.customerName)}
📞 <b>ফোন নম্বর:</b> <code>${escapeHtml(order.customerPhone)}</code>
📍 <b>ঠিকানা:</b> ${escapeHtml(order.customerAddress)}

🛍️ <b>অর্ডারকৃত পণ্য:</b>
${itemsList}

💰 <b>মোট মূল্য:</b> ৳${order.totalAmount}
💳 <b>পেমেন্ট মেথড:</b> ${escapeHtml(order.paymentMethod || "COD")}
🆔 <b>অর্ডার আইডি:</b> <code>${escapeHtml(order._id || "N/A")}</code>
⏰ <b>সময়:</b> ${dateStr}`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      },
    );

    const data = await res.json();
    if (!data.ok) {
      console.error("Failed to send Telegram notification:", data);
    }
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
}
