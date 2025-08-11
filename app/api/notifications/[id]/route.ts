import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Notification from '../../../../models/Notification';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const resolvedParams = await params;
    const notification = await Notification.findOne({
      _id: resolvedParams.id,
      userId // Ensure user can only access their own notifications
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Bildirim bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);

  } catch (error) {
    console.error('Notification fetch error:', error);
    return NextResponse.json(
      { error: 'Bildirim alınamadı' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const resolvedParams = await params;
    const updateData = await request.json();

    // Find notification and ensure it belongs to the user
    const notification = await Notification.findOne({
      _id: resolvedParams.id,
      userId
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Bildirim bulunamadı' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedUpdates = ['isRead'];
    const updates: any = {};

    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    // Set readAt timestamp if marking as read
    if (updates.isRead === true && !notification.isRead) {
      updates.readAt = new Date();
    } else if (updates.isRead === false) {
      updates.readAt = null;
    }

    // Update the notification
    const updatedNotification = await Notification.findOneAndUpdate(
      { _id: resolvedParams.id, userId },
      { $set: updates },
      { new: true }
    );

    return NextResponse.json(updatedNotification);

  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      { error: 'Bildirim güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const resolvedParams = await params;
    
    // Find and delete notification (ensure it belongs to the user)
    const deletedNotification = await Notification.findOneAndDelete({
      _id: resolvedParams.id,
      userId
    });

    if (!deletedNotification) {
      return NextResponse.json(
        { error: 'Bildirim bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Bildirim başarıyla silindi',
      deletedNotification
    });

  } catch (error) {
    console.error('Notification delete error:', error);
    return NextResponse.json(
      { error: 'Bildirim silinemedi' },
      { status: 500 }
    );
  }
} 