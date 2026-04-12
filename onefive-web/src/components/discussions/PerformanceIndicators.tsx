import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Heart } from 'lucide-react';

const PerformanceIndicators = () => {
  const [metrics, setMetrics] = useState({
    activeUsers: 47,
    responseTime: 0.8,
    engagementRate: 94,
    satisfactionScore: 4.8
  });
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        responseTime: Math.max(0.1, prev.responseTime + (Math.random() - 0.5) * 0.1),
        engagementRate: Math.min(100, Math.max(0, prev.engagementRate + Math.floor(Math.random() * 3) - 1)),
        satisfactionScore: Math.max(1, Math.min(5, prev.satisfactionScore + (Math.random() - 0.5) * 0.1))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="fixed bottom-4 left-4 z-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 text-white rounded-lg p-3 shadow-lg"
      >
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>{metrics.activeUsers} actifs</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-400" />
            <span>{metrics.responseTime.toFixed(1)}s</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-blue-400" />
            <span>{metrics.engagementRate}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-red-400" />
            <span>{metrics.satisfactionScore.toFixed(1)}/5</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceIndicators; 