import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  CreatePushSubscriptionDto,
  SendPushNotificationDto,
} from './dto/interface.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('vapid-key')
  @ApiOperation({ summary: 'Retrieve VAPID Public Key for Web Push' })
  @ApiResponse({ status: 200, description: 'VAPID public key returned' })
  getVapidKey() {
    return this.notificationsService.getVapidPublicKey();
  }

  @Post('push-subscription')
  @ApiOperation({ summary: 'Register a device push subscription' })
  @ApiResponse({ status: 201, description: 'Subscription saved successfully' })
  saveSubscription(@Body() dto: CreatePushSubscriptionDto) {
    return this.notificationsService.saveSubscription(dto);
  }

  @Post('send-push')
  @ApiOperation({ summary: 'Broadcast or target a push notification' })
  @ApiResponse({ status: 200, description: 'Push notification triggered' })
  sendPush(@Body() dto: SendPushNotificationDto) {
    return this.notificationsService.sendPushNotification(dto);
  }

  @Post('test')
  @ApiOperation({ summary: 'Trigger a test push notification' })
  @ApiResponse({ status: 200, description: 'Test notification triggered' })
  testNotification(@Query('userId') userId?: string) {
    return this.notificationsService.testNotification(userId);
  }
}
