import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ClipboardList,
  Factory,
  AlertTriangle,
  CheckCircle,
  Clock,
  PlayCircle,
  Plus,
  RefreshCw,
  TrendingUp,
  Activity,
  Filter,
  Calendar,
  ChevronRight,
  Bell,
  Search,
  BarChart2
} from 'lucide-react';
import { dashboardAPI, manufacturingOrdersAPI } from '../services/api';
import { DashboardStats, ManufacturingOrder } from '../types';
import { formatDate, getStatusColor, getStatusText, formatNumber } from '../utils/helpers';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<ManufacturingOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ManufacturingOrder[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Memoized filter function to improve performance
  const filterOrders = useCallback(() => {
    let result = [...orders];
    
    // Apply status filter
    if (selectedFilter !== 'all') {
      result = result.filter(order => order.state === selectedFilter);
    }
    
    // Apply search filter if there's a search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.reference.toLowerCase().includes(term) || 
        order.product_name.toLowerCase().includes(term) ||
        order.bom_name.toLowerCase().includes(term) ||
        (order.assignee_name && order.assignee_name.toLowerCase().includes(term))
      );
    }
    
    setFilteredOrders(result);
  }, [orders, selectedFilter, searchTerm]);

  // Load dashboard data
  const loadDashboardData = async (showToast = true) => {
    try {
      setRefreshing(true);
      const [statsData, ordersData] = await Promise.all([
        dashboardAPI.getStats(),
        manufacturingOrdersAPI.getAll(),
      ]);
      setStats(statsData);
      setOrders(ordersData);
      if (showToast) {
        toast.success('Dashboard data refreshed');
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadDashboardData(false);
    
    // Set up auto-refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      loadDashboardData(false);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    filterOrders();
  }, [orders, selectedFilter, searchTerm, filterOrders]);

  const getFilterOptions = () => [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'planned', label: 'Planned', count: orders.filter(o => o.state === 'planned').length },
    { value: 'in_progress', label: 'In Progress', count: orders.filter(o => o.state === 'in_progress').length },
    { value: 'done', label: 'Completed', count: orders.filter(o => o.state === 'done').length },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.state === 'cancelled').length },
  ];

  // Quick action handlers
  const handleCreateOrder = () => navigate('/manufacturing-orders');
  const handleViewAllOrders = () => navigate('/manufacturing-orders');
  const handleViewReports = () => navigate('/reports');
  const handleRefresh = () => loadDashboardData(true);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6 animate-fadeIn">
      {/* Header with refresh button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Welcome to your manufacturing control center</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleViewReports}
            className="flex items-center px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Reports
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Manufacturing Dashboard</h1>
          <p className="text-purple-100 text-sm md:text-base">
            Monitor your production operations, track orders, and manage your manufacturing workflow
          </p>
          
          {/* Quick action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleCreateOrder}
              className="flex items-center px-3 py-1.5 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Order
            </button>
            <button
              onClick={handleViewAllOrders}
              className="flex items-center px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors text-sm font-medium"
            >
              <ClipboardList className="h-4 w-4 mr-1" />
              View Orders
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total Orders Card */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.orders.total}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="flex items-center text-blue-600">
                <Clock className="h-4 w-4 mr-1" />
                {stats.orders.planned} Planned
              </span>
              <span className="flex items-center text-yellow-600">
                <PlayCircle className="h-4 w-4 mr-1" />
                {stats.orders.in_progress} Active
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate('/manufacturing-orders'); }}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                View all orders
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>

          {/* Completed Orders Card */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.orders.completed}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Completion Rate</span>
                <span>
                  {stats.orders.total > 0 
                    ? Math.round((stats.orders.completed / stats.orders.total) * 100)
                    : 0
                  }%
                </span>
              </div>
              <div className="mt-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${stats.orders.total > 0 
                      ? Math.round((stats.orders.completed / stats.orders.total) * 100)
                      : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate('/reports'); }}
                className="text-sm text-green-600 hover:text-green-800 flex items-center"
              >
                View efficiency reports
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.products.total}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="flex items-center text-sm text-red-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {stats.products.low_stock} Low Stock
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate('/products'); }}
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
              >
                Manage products
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>

          {/* Work Centers Card */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Factory className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Work Centers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.work_centers.active}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="flex items-center text-sm text-green-600">
                <Activity className="h-4 w-4 mr-1" />
                Active & Running
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate('/work-centers'); }}
                className="text-sm text-orange-600 hover:text-orange-800 flex items-center"
              >
                View work centers
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Manufacturing Orders Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <ClipboardList className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Manufacturing Orders</h2>
          </div>
          <button
            onClick={() => navigate('/manufacturing-orders')}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </button>
        </div>

        <div className="p-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Tabs */}
            <div className="overflow-x-auto">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 min-w-max">
                {getFilterOptions().map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFilter(option.value)}
                    className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedFilter === option.value
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {option.label}
                    <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                  {searchTerm
                    ? 'No orders match your search criteria. Try adjusting your search terms.'
                    : selectedFilter === 'all' 
                      ? 'Get started by creating your first manufacturing order.'
                      : `No ${selectedFilter} orders at the moment.`
                  }
                </p>
                {selectedFilter === 'all' && !searchTerm && (
                  <div className="mt-6">
                    <button
                      onClick={() => navigate('/manufacturing-orders')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      Create Manufacturing Order
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.slice(0, 10).map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/manufacturing-orders`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-purple-600">{order.reference}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{order.product_name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{order.bom_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>{formatNumber(order.quantity_produced)} / {formatNumber(order.quantity_to_produce)}</div>
                          <div className="text-sm text-gray-500">Units</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.state} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            <div>{formatDate(order.scheduled_date)}</div>
                          </div>
                          <div className="text-sm ml-5">
                            {new Date(order.scheduled_date) < new Date() && order.state !== 'done' ? 
                              <span className="text-red-600">Overdue</span> : 
                              <span className="text-green-600">On Time</span>
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.assignee_name ? (
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium mr-2">
                                {order.assignee_name.charAt(0).toUpperCase()}
                              </div>
                              <span>{order.assignee_name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(order.quantity_produced, order.quantity_to_produce)}`}
                                style={{
                                  width: `${Math.round((order.quantity_produced / order.quantity_to_produce) * 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 min-w-[2.5rem] text-right">
                              {Math.round((order.quantity_produced / order.quantity_to_produce) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {filteredOrders.length > 10 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/manufacturing-orders')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium shadow-sm"
              >
                View All Orders ({filteredOrders.length})
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {stats && (
              <div className="flex flex-col space-y-4">
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-gray-800">
                      <span className="font-medium">{stats.recent_activities.stock_movements}</span> recent stock movements
                    </p>
                    <p className="text-sm text-gray-500">Inventory updates in the system</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-gray-800">
                      <span className="font-medium">{stats.recent_activities.work_orders}</span> work orders in progress
                    </p>
                    <p className="text-sm text-gray-500">Active operations across work centers</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-gray-800">
                      <span className="font-medium">{stats.orders.in_progress}</span> manufacturing orders in progress
                    </p>
                    <p className="text-sm text-gray-500">Orders currently being processed</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for status badges
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'planned':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Clock className="h-3 w-3 mr-1" /> };
      case 'in_progress':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <PlayCircle className="h-3 w-3 mr-1" /> };
      case 'done':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-3 w-3 mr-1" /> };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertTriangle className="h-3 w-3 mr-1" /> };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: null };
    }
  };

  const { bg, text, icon } = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {icon}
      {getStatusText(status)}
    </span>
  );
};

// Helper function to get progress color based on completion percentage
const getProgressColor = (completed: number, total: number): string => {
  const percentage = (completed / total) * 100;
  
  if (percentage === 0) return 'bg-gray-300';
  if (percentage < 25) return 'bg-red-500';
  if (percentage < 50) return 'bg-yellow-500';
  if (percentage < 75) return 'bg-blue-500';
  return 'bg-green-500';
};

export default Dashboard;