export type LoadingState<T, E = string> = 
    | { status: 'idle' }
    | { status: 'loading'}
    | { status: 'success'; data: T }
    | { status: 'error'; error: E }