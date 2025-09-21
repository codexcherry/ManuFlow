import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Factory,
  Edit3,
  Trash2,
  DollarSign,
  Users,
  Activity,
  Clock,
} from 'lucide-react';
import { workCentersAPI } from '../services/api';
import { WorkCenter, CreateWorkCenterData } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const WorkCenters: React.FC = () => {
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<WorkCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState<WorkCenter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CreateWorkCenterData & { is_active?: boolean }>({
    name: '',
    description: '',
    cost_per_hour: 0,
    capacity: 1,
    is_active: true,
  });

  useEffect(() => {
    loadWorkCenters();
  }, []);

  useEffect(() => {
    filterCenters();
  }, [workCenters, searchTerm]);

  const loadWorkCenters = async () => {
    try {
      setLoading(true);
      const data = await workCentersAPI.getAll();
      setWorkCenters(data);
    } catch (error) {
      toast.error('Failed to load work centers');
    } finally {
      setLoading(false);
    }
  };

  const filterCenters = () => {
    if (!searchTerm) {
      setFilteredCenters(workCenters);
      return;
    }

    const filtered = workCenters.filter(center =>
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCenters(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCenter) {
        await workCentersAPI.update(editingCenter.id, formData);
        toast.success('Work center updated successfully');
      } else {
        await workCentersAPI.create(formData);
        toast.success('Work center created successfully');
      }
      setShowCreateModal(false);
      setEditingCenter(null);
      resetForm();
      loadWorkCenters();
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${editingCenter ? 'update' : 'create'} work center`);
    }
  };

  const handleEdit = (center: WorkCenter) => {
    setEditingCenter(center);
    setFormData({
      name: center.name,
      description: center.description,
      cost_per_hour: center.cost_per_hour,
      capacity: center.capacity,
      is_active: center.is_active,
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      cost_per_hour: 0,
      capacity: 1,
      is_active: true,
    });
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingCenter(null);
    resetForm();
  };

  const handleDelete = async (center: WorkCenter) => {
    if (window.confirm(`Are you sure you want to delete the work center "${center.name}"?`)) {
      try {
        await workCentersAPI.delete(center.id);
        toast.success('Work center deleted successfully');
        loadWorkCenters();
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to delete work center');
      }
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600 bg-red-100';
    if (utilization >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
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
          <h1 className="text-2xl font-bold text-gray-900">Work Centers</h1>
          <p className="text-gray-600">Manage manufacturing locations and resources</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Work Center
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Factory className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Centers</p>
              <p className="text-2xl font-semibold text-gray-900">{workCenters.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Centers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {workCenters.filter(wc => wc.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Capacity</p>
              <p className="text-2xl font-semibold text-gray-900">
                {workCenters.reduce((sum, wc) => sum + wc.capacity, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Cost/Hour</p>
              <p className="text-2xl font-semibold text-gray-900">
                {workCenters.length > 0 
                  ? formatCurrency(workCenters.reduce((sum, wc) => sum + wc.cost_per_hour, 0) / workCenters.length)
                  : '$0'
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
            placeholder="Search work centers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Work Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCenters.map((center) => (
          <div key={center.id} className="card bg-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${center.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Factory className={`h-6 w-6 ${center.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{center.name}</h3>
                  <div className="flex items-center mt-1">
                    <div className={`w-2 h-2 rounded-full mr-2 ${center.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className={`text-sm ${center.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                      {center.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(center)}
                  className="text-gray-600 hover:text-blue-600"
                  title="Edit"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(center)}
                  className="text-gray-600 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {center.description && (
              <p className="text-sm text-gray-600 mb-4">{center.description}</p>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cost per Hour</span>
                <span className="font-medium text-lg">
                  {formatCurrency(center.cost_per_hour)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Capacity</span>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{center.capacity}</span>
                </div>
              </div>

              {/* Mock utilization data - in real app this would come from work orders */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Utilization</span>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: '45%' }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Created</span>
                  <span>{formatDate(center.created_at)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 flex space-x-2">
                <button className="btn-secondary text-sm flex-1">
                  View Schedule
                </button>
                <button className="btn-primary text-sm flex-1">
                  Assign Work
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCenters.length === 0 && (
        <div className="text-center py-12">
          <Factory className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No work centers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'Try adjusting your search term'
              : 'Get started by adding your first work center'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                Add Work Center
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
                {editingCenter ? 'Edit Work Center' : 'Add New Work Center'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Work Center Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter work center name"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input"
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Cost per Hour ($)</label>
                    <input
                      type="number"
                      value={formData.cost_per_hour}
                      onChange={(e) => setFormData({ ...formData, cost_per_hour: parseFloat(e.target.value) || 0 })}
                      className="form-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="form-label">Capacity</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                      className="form-input"
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="form-checkbox mr-2"
                    />
                    <span className="form-label mb-0">Active</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Inactive work centers won't be available for new work orders
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Work Center Features</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Time tracking for operations</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Capacity management</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Cost calculation per hour</span>
                    </div>
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      <span>Real-time utilization monitoring</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingCenter ? 'Update Work Center' : 'Add Work Center'}
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

export default WorkCenters;
