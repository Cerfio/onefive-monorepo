/** Response for list spotlight */
export type ListSpotlightResponseDto = unknown;

/** Response for create/update spot (admin) - includes optional message */
export interface AdminSpotResponseDto {
  success: true;
  message?: string;
  data: SpotResponseDto;
}

/** Data for create/update spot (admin) */
export interface SpotResponseDto {
  id: string;
  spot: string;
  name: string;
}
