import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

function getPrisma(req: Request): PrismaClient {
  return req.app.locals.prisma;
}

// GET all incidents
router.get('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const incidents = await prisma.incident.findMany({
    orderBy: { timestamp: 'desc' },
  });
  res.json(incidents);
});

// GET single incident
router.get('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const incident = await prisma.incident.findUnique({
    where: { id: req.params.id },
  });
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  res.json(incident);
});

// POST create incident
router.post('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const incident = await prisma.incident.create({ data: req.body });
  res.status(201).json(incident);
});

// PUT update incident
router.put('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const incident = await prisma.incident.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(incident);
});

// PATCH update incident status
router.patch('/:id/status', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { status } = req.body;
  const incident = await prisma.incident.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(incident);
});

export default router;
