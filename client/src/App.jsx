import { Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import MyListingsPage from './pages/lender/MyListingsPage';
import ItemFormPage from './pages/lender/ItemFormPage';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RequireRole from './components/RequireRole';
import Placeholder from './components/Placeholder';
import useAuth from './hooks/useAuth';

function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
      <h1 className="text-3xl font-semibold text-gray-900">Lend-Ring</h1>
      <p className="text-gray-600">Rent what you need, lend what you don't.</p>
      <p className="text-sm">
        <Link to="/login" className="underline">Log in</Link>
        {' · '}
        <Link to="/register" className="underline">Sign up</Link>
      </p>
    </main>
  );
}

function DashboardHome() {
  const { user } = useAuth();
  const startPage = { renter: 'browse', lender: 'listings', admin: 'users' }[user.role];
  return <Navigate to={`/dashboard/${startPage}`} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* renter */}
        <Route path="browse" element={<RequireRole role="renter"><Placeholder title="Browse items" /></RequireRole>} />
        <Route path="orders" element={<RequireRole role="renter"><Placeholder title="My orders" /></RequireRole>} />

        {/* lender */}
        <Route path="listings" element={<RequireRole role="lender"><MyListingsPage /></RequireRole>} />
        <Route path="listings/:id/edit" element={<RequireRole role="lender"><ItemFormPage /></RequireRole>} />
        <Route path="add-item" element={<RequireRole role="lender"><ItemFormPage /></RequireRole>} />
        <Route path="orders-received" element={<RequireRole role="lender"><Placeholder title="Orders received" /></RequireRole>} />

        {/* admin */}
        <Route path="users" element={<RequireRole role="admin"><Placeholder title="Users" /></RequireRole>} />
        <Route path="moderate-listings" element={<RequireRole role="admin"><Placeholder title="Listings" /></RequireRole>} />
        <Route path="disputes" element={<RequireRole role="admin"><Placeholder title="Disputes" /></RequireRole>} />
        <Route path="transactions" element={<RequireRole role="admin"><Placeholder title="Transactions" /></RequireRole>} />
      </Route>
    </Routes>
  );
}

export default App;