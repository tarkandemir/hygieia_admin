import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    
    if (!userRole || !['admin', 'manager'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Managers can only see employees
    let filter = {};
    if (userRole === 'manager') {
      filter = { role: 'employee' };
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { email, password, name, role, permissions, isActive } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    if (!['admin', 'manager', 'employee'].includes(role)) {
      return NextResponse.json(
        { error: 'Geçersiz rol' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      permissions: permissions || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    await user.save();

    // Return user without password
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulamadı' },
      { status: 500 }
    );
  }
} 