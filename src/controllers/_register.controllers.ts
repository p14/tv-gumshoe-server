import { Express } from 'express';
import AuthController from './auth.controller';
import IntegrationsController from './integrations.controller';
import SubscriptionsController from './subscriptions.controller';

export default function RegisterControllers(app: Express) {
    app.use('/auth', AuthController);
    app.use('/integrations', IntegrationsController);
    app.use('/subscriptions', SubscriptionsController);
};
