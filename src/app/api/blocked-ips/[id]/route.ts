import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = await params;
    await db.collection('blockedIPs').doc(id).delete();
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
