import { useState,type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = (location.state as any)?.from?.pathname || null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(email, password);
      // Role-based redirect is handled in App.tsx via RoleRedirect
      navigate(from || '/', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      {/* Left */}
      <div className="auth-panel">
        <div className="auth-panel-deco">
          <span/><span/><span/>
        </div>
        <div className="auth-panel-dots">
          {Array.from({length:21}).map((_,i)=><span key={i}/>)}
        </div>
        <div className="auth-panel-inner">
          <div className="auth-brand">
            <div className="auth-brand-mark">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L18 16H2L10 2Z" fill="white"/>
              </svg>
            </div>
            <span className="auth-brand-name">Evently</span>
          </div>
          <div className="auth-panel-copy">
            <h2>Events that<br/><em>bring people</em><br/>together.</h2>
            <p>Discover amazing events or host your own. Sign in to get started.</p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="auth-form-area">
        <div className="auth-card">
          <div className="auth-card-head">
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="alert error">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{flexShrink:0,marginTop:1}}>
                <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M7.5 4.5v3M7.5 10h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Email address</label>
              <div className="field-wrap">
                <svg className="field-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x=".75" y="2.75" width="13.5" height="9.5" rx="1.75" stroke="currentColor" strokeWidth="1.3"/>
                  <path d=".75 5.5l6.75 3.75 6.75-3.75" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e=>setEmail(e.target.value)} required autoComplete="email"/>
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className="field-wrap">
                <svg className="field-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="2.75" y="6.75" width="9.5" height="6.5" rx="1.25" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M4.5 6.75V5a3 3 0 016 0v1.75" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <input type={showPw?'text':'password'} placeholder="Your password" value={password}
                  onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/>
                <button type="button" className="pw-toggle" onClick={()=>setShowPw(v=>!v)}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M1.5 7.5s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="7.5" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    {showPw && <path d="M2.5 2.5l10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>}
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn ink" disabled={loading}>
              {loading ? <span className="btn-spin"/> : 'Sign in'}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
