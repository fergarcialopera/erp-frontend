import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/app/providers/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/layouts/AppLayout";
import LoginPage from "@/app/routes/Login";
import RecoverPage from "@/app/routes/Recover";
import DashboardPage from "@/app/routes/Dashboard";
import ProductsPage from "@/app/routes/Products";
import InventoryPage from "@/app/routes/Inventory";
import LockersPage from "@/app/routes/Lockers";
import LockerDetailPage from "@/app/routes/LockerDetail";
import ExitLogsPage from "@/app/routes/ExitLogs";
import NewExitLogPage from "@/app/routes/NewExitLog";
import IncidentsPage from "@/app/routes/Incidents";
import NewIncidentPage from "@/app/routes/NewIncident";
import UsersPage from "@/app/routes/Users";
import AuditLogsPage from "@/app/routes/AuditLogs";
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
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
                path="/lockers"
                element={
                  <ProtectedRoute requiredRole={ROUTE_MIN_ROLE.lockers}>
                    <LockersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lockers/:id"
                element={
                  <ProtectedRoute requiredRole={ROUTE_MIN_ROLE.lockerDetail}>
                    <LockerDetailPage />
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
                path="/users"
                element={
                  <ProtectedRoute requiredRole={ROUTE_MIN_ROLE.users}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute requiredRole={ROUTE_MIN_ROLE.auditLogs}>
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
