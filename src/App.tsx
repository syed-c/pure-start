import { useEffect, Suspense } from "react";
import { lazyRetry } from "./utils/lazyRetry";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import { useDynamicFavicon } from "@/hooks/useDynamicFavicon";
import { HelmetProvider } from "react-helmet-async";
import { PandaBot } from "@/components/PandaBot";
import { PerformanceMonitor } from "@/hooks/useWebVitals";
import { TrailingSlashRedirect } from "@/components/TrailingSlashRedirect";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { MetaTagInjector } from "@/components/analytics/MetaTagInjector";
import { CriticalResourceLoader } from "@/components/common/CriticalResourceLoader";

// Critical pages - load immediately for fast FCP
import HomeV2 from "./pages/HomeV2";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages - code split for smaller initial bundle
const Auth = lazyRetry(() => import("./pages/Auth"));
const AuthCallback = lazyRetry(() => import("./pages/AuthCallback"));
const AdminDashboard = lazyRetry(() => import("./pages/admin/AdminDashboard"));
const DentistDashboardV2 = lazyRetry(() => import("./components/dashboard-v2/DentistDashboardV2"));

// Public Pages - lazy loaded
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

// Directory Pages - lazy loaded for performance
const StatePage = lazyRetry(() => import("./pages/StatePage"));
const CityPage = lazyRetry(() => import("./pages/CityPage"));
const ServicePage = lazyRetry(() => import("./pages/ServicePage"));
const ServicesPage = lazyRetry(() => import("./pages/ServicesPage"));
const ServiceLocationPage = lazyRetry(() => import("./pages/ServiceLocationPage"));
const ClinicPage = lazyRetry(() => import("./pages/ClinicPage"));
const DentistPage = lazyRetry(() => import("./pages/DentistPage"));

// Blog Pages - lazy loaded
const BlogPage = lazyRetry(() => import("./pages/BlogPage"));
const BlogPostPage = lazyRetry(() => import("./pages/BlogPostPage"));

// Business Pages - lazy loaded
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
const PatientFormPage = lazyRetry(() => import("./pages/PatientFormPage"));
const BookDirectPage = lazyRetry(() => import("./pages/BookDirectPage"));
const Index = lazyRetry(() => import("./pages/Index"));

// Free Tools
const FosteringAllowanceCalculator = lazyRetry(() => import("./pages/tools/DentalCostCalculator"));
const InsuranceChecker = lazyRetry(() => import("./pages/tools/InsuranceChecker"));
const EmergencyFostering = lazyRetry(() => import("./pages/EmergencyDentist"));

// Service Pages
const ServicePricePage = lazyRetry(() => import("./pages/ServicePricePage"));
const RegionComparisonPage = lazyRetry(() => import("./pages/EmirateComparisonPage"));

const queryClient = new QueryClient();

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

// Visitor tracking component - tracks sessions, pageviews, events
function VisitorTracker() {
  useVisitorTracking();
  return null;
}

// Dynamic favicon component - updates favicon from branding settings
function DynamicFavicon() {
  useDynamicFavicon();
  return null;
}

function LegacyClinicRedirect() {
  const { clinicSlug } = useParams();
  return <Navigate to={clinicSlug ? `/clinic/${clinicSlug}/` : "/"} replace />;
}

function LegacyDentistRedirect() {
  const { dentistSlug } = useParams();
  return <Navigate to={dentistSlug ? `/dentist/${dentistSlug}/` : "/"} replace />;
}

