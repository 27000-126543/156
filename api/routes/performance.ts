
/**
 * Performance statistics API routes.
 * Handle system performance monitoring and statistics.
 */
import { Router, type Request, type Response } from 'express';
import { PerformanceStats } from '../../shared/types.js';
import { generateMockPerformanceStats } from '../../src/utils/mockData.js';

const router = Router();

let performanceStats: PerformanceStats[] = generateMockPerformanceStats();

/**
 * Get performance statistics
 * GET /api/performance
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = 'daily', page = '1', limit = '30' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const start = (pageNum - 1) * limitNum;
    const paginated = performanceStats.slice(start, start + limitNum);

    const total = performanceStats.length;
    const avgCompletionRate = performanceStats.reduce((sum, d) => sum + d.simulationCompletionRate, 0) / (total || 1);
    const avgAlertResponseTime = performanceStats.reduce((sum, d) => sum + d.averageAlertResponseTime, 0) / (total || 1);
    const avgAccuracy = performanceStats.reduce((sum, d) => sum + d.carbonSinkAssessmentAccuracy, 0) / (total || 1);

    res.status(200).json({
      success: true,
      data: {
        stats: paginated,
        total,
        averages: {
          simulationCompletionRate: avgCompletionRate.toFixed(1),
          averageAlertResponseTime: avgAlertResponseTime.toFixed(1),
          carbonSinkAssessmentAccuracy: avgAccuracy.toFixed(1)
        },
        page: pageNum,
        limit: limitNum,
        period
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取性能统计失败'
    });
  }
});

/**
 * Get performance summary
 * GET /api/performance/summary
 */
router.get('/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const latest = performanceStats[0];
    const history = performanceStats.slice(0, 14);

    const avgCompletionRate = history.reduce((sum, d) => sum + d.simulationCompletionRate, 0) / (history.length || 1);
    const avgAlertResponseTime = history.reduce((sum, d) => sum + d.averageAlertResponseTime, 0) / (history.length || 1);
    const avgAccuracy = history.reduce((sum, d) => sum + d.carbonSinkAssessmentAccuracy, 0) / (history.length || 1);

    const totalAlerts = history.reduce((sum, d) => sum + d.alertsGenerated, 0);
    const totalApproved = history.reduce((sum, d) => sum + d.approvedSimulations, 0);
    const totalCompleted = history.reduce((sum, d) => sum + d.completedSimulations, 0);

    const carbonPumpEfficiency = {
      biologicalPump: 75.5 + Math.random() * 10,
      physicalPump: 68.2 + Math.random() * 10,
      carbonatePump: 45.8 + Math.random() * 10,
      microbialLoop: 52.3 + Math.random() * 10,
      exportEfficiency: 61.7 + Math.random() * 10,
      sequestrationEfficiency: 58.4 + Math.random() * 10
    };

    res.status(200).json({
      success: true,
      data: {
        date: new Date().toISOString().split('T')[0],
        simulationCompletionRate: latest.simulationCompletionRate,
        averageAlertResponseTime: latest.averageAlertResponseTime,
        carbonSinkAssessmentAccuracy: latest.carbonSinkAssessmentAccuracy,
        averages: {
          simulationCompletionRate: avgCompletionRate.toFixed(1),
          averageAlertResponseTime: avgAlertResponseTime.toFixed(1),
          carbonSinkAssessmentAccuracy: avgAccuracy.toFixed(1)
        },
        totals: {
          alerts: totalAlerts,
          approved: totalApproved,
          completed: totalCompleted
        },
        carbonPumpEfficiency,
        last14Days: history
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取性能摘要失败'
    });
  }
});

/**
 * Generate daily report
 * POST /api/performance/generate-daily
 */
router.post('/generate-daily', async (req: Request, res: Response): Promise<void> => {
  try {
    const newDate = req.body?.date || new Date().toISOString().split('T')[0];
    
    const dayStart = performanceStats.find(d => d.date === newDate);
    if (dayStart) {
      res.status(200).json({
        success: true,
        data: dayStart,
        message: '今日统计已存在'
      });
      return;
    }

    const newStat: PerformanceStats = {
      id: `perf-${Date.now()}`,
      date: newDate,
      simulationCompletionRate: 85 + Math.random() * 10,
      averageAlertResponseTime: 15 + Math.random() * 10,
      carbonSinkAssessmentAccuracy: 90 + Math.random() * 5,
      totalSimulations: 10 + Math.floor(Math.random() * 20),
      completedSimulations: 8 + Math.floor(Math.random() * 15),
      failedSimulations: Math.floor(Math.random() * 3),
      alertsGenerated: 3 + Math.floor(Math.random() * 7),
      alertsReviewed: 2 + Math.floor(Math.random() * 5),
      approvedSimulations: 5 + Math.floor(Math.random() * 10),
      carbonPumpEfficiency: {
        biologicalPump: 70 + Math.random() * 15,
        physicalPump: 65 + Math.random() * 10,
        carbonatePump: 40 + Math.random() * 15,
        microbialLoop: 50 + Math.random() * 10,
        exportEfficiency: 60 + Math.random() * 10,
        sequestrationEfficiency: 55 + Math.random() * 10
      },
      createdAt: new Date().toISOString()
    };

    performanceStats.unshift(newStat);

    res.status(201).json({
      success: true,
      data: newStat,
      message: '每日统计已生成'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '生成每日统计失败'
    });
  }
});

/**
 * Get carbon pump efficiency data
 * GET /api/performance/carbon-pump
 */
router.get('/carbon-pump', async (req: Request, res: Response): Promise<void> => {
  try {
    const latest = performanceStats[0];
    
    res.status(200).json({
      success: true,
      data: latest?.carbonPumpEfficiency || {
        biologicalPump: 75.5,
        physicalPump: 68.2,
        carbonatePump: 45.8,
        microbialLoop: 52.3,
        exportEfficiency: 61.7,
        sequestrationEfficiency: 58.4
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取碳泵效率数据失败'
    });
  }
});

export default router;
