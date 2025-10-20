import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user's active GA data source
    const ds = await prisma.dataSource.findFirst({
      where: { userId: user.id, provider: 'GOOGLE_ANALYTICS', isActive: true }
    });

    if (!ds) {
      return NextResponse.json({ success: true }); // Already disconnected
    }

    // Soft disconnect: deactivate and clear auth tokens/info needed to make GA calls
    await prisma.dataSource.update({
      where: { id: ds.id },
      data: {
        isActive: false,
        lastSync: null,
        config: {
          ...(ds as any).config,
          accessToken: null,
          refreshToken: null,
          tokenExpiry: null,
          properties: []
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('GA disconnect error:', error);
    return NextResponse.json({ error: 'Failed to disconnect Google Analytics' }, { status: 500 });
  }
}









