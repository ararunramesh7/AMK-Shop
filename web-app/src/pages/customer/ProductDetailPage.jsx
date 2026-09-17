import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Minus, Check, ShoppingCart, Package } from 'lucide-react';
import { supabase } from '../../config/supabase';
import useCartStore from '../../store/cartStore';
import { formatPrice, getStockStatus, getLocalizedField } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { addItem, isInCart, getItemQuantity, incrementQuantity, decrementQuantity } = useCartStore();
  const lang = i18n.language;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*, categories(name, name_ta, name_hi, name_te, name_kn, name_ml)').eq('id', id).single();
    if (data) setProduct(data);
    setLoading(false);
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner--lg" /></div>;
  if (!product) return <div className="empty-state"><h3 className="empty-state__title">{t('common.no_results')}</h3></div>;

  const name = getLocalizedField(product, 'name', lang);
  const description = getLocalizedField(product, 'description', lang);
  const stockStatus = getStockStatus(product.stock);
  const inCart = isInCart(product.id);
  const qty = getItemQuantity(product.id);

  const handleAddToCart = () => {
    const success = addItem(product);
    if (success) toast.success(t('product.added'));
    else toast.error(t('errors.out_of_stock'));
  };

  return (
    <div className="animate-fade-in">
      <Link to="/products" className="btn btn--ghost btn--sm" style={{ marginBottom: 'var(--space-5)' }}>
        <ArrowLeft size={16} /> {t('common.back')}
      </Link>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', gap: 'var(--space-8)' }}>
          <div style={{ aspectRatio: '1', borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
            {product.image_url ? <img src={product.image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '96px', background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)' }}>🍘</div>}
          </div>
          <div>
            {product.categories && <span className="badge badge--primary" style={{ marginBottom: 'var(--space-3)', display: 'inline-flex' }}>{getLocalizedField(product.categories, 'name', lang)}</span>}
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>{name}</h1>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-tertiary)', lineHeight: 1.7, marginBottom: 'var(--space-6)' }}>{description}</p>
            <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
              <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>{t('product.price')}</div><div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{formatPrice(product.price)}</div></div>
              {product.weight && <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>{t('product.weight')}</div><div style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{product.weight}</div></div>}
              <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>{t('product.stock')}</div><span className={`badge ${stockStatus === 'available' ? 'badge--success' : stockStatus === 'low_stock' ? 'badge--warning' : 'badge--error'} badge--dot`}>{t(`product.${stockStatus}`)}</span></div>
            </div>
            {product.stock > 0 && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>{t('product.packets_left', { count: product.stock })}</p>}
            {inCart ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div className="qty-control"><button className="qty-control__btn" onClick={() => decrementQuantity(product.id)}><Minus size={16} /></button><span className="qty-control__value">{qty}</span><button className="qty-control__btn" onClick={() => incrementQuantity(product.id)} disabled={qty >= product.stock}><Plus size={16} /></button></div>
                <Link to="/cart" className="btn btn--primary btn--lg"><ShoppingCart size={18} /> {t('cart.checkout')}</Link>
              </div>
            ) : (
              <button className="btn btn--primary btn--lg" onClick={handleAddToCart} disabled={stockStatus === 'out_of_stock'} style={{ gap: 'var(--space-2)' }}>
                {stockStatus === 'out_of_stock' ? <><Package size={18} /> {t('product.out_of_stock')}</> : <><Plus size={18} /> {t('product.add_to_cart')}</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
