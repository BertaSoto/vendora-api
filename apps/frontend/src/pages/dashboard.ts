import { dashboardApi } from '../api/dashboard'
import { getStoreId } from '../store'

export async function renderDashboard(container: HTMLElement): Promise<void> {
  const storeId = getStoreId()
  container.innerHTML = `
    <div class="page-header">
      <h2>Dashboard</h2>
    </div>
    <div class="loading">Cargando...</div>
  `

  try {
    const data = await dashboardApi.get(storeId)
    container.innerHTML = `
      <div class="page-header">
        <h2>Dashboard</h2>
        <span class="badge badge--${data.store.status}">${data.store.status}</span>
      </div>
      <p class="store-name">${data.store.name}</p>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Productos</span>
          <span class="stat-value">${data.summary.productsCount}</span>
        </div>
        <div class="stat-card stat-card--warning">
          <span class="stat-label">Stock bajo</span>
          <span class="stat-value">${data.summary.lowStockProducts}</span>
        </div>
        <div class="stat-card stat-card--accent">
          <span class="stat-label">Pedidos pendientes</span>
          <span class="stat-value">${data.summary.pendingOrders}</span>
        </div>
      </div>
    `
  } catch (err) {
    container.innerHTML += `<div class="error">Error: ${(err as Error).message}</div>`
  }
}
