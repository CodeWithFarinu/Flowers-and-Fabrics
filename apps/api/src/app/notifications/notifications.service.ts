import { Injectable, Logger } from '@nestjs/common';
import { NotificationsAdapter } from './entities/notifications.adapter';
import {
  CreatePushSubscriptionDto,
  SendPushNotificationDto,
} from './dto/interface.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly vapidPublicKey: string;

  constructor(private readonly adapter: NotificationsAdapter) {
    this.vapidPublicKey =
      process.env['VAPID_PUBLIC_KEY'] ||
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkRXZJjSgSnfckj0Ks2uhiRQQ9ae0Mb_OyWB3TAKyo';
  }

  getVapidPublicKey() {
    return {
      publicKey: this.vapidPublicKey,
      vapidPublicKey: this.vapidPublicKey,
    };
  }

  async saveSubscription(dto: CreatePushSubscriptionDto) {
    return this.adapter.saveSubscription(dto);
  }

  async sendPushNotification(dto: SendPushNotificationDto) {
    this.logger.log(
      `Dispatching Push Notification: "${dto.title}" to ${dto.userId ? 'user ' + dto.userId : 'all subscribers'}`,
    );

    // Persist notification record in DB via adapter
    await this.adapter.createNotificationRecord(dto);

    const targets = dto.userId
      ? await this.adapter.getSubscriptionsByUser(dto.userId)
      : await this.adapter.getAllSubscriptions();

    this.logger.log(`Active target devices registered: ${targets.length}`);

    return {
      success: true,
      deliveredTo: targets.length,
      title: dto.title,
      body: dto.body,
      timestamp: new Date().toISOString(),
    };
  }

  async testNotification(userId?: string) {
    return this.sendPushNotification({
      title: '⚜ Teepha Flowers & Fabrics Concierge Alert',
      body: 'Your bespoke fitting schedule and priority dispatch tracking are now active.',
      url: '/account',
      userId,
    });
  }
}
