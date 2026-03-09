import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      color: '#F0F0F0',
      flexDirection: 'column',
      gap: '24px',
      textAlign: 'center',
      padding: '20px',
    }}>
      <div style={{ fontSize: '4rem', lineHeight: 1 }}>⛔</div>
      <div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>
          Access Denied
        </h1>
        <p style={{ color: '#6B6B6B', fontSize: '0.9rem' }}>
          Your role <strong style={{ color: '#FFA94D' }}>{user?.role}</strong> does not have permission to view this page.
        </p>
      </div>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          padding: '11px 28px',
          background: '#E8FF47',
          color: '#0A0A0A',
          border: 'none',
          borderRadius: '8px',
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
