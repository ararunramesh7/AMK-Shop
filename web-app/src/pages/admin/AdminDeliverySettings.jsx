import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';
import { Truck, Save } from 'lucide-react';

export default function AdminDeliverySettings() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    shop_location: 'Main Branch',
    free_delivery_distance_km: 2,
    extra_charge_per_km: 15,
    business_hours: '09:00 AM - 08:00 PM',
    delivery_available: true,
  });
  const [settingsId, setSettingsId] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('shop_settings').select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows
      
      if (data) {
        setSettings(data);
        setSettingsId(data.id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (settingsId) {
        const { error } = await supabase.from('shop_settings').update({
          shop_location: settings.shop_location,
          free_delivery_distance_km: Number(settings.free_delivery_distance_km),
          extra_charge_per_km: Number(settings.extra_charge_per_km),
          business_hours: settings.business_hours,
          delivery_available: settings.delivery_available
        }).eq('id', settingsId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('shop_settings').insert({
          shop_location: settings.shop_location,
          free_delivery_distance_km: Number(settings.free_delivery_distance_km),
          extra_charge_per_km: Number(settings.extra_charge_per_km),
          business_hours: settings.business_hours,
          delivery_available: settings.delivery_available
        }).select().single();
        if (error) throw error;
        setSettingsId(data.id);
      }
      toast.success('Delivery settings saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner--lg" /></div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="admin-section">
        <div className="admin-section__header">
          <h3 className="admin-section__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={24} style={{ color: 'var(--color-primary)' }} />
            Delivery Settings
          </h3>
        </div>
        
        <form onSubmit={handleSave} className="admin-section__body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="form-group">
            <label className="form-label">Shop Location</label>
            <input 
              type="text" 
              className="form-input" 
              name="shop_location"
              value={settings.shop_location}
              onChange={handleChange}
              placeholder="e.g. 123 Snack Street, Chennai"
              required
            />
          </div>

          <div className="admin-grid-2">
            <div className="form-group">
              <label className="form-label">Free Delivery Distance (km)</label>
              <input 
                type="number" 
                className="form-input" 
                name="free_delivery_distance_km"
                value={settings.free_delivery_distance_km}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Extra Charge Per Km (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                name="extra_charge_per_km"
                value={settings.extra_charge_per_km}
                onChange={handleChange}
                min="0"
                step="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Business Hours</label>
            <input 
              type="text" 
              className="form-input" 
              name="business_hours"
              value={settings.business_hours}
              onChange={handleChange}
              placeholder="e.g. 09:00 AM - 08:00 PM"
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <label className="switch">
              <input 
                type="checkbox" 
                name="delivery_available"
                checked={settings.delivery_available}
                onChange={handleChange}
              />
              <span className="slider round"></span>
            </label>
            <span style={{ fontWeight: 600 }}>{settings.delivery_available ? 'Delivery is Currently Available' : 'Delivery is Unavailable (Paused)'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-color-light)' }}>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? <div className="spinner" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 28px;
        }
        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
        }
        input:checked + .slider {
          background-color: var(--color-primary);
        }
        input:checked + .slider:before {
          transform: translateX(22px);
        }
        .slider.round {
          border-radius: 34px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
