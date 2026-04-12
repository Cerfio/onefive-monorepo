import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronUp, ChevronDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import NumberFlow from '@number-flow/react';

const DiscussionAnalytics = ({ discussion }: { discussion: any }) => {
  const [analytics, _setAnalytics] = useState({
    engagement: 87,
    readingTime: 3.2,
    qualityScore: 92,
    viralPotential: 76,
    expertInterest: 89
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  return (
    <motion.div
      className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6 mb-6"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Analytics en temps réel</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAnalytics(!showAnalytics)}
        >
          {showAnalytics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <motion.div
            className="text-2xl font-bold text-blue-600"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <NumberFlow value={discussion.viewCount} />
          </motion.div>
          <p className="text-xs text-gray-500">Vues</p>
        </div>
        <div className="text-center">
          <motion.div
            className="text-2xl font-bold text-green-600"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            {analytics.engagement}%
          </motion.div>
          <p className="text-xs text-gray-500">Engagement</p>
        </div>
        <div className="text-center">
          <motion.div
            className="text-2xl font-bold text-purple-600"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            {analytics.qualityScore}
          </motion.div>
          <p className="text-xs text-gray-500">Score Qualité</p>
        </div>
      </div>
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Temps de lecture moyen</span>
              <span className="text-sm font-medium">{analytics.readingTime} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Potentiel viral</span>
              <div className="flex items-center gap-2">
                <Progress value={analytics.viralPotential} className="w-16 h-2" />
                <span className="text-sm font-medium">{analytics.viralPotential}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Intérêt des experts</span>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(analytics.expertInterest / 20)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{analytics.expertInterest}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DiscussionAnalytics; 