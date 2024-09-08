export type ListSubscriptionContentByEmailRequest = {
    email: string
};

export type CreateSubscriptionRequest = {
    email: string
    mediaId: string
};

export type DeleteSubscriptionRequest = {
    email: string
    mediaId: string
};
