import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

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

    // Check if the user being demoted is a super admin
    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent super admin from being demoted
    if (targetUser.isSuperAdmin) {
      return NextResponse.json(
        { error: "Cannot remove admin privileges from a super admin" },
        { status: 403 }
      );
    }

    const user = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: { isAdmin: false }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error removing admin privileges:", error);
    return NextResponse.json(
      { error: "Failed to remove admin privileges" },
      { status: 500 }
    );
  }
}
