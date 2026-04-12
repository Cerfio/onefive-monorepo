import { useState } from 'react';
import { Pin, X, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';

interface PinnedMessage {
  id: string;
  message: string;
  author: string;
  timestamp: number;
  avatar: string;
}

interface PinnedMessagesProps {
  pinnedMessages: PinnedMessage[];
  onUnpin: (messageId: string) => void;
}

const PinnedMessages = ({ pinnedMessages, onUnpin }: PinnedMessagesProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (pinnedMessages.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto hover:bg-yellow-100"
          >
            <div className="flex items-center gap-2">
              <Pin className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Messages épinglés
              </span>
              <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                {pinnedMessages.length}
              </Badge>
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2"
            >
              {pinnedMessages.map((pinnedMessage) => (
                <motion.div
                  key={pinnedMessage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {pinnedMessage.author}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUnpin(pinnedMessage.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {pinnedMessage.message}
                    </p>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {new Date(pinnedMessage.timestamp * 1000).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </CollapsibleContent>
      </motion.div>
    </Collapsible>
  );
};

export default PinnedMessages; 