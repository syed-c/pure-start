# Foster Care Platform Dashboard Audit & Implementation Plan

## 1. User Roles (Already Defined in database.ts)

| Role | Purpose | Status |
|------|---------|--------|
| super_admin | Platform owner - full access | ✅ Ready |
| agency_admin | Fostering agency admin | ✅ Ready |
| agency_staff | Agency staff / supervising social worker | ✅ Ready |
| foster_carer | Registered foster carrier | ✅ Ready |
| applicant | Prospective foster carrier / applicant | ✅ Ready |
| trainer | Training provider / expert | ✅ Ready |
| local_authority | LA user for placement requests | ✅ Ready |
| auditor | Read-only auditor | ✅ Ready |

---

## 2. Navigation Structure (Already Defined in navigation.tsx)

### Super Admin Navigation - ALREADY EXISTS ✅
- **Platform**: Dashboard, Analytics, Reports
- **Organisations**: Fostering Agencies, Local Authorities, Trainers
- **Users**: All Users, Invite User, Roles & Permissions
- **Content**: Pages, Agency Directory
- **System**: Platform Settings, Audit Logs, Notifications

### Agency Admin Navigation - EXISTS but needs terminology update
- **Agency**: Dashboard, Overview, Compliance
- **People**: Staff, Foster Carers, Applicants, Invite User ← ALREADY HAS CORRECT NAMES
- **Operations**: Placements, Enquiries, Training
- **Records**: Documents, Daily Logs, Incidents
- **Settings**: Agency Profile, Messages, Notifications

### Agency Staff Navigation - EXISTS ✅
- **My Work**: Dashboard, My Foster Carers, My Applicants
- **Records**: Supervision Notes, Daily Logs, Incidents, Documents
- **Training**: Training, My Training
- **Communication**: Messages, Notifications

### Foster Carer Navigation - EXISTS ✅
- **Home**: My Dashboard
- **My Care**: My Placements, Daily Log, Medications, Contact Records, Appointments
- **Development**: Training, Qualifications
- **Admin**: Documents, Expenses, Messages, Notifications, My Profile

### Applicant Navigation - EXISTS ✅
- **Home**: My Dashboard
- **My Application**: Application Progress, Documents, Book a Call
- **Resources**: Preparation Training, FAQ
- **Contact**: Messages, Notifications

### Trainer Navigation - EXISTS ✅
- **Home**: Dashboard
- **Training**: Sessions, Create Session, Materials, Certificates
- **Clients**: Bookings, Agencies
- **Account**: Profile, Messages, Notifications

### Local Authority Navigation - EXISTS ✅
- **Home**: Dashboard
- **Placements**: Placement Requests, New Request, Agency Responses
- **Search**: Agency Directory
- **Contact**: Messages, Notifications

### Auditor Navigation - EXISTS ✅
- **Home**: Dashboard
- **Review**: Agencies, Foster Carers, Training, Documents
- **Reports**: Audit Logs, Reports

---

## 3. AdminDashboard Tab Mapping

### SUPER ADMIN TABS - Already Exist

| Tab Group | Tab Name | Current Function | Matches Required | Enhancement Needed | Action |
|-----------|----------|------------------|------------------|-------------------|--------|
| Command Center | Dashboard Overview | Platform stats | Dashboard Overview | ✅ Add fostering stats | ENHANCE |
| Command Center | Weekly Report | Weekly metrics | Reports | ✅ Add fostering reports | ENHANCE |
| Command Center | Visitor Analytics | Traffic analytics | - | Keep as is | KEEP |
| Command Center | Top Agencies | Top agencies list | - | Rename to Top Fostering Agencies | ENHANCE |
| Command Center | Reports | Reports tab | Reports | ✅ Add fostering reports | ENHANCE |
| Marketplace | Fostering Agencies | Agency list | Agency Management | ✅ Already correct | KEEP |
| Marketplace | Users | User management | User Management | ✅ Add role filters | ENHANCE |
| Marketplace | Claims | Agency claims | - | Keep (placeholder) | KEEP |
| Marketplace | Fostering Categories | Service categories | Fostering Types | ✅ Already correct | KEEP |
| Marketplace | Locations | Location management | - | Keep as is | KEEP |
| Marketplace | Geo Expansion | - | - | Keep as is | KEEP |
| Marketplace | Ranking Rules | - | - | Keep as is | KEEP |
| Marketplace | Page Manager | - | - | Keep as is | KEEP |
| Discovery & SEO | All SEO tabs | SEO management | - | Keep as is - not fostering specific |
| Reputation | Reputation Hub | Reviews management | - | Keep - generic |
| Growth & Marketing | Google Places Import | GMB import | Agency Import | ✅ Just created | KEEP |
| Growth & Marketing | Email Enrichment | - | - | Keep as is |
| Growth & Marketing | Outreach Center | - | - | Keep as is |
| Growth & Marketing | Promotions | - | - | Keep as is |
| Platform Settings | All settings tabs | Settings | Settings | Add fostering settings | ENHANCE |
| System Diagnostics | All system tabs | System admin | Compliance | Add compliance section | ENHANCE |

