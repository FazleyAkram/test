import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET request to validate token
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Token is required.' }, { status: 400 });
        }

        // Find user by reset token and check expiry
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gte: new Date() },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
        }

        return NextResponse.json({ valid: true }, { status: 200 });
    } catch (error) {
        console.error('Token validation error:', error);
        return NextResponse.json({ error: 'An error occurred while validating the token.' }, { status: 500 });
    }
}

// POST request to reset password
export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();
        
        if (!token || !password) {
            return NextResponse.json({ error: 'Missing token or password.' }, { status: 400 });
        }

        // Find user by reset token and check expiry
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gte: new Date() },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password and clear reset token/expiry
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return NextResponse.json({ message: 'Password reset successful. You can now log in.' }, { status: 200 });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'An error occurred while resetting your password.' }, { status: 500 });
    }
} 