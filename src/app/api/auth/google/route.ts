import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      // Check if user is authenticated for generating OAuth URL
      const token = request.cookies.get("token")?.value;
      const user = token ? await verifyToken(token) : null;
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Generate OAuth URL
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google`;
      const scope = 'https://www.googleapis.com/auth/analytics.readonly';
      
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', clientId!);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', scope);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', user.id.toString());
      // Add this to bypass verification screen for testing
      authUrl.searchParams.set('include_granted_scopes', 'true');

      return NextResponse.json({ authUrl: authUrl.toString() });
    }

    // Handle OAuth callback - use state parameter to identify user
    if (!state) {
      throw new Error('Missing state parameter');
    }

    const userId = parseInt(state);
    if (isNaN(userId)) {
      throw new Error('Invalid state parameter');
    }

    // Verify user exists (optional check)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google`,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokens.error || 'Failed to exchange code for tokens');
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();

    // Get GA4 properties
    const propertiesResponse = await fetch('https://analyticsadmin.googleapis.com/v1beta/accounts', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const properties = await propertiesResponse.json();

    // Store or update Google Analytics connection
    const dataSource = await prisma.dataSource.upsert({
      where: {
        userId_provider: {
          userId: userId,
          provider: 'GOOGLE_ANALYTICS'
        }
      },
      update: {
        config: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
          userInfo,
          properties: properties.accounts || []
        },
        lastSync: new Date(),
        syncStatus: 'SUCCESS'
      },
      create: {
        name: 'Google Analytics',
        provider: 'GOOGLE_ANALYTICS',
        isActive: true,
        config: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
          userInfo,
          properties: properties.accounts || []
        },
        userId: userId,
        lastSync: new Date(),
        syncStatus: 'SUCCESS'
      }
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/import?ga_connected=true`);

  } catch (error: any) {
    console.error('Google OAuth error:', error);
    
    // Handle specific OAuth errors
    if (error.message.includes('access_denied') || error.message.includes('verification')) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/import?ga_error=verification_required`);
    }
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/import?ga_error=${encodeURIComponent(error.message)}`);
  }
}


