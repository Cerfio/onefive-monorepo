/** Profile data in API responses - extensible for nested structures */
export interface ProfileResponseDto {
  id?: string;
  [key: string]: unknown;
}

/** Response for search profiles */
export type SearchProfilesResponseDto = ProfileResponseDto[];
