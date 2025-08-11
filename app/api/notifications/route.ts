import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Notification from '../../../models/Notification';
import { hasPermission } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // URL search params for filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const isRead = searchParams.get('isRead');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { userId };

    if (type && ['info', 'success', 'warning', 'error', 'system'].includes(type)) {
      filter.type = type;
    }

    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      filter.priority = priority;
    }

    if (isRead !== null && (isRead === 'true' || isRead === 'false')) {
      filter.isRead = isRead === 'true';
    }

    // Get total count for pagination
    const totalNotifications = await Notification.countDocuments(filter);
    const totalPages = Math.ceil(totalNotifications / limit);

    // Fetch notifications with filters
    const notifications = await Notification.find(filter)
      .sort({ priority: -1, createdAt: -1 }) // Urgent first, then newest
      .skip(skip)
      .limit(limit);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total: totalNotifications,
        pages: totalPages
      }
    });

  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { error: 'Bildirimler alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    const createdBy = request.headers.get('x-user-id');
    
    // Only admins and managers can create notifications
    if (!userRole || !hasPermission(userRole, 'notifications', 'create')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await dbConnect();

    const notificationData = await request.json();

    // Validate required fields
    if (!notificationData.userId || !notificationData.title || !notificationData.message) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik (userId, title, message)' },
        { status: 400 }
      );
    }

    // Validate enum values
    if (notificationData.type && !['info', 'success', 'warning', 'error', 'system'].includes(notificationData.type)) {
      return NextResponse.json(
        { error: 'Geçersiz bildirim türü' },
        { status: 400 }
      );
    }

    if (notificationData.priority && !['low', 'medium', 'high', 'urgent'].includes(notificationData.priority)) {
      return NextResponse.json(
        { error: 'Geçersiz öncelik seviyesi' },
        { status: 400 }
      );
    }

    // Create notification
    const notification = new Notification({
      userId: notificationData.userId,
      type: notificationData.type || 'info',
      priority: notificationData.priority || 'medium',
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data,
      actionUrl: notificationData.actionUrl,
      expiresAt: notificationData.expiresAt
    });

    await notification.save();

    return NextResponse.json(notification, { status: 201 });

  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json(
      { error: 'Bildirim oluşturulamadı' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'mark-all-read') {
      // Mark all notifications as read for the user
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { 
          $set: { 
            isRead: true,
            readAt: new Date()
          }
        }
      );

      return NextResponse.json({
        message: `${result.modifiedCount} bildirim okundu olarak işaretlendi`,
        modifiedCount: result.modifiedCount
      });
    }

    return NextResponse.json(
      { error: 'Geçersiz işlem' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Notifications bulk update error:', error);
    return NextResponse.json(
      { error: 'Toplu güncelleme işlemi başarısız' },
      { status: 500 }
    );
  }
} 