import { compare } from 'bcrypt';
import dotenv from 'dotenv';
import { Model } from 'mongoose';
import { Blacklist, BlacklistDocument } from '../models/blacklist.model';
import { AuthSignatureData, BlacklistEmailRequest, SendVerificationLinkRequest } from '../types/auth.types';
import MailerService from './mailer.service';

dotenv.config();

export default class AuthService {
    private blacklistModel: Model<BlacklistDocument> = Blacklist;

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
            const mailerService = new MailerService();
            await mailerService.sendVerificationLink({ email });
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
