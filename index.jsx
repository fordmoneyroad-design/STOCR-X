import Layout from "./Layout.jsx";

import Home from "./Home";

import BrowseCars from "./BrowseCars";

import Calculator from "./Calculator";

import HowItWorks from "./HowItWorks";

import Support from "./Support";

import Careers from "./Careers";

import Terms from "./Terms";

import Privacy from "./Privacy";

import CarDetails from "./CarDetails";

import Apply from "./Apply";

import MyAccount from "./MyAccount";

import AdminDashboard from "./AdminDashboard";

import SubscriptionPlans from "./SubscriptionPlans";

import MakePayment from "./MakePayment";

import SuperAdmin from "./SuperAdmin";

import EarlyBuyout from "./EarlyBuyout";

import SwapUpgrade from "./SwapUpgrade";

import ReportIncident from "./ReportIncident";

import ScheduleDelivery from "./ScheduleDelivery";

import SuperAdminCars from "./SuperAdminCars";

import MilitaryVerification from "./MilitaryVerification";

import MilitaryDashboard from "./MilitaryDashboard";

import LiveChat from "./LiveChat";

import EmployeeDashboard from "./EmployeeDashboard";

import ManagerDashboard from "./ManagerDashboard";

import ScheduleRequest from "./ScheduleRequest";

import Onboarding from "./Onboarding";

import PlanSelection from "./PlanSelection";

import FundsVerification from "./FundsVerification";

import PayrollDashboard from "./PayrollDashboard";

import BuyNowMarketplace from "./BuyNowMarketplace";

import SubscriptionProfile from "./SubscriptionProfile";

import CopartLocator from "./CopartLocator";

import FinancingManagement from "./FinancingManagement";

import PendingApprovals from "./PendingApprovals";

import IRSTaxCalculator from "./IRSTaxCalculator";

import CompanyManagement from "./CompanyManagement";

import CareerApplication from "./CareerApplication";

import UserProfile from "./UserProfile";

import CreateEmployee from "./CreateEmployee";

import SupportLiveChat from "./SupportLiveChat";

import SearchAnalytics from "./SearchAnalytics";

import InventorySupplyList from "./InventorySupplyList";

import VehicleAutoRemoval from "./VehicleAutoRemoval";

import AuctionAssessment from "./AuctionAssessment";

import PartnerAccountCreation from "./PartnerAccountCreation";

import LicenseManagement from "./LicenseManagement";

import NearbyVehicles from "./NearbyVehicles";

import MaintenanceTracking from "./MaintenanceTracking";

import VirtualOnboarding from "./VirtualOnboarding";

import AIIDVerification from "./AIIDVerification";

import TravelerDeliveryEstimate from "./TravelerDeliveryEstimate";

import AIAssistantEmployee from "./AIAssistantEmployee";

import CallCenterDispatch from "./CallCenterDispatch";

import JobBoard from "./JobBoard";

import SystemTesting from "./SystemTesting";

import HireOrFire from "./HireOrFire";

import ThemeManager from "./ThemeManager";

import PreEmploymentOnboarding from "./PreEmploymentOnboarding";

import JobManagement from "./JobManagement";

import VirtualOnboardingClass from "./VirtualOnboardingClass";

import AIIDVerificationEnhanced from "./AIIDVerificationEnhanced";

import SubscriptionPlansEcosystem from "./SubscriptionPlansEcosystem";

import CopartLinkImporter from "./CopartLinkImporter";

import MobileAppPromo from "./MobileAppPromo";

import ForgotPassword from "./ForgotPassword";

import AccountRecovery from "./AccountRecovery";

import FaviconTest from "./FaviconTest";

import VehicleInspection from "./VehicleInspection";

import InspectionReview from "./InspectionReview";

import PendingVehicleApprovals from "./PendingVehicleApprovals";

import PaymentDetail from "./PaymentDetail";

import CreateTesterAccount from "./CreateTesterAccount";

import AffiliatedCareer from "./AffiliatedCareer";

import AffiliateManagement from "./AffiliateManagement";

import AccountApprovalStatus from "./AccountApprovalStatus";

import UpgradeRequest from "./UpgradeRequest";

import PaymentVerification from "./PaymentVerification";

import VehicleManagement from "./VehicleManagement";

import VehicleResearchFlow from "./VehicleResearchFlow";

import PWAInstallPrompt from "./PWAInstallPrompt";

import AITaskManager from "./AITaskManager";

import AppDocumentation from "./AppDocumentation";

