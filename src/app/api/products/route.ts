import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
    const products = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newProduct = {
      ...body,
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection('products').add(newProduct);
    return NextResponse.json({ success: true, data: { _id: docRef.id, ...newProduct } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
