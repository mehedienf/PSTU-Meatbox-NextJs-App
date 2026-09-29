import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = await params;
    if (id === 'default-banner') {
      return NextResponse.json({ success: false, error: 'Cannot delete default initial banner' }, { status: 400 });
    }

    const docRef = db.collection('banners').doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      const imageUrl = data?.imageUrl;

      // If stored locally in /uploads/, delete the physical file
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        try {
          const filePath = path.join(process.cwd(), 'public', imageUrl);
          await unlink(filePath);
        } catch (fileErr) {
          console.warn('Could not delete physical banner file:', fileErr);
        }
      }

      await docRef.delete();
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
