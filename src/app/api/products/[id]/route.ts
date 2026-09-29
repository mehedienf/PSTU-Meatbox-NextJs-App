import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const docRef = db.collection('products').doc(id);
    await docRef.update(body);
    const updatedDoc = await docRef.get();
    return NextResponse.json({ success: true, data: { _id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = await params;
    await db.collection('products').doc(id).delete();
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
