
import React from 'react';
import {
  Settings,
  User,
  Bell,
  Database,
  Globe,
  Shield,
  Palette,
  Save,
  Info
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { roleLabels } from '../utils/mockData';

export const SettingsPage: React.FC = () => {
  const { user } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="text-ocean-400" size={28} />
          系统设置
        </h1>
        <p className="text-white/60 text-sm mt-1">管理个人账户、系统配置和通知偏好</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <User size={18} className="text-ocean-400" />
              <span>个人账户</span>
            </div>
            <div className="p-4 space-y-4">
              {user && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{user.name}</h3>
                    <p className="text-ocean-400 text-sm">{user.email}</p>
                    <p className="text-white/50 text-xs mt-1">
                      角色: {roleLabels[user.role]}
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">姓名</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-ocean-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">邮箱</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-ocean-500/50 transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="btn-primary flex items-center gap-2">
                  <Save size={16} />
                  保存更改
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Bell size={18} className="text-coral-400" />
              <span>通知设置</span>
            </div>
            <div className="p-4 space-y-4">
              {[
                { label: '预警通知', desc: '缺氧区扩张、初级生产力骤降等紧急预警', defaultChecked: true },
                { label: '模拟完成通知', desc: '模拟任务完成或失败时通知', defaultChecked: true },
                { label: '审批通知', desc: '待审批任务和审批结果通知', defaultChecked: true },
                { label: '系统公告', desc: '系统维护、更新等公告信息', defaultChecked: false },
                { label: '周报订阅', desc: '每周一发送上周性能统计报告', defaultChecked: true }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-xs text-white/50">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ocean-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Database size={18} className="text-seaweed-400" />
              <span>数据配置</span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">默认海洋环流模式</label>
                <select className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-ocean-500/50 transition-colors">
                  <option className="bg-ocean-900">CMIP6 - 高分辨率</option>
                  <option className="bg-ocean-900">CMIP6 - 中分辨率</option>
                  <option className="bg-ocean-900">CMIP5 - 历史数据</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">默认时间步长 (分钟)</label>
                  <input
                    type="number"
                    defaultValue={30}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-ocean-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">模拟时长 (天)</label>
                  <input
                    type="number"
                    defaultValue={365}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-ocean-500/50 transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="btn-primary flex items-center gap-2">
                  <Save size={16} />
                  保存配置
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Globe size={18} className="text-ocean-400" />
              <span>海盆监控配置</span>
            </div>
            <div className="p-4 space-y-2">
              {['太平洋', '大西洋', '印度洋', '北冰洋', '南大洋', '地中海', '加勒比海'].map((basin, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-white/80 text-sm">{basin}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={i < 5} className="sr-only peer" />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-seaweed-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Shield size={18} className="text-seaweed-400" />
              <span>安全设置</span>
            </div>
            <div className="p-4 space-y-3">
              <button className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors text-left">
                修改密码
              </button>
              <button className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors text-left">
                两步验证
              </button>
              <button className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors text-left">
                登录设备管理
              </button>
              <button className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors text-left">
                API密钥管理
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Info size={18} className="text-ocean-400" />
              <span>关于系统</span>
            </div>
            <div className="p-4 text-sm text-white/60 space-y-2">
              <div className="flex justify-between">
                <span>系统版本</span>
                <span className="text-white font-mono">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>构建日期</span>
                <span className="text-white font-mono">2024-12-01</span>
              </div>
              <div className="flex justify-between">
                <span>数据更新频率</span>
                <span className="text-white font-mono">实时</span>
              </div>
              <div className="flex justify-between">
                <span>模型分辨率</span>
                <span className="text-white font-mono">0.25° × 0.25°</span>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-ocean-500/10 border border-ocean-500/20">
                <p className="text-ocean-300 text-xs">
                  本平台基于全球海洋环流模式和生物地球化学耦合模型，为海洋碳汇评估提供高精度数值模拟支持。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
