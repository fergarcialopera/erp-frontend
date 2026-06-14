import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/app/providers/AuthContext";
import {
  ClinicAppGuard,
  PlatformAppGuard,
  ProtectedRoute,
  RoleHomeRedirect,
} from "@/components/ProtectedRoute";
import AppLayout from "@/components/layouts/AppLayout";
import PlatformLayout from "@/components/layouts/PlatformLayout";
import LoginPage from "@/app/routes/Login";
import RecoverPage from "@/app/routes/Recover";
import DashboardPage from "@/app/routes/Dashboard";
import ProductsPage from "@/app/routes/Products";
import InventoryPage from "@/app/routes/Inventory";
import AmbientesPage from "@/app/routes/Ambientes";
import AmbienteDetailPage from "@/app/routes/AmbienteDetail";
import ExitLogsPage from "@/app/routes/ExitLogs";
import NewExitLogPage from "@/app/routes/NewExitLog";
import IncidentsPage from "@/app/routes/Incidents";
import NewIncidentPage from "@/app/routes/NewIncident";
import UsersPage from "@/app/routes/Users";
import AuditLogsPage from "@/app/routes/AuditLogs";
import PlatformHomePage from "@/app/routes/platform/PlatformHome";
import PlatformClinicsPage from "@/app/routes/platform/PlatformClinics";
import PlatformClinicDetailPage from "@/app/routes/platform/PlatformClinicDetail";
import PlatformProductsPage from "@/app/routes/platform/PlatformProducts";
import PlatformAmbientesPage from "@/app/routes/platform/PlatformAmbientes";
import PlatformAmbienteDetailPage from "@/app/routes/platform/PlatformAmbienteDetail";
import PlatformIncidentsPage from "@/app/routes/platform/PlatformIncidents";
import NotFound from "@/app/routes/NotFound";
import { ROUTE_MIN_ROLE } from "@/config/navigation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/recover" element={<RecoverPage />} />
            <Route path="/" element={<RoleHomeRedirect />} />

            <Route path="/users" element={<Navigate to="/platform/users" replace />} />

            <Route
              element={
                <ProtectedRoute requiredPermission="superAdminPlatform">
                  <PlatformAppGuard>
                    <PlatformLayout />
                  </PlatformAppGuard>
                </ProtectedRoute>
              }
            >
              <Route path="/platform" element={<PlatformHomePage />} />
              <Route path="/platform/clinics" element={<PlatformClinicsPage />} />
              <Route path="/platform/clinics/:id" element={<PlatformClinicDetailPage />} />
              <Route path="/platform/users" element={<UsersPage />} />
              <Route path="/platform/products" element={<PlatformProductsPage />} />
              <Route path="/platform/ambientes" element={<PlatformAmbientesPage />} />
              <Route path="/platform/ambientes/:id" element={<PlatformAmbienteDetailPage />} />
              <Route path="/platform/incidents" element={<PlatformIncidentsPage />} />
              <Route
                path="/platform/audit-logs"
                element={
                  <ProtectedRoute requiredPermission="audit">
                    <AuditLogsPage platformScope />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route
              element={
                <ProtectedRoute>
                  <ClinicAppGuard>
                    <AppLayout />
                  </ClinicAppGuard>
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route
                path="/products"
                element={
                  <ProtectedRoute requiredRole={ROUTE_MIN_ROLE.products}>
                    <ProductsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute requiredRole={ROUTE_MIN_ROLE.inventory}>
                    <InventoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ambientes"
                element={
                  <ProtectedRoute requiredRole={ROUTE_MIN_ROLE.ambientes}>
                    <AmbientesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ambientes/:id"
                element={
                  <ProtectedRoute requiredRole={ROUTE_MIN_ROLE.ambienteDetail}>
                    <AmbienteDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/exit-logs" element={<ExitLogsPage />} />
              <Route
                path="/incidents"
                element={
                  <ProtectedRoute requiredRole={ROUTE_MIN_ROLE.incidents}>
                    <IncidentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/incidents/new"
                element={
                  <ProtectedRoute requiredRole={ROUTE_MIN_ROLE.incidentsNew}>
                    <NewIncidentPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/exit-logs/new" element={<NewExitLogPage />} />
              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute requiredPermission="audit">
                    <AuditLogsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
