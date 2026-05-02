/**
 * Foster Carer Dashboard
 * Main dashboard page for foster carers
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import FosterCarerDashboardLayout, { PAGE_TITLES } from './FosterCarerDashboardLayout';
import DailyLogsSection from './DailyLogsSection';
import IncidentsSection from './IncidentsSection';
import MedicationSection from './MedicationSection';
import DocumentsSection from './DocumentsSection';
import TrainingSection from './TrainingSection';
import MessagesSection from './MessagesSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ClipboardList,
  Heart,
  Calendar,
  Pill,
  AlertTriangle,
  FileText,
  GraduationCap,
  Receipt,
  MessageSquare,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function FosterCarerDashboard() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'fc-dashboard';

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'fc-dashboard':
        return <FosterCarerDashboardOverview profile={profile} />;
      case 'fc-daily-logs':
        return <DailyLogsSection />;
      case 'fc-child-profile':
        return <ChildProfileSection />;
      case 'fc-calendar':
        return <CalendarSection />;
      case 'fc-medication':
        return <MedicationSection />;
      case 'fc-incidents':
        return <IncidentsSection />;
      case 'fc-documents':
        return <DocumentsSection />;
      case 'fc-training':
        return <TrainingSection />;
      case 'fc-expenses':
        return <ExpensesSection />;
      case 'fc-messages':
        return <MessagesSection />;
      case 'fc-support':
        return <SupportSection />;
      case 'fc-settings':
        return <SettingsSection />;
      default:
        return <FosterCarerDashboardOverview profile={profile} />;
    }
  };

  return (
    <FosterCarerDashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderContent()}
    </FosterCarerDashboardLayout>
  );
}

function FosterCarerDashboardOverview({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {profile?.full_name || 'Foster Carer'}!</h2>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your fostering placement today.
              </p>
            </div>
            <Button>
              <ClipboardList className="w-4 h-4 mr-2" />
              Submit Daily Log
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          title="Days in Placement"
          value="45"
          subtitle="Current placement"
          icon={Clock}
          trend="+3 this week"
        />
        <QuickStatCard
          title="Pending Tasks"
          value="2"
          subtitle="Requires attention"
          icon={AlertCircle}
          trend="urgent"
          variant="warning"
        />
        <QuickStatCard
          title="Training Progress"
          value="65%"
          subtitle="Completed"
          icon={GraduationCap}
          trend="+10% this month"
        />
        <QuickStatCard
          title="Unread Messages"
          value="3"
          subtitle="From agency"
          icon={MessageSquare}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="Submit Daily Log"
          description="Record today's activities and observations"
          icon={ClipboardList}
          href="?tab=fc-daily-logs"
        />
        <QuickActionCard
          title="Log Medication"
          description="Record any medication given today"
          icon={Pill}
          href="?tab=fc-medication"
        />
        <QuickActionCard
          title="Report Incident"
          description="Report any incidents or concerns"
          icon={AlertTriangle}
          href="?tab=fc-incidents"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your placement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ActivityItem
              title="Daily log submitted"
              description="Daily activities and observations recorded"
              time="2 hours ago"
              status="completed"
            />
            <ActivityItem
              title="Medication log updated"
              description="Paracetamol 500mg given at 8:00 AM"
              time="4 hours ago"
              status="completed"
            />
            <ActivityItem
              title="School attendance confirmed"
              description="Attended local primary school"
              time="Yesterday"
              status="completed"
            />
            <ActivityItem
              title="Training module completed"
              description="Completed Safeguarding Children"
              time="2 days ago"
              status="completed"
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
          <AlertCircle className="w-4 h-4 text-yellow-600" />
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

function ChildProfileSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Child Profile</CardTitle>
        <CardDescription>Current placement information</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Child profile information would be displayed here.</p>
      </CardContent>
    </Card>
  );
}

function CalendarSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>Appointments and important dates</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Calendar view would be here.</p>
      </CardContent>
    </Card>
  );
}

function MedicationSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication Log</CardTitle>
        <CardDescription>Track medication administration</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Medication logging form would be here.</p>
      </CardContent>
    </Card>
  );
}

function DocumentsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>Access important documents</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Document list would be listed here.</p>
      </CardContent>
    </Card>
  );
}

function TrainingSectionPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training</CardTitle>
        <CardDescription>Your training progress and courses</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Training progress would be shown here.</p>
      </CardContent>
    </Card>
  );
}

function ExpensesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
        <CardDescription>Submit expenses for reimbursement</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Expense submission form would be here.</p>
      </CardContent>
    </Card>
  );
}

function MessagesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>Messages from your agency</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Messages would be listed here.</p>
      </CardContent>
    </Card>
  );
}

function SupportSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support</CardTitle>
        <CardDescription>Get help and support</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Support options would be shown here.</p>
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
        <p className="text-muted-foreground">Settings options would be shown here.</p>
      </CardContent>
    </Card>
  );
}