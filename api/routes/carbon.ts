
/**
 * Carbon sink data API routes.
 * Handle carbon sink data query and export.
 */
import { Router, type Request, type Response } from 'express';
import { CarbonSinkData } from '../../shared/types.js';
import { generateMockCarbonSinkData } from '../../src/utils/mockData.js';

const router = Router();

let carbonSinkData: CarbonSinkData[] = generateMockCarbonSinkData();

/**
 * Get carbon sink data with filters
 * GET /api/carbon
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { basin, season, scenario, year, page = '1', limit = '50' } = req.query;
    
    let filtered = [...carbonSinkData];
    
    if (basin) {
      filtered = filtered.filter(d => d.basin === basin);
    }
    if (season) {
      filtered = filtered.filter(d => d.season === season);
    }
    if (scenario) {
      filtered = filtered.filter(d => d.scenario === scenario);
    }
    if (year) {
      filtered = filtered.filter(d => d.year === parseInt(year as string));
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    const basins = Array.from(new Set(filtered.map(d => d.basin)));
    const totalCarbon = filtered.reduce((sum, d) => sum + d.totalCarbonSink, 0);
    const avgCarbon = filtered.length > 0 ? totalCarbon / filtered.length : 0;

    res.status(200).json({
      success: true,
      data: {
        data: paginated,
        total: filtered.length,
        totalCarbonSink: totalCarbon.toFixed(2),
        averageCarbonSink: avgCarbon.toFixed(2),
        basins,
        page: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取碳汇数据失败'
    });
  }
});

/**
 * Export carbon sink data
 * GET /api/carbon/export
 */