### AGENCY ADMIN TABS - Need Major Update

| Current Tab ID | Current Label | Map To | Enhancement Needed | Action |
|---------------|---------------|--------|-------------------|--------|
| my-dashboard | My Agency | Dashboard Overview | Add fostering KPIs | ENHANCE |
| my-appointments | Enquiries | Enquiries | ✅ Already correct | KEEP |
| my-availability | Availability | Placement Availability | Add fostering filters | ENHANCE |
| my-appointment-types | Enquiry Types | - | Rename to Fostering Types | ENHANCE |
| my-patients | Carers | Foster Carer Management | ✅ Already correct mapping | KEEP |
| my-messages | Messages | Messages | ✅ Already correct | KEEP |
| my-operations | Automation | - | Keep for now | KEEP |
| my-intake-forms | Application Forms | Applicant Pipeline | ✅ Already correct | KEEP |
| my-profile | Edit Profile | Agency Profile | Add fostering fields | ENHANCE |
| my-team | Team | Staff Management | ✅ Already correct | KEEP |
| my-services | Fostering Types | Agency Profile | ✅ Already correct | KEEP |
| my-reputation | Reputation Suite | - | Keep - not fostering | KEEP |
| my-templates | Templates | - | Keep for now | KEEP |
| my-settings | Settings | Settings | Add fostering settings | ENHANCE |
| my-support | Support Tickets | - | Keep for now | KEEP |

---

## 4. Database Tables - Already Exist

| Table | Purpose | Status | Enhancement Needed |
|-------|---------|--------|-------------------|
| agencies | Fostering agencies | ✅ Ready | Add more fostering fields |
| foster_carer_profiles | Foster carers | ✅ Ready | Already has status, approval, dates |
| applicant_profiles | Applicants | ✅ Ready | Has application_stage |
| trainer_profiles | Trainers | ✅ Ready | Ready |
| local_authority_profiles | Local authorities | ✅ Ready | Ready |
| organisations | Organisation records | ✅ Ready | Ready |
| user_profiles | User accounts | ✅ Ready | Ready |
| permissions | Permission definitions | ✅ Ready | Ready |
| role_permissions | Role access control | ✅ Ready | Ready |
| states, cities, areas | Location data | ✅ Ready | Ready |
| fostering_types | Fostering categories | ✅ Ready | Ready |
| enquiries (leads) | Enquiries/leads | ✅ Ready | Ready |
| messages | Messaging | ✅ Ready | Ready |
| notifications | Notifications | ✅ Ready | Ready |
| documents | Document storage | ✅ Ready | Add fostering types |
| user_activity_logs | Audit trail | ✅ Ready | Ready |

---

## 5. Implementation Plan

### Phase 1: Agency Admin Dashboard Terminology Update (HIGH PRIORITY)

**Objective**: Update the agency tab labels to use fostering terminology without creating new tabs.

| Tab ID | Change From | Change To |
|--------|-------------|-----------|
| my-patients | Carers | Foster Carers (keep ID for route compatibility) |
| my-appointments | Enquiries | Enquiries (keep) |
| my-appointment-types | Enquiry Types | Fostering Types |
| my-intake-forms | Application Forms | Applications |

### Phase 2: Dashboard Overview Enhancement (HIGH PRIORITY)

**Existing**: `AgencyDashboardTab.tsx` and `DashboardOverview.tsx`
**Action**: Add fostering-specific KPIs:
- Total foster carers
- Approved foster carers
- Available foster carers
- Current placements
- New enquiries (this week)
- Applicants in assessment
- Training overdue count
- Documents expiring soon
- Upcoming annual reviews
- Open incident reports

### Phase 3: Agency Profile Enhancement (HIGH PRIORITY)

**Existing**: `ProfileEditorTab.tsx`
**Action**: Add fostering fields:
- Ofsted URN
- Ofsted rating
- Service areas (already exists as areas_served)
- Fostering types offered (already exists)
- 24/7 support status
- Emergency placement availability
- Parent and child fostering
- Therapeutic fostering
- FAQs (add if not exists)
- Public profile visibility toggle

