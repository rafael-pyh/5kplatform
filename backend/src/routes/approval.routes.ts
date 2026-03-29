import { Router } from 'express';
import { approveSeller, rejectSeller } from '../controllers/approval.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.patch('/:id/approve', authenticate, requireAdmin, approveSeller);
router.patch('/:id/reject', authenticate, requireAdmin, rejectSeller);

export default router;