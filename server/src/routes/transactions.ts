import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

function getPrisma(req: Request): PrismaClient {
  return req.app.locals.prisma;
}

// GET all transactions
router.get('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
  });
  // Map DB column names back to frontend field names
  const mapped = transactions.map(t => ({
    id: t.id,
    from: t.fromLocation,
    to: t.toLocation,
    vehicle: t.vehicle,
    status: t.status,
    volume: t.volume,
    type: t.fuelType,
    date: t.date,
    time: t.time,
    driver: t.driver,
    driverLicense: t.driverLicense,
    transporter: t.transporter,
    loadingBay: t.loadingBay,
    compartment: t.compartment,
    sealNumberLoading: t.sealNumberLoading,
    sealNumberDelivery: t.sealNumberDelivery,
    markerType: t.markerType,
    markerConcentration: t.markerConcentration,
    markerBatchNo: t.markerBatchNo,
    temperature: t.temperature,
    density: t.density,
    loadingTicket: t.loadingTicket,
    expectedDelivery: t.expectedDelivery,
    gpsLoading: t.gpsLoading,
    approvedBy: t.approvedBy,
  }));
  res.json(mapped);
});

// GET single transaction
router.get('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const t = await prisma.transaction.findUnique({
    where: { id: req.params.id },
  });
  if (!t) return res.status(404).json({ error: 'Transaction not found' });
  res.json({
    id: t.id,
    from: t.fromLocation,
    to: t.toLocation,
    vehicle: t.vehicle,
    status: t.status,
    volume: t.volume,
    type: t.fuelType,
    date: t.date,
    time: t.time,
    driver: t.driver,
    driverLicense: t.driverLicense,
    transporter: t.transporter,
    loadingBay: t.loadingBay,
    compartment: t.compartment,
    sealNumberLoading: t.sealNumberLoading,
    sealNumberDelivery: t.sealNumberDelivery,
    markerType: t.markerType,
    markerConcentration: t.markerConcentration,
    markerBatchNo: t.markerBatchNo,
    temperature: t.temperature,
    density: t.density,
    loadingTicket: t.loadingTicket,
    expectedDelivery: t.expectedDelivery,
    gpsLoading: t.gpsLoading,
    approvedBy: t.approvedBy,
  });
});

// POST create transaction
router.post('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { from: fromLocation, to: toLocation, type: fuelType, ...rest } = req.body;
  const transaction = await prisma.transaction.create({
    data: { fromLocation, toLocation, fuelType, ...rest },
  });
  res.status(201).json(transaction);
});

// PUT update transaction (e.g., status change)
router.put('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { from: fromLocation, to: toLocation, type: fuelType, ...rest } = req.body;
  const data: any = { ...rest };
  if (fromLocation !== undefined) data.fromLocation = fromLocation;
  if (toLocation !== undefined) data.toLocation = toLocation;
  if (fuelType !== undefined) data.fuelType = fuelType;
  const transaction = await prisma.transaction.update({
    where: { id: req.params.id },
    data,
  });
  res.json(transaction);
});

// PATCH update transaction status
router.patch('/:id/status', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { status } = req.body;
  const transaction = await prisma.transaction.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(transaction);
});

export default router;
