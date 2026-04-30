/**
 * Agency Dashboard V2 Tab
 * Wrapper component that uses the new v2 layout and components
 * Foster Care — UK Fostering Agency Directory
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AgencyDashboardLayoutV2 from './AgencyDashboardLayoutV2';
import DashboardOverviewV2 from './DashboardOverviewV2';
import MyPracticePage from './MyPracticePage';
import AppointmentsPageV2 from './AppointmentsPageV2';

// Import existing tabs that we're keeping
import AvailabilityManagementTab from '@/components/dentist/AvailabilityManagementTab';
import AppointmentTypesTab from '@/components/dentist/AppointmentTypesTab';
import PatientsTab from '@/components/dentist/PatientsTab';
import MessagesTab from '@/components/dentist/MessagesTab';
import IntakeFormsTab from '@/components/dentist/IntakeFormsTab';
import OperationsTab from '@/components/dentist/OperationsTab';
import ProfileEditorTab from '@/components/dentist/ProfileEditorTab';
import TeamManagementTab from '@/components/dentist/TeamManagementTab';
import ServicesTab from '@/components/dentist/ServicesTab';
import InsuranceManagementTab from '@/components/dentist/InsuranceManagementTab';
import AgencyReputationHub from '@/components/reputation/DentistReputationHub';
import TemplatesTab from '@/components/dentist/TemplatesTab';
import AgencySettingsTab from '@/components/dentist/DentistSettingsTab';
import SupportTicketsTab from '@/components/dentist/SupportTicketsTab';
import NotificationPreferencesTab from '@/components/dentist/NotificationPreferencesTab';
import FormWorkflowTab from '@/components/dentist/FormWorkflowTab';

export default function AgencyDashboardV2() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'my-dashboard';
  });

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'my-dashboard':
        return <DashboardOverviewV2 onNavigate={handleTabChange} />;
      case 'my-practice':
        return <MyPracticePage onNavigate={handleTabChange} />;
      case 'my-appointments':
        return <AppointmentsPageV2 onNavigate={handleTabChange} />;
      case 'my-availability':
        return <AvailabilityManagementTab />;
      case 'my-appointment-types':
        return <AppointmentTypesTab />;
      case 'my-patients':
        return <PatientsTab />;
      case 'my-messages':
        return <MessagesTab />;
      case 'my-intake-forms':
        return <IntakeFormsTab />;
      case 'my-form-workflows':
        return <FormWorkflowTab />;
      case 'my-operations':
        return <OperationsTab />;
      case 'my-profile':
        return <ProfileEditorTab />;
      case 'my-team':
        return <TeamManagementTab />;
      case 'my-services':
        return <ServicesTab />;
      case 'my-insurance':
        return <InsuranceManagementTab />;
      case 'my-reputation':
        return <AgencyReputationHub />;
      case 'my-templates':
        return <TemplatesTab />;
      case 'my-notifications':
        return <NotificationPreferencesTab />;
      case 'my-settings':
        return <AgencySettingsTab />;
      case 'my-support':
        return <SupportTicketsTab />;
      default:
        return <DashboardOverviewV2 onNavigate={handleTabChange} />;
    }
  };

  return (
    <AgencyDashboardLayoutV2
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {renderContent()}
    </AgencyDashboardLayoutV2>
  );
}
