import { BuildMagicLinkEmailRequest } from '../mailer.types';

export const buildMagicLinkEmail = ({
    params,
}: BuildMagicLinkEmailRequest): string => {
    return (
        `
            <p>Hey there,</p>
            <p>To access your account on Gumshoe, please verify your email address by clicking the link below. This link will expire in 24 hours and will grant you access to your account throughout that time. Feel free to request another link at anytime.</p>
            <p>If you did not request this email, you can safely ignore it. Your account will remain secure.</p>
            
            <br />
            <a href="${`${process.env.API_URL}/auth/redirect?${params}`}" target="_blank">Verify My Email</a>

            <br />
            <br />
            <p>Don't like these emails? <a href="${`${process.env.API_URL}/auth/blacklist?${params}`}">Blacklist</a> this email address.</p>
        `
    );
};
