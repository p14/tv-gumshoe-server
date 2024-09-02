import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import IntegrationsService from './integrations.service';

@Controller('integrations')
export default class IntegrationsController {
    constructor(
        private readonly integrationsService: IntegrationsService,
    ) { }

    @Get('/search')
    public async searchShows(
        @Res() res: Response,
        @Query('query') query: string,
    ) {
        try {
            const content = await this.integrationsService.searchShows(query);
            return res.status(HttpStatus.OK).json(content);
        } catch (e: any) {
            console.error(e.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e.message);
        }
    }
}
