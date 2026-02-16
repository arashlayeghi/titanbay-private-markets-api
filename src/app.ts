import express, { Application, Request, Response } from 'express';
import { fundRoutes } from './routes/fund.routes';
import { investorRoutes } from './routes/investor.routes';
import { investmentRoutes } from './routes/investment.routes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/funds', fundRoutes);
app.use('/investors', investorRoutes);
app.use('/funds/:fund_id/investments', investmentRoutes);

// Global error handler (must be after routes)
app.use(errorHandler);

export { app };
