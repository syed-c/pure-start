/**
 * Local Authority Dashboard
 * Main dashboard page for local authority officers
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LADashboardLayout, { PAGE_TITLES } from './LADashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Users,
  Home,
  Calendar,
  Search,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Clock,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  FileText
} from 'lucide-react';

export default function LADashboard() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'la-dashboard';

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'la-dashboard':
        return <LADashboardOverview profile={profile} />;
      case 'la-search':
        return <SearchSection />;
      case 'la-placements':
        return <PlacementsSection />;
      case 'la-requests':
        return <RequestsSection />;
      case 'la-children':
        return <ChildrenSection />;
      case 'la-reports':
        return <ReportsSection />;
      case 'la-alerts':
        return <AlertsSection />;
      case 'la-messages':
        return <MessagesSection />;
      case 'la-settings':
        return <SettingsSection />;
      default:
        return <LADashboardOverview profile={profile} />;
    }
  };

  return (
    <LADashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderContent()}
    </LADashboardLayout>
  );
}

function LADashboardOverview({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome, {profile?.full_name || 'Officer'}!</h2>
              <p className="text-muted-foreground mt-1">
                Here's your looked after children overview.
              </p>
            </div>
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Find Placement
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          title="Looked After Children"
          value="342"
          subtitle="In care"
          icon={Users}
        />
        <QuickStatCard
          title="Active Placements"
          value="289"
          subtitle="With foster carers"
          icon={Home}
        />
        <QuickStatCard
          title="Pending Requests"
          value="18"
          subtitle="Awaiting match"
          icon={Calendar}
          variant="warning"
        />
        <QuickStatCard
          title="Review Due"
          value="24"
          subtitle="This month"
          icon={FileText}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="Search Placements"
          description="Find available foster homes"
          icon={Search}
          href="?tab=la-search"
        />
        <QuickActionCard
          title="View Requests"
          description="Manage placement requests"
          icon={Calendar}
          href="?tab=la-requests"
        />
        <QuickActionCard
          title="Run Reports"
          description="Generate monitoring reports"
          icon={BarChart3}
          href="?tab=la-reports"
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest placement activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ActivityItem
              title="New placement match"
              description="Child 1234 placed with Family 567"
              time="2 hours ago"
              status="completed"
            />
            <ActivityItem
              title="Review completed"
              description="Review for Child 890 completed"
              time="Yesterday"
              status="completed"
            />
            <ActivityItem
              title="Placement request"
              description="New request for emergency placement"
              time="Yesterday"
              status="pending"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickStatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  trend?: string;
  variant?: 'default' | 'warning' | 'success';
}) {
  const variantClasses = {
    default: '',
    warning: 'border-l-yellow-500',
    success: 'border-l-green-500',
  };

  return (
    <Card className={`border-l-4 ${variantClasses[variant]}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-2">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ title, description, icon: Icon, href }: {
  title: string;
  description: string;
  icon: any;
  href: string;
}) {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
      <CardContent className="pt-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ title, description, time, status }: {
  title: string;
  description: string;
  time: string;
  status: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2 bg-primary/10 rounded-full">
        {status === 'completed' ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <Clock className="w-4 h-4 text-yellow-600" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  );
}

function SearchSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Placements</CardTitle>
        <CardDescription>Search for available foster placements</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Placement search interface would be here.</p>
      </CardContent>
    </Card>
  );
}

function PlacementsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Placements</CardTitle>
        <CardDescription>Current placement overview</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Active placements would be listed here.</p>
      </CardContent>
    </Card>
  );
}

function RequestsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Placement Requests</CardTitle>
        <CardDescription>Manage placement requests</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Placement requests would be shown here.</p>
      </CardContent>
    </Card>
  );
}

function ChildrenSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Looked After Children</CardTitle>
        <CardDescription>Children in care</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Children in care would be shown here.</p>
      </CardContent>
    </Card>
  );
}

function ReportsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>Monitoring reports</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Reports interface would be here.</p>
      </CardContent>
    </Card>
  );
}

function AlertsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
        <CardDescription>Alerts and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Alerts would be shown here.</p>
      </CardContent>
    </Card>
  );
}

function MessagesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>Communications</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Messages would be shown here.</p>
      </CardContent>
    </Card>
  );
}

function SettingsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Account preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Settings would be shown here.</p>
      </CardContent>
    </Card>
  );
}