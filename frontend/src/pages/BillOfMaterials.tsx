import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Layers,
  Edit3,
  Trash2,
  Clock,
  Package,
  Minus,
} from 'lucide-react';
import { bomAPI, productsAPI } from '../services/api';
import { BOM, Product, CreateBOMData } from '../types';
import { formatDate, formatTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const BillOfMaterials: React.FC = () => {
  const [boms, setBOMs] = useState<BOM[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredBOMs, setFilteredBOMs] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CreateBOMData>({
    product_id: 0,
    name: '',
    description: '',
    quantity: 1,
    components: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterBOMs();
  }, [boms, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bomsData, productsData] = await Promise.all([
        bomAPI.getAll(),
        productsAPI.getAll(),
      ]);
      setBOMs(bomsData);
      setProducts(productsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterBOMs = () => {
    if (!searchTerm) {
      setFilteredBOMs(boms);
      return;
    }

    const filtered = boms.filter(bom =>
      bom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bom.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bom.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBOMs(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bomAPI.create(formData);
      toast.success('BOM created successfully');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create BOM');
    }
  };

  const addComponent = () => {
    setFormData({
      ...formData,
      components: [
        ...formData.components,
        { product_id: 0, quantity: 1, operation_time: 0 },
      ],
    });
  };

  const removeComponent = (index: number) => {
    setFormData({
      ...formData,
      components: formData.components.filter((_, i) => i !== index),
    });
  };

  const updateComponent = (index: number, field: string, value: any) => {
    const updatedComponents = formData.components.map((component, i) =>
      i === index ? { ...component, [field]: value } : component
    );
    setFormData({ ...formData, components: updatedComponents });
  };

  const resetForm = () => {
    setFormData({
      product_id: 0,
      name: '',
      description: '',
      quantity: 1,
      components: [],
    });
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const getFinishedProducts = () => {
    return products.filter(p => !p.is_raw_material);
  };

  const getRawMaterials = () => {
    return products.filter(p => p.is_raw_material);
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getTotalOperationTime = (components: any[]) => {
    return components.reduce((total, component) => total + (component.operation_time || 0), 0);
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
          <h1 className="text-2xl font-bold text-gray-900">Bill of Materials</h1>
          <p className="text-gray-600">Define recipes and operations for products</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create BOM
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Layers className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total BOMs</p>
              <p className="text-2xl font-semibold text-gray-900">{boms.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Products with BOMs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(boms.map(bom => bom.product_id)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Operation Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {boms.length > 0 
                  ? formatTime(boms.reduce((sum, bom) => sum + getTotalOperationTime(bom.components), 0) / boms.length)
                  : '0m'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card bg-white p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search BOMs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* BOMs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBOMs.map((bom) => (
          <div key={bom.id} className="card bg-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{bom.name}</h3>
                <p className="text-sm text-gray-600">
                  For: <span className="font-medium">{bom.product_name}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Produces {bom.quantity} unit(s)
                </p>
              </div>
              <div className="flex space-x-1">
                <button className="text-gray-600 hover:text-blue-600" title="Edit">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button className="text-gray-600 hover:text-red-600" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {bom.description && (
              <p className="text-sm text-gray-600 mb-4">{bom.description}</p>
            )}

            {/* Components */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Components & Operations</h4>
              
              {bom.components.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No components defined</p>
              ) : (
                <div className="space-y-2">
                  {bom.components.map((component, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{component.product_name}</div>
                        <div className="text-xs text-gray-500">
                          Quantity: {component.quantity}
                          {component.operation_time > 0 && (
                            <span className="ml-2">• Time: {formatTime(component.operation_time)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Components:</span>
                  <span className="font-medium">{bom.components.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Operation Time:</span>
                  <span className="font-medium">
                    {formatTime(getTotalOperationTime(bom.components))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(bom.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBOMs.length === 0 && (
        <div className="text-center py-12">
          <Layers className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No BOMs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'Try adjusting your search term'
              : 'Get started by creating your first Bill of Materials'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                Create BOM
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create BOM Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Create Bill of Materials</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Product</label>
                    <select
                      value={formData.product_id}
                      onChange={(e) => setFormData({ ...formData, product_id: parseInt(e.target.value) })}
                      className="form-input"
                      required
                    >
                      <option value={0}>Select Product</option>
                      {getFinishedProducts().map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Output Quantity</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 1 })}
                      className="form-input"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">BOM Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter BOM name"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input"
                    placeholder="Enter BOM description"
                    rows={3}
                  />
                </div>

                {/* Components */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="form-label mb-0">Components</label>
                    <button
                      type="button"
                      onClick={addComponent}
                      className="btn-secondary text-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Component
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.components.map((component, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-lg">
                        <div className="col-span-4">
                          <select
                            value={component.product_id}
                            onChange={(e) => updateComponent(index, 'product_id', parseInt(e.target.value))}
                            className="form-input text-sm"
                            required
                          >
                            <option value={0}>Select Raw Material</option>
                            {getRawMaterials().map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-3">
                          <input
                            type="number"
                            value={component.quantity}
                            onChange={(e) => updateComponent(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="form-input text-sm"
                            placeholder="Quantity"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <div className="col-span-4">
                          <input
                            type="number"
                            value={component.operation_time}
                            onChange={(e) => updateComponent(index, 'operation_time', parseFloat(e.target.value) || 0)}
                            className="form-input text-sm"
                            placeholder="Time (minutes)"
                            min="0"
                            step="1"
                          />
                        </div>

                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => removeComponent(index)}
                            className="text-red-600 hover:text-red-700"
                            title="Remove component"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {formData.components.length === 0 && (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">No components added yet</p>
                        <button
                          type="button"
                          onClick={addComponent}
                          className="btn-primary text-sm mt-2"
                        >
                          Add First Component
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Create BOM
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

export default BillOfMaterials;
