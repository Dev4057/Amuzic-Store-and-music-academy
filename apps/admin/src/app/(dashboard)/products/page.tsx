'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@amuzic/shared'
import { formatCurrency } from '@amuzic/shared'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

const CATEGORIES = ['keyboard', 'guitar', 'drums', 'vocals', 'accessories', 'other'] as const
type Category = typeof CATEGORIES[number]

interface AddForm {
  name: string
  slug: string
  description: string
  category: Category | ''
  price: string
  stock_quantity: string
}

interface EditState {
  price: string
  stock_quantity: string
  is_available: boolean
}

const DEFAULT_FORM: AddForm = {
  name: '',
  slug: '',
  description: '',
  category: '',
  price: '',
  stock_quantity: '',
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export default function ProductsPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<AddForm>(DEFAULT_FORM)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addSuccess, setAddSuccess] = useState(false)

  const [editId, setEditId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const fetchProducts = useCallback(async (tok: string) => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch(`${API}/api/products/all`, { headers: { Authorization: `Bearer ${tok}` } })
      if (res.status === 401) { router.push('/login'); return }
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json() as { products: Product[] }
      setProducts(data.products)
    } catch {
      setFetchError('Could not load products. Is the API running?')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const stored = localStorage.getItem('admin_token')
    if (!stored) { router.push('/login'); return }
    setToken(stored)
    void fetchProducts(stored)
  }, [router, fetchProducts])

  function handleNameChange(name: string) {
    setAddForm((f) => ({ ...f, name, slug: slugify(name) }))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    if (!addForm.category) { setAddError('Please select a category.'); return }
    setAddLoading(true)
    setAddError(null)
    setAddSuccess(false)
    try {
      const body = {
        name: addForm.name,
        slug: addForm.slug,
        description: addForm.description || undefined,
        category: addForm.category,
        price: Number(addForm.price),
        stock_quantity: Number(addForm.stock_quantity),
      }
      const res = await fetch(`${API}/api/products`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(body),
      })
      const data = await res.json() as { data?: Product; error?: string; message?: string }
      if (!res.ok) {
        setAddError(data.error ?? data.message ?? 'Failed to add product.')
        return
      }
      setAddSuccess(true)
      setAddForm(DEFAULT_FORM)
      setShowAdd(false)
      await fetchProducts(token)
    } catch {
      setAddError('Network error. Is the API running?')
    } finally {
      setAddLoading(false)
    }
  }

  function startEdit(product: Product) {
    setEditId(product.id)
    setEditState({
      price: String(product.price),
      stock_quantity: String(product.stock_quantity),
      is_available: product.is_available,
    })
    setEditError(null)
  }

  async function saveEdit(productId: string) {
    if (!token || !editState) return
    setEditLoading(true)
    setEditError(null)
    try {
      const qty = Number(editState.stock_quantity)
      const body = {
        price: Number(editState.price),
        stock_quantity: qty,
        is_available: qty > 0 ? editState.is_available : false,
      }
      const res = await fetch(`${API}/api/products/${productId}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setEditError(data.error ?? 'Update failed.')
        return
      }
      setEditId(null)
      setEditState(null)
      await fetchProducts(token)
    } catch {
      setEditError('Network error.')
    } finally {
      setEditLoading(false)
    }
  }

  function cancelEdit() {
    setEditId(null)
    setEditState(null)
    setEditError(null)
  }

  const available = products.filter((p) => p.is_available).length
  const outOfStock = products.filter((p) => p.stock_quantity === 0).length

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Products</h1>
          <p className="page-subtitle">Manage instrument and accessory listings. Stock 0 → auto-hidden from the store.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowAdd((v) => !v); setAddError(null); setAddSuccess(false) }}>
          {showAdd ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{products.length}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--burgundy)' }}>{available}</div>
          <div className="stat-label">Live in Store</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#DC2626' }}>{outOfStock}</div>
          <div className="stat-label">Out of Stock</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{products.length - available}</div>
          <div className="stat-label">Hidden / Disabled</div>
        </div>
      </div>

      {/* Add product form */}
      {showAdd && (
        <form onSubmit={(e) => { void handleAdd(e) }} className="form-section">
          <div className="form-section-title">Add New Product</div>
          {addError && <div className="alert alert-error">{addError}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Yamaha P-45 Digital Piano"
                required
              />
            </div>
            <div className="form-group">
              <label>Slug (URL) *</label>
              <input
                type="text"
                value={addForm.slug}
                onChange={(e) => setAddForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="yamaha-p45-digital-piano"
                required
              />
            </div>
            <div className="form-group full">
              <label>Description</label>
              <textarea
                value={addForm.description}
                onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of the product…"
                rows={2}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={addForm.category}
                onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value as Category }))}
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                value={addForm.price}
                onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="15000"
                min={1}
                required
              />
            </div>
            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                value={addForm.stock_quantity}
                onChange={(e) => setAddForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                placeholder="5"
                min={0}
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={addLoading}>
              {addLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Adding…</> : 'Add Product'}
            </button>
          </div>
        </form>
      )}

      {addSuccess && <div className="alert alert-success">Product added successfully and is now live in the store.</div>}

      {/* Products table */}
      <div className="card">
        {loading ? (
          <div className="loading-center">
            <span className="spinner" /> Loading products…
          </div>
        ) : fetchError ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠</div>
            <div className="empty-state-title">Could not load products</div>
            <p className="empty-state-body">{fetchError}</p>
            <button className="btn btn-primary" onClick={() => token && void fetchProducts(token)}>
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: 18 }}>◈</div>
            <div className="empty-state-title">No products yet</div>
            <p className="empty-state-body">Add your first product using the button above.</p>
          </div>
        ) : (
          <>
            {editError && <div className="alert alert-error" style={{ margin: '16px 16px 0' }}>{editError}</div>}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const isEditing = editId === product.id
                    return (
                      <tr key={product.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>{product.name}</div>
                          {product.description && (
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                              {product.description.slice(0, 60)}{product.description.length > 60 ? '…' : ''}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                            {product.category ?? '—'}
                          </span>
                        </td>
                        <td>
                          {isEditing && editState ? (
                            <input
                              type="number"
                              className="edit-input"
                              value={editState.price}
                              onChange={(e) => setEditState((s) => s ? { ...s, price: e.target.value } : s)}
                              min={1}
                            />
                          ) : (
                            <span style={{ fontWeight: 600 }}>{formatCurrency(product.price)}</span>
                          )}
                        </td>
                        <td>
                          {isEditing && editState ? (
                            <input
                              type="number"
                              className="edit-input"
                              value={editState.stock_quantity}
                              onChange={(e) => setEditState((s) => s ? { ...s, stock_quantity: e.target.value } : s)}
                              min={0}
                            />
                          ) : (
                            <span style={{ fontWeight: product.stock_quantity === 0 ? 600 : 400, color: product.stock_quantity === 0 ? '#DC2626' : 'inherit' }}>
                              {product.stock_quantity}
                            </span>
                          )}
                        </td>
                        <td>
                          {isEditing && editState ? (
                            <label className="toggle">
                              <input
                                type="checkbox"
                                checked={editState.is_available && Number(editState.stock_quantity) > 0}
                                disabled={Number(editState.stock_quantity) <= 0}
                                onChange={(e) => setEditState((s) => s ? { ...s, is_available: e.target.checked } : s)}
                              />
                              <span className="toggle-track" />
                              <span className="toggle-thumb" />
                              {editState.is_available && Number(editState.stock_quantity) > 0 ? 'Visible' : 'Hidden'}
                            </label>
                          ) : product.stock_quantity === 0 ? (
                            <span className="badge badge-red">Out of Stock</span>
                          ) : product.is_available ? (
                            <span className="badge badge-green">Live</span>
                          ) : (
                            <span className="badge badge-gray">Hidden</span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                className="btn btn-success btn-sm"
                                disabled={editLoading}
                                onClick={() => void saveEdit(product.id)}
                              >
                                {editLoading ? '…' : 'Save'}
                              </button>
                              <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Cancel</button>
                            </div>
                          ) : (
                            <button className="btn btn-ghost btn-sm" onClick={() => startEdit(product)}>
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  )
}
