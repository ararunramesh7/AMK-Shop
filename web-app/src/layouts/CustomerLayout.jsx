import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import {
  Home, ShoppingCart, ClipboardList, User, Bell, Search, X,
  Sun, Moon, Globe, ChevronDown, LogOut, Settings, Menu, ShoppingBag
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import useCartStore from '../store/cartStore';
import useThemeStore from '../store/themeStore';
import { LANGUAGES } from '../config/constants';

export default function CustomerLayout() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, profile, isAdmin, logout } = useAuth();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setShowLangMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
    }
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('amk-language', langCode);
    setShowLangMenu(false);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header__inner">
          <Link to="/" className="header__brand">
            <div className="header__logo" style={{
              background: 'linear-gradient(135deg, #FFA000, #FF5722)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: '18px', borderRadius: '10px'
            }}>
              A
            </div>
            <span className="header__title">{t('app_name')}</span>
          </Link>

          {/* Search */}
          <div className="header__search">
            <form onSubmit={handleSearch} className="search-bar">
              <Search size={16} className="search-bar__icon" />
              <input
                type="text"
                className="search-bar__input"
                placeholder={t('nav.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="search-bar__clear" onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </form>
          </div>

          {/* Actions */}
          <div className="header__actions">
            {/* Mobile search toggle */}
            <button
              className="header__action-btn"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              style={{ display: 'none' }}
            >
              <Search size={20} />
            </button>

            {/* Theme toggle */}
            <button className="header__action-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Language */}
            <div className="dropdown" ref={langMenuRef}>
              <button
                className="header__action-btn"
                onClick={() => setShowLangMenu(!showLangMenu)}
                title={t('nav.language')}
              >
                <Globe size={20} />
              </button>
              {showLangMenu && (
                <div className="dropdown__menu">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      className={`dropdown__item ${i18n.language === lang.code ? 'dropdown__item--active' : ''}`}
                      onClick={() => handleLanguageChange(lang.code)}
                      style={i18n.language === lang.code ? { background: 'var(--color-primary-50)', color: 'var(--color-primary-800)' } : {}}
                    >
                      <span>{lang.nativeName}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className={`header__action-btn ${isActive('/notifications') ? 'header__action-btn--active' : ''}`}
              >
                <Bell size={20} />
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className={`header__action-btn ${isActive('/cart') ? 'header__action-btn--active' : ''}`}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && <span className="header__badge">{totalItems}</span>}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="dropdown" ref={userMenuRef}>
                <button className="header__user-menu" onClick={() => setShowUserMenu(!showUserMenu)}>
                  <div className="header__avatar">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="header__username">{profile?.full_name || 'User'}</span>
                  <ChevronDown size={14} />
                </button>
                {showUserMenu && (
                  <div className="dropdown__menu">
                    <Link to="/profile" className="dropdown__item" onClick={() => setShowUserMenu(false)}>
                      <User size={16} /> <span>{t('nav.profile')}</span>
                    </Link>
                    <Link to="/orders" className="dropdown__item" onClick={() => setShowUserMenu(false)}>
                      <ClipboardList size={16} /> <span>{t('nav.orders')}</span>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="dropdown__item" onClick={() => setShowUserMenu(false)}>
                        <Settings size={16} /> <span>{t('nav.admin')}</span>
                      </Link>
                    )}
                    <div className="dropdown__divider" />
                    <button className="dropdown__item dropdown__item--danger" onClick={handleLogout}>
                      <LogOut size={16} /> <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn--primary btn--sm">
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-content page-enter">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="footer__name">{t('app_name')}</div>
            <p className="footer__desc">{t('home.hero_subtitle')}</p>
          </div>
        </div>
        <div className="footer__bottom">
          © {new Date().getFullYear()} {t('app_name')}. All rights reserved.
        </div>
      </footer>

      {/* Bottom Navigation (Mobile) */}
      <nav className="bottom-nav">
        <div className="bottom-nav__inner">
          <Link to="/" className={`bottom-nav__item ${isActive('/') ? 'bottom-nav__item--active' : ''}`}>
            <Home size={20} />
            <span>{t('nav.home')}</span>
          </Link>
          <Link to="/products" className={`bottom-nav__item ${isActive('/products') ? 'bottom-nav__item--active' : ''}`}>
            <ShoppingBag size={20} />
            <span>{t('nav.categories')}</span>
          </Link>
          <Link to="/cart" className={`bottom-nav__item ${isActive('/cart') ? 'bottom-nav__item--active' : ''}`} style={{ position: 'relative' }}>
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className="header__badge">{totalItems}</span>}
            <span>{t('nav.cart')}</span>
          </Link>
          <Link to="/orders" className={`bottom-nav__item ${isActive('/orders') ? 'bottom-nav__item--active' : ''}`}>
            <ClipboardList size={20} />
            <span>{t('nav.orders')}</span>
          </Link>
          <Link to="/profile" className={`bottom-nav__item ${isActive('/profile') ? 'bottom-nav__item--active' : ''}`}>
            <User size={20} />
            <span>{t('nav.profile')}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
