import { Request, Response, Router } from 'express';
import IntegrationsService from '../services/integrations.service';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
    try {
        const { query } = req.query as { query: string };

        const integrationsService = new IntegrationsService();
        const content = await integrationsService.searchShows(query);
        return res.status(200).json(content);
    } catch (e: any) {
        console.error(e.message);
        return res.status(500).json(e.message);
    }
});

const IntegrationsController = router;
export default IntegrationsController;
