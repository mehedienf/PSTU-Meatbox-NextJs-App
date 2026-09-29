import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const docRef = db.collection('orders').doc(id);
    
    // Check if status is being updated to "Confirmed"
    if (body.status === 'Confirmed') {
      const orderSnap = await docRef.get();
      if (!orderSnap.exists) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }

      const orderData = orderSnap.data();
      if (orderData?.status !== 'Confirmed') {
        // Decrement stock for each item using a batch
        const batch = db.batch();
        for (const item of orderData?.items || []) {
          const meatRef = db.collection('products').doc(item.meatId);
          batch.update(meatRef, {
            stockQuantity: FieldValue.increment(-item.quantity)
          });
        }
        await batch.commit();
      }
    }

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
    await db.collection('orders').doc(id).delete();
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
