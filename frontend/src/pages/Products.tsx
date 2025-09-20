import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Package,
  Edit3,
  Trash2,
  AlertTriangle,
  Box,
  DollarSign,
} from 'lucide-react';
import { productsAPI } from '../services/api';
import { Product, CreateProductData } from '../types';
import { formatNumber, formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'raw' | 'finished' | 'low_stock'>('all');

  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    unit: 'Units',
    current_stock: 0,
    min_stock: 0,
    cost_price: 0,
    is_raw_material: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterType]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by type
    if (filterType === 'raw') {
      filtered = filtered.filter(p => p.is_raw_material);
    } else if (filterType === 'finished') {
      filtered = filtered.filter(p => !p.is_raw_material);
    } else if (filterType === 'low_stock') {
      filtered = filtered.filter(p => p.current_stock <= p.min_stock);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, formData);
        toast.success('Product updated successfully');
      } else {
        await productsAPI.create(formData);
        toast.success('Product created successfully');
      }
      
      setShowCreateModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      unit: product.unit,
      current_stock: product.current_stock,
      min_stock: product.min_stock,
      cost_price: product.cost_price,
      is_raw_material: product.is_raw_material,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await productsAPI.delete(product.id);
        toast.success('Product deleted successfully');
        loadProducts();
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      unit: 'Units',
      current_stock: 0,
      min_stock: 0,
      cost_price: 0,
      is_raw_material: false,
    });
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingProduct(null);
    resetForm();
  };

  const getStockStatus = (product: Product) => {
    if (product.current_stock <= 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-100' };
    if (product.current_stock <= product.min_stock) return { status: 'low', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage raw materials and finished goods</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Box className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Raw Materials</p>
              <p className="text-2xl font-semibold text-gray-900">
                {products.filter(p => p.is_raw_material).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Finished Goods</p>
              <p className="text-2xl font-semibold text-gray-900">
                {products.filter(p => !p.is_raw_material).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-semibold text-gray-900">
                {products.filter(p => p.current_stock <= p.min_stock).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card bg-white p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { value: 'all', label: 'All' },
              { value: 'raw', label: 'Raw Materials' },
              { value: 'finished', label: 'Finished Goods' },
              { value: 'low_stock', label: 'Low Stock' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterType(option.value as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filterType === option.value
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product);
          return (
            <div key={product.id} className="card bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${product.is_raw_material ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {product.is_raw_material ? (
                      <Box className={`h-5 w-5 ${product.is_raw_material ? 'text-green-600' : 'text-blue-600'}`} />
                    ) : (
                      <Package className={`h-5 w-5 ${product.is_raw_material ? 'text-green-600' : 'text-blue-600'}`} />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {product.is_raw_material ? 'Raw Material' : 'Finished Good'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-gray-600 hover:text-blue-600"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="text-gray-600 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Stock</span>
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${stockStatus.bg} ${stockStatus.color}`}>
                      {formatNumber(product.current_stock, 0)} {product.unit}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Min Stock</span>
                  <span className="text-sm font-medium">
                    {formatNumber(product.min_stock, 0)} {product.unit}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cost Price</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(product.cost_price)} per {product.unit}
                  </span>
                </div>

                {product.current_stock <= product.min_stock && (
                  <div className="flex items-center text-yellow-600 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Stock level is low
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first product'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <div className="mt-6">
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                Add Product
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input"
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="form-input"
                    >
                      <option value="Units">Units</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Kg">Kg</option>
                      <option value="Liters">Liters</option>
                      <option value="Meters">Meters</option>
                      <option value="Bottles">Bottles</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Cost Price</label>
                    <input
                      type="number"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                      className="form-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Current Stock</label>
                    <input
                      type="number"
                      value={formData.current_stock}
                      onChange={(e) => setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })}
                      className="form-input"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="form-label">Min Stock Level</label>
                    <input
                      type="number"
                      value={formData.min_stock}
                      onChange={(e) => setFormData({ ...formData, min_stock: parseFloat(e.target.value) || 0 })}
                      className="form-input"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_raw_material}
                      onChange={(e) => setFormData({ ...formData, is_raw_material: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">This is a raw material</span>
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
