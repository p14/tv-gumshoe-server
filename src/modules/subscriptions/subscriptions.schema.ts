import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ minimize: false, versionKey: false })
export class Subscription {
    @Prop({
        lowercase: true,
        index: true,
        required: true,
        trim: true,
        unique: true,
    })
    email: string;

    @Prop({
        required: true,
        trim: true,
    })
    mediaIds: string[];
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
