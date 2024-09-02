export type AuthSignatureData = {
    email: string
    expires: string
    signature: string
};

export type SendVerificationLinkRequest = {
    email: string
};

export type BlacklistEmailRequest = {
    email: string
};

