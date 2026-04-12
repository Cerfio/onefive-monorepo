import React from 'react';
import { motion } from 'framer-motion';
import ActivityCard from './ActivityCard';
import { containerVariants } from '../lib/animations';
import type { ActivityEvent } from '../types';

interface ActivityFeedProps {
  activities: ActivityEvent[];
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {activities.map(event => <ActivityCard key={event.id} event={event} />)}
    </motion.div>
);

export default ActivityFeed; 