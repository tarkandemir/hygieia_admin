import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    const currentUserId = request.headers.get('x-user-id');
    
    if (!userRole || !['admin', 'manager'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = await params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Managers can only view employees
    if (userRole === 'manager' && user.role !== 'employee') {
      return NextResponse.json(
        { error: 'Bu kullanıcıyı görüntüleme yetkiniz yok' },
        { status: 403 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı alınamadı' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    const currentUserId = request.headers.get('x-user-id');
    
    await connectToDatabase();
    const { id } = await params;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Permission checks
    if (userRole === 'admin') {
      // Admin can edit anyone
    } else if (userRole === 'manager' && user.role === 'employee') {
      // Manager can edit employees
    } else if (currentUserId === id) {
      // Users can edit themselves (limited fields)
    } else {
      return NextResponse.json(
        { error: 'Bu kullanıcıyı düzenleme yetkiniz yok' },
        { status: 403 }
      );
    }

    const updates = await request.json();

    // Restrict fields based on user role
    const allowedFields = ['name', 'email'];
    if (userRole === 'admin') {
      allowedFields.push('role', 'permissions', 'isActive');
    } else if (userRole === 'manager' && user.role === 'employee') {
      allowedFields.push('isActive');
    }

    // Filter updates to only allowed fields
    const filteredUpdates: any = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    // Handle password update separately
    if (updates.password && (userRole === 'admin' || currentUserId === id)) {
      filteredUpdates.password = await hashPassword(updates.password);
    }

    // Check email uniqueness if email is being updated
    if (filteredUpdates.email && filteredUpdates.email !== user.email) {
      const existingUser = await User.findOne({ 
        email: filteredUpdates.email,
        _id: { $ne: id }
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }

    // Validate role if being updated
    if (filteredUpdates.role && !['admin', 'manager', 'employee'].includes(filteredUpdates.role)) {
      return NextResponse.json(
        { error: 'Geçersiz rol' },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      filteredUpdates,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    const currentUserId = request.headers.get('x-user-id');
    
    console.log('🗑️ Delete user request:', {
      currentUserId,
      userRole,
      targetId: 'will be set after params await'
    });
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    console.log('🗑️ Delete user details:', {
      currentUserId,
      targetId: id,
      isSameUser: currentUserId === id
    });

    // Can't delete yourself
    if (currentUserId === id) {
      console.log('❌ User trying to delete themselves');
      return NextResponse.json(
        { error: 'Kendi hesabınızı silemezsiniz' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı silinemedi' },
      { status: 500 }
    );
  }
} 