import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const snapshot = await db
      .collection("banners")
      .orderBy("createdAt", "desc")
      .get();
    let banners: any[] = snapshot.docs.map((doc) => ({
      _id: doc.id,
      ...doc.data(),
    }));

    // If no banners are added yet, fallback to default initial heroBanner01
    if (banners.length === 0) {
      banners = [
        {
          _id: "default-banner",
          imageUrl: "/heroBanner01.jpg",
          title: "Default Banner",
          isDefault: true,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    return NextResponse.json({ success: true, data: banners });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.imageUrl) {
      return NextResponse.json(
        { success: false, error: "Image URL is required" },
        { status: 400 },
      );
    }

    const newBanner = {
      imageUrl: body.imageUrl,
      title: body.title || "Banner",
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("banners").add(newBanner);
    return NextResponse.json(
      { success: true, data: { _id: docRef.id, ...newBanner } },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
