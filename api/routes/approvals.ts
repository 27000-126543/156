
/**
 * Approval workflow API routes.
 * Handle two-level approval process for simulation results.
 */
import { Router, type Request, type Response } from 'express';
import { Approval, ApprovalStatus } from '../../shared/types.js';
import { generateMockApprovals } from '../../src/utils/mockData.js';

const router = Router();

let approvals: Approval[] = generateMockApprovals();

/**
 * Get all approvals
 * GET /api/approvals
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, level, page = '1', limit = '20' } = req.query;
    
    let filtered = [...approvals];
    
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    if (level) {
      filtered = filtered.filter(a => a.level === parseInt(level as string));
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    res.status(200).json({
      success: true,
      data: {
        approvals: paginated,
        total: filtered.length,
        pending: filtered.filter(a => a.status === ApprovalStatus.PENDING).length,
        page: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取审批列表失败'
    });
  }
});

/**
 * Get approval by ID
 * GET /api/approvals/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const approval = approvals.find(a => a.id === id);
    
    if (!approval) {
      res.status(404).json({
        success: false,
        error: '审批任务不存在'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: approval
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取审批详情失败'
    });
  }
});

/**
 * Process approval
 * POST /api/approvals/:id/process
 */
router.post('/:id/process', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { approved, comments } = req.body;
    
    const index = approvals.findIndex(a => a.id === id);
    if (index === -1) {
      res.status(404).json({
        success: false,
        error: '审批任务不存在'
      });
      return;
    }

    if (!comments || !comments.trim()) {
      res.status(400).json({
        success: false,
        error: '审批意见不能为空'
      });
      return;
    }

    const oldApproval = approvals[index];
    approvals[index] = {
      ...oldApproval,
      status: approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
      reviewer: req.headers['user-id'] as string || 'user-001',
      reviewerName: req.headers['user-name'] as string || '系统用户',
      comments,
      reviewedAt: new Date().toISOString()
    };

    if (approved && oldApproval.level === 2) {
      setTimeout(() => {
        console.log(`[IPCC] 推送模拟结果: ${oldApproval.simulationId}`);
        console.log(`[Engineering] 推送至海洋负排放工程组: ${oldApproval.simulationId}`);
      }, 1000);
    }

    if (approved && oldApproval.level === 1) {
      const level2Approval: Approval = {
        id: `approval-${Date.now()}`,
        simulationId: oldApproval.simulationId,
        simulationName: oldApproval.simulationName,
        level: 2,
        status: ApprovalStatus.PENDING,
        reviewer: null,
        reviewerName: null,
        comments: '',
        createdAt: new Date().toISOString(),
        reviewedAt: null
      };
      approvals.push(level2Approval);
    }

    res.status(200).json({
      success: true,
      data: approvals[index],
      message: approved 
        ? (oldApproval.level === 2 ? '审批通过，结果已推送至IPCC和工程组' : '一级审批通过，已提交二级审批')
        : '审批已驳回'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '审批处理失败'
    });
  }
});

/**
 * Create new approval (after simulation completion)
 * POST /api/approvals
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { simulationId, simulationName } = req.body;
    
    if (!simulationId) {
      res.status(400).json({
        success: false,
        error: '缺少模拟任务ID'
      });
      return;
    }

    const newApproval: Approval = {
      id: `approval-${Date.now()}`,
      simulationId,
      simulationName: simulationName || '未知模拟',
      level: 1,
      status: ApprovalStatus.PENDING,
      reviewer: null,
      reviewerName: null,
      comments: '',
      createdAt: new Date().toISOString(),
      reviewedAt: null
    };

    approvals.unshift(newApproval);

    res.status(201).json({
      success: true,
      data: newApproval,
      message: '审批任务已创建'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建审批任务失败'
    });
  }
});

/**
 * Get approval statistics
 * GET /api/approvals/stats/summary
 */
router.get('/stats/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const pending = approvals.filter(a => a.status === ApprovalStatus.PENDING);
    const approved = approvals.filter(a => a.status === ApprovalStatus.APPROVED);
    const rejected = approvals.filter(a => a.status === ApprovalStatus.REJECTED);

    res.status(200).json({
      success: true,
      data: {
        total: approvals.length,
        pending: pending.length,
        level1Pending: pending.filter(a => a.level === 1).length,
        level2Pending: pending.filter(a => a.level === 2).length,
        approved: approved.length,
        rejected: rejected.length,
        approvalRate: approvals.length > 0 ? (approved.length / approvals.length * 100).toFixed(1) : '0'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取审批统计失败'
    });
  }
});

export default router;
