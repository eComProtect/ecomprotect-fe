import { Outlet, Route, Routes } from "react-router-dom";
import { Signup } from "./pages/signup.page";
import { Signin } from "./pages/signin.page";
import { Settings } from "./pages/settings.page";
import { NotFoundPage } from "./pages/notfound.page";
import { AdminSignin } from "./pages/adminsignin.page";
import { PlansPage } from "./pages/plan.page";
import { PostSignupFlowPage } from "./pages/signinflow.page";
import { UnderReviewComponent } from "./pages/underreview.page";
import Dashboard from "./pages/dashboard.page";
import Layout from "./layout/sidebar.layout";
import UserManagement from "./pages/usermanagemeent.page";
import StoreManagement from "./pages/storemanagement.page";
import ReportAnalysis from "./pages/reportanalysis.page";
import CustomerManagement from "./pages/customermanagement.page";
import NotificationsPage from "./pages/notification.page";
import OrderManagement from "./pages/ordermanagement.page";
import RiskSettings from "./pages/risksettings.page";
import CreateStaff from "./pages/staff.page";
import VerifyEmailPage from "./pages/acceptinvitation.page";
import { ForgotPasswordForm } from "./pages/forgotpassword.page";
import ResetPasswordPage from "./pages/reset.page";
import AcceptInvitation from "./pages/acceptinvitation.page";
import CreateStore from "./pages/createstores.page";
import UserReport from "./pages/userreport.page";
import { ProtectedRoute } from "./layout/protectroute";
import { AdminProtectedRoute } from "./layout/adminprotectroute";
import WideNetworkReport from "./pages/widenetworkreport.page";
import OnboardingReport from "./pages/onboardingreport.page";
import SystemEffectivenessReport from "./pages/effectivenesreport.page";
import { ShopifyInstall } from "./pages/ShopifyInstall";
import ShopifyCallback from "./pages/ShopifyCallback";
import EmbeddedEntry from "./pages/embeddedentry.page";
import BillingPage from "./pages/billing.page";
import CompleteProfilePage from "./pages/completeprofile.page";
import EnableNotificationsPage from "./pages/enablenotifications.page";
import WaiverPage from "./pages/waiver.page";
import PendingActionsPage from "./pages/pendingactions.page";
import { PrivacyPolicyPage } from "./pages/privacypolicy.page";
import ConnectShopify from "./pages/connectshopify.page";

export const Router = () => {
  return (
      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<Signin />} />
        <Route path="/admin-signin" element={<AdminSignin />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route path="/signup" element={<Signup />} />
        {/* Root: embedded entry gate (Shopify Admin) or public marketing site */}
        <Route path="/" element={<EmbeddedEntry />} />
        <Route path="/select-plans" element={<PlansPage />} />
        <Route path="/post-signup" element={<PostSignupFlowPage />} />
        <Route path="/under-review" element={<UnderReviewComponent />} />
        <Route path="/accept-invite" element={<AcceptInvitation />} />
        <Route path="/install" element={<ShopifyInstall />} />
        <Route path="/enable-notifications" element={<EnableNotificationsPage />} />
        <Route path="/waiver/:orderId" element={<WaiverPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/auth/callback" element={<ShopifyCallback />} />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes with Sidebar Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout>
                <Outlet />
              </Layout>
            </ProtectedRoute>
          }
        >
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/customer-management"
            element={<UserManagement />}
          />
          <Route
            path="/admin/store-management"
            element={
              <AdminProtectedRoute>
                <StoreManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/report-analysis"
            element={
              <AdminProtectedRoute>
                <ReportAnalysis />
              </AdminProtectedRoute>
            }
          />

          {/* Reports */}

          <Route
            path="/admin/wide-network-report"
            element={
              <AdminProtectedRoute>
                <WideNetworkReport />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/onboarding-report"
            element={
              <AdminProtectedRoute>
                <OnboardingReport />
              </AdminProtectedRoute>
            }
          />


          <Route
            path="/admin/effectiveness-report"
            element={
              <AdminProtectedRoute>
                <SystemEffectivenessReport />
              </AdminProtectedRoute>
            }
          />


          <Route
            path="/admin/create-store"
            element={
              <AdminProtectedRoute>
                <CreateStore />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminProtectedRoute>
                <Settings />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/user/customer-management"
            element={<CustomerManagement />}
          />
          <Route path="/user/notification" element={<NotificationsPage />} />
          <Route path="/user/report" element={<UserReport />} />
          <Route path="/user/settings" element={<RiskSettings />} />
          <Route path="/user/order-management" element={<OrderManagement />} />
          <Route path="/user/pending-actions" element={<PendingActionsPage />} />
          <Route path="/user/create-staff" element={<CreateStaff />} />
          <Route path="/user/connect-shopify" element={<ConnectShopify />} />
        </Route>

        {/* Top-level Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  );
};
