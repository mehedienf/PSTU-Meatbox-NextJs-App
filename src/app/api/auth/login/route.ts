import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (username === adminUsername && password === adminPassword) {
      // In a real application, you'd generate a JWT here
      // For this lightweight app, we'll just set a simple cookie
      const response = NextResponse.json({ success: true }, { status: 200 });
      response.cookies.set({
        name: "admin_auth",
        value: "authenticated",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
