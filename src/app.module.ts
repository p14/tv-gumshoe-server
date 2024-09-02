import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationModule } from './modules/integrations/integrations.module';
import { SubscriptionModule } from './modules/subscriptions/subscriptions.module';
import { AuthModule } from './modules/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './modules/cron/cron.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URL),
        ScheduleModule.forRoot(),
        AuthModule,
        CronModule,
        IntegrationModule,
        SubscriptionModule,
    ],
    controllers: [],
    providers: [],
})

export class AppModule { }
