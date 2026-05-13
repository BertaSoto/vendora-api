import { supabase } from '../lib/supabase.js'
import type { AuthSession } from '../types/auth.type.js'
import type { RegisterDto, LoginDto } from '../dtos/auth.dto.js'

export class AuthService {
  async register(dto: RegisterDto): Promise<AuthSession> {
    this.validateRegisterDto(dto)

    const { data, error } = await supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          full_name: dto.fullName,
        },
      },
    })

    if (error) {
      if (error.status === 422) {
        throw new Error('A user with this email already exists.')
      }
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Registration failed. Please try again.')
    }

    return {
      accessToken: data.session?.access_token ?? '',
      refreshToken: data.session?.refresh_token ?? '',
      expiresAt: data.session?.expires_at ?? 0,
      user: {
        id: data.user.id,
        email: data.user.email ?? dto.email,
        fullName: dto.fullName,
        createdAt: data.user.created_at,
      },
    }
  }

  async login(dto: LoginDto): Promise<AuthSession> {
    this.validateLoginDto(dto)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    })

    if (error) {
      if (error.status === 400) {
        throw new Error('Invalid email or password.')
      }
      throw new Error(error.message)
    }

    if (!data.user || !data.session) {
      throw new Error('Login failed. Please try again.')
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at ?? 0,
      user: {
        id: data.user.id,
        email: data.user.email ?? dto.email,
        fullName: data.user.user_metadata?.full_name ?? null,
        createdAt: data.user.created_at,
      },
    }
  }

  private validateRegisterDto(dto: RegisterDto): void {
    if (!dto.email || !dto.email.includes('@')) {
      throw new Error('A valid email is required.')
    }
    if (!dto.password || dto.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.')
    }
    if (!dto.fullName || dto.fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters long.')
    }
  }

  private validateLoginDto(dto: LoginDto): void {
    if (!dto.email) {
      throw new Error('Email is required.')
    }
    if (!dto.password) {
      throw new Error('Password is required.')
    }
  }
}

export const authService = new AuthService()
