import { useEffect, Suspense } from "react";
import { lazyRetry } from "./utils/lazyRetry";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import { useDynamicFavicon } from "@/hooks/useDynamicFavicon";
import { HelmetProvider } from "react-helmet-async";
import { PandaBot } from "@/components/PandaBot";
import { PerformanceMonitor } from "@/hooks/useWebVitals";
import { TrailingSlashRedirect } from "@/components/TrailingSlashRedirect";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { MetaTagInjector } from "@/components/analytics/MetaTagInjector";
import { CriticalResourceLoader } from "@/components/common/CriticalResourceLoader";

import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";

const Auth = lazyRetry(() => import("./pages/Auth"));
const AuthCallback = lazyRetry(() => import("./pages/AuthCallback"));
const AdminDashboard = lazyRetry(() => import("./pages/admin/AdminDashboard"));
const AgencyDashboardV2 = lazyRetry(() => import("./components/dashboard-v2/AgencyDashboardV2"));
const FosterCarerDashboard = lazyRetry(() => import("./components/foster-carer/FosterCarerDashboard"));
const ApplicantDashboard = lazyRetry(() => import("./components/applicant/ApplicantDashboard"));
const TrainerDashboard = lazyRetry(() => import("./components/trainer/TrainerDashboard"));
const LocalAuthorityDashboard = lazyRetry(() => import("./components/local-authority/LADashboard"));

const AboutPage = lazyRetry(() => import("./pages/AboutPage"));
const ContactPage = lazyRetry(() => import("./pages/ContactPage"));
const FAQPage = lazyRetry(() => import("./pages/FAQPage"));
const HowItWorksPage = lazyRetry(() => import("./pages/HowItWorksPage"));
const PrivacyPage = lazyRetry(() => import("./pages/PrivacyPage"));
const TermsPage = lazyRetry(() => import("./pages/TermsPage"));
const SitemapPage = lazyRetry(() => import("./pages/SitemapPage"));
const EditorialPolicyPage = lazyRetry(() => import("./pages/EditorialPolicyPage"));
const MedicalReviewPolicyPage = lazyRetry(() => import("./pages/MedicalReviewPolicyPage"));
const VerificationPolicyPage = lazyRetry(() => import("./pages/VerificationPolicyPage"));

const StatePage = lazyRetry(() => import("./pages/StatePage"));
const CityPage = lazyRetry(() => import("./pages/CityPage"));
const ServicePage = lazyRetry(() => import("./pages/ServicePage"));
const ServicesPage = lazyRetry(() => import("./pages/ServicesPage"));
const ServiceLocationPage = lazyRetry(() => import("./pages/ServiceLocationPage"));
const FosteringCategoryLocationPage = lazyRetry(() => import("./pages/FosteringCategoryLocationPage"));
const FosteringLocationPage = lazyRetry(() => import("./pages/FosteringLocationPage"));
const AgencyPage = lazyRetry(() => import("./pages/AgencyProfilePage"));

const BlogPage = lazyRetry(() => import("./pages/BlogPage"));
const BlogPostPage = lazyRetry(() => import("./pages/BlogPostPage"));

const ClaimProfilePage = lazyRetry(() => import("./pages/ClaimProfilePage"));
const ListYourPracticePage = lazyRetry(() => import("./pages/ListYourPracticePage"));
const ListYourPracticeSuccessPage = lazyRetry(() => import("./pages/ListYourPracticeSuccessPage"));
const PricingPage = lazyRetry(() => import("./pages/PricingPage"));
const InsurancePage = lazyRetry(() => import("./pages/InsurancePage"));
const InsuranceDetailPage = lazyRetry(() => import("./pages/InsuranceDetailPage"));
const ReviewFunnelPage = lazyRetry(() => import("./pages/ReviewFunnelPage"));
const ReviewRequestPage = lazyRetry(() => import("./pages/ReviewRequestPage"));
const GMBOnboarding = lazyRetry(() => import("./pages/GMBOnboarding"));
const GMBBusinessSelection = lazyRetry(() => import("./pages/GMBBusinessSelection"));
const AppointmentManagePage = lazyRetry(() => import("./pages/AppointmentManagePage"));
const ApplicantFormPage = lazyRetry(() => import("./pages/ApplicantFormPage"));
const BookDirectPage = lazyRetry(() => import("./pages/BookDirectPage"));
const Index = lazyRetry(() => import("./pages/Index"));

