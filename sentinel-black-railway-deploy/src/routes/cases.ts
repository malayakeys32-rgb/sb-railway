import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';
import { logAudit } from '../services/audit';
import {
  CreateCaseInput,
  UpdateCaseInput,
  CaseQueryFilters,
  CaseStatus,
  CaseCategory,
  CaseSeverity,
} from '../types/case';

const router = express.Router();
const prisma = new PrismaClient();

// Validation helpers
const validateCaseInput = (data: any): { valid: boolean; error?: string } => {
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    return { valid: false, error: 'Title is required and must be non-empty' };
  }
  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    return { valid: false, error: 'Description is required and must be non-empty' };
  }
  if (!data.category || !['INFESTATION', 'LANDLORD_NEGLIGENCE', 'HARASSMENT', 'WORKPLACE', 'SAFETY', 'OTHER'].includes(data.category)) {
    return { valid: false, error: 'Invalid or missing category' };
  }
  if (!data.location || typeof data.location !== 'string' || data.location.trim().length === 0) {
    return { valid: false, error: 'Location is required and must be non-empty' };
  }
  if (data.severity && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(data.severity)) {
    return { valid: false, error: 'Invalid severity' };
  }
  if (data.status && !['OPEN', 'ACTIVE', 'ESCALATED', 'CLOSED'].includes(data.status)) {
    return { valid: false, error: 'Invalid status' };
  }
  return { valid: true };
};

// GET all cases with filtering, pagination, and search
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const {
      status,
      category,
      severity,
      location,
      limit = '10',
      offset = '0',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Parse pagination
    const pageLimit = Math.min(Math.max(1, parseInt(limit as string) || 10), 100); // Max 100
    const pageOffset = Math.max(0, parseInt(offset as string) || 0);

    // Build filters
    const filters: any = {};
    if (status && ['OPEN', 'ACTIVE', 'ESCALATED', 'CLOSED'].includes(status as string)) {
      filters.status = status as CaseStatus;
    }
    if (category && ['INFESTATION', 'LANDLORD_NEGLIGENCE', 'HARASSMENT', 'WORKPLACE', 'SAFETY', 'OTHER'].includes(category as string)) {
      filters.category = category as CaseCategory;
    }
    if (severity && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity as string)) {
      filters.severity = severity as CaseSeverity;
    }
    if (location) {
      filters.location = { contains: location as string, mode: 'insensitive' };
    }

    // Validate sortBy
    const validSortFields = ['createdAt', 'updatedAt', 'severity'];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const order = (sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where: filters,
        take: pageLimit,
        skip: pageOffset,
        orderBy: { [sortField]: order },
        include: { owner: { select: { id: true, name: true, email: true } } },
      }),
      prisma.case.count({ where: filters }),
    ]);

    await logAudit(req.user!.id, 'VIEW', 'CASE', undefined, { filters, limit: pageLimit, offset: pageOffset });

    return res.json({
      data: cases,
      pagination: {
        limit: pageLimit,
        offset: pageOffset,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    });
  } catch (err) {
    console.error('GET /cases error:', err);
    return res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// POST create new case
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const validation = validateCaseInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const input: CreateCaseInput = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      category: req.body.category,
      location: req.body.location.trim(),
      severity: req.body.severity || 'LOW',
      status: req.body.status || 'OPEN',
    };

    const newCase = await prisma.case.create({
      data: {
        ...input,
        ownerUserId: req.user!.id,
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    await logAudit(req.user!.id, 'CREATE', 'CASE', newCase.id, { title: input.title });

    return res.status(201).json(newCase);
  } catch (err) {
    console.error('POST /cases error:', err);
    return res.status(500).json({ error: 'Failed to create case' });
  }
});

// GET single case by ID
router.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const caseData = await prisma.case.findUnique({
      where: { id },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    await logAudit(req.user!.id, 'VIEW', 'CASE', id);

    return res.json(caseData);
  } catch (err) {
    console.error(`GET /cases/${req.params.id} error:`, err);
    return res.status(500).json({ error: 'Failed to fetch case' });
  }
});

