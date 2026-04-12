'use client';
import { Tags } from '@/enums';
import { useFeedFilter } from '@/contexts/FeedFilterContext';
import Post from './Post';

interface PostWithFilterProps {
  postId: string;
  className?: string;
  showComments?: boolean;
  compact?: boolean;
}

const PostWithFilter: React.FC<PostWithFilterProps> = (props) => {
  const { addTag } = useFeedFilter();

  const handleTagClick = (tag: Tags) => {
    addTag(tag);
    // Scroll vers le haut pour voir les filtres
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return <Post {...props} onTagClick={handleTagClick} />;
};

export default PostWithFilter;
