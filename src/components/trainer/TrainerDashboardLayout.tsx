/**
 * Trainer Dashboard Layout
 * Dashboard for training providers and experts
 */

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Menu,
  X,
  Award,
  Clock,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TRAINER_TABS = [
  {
    label: 'Dashboard',
    tabs: [
      { id: 'tr-dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Training',
    tabs: [
      { id: 'tr-courses', label: 'Courses', icon: BookOpen },
      { id: 'tr-sessions', label: 'Sessions', icon: Calendar },
      { id: 'tr-materials', label: 'Materials', icon: FileText },
    ],
  },
  {
    label: 'Attendees',
    tabs: [
      { id: 'tr-attendees', label: 'Attendees', icon: Users },
      { id: 'tr-progress', label: 'Progress', icon: BarChart3 },
    ],
  },
  {
    label: 'Communication',
    tabs: [
      { id: 'tr-messages', label: 'Messages', icon: MessageSquare },
    ],
  },
  {
    label: 'Settings',
    tabs: [
      { id: 'tr-settings', label: 'Settings', icon: Settings },
    ],
  },
];

const PAGE_TITLES: Record<string, { title: string; description?: string }> = {
  'tr-dashboard': { title: 'Dashboard', description: 'Your training overview' },
  'tr-courses': { title: 'Courses', description: 'Manage your training courses' },
  'tr-sessions': { title: 'Sessions', description: 'Training sessions and schedules' },
  'tr-materials': { title: 'Materials', description: 'Training materials and resources' },
  'tr-attendees': { title: 'Attendees', description: 'Manage course attendees' },
  'tr-progress': { title: 'Progress', description: 'Track attendee progress' },
  'tr-messages': { title: 'Messages', description: 'Communications' },
  'tr-settings': { title: 'Settings', description: 'Account preferences' },
};

interface TrainerDashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TrainerDashboardLayout({ children, activeTab, onTabChange }: TrainerDashboardLayoutProps) {
  const { user, profile, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pageInfo = PAGE_TITLES[activeTab] || { title: 'Dashboard' };

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 w-5" /> : <Menu className="w-5 w-5" />}
        </Button>
        <span className="font-semibold">Trainer Portal</span>
        <div className="w-10" />
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 overflow-hidden',
          'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
          sidebarCollapsed ? 'w-16' : 'w-64',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-bold truncate">Trainer</h1>
              <p className="text-xs text-slate-400 truncate">Portal</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          {TRAINER_TABS.map((group) => (
            <div key={group.label} className="mb-4">
              {!sidebarCollapsed && (
                <div className="px-4 mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-1 px-2">
                {group.tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                        sidebarCollapsed && 'justify-center'
                      )}
                      title={sidebarCollapsed ? tab.label : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{tab.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Collapse Button */}
        <div className="hidden lg:block border-t border-slate-700 p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full justify-center text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* User Section */}
        <div className="border-t border-slate-700 p-4">
          {sidebarCollapsed ? (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {profile?.full_name?.[0] || 'T'}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleTabChange('tr-settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {profile?.full_name?.[0] || 'T'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {profile?.full_name || 'Trainer'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">Trainer</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTabChange('tr-settings')}
                  className="flex-1 text-slate-400 hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-slate-400 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          'min-h-screen transition-all duration-300 pt-14 lg:pt-0',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-background border-b px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{pageInfo.title}</h2>
              {pageInfo.description && (
                <p className="text-sm text-muted-foreground">{pageInfo.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export { TRAINER_TABS, PAGE_TITLES };