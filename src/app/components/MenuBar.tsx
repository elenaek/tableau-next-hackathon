'use client';

import { useAuth } from '../context/AuthContext';
import {
  Hospital,
  BarChart3,
  Calendar,
  FileText,
  MessageSquare,
  ChevronDown,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function MenuBar() {
  const { authState, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      items: [
        { label: 'Overview', action: () => console.log('Overview') },
        { label: 'Health Metrics', action: () => console.log('Health Metrics') },
        { label: 'Progress Timeline', action: () => console.log('Progress Timeline') }
      ]
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      items: [
        { label: 'Upcoming', action: () => console.log('Upcoming') },
        { label: 'Past Visits', action: () => console.log('Past Visits') },
        { label: 'Schedule New', action: () => console.log('Schedule New') }
      ]
    },
    {
      id: 'records',
      label: 'Medical Records',
      icon: FileText,
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
      icon: MessageSquare,
      items: [
        { label: 'Care Team Messages', action: () => console.log('Care Team Messages') },
        { label: 'Send Message', action: () => console.log('Send Message') },
        { label: 'Notifications', action: () => console.log('Notifications') }
      ]
    }
  ];

  return (
    <div className="bg-background border-b shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - App title and navigation */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Hospital className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Patient Portal</h1>
          </div>

          {/* Menu Items */}
          <nav className="flex items-center space-x-2">
            {menuItems.map((menu) => {
              const IconComponent = menu.icon;
              return (
                <DropdownMenu key={menu.id}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm font-medium">{menu.label}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {menu.items.map((item, index) => (
                      <DropdownMenuItem key={index} onClick={item.action}>
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </nav>
        </div>

        {/* Right side - User info and logout */}
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Welcome,</span>{' '}
            <span className="font-medium text-foreground">{authState.username}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log('Profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Preferences')}>
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}