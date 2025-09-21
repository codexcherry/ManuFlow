import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Mail,
  Shield,
  Clock,
  FileText,
  Edit3,
  Save,
  X,
  CheckCircle,
} from 'lucide-react';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  const handleSave = async () => {
    try {
      // In a real app, you would make an API call to update the user profile
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  // Mock data for user reports and activities
  const mockReports = [
    {
      id: 1,
      title: 'Monthly Production Summary',
      date: '2024-01-15',
      type: 'Production',
      status: 'completed',
    },
    {
      id: 2,
      title: 'Work Order Performance',
      date: '2024-01-10',
      type: 'Work Orders',
      status: 'completed',
    },
    {
      id: 3,
      title: 'Efficiency Analysis',
      date: '2024-01-05',
      type: 'Analytics',
      status: 'completed',
    },
  ];

  const mockActivities = [
    {
      id: 1,
      action: 'Completed work order',
      reference: 'WO240115001',
      time: '2 hours ago',
      type: 'work_order',
    },
    {
      id: 2,
      action: 'Created manufacturing order',
      reference: 'MO240115002',
      time: '5 hours ago',
      type: 'manufacturing_order',
    },
    {
      id: 3,
      action: 'Updated product stock',
      reference: 'Wooden Legs',
      time: '1 day ago',
      type: 'stock',
    },
    {
      id: 4,
      action: 'Generated production report',
      reference: 'RPT240114001',
      time: '2 days ago',
      type: 'report',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'work_order':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'manufacturing_order':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'stock':
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'report':
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'operator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
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
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="card bg-white">
            <div className="card-header flex items-center justify-between">
              <h2 className="card-title">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center text-sm"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="btn-primary flex items-center text-sm"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn-secondary flex items-center text-sm"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
                  <span className={`badge ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="form-input"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 py-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{user.username}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 py-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Role</label>
                  <div className="flex items-center space-x-2 py-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 capitalize">{user.role}</span>
                  </div>
                </div>

                <div>
                  <label className="form-label">User ID</label>
                  <div className="flex items-center space-x-2 py-2">
                    <span className="text-gray-900">#{user.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card bg-white">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
            </div>
            
            <div className="space-y-4">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.reference}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card bg-white">
            <div className="card-header">
              <h2 className="card-title">Quick Stats</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Work Orders Completed</span>
                <span className="font-semibold text-gray-900">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Manufacturing Orders</span>
                <span className="font-semibold text-gray-900">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Work Time</span>
                <span className="font-semibold text-gray-900">156h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Efficiency</span>
                <span className="font-semibold text-green-600">92%</span>
              </div>
            </div>
          </div>

          {/* My Reports */}
          <div className="card bg-white">
            <div className="card-header">
              <h2 className="card-title">My Reports</h2>
            </div>
            
            <div className="space-y-3">
              {mockReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {report.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(report.date)} • {report.type}
                    </p>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full btn-secondary text-sm">
                View All Reports
              </button>
            </div>
          </div>

          {/* Account Security */}
          <div className="card bg-white">
            <div className="card-header">
              <h2 className="card-title">Account Security</h2>
            </div>
            
            <div className="space-y-3">
              <button className="w-full btn-secondary text-sm text-left">
                Change Password
              </button>
              <button className="w-full btn-secondary text-sm text-left">
                Two-Factor Authentication
              </button>
              <button className="w-full btn-secondary text-sm text-left">
                Login History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
