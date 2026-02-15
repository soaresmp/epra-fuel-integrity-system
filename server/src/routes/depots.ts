import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

function getPrisma(req: Request): PrismaClient {
  return req.app.locals.prisma;
}

// GET all depots
router.get('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const depots = await prisma.depot.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(depots);
});

// GET single depot
router.get('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const depot = await prisma.depot.findUnique({
    where: { id: req.params.id },
    include: { stations: true },
  });
  if (!depot) return res.status(404).json({ error: 'Depot not found' });
  res.json(depot);
});

// POST create depot
router.post('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const depot = await prisma.depot.create({ data: req.body });
  res.status(201).json(depot);
});

// PUT update depot
router.put('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const depot = await prisma.depot.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(depot);
});

// DELETE depot
router.delete('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  await prisma.depot.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