// PATCH update case
router.patch('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check case exists and user has permission
    const existingCase = await prisma.case.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!existingCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Only owner or admin can update
    if (existingCase.ownerUserId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to update this case' });
    }

    // Validate partial input
    const updateData: UpdateCaseInput = {};
    if (req.body.title !== undefined) {
      if (typeof req.body.title !== 'string' || req.body.title.trim().length === 0) {
        return res.status(400).json({ error: 'Title must be non-empty' });
      }
      updateData.title = req.body.title.trim();
    }
    if (req.body.description !== undefined) {
      if (typeof req.body.description !== 'string' || req.body.description.trim().length === 0) {
        return res.status(400).json({ error: 'Description must be non-empty' });
      }
      updateData.description = req.body.description.trim();
    }
    if (req.body.category !== undefined) {
      if (!['INFESTATION', 'LANDLORD_NEGLIGENCE', 'HARASSMENT', 'WORKPLACE', 'SAFETY', 'OTHER'].includes(req.body.category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      updateData.category = req.body.category;
    }
    if (req.body.status !== undefined) {
      if (!['OPEN', 'ACTIVE', 'ESCALATED', 'CLOSED'].includes(req.body.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updateData.status = req.body.status;
    }
    if (req.body.severity !== undefined) {
      if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(req.body.severity)) {
        return res.status(400).json({ error: 'Invalid severity' });
      }
      updateData.severity = req.body.severity;
    }
    if (req.body.location !== undefined) {
      if (typeof req.body.location !== 'string' || req.body.location.trim().length === 0) {
        return res.status(400).json({ error: 'Location must be non-empty' });
      }
      updateData.location = req.body.location.trim();
    }

    const updated = await prisma.case.update({
      where: { id },
      data: updateData,
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    await logAudit(req.user!.id, 'UPDATE', 'CASE', id, updateData);

    return res.json(updated);
  } catch (err) {
    console.error(`PATCH /cases/${req.params.id} error:`, err);
    return res.status(500).json({ error: 'Failed to update case' });
  }
});

// DELETE case
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const caseData = await prisma.case.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Only owner or admin can delete
    if (caseData.ownerUserId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this case' });
    }

    await prisma.case.delete({ where: { id } });
    await logAudit(req.user!.id, 'DELETE', 'CASE', id);

    return res.status(204).send();
  } catch (err) {
    console.error(`DELETE /cases/${req.params.id} error:`, err);
    return res.status(500).json({ error: 'Failed to delete case' });
  }
});

// GET case stats/analytics
router.get('/analytics/stats', auth, async (req: Request, res: Response) => {
  try {
    const [
      totalCases,
      byStatus,
      byCategory,
      bySeverity,
      recentCreated,
    ] = await Promise.all([
      prisma.case.count(),
      prisma.case.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.case.groupBy({
        by: ['category'],
        _count: true,
      }),
      prisma.case.groupBy({
        by: ['severity'],
        _count: true,
      }),
      prisma.case.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    const stats = {
      totalCases,
      byStatus: Object.fromEntries(byStatus.map(item => [item.status, item._count])),
      byCategory: Object.fromEntries(byCategory.map(item => [item.category, item._count])),
      bySeverity: Object.fromEntries(bySeverity.map(item => [item.severity, item._count])),
      createdLast7Days: recentCreated,
    };

    await logAudit(req.user!.id, 'VIEW', 'CASE_ANALYTICS');

    return res.json(stats);
  } catch (err) {
    console.error('GET /cases/analytics/stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET cases by user
router.get('/user/:userId', auth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '10', offset = '0' } = req.query;

    const pageLimit = Math.min(Math.max(1, parseInt(limit as string) || 10), 100);
    const pageOffset = Math.max(0, parseInt(offset as string) || 0);

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where: { ownerUserId: userId },
        take: pageLimit,
        skip: pageOffset,
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { id: true, name: true, email: true } } },
      }),
      prisma.case.count({ where: { ownerUserId: userId } }),
    ]);

    await logAudit(req.user!.id, 'VIEW', 'CASE', userId, { filter: 'by_user' });

    return res.json({
      data: cases,
      pagination: {
        limit: pageLimit,
        offset: pageOffset,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    });
  } catch (err) {
    console.error(`GET /cases/user/:userId error:`, err);
    return res.status(500).json({ error: 'Failed to fetch user cases' });
  }
});

export default router;

