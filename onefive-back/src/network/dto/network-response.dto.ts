/** Network activity/people/startup data in API responses */
export interface NetworkItemResponseDto {
  id: string;
  [key: string]: unknown;
}

/** Response for list activity */
export type ListActivityResponseDto = NetworkItemResponseDto[];

/** Response for list people */
export type ListPeopleResponseDto = NetworkItemResponseDto[];

/** Response for list startups */
export type ListStartupsResponseDto = NetworkItemResponseDto[];
