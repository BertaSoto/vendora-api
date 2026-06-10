import { supabase } from '../lib/supabase.js'
import { AppError } from '../types/auth.type.js'
import type { RegisterData, LoginData } from '../types/auth.type.js'
import type { RegisterDto, LoginDto } from '../dtos/auth.dto.js'

export class AuthService {
  async register(dto: RegisterDto): Promise<RegisterData> {
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
        throw new AppError('El usuario ya existe', 409)
      }
      throw new AppError('Error al conectar con Supabase', 502)
    }

    if (!data.user) {
      throw new AppError('Error interno del servidor', 500)
    }

    await this.syncUserToPublicTable(data.user.id, dto.email)

    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? dto.email,
        fullName: dto.fullName,
        createdAt: data.user.created_at,
      },
      accessToken: data.session?.access_token ?? '',
      refreshToken: data.session?.refresh_token ?? '',
      expiresAt: data.session?.expires_at ?? 0,
    }
  }

  async login(dto: LoginDto): Promise<LoginData> {
    this.validateLoginDto(dto)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    })

    if (error) {
      if (error.status === 400) {
        throw new AppError('Credenciales inválidas', 401)
      }
      throw new AppError('Error al conectar con Supabase', 502)
    }

    if (!data.user || !data.session) {
      throw new AppError('Error interno del servidor', 500)
    }

    await this.syncUserToPublicTable(data.user.id, data.user.email ?? dto.email)

    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? dto.email,
        fullName: data.user.user_metadata?.full_name ?? null,
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at ?? 0,
    }
  }

  private async syncUserToPublicTable(userId: string, email: string): Promise<void> {
    try {
      await supabase.from('User').upsert({
        id: userId,
        email,
        updatedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error('[AUTH SERVICE] syncUserToPublicTable error:', err)
    }
  }

  private validateRegisterDto(dto: RegisterDto): void {
    if (!dto.email || !dto.email.includes('@')) {
      throw new AppError('Correo electrónico inválido', 400)
    }
    if (!dto.password || dto.password.length < 6) {
      throw new AppError('La contraseña debe tener al menos 6 caracteres', 400)
    }
    if (!dto.fullName || dto.fullName.trim().length < 2) {
      throw new AppError('El nombre es obligatorio', 400)
    }
  }

  private validateLoginDto(dto: LoginDto): void {
    if (!dto.email || !dto.email.includes('@')) {
      throw new AppError('Correo electrónico inválido', 400)
    }
    if (!dto.password || dto.password.length < 6) {
      throw new AppError('Credenciales inválidas', 400)
    }
  }
}

export const authService = new AuthService()
