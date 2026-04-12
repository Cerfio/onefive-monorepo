import { motion } from 'framer-motion';
import { Lightbulb, Target, Crown, Zap, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SmartRecommendations = ({ discussion: _discussion }: { discussion: any }) => {
  const recommendations = [
    {
      type: 'similar',
      title: 'Discussion similaire avec 95% de pertinence',
      subtitle: 'Stratégies de croissance B2B pour startups',
      engagement: '234 réponses • 1.2k vues',
      confidence: 95
    },
    {
      type: 'expert',
      title: 'Expert recommandé pour cette discussion',
      subtitle: 'Marie Dubois - Senior Product Manager chez Stripe',
      engagement: '2.5k followers • 89% taux de réponse',
      confidence: 87
    },
    {
      type: 'trending',
      title: 'Sujet tendance connexe',
      subtitle: 'IA et automatisation des processus métier',
      engagement: '🔥 +340% d\'engagement cette semaine',
      confidence: 78
    }
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-orange-500" />
        <h3 className="font-semibold text-gray-900">Recommandations IA</h3>
        <Badge variant="secondary" className="text-xs">BETA</Badge>
      </div>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
            className="border border-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {rec.type === 'similar' && <Target className="h-4 w-4 text-blue-500" />}
                  {rec.type === 'expert' && <Crown className="h-4 w-4 text-purple-500" />}
                  {rec.type === 'trending' && <Zap className="h-4 w-4 text-orange-500" />}
                  <span className="text-sm font-medium text-gray-900">{rec.title}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.subtitle}</p>
                <p className="text-xs text-gray-500">{rec.engagement}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    rec.confidence > 90 ? 'bg-green-500' :
                    rec.confidence > 80 ? 'bg-yellow-500' : 'bg-orange-500'
                  }`} />
                  <span className="text-xs text-gray-500">{rec.confidence}%</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SmartRecommendations; 