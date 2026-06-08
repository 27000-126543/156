
/**
 * AI recommendation API routes.
 * Handle parameter recommendations based on historical simulation data.
 */
import { Router, type Request, type Response } from 'express';
import { Recommendation } from '../../shared/types.js';
import { generateMockRecommendations } from '../../src/utils/mockData.js';

const router = Router();

let recommendations: Recommendation[] = generateMockRecommendations();

/**
 * Get all recommendations
 * GET /api/recommendations
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { adopted, simulationId, page = '1', limit = '20' } = req.query;
    
    let filtered = [...recommendations];
    
    if (adopted !== undefined) {
      const isAdopted = adopted === 'true';
      filtered = filtered.filter(r => isAdopted ? r.adopted : !r.adopted);
    }
    if (simulationId) {
      filtered = filtered.filter(r => r.simulationId === simulationId);
    }

    filtered.sort((a, b) => b.confidence - a.confidence);

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    res.status(200).json({
      success: true,
      data: {
        recommendations: paginated,
        total: filtered.length,
        averageConfidence: filtered.length > 0 
          ? (filtered.reduce((sum, r) => sum + r.confidence, 0) / filtered.length).toFixed(3)
          : '0',
        page: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取推荐列表失败'
    });
  }
});

/**
 * Get recommendation by ID
 * GET /api/recommendations/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const recommendation = recommendations.find(r => r.id === id);
    
    if (!recommendation) {
      res.status(404).json({
        success: false,
        error: '推荐方案不存在'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取推荐详情失败'
    });
  }
});

/**
 * Adopt recommendation
 * POST /api/recommendations/:id/adopt
 */
router.post('/:id/adopt', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const index = recommendations.findIndex(r => r.id === id);
    if (index === -1) {
      res.status(404).json({
        success: false,
        error: '推荐方案不存在'
      });
      return;
    }

    recommendations[index] = {
      ...recommendations[index],
      adopted: true
    };

    res.status(200).json({
      success: true,
      data: recommendations[index],
      message: '推荐方案已采纳'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '采纳推荐方案失败'
    });
  }
});

/**
 * Generate new recommendation for a simulation
 * POST /api/recommendations/generate
 */
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { simulationId, simulationName } = req.body;
    
    if (!simulationId) {
      res.status(400).json({
        success: false,
        error: '缺少模拟任务ID'
      });
      return;
    }

    const paramOptions = [
      { key: 'pocSinkingVelocity', name: '颗粒有机碳沉降速度', value: 100 + Math.random() * 50, unit: 'm d⁻¹' },
      { key: 'remineralizationDepth', name: '再矿化深度', value: 900 + Math.random() * 400, unit: 'm' },
      { key: 'growthRate', name: '浮游植物生长率', value: 0.5 + Math.random() * 0.3, unit: 'd⁻¹' },
      { key: 'sinkingRate', name: '生物量沉降速率', value: 1.5 + Math.random() * 1.0, unit: 'm d⁻¹' }
    ];

    const opt = paramOptions[Math.floor(Math.random() * paramOptions.length)];

    const newRec: Recommendation = {
      id: `rec-${Date.now()}`,
      simulationId,
      simulationName: simulationName || '未知模拟',
      params: { [opt.key]: Math.round(opt.value * 100) / 100 } as any,
      confidence: 0.75 + Math.random() * 0.2,
      rationale: `基于历史模拟数据分析，调整${opt.name}可显著降低NPP偏差，提升碳汇评估精度。参考同区域${20 + Math.floor(Math.random() * 30)}次成功模拟案例。`,
      historicalPerformance: {
        nppImprovement: 8 + Math.random() * 15,
        rmseReduction: 5 + Math.random() * 10
      },
      createdAt: new Date().toISOString(),
      adopted: false
    };

    recommendations.unshift(newRec);

    res.status(201).json({
      success: true,
      data: newRec,
      message: '推荐方案已生成'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '生成推荐方案失败'
    });
  }
});

/**
 * Get recommendation statistics
 * GET /api/recommendations/stats/summary
 */
router.get('/stats/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const adopted = recommendations.filter(r => r.adopted);
    const highConfidence = recommendations.filter(r => r.confidence >= 0.85);

    const avgNppImprovement = adopted.length > 0
      ? adopted.reduce((sum, r) => sum + r.historicalPerformance.nppImprovement, 0) / adopted.length
      : 0;
    const avgRmseReduction = adopted.length > 0
      ? adopted.reduce((sum, r) => sum + r.historicalPerformance.rmseReduction, 0) / adopted.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        total: recommendations.length,
        adopted: adopted.length,
        pending: recommendations.filter(r => !r.adopted).length,
        highConfidence: highConfidence.length,
        averageConfidence: recommendations.length > 0
          ? (recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length).toFixed(3)
          : '0',
        averageNppImprovement: avgNppImprovement.toFixed(1),
        averageRmseReduction: avgRmseReduction.toFixed(1)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取推荐统计失败'
    });
  }
});

export default router;
