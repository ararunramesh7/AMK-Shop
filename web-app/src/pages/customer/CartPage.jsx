import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import { formatPrice, getLocalizedField } from '../../utils/helpers';

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, incrementQuantity, decrementQuantity, removeItem, clearCart, getSubtotal, getTotalItems } = useCartStore();
  const lang = i18n.language;

  if (items.length === 0) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-state__icon"><ShoppingBag size={80} /></div>
        <h2 className="empty-state__title">{t('cart.empty')}</h2>
        <p className="empty-state__description">{t('cart.empty_desc')}</p>
        <Link to="/products" className="btn btn--primary btn--lg">{t('cart.browse')}</Link>
      </div>
    );
  }

  const subtotal = getSubtotal();

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
          {t('cart.title')} <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)', fontWeight: 400 }}>({t('cart.items', { count: getTotalItems() })})</span>
        </h1>
        <button className="btn btn--ghost btn--sm" onClick={clearCart}><Trash2 size={14} /> {t('cart.clear')}</button>
      </div>

      <div className="cart-page">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item__image" style={{
                background: item.image_url ? `url(${item.image_url}) center/cover` : 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px'
              }}>
                {!item.image_url && '🍘'}
              </div>
              <div className="cart-item__info">
                <span className="cart-item__name">{getLocalizedField(item, 'name', lang)}</span>
                {item.weight && <span className="cart-item__weight">{item.weight}</span>}
                <span className="cart-item__price">{formatPrice(item.price)} × {item.quantity} = {formatPrice(item.price * item.quantity)}</span>
              </div>
              <div className="cart-item__actions">
                <div className="qty-control">
                  <button className="qty-control__btn" onClick={() => decrementQuantity(item.id)} disabled={item.quantity <= 1}>
                    <Minus size={14} />
                  </button>
                  <span className="qty-control__value">{item.quantity}</span>
                  <button className="qty-control__btn" onClick={() => incrementQuantity(item.id)} disabled={item.quantity >= item.stock}>
                    <Plus size={14} />
                  </button>
                </div>
                <button className="cart-item__remove" onClick={() => removeItem(item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3 className="cart-summary__title">{t('checkout.order_summary')}</h3>
          <div className="cart-summary__row">
            <span className="cart-summary__label">{t('cart.subtotal')}</span>
            <span className="cart-summary__value">{formatPrice(subtotal)}</span>
          </div>
          <div className="cart-summary__row">
            <span className="cart-summary__label">{t('cart.delivery_charge')}</span>
            <span className="cart-summary__free">—</span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
            {t('home.free_delivery_desc')}
          </p>
          <div className="cart-summary__row cart-summary__row--total">
            <span>{t('cart.total')}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <button
            className="btn btn--primary btn--lg btn--full"
            style={{ marginTop: 'var(--space-4)' }}
            onClick={() => navigate('/checkout')}
          >
            {t('cart.checkout')} <ArrowRight size={18} />
          </button>
          <Link to="/products" className="btn btn--ghost btn--full" style={{ marginTop: 'var(--space-2)', textAlign: 'center', display: 'block' }}>
            {t('cart.continue_shopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
