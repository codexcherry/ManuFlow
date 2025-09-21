import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { workOrdersAPI, manufacturingOrdersAPI } from '../services/api';
import { WorkOrder, ManufacturingOrder } from '../types';
import { formatDate, formatTime, getStatusColor, getStatusText, formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const WorkOrders: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<WorkOrder[]>([]);
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMO, setSelectedMO] = useState<string>('all');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [workOrders, selectedFilter, searchTerm, selectedMO]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workOrdersData, manufacturingOrdersData] = await Promise.all([
        workOrdersAPI.getAll(),
        manufacturingOrdersAPI.getAll(),
      ]);
      setWorkOrders(workOrdersData);
      setManufacturingOrders(manufacturingOrdersData);
    } catch (error) {
      toast.error('Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = workOrders;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(order => order.state === selectedFilter);
    }

    // Filter by manufacturing order
    if (selectedMO !== 'all') {
      filtered = filtered.filter(order => order.manufacturing_order_id === parseInt(selectedMO));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.operation_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.manufacturing_order_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.work_center_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.assignee_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleStartWorkOrder = async (workOrderId: number) => {
    try {
      await workOrdersAPI.start(workOrderId);
      toast.success('Work order started');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start work order');
    }
  };

  const handleCompleteWorkOrder = async (workOrderId: number, notes?: string) => {
    try {
      await workOrdersAPI.complete(workOrderId, undefined, notes);
      toast.success('Work order completed');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to complete work order');
    }
  };

  const handleSyncWorkOrders = async () => {
    try {
      setSyncing(true);
      const response = await workOrdersAPI.sync();
      toast.success(response.message);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to sync work orders');
    } finally {
      setSyncing(false);
    }
  };

  const getFilterOptions = () => [
    { value: 'all', label: 'All', count: workOrders.length },
    { value: 'pending', label: 'Pending', count: workOrders.filter(wo => wo.state === 'pending').length },
    { value: 'in_progress', label: 'In Progress', count: workOrders.filter(wo => wo.state === 'in_progress').length },
    { value: 'completed', label: 'Completed', count: workOrders.filter(wo => wo.state === 'completed').length },
    { value: 'cancelled', label: 'Cancelled', count: workOrders.filter(wo => wo.state === 'cancelled').length },
  ];

  const getActionButton = (workOrder: WorkOrder) => {
    switch (workOrder.state) {
      case 'pending':
        return (
          <button
            onClick={() => handleStartWorkOrder(workOrder.id)}
            className="text-green-600 hover:text-green-700 flex items-center space-x-1"
            title="Start Work Order"
          >
            <Play className="h-4 w-4" />
            <span className="text-sm">Start</span>
          </button>
        );
      
      case 'in_progress':
        return (
          <button
            onClick={() => handleCompleteWorkOrder(workOrder.id)}
            className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            title="Complete Work Order"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Complete</span>
          </button>
        );
      
      default:
        return (
          <button
            className="text-gray-600 hover:text-gray-700 flex items-center space-x-1"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
            <span className="text-sm">View</span>
          </button>
        );
    }
  };

  const getEfficiency = (workOrder: WorkOrder) => {
    if (!workOrder.estimated_time || workOrder.estimated_time === 0) return null;
    if (!workOrder.actual_time || workOrder.actual_time === 0) return null;
    
    const efficiency = (workOrder.estimated_time / workOrder.actual_time) * 100;
    return Math.round(efficiency);
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
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-600">Execute and track manufacturing operations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSyncWorkOrders}
            disabled={syncing}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync with Manufacturing Orders'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Work Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{workOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Play className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {workOrders.filter(wo => wo.state === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {workOrders.filter(wo => wo.state === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {workOrders.filter(wo => wo.state === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-white p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Manufacturing Order Filter */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedMO}
              onChange={(e) => setSelectedMO(e.target.value)}
              className="form-input min-w-[200px]"
            >
              <option value="all">All Manufacturing Orders</option>
              {manufacturingOrders.map(mo => (
                <option key={mo.id} value={mo.id}>
                  {mo.reference} - {mo.product_name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {getFilterOptions().map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedFilter(option.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
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
      </div>

      {/* Work Orders Table */}
      <div className="card bg-white">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No work orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedFilter !== 'all' || selectedMO !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Work orders will appear when manufacturing orders are confirmed'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Operation</th>
                  <th className="table-header-cell">Manufacturing Order</th>
                  <th className="table-header-cell">Work Center</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Time</th>
                  <th className="table-header-cell">Assignee</th>
                  <th className="table-header-cell">Progress</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredOrders.map((workOrder) => {
                  const efficiency = getEfficiency(workOrder);
                  return (
                    <tr key={workOrder.id} className="table-row">
                      <td className="table-cell">
                        <div className="font-medium">{workOrder.operation_name}</div>
                        {workOrder.notes && (
                          <div className="text-sm text-gray-500 mt-1">{workOrder.notes}</div>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="font-medium text-primary-600">
                          {workOrder.manufacturing_order_reference}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="font-medium">{workOrder.work_center_name}</div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${getStatusColor(workOrder.state)}`}>
                          {getStatusText(workOrder.state)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm">
                          <div>
                            Estimated: {formatTime(workOrder.estimated_time)}
                          </div>
                          {workOrder.actual_time > 0 && (
                            <div className={efficiency && efficiency < 100 ? 'text-red-600' : 'text-green-600'}>
                              Actual: {formatTime(workOrder.actual_time)}
                              {efficiency && (
                                <span className="ml-1">({efficiency}%)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        {workOrder.assignee_name || (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="text-sm">
                          {workOrder.started_at && (
                            <div>Started: {formatDateTime(workOrder.started_at)}</div>
                          )}
                          {workOrder.completed_at && (
                            <div>Completed: {formatDateTime(workOrder.completed_at)}</div>
                          )}
                          {workOrder.state === 'pending' && (
                            <span className="text-gray-500 italic">Not started</span>
                          )}
                          {workOrder.state === 'in_progress' && !workOrder.completed_at && (
                            <span className="text-yellow-600 italic">In progress...</span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        {getActionButton(workOrder)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrders;
