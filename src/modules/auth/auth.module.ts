import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import MailerService from '../mailer/mailer.service';
import { CacheModule } from '@nestjs/cache-manager';
import { Blacklist, BlacklistSchema } from './blacklist.schema';
import AuthController from './auth.controller';
import AuthService from './auth.service';

@Module({
    imports: [
        CacheModule.register(),
        MongooseModule.forFeature([
            { name: Blacklist.name, schema: BlacklistSchema },
        ]),
    ],
    controllers: [
        AuthController
    ],
    providers: [
        AuthService,
        MailerService,
    ],
    exports: [
        AuthService,
    ],
})

export class AuthModule { }
