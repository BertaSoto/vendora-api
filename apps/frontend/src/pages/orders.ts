import { ordersApi } from '../api/orders'
import { productsApi } from '../api/products'
import { getStoreId } from '../store'
import type { Order, Product, CreateOrderItemDto } from '../types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export async function renderOrders(container: HTMLElement): Promise<void> {
  const storeId = getStoreId()

  const renderList = async () => {
    container.innerHTML = `
      <div class="page-header">
        <h2>Pedidos</h2>
        <button class="btn btn--primary" id="btn-add-order">+ Nuevo pedido</button>
      </div>
      <div class="loading">Cargando...</div>
    `

    document.getElementById('btn-add-order')?.addEventListener('click', () => renderForm())

    try {
      const orders = await ordersApi.list(storeId)
      renderTable(orders)
    } catch (err) {
      container.querySelector('.loading')!.outerHTML =
        `<div class="error">Error: ${(err as Error).message}</div>`
    }
  }

  const renderTable = (orders: Order[]) => {
    const tableHtml =
      orders.length === 0
        ? '<p class="empty">No hay pedidos aún.</p>'
        : `
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                ${orders
                  .map(
                    (o) => `
                  <tr>
                    <td class="text--mono">${o.id.slice(0, 8)}…</td>
                    <td>${o.customerName}</td>
                    <td>${o.items.length} ítem(s)</td>
                    <td>$${o.total.toLocaleString('es-CL')}</td>
                    <td><span class="badge badge--${o.status}">${STATUS_LABELS[o.status] ?? o.status}</span></td>
                    <td>${new Date(o.createdAt).toLocaleDateString('es-CL')}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `

    container.querySelector('.loading')!.outerHTML = tableHtml
  }

  const renderForm = async () => {
    container.innerHTML = `
      <div class="page-header">
        <h2>Nuevo pedido</h2>
      </div>
      <div class="loading">Cargando productos...</div>
    `

    let products: Product[] = []
    try {
      products = await productsApi.list(storeId)
    } catch {
      container.querySelector('.loading')!.outerHTML =
        '<div class="error">No se pudieron cargar los productos.</div>'
      return
    }

    const items: CreateOrderItemDto[] = []

    const rerenderItems = () => {
      const itemsContainer = document.getElementById('items-container')!
      itemsContainer.innerHTML =
        items.length === 0
          ? '<p class="empty">Sin ítems. Agrega al menos uno.</p>'
          : items
              .map(
                (item, i) => `
              <div class="order-item">
                <span>${item.productName} × ${item.quantity} — $${(item.unitPrice * item.quantity).toLocaleString('es-CL')}</span>
                <button class="btn btn--sm btn--danger" data-remove="${i}">✕</button>
              </div>
            `
              )
              .join('')

      itemsContainer.querySelectorAll('[data-remove]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const idx = Number((e.currentTarget as HTMLElement).dataset.remove)
          items.splice(idx, 1)
          rerenderItems()
        })
      })
    }

    container.innerHTML = `
      <div class="page-header">
        <h2>Nuevo pedido</h2>
      </div>
      <form class="form" id="order-form">
        <div class="form-group">
          <label>Nombre del cliente</label>
          <input class="input" type="text" name="customerName" required placeholder="Ej: Ana González" />
        </div>

        <fieldset class="fieldset">
          <legend>Agregar ítem</legend>
          <div class="form-row">
            <div class="form-group">
              <label>Producto</label>
              <select class="input" id="item-product">
                <option value="">-- Seleccionar --</option>
                ${products.map((p) => `<option value="${p.id}" data-name="${p.name}" data-price="${p.price}">${p.name} ($${p.price.toLocaleString('es-CL')})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Cantidad</label>
              <input class="input" type="number" id="item-qty" min="1" value="1" />
            </div>
            <div class="form-group form-group--end">
              <button type="button" class="btn btn--secondary" id="btn-add-item">Agregar ítem</button>
            </div>
          </div>
        </fieldset>

        <div id="items-container" class="items-list">
          <p class="empty">Sin ítems. Agrega al menos uno.</p>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn--secondary" id="btn-cancel">Cancelar</button>
          <button type="submit" class="btn btn--primary">Crear pedido</button>
        </div>
      </form>
    `

    document.getElementById('btn-cancel')?.addEventListener('click', () => renderList())

    document.getElementById('btn-add-item')?.addEventListener('click', () => {
      const select = document.getElementById('item-product') as HTMLSelectElement
      const qtyInput = document.getElementById('item-qty') as HTMLInputElement
      const option = select.selectedOptions[0]
      if (!option?.value) return alert('Selecciona un producto')
      const qty = Number(qtyInput.value)
      if (qty < 1) return alert('La cantidad debe ser mayor a 0')

      items.push({
        productId: option.value,
        productName: option.dataset.name!,
        quantity: qty,
        unitPrice: Number(option.dataset.price!),
      })
      rerenderItems()
    })

    document.getElementById('order-form')?.addEventListener('submit', async (e) => {
      e.preventDefault()
      if (items.length === 0) return alert('Agrega al menos un ítem')
      const form = e.target as HTMLFormElement
      const customerName = (form.elements.namedItem('customerName') as HTMLInputElement).value
      try {
        await ordersApi.create({ storeId, customerName, items })
        renderList()
      } catch (err) {
        alert(`Error: ${(err as Error).message}`)
      }
    })
  }

  renderList()
}
