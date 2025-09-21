import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Package,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  X,
} from 'lucide-react';
import { stockMovementsAPI, productsAPI } from '../services/api';
import { StockMovement, Product, CreateStockMovementData } from '../types';
import { formatDate, formatDateTime, formatNumber, downloadAsCSV } from '../utils/helpers';
import toast from 'react-hot-toast';

const StockLedger: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [formData, setFormData] = useState<CreateStockMovementData>({
    product_id: 0,
    reference: '',
    movement_type: 'in',
    quantity: 0,
    unit_cost: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMovements();
  }, [movements, selectedProduct, selectedType, searchTerm, startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movementsData, productsData] = await Promise.all([
        stockMovementsAPI.getAll(),
        productsAPI.getAll(),
      ]);
      setMovements(movementsData);
      setProducts(productsData);
    } catch (error) {
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const filterMovements = () => {
    let filtered = movements;

    // Filter by product
    if (selectedProduct !== 'all') {
      filtered = filtered.filter(movement => movement.product_id === parseInt(selectedProduct));
    }

    // Filter by movement type
    if (selectedType !== 'all') {
      if (selectedType === 'in') {
        // Filter for both 'in' and 'production' types
        filtered = filtered.filter(movement => ['in', 'production'].includes(movement.movement_type));
      } else if (selectedType === 'out') {
        // Filter for both 'out' and 'consumption' types
        filtered = filtered.filter(movement => ['out', 'consumption'].includes(movement.movement_type));
      } else {
        filtered = filtered.filter(movement => movement.movement_type === selectedType);
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(movement =>
        movement.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(movement => {
        const movementDateStr = formatDateFromString(movement.created_at);
        return movementDateStr >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter(movement => {
        const movementDateStr = formatDateFromString(movement.created_at);
        return movementDateStr <= endDate;
      });
    }

    setFilteredMovements(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await stockMovementsAPI.create(formData);
      toast.success('Stock movement recorded successfully');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to record stock movement');
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: 0,
      reference: '',
      movement_type: 'in',
      quantity: 0,
      unit_cost: 0,
    });
  };

  const clearAllFilters = () => {
    setSelectedProduct('all');
    setSelectedType('all');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  const formatDateForInput = (date: Date): string => {
    return date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
  };

  const formatDateFromString = (dateString: string): string => {
    const date = new Date(dateString);
    return formatDateForInput(date);
  };

  const setDateRange = (range: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth') => {
    // Use local date to avoid timezone issues
    const today = new Date();
    const todayStr = formatDateForInput(today);
    
    switch (range) {
      case 'today':
        setStartDate(todayStr);
        setEndDate(todayStr);
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDateForInput(yesterday);
        setStartDate(yesterdayStr);
        setEndDate(yesterdayStr);
        break;
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfWeekStr = formatDateForInput(startOfWeek);
        setStartDate(startOfWeekStr);
        setEndDate(todayStr);
        break;
      case 'lastWeek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStartStr = formatDateForInput(lastWeekStart);
        const lastWeekEndStr = formatDateForInput(lastWeekEnd);
        setStartDate(lastWeekStartStr);
        setEndDate(lastWeekEndStr);
        break;
      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfMonthStr = formatDateForInput(startOfMonth);
        setStartDate(startOfMonthStr);
        setEndDate(todayStr);
        break;
      case 'lastMonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        const lastMonthStartStr = formatDateForInput(lastMonthStart);
        const lastMonthEndStr = formatDateForInput(lastMonthEnd);
        setStartDate(lastMonthStartStr);
        setEndDate(lastMonthEndStr);
        break;
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
      case 'production':
        return <ArrowUpCircle className="h-4 w-4 text-green-600" />;
      case 'out':
      case 'consumption':
        return <ArrowDownCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'in':
      case 'production':
        return 'text-green-600 bg-green-100';
      case 'out':
      case 'consumption':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMovementLabel = (type: string): string => {
    const labels: Record<string, string> = {
      in: 'Production',
      out: 'Consumption',
      production: 'Production',
      consumption: 'Consumption',
    };
    return labels[type] || type;
  };

  const calculateTotalValue = () => {
    return filteredMovements.reduce((total, movement) => {
      return total + (movement.quantity * movement.unit_cost);
    }, 0);
  };

  const getStockSummary = () => {
    const summary = products.map(product => {
      const productMovements = movements.filter(m => m.product_id === product.id);
      const totalIn = productMovements
        .filter(m => ['in', 'production'].includes(m.movement_type))
        .reduce((sum, m) => sum + m.quantity, 0);
      const totalOut = productMovements
        .filter(m => ['out', 'consumption'].includes(m.movement_type))
        .reduce((sum, m) => sum + m.quantity, 0);
      
      return {
        ...product,
        total_in: totalIn,
        total_out: totalOut,
        calculated_stock: totalIn - totalOut,
      };
    });
    
    return summary.sort((a, b) => a.name.localeCompare(b.name));
  };

  const exportData = () => {
    const exportData = filteredMovements.map(movement => ({
      Date: formatDateTime(movement.created_at),
      Product: movement.product_name,
      Reference: movement.reference,
      Type: getMovementLabel(movement.movement_type),
      Quantity: movement.quantity,
      'Unit Cost': movement.unit_cost,
      'Total Value': movement.quantity * movement.unit_cost,
      'Created By': movement.created_by || '',
    }));
    
    // Create filename with date range if filters are applied
    let filename = 'stock-movements';
    if (startDate && endDate) {
      filename += `-${startDate}-to-${endDate}`;
    } else if (startDate) {
      filename += `-from-${startDate}`;
    } else if (endDate) {
      filename += `-until-${endDate}`;
    } else {
      filename += `-${formatDate(new Date().toISOString())}`;
    }
    
    downloadAsCSV(exportData, filename);
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
          <h1 className="text-2xl font-bold text-gray-900">Stock Ledger</h1>
          <p className="text-gray-600">Track inventory movements and stock levels</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportData}
            className="btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Movement
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Movements</p>
              <p className="text-2xl font-semibold text-gray-900">{movements.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Production</p>
              <p className="text-2xl font-semibold text-gray-900">
                {movements.filter(m => ['in', 'production'].includes(m.movement_type)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Consumption</p>
              <p className="text-2xl font-semibold text-gray-900">
                {movements.filter(m => ['out', 'consumption'].includes(m.movement_type)).length}
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
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${formatNumber(calculateTotalValue())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-white p-6">
        <div className="space-y-4">
          {/* First Row - Search and Clear Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search movements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            <div className="flex space-x-3">
              {/* Clear Filters Button */}
              <button
                onClick={clearAllFilters}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear all filters"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </button>
            </div>
          </div>

          {/* Second Row - Product, Type, and Date Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Product Filter */}
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="form-input min-w-[200px]"
            >
              <option value="all">All Products</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="form-input min-w-[150px]"
            >
              <option value="all">All Types</option>
              <option value="in">Production</option>
              <option value="out">Consumption</option>
            </select>

            {/* Date Range Filters */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">From:</span>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input min-w-[150px]"
                placeholder="Start date"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">To:</span>
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input min-w-[150px]"
                placeholder="End date"
              />
            </div>
          </div>

          {/* Third Row - Quick Date Range Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">Quick filters:</span>
            <button
              onClick={() => setDateRange('today')}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('yesterday')}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              Yesterday
            </button>
            <button
              onClick={() => setDateRange('thisWeek')}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              This Week
            </button>
            <button
              onClick={() => setDateRange('lastWeek')}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              Last Week
            </button>
            <button
              onClick={() => setDateRange('thisMonth')}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              This Month
            </button>
            <button
              onClick={() => setDateRange('lastMonth')}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              Last Month
            </button>
          </div>

          {/* Active Filters Display */}
          {(selectedProduct !== 'all' || selectedType !== 'all' || searchTerm || startDate || endDate) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedProduct !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Product: {products.find(p => p.id.toString() === selectedProduct)?.name}
                </span>
              )}
              {selectedType !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Type: {getMovementLabel(selectedType)}
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Search: "{searchTerm}"
                </span>
              )}
              {startDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  From: {formatDate(startDate)}
                </span>
              )}
              {endDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  To: {formatDate(endDate)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stock Summary */}
      <div className="card bg-white">
        <div className="card-header">
          <h2 className="card-title">Current Stock Levels</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Product</th>
                <th className="table-header-cell">Current Stock</th>
                <th className="table-header-cell">Min Stock</th>
                <th className="table-header-cell">Total Production</th>
                <th className="table-header-cell">Total Consumption</th>
                <th className="table-header-cell">Status</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {getStockSummary().slice(0, 10).map((product) => (
                <tr key={product.id} className="table-row">
                  <td className="table-cell">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.is_raw_material ? 'Raw Material' : 'Finished Good'}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="font-medium">
                      {formatNumber(product.current_stock, 0)} {product.unit}
                    </div>
                  </td>
                  <td className="table-cell">
                    {formatNumber(product.min_stock, 0)} {product.unit}
                  </td>
                  <td className="table-cell">
                    <div className="text-green-600 font-medium">
                      +{formatNumber(product.total_in, 0)}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-red-600 font-medium">
                      -{formatNumber(product.total_out, 0)}
                    </div>
                  </td>
                  <td className="table-cell">
                    {product.current_stock <= 0 ? (
                      <span className="badge bg-red-100 text-red-800">Out of Stock</span>
                    ) : product.current_stock < product.total_out ? (
                      <span className="badge bg-red-100 text-red-800">Out of Stock</span>
                    ) : product.current_stock <= product.min_stock ? (
                      <span className="badge bg-yellow-100 text-yellow-800">Low Stock</span>
                    ) : (
                      <span className="badge bg-green-100 text-green-800">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movements */}
      <div className="card bg-white">
        <div className="card-header">
          <h2 className="card-title">Stock Movements</h2>
        </div>

        {filteredMovements.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No movements found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedProduct !== 'all' || selectedType !== 'all' || startDate || endDate
                ? 'Try adjusting your search or filters'
                : 'Stock movements will appear here as they are recorded'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Date & Time</th>
                  <th className="table-header-cell">Product</th>
                  <th className="table-header-cell">Reference</th>
                  <th className="table-header-cell">Movement Type</th>
                  <th className="table-header-cell">Quantity</th>
                  <th className="table-header-cell">Unit Cost</th>
                  <th className="table-header-cell">Total Value</th>
                  <th className="table-header-cell">Created By</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium">{formatDate(movement.created_at)}</div>
                      <div className="text-sm text-gray-500">
                        {formatDateTime(movement.created_at).split(' ')[1]}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium">{movement.product_name}</div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-primary-600">
                        {movement.reference || '-'}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        {getMovementIcon(movement.movement_type)}
                        <span className={`badge ${getMovementColor(movement.movement_type)}`}>
                          {getMovementLabel(movement.movement_type)}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className={`font-medium ${
                        ['in', 'production'].includes(movement.movement_type) ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {['in', 'production'].includes(movement.movement_type) ? '+' : '-'}
                        {formatNumber(movement.quantity, 2)}
                      </div>
                    </td>
                    <td className="table-cell">
                      ${formatNumber(movement.unit_cost, 2)}
                    </td>
                    <td className="table-cell">
                      <div className="font-medium">
                        ${formatNumber(movement.quantity * movement.unit_cost, 2)}
                      </div>
                    </td>
                    <td className="table-cell">
                      {movement.created_by || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Movement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Record Stock Movement</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Product</label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: parseInt(e.target.value) })}
                    className="form-input"
                    required
                  >
                    <option value={0}>Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Movement Type</label>
                  <select
                    value={formData.movement_type}
                    onChange={(e) => setFormData({ ...formData, movement_type: e.target.value as 'in' | 'out' })}
                    className="form-input"
                    required
                  >
                    <option value="in">Production</option>
                    <option value="out">Consumption</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Reference</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="form-input"
                    placeholder="Enter reference (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                      className="form-input"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Unit Cost ($)</label>
                    <input
                      type="number"
                      value={formData.unit_cost}
                      onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                      className="form-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {formData.quantity > 0 && formData.unit_cost > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Value:</span>
                      <span className="font-medium">
                        ${formatNumber(formData.quantity * formData.unit_cost, 2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Record Movement
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

export default StockLedger;
