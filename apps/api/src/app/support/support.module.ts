import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { SupportAdapter } from './entities/support.adapter';

@Module({
  controllers: [SupportController],
  providers: [SupportService, SupportAdapter],
  exports: [SupportService, SupportAdapter],
})
export class SupportModule {}
