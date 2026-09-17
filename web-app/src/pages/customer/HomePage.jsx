import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, ChevronRight, Truck, ChefHat, Award, Plus, Check } from 'lucide-react';
import { supabase } from '../../config/supabase';
import useCartStore from '../../store/cartStore';
import { formatPrice, getStockStatus, getLocalizedField } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) => s.isInCart);

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, featRes, popRes] = await Promise.all([
        supabase.from('categories').select('*').eq('status', 'active').order('display_order'),
        supabase.from('products').select('*, categories(name)').eq('is_featured', true).eq('status', 'available').limit(8),
        supabase.from('products').select('*, categories(name)').eq('is_popular', true).eq('status', 'available').limit(8),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (featRes.data) setFeaturedProducts(featRes.data);
      if (popRes.data) setPopularProducts(popRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const success = addItem(product);
    if (success) {
      toast.success(t('product.added'));
    } else {
      toast.error(t('errors.out_of_stock'));
    }
  };

  const categoryEmojis = ['🔄', '🥜', '🍟', '🍬', '🌶️', '📦', '⭐'];

  const lang = i18n.language;

  const ProductCard = ({ product }) => {
    const stockStatus = getStockStatus(product.stock);
    const inCart = isInCart(product.id);
    const name = getLocalizedField(product, 'name', lang);

    return (
      <div className="product-card">
        <Link to={`/products/${product.id}`} className="product-card__image-wrapper">
          {product.image_url ? (
            <img src={product.image_url} alt={name} className="product-card__image" loading="lazy" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)' }}>
              🍘
            </div>
          )}
          {stockStatus === 'low_stock' && (
            <span className="product-card__stock-badge badge badge--warning badge--dot">
              {t('product.low_stock')}
            </span>
          )}
          {stockStatus === 'out_of_stock' && (
            <span className="product-card__stock-badge badge badge--error badge--dot">
              {t('product.out_of_stock')}
            </span>
          )}
        </Link>
        <div className="product-card__body">
          {product.categories && (
            <span className="product-card__category">
              {getLocalizedField(product.categories, 'name', lang)}
            </span>
          )}
          <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
            <h3 className="product-card__name">{name}</h3>
          </Link>
          {product.weight && <span className="product-card__desc">{product.weight}</span>}
        </div>
        <div className="product-card__footer">
          <div>
            <span className="product-card__price">{formatPrice(product.price)}</span>
          </div>
          <button
            className={`product-card__add-btn ${inCart ? 'product-card__add-btn--in-cart' : ''}`}
            onClick={() => handleAddToCart(product)}
            disabled={stockStatus === 'out_of_stock'}
          >
            {inCart ? <><Check size={14} /> {t('product.in_cart')}</> : <><Plus size={14} /> {t('product.add_to_cart')}</>}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner--lg" />
        <p className="loading-screen__text">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__pattern" />
        <div className="hero__content">
          <h1 className="hero__title">
            {t('home.hero_title').split(' ').slice(0, -1).join(' ')}{' '}
            <span>{t('home.hero_title').split(' ').slice(-1)}</span>
          </h1>
          <p className="hero__subtitle">{t('home.hero_subtitle')}</p>
          <Link to="/products" className="hero__cta">
            <ShoppingCart size={20} />
            {t('home.shop_now')}
          </Link>
        </div>
      </section>

      {/* Features Strip */}
      <section className="features-strip stagger-children">
        <div className="feature-card">
          <div className="feature-card__icon feature-card__icon--delivery">
            <Truck size={24} />
          </div>
          <div>
            <h3 className="feature-card__title">{t('home.free_delivery')}</h3>
            <p className="feature-card__desc">{t('home.free_delivery_desc')}</p>
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-card__icon feature-card__icon--fresh">
            <ChefHat size={24} />
          </div>
          <div>
            <h3 className="feature-card__title">{t('home.fresh_made')}</h3>
            <p className="feature-card__desc">{t('home.fresh_made_desc')}</p>
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-card__icon feature-card__icon--quality">
            <Award size={24} />
          </div>
          <div>
            <h3 className="feature-card__title">{t('home.quality')}</h3>
            <p className="feature-card__desc">{t('home.quality_desc')}</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-header__title">{t('home.categories')}</h2>
            <Link to="/products" className="section-header__link">
              {t('home.view_all')} <ChevronRight size={16} />
            </Link>
          </div>
          <div className="category-chips">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="category-chip"
              >
                <div className="category-chip__icon">
                  {categoryEmojis[i % categoryEmojis.length]}
                </div>
                <span className="category-chip__name">
                  {getLocalizedField(cat, 'name', lang)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-header__title">{t('home.featured')}</h2>
            <Link to="/products?filter=featured" className="section-header__link">
              {t('home.view_all')} <ChevronRight size={16} />
            </Link>
          </div>
          <div className="product-grid stagger-children">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-header__title">{t('home.popular')}</h2>
            <Link to="/products?filter=popular" className="section-header__link">
              {t('home.view_all')} <ChevronRight size={16} />
            </Link>
          </div>
          <div className="product-grid stagger-children">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
