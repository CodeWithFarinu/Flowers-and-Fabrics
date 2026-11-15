import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateOutfitDto, AdminGenerateModelDto } from './dto/interface.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('AI Studio & Virtual Fitting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-outfit')
  @ApiOperation({
    summary:
      'Customer: preview tailored outfit with chosen luxury fabric (costs 1 token)',
  })
  generateOutfit(@Request() req: any, @Body() dto: GenerateOutfitDto) {
    return this.aiService.generateOutfit(req.user.id, dto);
  }

  @Get('generations')
  @ApiOperation({
    summary: 'Customer: get personal gallery of generated style previews',
  })
  getUserGenerations(@Request() req: any) {
    return this.aiService.getUserGenerations(req.user.id);
  }

  @Post('admin/generate-model')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary:
      'Admin: generate lifestyle editorial model shot and attach to product images',
  })
  adminGenerateModel(@Body() dto: AdminGenerateModelDto) {
    return this.aiService.adminGenerateModel(dto);
  }
}
