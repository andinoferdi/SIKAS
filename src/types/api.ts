export interface ApiErrorResponse {
  error: string
}

export interface ApiSuccessResponse<T = unknown> {
  success: boolean
  data?: T
}
