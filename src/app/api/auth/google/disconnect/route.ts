import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the GA connection for this user
    const gaConnection = await prisma.dataSource.findFirst({
      where: {
        userId: user.id,
        provider: 'GOOGLE_ANALYTICS'
      }
    });

    if (!gaConnection) {
      return NextResponse.json(
        { error: 'No Google Analytics connection found' },
        { status: 404 }
      );
    }

    // Delete the GA connection
    await prisma.dataSource.delete({
      where: { id: gaConnection.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Google Analytics disconnected successfully'
    });

  } catch (error: any) {
    console.error('GA disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Analytics' },
      { status: 500 }
    );
  }
}