import PlatformNarrative from "./PlatformNarrative";

import SubscriptionEcosystem from "./SubscriptionEcosystem";

import NotificationSettings from "./NotificationSettings";

import TechnicalGuide from "./TechnicalGuide";

import ShortcutsCheatSheet from "./ShortcutsCheatSheet";

import CodeExporter from "./CodeExporter";

import TechFileManager from "./TechFileManager";

import PWAInstallGuide from "./PWAInstallGuide";

import PWAAnalyticsDashboard from "./PWAAnalyticsDashboard";

import MyShifts from "./MyShifts";

import EmployeeTimeoutMonitor from "./EmployeeTimeoutMonitor";

import URLManager from "./URLManager";

import StoreCreditManagement from "./StoreCreditManagement";

import CustomerReturns from "./CustomerReturns";

import BlogManager from "./BlogManager";

import PartnershipPlatform from "./PartnershipPlatform";

import RequestPartnerAccess from "./RequestPartnerAccess";

import PostPurchase from "./PostPurchase";

import DeliverySettings from "./DeliverySettings";

import MarketManagement from "./MarketManagement";

import EnhancedThemeManager from "./EnhancedThemeManager";

import TaxManagement from "./TaxManagement";

import TaxRegions from "./TaxRegions";

import TaxRates from "./TaxRates";

import ProductTaxCategories from "./ProductTaxCategories";

import TaxReports from "./TaxReports";

import Brand from "./Brand";

import Settings from "./Settings";

import PendingUsers from "./PendingUsers";

import PendingUserApproval from "./PendingUserApproval";

import AccessControl from "./AccessControl";

import InterfacePreferences from "./InterfacePreferences";

import EmployeeInformationCategories from "./EmployeeInformationCategories";

import SafetyErrorHandler from "./SafetyErrorHandler";

import RoleManagement from "./RoleManagement";

import QuickUserAssignment from "./QuickUserAssignment";

import CopartSettings from "./CopartSettings";

import CopartImporter from "./CopartImporter";

