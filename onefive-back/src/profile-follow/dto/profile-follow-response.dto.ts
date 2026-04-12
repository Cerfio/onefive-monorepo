/** Follower/following data in API responses */
export interface ProfileFollowResponseDto {
  id: string;
  [key: string]: unknown;
}

/** Response for list followers */
export type ListFollowersResponseDto = ProfileFollowResponseDto[];

/** Response for list following */
export type ListFollowingResponseDto = ProfileFollowResponseDto[];
