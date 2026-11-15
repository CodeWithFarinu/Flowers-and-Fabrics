import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RequestOtpDto,
  VerifyOtpDto,
  RefreshTokenDto,
  GuestSessionDto,
  GoogleAuthDto,
} from './dto/interface.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  @ApiOperation({ summary: 'Request OTP code via SMS or WhatsApp' })
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP code and authenticate user' })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('guest')
  @ApiOperation({
    summary: 'Start anonymous guest session for instant checkout',
  })
  createGuest(@Body() dto: GuestSessionDto) {
    return this.authService.createGuestSession(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token and issue new access token' })
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('google')
  @ApiOperation({
    summary: 'Authenticate with Google One-Tap or Google Identity credential',
  })
  googleAuth(@Body() dto: GoogleAuthDto) {
    return this.authService.googleLogin(dto);
  }

  @Get('google/config')
  @ApiOperation({
    summary: 'Get Google OAuth Client ID for frontend GIS initialization',
  })
  googleConfig() {
    return this.authService.getGoogleConfig();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }
}