// Loading fallback for lazy-loaded routes - optimized for CLS
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
          {/* Performance monitoring in development */}
          {import.meta.env.DEV && <PerformanceMonitor debug />}
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {/* Google Analytics 4 tracking - must be inside Router for useLocation */}
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
                {/* Homepage - New Fostering Design */}
                <Route path="/" element={<HomeV2 />} />
                
                {/* Legacy Homepage */}
                <Route path="/home-legacy" element={<Index />} />
                
                {/* Search */}
                <Route path="/search" element={<SearchPage />} />
                <Route path="/find-agency" element={<SearchPage />} />
                
                {/* Directory - Categories (formerly Services) */}
                <Route path="/categories" element={<ServicesPage />} />
                <Route path="/categories/:serviceSlug" element={<ServicePage />} />
                <Route path="/services" element={<Navigate to="/categories" replace />} />
                <Route path="/services/:serviceSlug" element={<ServicePage />} />

                {/* Directory - Agency Profiles */}
                <Route path="/clinic/:clinicSlug" element={<ClinicPage />} />
                <Route path="/clinic/:clinicSlug/*" element={<NotFound />} />
                <Route path="/agency/:clinicSlug" element={<ClinicPage />} />
                <Route path="/agency/:clinicSlug/*" element={<NotFound />} />

                {/* Directory - State Pages (e.g., /california, /massachusetts) */}
                <Route path="/:stateSlug" element={<StatePage />} />

                {/* Directory - City Pages (e.g., /california/los-angeles) */}
                <Route path="/:stateSlug/:citySlug" element={<CityPage />} />

                {/* Directory - Service + City combination (e.g., /california/los-angeles/cosmetic-dentist) */}
                <Route path="/:stateSlug/:citySlug/:serviceSlug" element={<ServiceLocationPage />} />

                {/* Blog */}
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:postSlug" element={<BlogPostPage />} />
                
                {/* Auth */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/login/" element={<Navigate to="/auth" replace />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/onboarding" element={<GMBOnboarding />} />
                <Route path="/gmb-select" element={<GMBBusinessSelection />} />
                
                {/* Dashboards */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/dashboard-v2" element={<DentistDashboardV2 />} />
                
                {/* Static Pages */}
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
                
                {/* Pricing */}
                <Route path="/pricing" element={<PricingPage />} />
                
                {/* Insurance */}
                <Route path="/insurance" element={<InsurancePage />} />
                <Route path="/insurance/:insuranceSlug" element={<InsuranceDetailPage />} />
                <Route path="/insurance/:insuranceSlug/:emirateSlug" element={<InsuranceDetailPage />} />
                <Route path="/insurance/:insuranceSlug/:emirateSlug/:citySlug" element={<InsuranceDetailPage />} />
                
                {/* Business - Agency listing */}
                <Route path="/claim-profile" element={<ClaimProfilePage />} />
                <Route path="/list-your-agency" element={<ListYourPracticePage />} />
                <Route path="/list-your-practice" element={<Navigate to="/list-your-agency" replace />} />
                <Route path="/list-your-practice/success" element={<ListYourPracticeSuccessPage />} />
                <Route path="/review/:clinicId" element={<ReviewFunnelPage />} />
                <Route path="/rq/:requestCode" element={<ReviewRequestPage />} />
                <Route path="/appointment/:token" element={<AppointmentManagePage />} />
                <Route path="/form/:submissionId" element={<PatientFormPage />} />
                <Route path="/book/:clinicId" element={<BookDirectPage />} />

                {/* Free Tools */}
                <Route path="/tools/fostering-allowance-calculator" element={<FosteringAllowanceCalculator />} />
                <Route path="/tools/dental-cost-calculator" element={<Navigate to="/tools/fostering-allowance-calculator" replace />} />
                <Route path="/tools/insurance-checker" element={<InsuranceChecker />} />
                <Route path="/emergency-fostering" element={<EmergencyFostering />} />
                <Route path="/emergency-dentist" element={<Navigate to="/emergency-fostering" replace />} />

                {/* Service Comparison Pages */}
                <Route path="/cost/:serviceSlug" element={<ServicePricePage />} />
                <Route path="/compare/:serviceSlug/:region1-vs-:region2" element={<RegionComparisonPage />} />

                {/* Legacy redirects */}
                <Route path="/ae/clinic/:clinicSlug" element={<LegacyClinicRedirect />} />
                <Route path="/ae/dentist/:dentistSlug" element={<LegacyDentistRedirect />} />
                <Route path="/ae" element={<Navigate to="/" replace />} />
                <Route path="/ae/*" element={<Navigate to="/" replace />} />
                
                {/* Catch-all */}
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
