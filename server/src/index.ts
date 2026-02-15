import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import depotRoutes from './routes/depots';
import stationRoutes from './routes/stations';
import transactionRoutes from './routes/transactions';
import stockRoutes from './routes/stock';
import incidentRoutes from './routes/incidents';
import authRoutes from './routes/auth';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Make prisma available to routes
app.locals.prisma = prisma;

// Routes
app.use('/api/depots', depotRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
