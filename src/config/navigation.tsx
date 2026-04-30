import { AppRole } from '@/types/database';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  GraduationCap,
  Building2,
  FileText,
  MessageSquare,
  Settings,
  Shield,
  BarChart3,
  Bell,
  HelpCircle,
  ClipboardList,
  Heart,
  ClipboardCheck,
  Calendar,
  BookOpen,
  FileCheck,
  AlertTriangle,
  Activity,
  Search,
  Home,
  Briefcase,
  UserPlus,
  UserCheck,
  UserX,
  Layout,
  Globe,
  Archive,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: NavItem[];
  permission?: string;
  badge?: number | string;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

// Navigation configuration for each role
export const ROLE_NAVIGATION: Record<AppRole, NavSection[]> = {
  super_admin: [
    {
      id: 'platform',
      label: 'Platform',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
        { id: 'reports', label: 'Reports', icon: ClipboardList, href: '/dashboard/reports' },
      ],
    },
    {
      id: 'organisations',
      label: 'Organisations',
      items: [
        { id: 'agencies', label: 'Fostering Agencies', icon: Building2, href: '/dashboard/agencies' },
        { id: 'local-authorities', label: 'Local Authorities', icon: Globe, href: '/dashboard/local-authorities' },
        { id: 'trainers', label: 'Trainers', icon: GraduationCap, href: '/dashboard/trainers' },
      ],
    },
    {
      id: 'users',
      label: 'User Management',
      items: [
        { id: 'all-users', label: 'All Users', icon: Users, href: '/dashboard/users' },
        { id: 'invite-user', label: 'Invite User', icon: UserPlus, href: '/dashboard/users/invite' },
        { id: 'roles', label: 'Roles & Permissions', icon: Shield, href: '/dashboard/roles' },
      ],
    },
    {
      id: 'content',
      label: 'Content',
      items: [
        { id: 'pages', label: 'Pages', icon: FileText, href: '/dashboard/pages' },
        { id: 'directory', label: 'Agency Directory', icon: Search, href: '/dashboard/directory' },
      ],
    },
    {
      id: 'system',
      label: 'System',
      items: [
        { id: 'settings', label: 'Platform Settings', icon: Settings, href: '/dashboard/settings' },
        { id: 'audit-logs', label: 'Audit Logs', icon: Archive, href: '/dashboard/audit-logs' },
        { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
      ],
    },
  ],

  agency_admin: [
    {
      id: 'agency',
      label: 'Agency',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { id: 'overview', label: 'Overview', icon: Activity, href: '/dashboard/overview' },
        { id: 'compliance', label: 'Compliance', icon: ClipboardCheck, href: '/dashboard/compliance' },
      ],
    },
    {
      id: 'people',
      label: 'People',
      items: [
        { id: 'staff', label: 'Staff', icon: UserCog, href: '/dashboard/staff' },
        { id: 'foster-carers', label: 'Foster Carers', icon: Heart, href: '/dashboard/foster-carers' },
        { id: 'applicants', label: 'Applicants', icon: UserCheck, href: '/dashboard/applicants' },
        { id: 'invite', label: 'Invite User', icon: UserPlus, href: '/dashboard/invite' },
      ],
    },
    {
      id: 'operations',
      label: 'Operations',
      items: [
        { id: 'placements', label: 'Placements', icon: Home, href: '/dashboard/placements' },
        { id: 'enquiries', label: 'Enquiries', icon: MessageSquare, href: '/dashboard/enquiries' },
        { id: 'training', label: 'Training', icon: BookOpen, href: '/dashboard/training' },
      ],
    },
    {
      id: 'records',
      label: 'Records',
      items: [
        { id: 'documents', label: 'Documents', icon: FileText, href: '/dashboard/documents' },
        { id: 'logs', label: 'Daily Logs', icon: ClipboardList, href: '/dashboard/logs' },
        { id: 'incidents', label: 'Incidents', icon: AlertTriangle, href: '/dashboard/incidents' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      items: [
        { id: 'profile', label: 'Agency Profile', icon: Building2, href: '/dashboard/profile' },
        { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
        { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
      ],
    },
  ],

  agency_staff: [
    {
      id: 'work',
      label: 'My Work',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { id: 'my-carers', label: 'My Foster Carers', icon: Heart, href: '/dashboard/my-carers' },
        { id: 'my-applicants', label: 'My Applicants', icon: UserCheck, href: '/dashboard/my-applicants' },
      ],
    },
    {
      id: 'records',
      label: 'Records',
      items: [
        { id: 'supervision', label: 'Supervision Notes', icon: ClipboardList, href: '/dashboard/supervision' },
        { id: 'logs', label: 'Daily Logs', icon: FileText, href: '/dashboard/logs' },
        { id: 'incidents', label: 'Incidents', icon: AlertTriangle, href: '/dashboard/incidents' },
        { id: 'documents', label: 'Documents', icon: FileCheck, href: '/dashboard/documents' },
      ],
    },
    {
      id: 'training',
      label: 'Training',
      items: [
        { id: 'training', label: 'Training', icon: BookOpen, href: '/dashboard/training' },
        { id: 'my-training', label: 'My Training', icon: GraduationCap, href: '/dashboard/my-training' },
      ],
    },
    {
      id: 'communication',
      label: 'Communication',
      items: [
        { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
        { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
      ],
    },
  ],

  foster_carer: [
    {
      id: 'home',
      label: 'Home',
      items: [
        { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      ],
    },
    {
      id: 'care',
      label: 'My Care',
      items: [
        { id: 'placements', label: 'My Placements', icon: Home, href: '/dashboard/placements' },
        { id: 'daily-log', label: 'Daily Log', icon: ClipboardList, href: '/dashboard/daily-log' },
        { id: 'medications', label: 'Medications', icon: Heart, href: '/dashboard/medications' },
        { id: 'contacts', label: 'Contact Records', icon: Users, href: '/dashboard/contacts' },
        { id: 'appointments', label: 'Appointments', icon: Calendar, href: '/dashboard/appointments' },
      ],
    },
    {
      id: 'development',
      label: 'Development',
      items: [
        { id: 'training', label: 'Training', icon: BookOpen, href: '/dashboard/training' },
        { id: 'my-qualifications', label: 'Qualifications', icon: GraduationCap, href: '/dashboard/qualifications' },
      ],
    },
    {
      id: 'admin',
      label: 'Admin',
      items: [
        { id: 'documents', label: 'Documents', icon: FileText, href: '/dashboard/documents' },
        { id: 'expenses', label: 'Expenses', icon: Briefcase, href: '/dashboard/expenses' },
        { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
        { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
        { id: 'profile', label: 'My Profile', icon: UserCog, href: '/dashboard/profile' },
      ],
    },
  ],

  applicant: [
    {
      id: 'home',
      label: 'Home',
      items: [
        { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      ],
    },
    {
      id: 'application',
      label: 'My Application',
      items: [
        { id: 'progress', label: 'Application Progress', icon: ClipboardCheck, href: '/dashboard/application' },
        { id: 'documents', label: 'Documents', icon: FileText, href: '/dashboard/documents' },
        { id: 'book-call', label: 'Book a Call', icon: Calendar, href: '/dashboard/book-call' },
      ],
    },
    {
      id: 'resources',
      label: 'Resources',
      items: [
        { id: 'training', label: 'Preparation Training', icon: BookOpen, href: '/dashboard/training' },
        { id: 'faq', label: 'FAQ', icon: HelpCircle, href: '/dashboard/faq' },
      ],
    },
    {
      id: 'contact',
      label: 'Contact',
      items: [
        { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
        { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
      ],
    },
  ],

  trainer: [
    {
      id: 'home',
      label: 'Home',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      ],
    },
    {
      id: 'training',
      label: 'Training',
      items: [
        { id: 'sessions', label: 'Sessions', icon: BookOpen, href: '/dashboard/sessions' },
        { id: 'create-session', label: 'Create Session', icon: Plus, href: '/dashboard/sessions/new' },
        { id: 'materials', label: 'Materials', icon: FileText, href: '/dashboard/materials' },
        { id: 'certificates', label: 'Certificates', icon: FileCheck, href: '/dashboard/certificates' },
      ],
    },
    {
      id: 'clients',
      label: 'Clients',
      items: [
        { id: 'bookings', label: 'Bookings', icon: Calendar, href: '/dashboard/bookings' },
        { id: 'agencies', label: 'Agencies', icon: Building2, href: '/dashboard/agencies' },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      items: [
        { id: 'profile', label: 'Profile', icon: UserCog, href: '/dashboard/profile' },
        { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
        { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
      ],
    },
  ],

  local_authority: [
    {
      id: 'home',
      label: 'Home',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      ],
    },
    {
      id: 'placements',
      label: 'Placements',
      items: [
        { id: 'requests', label: 'Placement Requests', icon: Home, href: '/dashboard/requests' },
        { id: 'new-request', label: 'New Request', icon: Plus, href: '/dashboard/requests/new' },
        { id: 'responses', label: 'Agency Responses', icon: Building2, href: '/dashboard/responses' },
      ],
    },
    {
      id: 'search',
      label: 'Search',
      items: [
        { id: 'directory', label: 'Agency Directory', icon: Search, href: '/dashboard/directory' },
      ],
    },
    {
      id: 'contact',
      label: 'Contact',
      items: [
        { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
        { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
      ],
    },
  ],

  auditor: [
    {
      id: 'home',
      label: 'Home',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      ],
    },
    {
      id: 'review',
      label: 'Review',
      items: [
        { id: 'agencies', label: 'Agencies', icon: Building2, href: '/dashboard/agencies' },
        { id: 'foster-carers', label: 'Foster Carers', icon: Heart, href: '/dashboard/foster-carers' },
        { id: 'training', label: 'Training', icon: BookOpen, href: '/dashboard/training' },
        { id: 'documents', label: 'Documents', icon: FileText, href: '/dashboard/documents' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      items: [
        { id: 'logs', label: 'Audit Logs', icon: Archive, href: '/dashboard/audit-logs' },
        { id: 'reports', label: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
      ],
    },
  ],
};

// Helper to flatten navigation
export function flattenNavigation(nav: NavSection[]): NavItem[] {
  const items: NavItem[] = [];
  for (const section of nav) {
    for (const item of section.items) {
      items.push(item);
      if (item.children) {
        items.push(...item.children);
      }
    }
  }
  return items;
}

// Get navigation for a role
export function getNavigationForRole(role: AppRole | null): NavSection[] {
  if (!role || !ROLE_NAVIGATION[role]) {
    return [];
  }
  return ROLE_NAVIGATION[role];
}

// Plus icon for create actions
function Plus({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}