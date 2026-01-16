import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import SearchResults from './pages/SearchResults';
import SeatSelection from './pages/SeatSelection';
import PassengerDetails from './pages/PassengerDetails';
import Payment from './pages/Payment';
import Ticket from './pages/Ticket';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

import OperatorsListing from './pages/OperatorsListing';
import OperatorProfile from './pages/OperatorProfile';
import RoutesPage from './pages/Routes';
import RouteDetail from './pages/RouteDetail';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Help from './pages/Help';
import FAQ from './pages/FAQ';
import ContactSupport from './pages/ContactSupport';

import UserOverview from './pages/dashboard/UserOverview';
import UserBookings from './pages/dashboard/UserBookings';
import UserProfile from './pages/dashboard/UserProfile';

import OperatorOverview from './pages/operator/OperatorOverview';
import ScheduleManagement from './pages/operator/ScheduleManagement';
import BookingManagement from './pages/operator/BookingManagement';
import FleetManagement from './pages/operator/FleetManagement';
import OperatorRoutes from './pages/operator/OperatorRoutes';
import OperatorSettings from './pages/operator/OperatorSettings';

import AdminSystemOverview from './pages/admin/AdminSystemOverview';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminOperatorManagement from './pages/admin/AdminOperatorManagement';
import AdminLogs from './pages/admin/AdminLogs';
import AdminSettings from './pages/admin/AdminSettings';
import AdminTrips from './pages/admin/AdminTrips';
import AdminBookings from './pages/admin/AdminBookings';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminPayments from './pages/admin/AdminPayments';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />
          <Route path="/search" element={<MainLayout><SearchResults /></MainLayout>} />
          <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
          <Route path="/signup" element={<MainLayout><Signup /></MainLayout>} />

          {/* Operators */}
          <Route path="/operators" element={<MainLayout><OperatorsListing /></MainLayout>} />
          <Route path="/operators/:operatorId" element={<MainLayout><OperatorProfile /></MainLayout>} />

          {/* Routes */}
          <Route path="/routes" element={<MainLayout><RoutesPage /></MainLayout>} />
          <Route path="/routes/:from/:to" element={<MainLayout><RouteDetail /></MainLayout>} />

          {/* Destinations */}
          <Route path="/destinations" element={<MainLayout><Destinations /></MainLayout>} />
          <Route path="/destinations/:cityName" element={<MainLayout><DestinationDetail /></MainLayout>} />

          {/* Help & Support */}
          <Route path="/help" element={<MainLayout><Help /></MainLayout>} />
          <Route path="/faq" element={<MainLayout><FAQ /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><ContactSupport /></MainLayout>} />

          {/* Booking Flow */}
          <Route path="/booking/seats/:tripId" element={<MainLayout><SeatSelection /></MainLayout>} />
          <Route path="/booking/passenger" element={<MainLayout><PassengerDetails /></MainLayout>} />
          <Route path="/booking/payment" element={<MainLayout><Payment /></MainLayout>} />
          <Route path="/booking/ticket/:bookingId" element={<MainLayout><Ticket /></MainLayout>} />

          {/* User Dashboard Routes */}
          <Route path="/traveller" element={<ProtectedRoute allowedRoles={['traveller']}><Navigate to="/traveller/dashboard" replace /></ProtectedRoute>} />
          <Route path="/traveller/dashboard" element={<ProtectedRoute allowedRoles={['traveller']}><DashboardLayout><UserOverview /></DashboardLayout></ProtectedRoute>} />
          <Route path="/traveller/bookings" element={<ProtectedRoute allowedRoles={['traveller']}><DashboardLayout><UserBookings /></DashboardLayout></ProtectedRoute>} />
          <Route path="/traveller/upcoming" element={<ProtectedRoute allowedRoles={['traveller']}><DashboardLayout><UserOverview /></DashboardLayout></ProtectedRoute>} />
          <Route path="/traveller/profile" element={<ProtectedRoute allowedRoles={['traveller']}><DashboardLayout><UserProfile /></DashboardLayout></ProtectedRoute>} />

          {/* Operator Dashboard Routes */}
          <Route path="/operator" element={<ProtectedRoute allowedRoles={['operator']}><Navigate to="/operator/dashboard" replace /></ProtectedRoute>} />
          <Route path="/operator/dashboard" element={<ProtectedRoute allowedRoles={['operator']}><DashboardLayout><OperatorOverview /></DashboardLayout></ProtectedRoute>} />
          <Route path="/operator/schedules" element={<ProtectedRoute allowedRoles={['operator']}><DashboardLayout><ScheduleManagement /></DashboardLayout></ProtectedRoute>} />
          <Route path="/operator/bookings" element={<ProtectedRoute allowedRoles={['operator']}><DashboardLayout><BookingManagement /></DashboardLayout></ProtectedRoute>} />
          <Route path="/operator/fleet" element={<ProtectedRoute allowedRoles={['operator']}><DashboardLayout><FleetManagement /></DashboardLayout></ProtectedRoute>} />
          <Route path="/operator/routes" element={<ProtectedRoute allowedRoles={['operator']}><DashboardLayout><OperatorRoutes /></DashboardLayout></ProtectedRoute>} />
          <Route path="/operator/settings" element={<ProtectedRoute allowedRoles={['operator']}><DashboardLayout><OperatorSettings /></DashboardLayout></ProtectedRoute>} />
          <Route path="/operator/*" element={<ProtectedRoute allowedRoles={['operator']}><DashboardLayout><OperatorOverview /></DashboardLayout></ProtectedRoute>} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Navigate to="/admin/dashboard" replace /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminSystemOverview /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminUserManagement /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/operators" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminOperatorManagement /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/trips" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminTrips /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminBookings /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/disputes" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminDisputes /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminPayments /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminLogs /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminSettings /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminSystemOverview /></DashboardLayout></ProtectedRoute>} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
