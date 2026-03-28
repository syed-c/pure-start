/**
 * Agency Dashboard Layout v2
 * Modern, responsive layout with sidebar, topbar, and content area
 */

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import DentistSidebar from './DentistSidebar';
import DentistTopBar from './DentistTopBar';

const PAGE_TITLES: Record<string, { title: string; description?: string }> = {
  'my-dashboard': { title: 'Dashboard', description: 'Your agency at a glance' },
  'my-practice': { title: 'My Agency', description: 'Agency details and performance' },
  'my-appointments': { title: 'Enquiries', description: 'Manage your enquiries' },
  'my-availability': { title: 'Availability', description: 'Set your working hours' },
  'my-appointment-types': { title: 'Enquiry Types', description: 'Configure enquiry types' },
  'my-patients': { title: 'Carers', description: 'Carer records and history' },
  'my-messages': { title: 'Messages', description: 'Carer communications' },
  'my-intake-forms': { title: 'Application Forms', description: 'Carer application management' },
  'my-operations': { title: 'Automation', description: 'Automated workflows' },
  'my-profile': { title: 'Edit Profile', description: 'Update your agency profile' },
  'my-team': { title: 'Team', description: 'Manage team members' },
  'my-services': { title: 'Fostering Types', description: 'Types of fostering you offer' },
  'my-insurance': { title: 'Regulations', description: 'Ofsted and regulatory info' },
  'my-reputation': { title: 'Reputation Suite', description: 'Reviews and reputation management' },
  'my-templates': { title: 'Templates', description: 'Message templates' },
  'my-settings': { title: 'Settings', description: 'Account preferences' },
  'my-support': { title: 'Support', description: 'Get help and support' },
};

interface AgencyDashboardLayoutV2Props {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function AgencyDashboardLayoutV2({ children, activeTab, onTabChange }: AgencyDashboardLayoutV2Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pageInfo = PAGE_TITLES[activeTab] || { title: 'Dashboard' };

  const getBreadcrumbs = () => {
    const crumbs: { label: string; onClick?: () => void }[] = [
      { label: 'Dashboard', onClick: () => onTabChange('my-dashboard') },
    ];
    if (activeTab.startsWith('my-') && activeTab !== 'my-dashboard') {
      const section = getSection(activeTab);
      if (section) crumbs.push({ label: section });
    }
    return crumbs;
  };

  const getSection = (tabId: string): string | null => {
    const operationsTabs = ['my-appointments', 'my-availability', 'my-appointment-types', 'my-patients', 'my-messages', 'my-intake-forms', 'my-operations'];
    const profileTabs = ['my-profile', 'my-team', 'my-services', 'my-insurance'];
    const settingsTabs = ['my-settings', 'my-support'];
    if (operationsTabs.includes(tabId)) return 'Operations';
    if (profileTabs.includes(tabId)) return 'Profile';
    if (tabId === 'my-reputation') return 'Reputation';
    if (tabId === 'my-templates') return 'Communication';
    if (settingsTabs.includes(tabId)) return 'Settings';
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <DentistSidebar activeTab={activeTab} onTabChange={onTabChange} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <div className={cn('min-h-screen transition-all duration-300 ease-out', sidebarCollapsed ? 'ml-[72px]' : 'ml-64')}>
        <DentistTopBar pageTitle={pageInfo.title} pageDescription={pageInfo.description} breadcrumbs={getBreadcrumbs()} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}