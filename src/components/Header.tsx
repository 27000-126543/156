
import React, { useState } from 'react';
import {
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { alertLevelColors, alertLevelLabels, roleLabels } from '../utils/mockData';
import { AlertLevel } from '../../shared/types';

export const Header: React.FC = () => {
  const { user, logout, alerts, unreadAlertCount, sidebarCollapsed } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.reviewedAt).slice(0, 5);

  const getAlertIcon = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.CRITICAL:
        return <AlertTriangle size={16} className="text-coral-400" />;
      case AlertLevel.WARNING:
        return <Clock size={16} className="text-yellow-400" />;
      default:
        return <CheckCircle size={16} className="text-ocean-400" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 glass border-b border-ocean-500/20 z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              placeholder="搜索模拟任务、预警、数据..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-ocean-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <Bell size={20} />
              {unreadAlertCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-coral-500 rounded-full text-[10px] flex items-center justify-center text-white font-medium animate-pulse">
                  {unreadAlertCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 glass rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold text-white">预警通知</h3>
                  <p className="text-xs text-white/60">共 {unreadAlertCount} 条未处理预警</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {unreadAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.level)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`status-badge ${alertLevelColors[alert.level]} text-xs`}>
                              {alertLevelLabels[alert.level]}
                            </span>
                            <span className="text-xs text-white/50">{formatTime(alert.timestamp)}</span>
                          </div>
                          <p className="text-sm text-white/80 mt-1 truncate">{alert.message}</p>
                          <p className="text-xs text-white/50 mt-0.5">{alert.simulationName}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {unreadAlerts.length === 0 && (
                    <div className="p-8 text-center text-white/50">
                      <CheckCircle size={32} className="mx-auto mb-2 text-seaweed-400" />
                      <p>暂无未处理预警</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-white/10">
                  <button className="w-full py-2 text-sm text-ocean-400 hover:text-ocean-300 transition-colors">
                    查看全部预警
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-white/10 mx-2" />

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-white/60">{user ? roleLabels[user.role] : ''}</p>
              </div>
              <ChevronDown size={16} className="text-white/60" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 glass rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-white/10">
                  <p className="font-medium text-white">{user?.name}</p>
                  <p className="text-sm text-white/60">{user?.email}</p>
                  <p className="text-xs text-ocean-300 mt-1">{user ? roleLabels[user.role] : ''}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <LogOut size={18} />
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
