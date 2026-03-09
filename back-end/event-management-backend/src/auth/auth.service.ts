import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { randomBytes } from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(data: any) {
    const hashed = await bcrypt.hash(data.password, 10);
    return this.usersService.create({ ...data, password: hashed });
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    // Return token (for the controller to set as cookie) + safe user info
    // (so frontend can hydrate AuthContext without re-parsing the token)
    return {
      access_token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email not found');

    const token = randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 3_600_000); // 1 hour
    await this.usersService.create(user);

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
    await this.mailService.sendMail({
      to: email,
      subject: 'Password Reset',
      text: `Click the link to reset your password: ${resetLink}`,
    });

    return { message: 'Password reset link sent to email' };
  }

  async resetPassword(token: string, password: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user || user.resetTokenExpiry < new Date())
      throw new UnauthorizedException('Invalid or expired token');

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null as any;
    user.resetTokenExpiry = null as any;
    await this.usersService.create(user);

    return { message: 'Password reset successful' };
  }
}
