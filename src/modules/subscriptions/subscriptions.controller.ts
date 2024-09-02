import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Types } from 'mongoose';
import AuthService from '../auth/auth.service';
import SubscriptionService from './subscriptions.service';

@Controller('subscriptions')
export default class SubscriptionController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly authService: AuthService
    ) { }

    @Get()
    public async getSubscriptions(
        @Query('email') email: string,
        @Query('expires') expires: string,
        @Query('signature') signature: string,
        @Res() res: Response,
    ) {
        try {
            // Validate auth signature
            await this.authService.validateAuthSignature({ email, expires, signature });

            // Retrieve subscription media content by email
            const content = await this.subscriptionService.listSubscriptionContentByEmail({ email });
            return res.status(HttpStatus.OK).json(content);
        } catch (e: any) {
            console.error(e.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e.message);
        }
    }

    @Post()
    public async createSubscription(
        @Body('email') email: string,
        @Body('expires') expires: string,
        @Body('mediaId') mediaId: string,
        @Body('signature') signature: string,
        @Res() res: Response,
    ) {
        try {
            // Validate auth signature
            await this.authService.validateAuthSignature({ email, expires, signature });

            // Validate expiration
            if (Date.now() > Number(expires)) {
                return res.status(HttpStatus.BAD_REQUEST).json('User session expired.');
            }

            // Create the new subscription
            await this.subscriptionService.createSubscription({ email, mediaId });
            return res.sendStatus(HttpStatus.CREATED);
        } catch (e: any) {
            console.error(e.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e.message);
        }
    }

    @Get('shallow-info')
    public async getSubscriptionIds(
        @Query('email') email: string,
        @Query('expires') expires: string,
        @Query('signature') signature: string,
        @Res() res: Response,
    ) {
        try {
            // Validate auth signature
            await this.authService.validateAuthSignature({ email, expires, signature });

            // Retrieve subscription media content by email
            const content = await this.subscriptionService.listSubscriptionIdsByEmail({ email });
            return res.status(HttpStatus.OK).json(content);
        } catch (e: any) {
            console.error(e.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e.message);
        }
    }

    @Delete(':mediaId')
    public async deleteSubscription(
        @Param('mediaId') mediaId: string,
        @Body('email') email: string,
        @Body('expires') expires: string,
        @Body('signature') signature: string,
        @Res() res: Response,
    ) {
        try {
            // Validate auth signature
            await this.authService.validateAuthSignature({ email, expires, signature });

            // Validate expiration
            if (Date.now() > Number(expires)) {
                return res.status(HttpStatus.BAD_REQUEST).json('User session expired.');
            }

            await this.subscriptionService.deleteSubscription({ email, mediaId });
            return res.sendStatus(HttpStatus.OK);
        } catch (e: any) {
            console.error(e.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e.message);
        }
    }
}
