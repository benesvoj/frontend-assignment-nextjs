// API Response Types
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  status?: number;
}

// Loading State Types
export type LoadingState<T, E = string> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

// Helper type guards
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true;
}

export function isApiError<T>(response: ApiResponse<T>): response is ApiError {
  return response.success === false;
}

export function isLoading<T, E>(state: LoadingState<T, E>): state is { status: 'loading' } {
  return state.status === 'loading';
}

export function isSuccess<T, E>(state: LoadingState<T, E>): state is { status: 'success'; data: T } {
  return state.status === 'success';
}

export function isError<T, E>(state: LoadingState<T, E>): state is { status: 'error'; error: E } {
  return state.status === 'error';
}