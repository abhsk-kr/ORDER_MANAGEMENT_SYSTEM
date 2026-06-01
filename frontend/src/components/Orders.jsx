import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../api/client'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchOrders = () => {
    setLoading(true)
    api.get('/orders')
      .then(setOrders)
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(fetchOrders, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          + Create Order
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-400 text-lg">No orders yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Create Order" to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Order ID</th>
                  <th className="text-left px-6 py-3 font-medium">Customer</th>
                  <th className="text-right px-6 py-3 font-medium">Total</th>
                  <th className="text-center px-6 py-3 font-medium">Status</th>
                  <th className="text-left px-6 py-3 font-medium">Date</th>
                  <th className="text-center px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-800">#{o.id}</td>
                    <td className="px-6 py-3 text-gray-500">{o.customer_name}</td>
                    <td className="px-6 py-3 text-right text-gray-800">
                      ₹{o.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${
                          o.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : o.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => setShowDetailModal(o)}
                        className="text-indigo-600 hover:text-indigo-800 mr-3 text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setConfirmDelete(o.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            fetchOrders()
          }}
        />
      )}

      {showDetailModal && (
        <OrderDetailModal
          order={showDetailModal}
          onClose={() => setShowDetailModal(null)}
        />
      )}

      {confirmDelete && (
        <DeleteConfirmModal
          onConfirm={async () => {
            try {
              await api.delete(`/orders/${confirmDelete}`)
              toast.success('Order deleted')
              setConfirmDelete(null)
              fetchOrders()
            } catch (err) {
              toast.error(err.message)
            }
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}

function CreateOrderModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [items, setItems] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [itemQty, setItemQty] = useState('1')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/customers').then(setCustomers).catch(() => toast.error('Failed to load customers'))
    api.get('/products').then(setProducts).catch(() => toast.error('Failed to load products'))
  }, [])

  const addItem = () => {
    if (!selectedProductId) {
      toast.error('Select a product')
      return
    }
    const qty = parseInt(itemQty, 10)
    if (isNaN(qty) || qty < 1) {
      toast.error('Quantity must be at least 1')
      return
    }
    const product = products.find((p) => p.id === parseInt(selectedProductId))
    if (!product) return

    if (product.quantity < qty) {
      toast.error(`Only ${product.quantity} in stock for ${product.name}`)
      return
    }

    const existing = items.find((i) => i.product_id === product.id)
    if (existing) {
      const newQty = existing.quantity + qty
      if (product.quantity < newQty) {
        toast.error(`Only ${product.quantity} in stock for ${product.name}`)
        return
      }
      setItems(
        items.map((i) =>
          i.product_id === product.id ? { ...i, quantity: newQty } : i
        )
      )
    } else {
      setItems([
        ...items,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: qty,
          unit_price: product.price,
        },
      ])
    }
    setSelectedProductId('')
    setItemQty('1')
  }

  const removeItem = (productId) => {
    setItems(items.filter((i) => i.product_id !== productId))
  }

  const totalAmount = items.reduce(
    (sum, i) => sum + i.quantity * i.unit_price,
    0
  )

  const handleCreate = async () => {
    if (!selectedCustomerId) return
    setSubmitting(true)
    try {
      await api.post('/orders', {
        customer_id: parseInt(selectedCustomerId),
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      })
      toast.success('Order created')
      onCreated()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Create Order</h3>
          <div className="text-sm text-gray-400">
            Step {step} of 3
          </div>
        </div>

        <div className="flex gap-1 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= step ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Customer
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">-- Choose a customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex gap-2 mb-4">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
              >
                <option value="">-- Select product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price.toFixed(2)}) — Stock: {p.quantity}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={itemQty}
                onChange={(e) => setItemQty(e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
              />
              <button
                onClick={addItem}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No items added yet</p>
            ) : (
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center justify-between px-3 py-2 text-sm"
                  >
                    <span className="text-gray-800">
                      {item.product_name} x{item.quantity}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">
                        ₹{(item.quantity * item.unit_price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-red-500 hover:text-red-700 text-lg leading-none"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium text-gray-800">
                {customers.find((c) => c.id === parseInt(selectedCustomerId))?.full_name}
              </p>
            </div>

            <div className="border rounded-lg divide-y mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between px-4 py-2 text-sm"
                >
                  <span className="text-gray-800">
                    {item.product_name} x{item.quantity}
                  </span>
                  <span className="text-gray-500">
                    ₹{(item.quantity * item.unit_price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center px-4 py-3 bg-indigo-50 rounded-lg">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="text-xl font-bold text-indigo-700">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && !selectedCustomerId) {
                  toast.error('Please select a customer')
                  return
                }
                if (step === 2 && items.length === 0) {
                  toast.error('Please add at least one product')
                  return
                }
                setStep(step + 1)
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              {submitting ? 'Creating...' : 'Confirm & Create'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function OrderDetailModal({ order, onClose }) {
  const [detail, setDetail] = useState(order)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${order.id}`)
      .then(setDetail)
      .catch(() => toast.error('Failed to load order details'))
      .finally(() => setLoading(false))
  }, [order.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Order #{order.id}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium text-gray-800">{detail.customer_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${
                    detail.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : detail.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {detail.status}
                </span>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium text-gray-800">
                  {new Date(detail.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Total</p>
                <p className="font-bold text-gray-800">₹{detail.total_amount.toFixed(2)}</p>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-gray-700 mb-2">Items</h4>
            <div className="border rounded-lg divide-y">
              {detail.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-2 text-sm"
                >
                  <span className="text-gray-800">
                    {item.product_name} x{item.quantity}
                  </span>
                  <span className="text-gray-500">
                    ₹{(item.quantity * item.unit_price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Cancel Order</h3>
        <p className="text-gray-600 text-sm">
          This will cancel the order and restore all product stock. Continue?
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