const FosteringAllowanceCalculator = lazyRetry(() => import("./pages/tools/FosteringAllowanceCalculator"));
const InsuranceChecker = lazyRetry(() => import("./pages/tools/InsuranceChecker"));
const EmergencyFostering = lazyRetry(() => import("./pages/EmergencyFostering"));

const ServicePricePage = lazyRetry(() => import("./pages/ServicePricePage"));
const AgenciesDirectoryPage = lazyRetry(() => import("./pages/AgenciesDirectoryPage"));
const BecomeFosterCarerPage = lazyRetry(() => import("./pages/fostering/BecomeFosterCarerPage"));

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function VisitorTracker() {
  useVisitorTracking();
  return null;
}

function DynamicFavicon() {
  useDynamicFavicon();
  return null;
}

const PageLoader = () => (
  <div className="page-loader" role="status" aria-label="Loading page">
    <div className="page-loader-text">Loading...</div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {import.meta.env.DEV && <PerformanceMonitor debug />}
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnalyticsProvider>
            <MetaTagInjector />
            <ScrollToTop />
            <TrailingSlashRedirect />
            <VisitorTracker />
            <DynamicFavicon />
            <CriticalResourceLoader delay={3000} />
            <PandaBot />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/find-agency" element={<SearchPage />} />
                <Route path="/agencies" element={<AgenciesDirectoryPage />} />
                <Route path="/agencies/:citySlug" element={<AgenciesDirectoryPage />} />
                <Route path="/become-foster-carer" element={<BecomeFosterCarerPage />} />
                
                <Route path="/locations" element={<StatePage />} />
                <Route path="/locations/:stateSlug" element={<StatePage />} />
                <Route path="/locations/:stateSlug/:citySlug" element={<CityPage />} />
                <Route path="/locations/:stateSlug/:citySlug/:serviceSlug" element={<ServiceLocationPage />} />
                
                <Route path="/categories" element={<ServicesPage />} />
                <Route path="/categories/:serviceSlug" element={<ServicePage />} />
                <Route path="/services" element={<Navigate to="/categories" replace />} />
                <Route path="/services/:serviceSlug" element={<ServicePage />} />
                
                <Route path="/agency/:agencySlug" element={<AgencyPage />} />
                <Route path="/agency/:agencySlug/" element={<AgencyPage />} />
                <Route path="/agency/:agencySlug/*" element={<NotFound />} />
                
                <Route path="/fostering-agencies" element={<FosteringLocationPage />} />
                <Route path="/fostering-agencies/" element={<FosteringLocationPage />} />
                <Route path="/fostering-agencies/:locationSlug" element={<FosteringLocationPage />} />
                <Route path="/fostering-agencies/:locationSlug/" element={<FosteringLocationPage />} />
                <Route path="/fostering-agencies/:locationSlug/:categorySlug" element={<FosteringCategoryLocationPage />} />
                <Route path="/fostering-agencies/:locationSlug/:categorySlug/" element={<FosteringCategoryLocationPage />} />
                
                <Route path="/fostering/:typeSlug" element={<AgencyPage />} />
                <Route path="/compare" element={<AgencyPage />} />
                
                <Route path="/:stateSlug" element={<StatePage />} />
                <Route path="/:stateSlug/:citySlug" element={<CityPage />} />
                <Route path="/:stateSlug/:citySlug/:serviceSlug" element={<ServiceLocationPage />} />
                
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:postSlug" element={<BlogPostPage />} />
                
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/login/" element={<Navigate to="/auth" replace />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/onboarding" element={<GMBOnboarding />} />
                <Route path="/gmb-select" element={<GMBBusinessSelection />} />
                
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin', 'agency_admin', 'agency_staff', 'trainer', 'auditor']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['super_admin', 'agency_admin', 'agency_staff', 'trainer', 'auditor']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/dashboard/:section" element={<ProtectedRoute allowedRoles={['super_admin', 'agency_admin', 'agency_staff', 'trainer', 'auditor']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/dashboard-v2" element={<ProtectedRoute allowedRoles={['super_admin', 'agency_admin', 'agency_staff']}><AgencyDashboardV2 /></ProtectedRoute>} />
                
                <Route path="/carer" element={<ProtectedRoute allowedRoles={['foster_carer']}><FosterCarerDashboard /></ProtectedRoute>} />
                <Route path="/applicant" element={<ProtectedRoute allowedRoles={['applicant']}><ApplicantDashboard /></ProtectedRoute>} />
                <Route path="/trainer" element={<ProtectedRoute allowedRoles={['trainer']}><TrainerDashboard /></ProtectedRoute>} />
                <Route path="/la" element={<ProtectedRoute allowedRoles={['local_authority']}><LocalAuthorityDashboard /></ProtectedRoute>} />
                
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/sitemap" element={<SitemapPage />} />
                <Route path="/editorial-policy" element={<EditorialPolicyPage />} />
                <Route path="/medical-review-policy" element={<MedicalReviewPolicyPage />} />
                <Route path="/verification-policy" element={<VerificationPolicyPage />} />
                
                <Route path="/pricing" element={<PricingPage />} />
                
                <Route path="/insurance" element={<InsurancePage />} />
                <Route path="/insurance/:insuranceSlug" element={<InsuranceDetailPage />} />
                <Route path="/insurance/:insuranceSlug/:regionSlug" element={<InsuranceDetailPage />} />
                <Route path="/insurance/:insuranceSlug/:regionSlug/:citySlug" element={<InsuranceDetailPage />} />
                
                <Route path="/claim-profile" element={<ClaimProfilePage />} />
                <Route path="/list-your-agency" element={<ListYourPracticePage />} />
                <Route path="/list-your-practice" element={<Navigate to="/list-your-agency" replace />} />
                <Route path="/list-your-practice/success" element={<ListYourPracticeSuccessPage />} />
                <Route path="/review/:clinicId" element={<ReviewFunnelPage />} />
                <Route path="/rq/:requestCode" element={<ReviewRequestPage />} />
                <Route path="/appointment/:token" element={<AppointmentManagePage />} />
                <Route path="/form/:submissionId" element={<ApplicantFormPage />} />
                <Route path="/book/:clinicId" element={<BookDirectPage />} />
                
                <Route path="/tools/fostering-allowance-calculator" element={<FosteringAllowanceCalculator />} />
                <Route path="/tools/agency-cost-guide" element={<Navigate to="/tools/fostering-allowance-calculator" replace />} />
                <Route path="/tools/insurance-checker" element={<InsuranceChecker />} />
                <Route path="/emergency-fostering" element={<EmergencyFostering />} />
                <Route path="/emergency-foster-care" element={<Navigate to="/emergency-fostering" replace />} />
                
                <Route path="/cost/:serviceSlug" element={<ServicePricePage />} />
                
                <Route path="/ae/clinic/:clinicSlug" element={<Navigate to="/find-agency" replace />} />
                <Route path="/ae/dentist/:contactSlug" element={<Navigate to="/find-agency" replace />} />
                <Route path="/ae" element={<Navigate to="/" replace />} />
                <Route path="/ae/*" element={<Navigate to="/" replace />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </AnalyticsProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;