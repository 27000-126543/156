
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  Microscope,
  Activity,
  AlertTriangle,
  Brain,
  CheckSquare,
  FileBarChart,
  Settings,
  Waves,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, unreadAlertCount, activeTab, setActiveTab } = useStore();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: '性能看板', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { id: 'data-upload', label: '数据上传', icon: <Upload size={20} />, path: '/data-upload' },
    { id: 'simulations', label: '模拟任务', icon: <Microscope size={20} />, path: '/simulations' },
    { id: 'monitoring', label: '实时监控', icon: <Activity size={20} />, path: '/monitoring' },
    { id: 'alerts', label: '预警管理', icon: <AlertTriangle size={20} />, path: '/alerts', badge: unreadAlertCount },
    { id: 'recommendations', label: '智能推荐', icon: <Brain size={20} />, path: '/recommendations' },
    { id: 'approvals', label: '审批流程', icon: <CheckSquare size={20} />, path: '/approvals' },
    { id: 'reports', label: '报告中心', icon: <FileBarChart size={20} />, path: '/reports' },
    { id: 'settings', label: '系统设置', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen glass border-r border-ocean-500/20 transition-all duration-300 z-50 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className={`p-4 border-b border-ocean-500/20 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center glow-effect">
                <Waves className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold text-white">海洋碳汇</h1>
                <p className="text-xs text-ocean-300">智能评估平台</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center glow-effect">
              <Waves className="text-white" size={24} />
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  onClick={() => setActiveTab(item.id)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-ocean-500/30 text-white shadow-lg shadow-ocean-500/20'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`
                  }
                >
                  <span className={`relative ${activeTab === item.id ? 'text-ocean-300' : ''}`}>
                    {item.icon}
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-coral-500 rounded-full text-[10px] flex items-center justify-center text-white font-medium animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="px-2 py-0.5 bg-coral-500/20 text-coral-300 rounded-full text-xs font-medium">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`p-4 border-t border-ocean-500/20 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          {!sidebarCollapsed && (
            <div className="glass-light rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={16} className="text-ocean-300" />
                <span className="text-xs font-medium text-white/80">系统状态</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">运行任务</span>
                  <span className="text-seaweed-400 font-mono">5</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">待处理预警</span>
                  <span className="text-coral-400 font-mono">{unreadAlertCount}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-ocean-400 to-seaweed-400 rounded-full"
                    style={{ width: '68%' }}
                  />
                </div>
                <p className="text-[10px] text-white/50 mt-1">系统负载 68%</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
