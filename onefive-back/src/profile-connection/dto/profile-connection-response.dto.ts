/** Connection data in API responses */
export interface ConnectionResponseDto {
  id: string;
  [key: string]: unknown;
}

/** Response for list connections */
export type ListConnectionsResponseDto = ConnectionResponseDto[];

/** Response for list pending */
export type ListPendingResponseDto = ConnectionResponseDto[];
