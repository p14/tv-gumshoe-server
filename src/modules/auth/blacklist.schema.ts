import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BlacklistDocument = HydratedDocument<Blacklist>;

@Schema({ minimize: false, versionKey: false })
export class Blacklist {
    @Prop({
        lowercase: true,
        required: true,
        trim: true,
        unique: true,
    })
    email: string;
}

export const BlacklistSchema = SchemaFactory.createForClass(Blacklist);
