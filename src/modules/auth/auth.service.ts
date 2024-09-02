import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import MailerService from '../mailer/mailer.service';
import { compare } from 'bcrypt';
import { AuthSignatureData, BlacklistEmailRequest, SendVerificationLinkRequest } from './auth.types';
import { Blacklist } from './blacklist.schema';

@Injectable()
export default class AuthService {
    constructor(
        @InjectModel(Blacklist.name)
        private blacklistModel: Model<Blacklist>,
        @Inject()
        private mailerService: MailerService,
    ) { }


    /**
     * Sends an auth validation link to the provided email address
     * If the email address is blacklisted, then no email will be sent to mitigate numeration attacks
     * @param {SendVerificationLinkRequest} params
     * @returns {Promise<void>}
     */
    public async sendVerificationLink({
        email,
    }: SendVerificationLinkRequest): Promise<void> {
        const blacklisted = await this.blacklistModel.findOne({ email });

        if (!blacklisted) {
            await this.mailerService.sendVerificationLink({ email });
        }
    }

    /**
     * Validates the auth signature with the email and expiration provided
     * @param {AuthSignatureData} params
     * @returns {Promise<void>}
     */
    public async validateAuthSignature({
        email,
        expires,
        signature,
    }: AuthSignatureData): Promise<void> {
        const signatureDataToValidate = JSON.stringify({ email, expires, secret: process.env.SECRET_KEY });
        const isValid = await compare(signatureDataToValidate, signature);

        if (!isValid) {
            throw new Error('Invalid signature.');
        }

        const blacklisted = await this.blacklistModel.findOne({ email });

        if (blacklisted) {
            throw new Error('Authentication failed.');
        }
    }

    /**
 * Validates the auth signature with the email and expiration provided for blacklisting action
 * @param {AuthSignatureData} params
 * @returns {Promise<void>}
 */
    public async validateAuthSignatureForBlacklist({
        email,
        expires,
        signature,
    }: AuthSignatureData): Promise<void> {
        const signatureDataToValidate = JSON.stringify({ email, expires, secret: process.env.SECRET_KEY });
        const isValid = await compare(signatureDataToValidate, signature);

        if (!isValid) {
            throw new Error('Invalid signature.');
        }
    }

    /**
     * Adds an email to a blacklist collection to prevent receiving future emails
     * @param {BlacklistEmailRequest} params
     * @returns {Promise<void>}
     */
    public async blacklistEmail({
        email,
    }: BlacklistEmailRequest): Promise<void> {
        const blacklisted = await this.blacklistModel.findOne({ email });

        if (blacklisted) {
            throw new Error('This email is already blacklisted.');
        }

        const blacklistEmail = await this.blacklistModel.create({ email });
        await blacklistEmail.save();
    }
}
