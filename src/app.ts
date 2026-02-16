import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import { fundRoutes } from './routes/fund.routes';
import { investorRoutes } from './routes/investor.routes';
import { investmentRoutes } from './routes/investment.routes';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';

const app: Application = express();

app.use(express.json());

if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

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
