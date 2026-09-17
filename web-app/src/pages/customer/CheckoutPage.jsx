import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Banknote, ArrowLeft, Loader } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import useCartStore from '../../store/cartStore';
import { supabase } from '../../config/supabase';
import { formatPrice, calculateDeliveryCharge } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    address: profile?.address || '',
    city: profile?.city || '',
    pincode: profile?.pincode || '',
  });

  const subtotal = getSubtotal();
  // Simple distance estimate — in production, use geocoding
  const estimatedDistance = 3; // Default 3km for demo
  const deliveryCharge = calculateDeliveryCharge(estimatedDistance);
  const total = subtotal + deliveryCharge;

  if (items.length === 0) {
    navigate('/cart', { replace: true });
    return null;
  }

  const handlePlaceOrder = async () => {
    if (!address.address || !address.city) {
      toast.error(t('errors.required_field'));
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const { data, error } = await supabase.rpc('place_order', {
        p_customer_id: user.id,
        p_customer_name: profile?.full_name || '',
        p_customer_phone: profile?.phone || '',
        p_delivery_address: address.address,
        p_delivery_city: address.city,
        p_delivery_pincode: address.pincode,
        p_distance_km: estimatedDistance,
        p_items: JSON.stringify(orderItems),
      });

      if (error) throw error;

      clearCart();
      toast.success(t('order.success_title'));
      navigate(`/order-success/${data.order_id}`);
    } catch (err) {
      console.error('Order error:', err);
      toast.error(err.message || t('errors.order_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-5)' }}>
        <ArrowLeft size={16} /> {t('common.back')}
      </button>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
        {t('checkout.title')}
      </h1>

      <div className="checkout-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Delivery Address */}
          <div className="checkout-section">
            <h3 className="checkout-section__title"><MapPin size={20} /> {t('checkout.delivery_address')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label className="input-group__label">{t('checkout.name')}</label>
                <input className="input" value={profile?.full_name || ''} disabled />
              </div>
              <div className="input-group">
                <label className="input-group__label">{t('checkout.phone')}</label>
                <input className="input" value={profile?.phone || ''} disabled />
              </div>
              <div className="input-group">
                <label className="input-group__label">{t('checkout.address')} *</label>
                <textarea className="input textarea" value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} rows={2} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="input-group">
                  <label className="input-group__label">{t('checkout.city')} *</label>
                  <input className="input" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-group__label">{t('checkout.pincode')}</label>
                  <input className="input" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} maxLength={6} />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-section">
            <h3 className="checkout-section__title"><Banknote size={20} /> {t('checkout.payment_method')}</h3>
            <div className="payment-option">
              <div className="payment-option__radio" />
              <Banknote size={24} style={{ color: 'var(--color-accent-600)' }} />
              <div className="payment-option__info">
                <div className="payment-option__name">{t('checkout.cod')}</div>
                <p className="payment-option__desc">{t('checkout.cod_desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h3 className="cart-summary__title">{t('checkout.order_summary')}</h3>
          {items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{item.name} × {item.quantity}</span>
              <span style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="divider" />
          <div className="cart-summary__row">
            <span className="cart-summary__label">{t('cart.subtotal')}</span>
            <span className="cart-summary__value">{formatPrice(subtotal)}</span>
          </div>
          <div className="cart-summary__row">
            <span className="cart-summary__label">{t('cart.delivery_charge')} (~{estimatedDistance}{t('checkout.km')})</span>
            <span className={deliveryCharge === 0 ? 'cart-summary__free' : 'cart-summary__value'}>
              {deliveryCharge === 0 ? t('cart.free') : formatPrice(deliveryCharge)}
            </span>
          </div>
          <div className="cart-summary__row cart-summary__row--total">
            <span>{t('cart.total')}</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button
            className="btn btn--primary btn--lg btn--full"
            style={{ marginTop: 'var(--space-5)' }}
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? <><Loader size={18} className="animate-spin" /> {t('checkout.placing')}</> : t('checkout.place_order')}
          </button>
        </div>
      </div>
    </div>
  );
}
