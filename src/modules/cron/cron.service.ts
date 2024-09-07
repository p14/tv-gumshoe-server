import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import IntegrationService from '../integrations/integrations.service';
import MailerService from '../mailer/mailer.service';
import { Subscription } from '../subscriptions/subscriptions.schema';
import { SendNotificationEmailRequest } from './cron.types';
import { Blacklist } from '../auth/blacklist.schema';

const pLimit = require('p-limit'); // v3.1.0 because the latest version is not compatible with CommonJS

@Injectable()
export default class CronService {
    private tvdbLimit = pLimit(10);

    private emailLimit = pLimit(3);

    constructor(
        @Inject()
        private integrationService: IntegrationService,
        @Inject()
        private mailerService: MailerService,
        @InjectModel(Blacklist.name)
        private blacklistModel: Model<Blacklist>,
        @InjectModel(Subscription.name)
        private subscriptionModel: Model<Subscription>,
    ) { }

    @Cron(CronExpression.EVERY_10_MINUTES)
    public handleRenderDotComUptime(): void {
        console.log('*********************************');
        console.log('******* RENDER.COM UPTIME *******');
        console.log('*********************************');
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    public async handleDailyPoll(): Promise<void> {
        console.log('*********************************');
        console.log('***** STARTING NIGHTLY POLL *****');
        console.log('*********************************');

        // Get all blacklisted email addresses
        const blacklist = await this.blacklistModel.find({});
        const blacklistedEmails = blacklist.map((blacklistedDocument) => blacklistedDocument.email);

        // Pull all subscriptions and group by email address
        const allSubscriptions = await this.subscriptionModel.find({});

        // Loop through each user's subscriptions and see if there is a new episode today
        await Promise.all(
            allSubscriptions
                .filter((userSubscription) => !blacklistedEmails.includes(userSubscription.email))
                .map(async (userSubscription) => {
                    const seriesToday = await this.getSeriesPremieringToday(userSubscription.mediaIds);
                    await this.sendNotificationEmail({ email: userSubscription.email, seriesToday });
                })
        );


        console.log('*********************************');
        console.log('****** ENDING NIGHTLY POLL ******');
        console.log('*********************************');
    }

    /**
     * Retrieves a list of series titles that have episodes premiering today
     * @param {string[]} mediaIds
     * @returns {Promise<string[]>}
     */
    private async getSeriesPremieringToday(
        mediaIds: string[],
    ): Promise<string[]> {
        const seriesToday: string[] = [];

        await Promise.all(
            mediaIds.map((mediaId) => (
                this.tvdbLimit(async () => {
                    try {
                        const content = await this.integrationService.getShow(mediaId);
                        if (content.nextAiredDate && CronService.checkWithinNextHours(content.nextAiredDate)) {
                            seriesToday.push(content.name);
                        }
                    } catch {
                        console.error(`Cron job error: Failed to retrieve media content ${mediaId}.`);
                    }
                })
            ))
        );

        return seriesToday;
    }

    /**
     * Checks if the the date provided is the same date as today
     * @param {string} dateString
     * @returns {boolean}
     */
    private static checkWithinNextHours(
        dateString: string,
    ): boolean {
        const inputDate = new Date(dateString);
        const today = new Date();

        // Extract year, month, and day from the input date
        const inputYear = inputDate.getUTCFullYear();
        const inputMonth = inputDate.getUTCMonth();
        const inputDay = inputDate.getUTCDate();

        // Extract year, month, and day from today's date
        const todayYear = today.getUTCFullYear();
        const todayMonth = today.getUTCMonth();
        const todayDay = today.getUTCDate();

        // Compare the year, month, and day
        return (
            inputYear === todayYear &&
            inputMonth === todayMonth &&
            inputDay === todayDay
        );
    }

    /**
     * Sends a notification email with a list of all the series they're subscribed to that have episodes premiering today
     * @param {SendNotificationEmailRequest} params
     * @returns {Promise<void>}
     */
    private async sendNotificationEmail({
        email,
        seriesToday,
    }: SendNotificationEmailRequest): Promise<void> {
        if (seriesToday.length > 0) {
            this.emailLimit(async () => {
                try {
                    await this.mailerService.sendDailyNotification({ email, seriesToday });
                } catch {
                    console.error(`Cron job error: Failed to send email to ${email}.`);
                }
            });
        }
    }
}
