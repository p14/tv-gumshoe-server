import { Module } from '@nestjs/common';
import IntegrationsController from './integrations.controller';
import IntegrationService from './integrations.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [CacheModule.register()],
    controllers: [IntegrationsController],
    providers: [IntegrationService],
    exports: [IntegrationService],
})

export class IntegrationModule { }
