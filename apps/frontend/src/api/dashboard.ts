import { apiFetch } from './client'
import type { DashboardResponse } from '../types'

export const dashboardApi = {
  get: (storeId: string) =>
    apiFetch<DashboardResponse>(`/api/dashboard/${storeId}`),
}
