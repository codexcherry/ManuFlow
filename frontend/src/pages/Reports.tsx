import React, { useState, useEffect } from 'react';
import {
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  Clock,
  Package,
  Filter,
  FileText,
} from 'lucide-react';
import { reportsAPI } from '../services/api';
import { ProductionReport } from '../types';
import { formatDate, formatTime, downloadAsCSV, formatNumber } from '../utils/helpers';
import toast from 'react-hot-toast';

const Reports: React.FC = () => {
  const [productionReports, setProductionReports] = useState<ProductionReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  useEffect(() => {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    });
    
    loadProductionReport(startDate.toISOString(), endDate.toISOString());
  }, []);

  const loadProductionReport = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const data = await reportsAPI.getProductionReport(startDate, endDate);
      setProductionReports(data);
    } catch (error) {
      toast.error('Failed to load production report');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = () => {
    if (dateRange.start && dateRange.end) {
      loadProductionReport(dateRange.start, dateRange.end);
    }
  };

  const exportProductionReport = () => {
    const exportData = productionReports.map(report => ({
      Reference: report.reference,
      Product: report.product_name,
      'Planned Quantity': report.quantity_to_produce,
      'Produced Quantity': report.quantity_produced,
      Status: report.state,
      'Total Time (minutes)': report.total_time,
      'Efficiency (%)': report.efficiency,
      'Created Date': formatDate(report.created_at),
      'Completed Date': report.completed_at ? formatDate(report.completed_at) : 'Not completed',
    }));
    
    downloadAsCSV(exportData, `production-report-${formatDate(new Date().toISOString())}`);
  };

  const getProductionStats = () => {
    const totalOrders = productionReports.length;
    const completedOrders = productionReports.filter(r => r.state === 'done').length;
    const totalPlanned = productionReports.reduce((sum, r) => sum + r.quantity_to_produce, 0);
    const totalProduced = productionReports.reduce((sum, r) => sum + r.quantity_produced, 0);
    const totalTime = productionReports.reduce((sum, r) => sum + r.total_time, 0);
    const avgEfficiency = productionReports.length > 0 
      ? productionReports.reduce((sum, r) => sum + r.efficiency, 0) / productionReports.length 
      : 0;

    return {
      totalOrders,
      completedOrders,
      totalPlanned,
      totalProduced,
      totalTime,
      avgEfficiency,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      productionRate: totalPlanned > 0 ? (totalProduced / totalPlanned) * 100 : 0,
    };
  };

  interface ProductStat {
    name: string;
    orders: number;
    totalProduced: number;
    totalTime: number;
  }

  const getTopProducts = () => {
    const productStats: Record<string, ProductStat> = {};
    
    productionReports.forEach(report => {
      if (!productStats[report.product_name]) {
        productStats[report.product_name] = {
          name: report.product_name,
          orders: 0,
          totalProduced: 0,
          totalTime: 0,
        };
      }
      
      productStats[report.product_name].orders += 1;
      productStats[report.product_name].totalProduced += report.quantity_produced;
      productStats[report.product_name].totalTime += report.total_time;
    });
    
    return Object.values(productStats)
      .sort((a, b) => b.totalProduced - a.totalProduced)
      .slice(0, 5);
  };

  const stats = getProductionStats();
  const topProducts = getTopProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Production analytics and performance metrics</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-900">Date Range:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="form-input"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="form-input"
            />
            <button
              onClick={handleDateRangeChange}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Apply'}
            </button>
          </div>
          
          <button
            onClick={exportProductionReport}
            className="btn-secondary flex items-center"
            disabled={productionReports.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
              <p className="text-sm text-green-600">
                {formatNumber(stats.completionRate, 1)}% completed
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Production</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(stats.totalProduced, 0)}
              </p>
              <p className="text-sm text-gray-600">
                of {formatNumber(stats.totalPlanned, 0)} planned
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
              <p className="text-sm font-medium text-gray-600">Total Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatTime(stats.totalTime)}
              </p>
              <p className="text-sm text-gray-600">
                Avg: {stats.totalOrders > 0 ? formatTime(stats.totalTime / stats.totalOrders) : '0m'}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(stats.avgEfficiency, 1)}%
              </p>
              <p className={`text-sm ${stats.avgEfficiency >= 85 ? 'text-green-600' : 'text-yellow-600'}`}>
                {stats.avgEfficiency >= 85 ? 'Excellent' : 'Good'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card bg-white">
          <div className="card-header">
            <h2 className="card-title flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Top Products by Volume
            </h2>
          </div>
          
          {topProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">No production data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product: any, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {product.orders} orders • {formatTime(product.totalTime)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatNumber(product.totalProduced, 0)}
                    </div>
                    <div className="text-sm text-gray-500">units</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Efficiency Distribution */}
        <div className="card bg-white">
          <div className="card-header">
            <h2 className="card-title flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Efficiency Distribution
            </h2>
          </div>
          
          <div className="space-y-4">
            {[
              { range: '90-100%', min: 90, color: 'bg-green-500' },
              { range: '80-89%', min: 80, color: 'bg-blue-500' },
              { range: '70-79%', min: 70, color: 'bg-yellow-500' },
              { range: '60-69%', min: 60, color: 'bg-orange-500' },
              { range: '<60%', min: 0, color: 'bg-red-500' },
            ].map((bracket) => {
              const count = productionReports.filter(r => {
                if (bracket.min === 0) return r.efficiency < 60;
                if (bracket.min === 90) return r.efficiency >= 90;
                return r.efficiency >= bracket.min && r.efficiency < bracket.min + 10;
              }).length;
              
              const percentage = productionReports.length > 0 ? (count / productionReports.length) * 100 : 0;
              
              return (
                <div key={bracket.range} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${bracket.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{bracket.range}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${bracket.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 min-w-[3rem] text-right">
                      {count} ({formatNumber(percentage, 1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Production Report Table */}
      <div className="card bg-white">
        <div className="card-header">
          <h2 className="card-title">Production Report Details</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : productionReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No production data</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your date range or check back later
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Reference</th>
                  <th className="table-header-cell">Product</th>
                  <th className="table-header-cell">Planned</th>
                  <th className="table-header-cell">Produced</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Time</th>
                  <th className="table-header-cell">Efficiency</th>
                  <th className="table-header-cell">Created</th>
                  <th className="table-header-cell">Completed</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {productionReports.map((report) => (
                  <tr key={report.reference} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-primary-600">{report.reference}</div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium">{report.product_name}</div>
                    </td>
                    <td className="table-cell">
                      {formatNumber(report.quantity_to_produce, 0)}
                    </td>
                    <td className="table-cell">
                      <div className={`font-medium ${
                        report.quantity_produced >= report.quantity_to_produce 
                          ? 'text-green-600' 
                          : 'text-yellow-600'
                      }`}>
                        {formatNumber(report.quantity_produced, 0)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${
                        report.state === 'done' ? 'badge-done' : 
                        report.state === 'in_progress' ? 'badge-in-progress' : 'badge-planned'
                      }`}>
                        {report.state === 'done' ? 'Completed' : 
                         report.state === 'in_progress' ? 'In Progress' : 'Planned'}
                      </span>
                    </td>
                    <td className="table-cell">
                      {formatTime(report.total_time)}
                    </td>
                    <td className="table-cell">
                      <div className={`font-medium ${
                        report.efficiency >= 90 ? 'text-green-600' :
                        report.efficiency >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {formatNumber(report.efficiency, 1)}%
                      </div>
                    </td>
                    <td className="table-cell">
                      {formatDate(report.created_at)}
                    </td>
                    <td className="table-cell">
                      {report.completed_at ? formatDate(report.completed_at) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
