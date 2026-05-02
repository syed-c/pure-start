/**
 * Trainer Dashboard
 * Main dashboard page for training providers and experts
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import TrainerDashboardLayout, { PAGE_TITLES } from './TrainerDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Calendar,
  Users,
  GraduationCap,
  MessageSquare,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  FileText,
  BarChart3
} from 'lucide-react';

export default function TrainerDashboard() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'tr-dashboard';

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'tr-dashboard':
        return <TrainerDashboardOverview profile={profile} />;
      case 'tr-courses':
        return <CoursesSection />;
      case 'tr-sessions':
        return <SessionsSection />;
      case 'tr-materials':
        return <MaterialsSection />;
      case 'tr-attendees':
        return <AttendeesSection />;
      case 'tr-progress':
        return <ProgressSection />;
      case 'tr-messages':
        return <MessagesSection />;
      case 'tr-settings':
        return <SettingsSection />;
      default:
        return <TrainerDashboardOverview profile={profile} />;
    }
  };

  return (
    <TrainerDashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderContent()}
    </TrainerDashboardLayout>
  );
}

function TrainerDashboardOverview({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {profile?.full_name || 'Trainer'}!</h2>
              <p className="text-muted-foreground mt-1">
                Here's your training overview for today.
              </p>
            </div>
            <Button>
              <BookOpen className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          title="Active Courses"
          value="8"
          subtitle="Currently running"
          icon={BookOpen}
        />
        <QuickStatCard
          title="Total Attendees"
          value="156"
          subtitle="Enrolled"
          icon={Users}
          trend="+12 this month"
        />
        <QuickStatCard
          title="Sessions This Week"
          value="5"
          subtitle="Scheduled"
          icon={Calendar}
        />
        <QuickStatCard
          title="Completion Rate"
          value="92%"
          subtitle="Average"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="Add New Course"
          description="Create a new training course"
          icon={BookOpen}
          href="?tab=tr-courses"
        />
        <QuickActionCard
          title="Schedule Session"
          description="Book a training session"
          icon={Calendar}
          href="?tab=tr-sessions"
        />
        <QuickActionCard
          title="Upload Materials"
          description="Add training materials"
          icon={FileText}
          href="?tab=tr-materials"
        />
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>Your scheduled training sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SessionItem
              title="Safeguarding Children"
              date="Tomorrow, 10:00 AM"
              attendees="12 enrolled"
              status="confirmed"
            />
            <SessionItem
              title="Therapeutic Care Techniques"
              date="Wed, 2:00 PM"
              attendees="8 enrolled"
              status="confirmed"
            />
            <SessionItem
              title="First Aid Training"
              date="Fri, 9:00 AM"
              attendees="15 enrolled"
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

function SessionItem({ title, date, attendees, status }: {
  title: string;
  date: string;
  attendees: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{date} • {attendees}</p>
      </div>
      <Badge variant={status === 'confirmed' ? 'default' : 'secondary'}>
        {status}
      </Badge>
    </div>
  );
}

function CoursesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Courses</CardTitle>
        <CardDescription>Manage your training courses</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Course management interface would be here.</p>
      </CardContent>
    </Card>
  );
}

function SessionsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription>Training sessions and schedules</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Session scheduling would be shown here.</p>
      </CardContent>
    </Card>
  );
}

function MaterialsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Materials</CardTitle>
        <CardDescription>Training materials and resources</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Material management would be here.</p>
      </CardContent>
    </Card>
  );
}

function AttendeesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendees</CardTitle>
        <CardDescription>Manage course attendees</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Attendee management would be here.</p>
      </CardContent>
    </Card>
  );
}

function ProgressSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress</CardTitle>
        <CardDescription>Track attendee progress</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Progress tracking would be shown here.</p>
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