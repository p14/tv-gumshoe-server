import { DailyNotificationEmailRequest } from '../mailer.types';

export const buildDailyNotificationEmail = ({
    seriesToday,
    params,
}: DailyNotificationEmailRequest): string => {
    return (
        `
            <p>Hey there,</p>
            <p>We’re excited to let you know that the following shows have new episodes premiering today:</p>
            <ul>
                ${seriesToday.map((series) => `<li>${series}</li>`).join('')}
            </ul>

            <br />
            <br />
            <p>Don't like these emails? <a href="${`${process.env.API_URL}/auth/blacklist?${params}`}">Blacklist</a> this email address.</p>
        `
    );
};
