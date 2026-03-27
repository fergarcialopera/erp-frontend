import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/app/providers/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/layouts/AppLayout";
import LoginPage from "@/app/routes/Login";
import DashboardPage from "@/app/routes/Dashboard";
import ProductsPage from "@/app/routes/Products";
import InventoryPage from "@/app/routes/Inventory";
import LockersPage from "@/app/routes/Lockers";
import LockerDetailPage from "@/app/routes/LockerDetail";
import ExitLogsPage from "@/app/routes/ExitLogs";
import NewExitLogPage from "@/app/routes/NewExitLog";
import NewEntryLogPage from "@/app/routes/NewEntryLog";
import UsersPage from "@/app/routes/Users";
import AuditLogsPage from "@/app/routes/AuditLogs";
import NotFound from "@/app/routes/NotFound";

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
                  <ProtectedRoute requiredRole="ADMIN">
                    <ProductsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute requiredRole="TECHNICIAN">
                    <InventoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lockers"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <LockersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lockers/:id"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <LockerDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/exit-logs" element={<ExitLogsPage />} />
              <Route
                path="/exit-logs/new"
                element={
                  <ProtectedRoute requiredRole="TECHNICIAN">
                    <NewExitLogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/entry-logs/new"
                element={
                  <ProtectedRoute requiredRole="TECHNICIAN">
                    <NewEntryLogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
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
