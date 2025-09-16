'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MenuBar() {
  const { authState, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    setActiveMenu(null);
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      items: [
        { label: 'Overview', action: () => console.log('Overview') },
        { label: 'Health Metrics', action: () => console.log('Health Metrics') },
        { label: 'Progress Timeline', action: () => console.log('Progress Timeline') }
      ]
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: '📅',
      items: [
        { label: 'Upcoming', action: () => console.log('Upcoming') },
        { label: 'Past Visits', action: () => console.log('Past Visits') },
        { label: 'Schedule New', action: () => console.log('Schedule New') }
      ]
    },
    {
      id: 'records',
      label: 'Medical Records',
      icon: '📋',
      items: [
        { label: 'Lab Results', action: () => console.log('Lab Results') },
        { label: 'Imaging', action: () => console.log('Imaging') },
        { label: 'Medications', action: () => console.log('Medications') },
        { label: 'Discharge Summary', action: () => console.log('Discharge Summary') }
      ]
    },
    {
      id: 'communication',
      label: 'Messages',
      icon: '💬',
      items: [
        { label: 'Care Team Messages', action: () => console.log('Care Team Messages') },
        { label: 'Send Message', action: () => console.log('Send Message') },
        { label: 'Notifications', action: () => console.log('Notifications') }
      ]
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - App title and navigation */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🏥</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Patient Portal</h1>
          </div>

          {/* Menu Items */}
          <nav className="flex items-center space-x-6">
            {menuItems.map((menu) => (
              <div key={menu.id} className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === menu.id ? null : menu.id)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <span>{menu.icon}</span>
                  <span className="text-sm font-medium">{menu.label}</span>
                  <span className="text-xs text-gray-400">▼</span>
                </button>

                {/* Dropdown Menu */}
                {activeMenu === menu.id && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setActiveMenu(null)}
                    />
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
                      <div className="py-2">
                        {menu.items.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              item.action();
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right side - User info and logout */}
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-gray-500">Welcome,</span>{' '}
            <span className="font-medium text-gray-900">{authState.username}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'user' ? null : 'user')}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
              <span className="text-xs text-gray-400">▼</span>
            </button>

            {/* User Dropdown */}
            {activeMenu === 'user' && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setActiveMenu(null)}
                />
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        console.log('Profile');
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        console.log('Preferences');
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Preferences
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}