import CopartWatchlist from "./CopartWatchlist";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    BrowseCars: BrowseCars,
    
    Calculator: Calculator,
    
    HowItWorks: HowItWorks,
    
    Support: Support,
    
    Careers: Careers,
    
    Terms: Terms,
    
    Privacy: Privacy,
    
    CarDetails: CarDetails,
    
    Apply: Apply,
    
    MyAccount: MyAccount,
    
    AdminDashboard: AdminDashboard,
    
    SubscriptionPlans: SubscriptionPlans,
    
    MakePayment: MakePayment,
    
    SuperAdmin: SuperAdmin,
    
    EarlyBuyout: EarlyBuyout,
    
    SwapUpgrade: SwapUpgrade,
    
    ReportIncident: ReportIncident,
    
    ScheduleDelivery: ScheduleDelivery,
    
    SuperAdminCars: SuperAdminCars,
    
    MilitaryVerification: MilitaryVerification,
    
    MilitaryDashboard: MilitaryDashboard,
    
    LiveChat: LiveChat,
    
    EmployeeDashboard: EmployeeDashboard,
    
    ManagerDashboard: ManagerDashboard,
    
    ScheduleRequest: ScheduleRequest,
    
    Onboarding: Onboarding,
    
    PlanSelection: PlanSelection,
    
    FundsVerification: FundsVerification,
    
    PayrollDashboard: PayrollDashboard,
    
    BuyNowMarketplace: BuyNowMarketplace,
    
    SubscriptionProfile: SubscriptionProfile,
    
    CopartLocator: CopartLocator,
    
    FinancingManagement: FinancingManagement,
    
    PendingApprovals: PendingApprovals,
    
    IRSTaxCalculator: IRSTaxCalculator,
    
    CompanyManagement: CompanyManagement,
    
    CareerApplication: CareerApplication,
    
    UserProfile: UserProfile,
    
    CreateEmployee: CreateEmployee,
    
    SupportLiveChat: SupportLiveChat,
    
    SearchAnalytics: SearchAnalytics,
    
    InventorySupplyList: InventorySupplyList,
    
    VehicleAutoRemoval: VehicleAutoRemoval,
    
    AuctionAssessment: AuctionAssessment,
    
    PartnerAccountCreation: PartnerAccountCreation,
    
    LicenseManagement: LicenseManagement,
    
    NearbyVehicles: NearbyVehicles,
    
    MaintenanceTracking: MaintenanceTracking,
    
    VirtualOnboarding: VirtualOnboarding,
    
    AIIDVerification: AIIDVerification,
    
    TravelerDeliveryEstimate: TravelerDeliveryEstimate,
    
    AIAssistantEmployee: AIAssistantEmployee,
    
    CallCenterDispatch: CallCenterDispatch,
    
    JobBoard: JobBoard,
    
    SystemTesting: SystemTesting,
    
    HireOrFire: HireOrFire,
    
    ThemeManager: ThemeManager,
    
    PreEmploymentOnboarding: PreEmploymentOnboarding,
    
    JobManagement: JobManagement,
    
    VirtualOnboardingClass: VirtualOnboardingClass,
    
    AIIDVerificationEnhanced: AIIDVerificationEnhanced,
    
    SubscriptionPlansEcosystem: SubscriptionPlansEcosystem,
    
    CopartLinkImporter: CopartLinkImporter,
    
    MobileAppPromo: MobileAppPromo,
    
    ForgotPassword: ForgotPassword,
    
    AccountRecovery: AccountRecovery,
    
    FaviconTest: FaviconTest,
    
    VehicleInspection: VehicleInspection,
    
    InspectionReview: InspectionReview,
    
    PendingVehicleApprovals: PendingVehicleApprovals,
    
    PaymentDetail: PaymentDetail,
    
    CreateTesterAccount: CreateTesterAccount,
    
    AffiliatedCareer: AffiliatedCareer,
    
    AffiliateManagement: AffiliateManagement,
    
    AccountApprovalStatus: AccountApprovalStatus,
    
    UpgradeRequest: UpgradeRequest,
    
    PaymentVerification: PaymentVerification,
    
    VehicleManagement: VehicleManagement,
    
    VehicleResearchFlow: VehicleResearchFlow,
    
    PWAInstallPrompt: PWAInstallPrompt,
    
    AITaskManager: AITaskManager,
    
    AppDocumentation: AppDocumentation,
    
    PlatformNarrative: PlatformNarrative,
    
    SubscriptionEcosystem: SubscriptionEcosystem,
    
    NotificationSettings: NotificationSettings,
    
    TechnicalGuide: TechnicalGuide,
    
    ShortcutsCheatSheet: ShortcutsCheatSheet,
    
    CodeExporter: CodeExporter,
    
    TechFileManager: TechFileManager,
    
    PWAInstallGuide: PWAInstallGuide,
    
    PWAAnalyticsDashboard: PWAAnalyticsDashboard,
    
    MyShifts: MyShifts,
    
    EmployeeTimeoutMonitor: EmployeeTimeoutMonitor,
    
    URLManager: URLManager,
    
    StoreCreditManagement: StoreCreditManagement,
    
    CustomerReturns: CustomerReturns,
    
    BlogManager: BlogManager,
    
    PartnershipPlatform: PartnershipPlatform,
    
    RequestPartnerAccess: RequestPartnerAccess,
    
    PostPurchase: PostPurchase,
    
    DeliverySettings: DeliverySettings,
    
    MarketManagement: MarketManagement,
    
    EnhancedThemeManager: EnhancedThemeManager,
    
    TaxManagement: TaxManagement,
    
    TaxRegions: TaxRegions,
    
    TaxRates: TaxRates,
    
    ProductTaxCategories: ProductTaxCategories,
    
    TaxReports: TaxReports,
    
    Brand: Brand,
    
    Settings: Settings,
    
    PendingUsers: PendingUsers,
    
    PendingUserApproval: PendingUserApproval,
    
    AccessControl: AccessControl,
    
    InterfacePreferences: InterfacePreferences,
    
    EmployeeInformationCategories: EmployeeInformationCategories,
    
    SafetyErrorHandler: SafetyErrorHandler,
    
    RoleManagement: RoleManagement,
    
    QuickUserAssignment: QuickUserAssignment,
    
    CopartSettings: CopartSettings,
    
    CopartImporter: CopartImporter,
    
    CopartWatchlist: CopartWatchlist,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/BrowseCars" element={<BrowseCars />} />
                
                <Route path="/Calculator" element={<Calculator />} />
                
                <Route path="/HowItWorks" element={<HowItWorks />} />
                
                <Route path="/Support" element={<Support />} />
                
                <Route path="/Careers" element={<Careers />} />
                
                <Route path="/Terms" element={<Terms />} />
                
                <Route path="/Privacy" element={<Privacy />} />
                
                <Route path="/CarDetails" element={<CarDetails />} />
                
                <Route path="/Apply" element={<Apply />} />
                
                <Route path="/MyAccount" element={<MyAccount />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/SubscriptionPlans" element={<SubscriptionPlans />} />
                
                <Route path="/MakePayment" element={<MakePayment />} />
                
                <Route path="/SuperAdmin" element={<SuperAdmin />} />
                
                <Route path="/EarlyBuyout" element={<EarlyBuyout />} />
                
                <Route path="/SwapUpgrade" element={<SwapUpgrade />} />
                
                <Route path="/ReportIncident" element={<ReportIncident />} />
                
                <Route path="/ScheduleDelivery" element={<ScheduleDelivery />} />
                
                <Route path="/SuperAdminCars" element={<SuperAdminCars />} />
                
                <Route path="/MilitaryVerification" element={<MilitaryVerification />} />
                
                <Route path="/MilitaryDashboard" element={<MilitaryDashboard />} />
                
                <Route path="/LiveChat" element={<LiveChat />} />
                
                <Route path="/EmployeeDashboard" element={<EmployeeDashboard />} />
                
                <Route path="/ManagerDashboard" element={<ManagerDashboard />} />
                
                <Route path="/ScheduleRequest" element={<ScheduleRequest />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/PlanSelection" element={<PlanSelection />} />
                
                <Route path="/FundsVerification" element={<FundsVerification />} />
                
                <Route path="/PayrollDashboard" element={<PayrollDashboard />} />
                
                <Route path="/BuyNowMarketplace" element={<BuyNowMarketplace />} />
                
                <Route path="/SubscriptionProfile" element={<SubscriptionProfile />} />
                
                <Route path="/CopartLocator" element={<CopartLocator />} />
                
                <Route path="/FinancingManagement" element={<FinancingManagement />} />
                
                <Route path="/PendingApprovals" element={<PendingApprovals />} />
                
                <Route path="/IRSTaxCalculator" element={<IRSTaxCalculator />} />
                
                <Route path="/CompanyManagement" element={<CompanyManagement />} />
                
                <Route path="/CareerApplication" element={<CareerApplication />} />
                
                <Route path="/UserProfile" element={<UserProfile />} />
                
                <Route path="/CreateEmployee" element={<CreateEmployee />} />
                
                <Route path="/SupportLiveChat" element={<SupportLiveChat />} />
                
                <Route path="/SearchAnalytics" element={<SearchAnalytics />} />
                
                <Route path="/InventorySupplyList" element={<InventorySupplyList />} />
                
                <Route path="/VehicleAutoRemoval" element={<VehicleAutoRemoval />} />
                
                <Route path="/AuctionAssessment" element={<AuctionAssessment />} />
                
                <Route path="/PartnerAccountCreation" element={<PartnerAccountCreation />} />
                
                <Route path="/LicenseManagement" element={<LicenseManagement />} />
                
                <Route path="/NearbyVehicles" element={<NearbyVehicles />} />
                
                <Route path="/MaintenanceTracking" element={<MaintenanceTracking />} />
                
                <Route path="/VirtualOnboarding" element={<VirtualOnboarding />} />
                
                <Route path="/AIIDVerification" element={<AIIDVerification />} />
                
                <Route path="/TravelerDeliveryEstimate" element={<TravelerDeliveryEstimate />} />
                
                <Route path="/AIAssistantEmployee" element={<AIAssistantEmployee />} />
                
                <Route path="/CallCenterDispatch" element={<CallCenterDispatch />} />
                
                <Route path="/JobBoard" element={<JobBoard />} />
                
                <Route path="/SystemTesting" element={<SystemTesting />} />
                
                <Route path="/HireOrFire" element={<HireOrFire />} />
                
                <Route path="/ThemeManager" element={<ThemeManager />} />
                
                <Route path="/PreEmploymentOnboarding" element={<PreEmploymentOnboarding />} />
                
                <Route path="/JobManagement" element={<JobManagement />} />
                
                <Route path="/VirtualOnboardingClass" element={<VirtualOnboardingClass />} />
                
                <Route path="/AIIDVerificationEnhanced" element={<AIIDVerificationEnhanced />} />
                
                <Route path="/SubscriptionPlansEcosystem" element={<SubscriptionPlansEcosystem />} />
                
                <Route path="/CopartLinkImporter" element={<CopartLinkImporter />} />
                
                <Route path="/MobileAppPromo" element={<MobileAppPromo />} />
                
                <Route path="/ForgotPassword" element={<ForgotPassword />} />
                
                <Route path="/AccountRecovery" element={<AccountRecovery />} />
                
                <Route path="/FaviconTest" element={<FaviconTest />} />
                
                <Route path="/VehicleInspection" element={<VehicleInspection />} />
                
                <Route path="/InspectionReview" element={<InspectionReview />} />
                
                <Route path="/PendingVehicleApprovals" element={<PendingVehicleApprovals />} />
                
                <Route path="/PaymentDetail" element={<PaymentDetail />} />
                
                <Route path="/CreateTesterAccount" element={<CreateTesterAccount />} />
                
                <Route path="/AffiliatedCareer" element={<AffiliatedCareer />} />
                
                <Route path="/AffiliateManagement" element={<AffiliateManagement />} />
                
                <Route path="/AccountApprovalStatus" element={<AccountApprovalStatus />} />
                
                <Route path="/UpgradeRequest" element={<UpgradeRequest />} />
                
                <Route path="/PaymentVerification" element={<PaymentVerification />} />
                
                <Route path="/VehicleManagement" element={<VehicleManagement />} />
                
                <Route path="/VehicleResearchFlow" element={<VehicleResearchFlow />} />
                
                <Route path="/PWAInstallPrompt" element={<PWAInstallPrompt />} />
                
                <Route path="/AITaskManager" element={<AITaskManager />} />
                
                <Route path="/AppDocumentation" element={<AppDocumentation />} />
                
                <Route path="/PlatformNarrative" element={<PlatformNarrative />} />
                
                <Route path="/SubscriptionEcosystem" element={<SubscriptionEcosystem />} />
                
                <Route path="/NotificationSettings" element={<NotificationSettings />} />
                
                <Route path="/TechnicalGuide" element={<TechnicalGuide />} />
                
                <Route path="/ShortcutsCheatSheet" element={<ShortcutsCheatSheet />} />
                
                <Route path="/CodeExporter" element={<CodeExporter />} />
                
                <Route path="/TechFileManager" element={<TechFileManager />} />
                
                <Route path="/PWAInstallGuide" element={<PWAInstallGuide />} />
                
                <Route path="/PWAAnalyticsDashboard" element={<PWAAnalyticsDashboard />} />
                
                <Route path="/MyShifts" element={<MyShifts />} />
                
                <Route path="/EmployeeTimeoutMonitor" element={<EmployeeTimeoutMonitor />} />
                
                <Route path="/URLManager" element={<URLManager />} />
                
                <Route path="/StoreCreditManagement" element={<StoreCreditManagement />} />
                
                <Route path="/CustomerReturns" element={<CustomerReturns />} />
                
                <Route path="/BlogManager" element={<BlogManager />} />
                
                <Route path="/PartnershipPlatform" element={<PartnershipPlatform />} />
                
                <Route path="/RequestPartnerAccess" element={<RequestPartnerAccess />} />
                
                <Route path="/PostPurchase" element={<PostPurchase />} />
                
                <Route path="/DeliverySettings" element={<DeliverySettings />} />
                
                <Route path="/MarketManagement" element={<MarketManagement />} />
                
                <Route path="/EnhancedThemeManager" element={<EnhancedThemeManager />} />
                
                <Route path="/TaxManagement" element={<TaxManagement />} />
                
                <Route path="/TaxRegions" element={<TaxRegions />} />
                
                <Route path="/TaxRates" element={<TaxRates />} />
                
                <Route path="/ProductTaxCategories" element={<ProductTaxCategories />} />
                
                <Route path="/TaxReports" element={<TaxReports />} />
                
                <Route path="/Brand" element={<Brand />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/PendingUsers" element={<PendingUsers />} />
                
                <Route path="/PendingUserApproval" element={<PendingUserApproval />} />
                
                <Route path="/AccessControl" element={<AccessControl />} />
                
                <Route path="/InterfacePreferences" element={<InterfacePreferences />} />
                
                <Route path="/EmployeeInformationCategories" element={<EmployeeInformationCategories />} />
                
                <Route path="/SafetyErrorHandler" element={<SafetyErrorHandler />} />
                
                <Route path="/RoleManagement" element={<RoleManagement />} />
                
                <Route path="/QuickUserAssignment" element={<QuickUserAssignment />} />
                
                <Route path="/CopartSettings" element={<CopartSettings />} />
                
                <Route path="/CopartImporter" element={<CopartImporter />} />
                
                <Route path="/CopartWatchlist" element={<CopartWatchlist />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}