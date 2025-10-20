import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sendSignupPendingEmail } from "@/lib/email";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, company } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with isApproved set to false
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        company: company ?? null,
        isApproved: false,
        isAdmin: false
      }
    });

    // Fire-and-forget signup email (do not block signup on email failure)
    sendSignupPendingEmail(email, { firstName });

    return NextResponse.json({
      message: "Account created. Awaiting admin approval before login.",
      userId: user.id
    });
  } catch (error) {
    console.error("Error in signup:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
} 