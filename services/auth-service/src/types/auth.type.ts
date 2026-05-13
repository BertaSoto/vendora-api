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
