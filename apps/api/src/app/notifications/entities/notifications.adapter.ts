import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePushSubscriptionDto,
  SendPushNotificationDto,
} from '../dto/interface.dto';

export interface StoredSubscription {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  device?: string;
  createdAt: Date;
}

@Injectable()
export class NotificationsAdapter {
  private readonly logger = new Logger(NotificationsAdapter.name);

  // In-memory subscription registry (can persist to redis or prisma notification data)
  private readonly subscriptions: Map<string, StoredSubscription> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  async saveSubscription(
    dto: CreatePushSubscriptionDto,
  ): Promise<StoredSubscription> {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: StoredSubscription = {
      id,
      endpoint: dto.endpoint,
      keys: {
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
      },
      userId: dto.userId,
      device: dto.device,
      createdAt: new Date(),
    };

    this.subscriptions.set(dto.endpoint, record);
    this.logger.log(
      `Registered push subscription id=${id} user=${dto.userId || 'guest'}`,
    );
    return record;
  }

  async getAllSubscriptions(): Promise<StoredSubscription[]> {
    return Array.from(this.subscriptions.values());
  }

  async getSubscriptionsByUser(userId: string): Promise<StoredSubscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (s) => s.userId === userId,
    );
  }

  async removeSubscription(endpoint: string): Promise<boolean> {
    return this.subscriptions.delete(endpoint);
  }

  async createNotificationRecord(dto: SendPushNotificationDto) {
    if (dto.userId) {
      try {
        return await this.prisma.notification.create({
          data: {
            userId: dto.userId,
            type: 'PROMO',
            title: dto.title,
            body: dto.body,
            data: dto.url ? { url: dto.url } : undefined,
          },
        });
      } catch (err) {
        this.logger.warn(`Could not persist notification in DB: ${err}`);
      }
    }
    return null;
  }
}
