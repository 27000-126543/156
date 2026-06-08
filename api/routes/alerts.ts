
/**
 * Alert management API routes.
 * Handle alert CRUD operations and review workflow.
 */
import { Router, type Request, type Response } from 'express';
import { Alert, AlertLevel, BiologicalParams } from '../../shared/types.js';
import { generateMockAlerts } from '../../src/utils/mockData.js';

const router = Router();

let alerts: Alert[] = generateMockAlerts();

/**
 * Get all alerts
 * GET /api/alerts
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, reviewed, simulationId, page = '1', limit = '20' } = req.query;
    
    let filtered = [...alerts];
    
    if (level) {
      filtered = filtered.filter(a => a.level === level);
    }
    if (reviewed !== undefined) {
      const isReviewed = reviewed === 'true';
      filtered = filtered.filter(a => isReviewed ? !!a.reviewedAt : !a.reviewedAt);
    }
    if (simulationId) {
      filtered = filtered.filter(a => a.simulationId === simulationId);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    res.status(200).json({
      success: true,
      data: {
        alerts: paginated,
        total: filtered.length,
        unreadCount: filtered.filter(a => !a.reviewedAt).length,
        page: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取预警列表失败'
    });
  }
});

/**
 * Get alert by ID
 * GET /api/alerts/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const alert = alerts.find(a => a.id === id);
    
    if (!alert) {
      res.status(404).json({
        success: false,
        error: '预警不存在'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取预警详情失败'
    });
  }
});

/**
 * Review alert
 * POST /api/alerts/:id/review
 */
router.post('/:id/review', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { comment, approved, adjustments } = req.body;
    
    const index = alerts.findIndex(a => a.id === id);
    if (index === -1) {
      res.status(404).json({
        success: false,
        error: '预警不存在'
      });
      return;
    }

    if (!comment || !comment.trim()) {
      res.status(400).json({
        success: false,
        error: '复核意见不能为空'
      });
      return;
    }

    alerts[index] = {
      ...alerts[index],
      reviewedBy: req.headers['user-id'] as string || 'user-001',
      reviewedByName: req.headers['user-name'] as string || '系统用户',
      reviewComment: comment,
      reviewedAt: new Date().toISOString(),
      paramAdjustments: approved && adjustments ? adjustments as Partial<BiologicalParams> : null
    };

    res.status(200).json({
      success: true,
      data: alerts[index],
      message: approved ? '预警复核通过，参数已调整' : '预警已忽略'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '预警复核失败'
    });
  }
});

/**
 * Create new alert (system internal use)
 * POST /api/alerts
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { simulationId, simulationName, level, type, message, metric, currentValue, threshold } = req.body;
    
    if (!simulationId || !level || !metric) {
      res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
      return;
    }

    const newAlert: Alert = {
      id: `alert-${Date.now()}`,
      simulationId,
      simulationName: simulationName || '未知模拟',
      level: level as AlertLevel,
      type: type || 'anomaly',
      message: message || `${metric}异常`,
      metric,
      currentValue,
      threshold,
      timestamp: new Date().toISOString(),
      reviewedBy: null,
      reviewedByName: null,
      reviewComment: null,
      reviewedAt: null,
      paramAdjustments: null
    };

    alerts.unshift(newAlert);

    res.status(201).json({
      success: true,
      data: newAlert,
      message: '预警创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建预警失败'
    });
  }
});

/**
 * Get alert statistics
 * GET /api/alerts/stats/summary
 */
router.get('/stats/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const pending = alerts.filter(a => !a.reviewedAt);
    const critical = pending.filter(a => a.level === AlertLevel.CRITICAL);
    const warning = pending.filter(a => a.level === AlertLevel.WARNING);
    const info = pending.filter(a => a.level === AlertLevel.INFO);

    res.status(200).json({
      success: true,
      data: {
        total: alerts.length,
        pending: pending.length,
        critical: critical.length,
        warning: warning.length,
        info: info.length,
        reviewed: alerts.filter(a => a.reviewedAt).length,
        averageResponseTime: 45.2
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取预警统计失败'
    });
  }
});

export default router;
