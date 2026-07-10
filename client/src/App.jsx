import { Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import useAuth from './hooks/useAuth';

// placeholder until the real dashboard layout lands on Day 6
function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Hi {user.name}</h1>
      <p>You are signed in as a {user.role}. Trust score: {user.trustScore}</p>
      <button onClick={logout}>Log out</button>
    </main>
  );
}

function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Lend-Ring</h1>
      <p>Rent what you need, lend what you don't.</p>
      <p>
        <Link to="/login">Log in</Link> · <Link to="/register">Sign up</Link>
      </p>
    </main>
  );
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
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;