### Phase 4: Staff Management (Existing: TeamManagementTab.tsx) - MEDIUM

**Already Has**: Team list, invite, roles
**Enhancement**: Add:
- Assign foster carers to supervising social workers
- Assign applicants to staff
- Last login status

### Phase 5: Foster Carer Management (Existing: PatientsTab.tsx → renamed) - HIGH

**Already Has**: List view, basic profile
**Enhancement**: Add to existing columns/filters:
- Approval status
- Current placement status
- Availability status
- Supervising social worker
- Annual review date
- Training status
- Document status

### Phase 6: Applicant Pipeline (Existing: IntakeFormsTab + AppointmentsTab) - HIGH

**Already Has**: Application forms, appointment tracking
**Enhancement**:
- Add stages: enquiry → initial_check → assessment → panel → approved → rejected
- Add stage progress indicator
- Add assigned staff member
- Add notes field
- Add document attachment

### Phase 7: Enquiries (Existing: AgencyEnquiriesTab.tsx) - MEDIUM

**Already Has**: Enquiry list, status tracking
**Enhancement**:
- Add foster care specific fields
- Convert to applicant button
- Source tracking (directory, profile page, direct)

### Phase 8: Placement Availability (New) - MEDIUM

**Existing**: `AvailabilityManagementTab.tsx` for appointment availability
**Action**: Enhance existing tab or add placement-specific availability view:
- Available foster carers
- Emergency availability
- Spare bedroom count
- Approved age range
- Current placement load

### Phase 9: Training Management - LOW

**Existing**: No dedicated training tab in agency dashboard
**Action**: Create training management section using existing patterns:
- Training list
- Completion status
- Expiry alerts

### Phase 10: Documents (Existing: Various document handling) - LOW

**Already Has**: Document upload in some places
**Action**: Create unified document management:
- Document types: DBS, Medical, References, Certificates
- Expiry tracking
- Alert system

### Phase 11: Messages (Existing: MessagesTab.tsx) - LOW

**Already Has**: Messaging interface
**Enhancement**: Add record linking to foster carers, applicants

### Phase 12: Reports (Existing: ReportsTab.tsx) - MEDIUM

**Already Has**: Basic reports in Super Admin
**Action**: Add fostering reports:
- Foster carer report
- Applicant pipeline report
- Training compliance report

### Phase 13: Compliance Alerts - MEDIUM

**Existing**: Notifications system
**Action**: Add compliance-specific alerts:
- DBS expiring
- Training overdue
- Annual review due
- Document expiry

### Phase 14: Settings Enhancement - MEDIUM

**Existing**: AgencySettingsTab.tsx
**Action**: Add fostering settings:
- Enquiry routing
- Pipeline stages configuration
- Document expiry rules

---

## 6. Duplicates Avoided

| Would-be Duplicate | Reused Existing |
|--------------------|-----------------|
| Staff Management | TeamManagementTab.tsx |
| Foster Carers | PatientsTab.tsx (remap) |
| Applicants | IntakeFormsTab.tsx |
| Enquiries | AgencyEnquiriesTab.tsx |
| Messages | MessagesTab.tsx |
| Documents | Various existing |
| Reports | ReportsTab.tsx |
| Profile | ProfileEditorTab.tsx |
| Settings | AgencySettingsTab.tsx |

---

## 7. New Components to Create

| Component | Purpose | Priority |
|-----------|---------|----------|
| FosterCarerProfileCard.tsx | Reusable foster card | MEDIUM |
| ApplicantPipelineView.tsx | Pipeline stage view | HIGH |
| ComplianceAlertsWidget.tsx | Alert summary | MEDIUM |
| PlacementAvailabilityCard.tsx | Availability display | MEDIUM |
| TrainingStatusBadge.tsx | Training indicator | LOW |

---

## 8. Database Changes

No new tables needed. Existing tables can be extended:
- agencies: Add additional fostering fields (already has most)
- foster_carer_profiles: Already has required fields
- applicant_profiles: Already has application_stage
- documents: Add document_type enum

---

## 9. Summary

**Existing Tabs Found**: 60+ tabs in AdminDashboard + role navigation  
**Tabs Enhanced**: 14 identified for enhancement  
**New Tabs Added**: 0 (all features mapped to existing)  
**Duplicate Tabs Avoided**: All requirements mapped to existing components  
**Database Changes**: Minimal - existing tables sufficient  
**Routes**: Preserve existing routes, update labels only

The platform already has excellent structure for fostering. The main work is:
1. Update terminology in agency admin tabs
2. Add fostering-specific data to existing views
3. Add compliance and training tracking
4. Connect existing components with proper data