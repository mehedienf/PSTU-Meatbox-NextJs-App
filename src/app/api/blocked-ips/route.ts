import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const snapshot = await db.collection('blockedIPs').orderBy('createdAt', 'desc').get();
    const ips = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: ips });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newIP = {
      ...body,
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection('blockedIPs').add(newIP);
    return NextResponse.json({ success: true, data: { _id: docRef.id, ...newIP } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
