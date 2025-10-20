import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { message: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'If an account exists, a password reset email will be sent.' },
                { status: 200 }
            );
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save reset token to database
        await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        // Send reset email
        const emailResult = await sendPasswordResetEmail(email, resetToken);

        if (!emailResult.success) {
            throw new Error('Failed to send reset email');
        }

        return NextResponse.json(
            { message: 'If an account exists, a password reset email will be sent.' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { message: 'An error occurred while processing your request.' },
            { status: 500 }
        );
    }
} 