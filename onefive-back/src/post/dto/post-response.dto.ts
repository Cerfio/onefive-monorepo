import { PaginatedResponseDto } from '../../common/dto';

/** Post data in API responses - extensible for varying shapes */
export interface PostResponseDto {
  id: string;
  [key: string]: unknown;
}

/** Response for create post (minimal - frontend enriches) */
export interface CreatePostResponseDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/** Response for get single post */
export type GetPostResponseDto = PostResponseDto;

/** Response for update post */
export type UpdatePostResponseDto = PostResponseDto;

/** Response for list posts (array - no pagination metadata from handler) */
export type ListPostsResponseDto = PostResponseDto[];

/** Response for feed - uses PaginatedResponseDto */
export type FeedPostsResponseDto = PaginatedResponseDto<PostResponseDto>;

/** Response for delete post */
export interface DeletePostResponseDto {
  message: string;
}

/** Response for repost (minimal) */
export interface CreateRepostResponseDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}
