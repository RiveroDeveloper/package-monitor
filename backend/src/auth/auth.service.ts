// External imports
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Internal imports
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import type { JWTPayloadInterface } from '../interfaces/auth/JWTPayloadInterface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.signTokenFor(user.id, user.email, user.role);
  }

  async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
    const user = await this.usersService.create({
      ...registerDto,
      role: 'User',
    });

    return await this.signTokenFor(user.id, user.email, user.role);
  }

  private async signTokenFor(
    sub: string,
    email: string,
    role: JWTPayloadInterface['role'],
  ): Promise<{ access_token: string }> {
    const payload: JWTPayloadInterface = { sub, email, role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
