import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();

// Used to clear chat history
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

    // Account for chat histories with and without report context
    const where: any = { 
      userId: user.id, 
      source
    };
    if (reportId != null) {
      where.Report = { some: { id: Number(reportId) } };
    }

    // Clear chat history for user in the relevant chat window and with relevant discussed data
    await prisma.chatMessage.deleteMany({
      where
    });

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error("Clear chat history error:", error);
    return NextResponse.json(
      { error: "Failed to clear chat history" },
      { status: 500 }
    );
  }
}