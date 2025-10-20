import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Used to fetch chat history
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source") ?? "WINDOW";
    let reportId = searchParams.get("reportId") ?? null;

    // Convert string from URL back to null value
    if (reportId == "null") reportId = null;

    console.log("Loading chat history for report:", reportId);

    // Account for chat histories with and without report context
    const where: any = { 
      userId: user.id, 
      source
    };
    if (reportId != null) {
      const isNumeric = /^\d+$/.test(reportId);
      where.Report = isNumeric
        ? { some: { id: Number(reportId) } }
        : { some: { content: { path: ['importId'], equals: reportId } } };
    }

    // Get chat history for user
    const chatHistory = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        message: true,
        response: true,
        type: true,
        createdAt: true,
        Report: true
      }
    });

    return NextResponse.json({
      success: true,
      chatHistory: chatHistory.reverse() // Show oldest first
    });

  } catch (error) {
    console.error("Fetch chat history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}