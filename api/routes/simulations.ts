
/**
 * Simulation management API routes.
 * Handle CRUD operations for simulation tasks.
 */
import { Router, type Request, type Response } from 'express';
import { Simulation, SimulationStatus, BiologicalParams } from '../../shared/types.js';
import { generateMockSimulations } from '../../src/utils/mockData.js';

const router = Router();

let simulations: Simulation[] = generateMockSimulations();

const defaultParams: BiologicalParams = {
  growthRate: 0.5,
  mortalityRate: 0.1,
  sinkingRate: 1.5,
  pocSinkingVelocity: 100,
  remineralizationDepth: 1000
};

/**
 * Get all simulations
 * GET /api/simulations
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, basin, page = '1', limit = '20' } = req.query;
    
    let filtered = [...simulations];
    
    if (status) {
      filtered = filtered.filter(s => s.status === status);
    }
    if (basin) {
      filtered = filtered.filter(s => s.oceanBasin === basin);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    res.status(200).json({
      success: true,
      data: {
        simulations: paginated,
        total: filtered.length,
        page: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取模拟任务列表失败'
    });
  }
});

/**
 * Get simulation by ID
 * GET /api/simulations/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const simulation = simulations.find(s => s.id === id);
    
    if (!simulation) {
      res.status(404).json({
        success: false,
        error: '模拟任务不存在'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: simulation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取模拟任务详情失败'
    });
  }
});

/**
 * Create new simulation
 * POST /api/simulations
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, oceanBasin, season, emissionScenario, params } = req.body;
    
    if (!name || !oceanBasin || !season || !emissionScenario) {
      res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
      return;
    }

    const newSim: Simulation = {
      id: `sim-${Date.now()}`,
      name,
      description: description || '',
      oceanBasin,
      season,
      emissionScenario,
      status: SimulationStatus.PENDING_VALIDATION,
      params: { ...defaultParams, ...params },
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.headers['user-id'] as string || 'user-001',
      createdByName: req.headers['user-name'] as string || '系统用户',
      alertCount: 0,
      nppDeviation: 0
    };

    simulations.unshift(newSim);

    simulateStatusTransition(newSim.id);

    res.status(201).json({
      success: true,
      data: newSim,
      message: '模拟任务创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建模拟任务失败'
    });
  }
});

/**
 * Update simulation status
 * PUT /api/simulations/:id/status
 */
router.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, progress } = req.body;
    
    const index = simulations.findIndex(s => s.id === id);
    if (index === -1) {
      res.status(404).json({
        success: false,
        error: '模拟任务不存在'
      });
      return;
    }

    simulations[index] = {
      ...simulations[index],
      status,
      progress: progress ?? simulations[index].progress,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: simulations[index],
      message: '模拟状态更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新模拟状态失败'
    });
  }
});

/**
 * Delete simulation
 * DELETE /api/simulations/:id
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = simulations.findIndex(s => s.id === id);
    
    if (index === -1) {
      res.status(404).json({
        success: false,
        error: '模拟任务不存在'
      });
      return;
    }

    simulations.splice(index, 1);

    res.status(200).json({
      success: true,
      message: '模拟任务删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '删除模拟任务失败'
    });
  }
});

/**
 * Get simulation metrics
 * GET /api/simulations/:id/metrics
 */
router.get('/:id/metrics', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const simulation = simulations.find(s => s.id === id);
    
    if (!simulation) {
      res.status(404).json({
        success: false,
        error: '模拟任务不存在'
      });
      return;
    }

    const metrics = generateMockMetrics(id);

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取监控指标失败'
    });
  }
});

function simulateStatusTransition(simId: string) {
  const statusSequence = [
    { status: SimulationStatus.DATA_FUSION, progress: 15, delay: 1000 },
    { status: SimulationStatus.GRID_INITIALIZATION, progress: 30, delay: 2500 },
    { status: SimulationStatus.BIOGEOCHEMICAL_ITERATION, progress: 50, delay: 4000 },
    { status: SimulationStatus.CARBON_FLUX_CALCULATION, progress: 80, delay: 6000 },
    { status: SimulationStatus.COMPLETED, progress: 100, delay: 8000 }
  ];

  statusSequence.forEach(({ status, progress, delay }) => {
    setTimeout(() => {
      const index = simulations.findIndex(s => s.id === simId);
      if (index !== -1) {
        simulations[index] = {
          ...simulations[index],
          status,
          progress,
          updatedAt: new Date().toISOString()
        };
      }
    }, delay);
  });
}

function generateMockMetrics(simulationId: string) {
  const metrics = [];
  const now = Date.now();
  
  for (let i = 0; i < 50; i++) {
    const t = i * 0.1;
    metrics.push({
      timestamp: new Date(now - (50 - i) * 60000).toISOString(),
      simulationId,
      surfaceChlorophyll: 0.3 + Math.sin(t) * 0.1 + Math.random() * 0.05,
      euphoticZoneDepth: 80 + Math.cos(t * 0.5) * 15 + Math.random() * 5,
      hypoxicArea: 15000 + t * 50 + Math.sin(t * 0.3) * 500,
      hypoxicExpansionRate: 3 + Math.sin(t * 0.8) * 2 + Math.random() * 1,
      primaryProductivity: 500 + Math.sin(t * 0.4) * 100 + Math.random() * 30,
      npp: 1.2 + Math.sin(t * 0.3) * 0.3 + Math.random() * 0.1
    });
  }
  
  return metrics;
}

export default router;
