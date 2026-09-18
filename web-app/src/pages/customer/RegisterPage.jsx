import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, User, Phone, MapPin, Building, Hash, AlertCircle } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { validatePhone, validatePincode } from '../../utils/helpers';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', phone: '', username: '', password: '', confirmPassword: '',
    address: '', city: '', pincode: '',
  });
  const [registerRole, setRegisterRole] = useState('customer'); // 'customer' or 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.fullName.trim()) return t('errors.required_field');
    if (registerRole === 'customer' && (!form.phone.trim() || !validatePhone(form.phone))) return t('errors.invalid_phone');
    if (registerRole === 'admin' && !form.username.trim()) return t('errors.required_field');
    if (form.password.length < 6) return t('errors.password_short');
    if (form.password !== form.confirmPassword) return t('errors.password_mismatch');
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');

    const registerData = {
      password: form.password,
      fullName: form.fullName,
      address: form.address,
      city: form.city,
      pincode: form.pincode,
      role: registerRole,
    };

    if (registerRole === 'customer') {
      registerData.phone = form.phone;
    } else {
      registerData.username = form.username;
    }

    const { error: regError } = await register(registerData);

    if (regError) {
      setError(regError.message || t('errors.register_failed'));
    } else {
      navigate('/', { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-page__left">
        <form className="auth-form" onSubmit={handleSubmit} style={{ maxWidth: '480px' }}>
          <div className="auth-form__header">
            <div className="auth-form__logo">A</div>
            <h1 className="auth-form__title">{t('auth.register_title')}</h1>
            <p className="auth-form__subtitle">{t('auth.register_subtitle')}</p>
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
              onClick={() => { setRegisterRole('customer'); setError(''); }}
              style={{
                flex: 1, padding: '10px 0', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                background: registerRole === 'customer' ? 'var(--bg-card)' : 'transparent',
                color: registerRole === 'customer' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: registerRole === 'customer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => { setRegisterRole('admin'); setError(''); }}
              style={{
                flex: 1, padding: '10px 0', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                background: registerRole === 'admin' ? 'var(--bg-card)' : 'transparent',
                color: registerRole === 'admin' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: registerRole === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Admin
            </button>
          </div>

          <div className="auth-form__fields">
            <div className="input-group">
              <label className="input-group__label">{t('auth.full_name')} <span className="input-group__required">*</span></label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input type="text" name="fullName" className="input input--with-icon" value={form.fullName} onChange={handleChange} required />
              </div>
            </div>

            {registerRole === 'customer' ? (
              <div className="input-group">
                <label className="input-group__label">{t('auth.phone')} <span className="input-group__required">*</span></label>
                <div className="input-wrapper">
                  <Phone size={16} className="input-icon" />
                  <input type="tel" name="phone" className="input input--with-icon" placeholder="9876543210" value={form.phone} onChange={handleChange} required={registerRole === 'customer'} />
                </div>
              </div>
            ) : (
              <div className="input-group">
                <label className="input-group__label">Username <span className="input-group__required">*</span></label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', color: 'var(--text-muted)' }}>@</span>
                  <input type="text" name="username" className="input input--with-icon" placeholder="admin" value={form.username} onChange={handleChange} required={registerRole === 'admin'} />
                </div>
              </div>
            )}

            <div className="auth-form__row">
              <div className="input-group">
                <label className="input-group__label">{t('auth.password')} <span className="input-group__required">*</span></label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input type="password" name="password" className="input input--with-icon" value={form.password} onChange={handleChange} required minLength={6} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-group__label">{t('auth.confirm_password')} <span className="input-group__required">*</span></label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input type="password" name="confirmPassword" className="input input--with-icon" value={form.confirmPassword} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-group__label">{t('auth.address')}</label>
              <div className="input-wrapper">
                <MapPin size={16} className="input-icon" />
                <input type="text" name="address" className="input input--with-icon" value={form.address} onChange={handleChange} />
              </div>
            </div>

            <div className="auth-form__row">
              <div className="input-group">
                <label className="input-group__label">{t('auth.city')}</label>
                <div className="input-wrapper">
                  <Building size={16} className="input-icon" />
                  <input type="text" name="city" className="input input--with-icon" value={form.city} onChange={handleChange} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-group__label">{t('auth.pincode')}</label>
                <div className="input-wrapper">
                  <Hash size={16} className="input-icon" />
                  <input type="text" name="pincode" className="input input--with-icon" maxLength={6} value={form.pincode} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={loading} style={{ marginBottom: 'var(--space-6)' }}>
            {loading ? <><span className="spinner spinner--sm btn__spinner" /> {t('auth.registering')}</> : t('auth.register_btn')}
          </button>

          <p className="auth-form__footer">
            {t('auth.have_account')} <Link to="/login">{t('nav.login')}</Link>
          </p>
        </form>
      </div>

      <div className="auth-page__right">
        <div className="auth-page__right-pattern" />
        <div className="auth-page__right-content">
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🍘</div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>{t('app_name')}</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', maxWidth: '320px' }}>{t('home.hero_subtitle')}</p>
        </div>
      </div>
    </div>
  );
}
