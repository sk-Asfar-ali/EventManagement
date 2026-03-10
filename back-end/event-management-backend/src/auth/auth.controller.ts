import { Controller, Post, Get, Body, Param, Res, UseGuards, Request } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.auth.guard';

const COOKIE_NAME = 'access_token';
const COOKIE_OPTS = {
  httpOnly: true,           // not accessible via JS — prevents XSS token theft
  secure: false, // HTTPS-only in prod
  sameSite: 'lax' as const, // CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 1 day (matches JWT expiry)
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body);







    
  }

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body.email, body.password);
    // Set token as httpOnly cookie — token never exposed in response body
    res.cookie(COOKIE_NAME, result.access_token, COOKIE_OPTS);
    // Return safe user info so frontend can hydrate state immediately
    return result.user;
  }

  // Rehydrates AuthContext on page load by reading the cookie server-side
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: any) {
    return req.user; // { id, email, role } from JwtStrategy.validate()
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { message: 'Logged out' };
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: any) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password/:token')
  resetPassword(
    @Param('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }
}
