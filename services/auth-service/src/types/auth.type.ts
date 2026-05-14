export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export interface AuthUser {
  id: string
  email: string
  fullName: string | null
  createdAt: string
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: AuthUser
}

export interface ApiSuccessResponse<T = unknown> {
  success: true
  message: string
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: string
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

export interface HealthData {
  status: 'ok'
  service: string
}

export interface RegisterData {
  user: {
    id: string
    email: string
    fullName: string
    createdAt: string
  }
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface LoginData {
  user: {
    id: string
    email: string
    fullName: string | null
  }
  accessToken: string
  refreshToken: string
  expiresAt: number
}
