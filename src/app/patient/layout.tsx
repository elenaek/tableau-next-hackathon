'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  Map,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/context/AuthContext';
import { LOCAL_STORAGE_KEYS } from '@/lib/utils';
import { TourProvider, useTour } from '@/app/context/TourContext';

interface PatientLayoutContentProps {
  children: ReactNode;
}

function PatientLayoutContent({ children }: PatientLayoutContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { startTour, hasSeenTour } = useTour();

  // Initialize collapsed state from localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SIDEBAR_COLLAPSED);
      return saved === 'true';
    }
    return false;
  });

  // Persist collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SIDEBAR_COLLAPSED, isCollapsed.toString());
  }, [isCollapsed]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { href: '/', icon: Home, label: 'Dashboard', tooltip: 'Dashboard' },
    { href: '/patient/records', icon: FileText, label: 'Medical Records', tooltip: 'Medical Records' },
    { href: '/patient/vitals', icon: Activity, label: 'Vitals', tooltip: 'Vitals' },
    { href: '/patient/metrics', icon: BarChart2, label: 'Department Metrics', tooltip: 'Department Metrics' }
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 border-r bg-card flex flex-col`}>
        {/* Header with toggle button */}
        <div className={`${isCollapsed ? 'p-4' : 'p-6'} flex items-center justify-between`}>
          {!isCollapsed && <h2 className="text-2xl font-bold">Patient Portal</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={isCollapsed ? 'mx-auto' : ''}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className={`${isCollapsed ? 'px-2' : 'px-4'} pb-4 flex-1`}>
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full cursor-pointer active:scale-95 ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
                      title={isCollapsed ? item.tooltip : undefined}
                    >
                      <Icon className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4 mr-3'}`} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer with Tour and Logout buttons */}
        <div className={`mt-auto ${isCollapsed ? 'p-2' : 'p-4'} border-t space-y-2`}>
          {/* Tour Button */}
          <Button
            variant="outline"
            className={`w-full cursor-pointer active:scale-95 ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
            onClick={() => startTour()}
            title={isCollapsed ? 'Start Tour' : undefined}
          >
            <Map className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4 mr-3'}`} />
            {!isCollapsed && <span>Start Tour</span>}
          </Button>

          {/* Logout Button */}
          <Button
            variant="ghost"
            className={`w-full cursor-pointer active:scale-95 ${isCollapsed ? 'justify-center px-0' : 'justify-start text-red-500 hover:text-red-600'}`}
            onClick={handleLogout}
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className={`cursor-pointer ${isCollapsed ? 'h-5 w-5 text-red-500' : 'h-4 w-4 mr-3'}`} />
            {!isCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

interface PatientLayoutProps {
  children: ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  return (
    <TourProvider>
      <PatientLayoutContent>{children}</PatientLayoutContent>
    </TourProvider>
  );
}