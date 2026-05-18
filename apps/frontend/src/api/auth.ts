import { apiFetch } from './client'

interface RegisterDto {
  email: string
  password: string
  fullName: string
}

interface RegisterResponse {
  success: boolean
  data?: {
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
  error?: string
}

export const authApi = {
  register: (dto: RegisterDto) =>
    apiFetch<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
}
