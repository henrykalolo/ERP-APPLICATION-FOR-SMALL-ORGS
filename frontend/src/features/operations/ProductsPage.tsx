import { useEffect, useState } from 'react'
import { operationsApi, Product } from '../../api'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [lowStock, setLowStock] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [productsData, lowStockData] = await Promise.all([
        operationsApi.products.list(),
        operationsApi.products.lowStock(),
      ])
      setProducts(productsData)
      setLowStock(lowStockData)
    } catch (err) {
      setError('Unable to load products')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Product catalog and inventory thresholds" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card title="Products"><div className="text-3xl font-semibold text-gray-900">{products.length}</div></Card>
        <Card title="Low Stock"><div className="text-3xl font-semibold text-gray-900">{lowStock.length}</div></Card>
        <Card title="Active"><div className="text-3xl font-semibold text-gray-900">{products.filter(product => product.is_active).length}</div></Card>
      </div>
      {error && <ErrorState message={error} />}
      <Card title="Product Catalog">
        {loading && <LoadingState />}
        {!loading && products.length === 0 && <EmptyState title="No products found" />}
        {!loading && products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku || product.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.unit_price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.reorder_level}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={product.is_active ? 'active' : 'inactive'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
