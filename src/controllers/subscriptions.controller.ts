import { Request, Response, Router } from 'express';
import AuthService from '../services/auth.service';
import SubscriptionService from '../services/subscriptions.service';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const { email, expires, signature } = req.query as { email: string, expires: string, signature: string };

        // Validate auth signature
        const authService = new AuthService();
        await authService.validateAuthSignature({ email, expires, signature });

        // Retrieve subscription media content by email
        const subscriptionService = new SubscriptionService();
        const content = await subscriptionService.listSubscriptionContentByEmail({ email });
        return res.status(200).json(content);
    } catch (e: any) {
        console.error(e.message);
        return res.status(500).json(e.message);
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const { email, expires, mediaId, signature } = req.query as { email: string, expires: string, mediaId: string, signature: string };

        // Validate auth signature
        const authService = new AuthService();
        await authService.validateAuthSignature({ email, expires, signature });

        // Validate expiration
        if (Date.now() > Number(expires)) {
            return res.status(400).json('User session expired.');
        }

        // Create the new subscription
        const subscriptionService = new SubscriptionService();
        await subscriptionService.createSubscription({ email, mediaId });
        return res.sendStatus(201);
    } catch (e: any) {
        console.error(e.message);
        return res.status(500).json(e.message);
    }
});

router.get('/shallow-info', async (req: Request, res: Response) => {
    try {
        const { email, expires, signature } = req.query as { email: string, expires: string, signature: string };

        // Validate auth signature
        const authService = new AuthService();
        await authService.validateAuthSignature({ email, expires, signature });

        // Retrieve subscription media content by email
        const subscriptionService = new SubscriptionService();
        const content = await subscriptionService.listSubscriptionIdsByEmail({ email });
        return res.status(200).json(content);
    } catch (e: any) {
        console.error(e.message);
        return res.status(500).json(e.message);
    }
});

router.delete('/:mediaId', async (req: Request, res: Response) => {
    try {
        const { email, expires, signature } = req.query as { email: string, expires: string, signature: string };
        const { mediaId } = req.params as { mediaId: string };

        // Validate auth signature
        const authService = new AuthService();
        await authService.validateAuthSignature({ email, expires, signature });

        // Validate expiration
        if (Date.now() > Number(expires)) {
            return res.status(400).json('User session expired.');
        }

        const subscriptionService = new SubscriptionService();
        await subscriptionService.deleteSubscription({ email, mediaId });
        return res.sendStatus(204);
    } catch (e: any) {
        console.error(e.message);
        return res.status(500).json(e.message);
    }
});

const SubscriptionsController = router;
export default SubscriptionsController;
