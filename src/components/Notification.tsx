
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useStore } from '../store/useStore';

const icons = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info
};

const colors = {
  success: 'bg-seaweed-500/20 border-seaweed-500/50 text-seaweed-300',
  error: 'bg-coral-500/20 border-coral-500/50 text-coral-300',
  info: 'bg-ocean-500/20 border-ocean-500/50 text-ocean-300'
};

export const Notification: React.FC = () => {
  const { notification, setNotification } = useStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!notification && !isVisible) return null;

  const Icon = icons[notification?.type || 'info'];

  return (
    <div
      className={`fixed top-20 right-6 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg shadow-2xl min-w-[320px] ${
          colors[notification?.type || 'info']
        }`}
      >
        <Icon size={20} className="flex-shrink-0" />
        <p className="flex-1 text-sm font-medium">{notification?.message}</p>
        <button
          onClick={() => setNotification(null)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
