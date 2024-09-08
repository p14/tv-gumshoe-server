import dotenv from 'dotenv';
import { Request, Response, Router } from 'express';
import AuthService from '../services/auth.service';

dotenv.config();
const router = Router();

router.post('/send-verification-link', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const authService = new AuthService();
        await authService.sendVerificationLink({ email });
        return res.sendStatus(204);
    } catch (e: any) {
        console.error(e.message);
        return res.status(500).json(e.message);
    }
});

router.get('/redirect', async (req: Request, res: Response) => {
    try {
        const { email, expires, signature } = req.query as { email: string, expires: string, signature: string };

        const authService = new AuthService();

        // Validate signature and parameters
        await authService.validateAuthSignature({ email, expires, signature });

        // Validate expiration
        if (Date.now() > Number(expires)) {
            const params = new URLSearchParams({ email });
            return res.redirect(`${process.env.CLIENT_URL}/expired?${params}`);
        }

        const params = new URLSearchParams({ email, expires, signature });
        return res.redirect(`${process.env.CLIENT_URL}/redirect?${params}`);
    } catch (e: any) {
        console.error(e.message);
        return res.redirect(`${process.env.CLIENT_URL}/error?message=${encodeURIComponent(e.message)}`);
    }
});

router.get('/blacklist', async (req: Request, res: Response) => {
    try {
        const { email, expires, signature } = req.query as { email: string, expires: string, signature: string };

        const authService = new AuthService();

        // Validate signature and parameters
        await authService.validateAuthSignatureForBlacklist({ email, expires, signature });

        // Validate expiration
        if (Date.now() > Number(expires)) {
            const params = new URLSearchParams({ email });
            return res.redirect(`${process.env.CLIENT_URL}/expired?${params}`);
        }

        await authService.blacklistEmail({ email });
        return res.redirect(`${process.env.CLIENT_URL}/blacklist`);
    } catch (e: any) {
        console.error(e.message);
        return res.redirect(`${process.env.CLIENT_URL}/error?message=${encodeURIComponent(e.message)}`);
    }
});

const AuthController = router;
export default AuthController;
