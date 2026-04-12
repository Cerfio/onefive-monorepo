/**
 * Generic API response type for consistent controller return typing.
 * Use with ResponseDto interfaces: ApiResponseDto<PostResponseDto>
 */
export type ApiResponseDto<T> = {
  success: true;
  data: T;
};

/**
 * API success response without data (e.g. delete, void operations)
 */
export type ApiSuccessResponseDto = {
  success: true;
};
