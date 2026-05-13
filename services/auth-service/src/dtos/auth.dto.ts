export interface RegisterDto {
  email: string
  password: string
  fullName: string
}

export interface LoginDto {
  email: string
  password: string
}

export type { AuthSession as AuthResponseDto } from '../types/auth.type.js'
