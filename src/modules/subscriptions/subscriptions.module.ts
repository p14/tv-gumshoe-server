import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscription, SubscriptionSchema } from './subscriptions.schema';
import SubscriptionController from './subscriptions.controller';
import SubscriptionService from './subscriptions.service';
import MailerService from '../mailer/mailer.service';
import IntegrationService from '../integrations/integrations.service';
import { CacheModule } from '@nestjs/cache-manager';
import AuthService from '../auth/auth.service';
import { Blacklist, BlacklistSchema } from '../auth/blacklist.schema';

@Module({
    imports: [
        CacheModule.register(),
        MongooseModule.forFeature([
            { name: Blacklist.name, schema: BlacklistSchema },
            { name: Subscription.name, schema: SubscriptionSchema },
        ]),
    ],
    controllers: [
        SubscriptionController,
    ],
    providers: [
        AuthService,
        SubscriptionService,
        IntegrationService,
        MailerService,
    ],
    exports: [
        SubscriptionService,
    ],
})

export class SubscriptionModule { }
