import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, X, Plus, Check, Filter } from 'lucide-react';
import { supabase } from '../../config/supabase';
import useCartStore from '../../store/cartStore';
import { formatPrice, getStockStatus, getLocalizedField, debounce } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) => s.isInCart);
  const lang = i18n.language;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').eq('status', 'active').order('display_order');
    if (data) setCategories(data);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*, categories(name, name_ta, name_hi, name_te, name_kn, name_ml)').neq('status', 'unavailable').order('created_at', { ascending: false });

    if (selectedCategory) query = query.eq('category_id', selectedCategory);
    if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);

    const filter = searchParams.get('filter');
    if (filter === 'featured') query = query.eq('is_featured', true);
    if (filter === 'popular') query = query.eq('is_popular', true);

    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  };

  const handleCategoryClick = (catId) => {
    const newCat = selectedCategory === catId ? '' : catId;
    setSelectedCategory(newCat);
    setSearchParams(newCat ? { category: newCat } : {});
  };

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
    if (value) setSearchParams({ search: value });
    else setSearchParams({});
  }, 400);

  const handleAddToCart = (product) => {
    const success = addItem(product);
    if (success) toast.success(t('product.added'));
    else toast.error(t('errors.out_of_stock'));
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-5)' }}>
        {t('home.all_products')}
      </h1>

      {/* Search */}
      <div className="search-bar" style={{ maxWidth: '500px', marginBottom: 'var(--space-5)' }}>
        <Search size={16} className="search-bar__icon" />
        <input
          type="text"
          className="search-bar__input"
          placeholder={t('nav.search')}
          defaultValue={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Category filters */}
      <div className="category-chips">
        <button
          className={`category-chip ${!selectedCategory ? 'category-chip--active' : ''}`}
          onClick={() => handleCategoryClick('')}
        >
          <div className="category-chip__icon">📋</div>
          <span className="category-chip__name">{t('common.all')}</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-chip ${selectedCategory === cat.id ? 'category-chip--active' : ''}`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            <span className="category-chip__name">{getLocalizedField(cat, 'name', lang)}</span>
          </button>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <div className="product-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="product-card">
              <div className="skeleton" style={{ width: '100%', aspectRatio: '4/3' }} />
              <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="skeleton" style={{ width: '40%', height: '12px' }} />
                <div className="skeleton" style={{ width: '70%', height: '16px' }} />
                <div className="skeleton" style={{ width: '50%', height: '12px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-state__title">{t('common.no_results')}</h3>
        </div>
      ) : (
        <div className="product-grid stagger-children">
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            const inCart = isInCart(product.id);
            const name = getLocalizedField(product, 'name', lang);
            return (
              <div key={product.id} className="product-card">
                <Link to={`/products/${product.id}`} className="product-card__image-wrapper">
                  {product.image_url ? (
                    <img src={product.image_url} alt={name} className="product-card__image" loading="lazy" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)' }}>🍘</div>
                  )}
                  {stockStatus === 'low_stock' && <span className="product-card__stock-badge badge badge--warning badge--dot">{t('product.low_stock')}</span>}
                  {stockStatus === 'out_of_stock' && <span className="product-card__stock-badge badge badge--error badge--dot">{t('product.out_of_stock')}</span>}
                </Link>
                <div className="product-card__body">
                  {product.categories && <span className="product-card__category">{getLocalizedField(product.categories, 'name', lang)}</span>}
                  <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}><h3 className="product-card__name">{name}</h3></Link>
                  {product.weight && <span className="product-card__desc">{product.weight}</span>}
                </div>
                <div className="product-card__footer">
                  <span className="product-card__price">{formatPrice(product.price)}</span>
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
          })}
        </div>
      )}
    </div>
  );
}
