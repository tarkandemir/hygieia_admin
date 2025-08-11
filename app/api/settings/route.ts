import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Setting from '../../../models/Setting';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all settings
    const settings = await Setting.findOne({});
    
    return NextResponse.json(settings?.data || {});

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Ayarlar alınamadı' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const settingsData = await request.json();

    // Update or create settings document
    const settings = await Setting.findOneAndUpdate(
      {},
      { 
        data: settingsData,
        updatedAt: new Date()
      },
      { 
        upsert: true, 
        new: true 
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Ayarlar başarıyla kaydedildi',
      data: settings.data 
    });

  } catch (error) {
    console.error('Settings save error:', error);
    return NextResponse.json(
      { error: 'Ayarlar kaydedilemedi' },
      { status: 500 }
    );
  }
} 