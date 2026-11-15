import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiAdapter } from './entities/ai.adapter';

@Module({
  controllers: [AiController],
  providers: [AiService, AiAdapter],
  exports: [AiService, AiAdapter],
})
export class AiModule {}
