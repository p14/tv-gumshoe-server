import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from './subscriptions.schema';
import { CreateSubscriptionRequest, DeleteSubscriptionRequest, ListSubscriptionContentByEmailRequest } from './subscriptions.types';
import IntegrationService from '../integrations/integrations.service';
import { MediaContent } from '../integrations/integrations.types';

@Injectable()
export default class SubscriptionService {
    constructor(
        @InjectModel(Subscription.name)
        private subscriptionModel: Model<Subscription>,
        @Inject()
        private integrationService: IntegrationService,
    ) { }

    /**
     * Retrieves subscriptions and media content by the provided email address
     * @param {ListSubscriptionContentByEmailRequest} params 
     * @returns {Promise<MediaContent[]>}
     */
    public async listSubscriptionContentByEmail({
        email,
    }: ListSubscriptionContentByEmailRequest): Promise<MediaContent[]> {
        const subscription = await this.subscriptionModel.findOne({ email });

        if (!subscription) {
            return [];
        }

        const { mediaContent, errors } = await subscription.mediaIds
            .reduce(async (accPromise, mediaId) => {
                const acc = await accPromise;

                try {
                    const mediaContent = await this.integrationService.getShow(mediaId);
                    acc.mediaContent.push({ ...mediaContent });
                } catch (error) {
                    acc.errors.push(mediaId);
                }

                return acc;
            }, Promise.resolve({
                mediaContent: [] as MediaContent[],
                errors: [] as string[],
            }));

        if (errors.length > 0) {
            console.error(`User ${email} could not retrieve the following media:`, errors);
        }

        return mediaContent;
    }

    /**
     * Retrieves subscriptions IDs by the provided email address
     * @param {ListSubscriptionContentByEmailRequest} params 
     * @returns {Promise<MediaContent[]>}
     */
    public async listSubscriptionIdsByEmail({
        email,
    }: ListSubscriptionContentByEmailRequest): Promise<string[]> {
        const subscription = await this.subscriptionModel.findOne({ email });

        if (!subscription) {
            return [];
        }

        return subscription.toObject().mediaIds;
    }

    /**
     * Creates a new subscription
     * @param {CreateSubscriptionRequest} params
     * @returns {Promise<void>}
     */
    public async createSubscription({
        email,
        mediaId,
    }: CreateSubscriptionRequest): Promise<void> {
        await this.subscriptionModel.updateOne(
            { email },
            {
                $addToSet: {
                    mediaIds: mediaId,
                },
                $setOnInsert: {
                    email,
                },
            },
            {
                upsert: true,
            }
        );
    }

    /**
     * Deletes a subscription by ID
     * @param {DeleteSubscriptionRequest} params
     * @returns {Promise<void>}
     */
    public async deleteSubscription({
        email,
        mediaId,
    }: DeleteSubscriptionRequest): Promise<void> {
        await this.subscriptionModel.updateOne(
            { email },
            {
                $pull: {
                    mediaIds: mediaId,
                },
            },
        );
    }
}
