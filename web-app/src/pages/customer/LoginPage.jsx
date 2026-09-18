import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ phone: '', username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState('customer'); // 'customer' or 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loginRole === 'customer' && !form.phone) {
      setError(t('errors.required_field'));
      return;
    }
    if (loginRole === 'admin' && !form.username) {
      setError(t('errors.required_field'));
      return;
    }
    if (!form.password) {
      setError(t('errors.required_field'));
      return;
    }
    setLoading(true);
    setError('');

    const loginData = { password: form.password };
    if (loginRole === 'customer') {
      loginData.phone = form.phone;
    } else {
      loginData.username = form.username;
    }

    const { error: loginError } = await login(loginData);

    if (loginError) {
      console.error("Login Error:", loginError);
      setError(loginError.message || t('errors.login_failed'));
    } else {
      if (loginRole === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-page__left">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__header">
            <div className="auth-form__logo">A</div>
            <h1 className="auth-form__title">{t('auth.login_title')}</h1>
            <p className="auth-form__subtitle">{t('auth.login_subtitle')}</p>
          </div>

          {error && (
            <div className="auth-form__error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Role Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => { setLoginRole('customer'); setError(''); }}
              style={{
                flex: 1, padding: '10px 0', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                background: loginRole === 'customer' ? 'var(--bg-card)' : 'transparent',
                color: loginRole === 'customer' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: loginRole === 'customer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => { setLoginRole('admin'); setError(''); }}
              style={{
                flex: 1, padding: '10px 0', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                background: loginRole === 'admin' ? 'var(--bg-card)' : 'transparent',
                color: loginRole === 'admin' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: loginRole === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Admin
            </button>
          </div>

          <div className="auth-form__fields">
            {loginRole === 'customer' ? (
              <div className="input-group">
                <label className="input-group__label">{t('auth.phone')}</label>
                <div className="input-wrapper">
                  <Phone size={16} className="input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    className="input input--with-icon"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    required={loginRole === 'customer'}
                  />
                </div>
              </div>
            ) : (
              <div className="input-group">
                <label className="input-group__label">Username</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', color: 'var(--text-muted)' }}>@</span>
                  <input
                    type="text"
                    name="username"
                    className="input input--with-icon"
                    placeholder="admin"
                    value={form.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required={loginRole === 'admin'}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-group__label">{t('auth.password')}</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="input input--with-icon"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--lg btn--full"
            disabled={loading}
            style={{ marginBottom: 'var(--space-6)' }}
          >
            {loading ? (
              <>
                <span className="spinner spinner--sm btn__spinner" />
                {t('auth.logging_in')}
              </>
            ) : (
              t('auth.login_btn')
            )}
          </button>

          {loginRole === 'customer' && (
            <p className="auth-form__footer">
              {t('auth.no_account')}{' '}
              <Link to="/register">{t('nav.register')}</Link>
            </p>
          )}
        </form>
      </div>

      <div className="auth-page__right">
        <div className="auth-page__right-pattern" />
        <div className="auth-page__right-content">
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🍘</div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>{t('app_name')}</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', maxWidth: '320px' }}>
            {t('home.hero_subtitle')}
          </p>
        </div>
      </div>
    </div>
  );
}
