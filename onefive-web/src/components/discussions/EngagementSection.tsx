import { motion } from 'framer-motion';
import { cardVariants } from './animations';
import { Sparkles, Bell, Bookmark } from 'lucide-react';

const EngagementSection = () => {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-medium text-gray-700">💡 Suggestions pour enrichir la discussion</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="flex items-center gap-2 p-2 rounded-md hover:bg-white transition-all text-sm text-blue-600">
          <Bell className="h-3 w-3" />
          <span>Suivre cette discussion</span>
        </button>
        <button className="flex items-center gap-2 p-2 rounded-md hover:bg-white transition-all text-sm text-green-600">
          <Bookmark className="h-3 w-3" />
          <span>Sauvegarder</span>
        </button>
      </div>
    </motion.div>
  );
};

export default EngagementSection; 