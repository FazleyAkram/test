import nodemailer from 'nodemailer';

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not your regular Gmail password
    },
});

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Password Reset Request</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}" 
                   style="display: inline-block; 
                          background-color: #4CAF50; 
                          color: white; 
                          padding: 10px 20px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          margin: 20px 0;">
                    Reset Password
                </a>
                <p>If you didn't request this, please ignore this email.</p>
                <p style="color: #666; font-size: 0.9em;">This link will expire in 1 hour.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error };
    }
}; 

export const sendSignupPendingEmail = async (
    email: string,
    options?: { firstName?: string }
) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const name = options?.firstName ? options.firstName : 'there';

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Welcome to CODi – Account Pending Approval',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
                <h1 style="color: #111827; margin-bottom: 8px;">Welcome, ${name} 👋</h1>
                <p style="margin: 0 0 12px 0;">Your account has been created successfully and is currently <strong>pending admin approval</strong>.</p>
                <p style="margin: 0 0 16px 0;">You'll receive another email once your account is approved. Then you can log in here:</p>
                <p style="margin: 0 0 20px 0;"><a href="${appUrl}/login" style="display:inline-block;background:#365B5E;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">Go to Login</a></p>
                <hr style="border:none;border-top:1px solid #E5E7EB;margin:20px 0;" />
                <p style="color:#6B7280;font-size:12px;">If you didn’t sign up, you can ignore this email.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending signup pending email:', error);
        return { success: false, error };
    }
};

export const sendApprovalEmail = async (
    email: string,
    options?: { firstName?: string }
) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const name = options?.firstName ? options.firstName : 'there';

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Your CODi Account Has Been Approved',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
                <h1 style="color: #111827; margin-bottom: 8px;">You're approved, ${name}! ✅</h1>
                <p style="margin: 0 0 12px 0;">Your account has been approved. You can now log in and start using CODi.</p>
                <p style="margin: 0 0 20px 0;"><a href="${appUrl}/login" style="display:inline-block;background:#365B5E;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">Log In to CODi</a></p>
                <hr style="border:none;border-top:1px solid #E5E7EB;margin:20px 0;" />
                <p style="color:#6B7280;font-size:12px;">If you didn’t request this, please contact support.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending approval email:', error);
        return { success: false, error };
    }
};