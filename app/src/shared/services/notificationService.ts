/**
 * Notification Service
 * 
 * This module provides functionality for sending notifications to users
 * through various channels (in-app, email, Slack, etc.).
 */

import { prisma } from 'wasp/server';
import { emailSender } from 'wasp/server/email';
import { LoggingService } from './logging';

// Notification type
export type NotificationType = 
  | 'SYSTEM' 
  | 'SECURITY' 
  | 'PERFORMANCE_ALERT' 
  | 'TOKEN_USAGE' 
  | 'USER_ACTION'
  | 'AI_AGENT';

// Notification severity
export type NotificationSeverity = 
  | 'INFO' 
  | 'WARNING' 
  | 'ERROR' 
  | 'CRITICAL';

// Notification channel
export type NotificationChannel = 
  | 'IN_APP' 
  | 'EMAIL' 
  | 'SLACK' 
  | 'WEBHOOK';

// Notification options
export interface NotificationOptions {
  title: string;
  message: string;
  type: NotificationType;
  severity?: NotificationSeverity;
  channels?: NotificationChannel[];
  metadata?: any;
  recipients?: string[]; // User IDs or special values like 'admin', 'all'
  senderId?: string;
  expiresAt?: Date;
}

/**
 * Sends a notification to the specified recipients through the specified channels
 * 
 * @param options Notification options
 * @returns The created notifications
 */
export async function sendNotification(
  options: NotificationOptions
): Promise<any[]> {
  try {
    // Set default values
    const severity = options.severity || 'INFO';
    const channels = options.channels || ['IN_APP'];
    const recipients = options.recipients || ['admin'];
    
    // Log the notification
    await LoggingService.logSystemEvent({
      message: `Sending notification: ${options.title}`,
      level: severity,
      category: 'NOTIFICATION',
      source: 'notification-service',
      tags: ['notification', options.type.toLowerCase(), severity.toLowerCase()],
      metadata: {
        title: options.title,
        message: options.message,
        type: options.type,
        severity,
        channels,
        recipients,
        metadata: options.metadata,
      },
    });
    
    // Process recipients
    let userIds: string[] = [];
    
    if (recipients.includes('all')) {
      // Get all user IDs
      const users = await prisma.user.findMany({
        select: { id: true },
      });
      userIds = users.map(user => user.id);
    } else if (recipients.includes('admin')) {
      // Get admin user IDs
      const admins = await prisma.user.findMany({
        where: { isAdmin: true },
        select: { id: true },
      });
      userIds = admins.map(admin => admin.id);
    } else {
      // Use specified user IDs
      userIds = recipients.filter(id => id !== 'admin' && id !== 'all');
    }
    
    // Create notifications for each user and channel
    const notifications = [];
    
    for (const userId of userIds) {
      // Get user preferences
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          notificationPreferences: true,
        },
      });
      
      if (!user) continue;
      
      // Check if user has opted out of this notification type
      const preferences = user.notificationPreferences || {};
      if (preferences[options.type] === false) continue;
      
      // Process each channel
      for (const channel of channels) {
        // Check if user has opted out of this channel
        if (preferences[`channel_${channel}`] === false) continue;
        
        // Create in-app notification
        if (channel === 'IN_APP') {
          const notification = await prisma.notification.create({
            data: {
              userId,
              title: options.title,
              message: options.message,
              type: options.type,
              severity,
              metadata: options.metadata,
              senderId: options.senderId,
              expiresAt: options.expiresAt,
            },
          });
          
          notifications.push(notification);
        }
        
        // Send email notification
        if (channel === 'EMAIL' && user.email) {
          try {
            await emailSender.send({
              to: user.email,
              subject: `[${severity}] ${options.title}`,
              text: options.message,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: ${getSeverityColor(severity)};">[${severity}] ${options.title}</h2>
                  <p>${options.message}</p>
                  ${options.metadata ? `<pre>${JSON.stringify(options.metadata, null, 2)}</pre>` : ''}
                  <hr />
                  <p style="color: #666; font-size: 12px;">
                    This is an automated notification from the Cauldron platform.
                    <br />
                    Type: ${options.type}
                    <br />
                    Severity: ${severity}
                  </p>
                </div>
              `,
            });
            
            notifications.push({
              channel: 'EMAIL',
              userId,
              title: options.title,
              sent: true,
            });
          } catch (error) {
            console.error('Error sending email notification:', error);
          }
        }
        
        // Send Slack notification (if configured)
        if (channel === 'SLACK') {
          // Implementation would depend on Slack integration
          // This is a placeholder for future implementation
          notifications.push({
            channel: 'SLACK',
            userId,
            title: options.title,
            sent: false,
            error: 'Slack integration not implemented',
          });
        }
        
        // Send webhook notification (if configured)
        if (channel === 'WEBHOOK') {
          // Implementation would depend on webhook configuration
          // This is a placeholder for future implementation
          notifications.push({
            channel: 'WEBHOOK',
            userId,
            title: options.title,
            sent: false,
            error: 'Webhook integration not implemented',
          });
        }
      }
    }
    
    return notifications;
  } catch (error) {
    console.error('Error sending notification:', error);
    return [];
  }
}

/**
 * Gets color for severity level
 */
function getSeverityColor(severity: NotificationSeverity): string {
  switch (severity) {
    case 'INFO':
      return '#3498db'; // Blue
    case 'WARNING':
      return '#f39c12'; // Orange
    case 'ERROR':
      return '#e74c3c'; // Red
    case 'CRITICAL':
      return '#c0392b'; // Dark Red
    default:
      return '#2c3e50'; // Dark Blue
  }
}

/**
 * Gets unread notifications for a user
 * 
 * @param userId The user ID
 * @param limit Maximum number of notifications to return
 * @returns Unread notifications
 */
export async function getUnreadNotifications(
  userId: string,
  limit: number = 20
): Promise<any[]> {
  try {
    return await prisma.notification.findMany({
      where: {
        userId,
        read: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return [];
  }
}

/**
 * Marks a notification as read
 * 
 * @param notificationId The notification ID
 * @param userId The user ID
 * @returns The updated notification
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<any> {
  try {
    return await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
}

/**
 * Marks all notifications as read for a user
 * 
 * @param userId The user ID
 * @returns The number of notifications marked as read
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<number> {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
    
    return result.count;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return 0;
  }
}

/**
 * Updates user notification preferences
 * 
 * @param userId The user ID
 * @param preferences The notification preferences
 * @returns The updated user
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: any
): Promise<any> {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        notificationPreferences: preferences,
      },
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return null;
  }
}
