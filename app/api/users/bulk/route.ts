import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const { action, userIds, isActive, role } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Kullanıcı ID\'leri gerekli' },
        { status: 400 }
      );
    }

    let updateData = {};
    
    if (action === 'updateStatus') {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { error: 'Geçerli bir durum değeri gerekli' },
          { status: 400 }
        );
      }
      updateData = { isActive };
    } else if (action === 'updateRole') {
      if (!role || !['admin', 'manager', 'employee'].includes(role)) {
        return NextResponse.json(
          { error: 'Geçerli bir rol gerekli' },
          { status: 400 }
        );
      }
      updateData = { role };
    } else {
      return NextResponse.json(
        { error: 'Geçersiz işlem' },
        { status: 400 }
      );
    }

    // Update multiple users
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} kullanıcı güncellendi`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      { error: 'Toplu güncelleme işlemi başarısız' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { userIds } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Kullanıcı ID\'leri gerekli' },
        { status: 400 }
      );
    }

    // Check if any of the users being deleted are admins
    const usersToDelete = await User.find({ _id: { $in: userIds } });
    const adminCount = usersToDelete.filter(user => user.role === 'admin').length;
    
    // Prevent deletion if it would leave no admins
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    if (adminCount >= totalAdmins) {
      return NextResponse.json(
        { error: 'En az bir admin kullanıcı sistemde kalmalı' },
        { status: 400 }
      );
    }

    // Delete multiple users
    const result = await User.deleteMany({
      _id: { $in: userIds }
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} kullanıcı silindi`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: 'Toplu silme işlemi başarısız' },
      { status: 500 }
    );
  }
} 