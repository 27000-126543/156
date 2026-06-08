
/**
 * User authentication API route.
 * Handle user login, logout, and token management.
 */
import { Router, type Request, type Response } from 'express';
import { User, UserRole } from '../../shared/types.js';

const router = Router();

const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'chemist@ocean.edu',
    name: '张海洋',
    role: UserRole.CHEMIST,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-002',
    email: 'carbon@ocean.edu',
    name: '李碳汇',
    role: UserRole.CARBON_EXPERT,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-003',
    email: 'chief@ocean.edu',
    name: '王首席',
    role: UserRole.CHIEF_SCIENTIST,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: '邮箱和密码不能为空'
      });
      return;
    }

    let user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: UserRole.CHEMIST,
        createdAt: new Date().toISOString()
      };
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    res.status(200).json({
      success: true,
      data: {
        user,
        token,
        expiresIn: 86400
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '登录失败，请稍后重试'
    });
  }
});

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '登出失败'
    });
  }
});

/**
 * Get Current User
 * GET /api/auth/me
 */
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: '未授权访问'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: mockUsers[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    });
  }
});

export default router;
