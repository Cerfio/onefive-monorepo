import { useQuery } from '@tanstack/react-query';
import { PostType, getPost } from '../../post.api';

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async (): Promise<PostType> => {
      const response: any = await getPost(postId);
      return response.data; // L'API retourne { success: true, data: PostType }
    },
    enabled: !!postId && !postId.startsWith('temp-post-'),
    staleTime: 5 * 60 * 1000, // 5 minutes - keeps cached data fresh
    cacheTime: 10 * 60 * 1000, // 10 minutes - keeps in cache longer
  });
};
