/** Startup/entity data in API responses - extensible */
export interface StartupResponseDto {
  id?: string;
  [key: string]: unknown;
}

/** Response for create startup */
export type CreateStartupResponseDto = StartupResponseDto;

/** Response for list user startups */
export type ListUserStartupsResponseDto = StartupResponseDto[];

/** Response for list profile startups */
export type ListProfileStartupsResponseDto = StartupResponseDto[];

/** Response for search profiles (returns profile data) */
export type SearchProfilesResultResponseDto = unknown[];
