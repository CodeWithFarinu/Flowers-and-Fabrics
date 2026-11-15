import { Injectable, BadRequestException } from '@nestjs/common';
import { AiAdapter } from './entities/ai.adapter';
import { GenerateOutfitDto, AdminGenerateModelDto } from './dto/interface.dto';

@Injectable()
export class AiService {
  constructor(private readonly aiAdapter: AiAdapter) {}

  async generateOutfit(userId: string, dto: GenerateOutfitDto) {
    const user = await this.aiAdapter.findUserImageTokens(userId);

    if (!user || user.imageGenTokens < 1) {
      throw new BadRequestException(
        'Insufficient AI studio tokens. You can earn more tokens by completing orders and writing verified reviews.',
      );
    }

    // Deduct 1 token
    await this.aiAdapter.decrementUserImageTokens(userId, 1);

    // In production, dispatch to Stability / Midjourney / Flux / DALL-E 3 API
    // Generate high quality editorial placeholder
    const sampleResults = [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
    ];
    const resultUrl =
      sampleResults[Math.floor(Math.random() * sampleResults.length)];

    const generation = await this.aiAdapter.createAiImageGeneration({
      userId,
      prompt: dto.prompt,
      resultUrl,
      status: 'COMPLETED',
      tokensUsed: 1,
      styleConfig: {
        style: dto.style || 'bespoke',
        productId: dto.productId,
      },
    });

    return {
      generation,
      remainingTokens: user.imageGenTokens - 1,
    };
  }

  async getUserGenerations(userId: string) {
    return this.aiAdapter.findUserGenerations(userId, 30);
  }

  async adminGenerateModel(dto: AdminGenerateModelDto) {
    const product = await this.aiAdapter.findProductById(dto.productId);
    if (!product) throw new BadRequestException('Product not found');

    const sampleLifestyleImages = [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
    ];

    const url =
      sampleLifestyleImages[
        Math.floor(Math.random() * sampleLifestyleImages.length)
      ];

    // Automatically attach to product images as an AI model shot
    const image = await this.aiAdapter.createProductImage({
      productId: dto.productId,
      url,
      altText: `AI Editorial Model View (${dto.garmentType || 'bespoke garment'}, ${dto.skinTone || 'natural'})`,
      sortOrder: 10,
      isPrimary: false,
    });

    return {
      success: true,
      image,
      message: 'AI Model shot generated and linked to product media catalog',
    };
  }
}
