'use client';

import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import PatientDashboard from './patient/dashboard/page';
import PatientLayout from './patient/layout';

export default function Home() {
  const { authState, login, isLoading } = useAuth();
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (username: string, password: string) => {
    setLoginError('');
    const success = await login(username, password);
    if (!success) {
      setLoginError('Invalid username or password. Please try again.');
    }
  };

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!authState.isAuthenticated) {
    return <LoginForm onLogin={handleLogin} error={loginError} />;
  }

  // Show patient dashboard when authenticated
  return (
    <PatientLayout>
      <PatientDashboard />
    </PatientLayout>
  );
}