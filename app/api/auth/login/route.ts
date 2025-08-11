import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Hesabınız aktif değil. Lütfen admin ile iletişime geçin.' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    // Remove password from user object
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
    };

    const response = NextResponse.json({
      message: 'Giriş başarılı',
      user: userResponse,
      token,
    });

    // Set httpOnly cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // Development için false
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/', // Tüm sayfalarda geçerli
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 