import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const sessions = new Map<string, { username: string; expiresAt: Date }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Get credentials from environment (server-side only)
    const validUsername = process.env.TNEXT_PATIENT_USERNAME;
    const validPassword = process.env.TNEXT_PATIENT_PW;

    if (!validUsername || !validPassword) {
      console.error('Server configuration error: Missing authentication credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Validate credentials
    if (username !== validUsername || password !== validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session token
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session
    sessions.set(sessionId, {
      username,
      expiresAt
    });

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    });

    return NextResponse.json({
      success: true,
      user: { username }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Verify session endpoint
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const session = sessions.get(sessionId);

    if (!session || session.expiresAt < new Date()) {
      // Session expired or not found
      if (session) sessions.delete(sessionId);
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: { username: session.username }
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}