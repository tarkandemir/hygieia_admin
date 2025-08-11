import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Notification from '../../../../models/Notification';
import User from '../../../../models/User';
import { hasPermission } from '../../../../lib/auth';

// Email service interface (can be extended with actual email providers)
interface EmailData {
  recipients: string[];
  subject: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sendType: 'immediate' | 'scheduled';
  scheduledDate?: string;
  templateId?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'order' | 'system' | 'custom';
}

// Sample email templates
const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Hoş Geldin Mesajı',
    subject: 'Hygieia B2B Platformuna Hoş Geldiniz!',
    body: `Merhaba {{name}},

Hygieia B2B platformuna hoş geldiniz! Hesabınız başarıyla oluşturulmuştur.

Giriş bilgileriniz:
- Email: {{email}}
- Rol: {{role}}

İyi çalışmalar dileriz.

Hygieia Ekibi`,
    type: 'welcome'
  },
  {
    id: 'order_update',
    name: 'Sipariş Güncellemesi',
    subject: 'Sipariş Durumu Güncellendi - {{orderNumber}}',
    body: `Merhaba {{name}},

{{orderNumber}} numaralı siparişinizde güncelleme var:

Sipariş Durumu: {{orderStatus}}
Güncellenme Tarihi: {{updateDate}}

Detaylar için lütfen hesabınıza giriş yapın.

Teşekkürler.`,
    type: 'order'
  },
  {
    id: 'system_maintenance',
    name: 'Sistem Bakımı',
    subject: 'Planlı Sistem Bakımı Bildirimi',
    body: `Sayın {{name}},

Sistem performansını artırmak için planlı bakım yapılacaktır.

Bakım Tarihi: {{maintenanceDate}}
Bakım Saati: {{maintenanceTime}}
Tahmini Süre: {{duration}}

Bu süre zarfında sisteme erişim sağlanamayacaktır.

Anlayışınız için teşekkürler.`,
    type: 'system'
  }
];

// Mock email service - replace with actual email provider (SendGrid, AWS SES, etc.)
async function sendEmailService(to: string, subject: string, body: string, priority: string) {
  console.log('📧 Email being sent:', {
    to,
    subject,
    bodyPreview: body.substring(0, 100) + '...',
    priority,
    timestamp: new Date().toISOString()
  });

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

  // Simulate occasional failures (5% failure rate)
  if (Math.random() < 0.05) {
    throw new Error(`Email delivery failed to ${to}`);
  }

  return {
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'sent',
    timestamp: new Date().toISOString()
  };
}

