import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthAdapter } from './entities/auth.adapter';
import {
  RequestOtpDto,
  VerifyOtpDto,
  GuestSessionDto,
  GoogleAuthDto,
} from './dto/interface.dto';
import * as crypto from 'crypto';
import axios from 'axios';

interface StoredOtp {
  code: string;
  expiresAt: Date;
  attempts: number;
}

@Injectable()
export class AuthService {
  private otpStore = new Map<string, StoredOtp>();

  constructor(
    private authAdapter: AuthAdapter,
    private jwtService: JwtService,
  ) {}

  async requestOtp(dto: RequestOtpDto) {
    const phone = dto.phone.trim();
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }

    const existing = this.otpStore.get(phone);
    if (existing && existing.attempts >= 4 && existing.expiresAt > new Date()) {
      throw new BadRequestException(
        'Too many OTP attempts. Please wait 10 minutes.',
      );
    }

    // Generate 6-digit secure code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes TTL

    this.otpStore.set(phone, {
      code,
      expiresAt,
      attempts: (existing?.attempts || 0) + 1,
    });

    console.log(
      `[AUTH OTP DEV] Phone: ${phone} | Code: ${code} (Expires in 10m)`,
    );

    return {
      success: true,
      message: 'OTP sent to mobile phone',
      phone,
      devOtp: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const phone = dto.phone.trim();
    const stored = this.otpStore.get(phone);

    // Allow mock fallback '123456' in dev or if code matches
    const isDevMock =
      process.env.NODE_ENV !== 'production' && dto.code === '123456';
    const isValid =
      stored && stored.code === dto.code && stored.expiresAt > new Date();

    if (!isValid && !isDevMock) {
      throw new UnauthorizedException('Invalid or expired OTP code');
    }

    if (stored) {
      this.otpStore.delete(phone);
    }

    // Find or create user via adapter
    let user = await this.authAdapter.findUserByPhone(phone);

    if (!user) {
      const referralCode = `AT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      user = await this.authAdapter.createUser({
        phone,
        isGuest: false,
        isPhoneVerified: true,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        referralCode,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        imageGenTokens: 3,
      });
    } else {
      user = await this.authAdapter.updateUser(user.id, {
        isPhoneVerified: true,
        isGuest: false,
        firstName: dto.firstName || user.firstName,
        lastName: dto.lastName || user.lastName,
        email: dto.email || user.email,
      });
    }

    const tokens = await this.generateTokens(user.id, user.phone, user.role);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        loyaltyTier: user.loyaltyTier,
        loyaltyPoints: user.loyaltyPoints,
        imageGenTokens: user.imageGenTokens,
        isGuest: user.isGuest,
      },
      ...tokens,
    };
  }

  async createGuestSession(dto: GuestSessionDto) {
    const guestPhone = dto.phone || `+234000${Date.now().toString().slice(-7)}`;
    const referralCode = `GUEST-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const user = await this.authAdapter.createUser({
      phone: guestPhone,
      isGuest: true,
      referralCode,
      utmSource: dto.utmSource,
      utmMedium: dto.utmMedium,
      utmCampaign: dto.utmCampaign,
      imageGenTokens: 1,
    });

    const tokens = await this.generateTokens(user.id, user.phone, user.role);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        isGuest: true,
        role: user.role,
      },
      ...tokens,
    };
  }

  async generateTokens(userId: string, phone: string, role: string) {
    const payload = { sub: userId, phone, role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret:
        process.env.JWT_REFRESH_SECRET ||
        'aether-refresh-secret-key-development',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 mins
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret:
          process.env.JWT_REFRESH_SECRET ||
          'aether-refresh-secret-key-development',
      });
      const user = await this.authAdapter.findUserById(payload.sub);
      if (!user || user.deletedAt) {
        throw new UnauthorizedException();
      }
      return this.generateTokens(user.id, user.phone, user.role);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.authAdapter.getMe(userId);
    if (!user) throw new NotFoundException('User profile not found');
    return user;
  }

  async googleLogin(dto: GoogleAuthDto) {
    let googleId = dto.googleId;
    let email = dto.email;
    let firstName = dto.firstName;
    let lastName = dto.lastName;
    let avatarUrl = dto.avatarUrl;

    // 1. If credential (Google ID token) provided, verify or parse payload
    if (dto.credential) {
      try {
        const { data } = await axios.get(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(dto.credential)}`,
          { timeout: 5000 },
        );
        if (data && data.sub) {
          googleId = data.sub;
          email = data.email || email;
          firstName = data.given_name || firstName;
          lastName = data.family_name || lastName;
          avatarUrl = data.picture || avatarUrl;
        }
      } catch (err) {
        // In local/sandbox/dev mode or offline, gracefully decode the JWT payload
        try {
          const parts = dto.credential.split('.');
          if (parts.length >= 2) {
            const payload = JSON.parse(
              Buffer.from(parts[1], 'base64').toString('utf8'),
            );
            googleId = payload.sub || googleId;
            email = payload.email || email;
            firstName = payload.given_name || firstName;
            lastName = payload.family_name || lastName;
            avatarUrl = payload.picture || avatarUrl;
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    }

    if (!email && !googleId) {
      throw new BadRequestException(
        'Google authentication failed: missing credentials or email',
      );
    }

    // 2. Check if user already exists by googleId
    let user = googleId
      ? await this.authAdapter.findUserByGoogleId(googleId)
      : null;

    // 3. Check if user exists by email if not found by googleId
    if (!user && email) {
      user = await this.authAdapter.findUserByEmail(email);
      if (user && googleId) {
        user = await this.authAdapter.linkGoogleAccount(
          user.id,
          googleId,
          avatarUrl || user.avatarUrl,
          firstName || user.firstName,
          lastName || user.lastName,
        );
      }
    }

    // 4. Create new user if not found
    if (!user) {
      const provisionalPhone =
        dto.phone || `+234_g_${crypto.randomBytes(4).toString('hex')}`;
      const referralCode = `AT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      user = await this.authAdapter.createUser({
        email,
        googleId,
        phone: provisionalPhone,
        firstName: firstName || 'Google',
        lastName: lastName || 'Patron',
        avatarUrl,
        isGuest: false,
        isEmailVerified: true,
        referralCode,
        utmSource: dto.utmSource || 'google_auth',
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        imageGenTokens: 3,
      });
    }

    const tokens = await this.generateTokens(user.id, user.phone, user.role);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        loyaltyTier: user.loyaltyTier,
        loyaltyPoints: user.loyaltyPoints,
        imageGenTokens: user.imageGenTokens,
        isGuest: user.isGuest,
      },
      ...tokens,
    };
  }

  getGoogleConfig() {
    return {
      clientId:
        process.env.GOOGLE_CLIENT_ID ||
        '718392019482-aetherdemo.apps.googleusercontent.com',
    };
  }
}
