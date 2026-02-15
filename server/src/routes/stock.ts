import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

function getPrisma(req: Request): PrismaClient {
  return req.app.locals.prisma;
}

// GET all stock data
router.get('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const stockData = await prisma.stockData.findMany({
    orderBy: { location: 'asc' },
  });
  res.json(stockData);
});

// GET single stock entry by location
router.get('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const stock = await prisma.stockData.findUnique({
    where: { id: parseInt(req.params.id, 10) },
  });
  if (!stock) return res.status(404).json({ error: 'Stock data not found' });
  res.json(stock);
});

// PUT update stock data
router.put('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const stock = await prisma.stockData.update({
    where: { id: parseInt(req.params.id, 10) },
    data: req.body,
  });
  res.json(stock);
});

export default router;
