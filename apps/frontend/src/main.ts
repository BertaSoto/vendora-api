import './styles/main.css'
import { renderDashboard } from './pages/dashboard'
import { renderProducts } from './pages/products'
import { renderOrders } from './pages/orders'
import { getStoreId, setStoreId } from './store'

type Page = 'dashboard' | 'products' | 'orders'

const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'products', label: 'Productos' },
  { id: 'orders', label: 'Pedidos' },
]

const RENDERERS: Record<Page, (el: HTMLElement) => Promise<void>> = {
  dashboard: renderDashboard,
  products: renderProducts,
  orders: renderOrders,
}

function buildUI(app: HTMLElement): { main: HTMLElement } {
  app.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-brand">Vendora Admin</div>
        ${NAV_ITEMS.map((n) => `<button class="nav-item" data-page="${n.id}">${n.label}</button>`).join('')}
        <div class="store-bar" style="margin-top:auto;flex-direction:column;align-items:flex-start">
          <label>Store ID</label>
          <div style="display:flex;gap:6px;width:100%">
            <input id="store-id-input" value="${getStoreId()}" style="flex:1" />
            <button id="store-id-save">OK</button>
          </div>
        </div>
      </aside>
      <div style="display:flex;flex-direction:column;flex:1;overflow:hidden">
        <main class="main" id="main-content"></main>
      </div>
    </div>
  `

  document.getElementById('store-id-save')?.addEventListener('click', () => {
    const val = (document.getElementById('store-id-input') as HTMLInputElement).value.trim()
    if (val) { setStoreId(val); navigate(currentPage) }
  })

  return { main: document.getElementById('main-content')! }
}

let currentPage: Page = 'dashboard'

async function navigate(page: Page) {
  currentPage = page
  document.querySelectorAll('.nav-item').forEach((el) => {
    el.classList.toggle('active', (el as HTMLElement).dataset.page === page)
  })
  const main = document.getElementById('main-content')!
  await RENDERERS[page](main)
}

function init() {
  const app = document.getElementById('app')!
  buildUI(app)

  document.querySelectorAll('.nav-item').forEach((el) => {
    el.addEventListener('click', () => navigate((el as HTMLElement).dataset.page as Page))
  })

  navigate('dashboard')
}

init()
