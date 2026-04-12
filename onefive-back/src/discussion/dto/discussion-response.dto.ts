import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

/** Discussion data in API responses - extensible for varying shapes */
export interface DiscussionResponseDto {
  id: string;
  [key: string]: unknown;
}

/** Response for create discussion */
export interface CreateDiscussionResponseDto {
  id: string;
}

/** Response for list discussions */
export type ListDiscussionsResponseDto =
  PaginatedResponseDto<DiscussionResponseDto>;

/** Response for get single discussion */
export type GetDiscussionResponseDto = DiscussionResponseDto;

/** Response for update discussion */
export type UpdateDiscussionResponseDto = DiscussionResponseDto;
