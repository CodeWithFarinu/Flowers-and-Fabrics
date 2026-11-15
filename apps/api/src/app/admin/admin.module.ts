import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAdapter } from './entities/admin.adapter';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminAdapter],
  exports: [AdminService, AdminAdapter],
})
export class AdminModule {}
