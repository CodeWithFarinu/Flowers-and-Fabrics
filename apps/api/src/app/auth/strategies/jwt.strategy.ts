import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthAdapter } from '../entities/auth.adapter';

export interface JwtPayload {
  sub: string;
  phone: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authAdapter: AuthAdapter) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'aether-commerce-secret-key-development',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authAdapter.findUserById(payload.sub);
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User account is invalid or disabled');
    }
    return user;
  }
}
