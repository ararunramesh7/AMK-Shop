import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Phone, MapPin, Building, Hash, AlertCircle } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { validatePhone, validatePincode } from '../../utils/helpers';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
    address: '', city: '', pincode: '',
  });
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
    if (!form.email.trim()) return t('errors.invalid_email');
    if (!form.phone.trim() || !validatePhone(form.phone)) return t('errors.invalid_phone');
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

    const { error: regError } = await register({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      phone: form.phone,
      address: form.address,
      city: form.city,
      pincode: form.pincode,
    });

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

          <div className="auth-form__fields">
            <div className="input-group">
              <label className="input-group__label">{t('auth.full_name')} <span className="input-group__required">*</span></label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input type="text" name="fullName" className="input input--with-icon" value={form.fullName} onChange={handleChange} required />
              </div>
            </div>

            <div className="auth-form__row">
              <div className="input-group">
                <label className="input-group__label">{t('auth.email')} <span className="input-group__required">*</span></label>
                <div className="input-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input type="email" name="email" className="input input--with-icon" value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="input-group">
                <label className="input-group__label">{t('auth.phone')} <span className="input-group__required">*</span></label>
                <div className="input-wrapper">
                  <Phone size={16} className="input-icon" />
                  <input type="tel" name="phone" className="input input--with-icon" placeholder="9876543210" value={form.phone} onChange={handleChange} required />
                </div>
              </div>
            </div>

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
