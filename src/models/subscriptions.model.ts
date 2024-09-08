import { Schema, model, Document } from 'mongoose';

export interface SubscriptionDocument extends Document {
    email: string
    mediaIds: string[]
}

const subscriptionSchema = new Schema<SubscriptionDocument>({
    email: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        unique: true,
    },
    mediaIds: {
        type: [String],
        required: true,
        trim: true,
    },
}, {
    minimize: false,
    versionKey: false,
});

export const Subscription = model<SubscriptionDocument>('Subscription', subscriptionSchema);

