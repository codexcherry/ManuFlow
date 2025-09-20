import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Edit3,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { manufacturingOrdersAPI, bomAPI, usersAPI, productsAPI } from '../services/api';
import { ManufacturingOrder, BOM, User, Product } from '../types';
import { formatDate, getStatusColor, getStatusText, formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const ManufacturingOrders: React.FC = () => {
  const [orders, setOrders] = useState<ManufacturingOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ManufacturingOrder[]>([]);
  const [boms, setBOMs] = useState<BOM[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newOrder, setNewOrder] = useState({
    product_id: '',
    bom_id: '',
    quantity_to_produce: '',
    scheduled_date: '',
    assignee_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedFilter, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, bomsData, productsData, usersData] = await Promise.all([
        manufacturingOrdersAPI.getAll(),
        bomAPI.getAll(),
        productsAPI.getAll(),
        usersAPI.getAll(),
      ]);
      setOrders(ordersData);
      setBOMs(bomsData);
      setProducts(productsData);
      setUsers(usersData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(order => order.state === selectedFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.assignee_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await manufacturingOrdersAPI.create({
        product_id: parseInt(newOrder.product_id),
        bom_id: parseInt(newOrder.bom_id),
        quantity_to_produce: parseFloat(newOrder.quantity_to_produce),
        scheduled_date: newOrder.scheduled_date,
        assignee_id: newOrder.assignee_id ? parseInt(newOrder.assignee_id) : undefined,
      });
      
      toast.success('Manufacturing order created successfully');
      setShowCreateModal(false);
      setNewOrder({
        product_id: '',
        bom_id: '',
        quantity_to_produce: '',
        scheduled_date: '',
        assignee_id: '',
      });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create order');
    }
  };

  const handleConfirmOrder = async (orderId: number) => {
    try {
      await manufacturingOrdersAPI.confirm(orderId);
      toast.success('Order confirmed successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to confirm order');
    }
  };

  const handleCompleteOrder = async (orderId: number, quantityProduced: number) => {
    try {
      await manufacturingOrdersAPI.complete(orderId, quantityProduced);
      toast.success('Order completed successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to complete order');
    }
  };

  const getAvailableBOMs = () => {
    if (!newOrder.product_id) return [];
    return boms.filter(bom => bom.product_id === parseInt(newOrder.product_id));
  };

  const getFilterOptions = () => [
    { value: 'all', label: 'All', count: orders.length },
    { value: 'planned', label: 'Planned', count: orders.filter(o => o.state === 'planned').length },
    { value: 'in_progress', label: 'In Progress', count: orders.filter(o => o.state === 'in_progress').length },
    { value: 'done', label: 'Completed', count: orders.filter(o => o.state === 'done').length },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.state === 'cancelled').length },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Manufacturing Orders</h1>
          <p className="text-gray-600">Create and manage production orders</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card bg-white p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {getFilterOptions().map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedFilter === option.value
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card bg-white">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first manufacturing order'}
            </p>
            {!searchTerm && selectedFilter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create First Order
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Reference</th>
                  <th className="table-header-cell">Product</th>
                  <th className="table-header-cell">Quantity</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Schedule</th>
                  <th className="table-header-cell">Assignee</th>
                  <th className="table-header-cell">Progress</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-primary-600">{order.reference}</div>
                      <div className="text-sm text-gray-500">
                        Created {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium">{order.product_name}</div>
                      <div className="text-sm text-gray-500">{order.bom_name}</div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium">
                        {order.quantity_produced} / {order.quantity_to_produce}
                      </div>
                      <div className="text-sm text-gray-500">Units</div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusColor(order.state)}`}>
                        {getStatusText(order.state)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium">{formatDate(order.scheduled_date)}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.scheduled_date) < new Date() && order.state !== 'done' && (
                          <span className="text-red-600 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Overdue
                          </span>
                        )}
                        {order.completed_at && (
                          <span className="text-green-600">
                            Completed {formatDate(order.completed_at)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {order.assignee_name || (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${Math.round((order.quantity_produced / order.quantity_to_produce) * 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 min-w-[3rem]">
                          {Math.round((order.quantity_produced / order.quantity_to_produce) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        {order.state === 'planned' && (
                          <button
                            onClick={() => handleConfirmOrder(order.id)}
                            className="text-green-600 hover:text-green-700"
                            title="Confirm Order"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {order.state === 'in_progress' && (
                          <button
                            onClick={() => handleCompleteOrder(order.id, order.quantity_to_produce)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Complete Order"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          className="text-gray-600 hover:text-gray-700"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Create Manufacturing Order</h2>
              
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div>
                  <label className="form-label">Product</label>
                  <select
                    value={newOrder.product_id}
                    onChange={(e) => setNewOrder({ ...newOrder, product_id: e.target.value, bom_id: '' })}
                    className="form-input"
                    required
                  >
                    <option value="">Select Product</option>
                    {products
                      .filter(product => !product.is_raw_material) // Only show finished goods
                      .map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="form-label">Bill of Materials</label>
                  <select
                    value={newOrder.bom_id}
                    onChange={(e) => setNewOrder({ ...newOrder, bom_id: e.target.value })}
                    className="form-input"
                    required
                    disabled={!newOrder.product_id}
                  >
                    <option value="">Select BOM</option>
                    {getAvailableBOMs().length > 0 ? (
                      getAvailableBOMs().map(bom => (
                        <option key={bom.id} value={bom.id}>
                          {bom.name} (Qty: {bom.quantity})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {newOrder.product_id ? 'No BOMs available for this product' : 'Select a product first'}
                      </option>
                    )}
                  </select>
                  {newOrder.product_id && getAvailableBOMs().length === 0 && (
                    <p className="text-xs text-danger-600 mt-1">
                      No Bill of Materials found for this product. Please create a BOM first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="form-label">Quantity to Produce</label>
                  <div className="flex">
                    <input
                      type="number"
                      value={newOrder.quantity_to_produce}
                      onChange={(e) => setNewOrder({ ...newOrder, quantity_to_produce: e.target.value })}
                      className="form-input"
                      placeholder="Enter quantity"
                      min="1"
                      step="0.01"
                      required
                    />
                    <span className="ml-2 inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-gray-300 rounded-lg">
                      {newOrder.product_id ? 
                        products.find(p => p.id === parseInt(newOrder.product_id))?.unit || 'Units' 
                        : 'Units'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="form-label">Scheduled Date</label>
                  <input
                    type="datetime-local"
                    value={newOrder.scheduled_date}
                    onChange={(e) => setNewOrder({ ...newOrder, scheduled_date: e.target.value })}
                    className="form-input"
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: MM/DD/YYYY --:-- --</p>
                </div>

                <div>
                  <label className="form-label">Assignee (Optional)</label>
                  <select
                    value={newOrder.assignee_id}
                    onChange={(e) => setNewOrder({ ...newOrder, assignee_id: e.target.value })}
                    className="form-input"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button 
                    type="submit" 
                    className="btn-primary flex-1"
                    disabled={!newOrder.product_id || !newOrder.bom_id || !newOrder.quantity_to_produce || !newOrder.scheduled_date}
                  >
                    Create Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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

export default ManufacturingOrders;