// Replace template variables
function replaceTemplateVariables(text: string, variables: Record<string, any>): string {
  let result = text;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(variables[key] || ''));
  });
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    const senderId = request.headers.get('x-user-id');
    
    // Check permissions - only admins and managers can send emails
    if (!userRole || !hasPermission(userRole, 'notifications', 'create')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await dbConnect();

    const emailData: EmailData = await request.json();

    // Validate required fields
    if (!emailData.recipients || emailData.recipients.length === 0) {
      return NextResponse.json(
        { error: 'En az bir alıcı belirtilmelidir' },
        { status: 400 }
      );
    }

    if (!emailData.subject || !emailData.body) {
      return NextResponse.json(
        { error: 'Email konusu ve içeriği gereklidir' },
        { status: 400 }
      );
    }

    // Validate scheduled date if applicable
    if (emailData.sendType === 'scheduled') {
      if (!emailData.scheduledDate) {
        return NextResponse.json(
          { error: 'Planlanmış gönderim için tarih gereklidir' },
          { status: 400 }
        );
      }

      const scheduledTime = new Date(emailData.scheduledDate);
      if (scheduledTime <= new Date()) {
        return NextResponse.json(
          { error: 'Planlanmış tarih gelecekte olmalıdır' },
          { status: 400 }
        );
      }
    }

    // Get recipient users from database
    const recipientUsers = await User.find({
      email: { $in: emailData.recipients },
      isActive: true
    });

    if (recipientUsers.length === 0) {
      return NextResponse.json(
        { error: 'Geçerli alıcı bulunamadı' },
        { status: 400 }
      );
    }

    const emailResults = [];
    const notificationPromises = [];

    // Process each recipient
    for (const user of recipientUsers) {
      try {
        // Prepare template variables
        const templateVars = {
          name: user.name,
          email: user.email,
          role: user.role,
          orderNumber: 'SP2024010001', // Sample data
          orderStatus: 'Hazırlanıyor', // Sample data
          updateDate: new Date().toLocaleDateString('tr-TR'),
          maintenanceDate: '15 Ocak 2024', // Sample data
          maintenanceTime: '02:00 - 04:00', // Sample data
          duration: '2 saat' // Sample data
        };

        // Replace variables in subject and body
        const personalizedSubject = replaceTemplateVariables(emailData.subject, templateVars);
        const personalizedBody = replaceTemplateVariables(emailData.body, templateVars);

        if (emailData.sendType === 'immediate') {
          // Send email immediately
          try {
            const emailResult = await sendEmailService(
              user.email,
              personalizedSubject,
              personalizedBody,
              emailData.priority
            );

            emailResults.push({
              recipient: user.email,
              status: 'sent',
              messageId: emailResult.messageId,
              timestamp: emailResult.timestamp
            });

            // Create notification record
            const notification = new Notification({
              userId: user._id,
              type: 'info',
              priority: emailData.priority,
              title: `Email Gönderildi: ${personalizedSubject}`,
              message: `Size bir email gönderildi: ${personalizedSubject}`,
              isEmailSent: true,
              emailSentAt: new Date(),
              data: {
                emailSubject: personalizedSubject,
                emailType: 'sent',
                messageId: emailResult.messageId
              }
            });

            notificationPromises.push(notification.save());

          } catch (emailError) {
            console.error(`Email send failed for ${user.email}:`, emailError);
            emailResults.push({
              recipient: user.email,
              status: 'failed',
              error: emailError instanceof Error ? emailError.message : 'Unknown error'
            });
          }

        } else {
          // Schedule email for later
          emailResults.push({
            recipient: user.email,
            status: 'scheduled',
            scheduledDate: emailData.scheduledDate
          });

          // Create notification for scheduled email
          const notification = new Notification({
            userId: user._id,
            type: 'info',
            priority: emailData.priority,
            title: `Email Planlandı: ${personalizedSubject}`,
            message: `Size ${new Date(emailData.scheduledDate!).toLocaleDateString('tr-TR')} tarihinde bir email gönderilecek.`,
            data: {
              emailSubject: personalizedSubject,
              emailBody: personalizedBody,
              emailType: 'scheduled',
              scheduledDate: emailData.scheduledDate
            }
          });

          notificationPromises.push(notification.save());
        }

      } catch (error) {
        console.error(`Error processing email for ${user.email}:`, error);
        emailResults.push({
          recipient: user.email,
          status: 'error',
          error: error instanceof Error ? error.message : 'Processing error'
        });
      }
    }

    // Save all notifications
    await Promise.all(notificationPromises);

    // Calculate summary statistics
    const successful = emailResults.filter(r => r.status === 'sent').length;
    const scheduled = emailResults.filter(r => r.status === 'scheduled').length;
    const failed = emailResults.filter(r => r.status === 'failed' || r.status === 'error').length;

    return NextResponse.json({
      message: 'Email işlemi tamamlandı',
      summary: {
        total: emailResults.length,
        successful,
        scheduled,
        failed
      },
      results: emailResults,
      sendType: emailData.sendType
    });

  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Email gönderim işlemi başarısız' },
      { status: 500 }
    );
  }
}

// Get email templates
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    
    if (!userRole || !hasPermission(userRole, 'notifications', 'read')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      templates: EMAIL_TEMPLATES
    });

  } catch (error) {
    console.error('Templates fetch error:', error);
    return NextResponse.json(
      { error: 'Şablonlar alınamadı' },
      { status: 500 }
    );
  }
} 