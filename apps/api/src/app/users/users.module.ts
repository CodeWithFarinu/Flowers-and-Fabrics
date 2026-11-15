import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersAdapter } from './entities/users.adapter';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersAdapter],
  exports: [UsersService, UsersAdapter],
})
export class UsersModule {}
