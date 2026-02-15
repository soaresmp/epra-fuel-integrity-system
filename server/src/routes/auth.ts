import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

function getPrisma(req: Request): PrismaClient {
  return req.app.locals.prisma;
}

// POST login (simple role-based auth matching the current prototype)
router.post('/login', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  // Find or create a user for this role (matches current prototype behavior)
  let user = await prisma.user.findFirst({ where: { role } });
  if (!user) {
    const roleNames: Record<string, string> = {
      admin: 'Admin User',
      operator: 'Depot Operator',
      station_operator: 'Station Operator',
      inspector: 'Inspector',
    };
    user = await prisma.user.create({
      data: {
        name: roleNames[role] || role,
        role,
        email: `${role}@epra.go.ke`,
        password: 'demo', // Placeholder - not for production use
      },
    });
  }

  res.json({ role: user.role, name: user.name });
});

// GET all users
router.get('/users', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const users = await prisma.user.findMany({
    select: { id: true, name: true, role: true, email: true, createdAt: true },
  });
  res.json(users);
});

export default router;
