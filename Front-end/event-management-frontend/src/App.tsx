import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './events/context/AuthContext';
import ProtectedRoute from './events/components/ProtectedRoute';
import LoginPage from './events/auth/LoginPage';
import RegisterPage from './events/auth/RegisterPage';
import UserDashboard from './events/user/UserDashboard';
import OrganizerDashboard from './events/organizer/OrganizerDashboard';
import './index.css';

/** Sends authenticated users to their role-specific dashboard */
function RoleRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="page-loader"><span className="page-loader-ring"/></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'organizer' ? '/organizer' : '/home'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Role redirect from root and /dashboard */}
          <Route path="/"          element={<RoleRedirect />} />
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* User dashboard — attendees only */}
          <Route path="/home" element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }/>

          {/* Organizer dashboard — organizers only */}
          <Route path="/organizer" element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }/>

          {/* Unauthorized */}
          <Route path="/unauthorized" element={
            <div style={{
              minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
              background:'var(--cream)',flexDirection:'column',gap:16,fontFamily:'var(--sans)',
              textAlign:'center',padding:20,
            }}>
              <div style={{fontSize:'3rem'}}>⛔</div>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.8rem',fontWeight:700,color:'var(--ink)'}}>
                Access Denied
              </h1>
              <p style={{color:'var(--ink-3)',fontSize:'.9rem'}}>You don't have permission to view this page.</p>
              <a href="/" style={{
                marginTop:8,padding:'10px 24px',background:'var(--ember)',color:'white',
                borderRadius:8,textDecoration:'none',fontSize:'.88rem',fontWeight:600,
              }}>Go Home</a>
            </div>
          }/>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
