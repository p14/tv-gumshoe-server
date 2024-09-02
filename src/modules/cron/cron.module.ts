import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import CronService from './cron.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscription } from 'rxjs';
import { SubscriptionSchema } from '../subscriptions/subscriptions.schema';
import IntegrationService from '../integrations/integrations.service';
import MailerService from '../mailer/mailer.service';
import { Blacklist, BlacklistSchema } from '../auth/blacklist.schema';

@Module({
    imports: [
        CacheModule.register(),
        MongooseModule.forFeature([
            { name: Blacklist.name, schema: BlacklistSchema },
            { name: Subscription.name, schema: SubscriptionSchema },
        ]),
    ],
    controllers: [],
    providers: [
        CronService,
        IntegrationService,
        MailerService,
    ],
    exports: [
    ],
})

export class CronModule { }
