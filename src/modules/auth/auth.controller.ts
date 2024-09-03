import { Body, Controller, Get, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import AuthService from './auth.service';

@Controller('auth')
export default class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Get('status')
    public async statusCheck(
        @Res() res: Response,
    ) {
        try {
            return res.status(200).json({ status: 'ok' });
        } catch (e: any) {
            console.error(e.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e.message);
        }
    }

    @Post('send-verification-link')
    public async sendVerificationLink(
        @Body('email') email: string,
        @Res() res: Response,
    ) {
        try {
            await this.authService.sendVerificationLink({ email });
            return res.status(204).json();
        } catch (e: any) {
            console.error(e.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e.message);
        }
    }

    @Get('redirect')
    public async redirectVerificationLink(
        @Query('email') email: string,
        @Query('expires') expires: string,
        @Query('signature') signature: string,
        @Res() res: Response,
    ) {
        try {
            // Validate signature and parameters
            await this.authService.validateAuthSignature({ email, expires, signature });

            // Validate expiration
            if (Date.now() > Number(expires)) {
                const params = new URLSearchParams({ email });
                return res.redirect(`${process.env.CLIENT_URL}/expired?${params}`);
            }

            const params = new URLSearchParams({ email, expires, signature });
            return res.redirect(`${process.env.CLIENT_URL}/redirect?${params}`);
        } catch (e: any) {
            console.error(e.message);
            return res.redirect(`${process.env.CLIENT_URL}/error?message=${encodeURIComponent(e.message)}`);
        }
    }

    @Get('blacklist')
    public async redirectBlacklistLink(
        @Query('email') email: string,
        @Query('expires') expires: string,
        @Query('signature') signature: string,
        @Res() res: Response,
    ) {
        try {
            // Validate signature and parameters
            await this.authService.validateAuthSignatureForBlacklist({ email, expires, signature });

            // Validate expiration
            if (Date.now() > Number(expires)) {
                const params = new URLSearchParams({ email });
                return res.redirect(`${process.env.CLIENT_URL}/expired?${params}`);
            }

            await this.authService.blacklistEmail({ email });
            return res.redirect(`${process.env.CLIENT_URL}/blacklist`);
        } catch (e: any) {
            console.error(e.message);
            return res.redirect(`${process.env.CLIENT_URL}/error?message=${encodeURIComponent(e.message)}`);
        }
    }
}
