'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/context/AuthContext';

interface PatientLayoutProps {
  children: ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { href: '/', icon: Home, label: 'Dashboard', tooltip: 'Dashboard' },
    { href: '/patient/records', icon: FileText, label: 'Medical Records', tooltip: 'Medical Records' },
    { href: '/patient/vitals', icon: Activity, label: 'Vitals', tooltip: 'Vitals' },
    { href: '/patient/messages', icon: MessageSquare, label: 'Messages', tooltip: 'Messages' },
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
                      className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
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

        {/* Footer */}
        <div className={`mt-auto ${isCollapsed ? 'p-2' : 'p-4'} border-t`}>
          <Link href="/patient/settings">
            <Button
              variant="ghost"
              className={`w-full mb-2 ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
              title={isCollapsed ? 'Settings' : undefined}
            >
              <Settings className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4 mr-3'}`} />
              {!isCollapsed && <span>Settings</span>}
            </Button>
          </Link>
          <Button
            variant="ghost"
            className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start text-red-500 hover:text-red-600'}`}
            onClick={handleLogout}
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className={`${isCollapsed ? 'h-5 w-5 text-red-500' : 'h-4 w-4 mr-3'}`} />
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