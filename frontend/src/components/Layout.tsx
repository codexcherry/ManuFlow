import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Menu,
  X,
  Home,
  Package,
  Settings,
  Users,
  FileText,
  BarChart3,
  LogOut,
  User,
  ClipboardList,
  Factory,
  Boxes,
  TrendingUp,
  Layers,
  ChevronDown,
} from 'lucide-react';

const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/manufacturing-orders', icon: ClipboardList, label: 'Manufacturing Orders' },
    { path: '/work-orders', icon: Settings, label: 'Work Orders' },
    { path: '/work-centers', icon: Factory, label: 'Work Centers' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/bom', icon: Layers, label: 'Bill of Materials' },
    { path: '/stock-ledger', icon: Boxes, label: 'Stock Ledger' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-gray-900 text-white shadow-md">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <span className="ml-2 text-xl font-bold">ManuFlow</span>
            </div>
            
            {/* Desktop Navigation - Left Side */}
            <div className="hidden md:flex flex-1 items-center justify-start ml-10">
              <nav className="flex space-x-4">
                {menuItems.map((item) => {
                  const isActive = isActivePath(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-1" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            {/* User Profile - Right Side */}
            <div className="flex items-center">
              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center text-sm font-medium text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white rounded-lg p-1"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center mr-2">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block">{user?.username}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>

                {profileMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setProfileMenuOpen(false)}
                      aria-hidden="true"
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setProfileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/reports');
                          setProfileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        My Reports
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden ml-4">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  aria-expanded={mobileMenuOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile menu */}
          <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => {
                const isActive = isActivePath(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} ManuFlow. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <button className="text-sm text-gray-500 hover:text-gray-700">Help</button>
              <button className="text-sm text-gray-500 hover:text-gray-700">Privacy</button>
              <button className="text-sm text-gray-500 hover:text-gray-700">Terms</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;