import express, { Application, Request, Response } from 'express';
import { fundRoutes } from './routes/fund.routes';

const app: Application = express();

app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/funds', fundRoutes);

export { app };
