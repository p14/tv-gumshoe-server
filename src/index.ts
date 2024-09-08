import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import RegisterControllers from './controllers/_register.controllers';
import CronService from './services/cron.service';

dotenv.config();
const CLIENT_URL = String(process.env.CLIENT_URL);
const MONGO_URL = String(process.env.MONGO_URL);
const PORT = Number(process.env.PORT);

const app = express();

app.use(cors({
    origin: [CLIENT_URL],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(MONGO_URL).then(() => {
    console.log('Connected to DB');

    // Register controllers
    RegisterControllers(app);

    // Run cron service
    new CronService();

    app.get('/', (_req: Request, res: Response) => {
        res.status(200).send('Hello World');
    });

    app.listen(PORT, () => {
        console.log('Server running at PORT: ', PORT);
    }).on('error', (error) => {
        throw new Error(error.message);
    });
});
