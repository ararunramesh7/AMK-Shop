import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Phone, MapPin, Building, Hash, Save, Loader } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { profile, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    pincode: profile?.pincode || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateProfile(form);
    if (error) toast.error(t('errors.generic'));
    else toast.success(t('profile.saved'));
    setSaving(false);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>{t('profile.title')}</h1>
      <form onSubmit={handleSave} className="checkout-section">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="input-group"><label className="input-group__label"><User size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t('auth.full_name')}</label><input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div className="input-group"><label className="input-group__label"><Phone size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t('auth.phone')}</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="input-group"><label className="input-group__label"><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t('auth.address')}</label><textarea className="input textarea" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="input-group"><label className="input-group__label"><Building size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t('auth.city')}</label><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div className="input-group"><label className="input-group__label"><Hash size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t('auth.pincode')}</label><input className="input" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} maxLength={6} /></div>
          </div>
          <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={saving} style={{ marginTop: 'var(--space-2)' }}>
            {saving ? <><Loader size={16} className="animate-spin" /> {t('profile.saving')}</> : <><Save size={16} /> {t('profile.save')}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
