import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

function getPrisma(req: Request): PrismaClient {
  return req.app.locals.prisma;
}

// GET all stations
router.get('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const stations = await prisma.gasStation.findMany({
    orderBy: { name: 'asc' },
    include: { depot: true },
  });
  res.json(stations);
});

// GET single station
router.get('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const station = await prisma.gasStation.findUnique({
    where: { id: req.params.id },
    include: { depot: true },
  });
  if (!station) return res.status(404).json({ error: 'Station not found' });
  res.json(station);
});

// POST create station
router.post('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const station = await prisma.gasStation.create({ data: req.body });
  res.status(201).json(station);
});

// PUT update station
router.put('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const station = await prisma.gasStation.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(station);
});

// DELETE station
router.delete('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  await prisma.gasStation.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
