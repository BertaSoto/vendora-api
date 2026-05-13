import { productsApi } from '../api/products'
import { getStoreId } from '../store'
import type { Product } from '../types'

export async function renderProducts(container: HTMLElement): Promise<void> {
  const storeId = getStoreId()

  const renderList = async () => {
    container.innerHTML = `
      <div class="page-header">
        <h2>Productos</h2>
        <button class="btn btn--primary" id="btn-add-product">+ Nuevo producto</button>
      </div>
      <div class="loading">Cargando...</div>
    `

    document.getElementById('btn-add-product')?.addEventListener('click', () => {
      renderForm()
    })

    try {
      const products = await productsApi.list(storeId)
      renderTable(products)
    } catch (err) {
      container.querySelector('.loading')!.outerHTML =
        `<div class="error">Error: ${(err as Error).message}</div>`
    }
  }

  const renderTable = (products: Product[]) => {
    const tableHtml =
      products.length === 0
        ? '<p class="empty">No hay productos. Crea el primero.</p>'
        : `
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${products
                  .map(
                    (p) => `
                  <tr>
                    <td>${p.name}</td>
                    <td>${p.description}</td>
                    <td>$${p.price.toLocaleString('es-CL')}</td>
                    <td class="${p.stock <= 3 ? 'text--warning' : ''}">${p.stock}</td>
                    <td class="actions">
                      <button class="btn btn--sm btn--secondary" data-action="edit-stock" data-id="${p.id}" data-stock="${p.stock}">
                        Editar stock
                      </button>
                      <button class="btn btn--sm btn--danger" data-action="delete" data-id="${p.id}">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `

    container.querySelector('.loading')!.outerHTML = tableHtml

    container.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!
        if (!confirm('¿Eliminar este producto?')) return
        try {
          await productsApi.delete(id)
          renderList()
        } catch (err) {
          alert(`Error: ${(err as Error).message}`)
        }
      })
    })

    container.querySelectorAll('[data-action="edit-stock"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const el = e.currentTarget as HTMLElement
        renderStockForm(el.dataset.id!, Number(el.dataset.stock))
      })
    })
  }

  const renderStockForm = (productId: string, currentStock: number) => {
    container.innerHTML = `
      <div class="page-header">
        <h2>Editar stock</h2>
      </div>
      <form class="form" id="stock-form">
        <div class="form-group">
          <label>Stock actual: ${currentStock}</label>
          <input class="input" type="number" name="stock" min="0" value="${currentStock}" required />
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn--secondary" id="btn-cancel">Cancelar</button>
          <button type="submit" class="btn btn--primary">Guardar</button>
        </div>
      </form>
    `

    document.getElementById('btn-cancel')?.addEventListener('click', () => renderList())

    document.getElementById('stock-form')?.addEventListener('submit', async (e) => {
      e.preventDefault()
      const form = e.target as HTMLFormElement
      const stock = Number((form.elements.namedItem('stock') as HTMLInputElement).value)
      try {
        await productsApi.updateStock(productId, { stock })
        renderList()
      } catch (err) {
        alert(`Error: ${(err as Error).message}`)
      }
    })
  }

  const renderForm = () => {
    container.innerHTML = `
      <div class="page-header">
        <h2>Nuevo producto</h2>
      </div>
      <form class="form" id="product-form">
        <div class="form-group">
          <label>Nombre</label>
          <input class="input" type="text" name="name" required placeholder="Ej: Collar de plata" />
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea class="input" name="description" required placeholder="Descripción del producto"></textarea>
        </div>
        <div class="form-group">
          <label>Precio (CLP)</label>
          <input class="input" type="number" name="price" min="0" step="1" required placeholder="15000" />
        </div>
        <div class="form-group">
          <label>Stock inicial</label>
          <input class="input" type="number" name="stock" min="0" required placeholder="10" />
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn--secondary" id="btn-cancel">Cancelar</button>
          <button type="submit" class="btn btn--primary">Crear producto</button>
        </div>
      </form>
    `

    document.getElementById('btn-cancel')?.addEventListener('click', () => renderList())

    document.getElementById('product-form')?.addEventListener('submit', async (e) => {
      e.preventDefault()
      const form = e.target as HTMLFormElement
      const get = (n: string) => (form.elements.namedItem(n) as HTMLInputElement).value
      try {
        await productsApi.create({
          storeId,
          name: get('name'),
          description: get('description'),
          price: Number(get('price')),
          stock: Number(get('stock')),
        })
        renderList()
      } catch (err) {
        alert(`Error: ${(err as Error).message}`)
      }
    })
  }

  renderList()
}
