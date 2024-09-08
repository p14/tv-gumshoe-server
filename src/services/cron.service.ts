import { Model } from 'mongoose';
import cron from 'node-cron';
import IntegrationService from '../services/integrations.service';
import MailerService from '../services/mailer.service';
import { Blacklist, BlacklistDocument } from '../models/blacklist.model';
import { Subscription, SubscriptionDocument } from '../models/subscriptions.model';
import { SendNotificationEmailRequest } from '../types/cron.types';

const pLimit = require('p-limit');

export default class CronService {
    private tvdbLimit = pLimit(10);
    private emailLimit = pLimit(3);
    private integrationService: IntegrationService = new IntegrationService();
    private mailerService: MailerService = new MailerService();
    private blacklistModel: Model<BlacklistDocument> = Blacklist;
    private subscriptionModel: Model<SubscriptionDocument> = Subscription;

    constructor() {
        this.initializeCronJobs(); // Schedule the cron jobs
    }

    private initializeCronJobs() {
        cron.schedule('0 0 * * *', this.handleDailyPoll.bind(this));
    }

    public async handleDailyPoll(): Promise<void> {
        console.log('*********************************');
        console.log('***** STARTING NIGHTLY POLL *****');
        console.log('*********************************');

        try {
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
        } catch (error) {
            console.error('Error during nightly poll:', error);
        }

        console.log('*********************************');
        console.log('****** ENDING NIGHTLY POLL ******');
        console.log('*********************************');
    }

    private async getSeriesPremieringToday(mediaIds: string[]): Promise<string[]> {
        const seriesToday: string[] = [];

        await Promise.all(
            mediaIds.map((mediaId) =>
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
            )
        );

        return seriesToday;
    }

    private static checkWithinNextHours(dateString: string): boolean {
        const inputDate = new Date(dateString);
        const today = new Date();

        return (
            inputDate.getUTCFullYear() === today.getUTCFullYear() &&
            inputDate.getUTCMonth() === today.getUTCMonth() &&
            inputDate.getUTCDate() === today.getUTCDate()
        );
    }

    private async sendNotificationEmail({ email, seriesToday }: SendNotificationEmailRequest): Promise<void> {
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
