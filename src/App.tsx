import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import ProductsPage from "@/pages/Products";
import InventoryPage from "@/pages/Inventory";
import LockersPage from "@/pages/Lockers";
import LockerDetailPage from "@/pages/LockerDetail";
import OpenOrdersPage from "@/pages/OpenOrders";
import NewOpenOrderPage from "@/pages/NewOpenOrder";
import UsersPage from "@/pages/Users";
import AuditLogsPage from "@/pages/AuditLogs";
import NotFound from "@/pages/NotFound";

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
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProtectedRoute requiredRole="RESPONSABLE"><ProductsPage /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute requiredRole="RESPONSABLE"><InventoryPage /></ProtectedRoute>} />
              <Route path="/lockers" element={<LockersPage />} />
              <Route path="/lockers/:id" element={<LockerDetailPage />} />
              <Route path="/open-orders" element={<OpenOrdersPage />} />
              <Route path="/open-orders/new" element={<ProtectedRoute requiredRole="RESPONSABLE"><NewOpenOrderPage /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute requiredRole="ADMIN"><UsersPage /></ProtectedRoute>} />
              <Route path="/audit-logs" element={<ProtectedRoute requiredRole="ADMIN"><AuditLogsPage /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
