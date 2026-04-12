import { PostType } from '../post.api';

export type OptimisticPostType = PostType & {
	isPending?: boolean;
	tempId?: string;
};
