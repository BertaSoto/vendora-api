import { apiFetch } from './client'

export interface RegisterDto {
  email: string
  password: string
  fullName: string
}

export interface RegisterResponse {
  message: string
}

export const authApi = {
  register: (dto: RegisterDto) =>
    apiFetch<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
}