router.get('/export', async (req: Request, res: Response): Promise<void> => {
  try {
    const { basin, season, scenario, year, format = 'json' } = req.query;
    
    let filtered = [...carbonSinkData];
    
    if (basin) {
      filtered = filtered.filter(d => d.basin === basin);
    }
    if (season) {
      filtered = filtered.filter(d => d.season === season);
    }
    if (scenario) {
      filtered = filtered.filter(d => d.scenario === scenario);
    }
    if (year) {
      filtered = filtered.filter(d => d.year === parseInt(year as string));
    }

    if (filtered.length === 0) {
      res.status(404).json({
        success: false,
        error: '碳汇数据不存在，请检查筛选条件'
      });
      return;
    }

    if (format === 'csv') {
      const headers = ['海盆', '季节', '排放情景', '年份', '总碳汇(Tg C yr⁻¹)', '生物泵(Pg C yr⁻¹)', '物理泵(Pg C yr⁻¹)', '碳酸盐泵(Pg C yr⁻¹)', '浮游植物(mg C m⁻³)', '浮游动物(mg C m⁻³)', '细菌(mg C m⁻³)'];
      const rows = filtered.map(d => [
        d.basin,
        d.season,
        d.scenario,
        d.year,
        d.totalCarbonSink.toFixed(2),
        d.biologicalPump.toFixed(4),
        d.physicalPump.toFixed(4),
        d.carbonatePump.toFixed(4),
        d.biomass.phytoplankton.toFixed(2),
        d.biomass.zooplankton.toFixed(2),
        d.biomass.bacteria.toFixed(2)
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="carbon_sink_data_${Date.now()}.csv"`);
      res.status(200).send('\ufeff' + csv);
    } else {
      res.status(200).json({
        success: true,
        data: filtered,
        total: filtered.length
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '导出碳汇数据失败'
    });
  }
});

/**
 * Get carbon sink statistics
 * GET /api/carbon/stats/summary
 */
router.get('/stats/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const basins = Array.from(new Set(carbonSinkData.map(d => d.basin)));
    const scenarios = Array.from(new Set(carbonSinkData.map(d => d.scenario)));
    const seasons = Array.from(new Set(carbonSinkData.map(d => d.season)));

    const basinStats = basins.map(basin => {
      const basinData = carbonSinkData.filter(d => d.basin === basin);
      return {
        basin,
        totalCarbon: basinData.reduce((sum, d) => sum + d.totalCarbonSink, 0),
        avgCarbon: basinData.length > 0 ? basinData.reduce((sum, d) => sum + d.totalCarbonSink, 0) / basinData.length : 0,
        avgBiologicalPump: basinData.length > 0 ? basinData.reduce((sum, d) => sum + d.biologicalPump, 0) / basinData.length : 0,
        avgPhysicalPump: basinData.length > 0 ? basinData.reduce((sum, d) => sum + d.physicalPump, 0) / basinData.length : 0,
        avgCarbonatePump: basinData.length > 0 ? basinData.reduce((sum, d) => sum + d.carbonatePump, 0) / basinData.length : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalRecords: carbonSinkData.length,
        basins,
        scenarios,
        seasons,
        totalCarbonSink: carbonSinkData.reduce((sum, d) => sum + d.totalCarbonSink, 0).toFixed(2),
        basinStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取碳汇统计失败'
    });
  }
});

/**
 * Get basin status for monitoring
 * GET /api/carbon/basin-status
 */
router.get('/basin-status', async (req: Request, res: Response): Promise<void> => {
  try {
    const basins = Array.from(new Set(carbonSinkData.map(d => d.basin)));
    
    const basinStatus = basins.map(basin => {
      const recentData = carbonSinkData
        .filter(d => d.basin === basin)
        .sort((a, b) => b.year - a.year)
        .slice(0, 3);
      
      let nppValues: number[];
      let deviations: number[];
      let consecutiveDeviations: number;
      let isPaused: boolean;
      
      if (basin === '太平洋') {
        nppValues = [2.0, 1.4, 0.9];
        deviations = [0, -30, -55];
        consecutiveDeviations = 3;
        isPaused = true;
      } else {
        nppValues = recentData.map(d => d.totalCarbonSink / 1000 + Math.random() * 0.5);
        deviations = nppValues.map((v, i, arr) => i > 0 ? ((v - arr[0]) / arr[0]) * 100 : 0);
        let consecutiveCount = 0;
        let maxConsecutive = 0;
        for (let i = 1; i < deviations.length; i++) {
          if (Math.abs(deviations[i]) > 20) {
            consecutiveCount++;
            maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
          } else {
            consecutiveCount = 0;
          }
        }
        consecutiveDeviations = maxConsecutive;
        isPaused = consecutiveDeviations >= 3;
      }
      
      const notifiedParties = isPaused ? ['首席科学家', '海洋碳汇研究组', 'IPCC联络员'] : [];
      
      return {
        basin,
        consecutiveDeviations,
        isPaused,
        lastNppValues: nppValues,
        lastDeviations: deviations,
        notifiedAt: isPaused ? new Date(Date.now() - 86400000 * 2).toISOString() : null,
        lockedAt: isPaused ? new Date(Date.now() - 86400000).toISOString() : null,
        lockedReason: isPaused ? '连续三次NPP偏差超过20%阈值，系统自动锁定' : '',
        notifiedParties,
        currentHandler: isPaused ? 'user-003' : null,
        currentHandlerName: isPaused ? '李首席' : null,
        unlockReason: null,
        unlockedAt: null,
        unlockedBy: null,
        unlockedByName: null
      };
    });

    res.status(200).json({
      success: true,
      data: basinStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取海盆状态失败'
    });
  }
});

/**
 * Get basin status for a specific basin
 * GET /api/carbon/basin-status/:basin
 */
router.get('/basin-status/:basin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { basin } = req.params;
    
    let nppValues: number[];
    let deviations: number[];
    let consecutiveDeviations: number;
    let isPaused: boolean;
    
    if (basin === '太平洋') {
      nppValues = [2.0, 1.4, 0.9];
      deviations = [0, -30, -55];
      consecutiveDeviations = 3;
      isPaused = true;
    } else {
      const recentData = carbonSinkData
        .filter(d => d.basin === basin)
        .sort((a, b) => b.year - a.year)
        .slice(0, 3);
      
      nppValues = recentData.map(d => d.totalCarbonSink / 1000 + Math.random() * 0.5);
      deviations = nppValues.map((v, i, arr) => i > 0 ? ((v - arr[0]) / arr[0]) * 100 : 0);
      let consecutiveCount = 0;
      let maxConsecutive = 0;
      for (let i = 1; i < deviations.length; i++) {
        if (Math.abs(deviations[i]) > 20) {
          consecutiveCount++;
          maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
        } else {
          consecutiveCount = 0;
        }
      }
      consecutiveDeviations = maxConsecutive;
      isPaused = consecutiveDeviations >= 3;
    }
    
    const notifiedParties = isPaused ? ['首席科学家', '海洋碳汇研究组', 'IPCC联络员'] : [];
    
    const basinStatus = {
      basin,
      consecutiveDeviations,
      isPaused,
      lastNppValues: nppValues,
      lastDeviations: deviations,
      notifiedAt: isPaused ? new Date(Date.now() - 86400000 * 2).toISOString() : null,
      lockedAt: isPaused ? new Date(Date.now() - 86400000).toISOString() : null,
      lockedReason: isPaused ? '连续三次NPP偏差超过20%阈值，系统自动锁定' : '',
      notifiedParties,
      currentHandler: isPaused ? 'user-003' : null,
      currentHandlerName: isPaused ? '李首席' : null,
      unlockReason: null,
      unlockedAt: null,
      unlockedBy: null,
      unlockedByName: null
    };

    res.status(200).json({
      success: true,
      data: basinStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取海盆状态失败'
    });
  }
});

/**
 * Unlock a basin manually
 * POST /api/carbon/basin-status/:basin/unlock
 */
router.post('/basin-status/:basin/unlock', async (req: Request, res: Response): Promise<void> => {
  try {
    const { basin } = req.params;
    const { reason, userId, userName } = req.body;
    
    if (!reason || !userId || !userName) {
      res.status(400).json({
        success: false,
        error: '解除锁定需要填写原因、操作人ID和姓名'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        basin,
        isPaused: false,
        consecutiveDeviations: 0,
        unlockReason: reason,
        unlockedAt: new Date().toISOString(),
        unlockedBy: userId,
        unlockedByName: userName
      },
      message: `${basin}已成功解除锁定`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '解除海盆锁定失败'
    });
  }
});

/**
 * Get recovery assessment for a basin
 * GET /api/carbon/recovery/:basin
 */
router.get('/recovery/:basin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { basin } = req.params;
    
    const recoveryData = {
      id: `recovery-${basin}`,
      basin,
      retestHistory: [
        {
          id: `retest-${basin}-001`,
          basin,
          status: 'completed' as const,
          nppDeviation: -22.5,
          threshold: 20,
          uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          result: 'fail' as const,
          recommendation: '建议重新校准营养盐初始条件，检查浮游植物死亡率参数设置',
          calibrationData: {
            name: '太平洋_NPP校准数据_20260601.nc',
            size: 15728640,
            uploadedBy: '张海洋'
          }
        },
        {
          id: `retest-${basin}-002`,
          basin,
          status: 'pending' as const,
          nppDeviation: null,
          threshold: 20,
          uploadedAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: null,
          result: null,
          recommendation: null,
          calibrationData: {
            name: '太平洋_NPP校准数据_20260608_revised.nc',
            size: 16249856,
            uploadedBy: '张海洋'
          }
        }
      ],
      consecutivePasses: 0,
      requiredPasses: 2,
      status: 'in_progress' as const,
      startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      completedAt: null
    };

    res.status(200).json({
      success: true,
      data: recoveryData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取恢复评估数据失败'
    });
  }
});

/**
 * Get carbon sink data by ID
 * GET /api/carbon/:id
 * NOTE: This must be the last route to avoid matching static paths like /export or /basin-status
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = carbonSinkData.find(d => d.id === id);
    
    if (!data) {
      res.status(404).json({
        success: false,
        error: '碳汇数据不存在'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取碳汇数据详情失败'
    });
  }
});

export default router;
