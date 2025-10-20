import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { sendApprovalEmail } from "@/lib/email";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;

    const user = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: { isApproved: true }
    });

    // Fire-and-forget approval email
    if (user?.email) {
      sendApprovalEmail(user.email, { firstName: user.firstName ?? undefined });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error approving user:", error);
    return NextResponse.json(
      { error: "Failed to approve user" },
      { status: 500 }
    );
  }
} 