export type VerificationLinkRequest = {
    email: string
};

export type DailyNotificationRequest = {
    email: string
    seriesToday: string[]
};

export type BuildMagicLinkEmailRequest = {
    params: URLSearchParams
};

export type DailyNotificationEmailRequest = {
    seriesToday: string[]
    params: URLSearchParams
};
