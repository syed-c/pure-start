/**
 * Applicant Dashboard
 * Main dashboard page for prospective foster carers (applicants)
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ApplicantDashboardLayout, { PAGE_TITLES, APPLICATION_STAGES } from './ApplicantDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ClipboardList,
  UserCheck,
  FileText,
  GraduationCap,
  MessageSquare,
  Phone,
  Clock,
  CheckCircle,
  Circle,
  ArrowRight,
  AlertCircle,
  Heart
} from 'lucide-react';

export default function ApplicantDashboard() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'app-dashboard';

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'app-dashboard':
        return <ApplicantDashboardOverview profile={profile} />;
      case 'app-progress':
        return <ProgressSection />;
      case 'app-forms':
        return <FormsSection />;
      case 'app-documents':
        return <DocumentsSection />;
      case 'app-training':
        return <TrainingSection />;
      case 'app-requirements':
        return <RequirementsSection />;
      case 'app-messages':
        return <MessagesSection />;
      case 'app-contact':
        return <ContactSection />;
      case 'app-settings':
        return <SettingsSection />;
      default:
        return <ApplicantDashboardOverview profile={profile} />;
    }
  };

  return (
    <ApplicantDashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderContent()}
    </ApplicantDashboardLayout>
  );
}

function ApplicantDashboardOverview({ profile }: { profile: any }) {
  const currentStage = 'assessment';

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome, {profile?.full_name || 'Applicant'}!</h2>
              <p className="text-muted-foreground mt-1">
                Welcome to your fostering application journey. Here's your current status.
              </p>
            </div>
            <Button>
              <UserCheck className="w-4 h-4 mr-2" />
              View Application
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Application Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Application Progress</CardTitle>
          <CardDescription>Track your journey to becoming an approved foster carer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {APPLICATION_STAGES.map((stage, index) => {
              const isComplete = APPLICATION_STAGES.findIndex(s => s.id === currentStage) > index;
              const isCurrent = stage.id === currentStage;
              return (
                <div key={stage.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isComplete
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isCurrent ? (
                        <Circle className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    {index < APPLICATION_STAGES.length - 1 && (
                      <div
                        className={`w-0.5 h-12 ${
                          isComplete ? 'bg-green-500' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                      {stage.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="Complete Application Form"
          description="Fill in your application details"
          icon={FileText}
          href="?tab=app-forms"
        />
        <QuickActionCard
          title="Upload Documents"
          description="Submit required documents"
          icon={UserCheck}
          href="?tab=app-documents"
        />
        <QuickActionCard
          title="View Requirements"
          description="Check what's needed"
          icon={ClipboardList}
          href="?tab=app-requirements"
        />
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Your Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <NextStepItem
              title="Complete medical form"
              description="Your medical examination form is pending"
              urgent
            />
            <NextStepItem
              title="Attend preparation course"
              description="Book your TSD (Therapeutic Skills Development) course"
              urgent
            />
            <NextStepItem
              title="Provide references"
              description="Two character references required"
            />
          </div>
        </CardContent>
      </Card>

      {/* Helpful Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Helpful Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResourceCard
              title="Guide to Fostering"
              description="Learn about what to expect"
            />
            <ResourceCard
              title="Training Requirements"
              description="Mandatory courses explained"
            />
          </div>
        </CardContent>
      </Card>
    </div>
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

function NextStepItem({ title, description, urgent }: {
  title: string;
  description: string;
  urgent?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className={`p-2 rounded-full ${urgent ? 'bg-yellow-100' : 'bg-primary/10'}`}>
        {urgent ? (
          <AlertCircle className="w-4 h-4 text-yellow-600" />
        ) : (
          <Circle className="w-4 h-4 text-primary" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" size="sm">
        Complete
      </Button>
    </div>
  );
}

function ResourceCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
      <CardContent className="pt-4">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ProgressSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Progress</CardTitle>
        <CardDescription>Track your application status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Application Progress</span>
              <span>45%</span>
            </div>
            <Progress value={45} />
          </div>
          <div className="space-y-2 mt-4">
            <ProgressItem label="Enquiry" complete />
            <ProgressItem label="Initial Checks" complete />
            <ProgressItem label="Assessment" inProgress />
            <ProgressItem label="Panel Review" />
            <ProgressItem label="Approval" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressItem({ label, complete, inProgress }: { label: string; complete?: boolean; inProgress?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {complete ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : inProgress ? (
        <Circle className="w-4 h-4 text-primary" />
      ) : (
        <Circle className="w-4 h-4 text-muted" />
      )}
      <span className={complete || inProgress ? '' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}

function FormsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Forms</CardTitle>
        <CardDescription>Complete all required forms</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Form completion interface would be here.</p>
      </CardContent>
    </Card>
  );
}

function DocumentsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>Upload required documents</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Document upload interface would be here.</p>
      </CardContent>
    </Card>
  );
}

function TrainingSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training</CardTitle>
        <CardDescription>Complete required training</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Training progress would be shown here.</p>
      </CardContent>
    </Card>
  );
}

function RequirementsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requirements</CardTitle>
        <CardDescription>Check what you need to provide</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Requirements list would be here.</p>
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

function ContactSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Agency</CardTitle>
        <CardDescription>Get in touch with your assigned agency</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Contact form would be here.</p>
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